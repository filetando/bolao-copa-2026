# DEVELOPMENT_GUIDELINES.md

> **Quando atualizar:** quando uma convenção mudar ou um novo padrão recorrente for identificado (ex.: "sempre fazemos X assim a partir de agora").
> **Responsável:** Tech Lead. Mudanças aqui afetam todos os PRs futuros.

---

## 1. Convenções gerais

- **Idioma do domínio:** português, refletindo a linguagem ubíqua de `DOMAIN_RULES.md` (`Palpite`, `Partida`, `Grupo`, `Equipe`, `MercadoEstatico`...). Termos técnicos genéricos (sem significado de domínio) podem ficar em inglês (`Repository`, `UseCase`, `DTO`).
- **Nomenclatura:** `camelCase` para variáveis/funções TS, `PascalCase` para classes/tipos/entidades, `snake_case` para colunas de banco, `kebab-case` para nomes de arquivo de componentes React (`match-card.tsx`).
- **Sem magic numbers/strings:** valores como `25, 18, 15, 10` (pontuação) e `1, 1.5, 2, 4` (multiplicadores) vivem em `RegraPontuacao`/`MultiplicadorFase` como constantes nomeadas, nunca espalhados em condicionais.
- **Complexidade ciclomática:** funções com complexidade > 10 (McCabe) devem ser refatoradas — sinal claro disso é a `ClassificacaoService`, que deve ser quebrada em funções menores por critério de desempate, não um único `if/else` gigante.
- **Lei de Demeter:** evitar `partida.grupo.equipes[0].estatisticas.pontos` — expor métodos de domínio (`grupo.getClassificacao()`) em vez de encadear acessos.

## 2. 12-Factor (itens relevantes para este projeto)

- Configuração via variáveis de ambiente (`.env`, nunca hardcoded).
- Processos stateless — sessão em cookie/JWT, não em memória do processo (importante se algum dia rodar mais de uma instância).
- Logs como stream (stdout), não arquivos locais geridos manualmente.
- Paridade dev/prod: mesmo banco (Postgres) em dev (via Docker) e produção, evitando "funciona no SQLite mas não no Postgres".

## 3. Boy Scout Rule + Débito Técnico

- Ao tocar em um arquivo para adicionar uma feature, pequenas melhorias de legibilidade no código tocado são bem-vindas — mas **não** misturar refactors grandes não relacionados na mesma mudança (dificulta revisão).
- Débito técnico aceito conscientemente (ex.: ADR-003 — geração manual do bracket na v1) deve ser **registrado** em `DECISIONS_LOG.md` ou `ROADMAP.md`, nunca silencioso.

## 4. Controle de versão

- Branches: `main` (estável/deployável), `dev` (integração), `feature/<contexto>-<descricao>` (ex.: `feature/bolao-submit-prediction`).
- Commits: prefixo por contexto quando fizer sentido (`tournament: ...`, `bolao: ...`, `identity: ...`, `docs: ...`).
- Nenhum commit direto em `main`.

## 5. Definição de pronto (DoD) geral por feature

- [ ] Código segue a Dependency Rule (`ARCHITECTURE.md`).
- [ ] Regras de negócio batem com `DOMAIN_RULES.md` (linha por linha, se for lógica de pontuação/desempate).
- [ ] Testes da camada `domain` cobrindo os casos de `TESTING_STRATEGY.md` aplicáveis.
- [ ] Checklist de `SECURITY.md` aplicado se a feature toca auth, input de usuário ou dados sensíveis.
- [ ] Documentação (`DATABASE.md`, `ARCHITECTURE.md`, `DECISIONS_LOG.md`) atualizada se a feature mudou modelo/arquitetura/decisão.

## 6. O que evitar (lições do Guia, Seção 10 — limitações de LLMs)

- Não confiar que código "parece certo" — **executar** os testes antes de considerar uma tarefa concluída.
- Não inventar nomes de bibliotecas/funções — se incerto, verificar na documentação real ou perguntar.
- Não gerar lógica de negócio "genérica" para um domínio específico — toda regra de pontuação/desempate/Anexo C deve referenciar `DOMAIN_RULES.md` explicitamente no código (comentário com a seção, ex.: `// DOMAIN_RULES.md §3 — critério 1: confronto direto`).
