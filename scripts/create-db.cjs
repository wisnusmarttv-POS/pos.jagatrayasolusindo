const pg = require('pg');

async function createDatabase() {
    // First connect to default 'postgres' database to create our database
    const client = new pg.Client({
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: 'sa'
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL');

        // Check if database exists
        const result = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = 'jagatpos'"
        );

        if (result.rows.length === 0) {
            await client.query('CREATE DATABASE jagatpos');
            console.log('Database "jagatpos" created successfully!');
        } else {
            console.log('Database "jagatpos" already exists');
        }
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

createDatabase();
