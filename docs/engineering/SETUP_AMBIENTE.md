# SETUP_AMBIENTE.md — Preparando o VSCode para começar o Marco 1

> **Objetivo:** deixar sua máquina pronta (Node, banco, Claude Code no VSCode) para começar a colar os prompts do `MARCO_1_PLAN.md`.
> Se algo aqui mudar (ex.: nova forma de instalar o Claude Code), atualize este arquivo.

---

## 1. Pré-requisitos de sistema

| Ferramenta | Versão mínima | Por quê |
|---|---|---|
| **Node.js** | 18+ (recomendado 22 LTS) | backend (Fastify) e frontend (Vite/React) — ADR-001 |
| **VSCode** | recente (1.85+) | editor + extensão Claude Code |
| **Git** | qualquer recente | controle de versão |
| **Docker Desktop** | qualquer recente | rodar PostgreSQL localmente sem instalar no SO |
| **Conta Claude** | Pro, Max, Team, Enterprise **ou** chave de API (Console) | necessário para usar o Claude Code — o plano gratuito do claude.ai não dá acesso |

> Se você já tem Node, VSCode, Git e Docker instalados, pule para a Seção 3.

### 1.1 Instalar Node.js (recomendado: via nvm)

**macOS/Linux:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# reabra o terminal, depois:
nvm install 22
nvm use 22
node --version   # deve mostrar v22.x
```

**Windows:** instale o **WSL2** primeiro (recomendado para Claude Code no Windows — evita problemas de path/permissão), depois siga os mesmos passos acima dentro do Ubuntu/WSL.
```powershell
wsl --install
```
Após reiniciar, abra o "Ubuntu" pelo menu iniciar, crie usuário/senha, e siga os comandos do nvm acima dentro do WSL.

### 1.2 Instalar Docker Desktop

Baixe e instale em https://www.docker.com/products/docker-desktop/. Confirme:
```bash
docker --version
```

---

## 2. Instalar e conectar o Claude Code no VSCode

### 2.1 Instalar a CLI do Claude Code

**Opção recomendada (instalador nativo, sem depender do Node):**

macOS/Linux:
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Windows (PowerShell):
```powershell
irm https://claude.ai/install.ps1 | iex
```

**Opção alternativa (via npm, se preferir manter tudo no Node):**
```bash
npm install -g @anthropic-ai/claude-code
```

Verifique:
```bash
claude --version
```

### 2.2 Autenticar

```bash
claude
```
Na primeira execução, ele abrirá o navegador para login (OAuth com sua conta Claude) ou pedirá uma chave de API, dependendo do seu plano.

### 2.3 Instalar a extensão no VSCode

1. Abra o VSCode → aba de Extensões (`Ctrl+Shift+X` / `Cmd+Shift+X`).
2. Procure por **"Claude Code"** (publicado pela Anthropic).
3. Instale.
4. Com um projeto aberto, abra o painel do Claude Code (ícone na barra lateral, ou `Ctrl+Shift+L` se configurado) — ele deve detectar automaticamente o terminal/IDE.

> **Troubleshooting comum:** se aparecer "No available IDEs detected", confirme que o comando `code` está no PATH do terminal (no VSCode: `Ctrl+Shift+P` → "Shell Command: Install 'code' command in PATH") e que a versão do Node é a mesma dentro/fora do WSL, se estiver usando Windows.

---

## 3. Preparar o projeto

1. Extraia `bolao-copa-2026-fundacao.zip` em uma pasta (ex.: `~/projetos/bolao-copa-2026`).
2. Abra essa pasta no VSCode (`File > Open Folder`).
3. Inicialize o Git e conecte ao GitHub:
   ```bash
   git init
   git add .
   git commit -m "docs: fundação do projeto (AGENTS, ARCHITECTURE, DOMAIN_RULES, seed data)"
   ```
   Crie um repositório vazio no GitHub (sem README/gitignore), copie a URL e:
   ```bash
   git remote add origin <URL_DO_SEU_REPOSITORIO>
   git branch -M main
   git push -u origin main
   ```

> A partir daqui, `MARCO_1_PLAN.md` instrui a fazer `git add . && git commit && git push` ao final de cada tarefa.

---

## 4. Subir o PostgreSQL local (via Docker)

Crie `docker-compose.yml` na raiz do projeto:

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

Suba o banco:
```bash
docker compose up -d
```

Crie o `.env` real a partir do exemplo:
```bash
cp .env.example .env
```
E ajuste `DATABASE_URL` para bater com o `docker-compose.yml`:
```
DATABASE_URL="postgresql://bolao:bolao@localhost:5432/bolao_copa_2026"
```

> `.env` já está no `.gitignore` — não será commitado.

---

## 5. Primeira sessão com o Claude Code

No terminal integrado do VSCode (já dentro da pasta do projeto):

```bash
claude
```

Isso abre uma sessão interativa com acesso de leitura/escrita ao projeto. **Antes de pedir qualquer implementação**, garanta que ele leu o essencial — pode começar com algo como:

```
Leia AGENTS.md, README.md e docs/product/MARCO_1_PLAN.md.
Confirme que entendeu a estrutura do projeto e o que é a Tarefa 0
do MARCO_1_PLAN.md antes de começarmos.
```

Depois disso, é só seguir o `MARCO_1_PLAN.md`, colando o prompt da **Tarefa 0** e seguindo em ordem.

---

## 6. Checklist final antes de começar a Tarefa 0

- [ ] `node --version` ≥ 18 (idealmente 22)
- [ ] `docker compose up -d` rodando, `docker ps` mostra o container `db`
- [ ] `.env` criado a partir do `.env.example`, com `DATABASE_URL` apontando para o Postgres local
- [ ] `claude --version` funcionando, sessão autenticada
- [ ] Extensão "Claude Code" instalada no VSCode e reconhecendo o projeto
- [ ] `git init` feito, primeiro commit com a fundação do projeto
