import pg from 'pg';

const pool = new pg.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'jagatpos',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'sa'
});

async function check() {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT id, table_number, is_active, floor, status FROM tables');
        console.log('Tables:', JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

check();
