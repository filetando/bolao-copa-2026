@echo off
echo ============================================
echo  Parando servidores do Bolao Copa 2026...
echo ============================================

:: Fecha as janelas pelo título
taskkill /fi "WindowTitle eq Bolao Backend*" /f >nul 2>&1
if %errorLevel% equ 0 (echo [OK] Backend parado) else (echo [--] Backend ja estava parado)

taskkill /fi "WindowTitle eq Bolao Frontend*" /f >nul 2>&1
if %errorLevel% equ 0 (echo [OK] Frontend parado) else (echo [--] Frontend ja estava parado)

:: Libera as portas caso algum processo tenha ficado preso
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    taskkill /pid %%a /f >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    taskkill /pid %%a /f >nul 2>&1
)

echo.
echo Servidores encerrados.
echo ============================================
pause
