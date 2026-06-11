# SETUP_DOCKER_WINDOWS.md — Docker + PostgreSQL no Windows (passo a passo para iniciantes)

> Você não precisa entender Docker a fundo para este projeto. Pense assim: Docker é um programa que roda "caixinhas" (containers) prontas com outros programas dentro — vamos usar uma caixinha já pronta com o PostgreSQL instalado e configurado, sem precisar instalar o Postgres "de verdade" no Windows.

---

## Passo 1 — Verificar/ativar o WSL2

O Docker Desktop no Windows precisa do **WSL2** (um "Linux dentro do Windows"). Provavelmente seu Windows já tem isso ou consegue instalar com um comando.

1. Aperte a tecla **Windows**, digite `PowerShell`, clique com o botão direito em "Windows PowerShell" → **"Executar como administrador"**.
2. Cole o comando:
   ```powershell
   wsl --install
   ```
3. Pressione Enter e espere terminar (pode demorar alguns minutos).
4. **Reinicie o computador** quando pedir.
5. Após reiniciar, pode abrir o "Ubuntu" que aparece no menu Iniciar uma vez para criar um usuário/senha (qualquer um, você não vai precisar usar isso diretamente). Pode até ignorar essa janela depois de criar.

> Se aparecer um erro sobre "virtualização desativada", você precisa habilitar a virtualização na BIOS do computador (passo um pouco mais técnico — me avise se cair nesse caso que te ajudo especificamente).

---

## Passo 2 — Instalar o Docker Desktop

1. Acesse: https://www.docker.com/products/docker-desktop/
2. Baixe a versão para **Windows**.
3. Execute o instalador. Deixe as opções padrão marcadas (a opção "Use WSL 2 instead of Hyper-V" já vem marcada nas versões atuais — isso é o que queremos).
4. Termine a instalação e **reinicie o computador** se ele pedir.
5. Abra o **Docker Desktop** pelo menu Iniciar.
   - Na primeira vez, ele pode pedir para você criar uma conta Docker Hub — você pode criar (gratuito) ou clicar em "skip"/pular, se houver essa opção.
   - Espere até aparecer, no canto inferior esquerdo da janela, algo como **"Engine running"** (motor rodando) com um ícone verde. Isso significa que o Docker está pronto.

---

## Passo 3 — Confirmar que está tudo funcionando

1. Abra o **terminal do VSCode** (menu `Terminal > New Terminal`, ou `Ctrl+'`).
2. Rode:
   ```powershell
   docker --version
   ```
   Deve mostrar algo como `Docker version 27.x.x`.
3. Teste rodando um container de exemplo:
   ```powershell
   docker run hello-world
   ```
   Se aparecer uma mensagem começando com "Hello from Docker!", está tudo certo.

---

## Passo 4 — Criar o arquivo do banco de dados do projeto

1. Na **raiz do projeto** (a pasta `bolao-copa-2026` que você abriu no VSCode), crie um novo arquivo chamado exatamente:
   ```
   docker-compose.yml
   ```
   (Botão direito na área de arquivos do VSCode → "New File" → digite o nome, incluindo o `.yml`)

2. Cole este conteúdo dentro dele:
   ```yaml
   services:
     db:
       image: postgres:16
       restart: unless-stopped
       environment:
         POSTGRES_USER: bolao
         POSTGRES_PASSWORD: bolao
         POSTGRES_DB: bolao_copa_2026
       ports:
         - "5432:5432"
       volumes:
         - bolao_db_data:/var/lib/postgresql/data
   volumes:
     bolao_db_data:
   ```
3. Salve o arquivo (`Ctrl+S`).

> **O que isso faz:** quando você "ligar" esse arquivo, o Docker baixa (na primeira vez) e roda uma "caixinha" com PostgreSQL 16 dentro, já criando um usuário `bolao`, senha `bolao` e um banco chamado `bolao_copa_2026`. Os dados ficam salvos mesmo se você desligar o computador (graças ao `volumes`).

---

## Passo 5 — Ligar o banco de dados

No terminal do VSCode, **dentro da pasta do projeto** (onde está o `docker-compose.yml`):

```powershell
docker compose up -d
```

- Na primeira vez, ele vai baixar a imagem do Postgres (pode demorar 1-2 minutos, dependendo da internet).
- O `-d` significa "rodar em segundo plano" — o terminal volta pro normal e o banco continua rodando.

Confirme que está rodando:
```powershell
docker ps
```
Você deve ver uma linha com `postgres:16` e status `Up ...`.

---

## Passo 6 — Configurar o `.env` do projeto

1. No VSCode, copie o arquivo `.env.example` e renomeie a cópia para `.env` (ou use o terminal: `copy .env.example .env`).
2. Abra o `.env` e ajuste a linha `DATABASE_URL` para:
   ```
   DATABASE_URL="postgresql://bolao:bolao@localhost:5432/bolao_copa_2026"
   ```
   (usuário, senha e nome do banco batem com o que colocamos no `docker-compose.yml` no Passo 4).

---

## Comandos do dia a dia (resumo)

| O que quero fazer | Comando |
|---|---|
| Ligar o banco | `docker compose up -d` |
| Ver se está rodando | `docker ps` |
| Desligar o banco (sem apagar os dados) | `docker compose stop` |
| Ligar de novo depois de parar | `docker compose start` |
| Ver os logs (se algo der errado) | `docker compose logs db` |
| Apagar tudo e começar do zero (⚠️ apaga os dados) | `docker compose down -v` |

> No dia a dia, basta abrir o **Docker Desktop** (ele já liga os containers com `restart: unless-stopped`) ou rodar `docker compose up -d` uma vez quando for trabalhar no projeto.

---

## (Opcional) Ver o conteúdo do banco visualmente

Se quiser "abrir" o banco e ver as tabelas/dados como uma planilha, instale a extensão **"PostgreSQL"** (de Chris Kolkman ou Microsoft) no VSCode, ou o programa gratuito **DBeaver** (https://dbeaver.io/). Ao conectar, use:
- Host: `localhost`
- Porta: `5432`
- Usuário: `bolao`
- Senha: `bolao`
- Banco: `bolao_copa_2026`

Isso não é necessário para o Marco 1 — é só uma ferramenta a mais se você quiser inspecionar os dados manualmente.

---

## Problemas comuns

- **"docker: command not found" / Docker Desktop não abre:** confirme que reiniciou o computador após instalar e que o WSL2 está instalado (Passo 1).
- **Porta 5432 já em uso:** se você (ou outro programa) já tem um Postgres rodando na máquina, mude `"5432:5432"` para `"5433:5432"` no `docker-compose.yml` e ajuste o `.env` para `...@localhost:5433/...`.
- **Docker Desktop pedindo login/assinatura:** para uso pessoal/pequenas empresas o Docker Desktop é gratuito — pode pular telas de "upgrade" que aparecerem.
