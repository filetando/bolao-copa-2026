# Bolão Copa do Mundo FIFA 2026

> Sistema web de bolão para a Copa do Mundo FIFA 2026 (intranet corporativa).
> Este repositório foi estruturado para desenvolvimento assistido por Claude (VSCode/Claude Code). **Antes de qualquer trabalho, leia `AGENTS.md`.**

---

## Estrutura de pastas

```
bolao-copa-2026/
├── AGENTS.md                  # regras globais para qualquer agente de IA — ponto de entrada
├── CLAUDE.md                  # como Claude deve raciocinar (complementa AGENTS.md)
├── README.md                  # este arquivo
├── bolao-copa-2026_1.md        # (a copiar para a raiz) fonte oficial das regras do bolão — NÃO EDITAR
├── .env.example                # variáveis de ambiente necessárias, sem valores reais
│
├── docs/
│   ├── architecture/
│   │   ├── ARCHITECTURE.md      # camadas, bounded contexts, agregados, casos de uso, eventos
│   │   ├── DOMAIN_RULES.md       # regras do bolão traduzidas em linguagem ubíqua/implementável
│   │   ├── DATABASE.md           # modelo ER, schema, índices, transações
│   │   └── DECISIONS_LOG.md       # ADRs — decisões estruturais e seus porquês
│   │
│   ├── product/
│   │   ├── PRODUCT_REQUIREMENTS.md  # escopo do MVP e critérios de aceite
│   │   └── ROADMAP.md                # marcos técnicos, riscos, melhorias futuras
│   │
│   ├── engineering/
│   │   ├── DEVELOPMENT_GUIDELINES.md # convenções gerais de código
│   │   ├── BACKEND_GUIDELINES.md      # estrutura de pastas do backend, API, erros
│   │   ├── FRONTEND_GUIDELINES.md     # atomic design, design tokens, UX, a11y
│   │   ├── TESTING_STRATEGY.md         # pirâmide de testes, casos obrigatórios
│   │   └── SECURITY.md                  # auth, OWASP, checklist de segurança
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
├── src/                          # código-fonte (a popular a partir do Marco 1, ver ROADMAP.md)
│   ├── domain/                    # entidades, value objects, domain services — ZERO deps externas
│   │   ├── identity/
│   │   ├── tournament/
│   │   └── bolao/
│   ├── application/               # use cases + ports (interfaces)
│   ├── infrastructure/            # implementações de ports: DB, auth, cron, HTTP bootstrap
│   └── presentation/               # rotas HTTP, controllers, DTOs, frontend
│
└── tests/                          # espelha src/, ver TESTING_STRATEGY.md
```

## O que vai (e o que não vai) em cada pasta

| Pasta | O que vai | O que NUNCA vai |
|---|---|---|
| `docs/architecture/` | decisões estruturais, modelo de dados, regras de domínio | exemplos de código de implementação completos |
| `docs/product/` | escopo, prioridades, riscos | detalhes técnicos de implementação |
| `docs/engineering/` | convenções, checklists, estratégia de teste/segurança | regras de negócio (isso é `DOMAIN_RULES.md`) |
| `docs/ai-workflow/` | como trabalhar com Claude, papéis/skills | regras de produto ou arquitetura (apenas referencia) |
| `src/domain/` | entidades, regras de negócio puras | imports de framework/banco/HTTP |
| `src/application/` | use cases, ports (interfaces) | SQL, `req`/`res` |
| `src/infrastructure/` | Prisma/Drizzle, repositórios, hashing, cron | regra de negócio |
| `src/presentation/` | rotas, controllers, componentes React | acesso direto a banco, cálculo de pontuação |

## Por onde começar

1. Leia `AGENTS.md` (regras) e `CLAUDE.md` (raciocínio).
2. Leia `docs/architecture/DOMAIN_RULES.md` — é o "dicionário" do projeto.
3. Veja `docs/product/ROADMAP.md` §4 ("Próximo passo imediato") para saber o que implementar primeiro (Marco 1 — MVP).
4. Para qualquer tarefa nova, siga `docs/ai-workflow/WORKFLOW.md`.

## Dados de referência já disponíveis

- `confrontos_terceiros.sql` / `.csv` / `.json` — Anexo C completo (495 combinações), pronto para seed (ver `DATABASE.md` §2.8).
