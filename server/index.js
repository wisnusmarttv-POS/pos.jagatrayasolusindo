import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'jagat-pos-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// PostgreSQL connection
const pool = new pg.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'jagatpos',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'sa'
});

// Database initialization
async function initDatabase() {
    const client = await pool.connect();
    try {
        // Create tables
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        role VARCHAR(20) DEFAULT 'cashier',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS menu_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image_url TEXT,
        menu_type_id INT REFERENCES menu_types(id),
        price DECIMAL(15,2) NOT NULL DEFAULT 0,
        is_available BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tables (
        id SERIAL PRIMARY KEY,
        table_number VARCHAR(20) UNIQUE NOT NULL,
        capacity INT DEFAULT 4,
        status VARCHAR(20) DEFAULT 'available',
        location VARCHAR(50),
        floor INT DEFAULT 1,
        position_x INT DEFAULT 0,
        position_y INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS discounts (
        id SERIAL PRIMARY KEY,
        code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL,
        value DECIMAL(15,2) NOT NULL,
        min_order DECIMAL(15,2) DEFAULT 0,
        max_discount DECIMAL(15,2),
        start_date DATE,
        end_date DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(30) UNIQUE NOT NULL,
        table_id INT REFERENCES tables(id),
        user_id INT REFERENCES users(id),
        customer_name VARCHAR(100),
        order_type VARCHAR(20) DEFAULT 'dine_in',
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        subtotal DECIMAL(15,2) DEFAULT 0,
        discount_id INT REFERENCES discounts(id),
        discount_amount DECIMAL(15,2) DEFAULT 0,
        tax_rate DECIMAL(5,2) DEFAULT 11.00,
        tax_amount DECIMAL(15,2) DEFAULT 0,
        service_charge_rate DECIMAL(5,2) DEFAULT 0,
        service_charge DECIMAL(15,2) DEFAULT 0,
        grand_total DECIMAL(15,2) DEFAULT 0,
        payment_method_id INT REFERENCES payment_methods(id),
        payment_amount DECIMAL(15,2) DEFAULT 0,
        change_amount DECIMAL(15,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'open',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        menu_id INT REFERENCES menus(id),
        menu_name VARCHAR(100) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(15,2) NOT NULL,
        subtotal DECIMAL(15,2) NOT NULL,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(50) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Check if admin user exists
        const userCheck = await client.query("SELECT id FROM users WHERE username = 'admin'");
        if (userCheck.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await client.query(
                "INSERT INTO users (username, password, full_name, role) VALUES ('admin', $1, 'Administrator', 'admin')",
                [hashedPassword]
            );

            const cashierPassword = await bcrypt.hash('kasir123', 10);
            await client.query(
                "INSERT INTO users (username, password, full_name, role) VALUES ('kasir1', $1, 'Kasir 1', 'cashier')",
                [cashierPassword]
            );
        }

        // Seed menu types
        const menuTypeCheck = await client.query("SELECT id FROM menu_types LIMIT 1");
        if (menuTypeCheck.rows.length === 0) {
            await client.query(`
        INSERT INTO menu_types (name, description, icon, color, sort_order) VALUES 
        ('Makanan Utama', 'Menu makanan utama', '🍽️', '#FF6B6B', 1),
        ('Minuman', 'Aneka minuman segar', '🥤', '#4ECDC4', 2),
        ('Appetizer', 'Menu pembuka', '🥗', '#45B7D1', 3),
        ('Dessert', 'Makanan penutup dan kue', '🍰', '#96CEB4', 4),
        ('Snack', 'Makanan ringan', '🍟', '#FFEAA7', 5)
      `);
        }

        // Seed menus
        const menuCheck = await client.query("SELECT id FROM menus LIMIT 1");
        if (menuCheck.rows.length === 0) {
            await client.query(`
        INSERT INTO menus (code, name, description, menu_type_id, price) VALUES 
        ('MKN001', 'Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam, dan sayuran', 1, 35000),
        ('MKN002', 'Mie Goreng Seafood', 'Mie goreng dengan udang dan cumi', 1, 40000),
        ('MKN003', 'Ayam Bakar Madu', 'Ayam bakar dengan saus madu spesial', 1, 45000),
        ('MKN004', 'Ikan Bakar Bumbu Bali', 'Ikan bakar dengan bumbu khas Bali', 1, 55000),
        ('MKN005', 'Sate Ayam', 'Sate ayam 10 tusuk dengan lontong', 1, 30000),
        ('MNM001', 'Es Teh Manis', 'Teh manis dingin', 2, 8000),
        ('MNM002', 'Es Jeruk', 'Jeruk peras segar', 2, 12000),
        ('MNM003', 'Jus Alpukat', 'Jus alpukat segar', 2, 18000),
        ('MNM004', 'Kopi Susu', 'Kopi dengan susu segar', 2, 15000),
        ('MNM005', 'Teh Tarik', 'Teh tarik khas Malaysia', 2, 15000),
        ('APT001', 'Lumpia Goreng', 'Lumpia sayur goreng renyah', 3, 15000),
        ('APT002', 'Tahu Crispy', 'Tahu goreng crispy dengan sambal', 3, 12000),
        ('DST001', 'Es Krim Vanilla', 'Es krim vanilla dengan topping', 4, 20000),
        ('DST002', 'Pisang Goreng', 'Pisang goreng dengan keju dan coklat', 4, 18000),
        ('SNK001', 'Kentang Goreng', 'French fries dengan saus', 5, 20000),
        ('SNK002', 'Onion Ring', 'Bawang goreng crispy', 5, 18000)
      `);
        }

        // Seed tables
        const tableCheck = await client.query("SELECT id FROM tables LIMIT 1");

        // MIGRATION: Check if floor column exists
        try {
            await client.query("SELECT floor FROM tables LIMIT 1");
        } catch (err) {
            console.log('Adding missing floor column to tables...');
            await client.query("ALTER TABLE tables ADD COLUMN IF NOT EXISTS floor INT DEFAULT 1");
            await client.query("ALTER TABLE tables ADD COLUMN IF NOT EXISTS position_x INT DEFAULT 0");
            await client.query("ALTER TABLE tables ADD COLUMN IF NOT EXISTS position_y INT DEFAULT 0");
        }

        // MIGRATION: Add unit_id column to menus
        try {
            await client.query("SELECT unit_id FROM menus LIMIT 1");
        } catch (err) {
            console.log('Adding unit_id column to menus...');
            await client.query("ALTER TABLE menus ADD COLUMN IF NOT EXISTS unit_id INT REFERENCES units(id)");
        }

        if (tableCheck.rows.length === 0) {
            await client.query(`
        INSERT INTO tables (table_number, capacity, location, floor, position_x, position_y) VALUES 
        ('T01', 4, 'Indoor', 1, 100, 100),
        ('T02', 4, 'Indoor', 1, 250, 100),
        ('T03', 4, 'Indoor', 1, 400, 100),
        ('T04', 6, 'Indoor', 1, 100, 250),
        ('T05', 6, 'Indoor', 1, 250, 250),
        ('T06', 2, 'Outdoor', 1, 400, 250),
        ('T07', 2, 'Outdoor', 1, 100, 400),
        ('T08', 8, 'VIP', 1, 250, 400),
        ('T09', 4, 'Indoor', 1, 400, 400),
        ('T10', 4, 'Indoor', 2, 550, 250)
      `);
        }

        // Seed payment methods
        const paymentCheck = await client.query("SELECT id FROM payment_methods LIMIT 1");
        if (paymentCheck.rows.length === 0) {
            await client.query(`
        INSERT INTO payment_methods (name, sort_order) VALUES 
        ('Cash', 1),
        ('Debit Card', 2),
        ('Credit Card', 3),
        ('QRIS', 4),
        ('GoPay', 5),
        ('OVO', 6),
        ('Dana', 7)
      `);
        }

        // Seed settings
        const settingsCheck = await client.query("SELECT id FROM settings LIMIT 1");
        if (settingsCheck.rows.length === 0) {
            await client.query(`
        INSERT INTO settings (key, value, description) VALUES 
        ('restaurant_name', 'JAGAT RESTO', 'Nama restoran'),
        ('tax_rate', '11', 'Persentase PB1 (Pajak Restoran)'),
        ('service_charge_rate', '5', 'Persentase service charge'),
        ('enable_service_charge', 'false', 'Aktifkan service charge'),
        ('currency', 'Rp', 'Simbol mata uang'),
        ('receipt_footer', 'Terima kasih atas kunjungan Anda!', 'Footer struk'),
        ('auto_print_receipt', 'true', 'Auto print struk setelah pembayaran')
      `);
        }

        // Seed discounts
        const discountCheck = await client.query("SELECT id FROM discounts LIMIT 1");
        if (discountCheck.rows.length === 0) {
            await client.query(`
        INSERT INTO discounts (code, name, type, value, min_order, is_active) VALUES 
        ('WELCOME10', 'Welcome Discount 10%', 'percentage', 10, 50000, true),
        ('HEMAT20K', 'Diskon Rp 20.000', 'fixed', 20000, 100000, true),
        ('MEMBER15', 'Member Discount 15%', 'percentage', 15, 0, true)
      `);
        }

        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Database initialization error:', err);
    } finally {
        client.release();
    }
}

// Auth middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// ============ AUTH ROUTES ============
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 AND is_active = true',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, full_name, role FROM users WHERE id = $1',
            [req.user.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ MENU TYPES ROUTES ============
app.get('/api/menu-types', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM menu_types WHERE is_active = true ORDER BY sort_order'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/menu-types/all', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM menu_types ORDER BY sort_order');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/menu-types', async (req, res) => {
    try {
        const { name, description, icon, color, sort_order } = req.body;
        const result = await pool.query(
            'INSERT INTO menu_types (name, description, icon, color, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, icon, color, sort_order || 0]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/menu-types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon, color, sort_order, is_active } = req.body;
        const result = await pool.query(
            'UPDATE menu_types SET name = $1, description = $2, icon = $3, color = $4, sort_order = $5, is_active = $6 WHERE id = $7 RETURNING *',
            [name, description, icon, color, sort_order, is_active, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/menu-types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE menu_types SET is_active = false WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ MENUS ROUTES ============
app.get('/api/menus', async (req, res) => {
    try {
        const { type_id, available } = req.query;
        let query = `
      SELECT m.*, mt.name as type_name, mt.color as type_color, u.name as unit_name, u.symbol as unit_symbol 
      FROM menus m 
      LEFT JOIN menu_types mt ON m.menu_type_id = mt.id 
      LEFT JOIN units u ON m.unit_id = u.id 
      WHERE m.is_active = true
    `;
        const params = [];

        if (type_id) {
            params.push(type_id);
            query += ` AND m.menu_type_id = $${params.length}`;
        }
        if (available === 'true') {
            query += ' AND m.is_available = true';
        }
        query += ' ORDER BY m.menu_type_id, m.name';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/menus/all', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT m.*, mt.name as type_name, mt.color as type_color, u.name as unit_name, u.symbol as unit_symbol 
      FROM menus m 
      LEFT JOIN menu_types mt ON m.menu_type_id = mt.id 
      LEFT JOIN units u ON m.unit_id = u.id 
      ORDER BY m.menu_type_id, m.name
    `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/menus', upload.single('image'), async (req, res) => {
    try {
        const { code, name, description, menu_type_id, price, unit_id } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        const result = await pool.query(
            'INSERT INTO menus (code, name, description, image_url, menu_type_id, price, unit_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [code, name, description, image_url, menu_type_id, price, unit_id || null]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/menus/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, description, menu_type_id, price, is_available, is_active, unit_id } = req.body;

        let image_url = req.body.image_url;
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        const result = await pool.query(
            `UPDATE menus SET code = $1, name = $2, description = $3, image_url = $4, 
       menu_type_id = $5, price = $6, is_available = $7, is_active = $8, unit_id = $9, updated_at = NOW() 
       WHERE id = $10 RETURNING *`,
            [code, name, description, image_url, menu_type_id, price,
                is_available !== undefined ? is_available : true,
                is_active !== undefined ? is_active : true, unit_id || null, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/menus/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE menus SET is_active = false WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ TABLES ROUTES ============
app.get('/api/tables', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM tables WHERE is_active = true ORDER BY table_number'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/tables/all', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tables ORDER BY table_number');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tables', async (req, res) => {
    try {
        const { table_number, capacity, location, position_x, position_y } = req.body;
        const result = await pool.query(
            'INSERT INTO tables (table_number, capacity, location, floor, position_x, position_y) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [table_number, capacity || 4, location, req.body.floor || 1, position_x || 0, position_y || 0]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tables/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { table_number, capacity, status, location, position_x, position_y, is_active } = req.body;
        const result = await pool.query(
            `UPDATE tables SET table_number = $1, capacity = $2, status = $3, location = $4, floor = $5,
       position_x = $6, position_y = $7, is_active = $8 WHERE id = $9 RETURNING *`,
            [table_number, capacity, status, location, req.body.floor || 1, position_x, position_y, is_active, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/tables/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE tables SET is_active = false WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tables/bulk-update-positions', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { tables } = req.body;
        for (const table of tables) {
            await client.query(
                'UPDATE tables SET position_x = $1, position_y = $2 WHERE id = $3',
                [table.position_x, table.position_y, table.id]
            );
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});


// ============ DISCOUNTS ROUTES ============
app.get('/api/discounts', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM discounts WHERE is_active = true ORDER BY name'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/discounts/all', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM discounts ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/discounts', async (req, res) => {
    try {
        const { code, name, type, value, min_order, max_discount, start_date, end_date } = req.body;
        const result = await pool.query(
            `INSERT INTO discounts (code, name, type, value, min_order, max_discount, start_date, end_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [code, name, type, value, min_order || 0, max_discount, start_date, end_date]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/discounts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, type, value, min_order, max_discount, start_date, end_date, is_active } = req.body;
        const result = await pool.query(
            `UPDATE discounts SET code = $1, name = $2, type = $3, value = $4, min_order = $5, 
       max_discount = $6, start_date = $7, end_date = $8, is_active = $9 WHERE id = $10 RETURNING *`,
            [code, name, type, value, min_order, max_discount, start_date, end_date, is_active, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/discounts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE discounts SET is_active = false WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ PAYMENT METHODS ROUTES ============
app.get('/api/payment-methods', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM payment_methods WHERE is_active = true ORDER BY sort_order'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ SETTINGS ROUTES ============
app.get('/api/settings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/settings', async (req, res) => {
    try {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            await pool.query(
                `INSERT INTO settings (key, value) VALUES ($1, $2) 
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
                [key, value]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/settings/logo', upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No logo file uploaded' });
        }

        const logoUrl = `/uploads/${req.file.filename}`;

        // Update settings table
        await pool.query(
            `INSERT INTO settings (key, value) VALUES ('restaurant_logo', $1) 
             ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
            [logoUrl]
        );

        res.json({ success: true, logo_url: logoUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ ORDERS ROUTES ============
async function generateOrderNumber() {
    const date = new Date();
    const prefix = `ORD${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const result = await pool.query(
        "SELECT COUNT(*) as count FROM orders WHERE order_number LIKE $1",
        [`${prefix}%`]
    );
    const count = parseInt(result.rows[0].count) + 1;
    return `${prefix}${String(count).padStart(4, '0')}`;
}

app.get('/api/orders', async (req, res) => {
    try {
        const { status, date, limit } = req.query;
        let query = `
      SELECT o.*, t.table_number, u.full_name as cashier_name, pm.name as payment_method_name
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
      WHERE 1=1
    `;
        const params = [];

        if (status) {
            params.push(status);
            query += ` AND o.status = $${params.length}`;
        }
        if (date) {
            params.push(date);
            query += ` AND DATE(o.order_date) = $${params.length}`;
        }
        query += ' ORDER BY o.created_at DESC';
        if (limit) {
            params.push(limit);
            query += ` LIMIT $${params.length}`;
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const orderResult = await pool.query(`
      SELECT o.*, t.table_number, u.full_name as cashier_name, pm.name as payment_method_name
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
      WHERE o.id = $1
    `, [id]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const itemsResult = await pool.query(
            'SELECT * FROM order_items WHERE order_id = $1',
            [id]
        );

        res.json({
            ...orderResult.rows[0],
            items: itemsResult.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { table_id, customer_name, order_type, items, notes, user_id } = req.body;
        const order_number = await generateOrderNumber();

        // Get settings for tax
        const settingsResult = await client.query("SELECT * FROM settings WHERE key IN ('tax_rate', 'service_charge_rate', 'enable_service_charge')");
        const settings = {};
        settingsResult.rows.forEach(row => {
            settings[row.key] = row.value;
        });

        const tax_rate = parseFloat(settings.tax_rate) || 11;
        const service_charge_rate = settings.enable_service_charge === 'true' ? (parseFloat(settings.service_charge_rate) || 0) : 0;

        // Calculate subtotal
        let subtotal = 0;
        for (const item of items) {
            subtotal += item.quantity * item.unit_price;
        }

        const service_charge = subtotal * (service_charge_rate / 100);
        const tax_amount = (subtotal + service_charge) * (tax_rate / 100);
        const grand_total = subtotal + service_charge + tax_amount;

        // Create order
        const orderResult = await client.query(
            `INSERT INTO orders (order_number, table_id, user_id, customer_name, order_type, 
               subtotal, tax_rate, tax_amount, service_charge_rate, service_charge, grand_total, notes)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [order_number, table_id, user_id, customer_name, order_type || 'dine_in',
                subtotal, tax_rate, tax_amount, service_charge_rate, service_charge, grand_total, notes]
        );

        const order = orderResult.rows[0];

        // Create order items
        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, menu_id, menu_name, quantity, unit_price, subtotal, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [order.id, item.menu_id, item.menu_name, item.quantity, item.unit_price,
                item.quantity * item.unit_price, item.notes]
            );
        }

        // Update table status if dine_in
        if (table_id && order_type === 'dine_in') {
            await client.query("UPDATE tables SET status = 'occupied' WHERE id = $1", [table_id]);
        }

        await client.query('COMMIT');

        res.json(order);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Endpoint VOID Order
app.put('/api/orders/:id/void', authenticateToken, async (req, res) => {
    // Hanya Admin yang boleh void
    if (req.user.role !== 'admin') return res.sendStatus(403);

    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE orders SET status = 'void', updated_at = NOW() WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint DELETE Order
app.delete('/api/orders/:id', authenticateToken, async (req, res) => {
    // Hanya Admin yang boleh delete
    if (req.user.role !== 'admin') return res.sendStatus(403);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        // Delete items first (cascade usually handles this but to be safe)
        await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);

        // Delete order
        const result = await client.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Order not found' });
        }

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

app.put('/api/orders/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const { items, notes, discount_id } = req.body;

        // Get current order
        const currentOrder = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (currentOrder.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Delete existing items
        await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);

        // Calculate new subtotal
        let subtotal = 0;
        for (const item of items) {
            subtotal += item.quantity * item.unit_price;
            await client.query(
                `INSERT INTO order_items (order_id, menu_id, menu_name, quantity, unit_price, subtotal, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [id, item.menu_id, item.menu_name, item.quantity, item.unit_price,
                    item.quantity * item.unit_price, item.notes]
            );
        }

        // Get discount
        let discount_amount = 0;
        if (discount_id) {
            const discountResult = await client.query('SELECT * FROM discounts WHERE id = $1', [discount_id]);
            if (discountResult.rows.length > 0) {
                const discount = discountResult.rows[0];
                if (subtotal >= parseFloat(discount.min_order)) {
                    if (discount.type === 'percentage') {
                        discount_amount = subtotal * (parseFloat(discount.value) / 100);
                        if (discount.max_discount && discount_amount > parseFloat(discount.max_discount)) {
                            discount_amount = parseFloat(discount.max_discount);
                        }
                    } else {
                        discount_amount = parseFloat(discount.value);
                    }
                }
            }
        }

        const order = currentOrder.rows[0];
        const service_charge = (subtotal - discount_amount) * (parseFloat(order.service_charge_rate) / 100);
        const tax_amount = (subtotal - discount_amount + service_charge) * (parseFloat(order.tax_rate) / 100);
        const grand_total = subtotal - discount_amount + service_charge + tax_amount;

        const result = await client.query(
            `UPDATE orders SET subtotal = $1, discount_id = $2, discount_amount = $3, 
       service_charge = $4, tax_amount = $5, grand_total = $6, notes = $7, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
            [subtotal, discount_id, discount_amount, service_charge, tax_amount, grand_total, notes, id]
        );

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Pay order
app.post('/api/orders/:id/pay', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const { payment_method_id, payment_amount, discount_id } = req.body;

        // Get order
        const orderResult = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        let order = orderResult.rows[0];
        let subtotal = parseFloat(order.subtotal);
        let discount_amount = 0;

        // Apply discount if provided
        if (discount_id) {
            const discountResult = await client.query('SELECT * FROM discounts WHERE id = $1', [discount_id]);
            if (discountResult.rows.length > 0) {
                const discount = discountResult.rows[0];
                if (subtotal >= parseFloat(discount.min_order)) {
                    if (discount.type === 'percentage') {
                        discount_amount = subtotal * (parseFloat(discount.value) / 100);
                        if (discount.max_discount && discount_amount > parseFloat(discount.max_discount)) {
                            discount_amount = parseFloat(discount.max_discount);
                        }
                    } else {
                        discount_amount = parseFloat(discount.value);
                    }
                }
            }
        }

        // Recalculate totals
        const service_charge = (subtotal - discount_amount) * (parseFloat(order.service_charge_rate) / 100);
        const tax_amount = (subtotal - discount_amount + service_charge) * (parseFloat(order.tax_rate) / 100);
        const grand_total = subtotal - discount_amount + service_charge + tax_amount;
        const change_amount = payment_amount - grand_total;

        if (change_amount < 0) {
            return res.status(400).json({ error: 'Insufficient payment amount' });
        }

        // Update order
        const result = await client.query(
            `UPDATE orders SET discount_id = $1, discount_amount = $2, service_charge = $3, 
       tax_amount = $4, grand_total = $5, payment_method_id = $6, payment_amount = $7, 
       change_amount = $8, status = 'paid', updated_at = NOW() WHERE id = $9 RETURNING *`,
            [discount_id, discount_amount, service_charge, tax_amount, grand_total,
                payment_method_id, payment_amount, change_amount, id]
        );

        // Update table status
        if (order.table_id) {
            await client.query("UPDATE tables SET status = 'available' WHERE id = $1", [order.table_id]);
        }

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Cancel order
app.post('/api/orders/:id/cancel', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const orderResult = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderResult.rows[0];

        const result = await client.query(
            "UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *",
            [id]
        );

        // Update table status
        if (order.table_id) {
            await client.query("UPDATE tables SET status = 'available' WHERE id = $1", [order.table_id]);
        }

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// ============ REPORTS ROUTES ============
app.get('/api/reports/sales', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const params = [];
        let dateFilter = '';

        if (start_date && end_date) {
            params.push(start_date, end_date);
            dateFilter = ' AND DATE(order_date) BETWEEN $1 AND $2';
        }

        const result = await pool.query(`
      SELECT 
        DATE(order_date) as date,
        COUNT(*) as total_orders,
        SUM(subtotal) as total_subtotal,
        SUM(discount_amount) as total_discount,
        SUM(tax_amount) as total_tax,
        SUM(grand_total) as total_sales
      FROM orders
      WHERE status = 'paid'${dateFilter}
      GROUP BY DATE(order_date)
      ORDER BY date DESC
    `, params);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/menu-sales', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const params = [];
        let dateFilter = '';

        if (start_date && end_date) {
            params.push(start_date, end_date);
            dateFilter = ' AND DATE(o.order_date) BETWEEN $1 AND $2';
        }

        const result = await pool.query(`
      SELECT 
        oi.menu_name,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.subtotal) as total_sales
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'paid'${dateFilter}
      GROUP BY oi.menu_name
      ORDER BY total_quantity DESC
    `, params);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/payment-methods', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const params = [];
        let dateFilter = '';

        if (start_date && end_date) {
            params.push(start_date, end_date);
            dateFilter = ' AND DATE(o.order_date) BETWEEN $1 AND $2';
        }

        const result = await pool.query(`
      SELECT 
        pm.name as payment_method,
        COUNT(*) as total_orders,
        SUM(o.grand_total) as total_amount
      FROM orders o
      JOIN payment_methods pm ON o.payment_method_id = pm.id
      WHERE o.status = 'paid'${dateFilter}
      GROUP BY pm.name
      ORDER BY total_amount DESC
    `, params);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ USERS ROUTES ============
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, full_name, role, is_active, created_at FROM users ORDER BY id'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { username, password, full_name, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, full_name, role',
            [username, hashedPassword, full_name, role || 'cashier']
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, full_name, role, is_active } = req.body;

        let query, params;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query = 'UPDATE users SET username = $1, password = $2, full_name = $3, role = $4, is_active = $5 WHERE id = $6 RETURNING id, username, full_name, role, is_active';
            params = [username, hashedPassword, full_name, role, is_active, id];
        } else {
            query = 'UPDATE users SET username = $1, full_name = $2, role = $3, is_active = $4 WHERE id = $5 RETURNING id, username, full_name, role, is_active';
            params = [username, full_name, role, is_active, id];
        }

        const result = await pool.query(query, params);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const todaySales = await pool.query(
            "SELECT COALESCE(SUM(grand_total), 0) as total, COUNT(*) as count FROM orders WHERE status = 'paid' AND DATE(order_date) = $1",
            [today]
        );

        const openOrders = await pool.query(
            "SELECT COUNT(*) as count FROM orders WHERE status = 'open'"
        );

        const availableTables = await pool.query(
            "SELECT COUNT(*) as count FROM tables WHERE status = 'available' AND is_active = true"
        );

        const occupiedTables = await pool.query(
            "SELECT COUNT(*) as count FROM tables WHERE status = 'occupied' AND is_active = true"
        );

        res.json({
            today_sales: parseFloat(todaySales.rows[0].total),
            today_orders: parseInt(todaySales.rows[0].count),
            open_orders: parseInt(openOrders.rows[0].count),
            available_tables: parseInt(availableTables.rows[0].count),
            occupied_tables: parseInt(occupiedTables.rows[0].count)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Units API
app.get('/api/units', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM units ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/units', async (req, res) => {
    try {
        const { name, symbol, description } = req.body;
        const result = await pool.query(
            'INSERT INTO units (name, symbol, description) VALUES ($1, $2, $3) RETURNING *',
            [name, symbol, description]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/units/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, symbol, description } = req.body;
        const result = await pool.query(
            'UPDATE units SET name = $1, symbol = $2, description = $3 WHERE id = $4 RETURNING *',
            [name, symbol, description, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/units/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM units WHERE id = $1', [id]);
        res.json({ message: 'Unit deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Unit Conversions API
app.get('/api/unit-conversions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT uc.*, u1.name as from_unit_name, u1.symbol as from_unit_symbol, 
                   u2.name as to_unit_name, u2.symbol as to_unit_symbol
            FROM unit_conversions uc
            JOIN units u1 ON uc.from_unit_id = u1.id
            JOIN units u2 ON uc.to_unit_id = u2.id
            ORDER BY u1.name ASC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/unit-conversions', async (req, res) => {
    try {
        const { from_unit_id, to_unit_id, factor } = req.body;
        const result = await pool.query(
            'INSERT INTO unit_conversions (from_unit_id, to_unit_id, factor) VALUES ($1, $2, $3) RETURNING *',
            [from_unit_id, to_unit_id, factor]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/unit-conversions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { from_unit_id, to_unit_id, factor } = req.body;
        const result = await pool.query(
            'UPDATE unit_conversions SET from_unit_id = $1, to_unit_id = $2, factor = $3 WHERE id = $4 RETURNING *',
            [from_unit_id, to_unit_id, factor, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/unit-conversions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM unit_conversions WHERE id = $1', [id]);
        res.json({ message: 'Conversion deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
