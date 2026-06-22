@echo off
:: Requer execucao como Administrador (wsl --shutdown exige privilégios elevados)
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ============================================
    echo  ERRO: Execute como Administrador
    echo  Clique com o botao direito no .bat
    echo  e escolha "Executar como administrador"
    echo ============================================
    pause
    exit /b 1
)

echo ============================================
echo  Reiniciando Docker Desktop (fix WSL stuck)
echo ============================================
echo.

echo [1/4] Encerrando Docker Desktop...
taskkill /F /IM "Docker Desktop.exe" >nul 2>&1
taskkill /F /IM "com.docker.backend.exe" >nul 2>&1
taskkill /F /IM "com.docker.build.exe" >nul 2>&1
taskkill /F /IM "docker-agent.exe" >nul 2>&1
taskkill /F /IM "docker-sandbox.exe" >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/4] Encerrando WSL...
wsl --shutdown
timeout /t 3 /nobreak >nul

echo [3/4] Iniciando Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo [4/4] Aguardando daemon responder (pode levar 30-60s)...
:wait_loop
timeout /t 5 /nobreak >nul
docker info >nul 2>&1
if %errorlevel% neq 0 (
    set /p dummy="." <nul
    goto wait_loop
)

echo.
echo.
echo ============================================
echo  Docker pronto! Subindo container do banco...
echo ============================================
cd /d %~dp0..
docker compose up -d db

echo.
echo Banco PostgreSQL: porta 5432
echo Pode abrir iniciar.bat agora.
echo ============================================
pause
