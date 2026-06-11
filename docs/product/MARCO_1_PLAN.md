# MARCO_1_PLAN.md — Plano de Execução (MVP)

> **Como usar:** este documento é uma sequência de **tarefas/sessões** para colar no terminal do Claude Code, uma de cada vez, na ordem. Cada tarefa já referencia os documentos de `docs/` que o Claude deve ler (conforme `AGENTS.md` §2). Não pule a ordem — cada tarefa depende da anterior.
>
> **Pré-requisito:** extrair o zip `bolao-copa-2026-fundacao.zip` na raiz do seu projeto e abrir essa pasta no VSCode antes de começar.
>
> **Quando atualizar:** marque cada tarefa como `[x]` ao concluir. Se uma tarefa for adiada/quebrada em sub-tarefas, registre aqui e em `ROADMAP.md`.

---

## ✅ Dados da fase de grupos — completos

O calendário completo dos 72 jogos da fase de grupos (48 equipes, 12 grupos, round-robin completo) foi recebido, verificado (72 jogos, 6 por grupo, cada equipe com 3 jogos, todos os 6 confrontos por grupo presentes) e já convertido para os arquivos de seed:

- `seed-data/equipes.json` — 48 equipes com `id`, `nome`, `sigla`/`bandeira_codigo`, `grupo_id`.
- `seed-data/partidas_fase_grupos.json` — 72 partidas (`id` 1–72, em ordem cronológica), com `data_hora_utc` já calculado (ver `DATABASE.md` §2.5.1 para a regra de conversão).
- `docs/architecture/calendario_fase_grupos.md` — fonte original (substitui, para a fase de grupos, a tabela parcial da Seção 8 de `bolao-copa-2026_1.md`).

**Pendência remanescente (não bloqueia o MVP de hoje):** os jogos 73–104 (mata-mata) ainda não têm um arquivo de seed equivalente — `bolao-copa-2026_1.md` §9 tem datas/horários incompletos para os jogos 80–85. Para a Tarefa 1, esses 32 jogos entram com `placeholder_casa`/`placeholder_fora` (textos de `bolao-copa-2026_1.md` §6) e `data_hora_utc` provisório (data conhecida quando houver, ou marcador "a definir" — ver nota na Tarefa 1). Ajuste quando tiver as datas oficiais completas.

---

## Tarefa 0 — Setup do projeto (scaffolding)

**Objetivo:** criar o esqueleto do monorepo (backend + frontend) dentro da estrutura já definida em `README.md`/`BACKEND_GUIDELINES.md`/`FRONTEND_GUIDELINES.md`, sem nenhuma lógica ainda.

**Prompt sugerido:**
```
Leia AGENTS.md, README.md, docs/architecture/DECISIONS_LOG.md (ADR-001) e
docs/engineering/BACKEND_GUIDELINES.md.

Faça o setup inicial do projeto:
- Backend: Node.js + TypeScript + Fastify, com a estrutura de pastas em src/
  já existente (domain/application/infrastructure/presentation), conforme
  BACKEND_GUIDELINES.md §1.
- Prisma configurado apontando para PostgreSQL via DATABASE_URL (.env.example
  já existe).
- Frontend: React + Vite + TypeScript + TailwindCSS, em uma pasta `frontend/`
  na raiz, com a estrutura de components/ conforme FRONTEND_GUIDELINES.md §1.
- package.json com scripts: dev, build, test (ainda sem testes).
- Confirme que `npm run dev` sobe o servidor Fastify (rota de health-check
  GET /health retornando { status: "ok" }) antes de seguir.

Não implemente nenhuma entidade/use case ainda — apenas o esqueleto.
```

**Arquivos esperados:** `package.json`, `tsconfig.json`, `prisma/schema.prisma` (vazio/inicial), `src/infrastructure/http/server.ts`, `frontend/` inicializado.

**Critério de aceite:** `npm run dev` sobe sem erro; `GET /health` responde `200`.

---

## Tarefa 1 — Schema Prisma, migration inicial e seed

**Objetivo:** criar o schema do banco para as entidades do Marco 1 e popular dados estáticos (grupos, equipes, fases, calendário, Anexo C).

**Prompt sugerido:**
```
Leia docs/architecture/DATABASE.md e docs/architecture/DOMAIN_RULES.md.

1. Crie o schema Prisma com as tabelas: usuarios, grupos, equipes, fases,
   partidas, palpites, palpites_estaticos, confrontos_terceiros — exatamente
   conforme os campos/índices/constraints descritos em DATABASE.md (siga o
   checklist "antes de criar migrations" do AGENTS.md).

2. Gere a migration inicial.

3. Crie scripts de seed separados (conforme AGENTS.md):
   - seed:reference -> popula `fases` (grupos, 16avos, oitavas, quartas,
     semifinal, terceiro_lugar, final, com multiplicadores de
     DOMAIN_RULES.md §8) e `confrontos_terceiros` a partir de
     docs/architecture/confrontos_terceiros.json.
   - seed:tournament -> popula:
     - `grupos` (A-L)
     - `equipes` a partir de seed-data/equipes.json (48 equipes)
     - `partidas` 1-72 a partir de seed-data/partidas_fase_grupos.json
       (data_hora_utc já calculado, fase_id='grupos')
     - `partidas` 73-104 (mata-mata) a partir do chaveamento descrito em
       bolao-copa-2026_1.md §6/§9: equipe_casa_id/equipe_fora_id NULL,
       placeholder_casa/placeholder_fora com os textos descritos
       ("2º Grupo A", "Melhor 3º (A/B/C/D/F)", "Venc. Jogo 73", etc.).
       Para os jogos 80-85, cuja data exata não está definida na fonte,
       use data_hora_utc = data do início da respectiva fase (ex.: 02/07
       12h00 UTC como placeholder) e marque status='agendada' — ajustável
       depois sem migration (é só dado).

Atualize docs/architecture/DATABASE.md se algo mudar em relação ao
desenhado (ex.: ajuste de tipo de coluna pelo Prisma).
```

**Arquivos esperados:** `prisma/schema.prisma`, `prisma/migrations/...`, `prisma/seed/reference.ts`, `prisma/seed/tournament.ts`.

**Critério de aceite:** `npx prisma migrate dev` roda sem erro; `npx prisma db seed` popula as 495 linhas de `confrontos_terceiros`, 12 `grupos`, `fases` e `partidas` (mesmo que parte com placeholder).

---

## Tarefa 2 — Identity: cadastro e login

**Objetivo:** implementar `RegisterUser` e `LoginUser` (domain → application → infrastructure → presentation), seguindo `SECURITY.md`.

**Prompt sugerido:**
```
Leia docs/architecture/ARCHITECTURE.md §3.1/§4 (Identity), docs/engineering/SECURITY.md
e docs/ai-workflow/skills/backend-engineer.md. Siga o checklist "antes de
gerar código" do AGENTS.md.

Implemente:
- domain/identity: entidade Usuario.
- application/identity/use-cases: RegisterUser (nome, username, senha ->
  hash Argon2id) e LoginUser (username, senha -> sessão).
- application/identity/ports: UsuarioRepository (interface).
- infrastructure: implementação Prisma do UsuarioRepository; hashing
  Argon2id; emissão de cookie httpOnly com JWT (ver SECURITY.md §1).
- presentation/http: rotas POST /auth/register, POST /auth/login,
  POST /auth/logout, GET /auth/me, com validação de DTO via Zod.

Trate username duplicado, senha incorreta, etc. com exceções tipadas
mapeadas para os status HTTP corretos (BACKEND_GUIDELINES.md §2/§4).
```

**Arquivos esperados:** `src/domain/identity/Usuario.ts`, `src/application/identity/use-cases/{RegisterUser,LoginUser}.ts`, `src/application/identity/ports/UsuarioRepository.ts`, `src/infrastructure/repositories/PrismaUsuarioRepository.ts`, `src/infrastructure/auth/*`, `src/presentation/http/routes/auth.ts`.

**Critério de aceite (Tarefa de testes virá na Tarefa 8, mas valide manualmente agora):** `POST /auth/register` cria usuário com hash (não texto plano); `POST /auth/login` retorna cookie/sessão válida; `GET /auth/me` autenticado retorna `{ id, nome, username, role }`.

---

## Tarefa 3 — Tournament (somente leitura): listar partidas

**Objetivo:** endpoint que lista as 104 partidas agrupadas por data/fase, para a tela "Partidas".

**Prompt sugerido:**
```
Leia docs/architecture/ARCHITECTURE.md §3.2/§4 (Tournament) e
docs/engineering/BACKEND_GUIDELINES.md.

Implemente:
- application/tournament/ports: PartidaRepository (interface) com método
  findAllOrderedByDate().
- infrastructure: implementação Prisma, incluindo joins para equipes
  (nome, sigla, bandeira) e fase (nomeExibicao, multiplicador).
- application/tournament/use-cases: ListMatches.
- presentation/http: rota GET /partidas, retornando cada partida com:
  id, faseNome, multiplicador, dataHoraUtc, estadio, cidade,
  equipeCasa (ou placeholderCasa), equipeFora (ou placeholderFora),
  golsCasa, golsFora, status, grupoSimultaneoId.

Esta é uma rota pública de leitura (não exige autenticação) — confirme
isso no checklist de SECURITY.md (rotas de leitura sem dado sensível
podem ficar abertas).
```

**Arquivos esperados:** `src/application/tournament/ports/PartidaRepository.ts`, `src/infrastructure/repositories/PrismaPartidaRepository.ts`, `src/application/tournament/use-cases/ListMatches.ts`, `src/presentation/http/routes/partidas.ts`.

**Critério de aceite:** `GET /partidas` retorna as 104 partidas, incluindo as com placeholder (73-104) corretamente formatadas.

---

## Tarefa 4 — Bolão: enviar/editar palpite (com bloqueio no backend)

**Objetivo:** o coração do MVP — `SubmitPrediction` com a regra de bloqueio (ADR-004) e exibição de palpites próprios + de outros (quando permitido).

**Prompt sugerido:**
```
Leia docs/architecture/DOMAIN_RULES.md §10, docs/architecture/DECISIONS_LOG.md
(ADR-004), docs/architecture/ARCHITECTURE.md §3.3/§4 (Bolão) e
docs/ai-workflow/skills/security-reviewer.md.

Implemente:
- domain/bolao: entidade Palpite (com invariante de janela de bloqueio,
  recebendo a data da partida e a janela em minutos como parâmetros —
  a regra em si é pura, não acessa o relógio nem o banco diretamente).
- application/bolao/ports: PalpiteRepository, TournamentReadPort
  (interface mínima: getPartida(id) -> {dataHoraUtc, status,
  grupoSimultaneoId}).
- application/bolao/use-cases:
  - SubmitPrediction(usuarioId, partidaId, golsCasa, golsFora):
    busca a partida via TournamentReadPort, calcula o horário-limite
    (considerando grupoSimultaneoId — usar o MENOR dataHoraUtc do
    conjunto), valida now() < limite, e faz upsert.
  - GetMyPredictions(usuarioId)
  - GetPredictionsForMatch(partidaId, usuarioId solicitante) — aplica
    regra de visibilidade: só retorna palpites de outros usuários se a
    partida já começou (status != 'agendada' OU now() >= dataHoraUtc).
- infrastructure: PrismaPalpiteRepository, PrismaTournamentReadPort
  (implementa a leitura via tabela partidas, sem expor mais nada de
  tournament — Anti-Corruption Layer, ARCHITECTURE.md §2.3).
- presentation/http: POST /palpites, GET /palpites/me,
  GET /palpites/partida/:id, com erros 409 PREDICTION_LOCKED e
  403 FORBIDDEN conforme aplicável.

Use exceções tipadas (PredictionLockedError, MatchNotFoundError).
```

**Arquivos esperados:** `src/domain/bolao/Palpite.ts`, `src/application/bolao/ports/{PalpiteRepository,TournamentReadPort}.ts`, `src/application/bolao/use-cases/{SubmitPrediction,GetMyPredictions,GetPredictionsForMatch}.ts`, `src/infrastructure/repositories/{PrismaPalpiteRepository,PrismaTournamentReadPort}.ts`, `src/presentation/http/routes/palpites.ts`.

**Critério de aceite:** envio de palpite antes do horário funciona; chamada direta à API dentro da janela de bloqueio retorna `409`; usuário não vê palpites de outros em partida ainda não iniciada.

---

## Tarefa 5 — Bolão: mercados estáticos (primeiro acesso)

**Objetivo:** formulário obrigatório de campeão/vice/3º/artilheiro no primeiro login, travado após 11/06.

**Prompt sugerido:**
```
Leia docs/architecture/DOMAIN_RULES.md §9 e
docs/product/PRODUCT_REQUIREMENTS.md §2.2.

Implemente:
- application/bolao/use-cases: SubmitStaticMarketPrediction(usuarioId,
  mercado, valor) — valida now() < dataAberturaTorneio (11/06/2026,
  configurável via env ou tabela de configuração simples) e que o
  mercado é um dos 4 válidos (campeao, vice, terceiro_lugar, artilheiro).
- application/bolao/use-cases: GetMyStaticPredictions(usuarioId) e
  HasCompletedFirstAccess(usuarioId) -> boolean (true se os 4 mercados
  já têm registro).
- presentation/http: POST /palpites-estaticos, GET /palpites-estaticos/me.
- Reaproveite PalpiteEstaticoRepository seguindo o mesmo padrão das
  tarefas anteriores.

Atenção: "terceiro_lugar" aqui é o MERCADO ESTÁTICO (3º lugar do
TORNEIO, jogo 103) — não confundir com "3º colocado de grupo"
(DOMAIN_RULES.md, nota do Glossário). Use nomes de variável que deixem
isso explícito.
```

**Arquivos esperados:** `src/application/bolao/use-cases/{SubmitStaticMarketPrediction,GetMyStaticPredictions,HasCompletedFirstAccess}.ts`, `src/infrastructure/repositories/PrismaPalpiteEstaticoRepository.ts`, `src/presentation/http/routes/palpites-estaticos.ts`.

**Critério de aceite:** os 4 mercados podem ser enviados uma vez; reenvio após "abertura" retorna erro; `HasCompletedFirstAccess` reflete corretamente o estado.

---

## Tarefa 6 — Leaderboard (Home)

**Objetivo:** ranking geral simples (soma de `pontos_obtidos` de `palpites` + `palpites_estaticos`).

**Prompt sugerido:**
```
Leia docs/architecture/ARCHITECTURE.md §3.3 (LeaderboardEntry).

Implemente application/bolao/use-cases/GetLeaderboard() que retorna,
ordenado por pontos desc:
  [{ usuarioId, nome, pontosTotais, posicao }]

pontosTotais = soma(palpites.pontos_obtidos) + soma(palpites_estaticos.pontos_obtidos),
tratando NULL como 0 (partidas/mercados ainda não avaliados).

Para o MVP, calcule sob demanda com uma query agregada (sem
materialização/cache — ROADMAP.md §3 trata isso como melhoria futura,
só se houver evidência de lentidão).

presentation/http: GET /leaderboard (rota pública ou autenticada,
decida e justifique brevemente).
```

**Arquivos esperados:** `src/application/bolao/use-cases/GetLeaderboard.ts`, rota correspondente.

**Critério de aceite:** `GET /leaderboard` retorna lista ordenada; usuários sem nenhum palpite avaliado aparecem com `pontosTotais: 0`.

---

## Tarefa 7 — Frontend: telas principais

**Objetivo:** páginas de Login/Cadastro, Primeiro Acesso, Home (leaderboard) e Partidas, consumindo as rotas das tarefas anteriores.

**Prompt sugerido:**
```
Leia docs/engineering/FRONTEND_GUIDELINES.md (especialmente §3
MatchCard, §6 fuso horário) e docs/product/PRODUCT_REQUIREMENTS.md.

Implemente, seguindo Atomic Design (frontend/src/components/{atoms,
molecules,organisms,templates,pages}):
- pages/LoginPage, pages/RegisterPage
- pages/FirstAccessPage (formulário dos 4 mercados estáticos, só
  acessível se HasCompletedFirstAccess === false e antes de 11/06)
- pages/HomePage (leaderboard)
- pages/MatchesPage:
  - organisms/MatchCard conforme a especificação completa do
    FRONTEND_GUIDELINES.md §3 (cabeçalho com horário BRT/fase/estádio,
    bandeiras+gols ou inputs de palpite, rodapé com pontuação, botão
    "ver palpites de outros")
  - agrupamento por data (BRT) conforme §6
  - estados de loading/erro/travado tratados (skill ux-reviewer)

Use os design tokens descritos no §2 do FRONTEND_GUIDELINES.md (não
hardcode cores).
```

**Arquivos esperados:** estrutura completa em `frontend/src/components/` e `frontend/src/pages/`.

**Critério de aceite:** fluxo completo manual — cadastro → primeiro acesso → home (leaderboard vazio) → partidas (lista agrupada, palpite enviável até o bloqueio).

---

## Tarefa 8 — Testes (domain crítico + E2E do bloqueio)

**Objetivo:** cobrir os casos obrigatórios de `TESTING_STRATEGY.md` que já se aplicam ao Marco 1.

**Prompt sugerido:**
```
Leia docs/engineering/TESTING_STRATEGY.md e
docs/ai-workflow/skills/test-engineer.md.

Escreva e EXECUTE os testes:
- Unitários (domain/bolao): regra de bloqueio de Palpite — antes da
  janela (sucesso), dentro da janela (rejeitado), partidas simultâneas
  (grupoSimultaneoId) usando o menor horário do conjunto.
- Integração: SubmitPrediction via use case com repositório fake,
  cobrindo os mesmos casos acima + upsert (editar palpite existente).
- E2E (se Playwright já configurado): tentar enviar palpite via chamada
  direta à API (sem UI) dentro da janela de bloqueio -> 409.

Reporte o resultado real da execução (verde/vermelho) de cada suíte.
Não inclua aqui os testes de ClassificacaoService/AnexoCLookup/
RegraPontuacao de pontuação completa — esses pertencem ao Marco 2/3
(ROADMAP.md), pois RegraPontuacao com cascata completa não é necessário
até a primeira partida terminar.
```

**Critério de aceite:** suítes executadas com resultado reportado; nenhum teste "deveria passar" sem rodar.

---

## Resumo do que fica para depois (não é Marco 1)

- `RegisterMatchResult` + `CalculateScoreForMatch` (cálculo de pontos da cascata) → Marco 2, quando a primeira partida terminar.
- `ClassificacaoService`, `TerceirosColocadosService`, `AnexoCLookup`, `GenerateKnockoutBracket` → Marco 3 (27/06), com TDD dedicado.
- Painel admin para registrar resultados e completar dados de calendário faltantes.
