# WORKFLOW.md — Fluxo de Desenvolvimento com Claude

> **Quando atualizar:** quando o fluxo na prática divergir do descrito aqui (ex.: uma etapa se mostrar redundante para tarefas pequenas).
> **Responsável:** dono do projeto, com base na experiência de uso.

---

## Visão geral

```
Ideia → Análise → Design Técnico → Plano → Implementação → Testes → Code Review → Refatoração → Merge
```

Para um projeto de 1 pessoa usando Claude no VSCode, esse fluxo não significa "8 reuniões" — significa **8 momentos de conversa explícita com Claude**, cada um com um objetivo diferente, evitando o padrão "pede pra programar direto e corrige depois" (que é onde a maioria dos bugs de domínio mal-entendido acontece).

---

## 1. Ideia

Você descreve o que quer em linguagem natural (ex.: "quero a tela de envio de palpite para os jogos de grupo").

**Claude não programa ainda.**

## 2. Análise

Claude (papel: `domain-expert`, ver `docs/ai-workflow/skills/domain-expert.md`) verifica:
- A ideia está coberta por `DOMAIN_RULES.md`? Se não, é uma regra nova — precisa ser adicionada lá primeiro (com sua confirmação).
- Há impacto em `ARCHITECTURE.md` (novo agregado, novo evento, novo Bounded Context)?
- Há impacto em `DATABASE.md` (nova tabela/coluna)?

**Saída esperada:** lista curta de impactos + perguntas de esclarecimento, se houver.

## 3. Design Técnico

Claude propõe (papel: `backend-engineer`/`frontend-engineer`/`database-architect`, conforme o caso):
- Quais entidades/use cases/endpoints/componentes são afetados.
- Quais arquivos serão criados/modificados (caminhos exatos).
- Quais testes (`test-engineer`) serão necessários.

**Você aprova ou ajusta antes de seguir.** Esse é o ponto de checagem mais importante — mudar de ideia aqui custa minutos; mudar depois do código pronto custa horas.

## 4. Plano

Claude lista os passos em ordem (ex.: "1. migration X, 2. repository Y, 3. use case Z, 4. controller, 5. componente frontend, 6. testes"). Para tarefas pequenas, Plano e Design Técnico podem ser combinados numa só mensagem.

## 5. Implementação

Claude implementa **um passo do plano por vez** (ou um conjunto coeso pequeno), seguindo:
- `AGENTS.md` (regras globais, checklists).
- `BACKEND_GUIDELINES.md`/`FRONTEND_GUIDELINES.md` conforme o caso.
- Comentários referenciando `DOMAIN_RULES.md` quando implementar regra de negócio.

## 6. Testes

Claude (papel: `test-engineer`) escreve os testes definidos no Design Técnico, **executa** (não apenas escreve) e reporta o resultado real (verde/vermelho), não uma suposição.

## 7. Code Review

Claude (papel: `security-reviewer` para mudanças sensíveis, `ux-reviewer` para frontend) revisa contra os checklists de `SECURITY.md`/`FRONTEND_GUIDELINES.md`/`AGENTS.md` antes de você considerar "pronto".

## 8. Refatoração

Se o Code Review apontar débito técnico aceitável para depois, registrar em `ROADMAP.md` (não deixar implícito). Se for crítico, refatorar antes do merge (Boy Scout Rule).

## 9. Merge

Checklist final de `AGENTS.md` ("antes de mergear") confirmado.

---

## Como pedir tarefas a Claude (modelo de prompt)

> "Quero implementar [feature]. Já consultou `AGENTS.md`, `DOMAIN_RULES.md` e [doc relevante]? Faça a Análise e o Design Técnico antes de programar."

Para tarefas que envolvem banco: sempre adicionar "siga o checklist de migrations do `AGENTS.md`".

Para tarefas que envolvem regra de pontuação/desempate/Anexo C: sempre adicionar "cite a seção exata de `DOMAIN_RULES.md` que está implementando".
