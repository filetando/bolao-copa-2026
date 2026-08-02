# Bolão Copa do Mundo FIFA 2026

> Sistema web de bolão para a Copa do Mundo FIFA 2026 (intranet corporativa). O torneio já
> terminou — o projeto está na fase de manutenção/refinamento do dashboard (visualizações do
> ranking, mata-mata) sobre os dados reais coletados durante a Copa.
> Este repositório foi estruturado para desenvolvimento assistido por Claude (VSCode/Claude Code). **Antes de qualquer trabalho, leia `AGENTS.md`.**

---

## Estrutura de pastas

```
bolao-copa-2026/
├── AGENTS.md                  # regras globais para qualquer agente de IA — ponto de entrada
├── CLAUDE.md                  # como Claude deve raciocinar (complementa AGENTS.md)
├── README.md                  # este arquivo
├── bolao-copa-2026_1.md        # fonte oficial das regras do bolão — NÃO EDITAR
├── docker-compose.yml           # sobe o Postgres local (ver docs/engineering/SETUP_*.md)
├── .env.example                # variáveis de ambiente necessárias, sem valores reais
│
├── docs/
│   ├── architecture/
│   │   ├── ARCHITECTURE.md      # camadas, bounded contexts, agregados, casos de uso, eventos
│   │   ├── DOMAIN_RULES.md       # regras do bolão traduzidas em linguagem ubíqua/implementável
│   │   ├── DATABASE.md           # modelo ER, schema, índices, transações
│   │   ├── DECISIONS_LOG.md       # ADRs — decisões estruturais e seus porquês
│   │   └── confrontos_terceiros.* / bracket_dependencias.json / calendario_fase_grupos.md
│   │                              # dados estáticos oficiais (Anexo C, dependências do bracket, calendário)
│   │
│   ├── product/
│   │   ├── PRODUCT_REQUIREMENTS.md  # escopo do MVP e critérios de aceite
│   │   ├── ROADMAP.md                # marcos técnicos, riscos — hoje reflete só o planejamento
│   │   │                              # inicial (Marco 0–5); NÃO reflete o trabalho pós-torneio
│   │   ├── MARCO_1_PLAN.md … MARCO_4_PLAN.md  # planos técnicos detalhados de cada marco
│   │   └── copa2026_chaveamento.md    # topologia do mata-mata (quem alimenta quem)
│   │
│   ├── engineering/
│   │   ├── DEVELOPMENT_GUIDELINES.md # convenções gerais de código
│   │   ├── BACKEND_GUIDELINES.md      # estrutura de pastas do backend, API, erros
│   │   ├── FRONTEND_GUIDELINES.md     # atomic design, design tokens, UX, a11y
│   │   ├── TESTING_STRATEGY.md         # pirâmide de testes, casos obrigatórios
│   │   ├── SECURITY.md                  # auth, OWASP, checklist de segurança
│   │   └── SETUP_AMBIENTE.md / SETUP_DOCKER_WINDOWS.md  # como rodar localmente
│   │
│   └── ai-workflow/
│       ├── WORKFLOW.md            # fluxo Ideia → ... → Merge, como pedir tarefas a Claude
│       └── skills/                 # papéis especializados que Claude assume conforme a tarefa
│           ├── domain-expert.md
│           ├── database-architect.md
│           ├── backend-engineer.md
│           ├── frontend-engineer.md
│           ├── test-engineer.md
│           ├── security-reviewer.md
│           └── ux-reviewer.md       # (inclui também performance-reviewer)
│
├── prisma/
│   ├── schema.prisma              # schema do banco (Postgres)
│   ├── migrations/                 # histórico de migrations já aplicadas
│   └── seed/                       # scripts de seed (referência, torneio, siglas)
│
├── seed-data/                     # JSON de origem do seed (equipes, calendário da fase de grupos)
├── scripts/                        # .bat auxiliares (subir/derrubar servidor, firewall Windows)
├── snapshots/                      # auditoria em disco a cada inserção/correção de placar (gerado em runtime)
│
├── src/                          # backend (Fastify + Prisma), Clean Architecture
│   ├── domain/                    # entidades, value objects, domain services — ZERO deps externas
│   │   ├── identity/
│   │   ├── tournament/
│   │   └── bolao/                  # inclui dashboard/ (funções puras: perfil de acerto, recordes, etc.)
│   ├── application/               # use cases + ports (interfaces)
│   ├── infrastructure/            # implementações de ports: DB (Prisma), auth, cron, HTTP bootstrap
│   └── presentation/               # rotas HTTP (Fastify), DTOs
│
└── frontend/                     # SPA React 19 + Vite + Tailwind v4 + Recharts
    └── src/
        ├── pages/                  # HomePage (Ranking/dashboard), BracketPage, MatchesPage, etc.
        ├── components/
        │   ├── atoms/ molecules/ organisms/ templates/  # atomic design (ver FRONTEND_GUIDELINES.md)
        │   └── organisms/dashboard/  # visualizações do ranking (perfil de acerto, recordes, ...)
        ├── contexts/                # AuthContext etc.
        ├── lib/                     # api client, paletas de cor (jogador/categoria)
        └── types/                   # tipos compartilhados do payload da API
```

> **Nota sobre testes:** não existe uma pasta `tests/` centralizada — os testes ficam
> colocados junto do código, em subpastas `__tests__/` (ex.: `src/domain/bolao/dashboard/__tests__/`),
> rodados com Vitest (`npm test`). Um diretório `tests/` vazio (só com `.gitkeep`) ficou do
> scaffold inicial do projeto e não é usado.

## O que vai (e o que não vai) em cada pasta

| Pasta | O que vai | O que NUNCA vai |
|---|---|---|
| `docs/architecture/` | decisões estruturais, modelo de dados, regras de domínio | exemplos de código de implementação completos |
| `docs/product/` | escopo, prioridades, riscos | detalhes técnicos de implementação |
| `docs/engineering/` | convenções, checklists, estratégia de teste/segurança | regras de negócio (isso é `DOMAIN_RULES.md`) |
| `docs/ai-workflow/` | como trabalhar com Claude, papéis/skills | regras de produto ou arquitetura (apenas referencia) |
| `src/domain/` | entidades, regras de negócio puras (backend e cálculos do dashboard) | imports de framework/banco/HTTP |
| `src/application/` | use cases, ports (interfaces) | SQL, `req`/`res` |
| `src/infrastructure/` | Prisma, repositórios, hashing, cron, snapshot em disco | regra de negócio |
| `src/presentation/` | rotas HTTP (Fastify) | acesso direto a banco, cálculo de pontuação |
| `frontend/src/` | componentes React, páginas, cliente HTTP, paletas de cor | regra de negócio de pontuação (isso é `src/domain`) |

## Por onde começar

1. Leia `AGENTS.md` (regras) e `CLAUDE.md` (raciocínio).
2. Leia `docs/architecture/DOMAIN_RULES.md` — é o "dicionário" do projeto.
3. `docs/product/ROADMAP.md` e os `MARCO_*_PLAN.md` documentam o planejamento **inicial** (pré-torneio) e continuam valendo como referência de arquitetura/decisões — mas o torneio já terminou, então "próximo passo" hoje não é mais o Marco 1: é o que estiver sendo pedido na tarefa atual (hoje, principalmente ajustes no dashboard de ranking/mata-mata).
4. Para qualquer tarefa nova, siga `docs/ai-workflow/WORKFLOW.md`.
5. Pra rodar localmente: `docker-compose up -d` (Postgres) → `npm run db:migrate && npm run db:seed` → `npm run dev` (backend, porta 3000) e `cd frontend && npm run dev` (frontend, porta 5173). Detalhes em `docs/engineering/SETUP_AMBIENTE.md`.

## Dados de referência já disponíveis

- `docs/architecture/confrontos_terceiros.sql` / `.csv` / `.json` — Anexo C completo (495 combinações), usado no seed (ver `DATABASE.md` §2.8).
- `seed-data/equipes.json` / `partidas_fase_grupos.json` — dados de origem do seed do torneio (equipes, calendário da fase de grupos).
