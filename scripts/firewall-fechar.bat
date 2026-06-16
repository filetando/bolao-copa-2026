@echo off
:: Verifica se está rodando como administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Solicitando permissao de administrador...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ============================================
echo  Bloqueando portas do Bolao Copa 2026...
echo ============================================

netsh advfirewall firewall add rule name="Bolao Frontend BLOCK (5173)" dir=in action=block protocol=TCP localport=5173
if %errorLevel% equ 0 (echo [OK] Porta 5173 bloqueada ^(Frontend Vite^)) else (echo [ERRO] Porta 5173)

netsh advfirewall firewall add rule name="Bolao Backend BLOCK (3000)" dir=in action=block protocol=TCP localport=3000
if %errorLevel% equ 0 (echo [OK] Porta 3000 bloqueada ^(Backend Fastify^)) else (echo [ERRO] Porta 3000)

echo.
echo Acesso externo desativado.
echo ============================================
pause
