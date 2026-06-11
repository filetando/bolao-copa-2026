# DECISIONS_LOG.md

> Registro de Decisões de Arquitetura (ADR — Architecture Decision Records), em formato leve.
> **Quem atualiza:** quem propõe a decisão (humano ou Claude, mediante aprovação humana).
> **Quando atualizar:** sempre que uma decisão estrutural for tomada, revertida ou substituída. Decisões antigas não são apagadas — são marcadas como `Substituída por ADR-XXX`.

Cada entrada segue o formato: **Contexto → Decisão → Alternativas consideradas → Consequências**.

---

## ADR-001 — Stack tecnológica

**Status:** Proposto (assumido como padrão de trabalho até ser confirmado/alterado pelo dono do projeto)

**Contexto:** O projeto é um bolão corporativo (intranet), prazo curto, 1 desenvolvedor com pouca experiência em agentes de IA, vida útil curta porém com dados reais de usuários (login/senha) e necessidade de manutenção durante ~40 dias de torneio + encerramento.

**Decisão:**
- **Backend:** Node.js + TypeScript (Fastify). Tipagem estática ajuda Claude a detectar erros de contrato em tempo de compilação — mitiga "alucinações de assinatura de função" (Seção 10 do guia).
- **Banco de dados:** PostgreSQL. Relacional, ACID, suporta bem os relacionamentos N:N (palpites × partidas, equipes × grupos) e os índices necessários para o leaderboard.
- **ORM/Query layer:** Prisma (ou Drizzle) — escolher um e documentar aqui quando confirmado. Evita SQL manual espalhado, reduz risco de injection por concatenação.
- **Frontend:** React + Vite + TypeScript, TailwindCSS para Design Tokens.
- **Autenticação:** sessão via cookie httpOnly + JWT de curta duração, hashing com Argon2id (ver `SECURITY.md`).
- **Deploy:** containerizado (Docker), variáveis de ambiente via `.env` (nunca commitado), seguindo 12-Factor.

**Alternativas consideradas:**
- PHP/Laravel: descartado por falta de familiaridade do dono do projeto, mas é uma alternativa válida se preferir.
- NoSQL (MongoDB/Firebase): descartado — o domínio é fortemente relacional (grupos → equipes → partidas → palpites → pontuação), com necessidade de transações e integridade referencial. Guia de Fundamentos, Seção 2, recomenda relacional para esse perfil.
- Microsserviços: descartado — projeto mono-equipe, mono-domínio relativamente pequeno. Guia, Seção 0, classifica isso como "Mono-nó / monolito simples": teoremas distribuídos (CAP, Saga, Event Sourcing, CQRS) seriam complexidade desnecessária.

**Consequências:**
- Toda a documentação subsequente (BACKEND_GUIDELINES, DATABASE, etc.) assume essa stack.
- Se o dono do projeto já tiver outra stack escolhida, esta ADR deve ser atualizada **antes** de qualquer geração de código, e os documentos dependentes revisados.

---

## ADR-002 — Estilo de arquitetura: Monólito Modular com Clean Architecture

**Status:** Aceito

**Contexto:** Guia de Fundamentos recomenda Clean Architecture / Ports & Adapters para isolar o domínio de frameworks e banco, mas alerta contra complexidade desnecessária em projetos pequenos (Seção 0 e 11).

**Decisão:** Monólito modular, organizado em camadas (`domain`, `application`, `infrastructure`, `presentation`), com Bounded Contexts internos claros (ver `ARCHITECTURE.md`). Sem microsserviços, sem mensageria assíncrona, sem CQRS/Event Sourcing/Saga.

**Alternativas consideradas:** Microsserviços por contexto — descartado por overhead operacional incompatível com o prazo e a equipe de 1 pessoa.

**Consequências:** Comunicação entre Bounded Contexts é feita via chamadas de função/use cases dentro do mesmo processo, nunca via acesso direto a tabelas de outro contexto (Anti-Corruption Layer interna, ver ARCHITECTURE.md).

---

## ADR-003 — Geração do mata-mata: manual na v1, automatizável depois

**Status:** Aceito

**Contexto:** O cálculo de classificação final, desempate (7 critérios + reiteração) e aplicação do Anexo C só acontece **uma vez**, em 27/06/2026. Implementar isso 100% automatizado antes do prazo de hoje é inviável e de alto risco (lógica complexa, difícil de testar a tempo).

**Decisão:** Para a v1 (MVP de hoje), os jogos 73–104 são cadastrados com placeholders textuais ("Vencedor Grupo A", "Melhor 3º C/D/F/G/H" etc.). O cálculo de classificação/desempate/Anexo C é implementado como **módulo de domínio isolado e testável** (ver DOMAIN_RULES.md), mas seu **acionamento em produção em 27/06 pode ser manual** (endpoint/admin action que o dono do projeto dispara após conferir a classificação oficial), evoluindo para automático (cron/trigger) apenas se houver tempo e os testes do módulo estiverem verdes.

**Alternativas consideradas:** Trigger/cron 100% automático desde o início — descartado para a v1 pelo risco de bugs não detectados rodarem sem supervisão num evento que acontece uma única vez.

**Consequências:** O módulo de classificação deve ser desenvolvido com TDD (testes cobrindo casos de tríplice empate, reinício de confronto direto, etc.) **antes** de 27/06, mesmo que seu acionamento seja manual no dia.

---

## ADR-004 — Bloqueio de palpites é responsabilidade do backend, não do frontend

**Status:** Aceito

**Contexto:** Regra de negócio crítica contra fraude: ninguém pode enviar/alterar palpite após o início da partida (ou 5–10 min antes).

**Decisão:** A validação de horário-limite é feita **sempre no backend** (use case `SubmitPrediction`), comparando `now() (UTC)` com `partida.horario_inicio - janela_bloqueio`. O frontend pode (e deve) desabilitar o formulário preventivamente por UX, mas isso **nunca** é a fonte de verdade.

**Consequências:** Toda a lógica de "Defesa em Profundidade" (Seção 3 do guia) se aplica aqui — UI desabilita, API valida, e o teste E2E cobre a tentativa de envio tardio via chamada direta à API.

---

## ADR-005 — Fonte do calendário da fase de grupos e regra de conversão de fuso

**Status:** Aceito

**Contexto:** `bolao-copa-2026_1.md` §8 trazia um calendário parcial (49 de 72 jogos da fase de grupos). Foi recebida uma versão completa (`docs/architecture/calendario_fase_grupos.md`), verificada programaticamente: 72 jogos, 12 grupos × 6 jogos, 4 equipes/grupo com 3 jogos cada, todos os confrontos do round-robin presentes.

**Decisão:**
- Para os jogos 1–72, `docs/architecture/calendario_fase_grupos.md` + `seed-data/{equipes,partidas_fase_grupos}.json` são a fonte de verdade, substituindo a tabela parcial de `bolao-copa-2026_1.md` §8.
- `data_hora_utc` é calculado a partir da coluna "Horário ET" da fonte (ET = UTC-4), **não** a partir da coluna "Horário BRT" (que contém conversões inconsistentes na fonte). Detalhes em `DATABASE.md` §2.5.1.

**Consequências:** o frontend deve sempre derivar BRT a partir do `data_hora_utc` armazenado (UTC-3 fixo), nunca reproduzir a coluna BRT da fonte original.

---

## Histórico de revisões

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-11 | Criação do documento (fundação do projeto) | Claude (revisão pendente do dono do projeto) |
| 2026-06-11 | ADR-005 — calendário completo da fase de grupos | Claude |
