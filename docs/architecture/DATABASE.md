# DATABASE.md

> **Quando atualizar:** toda vez que uma entidade do `ARCHITECTURE.md` mudar de forma, um novo índice for necessário, ou uma migration for criada/alterada.
> **Responsável:** quem cria a migration (deve atualizar este doc no mesmo PR — ver checklist "antes de criar migrations" em `AGENTS.md`).
> **Banco:** PostgreSQL (ADR-001). Convenção de nomes: `snake_case`, tabelas no plural.

---

## 1. Visão geral do modelo (ER simplificado)

```
usuarios ──< palpites >── partidas ──< partidas_grupos >── grupos ──< grupos_equipes >── equipes
   │                          │
   └──< palpites_estaticos    └── (FK fase_id) fases

confrontos_terceiros (tabela de referência estática, sem FKs — ver Anexo C)
```

---

## 2. Tabelas

### 2.1 `usuarios` (Bounded Context: identity)

| Coluna | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| nome | VARCHAR(120) NOT NULL | exibido em toda a aplicação |
| username | VARCHAR(60) UNIQUE NOT NULL | usado no login |
| password_hash | VARCHAR(255) NOT NULL | Argon2id (ver `SECURITY.md`) — **nunca** texto plano |
| role | VARCHAR(20) NOT NULL DEFAULT 'user' | `user` \| `admin` |
| created_at | TIMESTAMPTZ NOT NULL DEFAULT now() | |

Índice: `UNIQUE (username)`.

### 2.2 `equipes` (tournament)

| Coluna | Tipo | Notas |
|---|---|---|
| id | SERIAL PK | |
| nome | VARCHAR(80) NOT NULL | |
| sigla | CHAR(3) | ex: BRA |
| bandeira_codigo | VARCHAR(10) | código ISO p/ renderizar bandeira no front |
| grupo_id | CHAR(1) NOT NULL | FK → `grupos.id` (A–L) |

### 2.3 `grupos` (tournament)

| Coluna | Tipo | Notas |
|---|---|---|
| id | CHAR(1) PK | A–L |

> Grupo não precisa de outras colunas — estatísticas (V/E/D/SG/Pts/FairPlay) são **derivadas** das `partidas` finalizadas via `ClassificacaoService`, não armazenadas como fonte de verdade (evita inconsistência: nunca há dois lugares "donos" do mesmo dado).
>
> Opcional (performance, fase 2): tabela `classificacao_cache` materializada, recalculada a cada `MatchFinished` de uma partida de grupo — só adicionar se houver evidência de lentidão (Knuth, Guia Seção 5).

### 2.4 `fases` (tournament — tabela de referência estática)

| Coluna | Tipo | Notas |
|---|---|---|
| id | VARCHAR(20) PK | `grupos`, `16avos`, `oitavas`, `quartas`, `semifinal`, `terceiro_lugar`, `final` |
| nome_exibicao | VARCHAR(40) | "Fase de Grupos", "16-Avos de Final", ... |
| multiplicador | NUMERIC(3,1) NOT NULL | 1, 1.5, 2, 4 — ver `DOMAIN_RULES.md` §8 |
| ordem | SMALLINT | usado para ordenação visual |

### 2.5 `partidas` (tournament)

| Coluna | Tipo | Notas |
|---|---|---|
| id | SMALLINT PK | 1–104, conforme numeração oficial |
| fase_id | VARCHAR(20) NOT NULL | FK → `fases.id` |
| grupo_id | CHAR(1) NULL | FK → `grupos.id`; NULL para mata-mata |
| equipe_casa_id | INTEGER NULL | FK → `equipes.id`; NULL se ainda não resolvido (ex: "Vencedor Jogo 73") |
| equipe_fora_id | INTEGER NULL | idem |
| placeholder_casa | VARCHAR(60) NULL | texto exibido enquanto `equipe_casa_id` é NULL, ex: `"Vencedor Jogo 73"`, `"Melhor 3º (A/B/C/D/F)"` |
| placeholder_fora | VARCHAR(60) NULL | idem |
| gols_casa | SMALLINT NULL | preenchido ao registrar resultado |
| gols_fora | SMALLINT NULL | |
| status | VARCHAR(20) NOT NULL DEFAULT 'agendada' | `agendada` \| `ao_vivo` \| `encerrada` |
| data_hora_utc | TIMESTAMPTZ NOT NULL | sempre UTC |
| estadio | VARCHAR(80) | |
| cidade | VARCHAR(60) | |
| grupo_simultaneo_id | SMALLINT NULL | agrupa partidas que travam juntas (ex: rodada R3); se preenchido, o horário-limite de palpite é o **menor** `data_hora_utc` do grupo |

Índices:
- `idx_partidas_data_hora` em `data_hora_utc` (consulta "partidas de hoje", verificação de bloqueio pelo cron).
- `idx_partidas_fase` em `fase_id`.
- `idx_partidas_status` em `status` (cron busca partidas `agendada` próximas do horário).

> ⚠️ Checklist do guia (Seção 2): "queries com índice nos filtros frequentes" — os 3 índices acima cobrem os filtros mais comuns (cron de bloqueio, listagem por data, listagem por fase).

#### 2.5.1 Fonte de dados e conversão para UTC (fase de grupos, jogos 1–72)

- **Fonte:** `docs/architecture/calendario_fase_grupos.md` (substitui, para os jogos 1–72, a tabela parcial da Seção 8 de `bolao-copa-2026_1.md`). Verificado: 72 jogos, 12 grupos × 6 jogos, round-robin completo (cada equipe joga as outras 3 do grupo exatamente uma vez).
- **Seed pronto:** `seed-data/equipes.json` (48 equipes) e `seed-data/partidas_fase_grupos.json` (72 partidas, `id` 1–72 em ordem cronológica).
- **Regra de conversão UTC:** a coluna "Horário ET" da fonte é tratada como o horário de referência canônico (ET = UTC-4, horário de verão dos EUA vigente em junho/julho). `data_hora_utc = data + horário_ET + 4h` (com rolagem de dia para os horários no formato `00h00+1`). A coluna "Horário BRT" da fonte **não é usada** — ela contém inconsistências de cálculo em várias linhas; o frontend deriva BRT a partir do `data_hora_utc` (UTC-3, fixo) conforme `FRONTEND_GUIDELINES.md` §6, garantindo consistência.
- Os jogos 73–104 ainda não têm uma fonte de datas completa (`bolao-copa-2026_1.md` §9 tem lacunas nos jogos 80–85) — ver `MARCO_1_PLAN.md`, Tarefa 1, para o tratamento provisório.

### 2.6 `palpites` (bolao)

| Coluna | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| usuario_id | UUID NOT NULL | FK → `usuarios.id` |
| partida_id | SMALLINT NOT NULL | FK → `partidas.id` |
| gols_casa_palpite | SMALLINT NOT NULL | |
| gols_fora_palpite | SMALLINT NOT NULL | |
| pontos_obtidos | SMALLINT NULL | calculado após `MatchFinished`, NULL antes disso |
| created_at | TIMESTAMPTZ NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ NOT NULL DEFAULT now() | |

Restrições:
- `UNIQUE (usuario_id, partida_id)` — um palpite por usuário por partida (upsert ao editar).
- Checagem de janela de bloqueio é feita na **aplicação** (não dá para expressar "5 min antes de `partidas.data_hora_utc`" de forma portátil só com `CHECK`), mas pode-se adicionar um trigger `BEFORE INSERT/UPDATE` como camada extra de defesa em profundidade (opcional, fase 2).

Índices:
- `idx_palpites_partida` em `partida_id` (para "ver palpites de todos nesta partida").
- `idx_palpites_usuario` em `usuario_id` (perfil do usuário, leaderboard).

### 2.7 `palpites_estaticos` (bolao)

| Coluna | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| usuario_id | UUID NOT NULL | FK → `usuarios.id` |
| mercado | VARCHAR(20) NOT NULL | `campeao` \| `vice` \| `terceiro_lugar` \| `artilheiro` |
| valor_equipe_id | INTEGER NULL | FK → `equipes.id`, usado para campeão/vice/terceiro |
| valor_texto | VARCHAR(80) NULL | usado para artilheiro (nome do jogador, texto livre ou FK futura para tabela `jogadores`) |
| pontos_obtidos | SMALLINT NULL | preenchido em 19/07 |
| travado_em | TIMESTAMPTZ NOT NULL DEFAULT now() | |

Restrições: `UNIQUE (usuario_id, mercado)`.

### 2.8 `confrontos_terceiros` (tournament — Anexo C, dado estático)

> Já especificada e populada em `confrontos_terceiros.sql` / `.csv` / `.json` (gerados a partir do Anexo C oficial da FIFA — ver entrega anterior). Reproduzida aqui para referência:

```sql
CREATE TABLE confrontos_terceiros (
    id          SERIAL PRIMARY KEY,
    combinacao  CHAR(8)  NOT NULL UNIQUE, -- 8 letras ordenadas alfabeticamente, ex: 'CDEFGHIJ'
    vs_1a       CHAR(1)  NOT NULL,
    vs_1b       CHAR(1)  NOT NULL,
    vs_1d       CHAR(1)  NOT NULL,
    vs_1e       CHAR(1)  NOT NULL,
    vs_1g       CHAR(1)  NOT NULL,
    vs_1i       CHAR(1)  NOT NULL,
    vs_1k       CHAR(1)  NOT NULL,
    vs_1l       CHAR(1)  NOT NULL
);
CREATE INDEX idx_confrontos_terceiros_combinacao ON confrontos_terceiros (combinacao);
```

Carga inicial: importar `confrontos_terceiros.sql` (495 linhas) via migration de seed, **uma única vez**, marcada como dado de referência imutável (não editar manualmente).

---

## 3. Relacionamentos N:N

- `usuarios` ↔ `partidas` via `palpites` (com atributos próprios — pontos, placares — por isso é uma **tabela associativa real**, não uma tabela de junção pura).
- `usuarios` ↔ `equipes`/mercados via `palpites_estaticos`, mesma lógica.

> Guia Seção 2 alerta contra modelar N:N "via listas literais" (ex.: array de IDs em uma coluna JSON). Aqui ambos os relacionamentos N:N viram tabelas próprias com FKs e `UNIQUE` compostas — modelo relacional correto.

---

## 4. Transações

Operações que precisam de atomicidade (Guia Seção 2):

- `RegisterMatchResult`: grava `gols_casa/gols_fora` + status `encerrada` em `partidas` **e** atualiza `pontos_obtidos` de todos os `palpites` daquela partida → **uma única transação**. Se a parte de cálculo de pontos falhar, o resultado da partida não pode ficar gravado sem os pontos calculados (evita estado inconsistente no leaderboard).
- `GenerateKnockoutBracket`: atualiza `equipe_casa_id`/`equipe_fora_id`/`placeholder_*` de até 16 partidas (73–88) → uma transação única (tudo ou nada).
- `SubmitPrediction`: `INSERT ... ON CONFLICT (usuario_id, partida_id) DO UPDATE` (upsert) — atômico por natureza no Postgres, mas a checagem de horário deve ocorrer **dentro** da mesma transação/request, lendo `partidas.data_hora_utc` com `SELECT ... FOR SHARE` se houver preocupação de corrida com `RegisterMatchResult` mudando o status simultaneamente (baixo risco neste domínio, mas documentar a decisão).

---

## 5. Migrations — convenções

- Uma migration por mudança lógica (não agrupar "criar tabela X" + "alterar tabela Y não relacionada" na mesma migration).
- Toda migration de schema vem acompanhada de atualização deste arquivo no mesmo commit/PR.
- Seeds (times, grupos, calendário, `confrontos_terceiros`) ficam em migrations/seeds **separadas** do schema, claramente nomeadas (`seed_*`), para poder re-rodar em ambiente de teste sem recriar o schema.
