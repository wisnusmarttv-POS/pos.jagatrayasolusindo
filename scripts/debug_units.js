
import pg from 'pg';

const pool = new pg.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'jagatpos',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'sa'
});

async function debugUnits() {
    const client = await pool.connect();
    try {
        console.log('Checking if "units" table exists...');
        const tableCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'units';
        `);

        if (tableCheck.rows.length === 0) {
            console.error('ERROR: Table "units" does NOT exist!');
        } else {
            console.log('Table "units" exists.');

            console.log('Checking columns in "units" table...');
            const columnCheck = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'units';
            `);
            console.log('Columns:', columnCheck.rows);

            console.log('Attempting to insert test unit...');
            try {
                const insertRes = await client.query(
                    'INSERT INTO units (name, symbol, description) VALUES ($1, $2, $3) RETURNING *',
                    ['Test Unit', 'TEST', 'Created by debug script']
                );
                console.log('Insert SUCCESS:', insertRes.rows[0]);

                // Cleanup
                await client.query('DELETE FROM units WHERE id = $1', [insertRes.rows[0].id]);
                console.log('Test unit cleaned up.');
            } catch (insertErr) {
                console.error('Insert FAILED:', insertErr.message);
            }
        }

    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

debugUnits();
