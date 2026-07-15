# ARCHITECTURE.md

> Fonte: regras de negócio em `DOMAIN_RULES.md` (derivado de `bolao-copa-2026_1.md`) + princípios do `guia-fundamentos-software-para-ia.md`.
> **Quando atualizar:** sempre que um Bounded Context, agregado, caso de uso ou dependência entre camadas mudar. Mudanças aqui exigem atualização cruzada em `DATABASE.md` (se mexer em entidades) e `AGENTS.md` (se mexer em regras de dependência).
> **Responsável:** Tech Lead (humano), com Claude propondo mudanças via PR de documentação antes de codar.

---

## 0. Calibragem (Guia, Seção 0)

Este projeto é classificado como:
- **Production-ready** (login/senha reais, dados de usuários, ranking que vale prêmio/bragging rights, vida útil de ~6 semanas + manutenção).
- **Mono-nó / monolito simples**.

**Consequência explícita:** Segurança, Testes e Observabilidade básica são obrigatórios. CAP/PACELC, CQRS, Event Sourcing, Saga, Sharding, Circuit Breaker entre serviços **são deliberadamente IGNORADOS** — não há sistema distribuído. A única "integração externa" eventual é uma API de resultados de futebol (opcional, fora do MVP), que se existir deve ter timeout + retry simples (não circuit breaker completo).

---

## 1. Visão geral das camadas (Clean Architecture / Dependency Rule)

```
┌─────────────────────────────────────────────────────────┐
│ presentation/        (HTTP controllers, REST routes,     │
│                        validação de DTO de entrada,       │
│                        frontend React)                     │
├─────────────────────────────────────────────────────────┤
│ infrastructure/      (Prisma/DB repos, hashing, cron,     │
│                        envio de e-mail, API externa,       │
│                        implementações dos "ports")         │
├─────────────────────────────────────────────────────────┤
│ application/         (Use Cases / Interactors, DTOs,      │
│                        Ports = interfaces de repositório   │
│                        e serviços externos)                │
├─────────────────────────────────────────────────────────┤
│ domain/              (Entities, Value Objects, Aggregates, │
│                        Domain Services, Domain Events —     │
│                        ZERO dependências externas)          │
└─────────────────────────────────────────────────────────┘
```

### Regra de dependência (obrigatória)

- `domain` não importa **nada** de `application`, `infrastructure` ou `presentation`. É testável isoladamente, sem subir banco/servidor.
- `application` importa apenas `domain`. Define **ports** (interfaces) que `infrastructure` implementa (Inversão de Dependência — DIP).
- `infrastructure` importa `application` (para implementar os ports) e `domain` (para reconstruir entidades a partir de dados persistidos).
- `presentation` importa `application` (use cases) — nunca acessa `infrastructure` ou `domain` diretamente.

**Proibido:**
- `domain` importar `prisma`, `express`/`fastify`, `bcrypt`, etc.
- Controllers (`presentation`) chamando o banco diretamente, "pulando" o use case.
- Lógica de pontuação/desempate dentro de um controller ou de uma migration.

---

## 2. Bounded Contexts

> Linguagem ubíqua definida em `DOMAIN_RULES.md`. Cada contexto tem seu próprio "vocabulário" mesmo que termos se pareçam (ex.: "pontos" significa coisas diferentes em Tournament — pontos de tabela — e em Bolão — pontos do palpite).

### 2.1 Identity & Access (`identity`)

**Responsabilidade:** cadastro/login de usuários, autenticação, perfil (nome exibido), papéis (usuário comum / admin).

**Por que separado:** é genérico, reutilizável, e não tem nenhuma regra de futebol. Mantém o contexto `Tournament` livre de preocupações de auth.

### 2.2 Tournament (`tournament`)

**Responsabilidade:** a "verdade" sobre a Copa do Mundo: grupos, equipes, partidas, fases, calendário, resultados oficiais, classificação, desempate, terceiros colocados, Anexo C, geração do mata-mata.

**Por que separado:** é o contexto mais complexo e mais sensível a regras (7 critérios de desempate, reiteração, Anexo C). Isolar permite testá-lo exaustivamente sem misturar com regras de pontuação do bolão.

### 2.3 Bolão / Predictions & Scoring (`bolao`)

**Responsabilidade:** palpites dos usuários (partida a partida), cálculo de pontuação (cascata de regras + multiplicadores), leaderboard.

**Anti-Corruption Layer (ACL):** `bolao` **lê** dados de `tournament` (resultado oficial de uma partida, status "finalizada") através de uma interface própria (`TournamentReadPort`), nunca acessando as tabelas de `tournament` diretamente. Isso evita que uma mudança no modelo de `tournament` quebre `bolao` silenciosamente.

```
[tournament] --(TournamentReadPort: getMatchResult, isGroupStageComplete)--> [bolao]
```

---

## 3. Entidades, Value Objects e Agregados

### 3.1 Identity

| Elemento | Tipo | Notas |
|---|---|---|
| `Usuario` | Aggregate Root | id, nome (exibido em toda a app), username, passwordHash, role (`user`/`admin`), createdAt |

### 3.2 Tournament

| Elemento | Tipo | Notas |
|---|---|---|
| `Equipe` | Entity | id, nome, sigla, bandeira (URL/código), grupoId |
| `EstatisticasEquipe` | Value Object | vitórias, empates, derrotas, golsPro, golsContra, saldo, pontos, fairPlay — **recalculado**, não é fonte de verdade (deriva de `Partida`) |
| `Grupo` | Aggregate Root | id (A–L), 4 `Equipe`, calcula `EstatisticasEquipe` de cada uma a partir das partidas finalizadas |
| `Partida` | Aggregate Root | id (1–104), fase, grupo (se aplicável), equipeCasa/equipeFora (podem ser placeholders tipo "Vencedor Jogo 73" até resolvidos), golsCasa/golsFora, status (`agendada`/`ao_vivo`/`encerrada`), dataHoraUTC, estádio |
| `Fase` | Value Object/Enum | `grupos`, `16avos`, `oitavas`, `quartas`, `semifinal`, `terceiro_lugar`, `final` — define o multiplicador (ver `bolao`) |
| `ClassificacaoService` | Domain Service | calcula classificação de um `Grupo` aplicando os 7 critérios + reiteração (Seção 3 do `bolao-copa-2026_1.md`) |
| `TerceirosColocadosService` | Domain Service | recebe os 12 terceiros colocados e seus dados, aplica os mesmos critérios para eleger os 8 melhores |
| `AnexoCLookup` | Domain Service (dicionário) | recebe a string ordenada de 8 letras (ex.: `"CDEFGHIJ"`) e retorna os confrontos `1ºA..1ºL vs 3ºX`. Dados estáticos carregados de `confrontos_terceiros` (ver `DATABASE.md`) |
| `BracketGeneratorService` | Domain Service | usa `ClassificacaoService` + `TerceirosColocadosService` + `AnexoCLookup` para popular as `Partida` 73–88 com as equipes reais |

### 3.3 Bolão

| Elemento | Tipo | Notas |
|---|---|---|
| `Palpite` | Aggregate Root | id, usuarioId, partidaId, golsCasaPalpite, golsForaPalpite, criadoEm, atualizadoEm. Invariante: não pode existir/ser alterado se `now() > partida.dataHoraUTC - janelaBloqueio` |
| `RegraPontuacao` | Domain Service | implementa a cascata de pontuação (placar exato → vencedor+gols → vencedor+saldo → empate correto → só vencedor → 0) |
| `MultiplicadorFase` | Value Object | mapeia `Fase` → multiplicador (1, 1.5, 2, 4) |
| `PontuacaoPartida` | Value Object | resultado de `RegraPontuacao × MultiplicadorFase` para um `Palpite` já resolvido |
| `LeaderboardEntry` (read model) | — | usuarioId, nome, pontosTotais, posição — pode ser uma view/materialized view, não é um agregado com invariantes próprias |

---

## 4. Casos de Uso (Application Layer)

### Identity
- `RegisterUser` (nome, username, senha → hash Argon2id)
- `LoginUser` (username, senha → sessão/JWT)

### Tournament
- `ListMatchesGroupedByDate`
- `RegisterMatchResult` (admin) — grava `golsCasa/golsFora`, muda status para `encerrada`, **dispara evento `MatchFinished`**
- `CalculateGroupStandings(grupoId)` — usa `ClassificacaoService`
- `RankThirdPlacedTeams()` — usa `TerceirosColocadosService`, retorna os 8 melhores + a string ordenada de 8 letras
- `GenerateKnockoutBracket()` — orquestra `RankThirdPlacedTeams` + `AnexoCLookup` + `BracketGeneratorService`, atualiza `Partida` 73–88. **Disparado manualmente por admin em 27/06 (ver ADR-003)**

### Bolão
- `SubmitPrediction(usuarioId, partidaId, golsCasa, golsFora)` — valida janela de bloqueio (ADR-004) **no backend**
- `CalculateScoreForMatch(partidaId)` — disparado por `MatchFinished`, aplica `RegraPontuacao` + `MultiplicadorFase` para todos os `Palpite` daquela partida
- `GetLeaderboard()`
- `GetUserPredictionsForMatch(partidaId)` — respeita regra de visibilidade ("exibir palpites de outros usuários quando permitido")

---

## 5. Eventos de Domínio

> Em um monólito, "eventos de domínio" não precisam de message broker — podem ser um `EventEmitter` interno síncrono (in-process). Isso evita a complexidade de mensageria (Guia, Seção 0/4) mantendo o **desacoplamento de código** entre `tournament` e `bolao`.

| Evento | Disparado por | Consumido por |
|---|---|---|
| `MatchFinished` | `RegisterMatchResult` | `bolao.CalculateScoreForMatch` |
| `GroupStageCompleted` | admin/cron, após o último jogo da fase de grupos (27/06) | `tournament.RankThirdPlacedTeams` (manual na v1, ver ADR-003) |
| `KnockoutBracketGenerated` | `GenerateKnockoutBracket` | frontend (invalidate cache de partidas 73–88) |
| `PredictionLockApproaching` | cron (a cada minuto) | presentation (avisa frontend para travar formulário) |

---

## 6. Mapa de dependências permitidas

```
identity   <───┐
               │ (lido por)
tournament <───┼─── bolao  (via ACL/ports, leitura apenas)
               │
presentation ──┴──> application ──> domain
infrastructure ────> application, domain (implementa ports)
```

- `tournament` **nunca** depende de `bolao`.
- `bolao` depende de `tournament` apenas via `TournamentReadPort` (interface em `application/bolao/ports`).
- `identity` é dependido por `bolao` (saber quem é o usuário) e por `presentation` (autenticação), mas não depende de ninguém.

---

## 7. Padrões de projeto (GoF) aplicáveis

- **Repository**: cada agregado tem um `XxxRepository` (port em `application`, implementação em `infrastructure`). Evita SQL espalhado e facilita testes com repositórios fake.
- **Strategy**: `RegraPontuacao` e `ClassificacaoService` são bons candidatos — diferentes critérios de desempate como estratégias encadeadas (chain of responsibility, na prática).
- **Factory**: `BracketGeneratorService` "monta" as `Partida` 73–88 — encapsula a lógica de criação para não espalhar `new Partida(...)` com regras condicionais pelo código.

---

## 8. Trade-offs declarados (Guia, Seção 13)

- **DRY vs. coesão**: `ClassificacaoService` e `TerceirosColocadosService` compartilham os 7 critérios de desempate, mas são serviços distintos porque operam em escopos diferentes (equipes de um grupo vs. terceiros entre grupos). Extraímos a lógica comum dos critérios em funções puras reutilizáveis, mas não forçamos uma única classe genérica — coesão > DRY aqui.
- **KISS/YAGNI vs. extensibilidade**: não modelamos suporte a "múltiplos bolões/torneios" — é YAGNI para esta versão. Se necessário no futuro, `Torneio` vira um agregado próprio.
- **Consistência vs. latência**: não se aplica (mono-nó, transações ACID locais). Leaderboard pode ser uma view recalculada sob demanda ou cacheada com invalidação simples — não é "eventual consistency" distribuída, é apenas cache local.
