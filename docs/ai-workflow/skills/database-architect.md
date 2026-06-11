# Skill: database-architect

**Responsabilidade:** desenhar e revisar mudanças de schema (tabelas, colunas, índices, migrations), garantindo aderência ao modelo relacional descrito em `DATABASE.md` e às boas práticas de modelagem (Guia, Seção 2).

**Quando usar:**
- Antes de criar qualquer migration.
- Quando uma feature precisar de novo dado persistido (nova coluna/tabela).
- Para revisar se uma query proposta tem índice adequado ou pode gerar N+1.

**Entrada esperada:**
- Descrição da feature/dado a persistir.
- Casos de uso de leitura previstos (quais filtros/ordenações serão feitos sobre esse dado).

**Saída esperada:**
- Proposta de schema (tabela/coluna/tipo/constraints/índices), em formato compatível com `DATABASE.md`.
- Atualização do próprio `DATABASE.md` com a mudança proposta.
- Identificação de relacionamentos N:N e confirmação de que serão modelados como tabela associativa (nunca array/JSON de IDs).
- Confirmação de necessidade (ou não) de transação para a operação.

**Checklist obrigatório (espelha `AGENTS.md`):**
- [ ] Reflete regra de negócio real (`DOMAIN_RULES.md`)?
- [ ] Relacionamentos N:N corretos?
- [ ] Índices nos filtros/ordenações previstos?
- [ ] Transação definida para operações multi-tabela atômicas?
- [ ] `DATABASE.md` atualizado no mesmo PR?
