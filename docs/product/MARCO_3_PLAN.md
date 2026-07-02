# MARCO_3_PLAN.md — Virada para o mata-mata (27/06)

> Marco: 3 | Período: 27/06/2026 (disparo único) | Prioridade: alta (bloqueia Marco 4)
> Derivado de: `ROADMAP.md` §1 (Marco 3), `DOMAIN_RULES.md` §4–§6, `ARCHITECTURE.md` §3.2/§4, ADR-003 (`DECISIONS_LOG.md`)

## Visão geral

O Marco 3 entrega o cálculo (testado via TDD) de quais 8 terceiros colocados avançam, a
alocação deles no chaveamento via Anexo C, e a geração dos 16 confrontos dos jogos 73–88 com
times reais em vez de placeholders. Por ADR-003, o disparo em produção é **manual** (ação de
admin), mas o módulo de domínio é desenvolvido e testado exaustivamente antes disso.

`ClassificacaoService` (Marco 2) já existe e está testado — este marco reaproveita sua lógica
de desempate, não a reimplementa.

**Decisão confirmada com o dono do projeto:** o critério 6 de desempate (Fair Play,
`DOMAIN_RULES.md` §3) fica **fora de escopo** nesta edição — não foi necessário para separar
nenhum empate na Copa 2026 real, e o schema atual não tem colunas de cartões. `ClassificacaoService`
e `TerceirosColocadosService` continuam pulando do critério 5 (gols marcados geral) direto para
o critério 7 (ranking FIFA), como `ClassificacaoService` já faz hoje. Ver ADR-006 (`DECISIONS_LOG.md`,
a criar junto com este documento).

Entregáveis obrigatórios:
1. Domínio: `TerceirosColocadosService` (TDD, reaproveitando critérios de `ClassificacaoService`)
2. Domínio: `AnexoCLookup` (dicionário sobre `confrontos_terceiros.json`, TDD dirigido por dado)
3. Domínio + Aplicação: `BracketGeneratorService` + `GenerateKnockoutBracket` (TDD + rota admin)
4. Frontend: ação de admin "Gerar mata-mata" com tela de conferência

---

## Tarefa 1 — Extrair critérios de desempate compartilhados 🔴 bloqueante

**Objetivo:** `TerceirosColocadosService` usa os mesmos 7 critérios (menos o 6, ver acima) que
`ClassificacaoService`, mas comparando 12 equipes de grupos diferentes (só os 3 jogos de grupo
de cada uma) em vez de 4 equipes do mesmo grupo. Para não duplicar a lógica de H2H/reiteração
(`ARCHITECTURE.md` §8 já declara esse trade-off DRY vs. coesão), extrair as funções puras de
`src/domain/tournament/ClassificacaoService.ts` para um módulo compartilhado.

**Arquivos a criar/alterar:**
- `src/domain/tournament/desempate.ts` (novo) — mover `computeStats`, `computeH2HStats`,
  `groupByKey`, `sortByCriteria4Plus`, `resolveGroup` para cá, exportadas.
- `src/domain/tournament/ClassificacaoService.ts` — importar de `desempate.ts` em vez de
  definir localmente. **Não muda o comportamento nem a assinatura pública** — refactor puro,
  os testes existentes (`__tests__/ClassificacaoService.test.ts`) devem continuar verdes sem
  alteração.

**Critério de aceite:** `npm test` verde para `ClassificacaoService.test.ts` sem nenhuma
alteração no arquivo de teste (prova de que o refactor não mudou comportamento).

---

## Tarefa 2 — `TerceirosColocadosService` (Domínio + TDD) 🔴 bloqueante

**Objetivo:** Dado os 12 terceiros colocados (cada um com seus 3 jogos de grupo), retornar os
8 melhores (classificados) + 4 eliminados + a chave ordenada para o Anexo C.

**Arquivos a criar:**
- `src/domain/tournament/TerceirosColocadosService.ts`
- `src/domain/tournament/__tests__/TerceirosColocadosService.test.ts`
- `tests/domain/tournament/fixtures/terceiros-2026.json` (fixture de dados reais, ver abaixo)

**Assinatura:**
```typescript
// src/domain/tournament/TerceirosColocadosService.ts
import type { EquipeInput, PartidaGrupoEncerrada } from './desempate.js'

export interface TerceiroColocadoInput {
  grupoId: string          // A–L
  equipe: EquipeInput
  partidas: PartidaGrupoEncerrada[]  // os 3 jogos de grupo dessa equipe
}

export interface RankingTerceiros {
  classificados: Array<{ grupoId: string; equipe: EquipeInput }>  // 8, ordenados por posição
  eliminados: Array<{ grupoId: string; equipe: EquipeInput }>     // 4
  chaveAnexoC: string  // 8 letras de grupo dos classificados, ORDENADAS ALFABETICAMENTE
}

export class TerceirosColocadosService {
  // DOMAIN_RULES.md §4 — mesmos critérios de desempate de ClassificacaoService (exceto Fair Play),
  // comparando apenas os 3 jogos de grupo de cada terceiro colocado entre si.
  static rankear(terceiros: TerceiroColocadoInput[]): RankingTerceiros
}
```

**Casos de teste obrigatórios (`TESTING_STRATEGY.md` §2.2):**
- 12 terceiros com pontuações totais claramente distintas → 8 melhores corretos, ordenados.
- Empate na fronteira 8º/9º lugar, resolvido por confronto direto (só faz sentido se as duas
  equipes empatadas forem do mesmo grupo original — como são terceiros de grupos diferentes,
  "confronto direto" entre elas normalmente não existe; validar explicitamente o comportamento
  do critério 1–3 quando não há jogo direto entre as duas equipes — nesse caso o crédito
  correto é: H2H vazio → cai direto para os critérios gerais 4–5, e depois 7).
- `chaveAnexoC` sempre retornada ordenada alfabeticamente, independente da ordem de entrada.
- **Teste orientado a dado real (o mais importante deste módulo):** carregar
  `tests/domain/tournament/fixtures/terceiros-2026.json` — os 12 terceiros colocados reais da
  fase de grupos com seus 3 jogos cada (extraídos de `seed-data/partidas_fase_grupos.json` +
  resultados já registrados no banco de produção/`bolao_backup.dump`) — e validar que
  `rankear()` retorna exatamente estes 8 classificados (confirmados pelo dono do projeto):

  | Grupo | Equipe |
  |---|---|
  | B | Bósnia e Herzegovina |
  | D | Paraguai |
  | E | Equador |
  | F | Suécia |
  | I | Senegal |
  | J | Argélia |
  | K | RD Congo |
  | L | Gana |

  → `chaveAnexoC` esperada: `"BDEFIJKL"`.

  Eliminados esperados: os terceiros dos grupos **A, C, G, H**.

  > ⚠️ **Pendência:** a fixture precisa dos placares dos 3 jogos de grupo de cada um dos 12
  > terceiros colocados (não só o resultado final da comparação). Extrair de
  > `bolao_backup.dump` (dump do Postgres já com os 72 jogos de grupo registrados) ou pedir ao
  > dono do projeto os placares específicos antes de codar o teste — **não inventar placares
  > "plausíveis"** para não mascarar um bug de desempate real (`AGENTS.md` §3.3, TESTING_STRATEGY.md
  > exige dado real, não sintético, para este caso).

**Critério de aceite:** `npm test` verde, incluindo o caso orientado à fixture real acima.

---

## Tarefa 3 — `AnexoCLookup` (Domínio + TDD) 🔴 bloqueante

**Objetivo:** Dicionário de domínio sobre as 495 combinações de `confrontos_terceiros.json`
(`DOMAIN_RULES.md` §5).

**Arquivos a criar:**
- `src/domain/tournament/AnexoCLookup.ts`
- `src/domain/tournament/__tests__/AnexoCLookup.test.ts`
- `src/domain/tournament/errors.ts` — adicionar `InvalidCombinacaoError`

**Assinatura:**
```typescript
// src/domain/tournament/AnexoCLookup.ts
export interface ConfrontoTerceiro {
  vs1a: string; vs1b: string; vs1d: string; vs1e: string
  vs1g: string; vs1i: string; vs1k: string; vs1l: string
}

export class AnexoCLookup {
  // DOMAIN_RULES.md §5 — carrega confrontos_terceiros.json na construção (dado estático imutável)
  constructor(tabela: Record<string, ConfrontoTerceiro>)
  lookup(combinacao: string): ConfrontoTerceiro  // lança InvalidCombinacaoError se não existir
}
```

Carregamento do JSON: `infrastructure` lê `docs/architecture/confrontos_terceiros.json` e
injeta no construtor (mantém `domain` livre de I/O de arquivo, conforme `ARCHITECTURE.md` §1 —
"domain não importa nada de infrastructure").

**Casos de teste obrigatórios (`TESTING_STRATEGY.md` §2.3):**
- Teste parametrizado sobre **todas as 495 combinações** do próprio `confrontos_terceiros.json`
  (carregado no teste via `import`/`readFileSync`, nunca reescrito à mão) — cada `lookup()`
  retorna exatamente os 8 confrontos esperados do arquivo fonte.
- Combinação com 7 ou 9 letras → `InvalidCombinacaoError`, não `undefined`.
- Caso de uso real: `lookup("BDEFIJKL")` (resultado da Tarefa 2) retorna os 8 confrontos que
  serão usados na Tarefa 4.

**Critério de aceite:** `npm test` verde, 495 combinações validadas.

---

## Tarefa 4 — `BracketGeneratorService` + `GenerateKnockoutBracket` 🔴 bloqueante

**Objetivo:** Montar os 16 confrontos dos jogos 73–88 a partir de 1º/2º de cada grupo +
terceiros classificados + Anexo C, e persistir.

### 4a. `BracketGeneratorService` (domínio, TDD)

Arquivo: `src/domain/tournament/BracketGeneratorService.ts`

```typescript
export interface ConfrontoGerado {
  partidaId: number          // 73–88, numeração fixa de DOMAIN_RULES.md §6
  equipeCasaId: number | null
  equipeForaId: number | null
}

export class BracketGeneratorService {
  // DOMAIN_RULES.md §5–§6 — jogos 73–88:
  // C/F/H/J sempre enfrentam 2º colocado (regra fixa, fora da tabela do Anexo C)
  // A/B/D/E/G/I/K/L enfrentam 3º colocado via AnexoCLookup
  static gerar(
    primeirosPorGrupo: Record<string, number>,   // grupoId → equipeId (1º colocado)
    segundosPorGrupo: Record<string, number>,    // grupoId → equipeId (2º colocado)
    terceirosClassificadosPorGrupo: Record<string, number>, // grupoId → equipeId (só os 8 que passaram)
    confrontoAnexoC: ConfrontoTerceiro,
  ): ConfrontoGerado[]  // as 16 partidas, na numeração oficial 73–88
}
```

**Teste (`TESTING_STRATEGY.md` §2.7):** conjunto fixo e conhecido de 1º/2º/8 terceiros
classificados → os 16 confrontos exatos esperados de `DOMAIN_RULES.md`/`bolao-copa-2026_1.md`
§6 (tabela de jogos 73–88), incluindo os 4 jogos fixos (73: 2ºA×2ºB, 75: 1ºF×2ºC, 76: 1ºC×2ºF,
84: 1ºH×2ºJ, 86: 1ºJ×2ºH — conferir contra a tabela oficial linha a linha no teste).

### 4b. Extensão de `PartidaRepository` (port + infra)

Arquivo: `src/application/tournament/ports/PartidaRepository.ts` — adicionar:
```typescript
updateEquipesResolvidas(updates: Array<{ id: number; equipeCasaId: number | null; equipeForaId: number | null }>): Promise<void>
// Atualiza equipe_casa_id/equipe_fora_id de várias partidas em UMA transação (DATABASE.md §4).
// Reaproveitado também no Marco 4 (propagação de vencedores das rodadas seguintes).
```
Implementar em `src/infrastructure/repositories/PrismaPartidaRepository.ts` com
`prisma.$transaction([...])`.

### 4c. `GenerateKnockoutBracket` (use case)

Arquivo: `src/application/tournament/use-cases/GenerateKnockoutBracket.ts`

```
Fluxo:
  1. Para cada um dos 12 grupos: ClassificacaoService.calcular(...) → pega 1º e 2º de cada.
  2. Monta os 12 TerceiroColocadoInput (3º de cada grupo + seus 3 jogos) → TerceirosColocadosService.rankear(...)
  3. AnexoCLookup.lookup(chaveAnexoC) → ConfrontoTerceiro
  4. BracketGeneratorService.gerar(primeiros, segundos, terceirosClassificados, confrontoAnexoC) → 16 ConfrontoGerado
  5. partidaRepo.updateEquipesResolvidas(confrontos) — transação única
  6. Retorna os 16 confrontos gerados (para tela de conferência do admin)
```

Erro novo: `GroupStageNotCompleteError` (`src/domain/tournament/errors.ts`) se alguma das 72
partidas de grupo não estiver `encerrada` — lançar **antes** de gerar qualquer coisa.

### 4d. Rota admin

Arquivo: `src/presentation/http/routes/admin.ts` — adicionar:
```
POST /admin/mata-mata/gerar
  Middlewares: authenticate, requireAdmin
  Fluxo: GenerateKnockoutBracket.execute() → 200 { confrontos: ConfrontoGerado[] }
  Erros: 422 GROUP_STAGE_NOT_COMPLETE
```
Registrar mapeamento de erro em `server.ts` (`GROUP_STAGE_NOT_COMPLETE` → 422), seguindo o
padrão já usado para `MATCH_ALREADY_FINISHED`/`MATCH_NOT_ENCERRADA` (Marco 2).

**Critério de aceite (Tarefa 4):**
```
POST /admin/mata-mata/gerar
→ 200 { confrontos: [ 16 itens ] }
→ partidas 73–88 passam a ter equipe_casa_id/equipe_fora_id preenchidos no banco
→ GET /partidas mostra nomes/bandeiras reais nos jogos 73–88 (placeholder_casa/fora somem
  visualmente porque equipeCasa/equipeFora deixam de ser null — nenhuma mudança de componente
  no frontend, conforme FRONTEND_GUIDELINES.md §7)
```

---

## Tarefa 5 — Frontend: ação de admin "Gerar mata-mata" 🟡

**Objetivo:** Botão de admin para disparar a Tarefa 4 sem terminal, com conferência visual.

**Arquivos a criar/alterar:**
| Arquivo | Ação |
|---|---|
| `frontend/src/lib/api.ts` | adicionar `api.admin.generateBracket(): Promise<{ confrontos: ConfrontoGerado[] }>` |
| `frontend/src/pages/AdminPage.tsx` | nova seção "Mata-mata" com botão "Gerar chaveamento" |

**Comportamento:**
1. Botão só habilitado quando os 72 jogos de grupo estão todos `encerrada` (reaproveita a lista
   já carregada de `GET /partidas` que a `AdminPage` já busca).
2. Ao clicar, confirma via modal/`window.confirm` simples (ação sensível, sem rollback fácil —
   `AGENTS.md` §4, "ações que alteram resultados/classificação exigem auditoria/confirmação").
3. Chama `api.admin.generateBracket()`, exibe os 16 confrontos retornados numa lista simples
   (nome × nome) para conferência humana pós-geração (ADR-003).
4. Erro `GROUP_STAGE_NOT_COMPLETE` → mensagem clara "ainda há jogos de grupo pendentes".

**Critério de aceite:** admin gera o chaveamento pela UI e confere os 16 confrontos sem usar
terminal/curl.

---

## Dependências entre tarefas

```
Tarefa 1 — extrair desempate.ts (refactor, não quebra ClassificacaoService)
  └─► Tarefa 2 — TerceirosColocadosService
        └─► Tarefa 4c — GenerateKnockoutBracket (usa Tarefa 2 + 3)
Tarefa 3 — AnexoCLookup (independente, paralela à Tarefa 2)
Tarefa 4a/4b — BracketGeneratorService + PartidaRepository (paralelas a 2/3, convergem em 4c)
Tarefa 4c/4d — depende de 2, 3, 4a, 4b
  └─► Tarefa 5 — Frontend admin
```

---

## Critério de aceite final do Marco 3

- [ ] `npm test` verde, incluindo `TerceirosColocadosService` (com a fixture real dos 8
      classificados confirmados: B/D/E/F/I/J/K/L) e `AnexoCLookup` (495 combinações).
- [ ] `ClassificacaoService.test.ts` continua verde sem alteração após o refactor da Tarefa 1.
- [ ] Admin dispara `POST /admin/mata-mata/gerar` e os jogos 73–88 passam a ter times reais.
- [ ] `GET /partidas` reflete os times reais nos jogos 73–88 sem exigir mudança em `MatchCard`.
- [ ] Nova entrada ADR-006 em `DECISIONS_LOG.md` documentando a exclusão do critério 6 (Fair
      Play) desta edição.
- [ ] `git push` com commit `feat(marco3): tarefa N — <resumo>` após cada tarefa concluída.
