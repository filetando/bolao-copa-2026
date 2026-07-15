# AGENTS.md

> Este é o arquivo principal de regras consumido por Claude (e qualquer outro agente/IA) ao trabalhar neste repositório.
> **Quando atualizar:** sempre que uma regra global, convenção ou checklist mudar. Mudanças aqui afetam **todo** trabalho futuro — revisão humana obrigatória.
> **Responsável:** dono do projeto.

---

## 1. Sobre este projeto

Sistema web de bolão da Copa do Mundo FIFA 2026 (intranet corporativa). Regras completas em `docs/architecture/DOMAIN_RULES.md` (derivado de `bolao-copa-2026_1.md`, mantido na raiz como fonte oficial imutável).

## 2. Documentos que você DEVE ler antes de qualquer tarefa

Na ordem de relevância:

1. `AGENTS.md` (este arquivo) — regras globais.
2. `docs/architecture/DOMAIN_RULES.md` — se a tarefa envolve QUALQUER cálculo/regra de negócio (pontuação, desempate, Anexo C, multiplicadores, bloqueio de palpites).
3. `docs/architecture/ARCHITECTURE.md` — se a tarefa cria/altera entidades, use cases, ou mexe em mais de um Bounded Context.
4. `docs/architecture/DATABASE.md` — se a tarefa cria/altera schema.
5. `docs/engineering/SECURITY.md` — se a tarefa toca autenticação, autorização, ou input de usuário.
6. `docs/engineering/BACKEND_GUIDELINES.md` ou `docs/engineering/FRONTEND_GUIDELINES.md` — conforme a camada.
7. `docs/engineering/TESTING_STRATEGY.md` — para saber quais testes escrever.
8. `docs/architecture/DECISIONS_LOG.md` — para entender decisões já tomadas (e não as contradizer sem propor uma nova ADR).

**Não pule etapas para "ir mais rápido".** Uma regra de pontuação implementada errado custa mais caro depois do que 2 minutos de leitura agora.

## 3. Regras globais

1. **Não implemente regra de negócio sem referência explícita** a `DOMAIN_RULES.md`. Se a regra não estiver lá, pare e pergunte (ou proponha a redação para `DOMAIN_RULES.md` primeiro, aguardando aprovação).
2. **Siga a Dependency Rule** (`ARCHITECTURE.md` §1/§6) sem exceções. Se uma tarefa parecer exigir violar a regra (ex.: "domain" precisar de algo do banco), isso é sinal de que falta um *port* — crie o port, não a dependência direta.
3. **Nunca invente nomes de bibliotecas, funções ou parâmetros.** Se não tiver certeza, verifique a documentação real ou pergunte. (Guia de Fundamentos, Seção 10 — alucinação de código é o erro mais comum e mais caro de LLMs.)
4. **Execute os testes.** Nunca declare uma tarefa "concluída" ou "os testes devem passar" sem rodá-los e reportar o resultado real.
5. **Mudanças de escopo amplo são proibidas sem aviso prévio.** Se ao implementar algo você perceber que precisa alterar um port consumido por outro Bounded Context, pare e explique o impacto antes de prosseguir.
6. **Se uma sugestão do dono do projeto conflitar com arquitetura, segurança, ou `DOMAIN_RULES.md`**, não implemente cegamente — explique o problema e proponha alternativa (conforme instruções originais do projeto).
7. **Documentação anda junto com código.** Mudança de schema → atualizar `DATABASE.md` no mesmo PR. Mudança de arquitetura → `ARCHITECTURE.md`. Decisão estrutural nova → `DECISIONS_LOG.md`.

## 4. Limites de atuação

- **Pode fazer sem perguntar:** implementar um use case/componente já especificado no Design Técnico aprovado; escrever testes; pequenas correções de bug com teste de regressão; atualizar a documentação correspondente à mudança feita.
- **Deve perguntar antes:** alterar uma regra existente em `DOMAIN_RULES.md`; alterar/remover uma coluna de banco já populada com dados (vs. apenas adicionar); mudar a stack (ADR-001); mudar a estratégia do Anexo C/bracket (ADR-003); qualquer ação que apague dados.
- **Nunca faz:** commit direto em `main`; expor segredos/credenciais em código ou logs; gerar dados de placar/resultado "de exemplo" que possam ser confundidos com dados reais em produção.

## 5. Fluxo de desenvolvimento

Ver `docs/ai-workflow/WORKFLOW.md` para o fluxo completo (Ideia → Análise → Design Técnico → Plano → Implementação → Testes → Code Review → Refatoração → Merge).

## 6. Skills disponíveis

Ver `docs/ai-workflow/skills/`. Resumo: `domain-expert` (regras de negócio), `database-architect` (schema), `backend-engineer`, `frontend-engineer`, `test-engineer`, `security-reviewer`, `ux-reviewer`, `performance-reviewer` (raramente necessário, ver seu arquivo).

---

## 7. CHECKLIST — antes de gerar código novo

- [ ] Li os documentos relevantes (Seção 2)?
- [ ] A regra de negócio (se houver) está mapeada para uma seção específica de `DOMAIN_RULES.md`?
- [ ] Sei em qual camada (`domain`/`application`/`infrastructure`/`presentation`) e em qual Bounded Context (`identity`/`tournament`/`bolao`) este código vive?
- [ ] Se este código cruza Bounded Contexts, estou usando um *port*/ACL, não acesso direto?
- [ ] Defini quais testes serão necessários (`TESTING_STRATEGY.md`)?

## 8. CHECKLIST — antes de modificar código existente

- [ ] Existe teste cobrindo o comportamento atual? Se não, escrevê-lo primeiro (capturar o comportamento antes de mudar).
- [ ] Mapeei todos os pontos que consomem a função/classe/endpoint que vou alterar?
- [ ] A mudança altera a assinatura de um *port* (interface)? Se sim, todas as implementações e consumidores foram identificados?
- [ ] A mudança é coerente com `DOMAIN_RULES.md`/`ARCHITECTURE.md` atuais, ou exige atualizar esses documentos também?
- [ ] Apliquei a Boy Scout Rule sem misturar refactors não relacionados?

## 9. CHECKLIST — antes de criar migrations

- [ ] `database-architect` revisou o schema proposto contra `DATABASE.md`?
- [ ] A migration faz **uma** mudança lógica coesa (não mistura mudanças não relacionadas)?
- [ ] Relacionamentos N:N modelados como tabela associativa com FKs (nunca array/JSON de IDs)?
- [ ] Índices criados para os filtros/ordenações que as queries previstas vão usar?
- [ ] Seeds de dados estáticos (equipes, grupos, calendário, `confrontos_terceiros`) estão em migrations/seeds **separadas** do schema?
- [ ] `DATABASE.md` foi atualizado no mesmo PR/commit?

## 10. CHECKLIST — antes de alterar banco (dados ou schema em ambiente com dados reais)

- [ ] A alteração é aditiva (nova coluna/tabela) ou destrutiva (remover/renomear coluna com dados)? Se destrutiva, **pergunte antes**.
- [ ] Existe transação envolvendo todas as tabelas afetadas, se a operação precisa ser atômica (`DATABASE.md` §4)?
- [ ] A alteração foi testada em ambiente de desenvolvimento/staging antes de produção?
- [ ] Existe plano de rollback (mesmo que simples, ex.: "reverter a migration X")?
- [ ] Ações administrativas que alteram resultados/classificação (`RegisterMatchResult`, `GenerateKnockoutBracket`) geram registro de auditoria (`SECURITY.md` §6)?
