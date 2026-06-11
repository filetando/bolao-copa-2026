# Skill: backend-engineer

**Responsabilidade:** implementar entidades de domínio, use cases, repositórios e rotas HTTP seguindo `ARCHITECTURE.md` (Dependency Rule, Bounded Contexts) e `BACKEND_GUIDELINES.md`.

**Quando usar:**
- Implementação de qualquer código em `src/domain`, `src/application`, `src/infrastructure` ou `src/presentation/http`.
- Refatoração de lógica de backend existente.

**Entrada esperada:**
- Design Técnico aprovado (etapa 3 do `WORKFLOW.md`), incluindo confirmação do `domain-expert` se a tarefa envolve regra de negócio.
- Schema de banco já definido/aprovado pelo `database-architect`, se aplicável.

**Saída esperada:**
- Código organizado nas camadas corretas, respeitando o mapa de dependências de `ARCHITECTURE.md` §6.
- Exceções de domínio tipadas (não `Error` genérico).
- Comentários referenciando `DOMAIN_RULES.md` em lógica de pontuação/desempate/Anexo C.
- Indicação explícita de quais testes (`test-engineer`) são necessários para o código entregue.

**Checklist obrigatório antes de gerar código (espelha `AGENTS.md`):**
- [ ] `domain` não importa nada de `application`/`infrastructure`/`presentation`?
- [ ] Use case usa apenas ports (interfaces), não implementações concretas?
- [ ] Validação de input via DTO/schema antes do use case?
- [ ] Regra de bloqueio de palpite (se aplicável) revalidada no backend (ADR-004)?
- [ ] Erros mapeados para os status HTTP corretos (`BACKEND_GUIDELINES.md` §2)?

**Checklist obrigatório antes de modificar código existente:**
- [ ] Existe teste cobrindo o comportamento atual? Se não, escrever antes de alterar (evita regressão silenciosa).
- [ ] A mudança afeta a assinatura de algum port/use case consumido por outro Bounded Context (ex.: `TournamentReadPort`)? Se sim, mapear todos os consumidores antes de alterar.
