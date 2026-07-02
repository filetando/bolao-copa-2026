# MARCO_4_PLAN.md — Mata-mata (28/06–19/07)

> Marco: 4 | Período: 28/06–19/07/2026 | Prioridade: alta (torneio em andamento)
> Derivado de: `ROADMAP.md` §1 (Marco 4), `DOMAIN_RULES.md` §6/§8, `ARCHITECTURE.md` §3.2,
> reaproveita Marco 2 (`RegraPontuacao`, `RegisterMatchResult`, `CalculateScoreForMatch`) e
> Marco 3 (`PartidaRepository.updateEquipesResolvidas`, `BracketGeneratorService`).

## Visão geral

Mesmo fluxo operacional do Marco 2 (admin registra placar → pontos calculados →
leaderboard atualiza), agora para os jogos 73–104, com duas diferenças centrais:

1. **Multiplicador não é mais ×1** — `RegraPontuacao`/`Fase.multiplicador` já suportam isso
   (Marco 2), só falta um teste de regressão explícito cobrindo ×1.5/×2/×4 em produção real.
2. **Vencedor precisa propagar para a rodada seguinte** — `BracketGeneratorService` (Marco 3)
   só resolve os jogos 73–88 a partir da classificação de grupos. A partir daí (jogos 89–104),
   quem alimenta cada partida é sempre "vencedor/perdedor de outro jogo do mata-mata", então
   é preciso generalizar essa propagação (`ROADMAP.md` Marco 4 pede isso explicitamente).

Entregáveis obrigatórios:
1. Domínio: `BracketPropagationService` (TDD) — generaliza "Venc./Perd. Jogo X" para 89–104.
2. Aplicação: `RegisterMatchResult` estendido (suporte a pênaltis) + disparo da propagação.
3. Frontend: página pública `/mata-mata` com árvore visual do chaveamento até a final.

---

## Tarefa 1 — Mapa de dependências do chaveamento (dado estático) 🔴 bloqueante

**Objetivo:** Extrair a estrutura "quem alimenta quem" dos jogos 89–104
(`bolao-copa-2026_1.md` §6) para um dado estático, no mesmo padrão de
`confrontos_terceiros.json` — não hardcodar isso dentro do serviço de domínio.

**Arquivo a criar:** `docs/architecture/bracket_dependencias.json`

```json
{
  "89":  { "casa": { "tipo": "vencedor", "jogo": 74 }, "fora": { "tipo": "vencedor", "jogo": 77 } },
  "90":  { "casa": { "tipo": "vencedor", "jogo": 73 }, "fora": { "tipo": "vencedor", "jogo": 75 } },
  "91":  { "casa": { "tipo": "vencedor", "jogo": 76 }, "fora": { "tipo": "vencedor", "jogo": 78 } },
  "92":  { "casa": { "tipo": "vencedor", "jogo": 79 }, "fora": { "tipo": "vencedor", "jogo": 80 } },
  "93":  { "casa": { "tipo": "vencedor", "jogo": 83 }, "fora": { "tipo": "vencedor", "jogo": 84 } },
  "94":  { "casa": { "tipo": "vencedor", "jogo": 81 }, "fora": { "tipo": "vencedor", "jogo": 82 } },
  "95":  { "casa": { "tipo": "vencedor", "jogo": 86 }, "fora": { "tipo": "vencedor", "jogo": 88 } },
  "96":  { "casa": { "tipo": "vencedor", "jogo": 85 }, "fora": { "tipo": "vencedor", "jogo": 87 } },
  "97":  { "casa": { "tipo": "vencedor", "jogo": 89 }, "fora": { "tipo": "vencedor", "jogo": 90 } },
  "98":  { "casa": { "tipo": "vencedor", "jogo": 93 }, "fora": { "tipo": "vencedor", "jogo": 94 } },
  "99":  { "casa": { "tipo": "vencedor", "jogo": 91 }, "fora": { "tipo": "vencedor", "jogo": 92 } },
  "100": { "casa": { "tipo": "vencedor", "jogo": 95 }, "fora": { "tipo": "vencedor", "jogo": 96 } },
  "101": { "casa": { "tipo": "vencedor", "jogo": 97 }, "fora": { "tipo": "vencedor", "jogo": 98 } },
  "102": { "casa": { "tipo": "vencedor", "jogo": 99 }, "fora": { "tipo": "vencedor", "jogo": 100 } },
  "103": { "casa": { "tipo": "perdedor", "jogo": 101 }, "fora": { "tipo": "perdedor", "jogo": 102 } },
  "104": { "casa": { "tipo": "vencedor", "jogo": 101 }, "fora": { "tipo": "vencedor", "jogo": 102 } }
}
```

> Conferir os valores linha a linha contra a tabela de `bolao-copa-2026_1.md` §6 antes de
> commitar — este bloco foi transcrito da mesma fonte usada no `DOMAIN_RULES.md` §6, mas é
> dado crítico e deve ser revisado por olho humano (mesmo cuidado do Anexo C).

**Critério de aceite:** revisão humana linha a linha confirma que bate com a tabela oficial.

---

## Tarefa 2 — `BracketPropagationService` (Domínio + TDD) 🔴 bloqueante

**Objetivo:** Dado o resultado de uma partida do mata-mata encerrada, calcular quais outras
partidas devem ser atualizadas (e em qual lado — casa/fora).

**Arquivos a criar:**
- `src/domain/tournament/BracketPropagationService.ts`
- `src/domain/tournament/__tests__/BracketPropagationService.test.ts`

**Assinatura:**
```typescript
// src/domain/tournament/BracketPropagationService.ts
export interface DependenciaJogo {
  casa: { tipo: 'vencedor' | 'perdedor'; jogo: number }
  fora: { tipo: 'vencedor' | 'perdedor'; jogo: number }
}

export interface ResolucaoPropagacao {
  partidaId: number
  lado: 'casa' | 'fora'
  equipeId: number
}

export class BracketPropagationService {
  // DOMAIN_RULES.md §6 — generaliza a propagação Venc./Perd. Jogo X para 89–104
  constructor(private readonly dependencias: Record<string, DependenciaJogo>) {}

  resolverProximaRodada(
    partidaEncerrada: { id: number; equipeCasaId: number; equipeForaId: number; vencedorEquipeId: number },
  ): ResolucaoPropagacao[]
  // Varre o mapa de dependências procurando jogos que referenciam partidaEncerrada.id
  // (como vencedor OU perdedor) e retorna as atualizações correspondentes.
  // Um jogo encerrado pode alimentar até 2 partidas diferentes (ex.: 101 alimenta 103 como
  // perdedor E 104 como vencedor) — o método retorna todas.
}
```

**Casos de teste obrigatórios:**
- Jogo 74 encerrado (vencedor = equipeX) → jogo 89 recebe `equipeCasaId = X`.
- Jogo 77 encerrado (vencedor = equipeY) → jogo 89 recebe `equipeForaId = Y`.
- Jogo 101 encerrado (vencedor = equipeZ, perdedor = equipeW) → retorna **duas** resoluções:
  jogo 104 lado casa = Z, jogo 103 lado casa = W (fan-out para 2 partidas diferentes — caso
  mais importante deste serviço, análogo à reiteração em `ClassificacaoService`).
- Jogo sem nenhuma dependência posterior (ex.: 104, a final) → retorna lista vazia.
- Jogo de fase de grupos (1–72) → retorna lista vazia (esses nunca alimentam o mapa de
  dependências; garante que o serviço não é chamado incorretamente fora do mata-mata).

**Critério de aceite:** `npm test` verde para todos os casos acima.

---

## Tarefa 3 — `RegisterMatchResult` estendido para pênaltis 🔴 bloqueante

**Objetivo:** A partir das oitavas (jogo 89+), empate no tempo normal vai a prorrogação e
pênaltis (`DOMAIN_RULES.md` §6). O placar registrado para pontuação continua sendo o do tempo
normal (`RegraPontuacao` não muda), mas o sistema precisa saber quem venceu de fato para
propagar. Isso é **mudança de schema aditiva** (`AGENTS.md` §10 — aditiva, não precisa de
aprovação prévia, mas deve ser documentada em `DATABASE.md` no mesmo commit).

### 3a. Migration aditiva

Nova coluna em `partidas`:
```sql
ALTER TABLE partidas ADD COLUMN vencedor_penaltis_equipe_id INTEGER NULL
  REFERENCES equipes(id);
-- Preenchida apenas quando fase != 'grupos' E gols_casa = gols_fora no tempo normal.
```
Atualizar `prisma/schema.prisma` (`Partida.vencedorPenaltisEquipeId Int? @map("vencedor_penaltis_equipe_id")`)
e `docs/architecture/DATABASE.md` §2.5 no mesmo commit.

### 3b. Estender `RegisterMatchResult`

Arquivo: `src/application/tournament/use-cases/RegisterMatchResult.ts`

```typescript
interface Input {
  adminId: string
  partidaId: number
  golsCasa: number
  golsFora: number
  vencedorPenaltisEquipeId?: number  // obrigatório apenas se fase != grupos E golsCasa === golsFora
}
```
- Se `fase !== 'grupos'` e `golsCasa === golsFora` e `vencedorPenaltisEquipeId` ausente →
  `PenaltyWinnerRequiredError` (novo erro em `src/domain/tournament/errors.ts`).
- Se fornecido mas a partida é da fase de grupos ou não houve empate → ignorar campo
  (fase de grupos não tem prorrogação/pênaltis, `DOMAIN_RULES.md` §2).
- Após `partidaRepo.registerResult(...)`, calcular `vencedorEquipeId` final:
  `golsCasa !== golsFora ? (golsCasa > golsFora ? equipeCasaId : equipeForaId) : vencedorPenaltisEquipeId`.
- Chamar `BracketPropagationService.resolverProximaRodada({ id, equipeCasaId, equipeForaId, vencedorEquipeId })`
  e persistir via `partidaRepo.updateEquipesResolvidas(...)` (já existe desde o Marco 3) —
  **mesma transação** do registro do resultado (`DATABASE.md` §4).

### 3c. Rota admin

Arquivo: `src/presentation/http/routes/admin.ts` — estender o body Zod de
`POST /admin/partidas/:id/resultado`:
```typescript
const RegisterResultBodySchema = z.object({
  golsCasa: z.number().int().min(0),
  golsFora: z.number().int().min(0),
  vencedorPenaltisEquipeId: z.number().int().optional(),
})
```
Mapear `PENALTY_WINNER_REQUIRED` → 422 em `server.ts`.

**Casos de teste obrigatórios:**
- Jogo de mata-mata empatado sem `vencedorPenaltisEquipeId` → `PenaltyWinnerRequiredError`.
- Jogo de mata-mata empatado com `vencedorPenaltisEquipeId` → propaga o vencedor certo para a
  próxima rodada (via `BracketPropagationService`, teste de integração com repo fake).
- Jogo 101/102 (semifinais) resolvido com pênaltis → jogo 103 (perdedor) **e** 104 (vencedor)
  ambos atualizados corretamente na mesma chamada.
- Jogo de grupos com empate → nunca exige `vencedorPenaltisEquipeId` (regressão).
- Multiplicador ×1.5 (16-avos/oitavas), ×2 (quartas/semis/3º lugar), ×4 (final) aplicado
  corretamente por `RegraPontuacao` já existente — teste de regressão explícito reusando os
  casos de `TESTING_STRATEGY.md` §2.5, agora com dado de partida real do mata-mata.

**Critério de aceite:** `npm test` verde; registrar resultado de jogo de mata-mata propaga a
próxima rodada corretamente, inclusive em pênaltis e em fan-out (semifinal → final + 3º lugar).

---

## Tarefa 4 — Backend: endpoint de leitura do mata-mata 🟡

**Objetivo:** Expor os jogos 73–104 já com fase/rodada para a página de bracket.

**Arquivos a criar/alterar:**
- `src/application/tournament/ports/PartidaRepository.ts` — adicionar
  `findMataMata(): Promise<PartidaListItem[]>` (mesma forma de `PartidaListItem` já usada em
  `findAllOrderedByDate`, filtrando `fase_id != 'grupos'`, ordenado por `id`).
- `src/application/tournament/use-cases/ListMataMataMatches.ts` (novo, mesmo padrão de
  `ListMatches.ts`).
- `src/presentation/http/routes/partidas.ts` — nova rota `GET /mata-mata` (autenticado,
  qualquer usuário — sem `requireAdmin`, é leitura pública do bracket).

**Critério de aceite:** `GET /mata-mata` retorna as 32 partidas (73–104) com
`equipeCasa`/`equipeFora`/`placeholderCasa`/`placeholderFora`/`status`/`golsCasa`/`golsFora`.

---

## Tarefa 5 — Frontend: página visual do bracket (`/mata-mata`) 🟡

**Objetivo:** Árvore de chaveamento do mata-mata, visível a qualquer usuário logado, cobrindo
os 32 jogos (73–104) desde 16-avos até a final, com placeholders enquanto não resolvidos e
vencedores propagando visualmente.

**Arquivos a criar:**
| Arquivo | Descrição |
|---|---|
| `frontend/src/pages/BracketPage.tsx` | página, busca `GET /mata-mata` |
| `frontend/src/components/organisms/BracketTree.tsx` | árvore de chaveamento |
| `frontend/src/components/molecules/BracketMatchNode.tsx` | um confronto compacto na árvore |
| `frontend/src/lib/api.ts` | adicionar `api.mataMata.list()` |
| `frontend/src/router.tsx` | rota `/mata-mata` dentro do grupo `ProtectedRoute`/`MainLayout` |
| `frontend/src/components/templates/MainLayout.tsx` | link "Mata-mata" na navegação |

**Estrutura da árvore (`BracketTree.tsx`):**
- Agrupar as 32 partidas por `faseNome`/rodada, na ordem: 16-avos (73–88, 16 jogos) → oitavas
  (89–96, 8 jogos) → quartas (97–100, 4 jogos) → semifinal (101–102, 2 jogos) → final (104,
  1 jogo). O jogo 103 (3º lugar) é renderizado **separado**, abaixo/ao lado da árvore
  principal — ele não alimenta nenhuma rodada seguinte (`DOMAIN_RULES.md` §6), misturá-lo na
  coluna da final confundiria a leitura do chaveamento.
- Desktop (`lg:`+): colunas lado a lado (uma por rodada), linhas conectoras entre um jogo e o
  seguinte que ele alimenta (usar `bracket_dependencias.json` no frontend também, ou apenas
  disposição posicional fixa já que a ordem de `bolao-copa-2026_1.md` §6 é determinística).
- Mobile: scroll horizontal com **snap por rodada** (uma coluna por vez, indicador de rodada
  atual) — mobile-first conforme `DESIGN_SYSTEM.md` §7, mesmo padrão já usado em
  `ClassificacaoPage.tsx` para grades largas em telas pequenas.

**`BracketMatchNode.tsx` (confronto individual, compacto):**
- Reaproveita `FlagIcon`/`Badge` (`components/atoms/`) já migrados no design system atual —
  não recriar.
- Estados visuais (mesmo espírito de `MatchCard`, mas **sem inputs de palpite** — este
  componente é só leitura/visualização do chaveamento; o palpite continua exclusivamente em
  `MatchesPage`/`MatchCard`):
  - **Pendente:** `placeholderCasa`/`placeholderFora` (texto, ex. "Vencedor Jogo 73") quando
    `equipeCasa`/`equipeFora` são `null` (`FRONTEND_GUIDELINES.md` §7 — nenhuma mudança de
    componente necessária além deste, o dado já vem certo do backend).
  - **Definido, aguardando:** bandeira + sigla dos dois times, sem placar.
  - **Encerrado:** placar final + time vencedor com destaque visual (peso de fonte/cor
    `--color-accent`, token já definido em `index.css`) avançando para a próxima coluna.
- Acessibilidade: bandeiras com `alt`/`aria-label` (mesma regra de `FRONTEND_GUIDELINES.md`
  §5 já aplicada em `MatchCard`).

**Critério de aceite:**
- `/mata-mata` acessível a qualquer usuário autenticado (não precisa ser admin).
- Antes da geração do bracket (Marco 3 não disparado ainda): árvore inteira em placeholders
  textuais, sem quebrar layout.
- Após `GenerateKnockoutBracket` (Marco 3): jogos 73–88 mostram times reais.
- Conforme admin registra resultados de mata-mata (Tarefa 3 deste marco): vencedores avançam
  visualmente na árvore sem reload manual da página sendo obrigatório para nova visita
  (polling ou refetch ao focar a aba é suficiente — não é exigido WebSocket, YAGNI conforme
  `ARCHITECTURE.md` §0).

---

## Dependências entre tarefas

```
Tarefa 1 — bracket_dependencias.json (dado estático, standalone)
  └─► Tarefa 2 — BracketPropagationService (domínio puro)
        └─► Tarefa 3 — RegisterMatchResult estendido (usa Tarefa 2 + migration 3a)
              └─► Tarefa 4 — GET /mata-mata (leitura, pode ser paralela à Tarefa 3)
                    └─► Tarefa 5 — Frontend BracketPage
```

---

## Critério de aceite final do Marco 4

- [ ] `npm test` verde, incluindo `BracketPropagationService` (fan-out de semifinal → 103+104)
      e `RegisterMatchResult` estendido (pênaltis).
- [ ] Registrar resultado de qualquer jogo do mata-mata propaga o(s) vencedor(es)/perdedor(es)
      para a(s) partida(s) seguinte(s) automaticamente, sem ação manual adicional do admin.
- [ ] Multiplicadores ×1.5/×2/×4 confirmados por teste de regressão explícito.
- [ ] `/mata-mata` mostra a árvore completa 73–104 (+ jogo 103 separado), atualizando
      visualmente conforme os jogos são encerrados.
- [ ] `DATABASE.md` atualizado com a coluna `vencedor_penaltis_equipe_id`.
- [ ] `git push` com commit `feat(marco4): tarefa N — <resumo>` após cada tarefa concluída.
