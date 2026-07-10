@echo off
REM ============================================================
REM spark.bat — Helper untuk menjalankan CI4 Spark CLI
REM Menggunakan PHP Laragon yang mendukung ext-intl
REM ============================================================
REM Penggunaan:
REM   spark.bat migrate         — Jalankan semua migration
REM   spark.bat db:seed DatabaseSeeder — Jalankan seeder
REM   spark.bat serve           — Jalankan development server
REM ============================================================
C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe spark %*
