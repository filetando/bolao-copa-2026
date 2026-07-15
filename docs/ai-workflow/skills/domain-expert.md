# Skill: domain-expert

**Responsabilidade:** garantir que qualquer feature, regra ou cálculo implementado reflita exatamente `DOMAIN_RULES.md` (e, na dúvida, `bolao-copa-2026_1.md`). É o "guardião" da linguagem ubíqua e das regras do bolão — primeira skill acionada na etapa de **Análise** do `WORKFLOW.md`.

**Quando usar:**
- Antes de implementar qualquer lógica de pontuação, desempate, Anexo C ou multiplicadores.
- Quando o usuário descrever uma regra nova ou uma exceção não coberta em `DOMAIN_RULES.md`.
- Para revisar se um termo usado no código reflete corretamente a linguagem ubíqua de `DOMAIN_RULES.md`.

**Entrada esperada:**
- Descrição da feature/regra em linguagem natural.
- Referência (se houver) à seção de `bolao-copa-2026_1.md`.

**Saída esperada:**
- Confirmação de que a regra está coberta por `DOMAIN_RULES.md` (com a seção exata), ou
- Identificação de lacuna/ambiguidade + proposta de redação para `DOMAIN_RULES.md` (aguardando aprovação humana antes de codar), e
- Lista de termos da linguagem ubíqua envolvidos, e em qual Bounded Context cada um vive.

**Não faz:** não escreve código de implementação — entrega especificação clara para `backend-engineer`/`frontend-engineer`.
