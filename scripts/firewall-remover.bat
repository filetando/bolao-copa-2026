@echo off
:: Verifica se está rodando como administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Solicitando permissao de administrador...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ============================================
echo  Removendo regras do Bolao Copa 2026...
echo ============================================

netsh advfirewall firewall delete rule name="Bolao Frontend (5173)"
netsh advfirewall firewall delete rule name="Bolao Backend (3000)"
netsh advfirewall firewall delete rule name="Bolao Frontend BLOCK (5173)"
netsh advfirewall firewall delete rule name="Bolao Backend BLOCK (3000)"

echo.
echo Todas as regras do Bolao removidas.
echo Portas voltam ao comportamento padrao do Windows.
echo ============================================
pause
