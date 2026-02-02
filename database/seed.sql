-- Seed Data for Restaurant POS

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, full_name, role) VALUES 
('admin', '$2b$10$rQZ8K.4X5X5X5X5X5X5X5OeH8H8H8H8H8H8H8H8H8H8H8H8H8H8', 'Administrator', 'admin'),
('kasir1', '$2b$10$rQZ8K.4X5X5X5X5X5X5X5OeH8H8H8H8H8H8H8H8H8H8H8H8H8H8', 'Kasir 1', 'cashier')
ON CONFLICT (username) DO NOTHING;

-- Insert menu types
INSERT INTO menu_types (name, description, icon, color, sort_order) VALUES 
('Makanan Utama', 'Menu makanan utama', '🍽️', '#FF6B6B', 1),
('Minuman', 'Aneka minuman segar', '🥤', '#4ECDC4', 2),
('Appetizer', 'Menu pembuka', '🥗', '#45B7D1', 3),
('Dessert', 'Makanan penutup dan kue', '🍰', '#96CEB4', 4),
('Snack', 'Makanan ringan', '🍟', '#FFEAA7', 5)
ON CONFLICT DO NOTHING;

-- Insert sample menus
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
ON CONFLICT (code) DO NOTHING;

-- Insert tables
INSERT INTO tables (table_number, capacity, location, position_x, position_y) VALUES 
('T01', 4, 'Indoor', 100, 100),
('T02', 4, 'Indoor', 250, 100),
('T03', 4, 'Indoor', 400, 100),
('T04', 6, 'Indoor', 100, 250),
('T05', 6, 'Indoor', 250, 250),
('T06', 2, 'Outdoor', 400, 250),
('T07', 2, 'Outdoor', 100, 400),
('T08', 8, 'VIP', 250, 400),
('T09', 4, 'Indoor', 400, 400),
('T10', 4, 'Indoor', 550, 250)
ON CONFLICT (table_number) DO NOTHING;

-- Insert payment methods
INSERT INTO payment_methods (name, sort_order) VALUES 
('Cash', 1),
('Debit Card', 2),
('Credit Card', 3),
('QRIS', 4),
('GoPay', 5),
('OVO', 6),
('Dana', 7)
ON CONFLICT DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES 
('restaurant_name', 'JAGAT RESTO', 'Nama restoran'),
('tax_rate', '11', 'Persentase PB1 (Pajak Restoran)'),
('service_charge_rate', '5', 'Persentase service charge'),
('enable_service_charge', 'false', 'Aktifkan service charge'),
('currency', 'Rp', 'Simbol mata uang'),
('receipt_footer', 'Terima kasih atas kunjungan Anda!', 'Footer struk'),
('auto_print_receipt', 'true', 'Auto print struk setelah pembayaran')
ON CONFLICT (key) DO NOTHING;

-- Insert sample discounts
INSERT INTO discounts (code, name, type, value, min_order, is_active) VALUES 
('WELCOME10', 'Welcome Discount 10%', 'percentage', 10, 50000, true),
('HEMAT20K', 'Diskon Rp 20.000', 'fixed', 20000, 100000, true),
('MEMBER15', 'Member Discount 15%', 'percentage', 15, 0, true)
ON CONFLICT (code) DO NOTHING;
