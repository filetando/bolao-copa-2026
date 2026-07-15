# BACKEND_GUIDELINES.md

> **Quando atualizar:** mudanças na estrutura de pastas do backend, novo padrão de erro/resposta de API, ou nova convenção de camada.
> **Stack assumida:** Node.js + TypeScript + Fastify + Prisma/Drizzle + PostgreSQL (ADR-001 — confirmar/ajustar se diferente).

---

## 1. Estrutura de pastas (`src/`)

```
src/
├── domain/
│   ├── identity/          # Usuario
│   ├── tournament/         # Equipe, Grupo, Partida, Fase, ClassificacaoService,
│   │                        # TerceirosColocadosService, AnexoCLookup, BracketGeneratorService
│   └── bolao/              # Palpite, RegraPontuacao, MultiplicadorFase
│
├── application/
│   ├── identity/use-cases/        # RegisterUser, LoginUser
│   ├── tournament/use-cases/      # ListMatches, RegisterMatchResult, GenerateKnockoutBracket...
│   ├── tournament/ports/          # EquipeRepository, PartidaRepository, GrupoRepository (interfaces)
│   ├── bolao/use-cases/           # SubmitPrediction, CalculateScoreForMatch, GetLeaderboard...
│   └── bolao/ports/                # PalpiteRepository, TournamentReadPort (ACL)
│
├── infrastructure/
│   ├── db/                # Prisma schema, migrations, seeds (incl. confrontos_terceiros)
│   ├── repositories/      # implementações Postgres dos ports acima
│   ├── auth/               # hashing (Argon2id), sessão/JWT
│   ├── cron/                # job de bloqueio de palpites (verifica a cada minuto)
│   └── http/                # bootstrap do Fastify, plugins, middlewares
│
└── presentation/
    └── http/
        ├── routes/         # rotas REST por contexto (identity, tournament, bolao)
        ├── controllers/    # traduzem request/response <-> DTOs de use case
        └── dto/             # schemas de validação (Zod)
```

**O que nunca vai em cada pasta:**
- `domain/`: nada de `import { PrismaClient }`, `fastify`, `bcrypt`/`argon2` direto. Se uma entidade precisa de hashing, recebe a senha já tratada via um `port`.
- `application/`: nada de SQL, nada de `req`/`res` do framework HTTP.
- `infrastructure/`: nada de regra de negócio (ex.: o repositório de `Partida` não decide se um palpite pode ser enviado — isso é `application`).
- `presentation/`: nada de acesso a banco, nada de cálculo de pontuação.

## 2. API REST — convenções

- Recursos no plural: `/partidas`, `/palpites`, `/usuarios`, `/leaderboard`.
- Erros em formato consistente: `{ "error": { "code": "PREDICTION_LOCKED", "message": "..." } }` — códigos de erro (`code`) são estáveis e usados pelo frontend para decisões de UI (ex.: desabilitar botão), mensagens (`message`) são para exibição.
- Status HTTP corretos: `400` validação, `401` não autenticado, `403` não autorizado (ex.: editar palpite de outro usuário), `404` não encontrado, `409` conflito (ex.: tentar enviar palpite após bloqueio), `500` erro inesperado (nunca expor stack trace ao cliente).

## 3. Validação de entrada (DTOs)

- Todo body/query/params de rota validado com Zod **antes** de chamar o use case.
- Exemplo de regra: `golsCasaPalpite` e `golsForaPalpite` são inteiros `>= 0` e `<= 20` (limite sanitário, evita abuso/erro de digitação grotesco).

## 4. Tratamento de erros e exceções de domínio

- `domain`/`application` lançam exceções tipadas (`PredictionLockedError`, `MatchNotFoundError`, `InvalidThirdPlaceCombinationError`, etc.), nunca `throw new Error("erro")` genérico.
- `presentation` mapeia essas exceções para os status HTTP/códigos da seção 2 em um único lugar (error handler global do Fastify), evitando `try/catch` repetido em cada controller.

## 5. Cron de bloqueio de palpites

- Job a cada minuto (Guia recomenda timeout/retry mesmo em jobs simples, mas aqui não há chamada externa — o "retry" relevante é apenas "se o job falhar, o próximo minuto tenta de novo", não há necessidade de backoff).
- O job **não bloqueia escrita diretamente no banco** (isso seria redundante com a validação do use case) — sua função é **notificar o frontend** (via SSE/polling) de que uma partida está prestes a travar, para UX. A fonte de verdade do bloqueio é sempre o timestamp comparado em `SubmitPrediction`.

## 6. Cálculo de pontuação — onde mora

- `RegraPontuacao.calcular(palpite, resultado): number` — função pura em `domain/bolao`, sem efeitos colaterais. Recebe `{golsCasaPalpite, golsForaPalpite}` e `{golsCasa, golsFora}`, retorna pontos base (0/10/15/18/25).
- `application/bolao/use-cases/CalculateScoreForMatch` orquestra: busca todos os palpites da partida, chama `RegraPontuacao`, multiplica por `MultiplicadorFase`, persiste via `PalpiteRepository`, tudo em uma transação.
