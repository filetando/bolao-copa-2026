# TESTING_STRATEGY.md

> **Quando atualizar:** ao adicionar um novo módulo de domínio complexo, ou quando um bug em produção revelar um caso de borda não coberto (adicionar o teste que teria pego o bug).
> **Responsável:** autor do PR escreve os testes; revisor confere cobertura dos casos críticos listados aqui.
> Base: Test Pyramid + TDD (Red/Green/Refactor) + Arrange-Act-Assert (Guia, Seção 4).

---

## 1. Pirâmide de testes

```
        /\
       /E2E\        poucos — fluxos críticos completos (login → palpite → pontuação)
      /------\
     /Integr. \     médios — repositórios, use cases com banco real (testcontainers/sqlite)
    /----------\
   / Unitários  \   muitos — domain (regras puras), application (use cases com repos fake)
  /--------------\
```

A maior parte do esforço de teste deve estar em **`domain`**, porque é onde mora a complexidade real (desempate, Anexo C, pontuação) e porque é a camada mais barata de testar (sem banco, sem HTTP).

---

## 2. Casos de teste obrigatórios por módulo

### 2.1 `ClassificacaoService` (desempate de grupo) — **prioridade máxima**

> "IA gera testes superficiais, construídos para passar" (Guia, Seção 10) — os testes abaixo são casos **de borda reais**, definidos **antes** da implementação (TDD).

- [ ] Classificação trivial: 4 equipes com pontuações totais distintas → ordena só por pontos.
- [ ] Empate de 2 equipes em pontos, resolvido por confronto direto (critério 1).
- [ ] Empate de 2 equipes, confronto direto também empatado → cai para saldo de gols geral (critério 4), pulando 2/3 (que não fazem sentido com 1 jogo só) — **definir explicitamente** o comportamento quando confronto direto é só 1 jogo.
- [ ] **Empate triplo** onde confronto direto separa 1 equipe e deixa 2 empatadas → reinício do confronto direto (1–3) **somente entre essas duas**, antes de ir para critério 4. (Caso de reiteração — o mais importante do projeto.)
- [ ] Empate que só se resolve no critério 6 (Fair Play) — testar a tabela de deduções (amarelo −1, etc.) e o "menor módulo de dedução vence".
- [ ] Empate que só se resolve no critério 7 (ranking FIFA) — equipes com Fair Play idêntico.
- [ ] Empate total em todos os 7 critérios (caso teórico) — definir comportamento determinístico (ex.: ordem alfabética como fallback final, documentado).

### 2.2 `TerceirosColocadosService`

- [ ] 12 terceiros, seleciona corretamente os 8 melhores aplicando os mesmos 7 critérios.
- [ ] Empate na 8ª posição (fronteira entre classificado e eliminado) — aplica reiteração corretamente.
- [ ] Retorna a string de 8 letras **ordenada alfabeticamente** (contrato com `AnexoCLookup`).

### 2.3 `AnexoCLookup`

- [ ] Para cada uma das 495 combinações em `confrontos_terceiros`, `lookup(combinacao)` retorna exatamente os 8 confrontos esperados (teste parametrizado/data-driven contra o próprio arquivo de seed — não reescrever os 495 valores manualmente no teste, carregar do dado).
- [ ] Combinação inválida (não está nas 495, ex.: 7 ou 9 letras) → erro explícito, não `undefined` silencioso.

### 2.4 `RegraPontuacao` (cascata de pontos)

- [ ] Placar exato → 25.
- [ ] Vencedor + gols do vencedor batem, mas gols do perdedor não → 18.
- [ ] Vencedor certo + saldo bate, mas placar exato não → 15.
- [ ] Empate no palpite e no resultado, placares diferentes (1-1 vs 2-2) → 15.
- [ ] Só vencedor certo → 10.
- [ ] Tudo errado → 0.
- [ ] Caso de fronteira: palpite empate, resultado vitória (e vice-versa) → 0 (garantir que não cai acidentalmente em "apenas vencedor").

### 2.5 `MultiplicadorFase` + integração com `RegraPontuacao`

- [ ] Mesmo placar, fases diferentes → pontuação final escalada corretamente (×1, ×1.5, ×2, ×4).

### 2.6 Bloqueio de palpites (`SubmitPrediction`) — **integração/E2E**

- [ ] Envio de palpite antes da janela de bloqueio → sucesso.
- [ ] Envio de palpite após o horário de início → rejeitado pelo **backend**, mesmo chamando a API diretamente (sem passar pelo frontend).
- [ ] Edição de palpite existente após o bloqueio → rejeitada.
- [ ] Partidas simultâneas (R3): bloqueio de uma trava também as outras do mesmo `grupo_simultaneo_id`.

### 2.7 `BracketGeneratorService`

- [ ] Dado um conjunto fixo de classificados (1º/2º de cada grupo + 8 terceiros conhecidos), gera os 16 confrontos de 73–88 corretamente, incluindo os 4 jogos fixos contra 2os colocados (C/F/H/J) e os 8 via Anexo C.

---

## 3. O que NÃO precisa de teste exaustivo (YAGNI)

- CRUD simples de `equipes`/`fases` (dados estáticos, carregados via seed) — teste de smoke (seed roda sem erro) é suficiente.
- Estilização visual — não há teste automatizado de pixel; usar revisão manual + checklist de UX (`ux-reviewer`).

---

## 4. Ferramentas (a confirmar conforme stack — ADR-001)

- Unitário/Integração: Vitest (alinhado a TS/Vite) ou Jest.
- E2E: Playwright (cobre o fluxo de login → palpite → bloqueio).
- Banco de testes: SQLite em memória ou container Postgres descartável (Testcontainers) para testes de repositório.

---

## 5. Definição de "pronto" (Definition of Done) para módulos de domínio

Um módulo de `domain` (`ClassificacaoService`, `RegraPontuacao`, `AnexoCLookup`, etc.) só é considerado pronto quando:
1. Todos os casos de teste da seção correspondente acima estão verdes.
2. Roda sem nenhuma dependência externa (sem banco, sem HTTP) — confirmando o isolamento da Clean Architecture.
3. Foi exercitado manualmente pelo menos uma vez com dados reais de um grupo (ex.: dados do Grupo A após R1, R2, R3) para validar contra a expectativa humana.
