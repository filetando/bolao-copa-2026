# ROADMAP.md

> **Quando atualizar:** ao final de cada marco (fase de grupos, geração do bracket, fim do torneio) e sempre que um risco listado se materializar ou for mitigado.
> **Responsável:** Tech Lead.

---

## 1. Marcos do roadmap técnico

### Marco 0 — Fundação (este documento e os demais em `docs/`)
- Estrutura de pastas, AGENTS.md, CLAUDE.md, arquitetura, regras de domínio, schema de banco.
- **Status:** concluído nesta etapa.

### Marco 1 — MVP (hoje, 11/06)
- Identity: cadastro/login.
- Tournament: seed de equipes/grupos/calendário (jogos 1–104, com placeholders no mata-mata).
- Bolão: submissão de palpites de grupo (jogos 1–72), bloqueio de horário (backend), home/leaderboard básico.
- **Entrega de código:** apenas isso. Resto fica em placeholders/dados estáticos.

### Marco 2 — Operação da fase de grupos (11/06–27/06)
- Admin registra resultados (`RegisterMatchResult`) conforme as partidas acontecem.
- Cálculo de pontuação (`CalculateScoreForMatch`) e atualização do leaderboard.
- (Opcional, se houver tempo) Tela de classificação por grupo, calculada sob demanda via `ClassificacaoService` — útil para os próprios usuários acompanharem, mas não bloqueia o bolão.

### Marco 3 — Virada para o mata-mata (27/06)
- `ClassificacaoService` e `TerceirosColocadosService` totalmente testados (TDD, ver `TESTING_STRATEGY.md`).
- Admin confere classificação oficial (FIFA) vs. calculada pelo sistema — se baterem, dispara `GenerateKnockoutBracket` (ADR-003, ainda manual).
- Jogos 73–88 passam a exibir times reais.

### Marco 4 — Mata-mata (28/06–19/07)
- Mesmo fluxo do Marco 2 (registrar resultados, calcular pontos), agora com multiplicadores ×1.5/×2/×4.
- Após cada rodada, vencedores/perdedores propagam para a rodada seguinte (lógica já coberta por `BracketGeneratorService`/use cases equivalentes para fases posteriores — generalizar o serviço para qualquer "Venc. Jogo X" / "Perd. Jogo X", não só os 73–88).

### Marco 5 — Encerramento (19/07+)
- Leaderboard final, possível exportação/relatório.

---

## 2. Riscos identificados

| Risco | Impacto | Mitigação |
|---|---|---|
| Prazo de hoje (14h) é apertado para até o MVP mínimo | Alto | Escopo do Marco 1 é deliberadamente pequeno; mata-mata fica 100% placeholder |
| Lógica de desempate (7 critérios + reiteração) é complexa e fácil de errar | Alto | Isolada em `domain`, com TDD obrigatório (`TESTING_STRATEGY.md` §2.1), prazo até 27/06 — não é bloqueador de hoje |
| Geração automática do bracket falhar silenciosamente em 27/06 | Alto (afeta todos os usuários) | ADR-003: acionamento manual com conferência humana antes de "publicar" o bracket |
| Bloqueio de palpite só implementado no frontend (fraude) | Médio | ADR-004: validação sempre no backend, com teste E2E específico |
| Dono do projeto com pouca experiência em agentes/LLM pode aceitar código que "parece certo" mas tem bug sutil | Médio | `AGENTS.md`/`CLAUDE.md` exigem explicação + testes executados antes de considerar tarefa concluída |
| Mudança de stack no meio do projeto | Baixo/Médio | ADR-001 isola a decisão; camadas `domain`/`application` são quase independentes de framework, reduzindo custo de troca |

## 3. Melhorias sugeridas (pós-MVP)

- Cache/materialização da classificação por grupo (se a tela de acompanhamento for popular e recalcular ficar lento — só após medir, Guia Seção 5).
- Histórico/auditoria visível ao usuário ("seu palpite foi: X, registrado em: Y").
- Exportar leaderboard final em PDF/imagem para compartilhar.
- Internacionalização do fuso horário (hoje fixo em BRT) caso participantes de outros países entrem.
- Dashboard de admin dedicado (hoje, ações de admin podem ser rotas simples sem UI elaborada).

---

## 4. Próximo passo imediato

Com a fundação pronta, o próximo passo é **Marco 1**: gerar o plano técnico detalhado (use cases + schema Prisma + rotas) **apenas** para Identity + Tournament (seed) + Bolão (palpites de grupo), seguindo o fluxo descrito em `docs/ai-workflow/WORKFLOW.md`.
