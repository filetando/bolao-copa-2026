@echo off
echo ============================================
echo  Iniciando Bolao Copa 2026...
echo ============================================

:: Backend (Fastify) — abre em janela separada
start "Bolao Backend" cmd /k "cd /d %~dp0.. && npm run dev"

:: Aguarda 2s para o backend subir antes do frontend
timeout /t 2 /nobreak >nul

:: Frontend (Vite) — abre em janela separada
start "Bolao Frontend" cmd /k "cd /d %~dp0..\frontend && npm run dev"

echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Para parar, feche as janelas "Bolao Backend" e "Bolao Frontend"
echo ou execute scripts\fechar-servidores.bat
echo ============================================
