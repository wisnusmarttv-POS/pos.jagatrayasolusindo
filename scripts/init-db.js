import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Coba load .env dari root project (naik satu level dari scripts/)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Jika di server production mungkin menggunakan env.prod atau environment variables langsung
// Fallback ke default jika tidak ada di env
const config = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'jagatpos',
    password: process.env.DB_PASSWORD || 'GenericPassword',
    port: process.env.DB_PORT || 5432,
};

const pool = new pg.Pool(config);

async function run() {
    console.log(`Checking database connection to ${config.host}:${config.port}/${config.database}...`);

    try {
        // Test connection
        const client = await pool.connect();
        console.log('Connected successfully.');
        client.release();

        // Read Schema
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        console.log(`Reading schema from ${schemaPath}...`);
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at ${schemaPath}`);
        }
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Read Seed
        const seedPath = path.join(__dirname, '../database/seed.sql');
        console.log(`Reading seed data from ${seedPath}...`);
        if (!fs.existsSync(seedPath)) {
            throw new Error(`Seed file not found at ${seedPath}`);
        }
        const seedSql = fs.readFileSync(seedPath, 'utf8');

        // Execute Schema
        console.log('Executing schema...');
        await pool.query(schemaSql);
        console.log('Schema executed successfully.');

        // Execute Seed
        console.log('Executing seed data...');
        await pool.query(seedSql);
        console.log('Seed data executed successfully.');

        console.log('Database initialization complete!');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await pool.end();
    }
}

run();
