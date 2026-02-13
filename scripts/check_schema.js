
import pg from 'pg';

const pool = new pg.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'jagatpos',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'sa'
});

async function checkSchema() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tables';
        `);
        console.log('Columns in tables table:', res.rows.map(r => r.column_name));
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkSchema();
