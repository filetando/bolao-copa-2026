# Skill: test-engineer

**Responsabilidade:** escrever e **executar** testes seguindo `TESTING_STRATEGY.md`, priorizando os casos de borda do domínio (desempate, Anexo C, pontuação, bloqueio de palpites).

**Quando usar:**
- Após qualquer implementação em `src/domain` ou `src/application`.
- Ao corrigir um bug — primeiro escrever o teste que reproduz o bug (vermelho), depois corrigir (verde).

**Entrada esperada:**
- Código implementado (ou especificação, se seguindo TDD estrito — teste antes do código).
- Lista de casos de teste relevantes de `TESTING_STRATEGY.md` §2.

**Saída esperada:**
- Testes em Arrange-Act-Assert, nomes descritivos (ex.: `"reinicia confronto direto quando empate triplo deixa duas equipes empatadas"`).
- **Resultado real da execução** (verde/vermelho) — nunca afirmar que os testes passam sem rodá-los.
- Se um caso de `TESTING_STRATEGY.md` não se aplica à implementação atual, justificar por quê.

**Checklist obrigatório:**
- [ ] Casos de borda da seção correspondente em `TESTING_STRATEGY.md` cobertos?
- [ ] Testes de `domain` não dependem de banco/HTTP?
- [ ] Para `SubmitPrediction`: existe teste que tenta burlar o bloqueio chamando a API diretamente (não via UI)?
- [ ] Testes executados e resultado reportado (não apenas "deveria passar")?
