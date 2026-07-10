@echo off
echo ============================================
echo   E-Inventory - Import Database
echo ============================================
echo.

REM %~dp0 = lokasi folder tempat import_db.bat ini berada
set ROOT=%~dp0

REM Cek file SQL ada
if not exist "%ROOT%database_backup.sql" (
    echo [ERROR] File database_backup.sql tidak ditemukan!
    echo Pastikan file database_backup.sql ada di folder yang sama dengan import_db.bat
    pause
    exit /b 1
)

REM Cek mysqldump Laragon (coba cari otomatis)
set MYSQL_EXE=
for /d %%d in ("C:\laragon\bin\mysql\mysql-*") do (
    if exist "%%d\bin\mysql.exe" set MYSQL_EXE=%%d\bin\mysql.exe
)

if "%MYSQL_EXE%"=="" (
    echo [ERROR] MySQL Laragon tidak ditemukan di C:\laragon\bin\mysql\
    echo Pastikan Laragon sudah diinstall dan sudah Start All.
    pause
    exit /b 1
)

echo [INFO] MySQL ditemukan: %MYSQL_EXE%
echo.

REM Buat database jika belum ada, lalu import SQL
echo [1/2] Membuat database e_inventory (jika belum ada)...
"%MYSQL_EXE%" -u root -e "CREATE DATABASE IF NOT EXISTS e_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if errorlevel 1 (
    echo [ERROR] Gagal terhubung ke MySQL. Pastikan Laragon sudah berjalan!
    pause
    exit /b 1
)

echo [2/2] Mengimport data dari database_backup.sql...
"%MYSQL_EXE%" -u root e_inventory < "%ROOT%database_backup.sql"

if errorlevel 1 (
    echo [ERROR] Import gagal. Cek pesan error di atas.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Import SELESAI!
echo   Database e_inventory sudah berisi data.
echo   Jalankan run.bat untuk membuka aplikasi.
echo ============================================
echo.
pause
