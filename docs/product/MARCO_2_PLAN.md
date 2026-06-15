# MARCO_2_PLAN.md — Operação da Fase de Grupos

> Marco: 2 | Período: 11/06–27/06/2026 | Prioridade: alta (torneio em andamento)
> Derivado de: ROADMAP.md §1 (Marco 2), DOMAIN_RULES.md §6–§7, ARCHITECTURE.md §2

## Visão geral

O Marco 2 entrega a capacidade de registrar resultados e calcular pontuação em tempo real
durante os 72 jogos da fase de grupos. É desbloqueado pelo MVP (Marco 1) e bloqueia
o Marco 3 (virada para o mata-mata em 27/06).

Entregáveis obrigatórios:
1. Domínio: `RegraPontuacao` (lógica pura de pontuação, testada via TDD)
2. Backend: `RegisterMatchResult` + `CalculateScoreForMatch` (use cases + rota admin)
3. Frontend: painel admin para registrar resultados

Entregável opcional (se houver tempo antes de 27/06):
4. `ClassificacaoService` + tela de classificação por grupo

---

## Tarefa 1 — RegraPontuacao (Domínio + Testes) 🔴 bloqueante

**Objetivo:** Implementar a cascata de pontuação de DOMAIN_RULES.md §7 como serviço de domínio
puro (sem banco, sem HTTP) e cobri-la com testes antes de usar em produção.

**Arquivos a criar:**
- `src/domain/bolao/RegraPontuacao.ts`
- `src/domain/bolao/__tests__/RegraPontuacao.test.ts`

**Especificação da cascata (DOMAIN_RULES.md §7):**

```
1. Placar exato                                               → 25 pts base
2. Vencedor correto + gols do vencedor batem (perdedor errado) → 18 pts base
3. Vencedor correto + saldo de gols bate (placar não)          → 15 pts base
4. Empate palpitado + resultado empate, placares diferentes    → 15 pts base
5. Só vencedor correto (sem acertar gols nem saldo)            → 10 pts base
6. Erro                                                        →  0 pts
```

Pontuação final = `Math.round(pts_base × multiplicador)`.
O multiplicador vem de `Fase.multiplicador` (Decimal no Prisma, convertido para `number`):
×1 (grupos), ×1.5 (16-avos/oitavas), ×2 (quartas/semis/3º lugar), ×4 (final).

**Assinatura:**
```typescript
// src/domain/bolao/RegraPontuacao.ts
export class RegraPontuacao {
  // DOMAIN_RULES.md §7
  static calcular(
    palpite:    { golsCasa: number; golsFora: number },
    resultado:  { golsCasa: number; golsFora: number },
    multiplicador: number,
  ): number
}
```

**Casos de teste obrigatórios (TESTING_STRATEGY.md §2.4–2.5):**

| Caso | Resultado | Palpite | Mult | Pontos esperados |
|---|---|---|---|---|
| Placar exato | 2×1 | 2×1 | 1 | 25 |
| Vencedor + gols do vencedor | 2×1 | 2×0 | 1 | 18 |
| Vencedor + saldo bate | 2×0 | 3×1 | 1 | 15 |
| Empate × empate, placar diferente | 1×1 | 2×2 | 1 | 15 |
| Só vencedor | 2×0 | 1×0 | 1 | 10 |
| Vencedor errado | 2×1 | 0×1 | 1 | 0 |
| Palpite empate, resultado vitória (fronteira) | 2×1 | 1×1 | 1 | 0 |
| Multiplicador ×2 com placar exato | 2×1 | 2×1 | 2 | 50 |
| Multiplicador ×1.5 com só vencedor | 2×0 | 1×0 | 1.5 | 15 |

**Critério de aceite:** `npm test` verde para todos os casos acima.

---

## Tarefa 2 — RegisterMatchResult + CalculateScoreForMatch (Backend) 🔴 bloqueante

**Objetivo:** Use cases + rota admin para registrar o placar oficial de uma partida e
disparar o cálculo de pontuação de todos os palpites daquela partida.

### 2a. Atualizar PartidaRepository (port)

Arquivo: `src/application/tournament/ports/PartidaRepository.ts`

Adicionar:
```typescript
registerResult(id: number, golsCasa: number, golsFora: number): Promise<void>
// Atualiza gols_casa, gols_fora e status='encerrada' atomicamente.
```

### 2b. Estender TournamentReadPort (ACL bolao → tournament)

Arquivo: `src/application/bolao/ports/TournamentReadPort.ts`

Estender `PartidaInfo` com os campos necessários para calcular pontuação:
```typescript
interface PartidaInfo {
  id: number
  dataHoraUtc: Date
  status: string
  grupoSimultaneoId: number | null
  golsCasa: number | null      // ← novo
  golsFora: number | null      // ← novo
  multiplicador: number        // ← novo (de Fase.multiplicador)
}
```

### 2c. Criar use case RegisterMatchResult

Arquivo: `src/application/tournament/use-cases/RegisterMatchResult.ts`

```
Input:  { adminId: string; partidaId: number; golsCasa: number; golsFora: number }
Output: void

Fluxo:
  1. partidaRepo.findById(partidaId) → se não existir: MatchNotFoundError
  2. Se status === 'encerrada'       → MatchAlreadyFinishedError
  3. partidaRepo.registerResult(partidaId, golsCasa, golsFora)
```

### 2d. Criar use case CalculateScoreForMatch

Arquivo: `src/application/bolao/use-cases/CalculateScoreForMatch.ts`

```
Input:  { partidaId: number }
Output: { count: number; totalPontos: number }

Fluxo:
  1. tournament.getPartida(partidaId)
       → se não existir: MatchNotFoundError
       → se status != 'encerrada' ou golsCasa/golsFora null: MatchNotEncerradaError
  2. palpiteRepo.findByPartida(partidaId) → lista de palpites
  3. Para cada palpite:
       pontos = RegraPontuacao.calcular(palpite, resultado, partida.multiplicador)
       palpiteRepo.updatePontosObtidos(palpite.id, pontos)
  4. Retornar { count: palpites.length, totalPontos: soma }
```

### 2e. Atualizar PalpiteRepository (port + infra)

Arquivo: `src/application/bolao/ports/PalpiteRepository.ts`

Adicionar:
```typescript
updatePontosObtidos(id: string, pontos: number): Promise<void>
```

Arquivo: `src/infrastructure/repositories/PrismaPalpiteRepository.ts`

Implementar com `prisma.palpite.update({ where: { id }, data: { pontosObtidos: pontos } })`.

### 2f. Atualizar PrismaTournamentReadPort

Arquivo: `src/infrastructure/repositories/PrismaTournamentReadPort.ts`

Atualizar `getPartida()` para incluir os novos campos via Prisma `include`:
```typescript
prisma.partida.findUnique({
  where: { id },
  include: { fase: true },  // para obter fase.multiplicador
})
// Mapear: multiplicador = Number(partida.fase.multiplicador)
```

### 2g. Erros de domínio novos

Arquivo (novo): `src/domain/tournament/errors.ts`

```typescript
export class MatchAlreadyFinishedError extends AppError {
  constructor() { super('MATCH_ALREADY_FINISHED', 'Partida já encerrada.') }
}

export class MatchNotEncerradaError extends AppError {
  constructor() { super('MATCH_NOT_ENCERRADA', 'Partida ainda não encerrada.') }
}
```

Registrar no mapeamento HTTP de `server.ts`:
- `MATCH_ALREADY_FINISHED` → 409
- `MATCH_NOT_ENCERRADA` → 422

### 2h. Middleware requireAdmin

Arquivo (novo): `src/presentation/http/middlewares/requireAdmin.ts`

```typescript
// Rejeita com 403 FORBIDDEN se request.user.role !== 'admin'
```

### 2i. Rota admin

Arquivo (novo): `src/presentation/http/routes/admin.ts`

```
POST /admin/partidas/:id/resultado
  Middlewares: authenticate, requireAdmin
  Body (Zod): { golsCasa: integer ≥ 0, golsFora: integer ≥ 0 }
  Fluxo:
    1. RegisterMatchResult.execute({ adminId: user.id, partidaId: id, golsCasa, golsFora })
    2. CalculateScoreForMatch.execute({ partidaId: id })
    3. 200 → { partidaId, golsCasa, golsFora, palpitesCalculados: count }
```

Registrar em `src/infrastructure/http/server.ts`.

**Critério de aceite:**
```
POST /admin/partidas/1/resultado  { golsCasa: 2, golsFora: 1 }
→ 200 { partidaId: 1, golsCasa: 2, golsFora: 1, palpitesCalculados: N }
→ palpites.pontos_obtidos populados no banco para a partida 1
→ GET /leaderboard reflete os novos pontos
```

---

## Tarefa 3 — Frontend: Painel Admin 🟡

**Objetivo:** Tela para o admin registrar resultados sem terminal.

**Arquivos a criar/alterar:**

| Arquivo | Ação |
|---|---|
| `frontend/src/pages/AdminPage.tsx` | criar |
| `frontend/src/lib/api.ts` | adicionar `api.admin.registerResult(id, golsCasa, golsFora)` |
| `frontend/src/router.tsx` | adicionar rota `/admin` com guard `role === 'admin'` |
| `frontend/src/components/templates/MainLayout.tsx` | link "Admin" visível só para admins |

**Comportamento da AdminPage:**
1. Carrega `GET /partidas` (já existe, público)
2. Separa em duas seções: "Aguardando resultado" (`status !== 'encerrada'`) e "Encerradas"
3. Para cada partida aberta: exibe data BRT · times · dois inputs numéricos (min=0) · botão "Registrar"
4. Ao submeter: `POST /admin/partidas/:id/resultado`
5. Feedback inline: ✓ `{N} palpites calculados` ou mensagem de erro
6. Após sucesso: move o card para a seção "Encerradas"

**Nota:** A tela é para uso interno; prioridade em funcionalidade, não estética.

**Critério de aceite:**
- `role='user'` não vê o link "Admin" e `/admin` redireciona para `/`
- Admin registra resultado e vê confirmação sem usar terminal

---

## Tarefa 4 (Opcional) — ClassificacaoService + Tela de Classificação 🟢

> Executar se sobrar tempo antes de 27/06. O `ClassificacaoService` será **obrigatório**
> no Marco 3 de qualquer forma (ROADMAP.md §1 Marco 3); adiantá-lo aqui é vantajoso.

**Objetivo:** Calcular e exibir a classificação dos 4 grupos por demanda.

**Arquivos a criar:**

| Arquivo | Descrição |
|---|---|
| `src/domain/tournament/ClassificacaoService.ts` | 7 critérios de desempate + reiteração |
| `src/domain/tournament/__tests__/ClassificacaoService.test.ts` | todos os casos de TESTING_STRATEGY.md §2.1 |
| `src/application/tournament/use-cases/GetGroupStandings.ts` | orquestra leitura de partidas + cálculo |
| `src/application/tournament/ports/PartidaRepository.ts` | adicionar `findByGrupo(grupoId)` |
| `src/presentation/http/routes/grupos.ts` | `GET /grupos/:id/classificacao` |
| `frontend/src/pages/ClassificacaoPage.tsx` | tabela por grupo, navegável por aba |

**Regras de desempate (DOMAIN_RULES.md §2–§3):**
1. Pontos (V×3 + E×1)
2. Confronto direto: pontos
3. Confronto direto: saldo de gols
4. Confronto direto: gols marcados
5. Saldo de gols geral
6. Gols marcados geral
7. Fair Play (tabela de deduções: amarelo −1, vermelho direto −3, vermelho duplo −3, expulsão por dois amarelos −2)
8. Ranking FIFA (dado estático, carregar de seed ou hardcoded)
9. Ordem alfabética do nome (tiebreaker determinístico final)

Para tríplices (ou quádruplos) empates: aplicar critérios 2–4 **somente entre as empatadas**;
se restar dois empatados, reiniciar do critério 2 entre eles (reiteração).

**Casos de teste obrigatórios (TESTING_STRATEGY.md §2.1):**
- Classificação trivial (pontos distintos)
- Empate de 2 resolvido por confronto direto
- Empate de 2 sem resolução em confronto direto → saldo geral
- Empate triplo com reiteração
- Fair Play como desempate
- Ranking FIFA como desempate
- Empate total → ordem alfabética

**Critério de aceite:** Todos os casos acima verdes em `npm test`.

---

## Fluxo de dados end-to-end (Tarefa 2)

```
Admin browser                 Backend                       DB
     │                           │                           │
     │  POST /admin/partidas/1   │                           │
     │  { golsCasa:2, golsFora:1 }                           │
     │──────────────────────────►│                           │
     │                           │  RegisterMatchResult      │
     │                           │   getPartida(1) ─────────►│
     │                           │   registerResult(1,2,1) ─►│ UPDATE partidas
     │                           │                           │  gols_casa=2, gols_fora=1
     │                           │  CalculateScoreForMatch   │  status='encerrada'
     │                           │   getPartida(1) ─────────►│
     │                           │   (golsCasa, golsFora,    │
     │                           │    multiplicador=1.0)     │
     │                           │   findByPartida(1) ──────►│ SELECT palpites
     │                           │   → [p1(2x0), p2(2x1)]   │
     │                           │   RegraPontuacao:         │
     │                           │    p1: vencedor→10×1=10   │
     │                           │    p2: exato→25×1=25      │
     │                           │   updatePontosObtidos ───►│ UPDATE palpites
     │                           │                           │  pontos_obtidos=[10,25]
     │  200 { palpitesCalculados: 2 }                        │
     │◄──────────────────────────│                           │
```

---

## Dependências entre tarefas

```
Tarefa 1 — RegraPontuacao (domínio puro)
  └─► Tarefa 2 — RegisterMatchResult + CalculateScoreForMatch (backend)
        └─► Tarefa 3 — Painel Admin (frontend)

Tarefa 4 — ClassificacaoService (independente, paralela ou posterior)
```

---

## Critério de aceite final do Marco 2

- [ ] `npm test` verde (inclui RegraPontuacao com todos os casos de TESTING_STRATEGY.md §2.4–2.5)
- [ ] Admin registra resultado de qualquer partida via painel ou `curl`
- [ ] Após registrar, `palpites.pontos_obtidos` é populado para todos os palpiteiros da partida
- [ ] `GET /leaderboard` reflete os pontos acumulados corretamente
- [ ] Rotas `/admin/*` retornam 403 para `role='user'` e 401 sem autenticação
- [ ] `git push` com commit `feat(marco2): tarefa N — <resumo>` após cada tarefa concluída
