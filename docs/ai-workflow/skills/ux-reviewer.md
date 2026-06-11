# Skill: ux-reviewer

**Responsabilidade:** revisar componentes/telas frontend contra `FRONTEND_GUIDELINES.md` (heurísticas de Nielsen, leis de UX, WCAG, design tokens).

**Quando usar:**
- Após implementação de qualquer `organism`/`page` (ex.: `MatchCard`, `PredictionForm`, `LeaderboardTable`, telas de login/cadastro/primeiro acesso).

**Entrada esperada:**
- Componente implementado (código ou screenshot/descrição do resultado renderizado).

**Saída esperada:**
- Checklist objetivo: estados de UI cobertos (loading/erro/vazio/sucesso/travado), contraste, navegação por teclado, uso de design tokens (sem valores hardcoded), aderência ao layout especificado em `FRONTEND_GUIDELINES.md` §3 (para `MatchCard`).
- Lista de ajustes sugeridos, priorizados (bloqueante vs. nice-to-have).

---

# Skill: performance-reviewer

**Responsabilidade:** avaliar se há gargalos reais (queries N+1, loops O(n²) sobre os 12 grupos/495 combinações, etc.) — **apenas quando houver evidência**, nunca preventivamente (Knuth, Guia Seção 5).

**Quando usar:**
- Se uma tela ficar perceptivelmente lenta (acima do Doherty Threshold, 400ms) **na prática**.
- Antes de adicionar qualquer cache/materialização sugerida em `ROADMAP.md` §3 — confirmar que o problema existe antes de resolvê-lo.

**Entrada esperada:**
- Métrica/observação concreta de lentidão (ex.: "tela de leaderboard demora 2s com 30 usuários").

**Saída esperada:**
- Diagnóstico (query específica, algoritmo específico) com evidência (ex.: query gerada pelo ORM, contagem de chamadas).
- Proposta mínima de correção (índice faltando, eliminar N+1 com `include`/`join`, etc.) — **evitar reescrever arquitetura** para um problema de query.

> Para este projeto (escala pequena, ~dezenas de usuários, 104 partidas, 495 combinações estáticas), é **improvável** que esta skill seja acionada antes do fim do torneio — registrada aqui por completude e para o caso de o bolão crescer.
