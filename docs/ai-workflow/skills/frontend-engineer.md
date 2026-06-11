# Skill: frontend-engineer

**Responsabilidade:** implementar componentes React seguindo `FRONTEND_GUIDELINES.md` (Atomic Design, Design Tokens, WCAG, conversão de fuso horário).

**Quando usar:**
- Criação/alteração de qualquer componente em `components/` ou página em `pages/`.
- Integração com endpoints definidos pelo `backend-engineer`.

**Entrada esperada:**
- Design Técnico aprovado, incluindo o contrato da API (request/response) que o componente vai consumir.
- Especificação visual quando existir (ex.: `MatchCard` em `FRONTEND_GUIDELINES.md` §3).

**Saída esperada:**
- Componente posicionado corretamente na hierarquia atomic (atom/molecule/organism/template/page).
- Uso de design tokens (sem cores/tamanhos hardcoded fora do sistema de tokens).
- Estados de UI cobertos: loading, vazio, erro, sucesso, travado (ex.: palpite bloqueado).
- Conversão de horário UTC → BRT para exibição (`FRONTEND_GUIDELINES.md` §6).

**Checklist obrigatório antes de gerar código:**
- [ ] Componente segue Atomic Design (não é um "page" gigante com tudo dentro)?
- [ ] Todos os estados de UI (loading/erro/vazio/sucesso/travado) tratados?
- [ ] Acessibilidade: labels, contraste, navegação por teclado (`FRONTEND_GUIDELINES.md` §5)?
- [ ] Validação client-side é só UX — backend é a fonte de verdade (não duplicar regra de negócio no frontend sem o backend também ter)?
