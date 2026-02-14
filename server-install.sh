#!/bin/bash

# Konfigurasi
DB_NAME="jagatpos"
DB_USER="wisnu"
BACKUP_FILE="database/jagatpos_full_backup.sql"

echo "=== MULAI PROSES DEPLOY JAGAT POS ==="

# 1. Install Dependencies
echo "[1/4] Menginstall dependencies aplikasi..."
npm install
npm install pg --save # Memastikan driver pg terinstall

# 2. Setup Database
echo "[2/4] Memeriksa database..."

# Cek apakah database ada
if psql -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "Database '$DB_NAME' sudah ada."
else
    echo "Database '$DB_NAME' belum ada. Membuat database..."
    createdb $DB_NAME
    if [ $? -eq 0 ]; then
        echo "Database berhasil dibuat."
    else
        echo "Gagal membuat database dengan user '$DB_USER'. Mencoba dengan 'postgres'..."
        sudo -u postgres createdb $DB_NAME -O $DB_USER
    fi
fi

# 3. Restore Data
echo "[3/4] Mengimport data dari backup..."
if [ -f "$BACKUP_FILE" ]; then
    psql -U $DB_USER -d $DB_NAME -f "$BACKUP_FILE"
    echo "Restore data selesai."
else
    echo "PERINGATAN: File backup '$BACKUP_FILE' tidak ditemukan. Melewati langkah restore."
fi

# 4. Restart Aplikasi
echo "[4/4] Merestart aplikasi dengan PM2..."
pm2 restart all || pm2 start server/index.js --name "jagat-pos"

echo "=== DEPLOY SELESAI! ==="
echo "Aplikasi seharusnya sudah berjalan."
