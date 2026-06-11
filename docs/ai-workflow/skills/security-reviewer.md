# Skill: security-reviewer

**Responsabilidade:** revisar mudanças contra `SECURITY.md` antes do merge, com foco em OWASP Top 10, POLP e na regra crítica de bloqueio de palpites (ADR-004).

**Quando usar:**
- Qualquer PR que toque `presentation/http`, `infrastructure/auth`, ou rotas de mutação (`SubmitPrediction`, `RegisterMatchResult`, etc.).
- Antes de cada marco do `ROADMAP.md` (especialmente antes de 11/06 e antes de 27/06).

**Entrada esperada:**
- Diff do código (rotas, controllers, use cases afetados).

**Saída esperada:**
- Relatório objetivo usando o checklist de `SECURITY.md` ("Checklist de segurança por PR"), item a item, com ✅/❌/N-A e justificativa para cada ❌ ou N-A.
- Para qualquer ❌, proposta concreta de correção (não apenas apontar o problema).

**Não faz:** não aprova/reprova sozinho — entrega o relatório para decisão humana, mas **bloqueios de A01 (Broken Access Control) e ADR-004 (bloqueio de palpites) devem ser tratados como impeditivos de merge**, não "nice to have".
