@echo off
echo ============================================
echo   E-Inventory Management System
echo ============================================
echo.

REM %~dp0 = lokasi folder tempat run.bat ini berada (otomatis)
set ROOT=%~dp0

echo [1/2] Starting Backend (CodeIgniter 4)...
start "E-Inventory Backend" cmd /k "cd /d "%ROOT%backend" && spark.bat serve"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (Vue 3 SPA)...
start "E-Inventory Frontend" cmd /k "cd /d "%ROOT%frontend" && npx -y serve -l 5500"

timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo   Aplikasi sudah berjalan!
echo   Backend  : http://localhost:8080
echo   Frontend : http://localhost:5500  ^<-- buka ini
echo ============================================
echo.
echo Membuka browser...
start http://localhost:5500
