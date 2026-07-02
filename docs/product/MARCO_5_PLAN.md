# MARCO_5_PLAN.md — Encerramento (19/07+)

> Marco: 5 | Período: 19/07/2026+ (disparo único pós-final) | Prioridade: média
> Derivado de: `ROADMAP.md` §1 (Marco 5), `DOMAIN_RULES.md` §9, `ARCHITECTURE.md` §3.3
> Reaproveita: `PalpiteEstaticoRepository` (Marco 1), `LeaderboardRepository`/`GetLeaderboard` (Marco 2)

## Visão geral

Último marco: avaliar os 4 mercados estáticos (campeão, vice, terceiro lugar do torneio,
artilheiro) após a final (jogo 104) ser registrada, aplicar os bônus definidos em
`DOMAIN_RULES.md` §9, e garantir que o leaderboard final reflita a soma de pontos de jogo +
bônus de mercado estático.

> ⚠️ **Glossário crítico (`DOMAIN_RULES.md` §9, nota):** "terceiro lugar" aqui é o **mercado
> estático do torneio** (vencedor do jogo 103), **não** "3º colocado de grupo" (Marco 3). O
> código já usa nomes distintos (`terceiroLugarTorneio` vs. `terceiroColocadoGrupo` — conferir
> que essa distinção é respeitada em qualquer nome de variável/arquivo novo deste marco).

Entregáveis obrigatórios:
1. Aplicação: `EvaluateStaticMarkets` (TDD) — compara os 4 mercados contra o resultado real.
2. Backend: rota admin de avaliação (idempotente).
3. Frontend: validação visual de que o leaderboard final soma jogo + mercados estáticos.

---

## Tarefa 1 — `EvaluateStaticMarkets` (Aplicação + TDD) 🔴 bloqueante

**Objetivo:** Percorrer todos os `PalpiteEstatico` e aplicar o bônus correspondente
(`DOMAIN_RULES.md` §9) comparando contra o resultado real do torneio.

**Arquivos a criar:**
- `src/application/bolao/use-cases/EvaluateStaticMarkets.ts`
- `src/application/bolao/__tests__/EvaluateStaticMarkets.test.ts`
- `src/domain/bolao/errors.ts` — adicionar `TournamentNotFinishedError`,
  `MarketsAlreadyEvaluatedError`

**Assinatura:**
```typescript
// src/application/bolao/use-cases/EvaluateStaticMarkets.ts
interface Input {
  adminId: string
  artilheiroNomeVencedor: string  // informado manualmente pelo admin — não há fonte automática
}

interface Output {
  avaliados: number
  totalBonusDistribuido: number
}

export class EvaluateStaticMarkets {
  constructor(
    private readonly tournamentRead: TournamentReadPort,   // getPartida(104), getPartida(103)
    private readonly palpiteEstaticoRepo: PalpiteEstaticoRepository,
  ) {}

  async execute(input: Input): Promise<Output>
}
```

**Fluxo:**
```
1. tournamentRead.getPartida(104) → se status != 'encerrada': TournamentNotFinishedError
2. Se algum palpite_estatico já tem pontos_obtidos não-nulo para os mercados avaliáveis:
   MarketsAlreadyEvaluatedError (avaliação é disparo único — ver Tarefa 3 sobre idempotência)
3. campeaoEquipeId = vencedor do jogo 104
   viceEquipeId     = perdedor do jogo 104
   terceiroLugarEquipeId = vencedor do jogo 103   // DOMAIN_RULES.md §9 — mercado do torneio, não de grupo
4. Para cada PalpiteEstatico:
     campeao         → valorEquipeId === campeaoEquipeId         ? +100 : 0
     vice            → valorEquipeId === viceEquipeId            ? +70  : 0
     terceiro_lugar  → valorEquipeId === terceiroLugarEquipeId   ? +40  : 0
     artilheiro      → valorTexto.trim().toLowerCase() === artilheiroNomeVencedor.trim().toLowerCase() ? +30 : 0
5. palpiteEstaticoRepo.updatePontosObtidos(id, pontos) para cada um
6. Retorna { avaliados: count, totalBonusDistribuido: soma }
```

**Casos de teste obrigatórios:**
- 4 usuários, cada um acertando um mercado diferente → cada um recebe exatamente o bônus do
  mercado que acertou (+100/+70/+40/+30), 0 nos demais.
- Usuário que erra todos os 4 mercados → todos os `pontos_obtidos` ficam 0 (não `null`,
  distinguindo "avaliado e errou" de "ainda não avaliado" — importante para a Tarefa 2/idempotência).
- Comparação de artilheiro **case-insensitive e com trim** (nome digitado pelo usuário pode
  ter variação de maiúsculas/espaços — `DOMAIN_RULES.md` não especifica normalização, mas é
  necessário para não penalizar erro de digitação trivial; documentar essa decisão inline no
  código com referência a este plano).
- Disparo antes do jogo 104 estar `encerrada` → `TournamentNotFinishedError`, nenhum palpite
  alterado.
- Disparo duplo (jogo já avaliado) → `MarketsAlreadyEvaluatedError`, nenhum palpite alterado
  na segunda chamada (idempotência — ver critério de aceite final).
- Usuário que nunca preencheu um mercado (sem `PalpiteEstatico` para aquele `mercado`) → não
  gera erro, simplesmente não há registro para avaliar (comportamento já garantido pela
  ausência de linha, não precisa tratamento especial — mas adicionar teste que comprova isso).

**Critério de aceite:** `npm test` verde para todos os casos acima.

---

## Tarefa 2 — Backend: rota admin de avaliação 🔴 bloqueante

**Arquivo:** `src/presentation/http/routes/admin.ts` — adicionar:
```
POST /admin/mercados-estaticos/avaliar
  Middlewares: authenticate, requireAdmin
  Body (Zod): { artilheiroNomeVencedor: z.string().min(1) }
  Fluxo: EvaluateStaticMarkets.execute({ adminId: user.id, artilheiroNomeVencedor }) → 200 { avaliados, totalBonusDistribuido }
  Erros: 422 TOURNAMENT_NOT_FINISHED, 409 MARKETS_ALREADY_EVALUATED
```
Registrar os dois códigos de erro em `server.ts`, mesmo padrão do Marco 2/3.

**Critério de aceite:**
```
POST /admin/mercados-estaticos/avaliar { artilheiroNomeVencedor: "Fulano" }
→ 200 { avaliados: N, totalBonusDistribuido: X }
→ palpites_estaticos.pontos_obtidos preenchido para todos os registros
→ segunda chamada → 409 MARKETS_ALREADY_EVALUATED, nada é alterado
```

---

## Tarefa 3 — Conferir soma no leaderboard 🟡

**Objetivo:** `GET /leaderboard` deve refletir pontos de jogo (`palpites.pontos_obtidos`) **e**
bônus de mercado estático (`palpites_estaticos.pontos_obtidos`) somados por usuário.

**Arquivos a revisar (não necessariamente alterar):**
- `src/infrastructure/repositories/PrismaLeaderboardRepository.ts` — conferir a query atual:
  se já agrega os dois somatórios, esta tarefa é só validação com teste de regressão; se soma
  só `palpites`, é ajuste **aditivo** (adicionar o segundo `SUM`/`LEFT JOIN` na mesma query).

**Teste a adicionar (se ainda não existir):**
- Usuário com pontos de partida conhecidos + bônus de mercado estático conhecidos →
  `GetLeaderboard` retorna o total exato (soma dos dois).

**Critério de aceite:** teste de integração comprova que o total do leaderboard = soma de
`palpites.pontos_obtidos` + `palpites_estaticos.pontos_obtidos` do usuário.

---

## Tarefa 4 — Frontend: informar artilheiro + exportação (opcional) 🟢

**Objetivo:** Tela mínima para o admin disparar a avaliação sem terminal.

**Arquivos a criar/alterar:**
| Arquivo | Ação |
|---|---|
| `frontend/src/lib/api.ts` | adicionar `api.admin.evaluateStaticMarkets(artilheiroNomeVencedor: string)` |
| `frontend/src/pages/AdminPage.tsx` | seção "Encerramento" — campo de texto (nome do artilheiro) + botão "Avaliar mercados estáticos", habilitado só quando o jogo 104 está `encerrada` |

**Opcional (`ROADMAP.md` §3, "melhorias sugeridas" — só se sobrar tempo, não bloqueante):**
- Botão "Exportar ranking" no `HomePage`/`ClassificacaoPage` gerando CSV do leaderboard final
  (`nome, posição, pontos`) via `Blob`/`URL.createObjectURL`, sem dependência nova.

**Critério de aceite:** admin informa o artilheiro e dispara a avaliação pela UI; leaderboard
final visível sem uso de terminal/curl.

---

## Dependências entre tarefas

```
Tarefa 1 — EvaluateStaticMarkets (aplicação + domínio)
  └─► Tarefa 2 — rota admin
        ├─► Tarefa 3 — validação do leaderboard (pode ser feita em paralelo, é só query)
        └─► Tarefa 4 — frontend admin
```

---

## Critério de aceite final do Marco 5

- [ ] `npm test` verde, incluindo `EvaluateStaticMarkets` com os 4 mercados e o caso de
      idempotência (segunda chamada rejeitada).
- [ ] Após avaliação, `GET /leaderboard` reflete pontos de jogo + bônus de mercados estáticos
      somados corretamente para todos os usuários.
- [ ] Avaliação bloqueada em segunda execução — bônus nunca é somado em dobro.
- [ ] Distinção `terceiroLugarTorneio` (jogo 103) vs. `terceiroColocadoGrupo` (Marco 3)
      respeitada em todo nome de variável/rota/arquivo criado neste marco.
- [ ] `git push` com commit `feat(marco5): tarefa N — <resumo>` após cada tarefa concluída.
