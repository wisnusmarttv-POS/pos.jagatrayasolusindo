$ErrorActionPreference = "Stop"

Write-Host "=== MEMBUAT PAKET DEPLOYMENT JAGAT POS ==="

# 1. Backup Database
Write-Host "[1/3] Membackup database..."
$pgDumpPath = "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"
$backupFile = "d:\POS JAGAT\database\jagatpos_full_backup.sql"

if (Test-Path $pgDumpPath) {
    $env:PGPASSWORD = "Admin2026"
    & $pgDumpPath --clean --if-exists --host=localhost --port=5432 --username=wisnu --dbname=jagatpos --file=$backupFile
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Backup dengan user 'wisnu' gagal. Mencoba dengan user 'postgres'..."
        $env:PGPASSWORD = "sa"
        & $pgDumpPath --clean --if-exists --host=localhost --port=5432 --username=postgres --dbname=jagatpos --file=$backupFile
    }
    Write-Host "Database berhasil dibackup ke $backupFile"
}
else {
    Write-Warning "pg_dump tidak ditemukan. Melewati backup database otomatis."
}

# 2. Hapus zip lama jika ada
$zipFile = "d:\POS JAGAT\deploy.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile
}

# 3. Zip Aplikasi (Exclude node_modules, .git, uploads)
Write-Host "[2/3] Mengompres file project ke deploy.zip (Tanpa node_modules)..."
$exclude = @("node_modules", ".git", "uploads", "deploy.zip", "dist")
$files = Get-ChildItem -Path "d:\POS JAGAT" | Where-Object { $exclude -notcontains $_.Name }
Compress-Archive -Path $files.FullName -DestinationPath $zipFile -CompressionLevel Optimal -Force

Write-Host "[3/3] Selesai! File siap diupload:"
Write-Host "Lokasi: $zipFile"
Write-Host ""
Write-Host "LANGKAH SELANJUTNYA:"
Write-Host "1. Upload 'deploy.zip' ke server Anda."
Write-Host "2. Di server, unzip file tersebut."
Write-Host "3. Jalankan perintah: sh server-install.sh"
