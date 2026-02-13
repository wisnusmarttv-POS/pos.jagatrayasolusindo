
import pg from 'pg';

const pool = new pg.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'jagatpos',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'sa'
});

async function createTables() {
    const client = await pool.connect();
    try {
        console.log('Creating "units" table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS units (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                symbol VARCHAR(20) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('"units" table created.');

        console.log('Creating "unit_conversions" table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS unit_conversions (
                id SERIAL PRIMARY KEY,
                from_unit_id INT REFERENCES units(id) ON DELETE CASCADE,
                to_unit_id INT REFERENCES units(id) ON DELETE CASCADE,
                factor DECIMAL(15,4) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_conversion UNIQUE (from_unit_id, to_unit_id)
            );
        `);
        console.log('"unit_conversions" table created.');

    } catch (err) {
        console.error('Error creating tables:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

createTables();
