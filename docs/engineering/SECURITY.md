# SECURITY.md

> **Quando atualizar:** ao adicionar qualquer novo endpoint, integração externa, ou mudança em autenticação/autorização.
> **Responsável:** todo PR que toca `presentation` ou `infrastructure/auth` deve passar pelo checklist deste documento (ver também `AGENTS.md`).
> Base: OWASP Top 10 (2021) + Secure by Design + POLP + Defesa em Profundidade (Guia, Seção 3).

---

## 1. Autenticação

- Login por `username` + `senha`. Cadastro coleta `nome`, `username`, `senha`.
- **Hashing de senha:** Argon2id, parâmetros mínimos `m=19456 (19 MiB), t=2, p=1` (ou bcrypt work factor ≥10 se Argon2id não estiver disponível na stack escolhida). Nunca MD5/SHA simples, nunca texto plano. Senha nunca aparece em logs.
- **Sessão:** cookie `httpOnly`, `secure`, `SameSite=Lax` (ou `Strict` se a UX permitir), contendo um token de sessão opaco ou JWT de curta duração (ex.: 2h) + refresh.
- Limite de tamanho de senha alinhado ao hashing escolhido (bcrypt trunca em 72 bytes — se usar bcrypt, validar isso no input).
- **Rate limiting** no endpoint de login (ex.: 5 tentativas / 15 min por IP+username) para mitigar brute force (A07).

## 2. Autorização (POLP — Princípio de Menor Privilégio)

- Dois papéis para o MVP: `user` e `admin`.
- `admin`: pode registrar resultados de partidas (`RegisterMatchResult`), disparar `GenerateKnockoutBracket`, gerenciar cadastro de equipes/calendário.
- `user`: pode submeter/editar os próprios palpites (até a janela de bloqueio), ver leaderboard, ver palpites de outros conforme regra de visibilidade.
- **Nunca** usar uma única conta "admin" compartilhada por conveniência — cada admin tem seu próprio usuário com `role = admin` (POLP, Guia Seção 3).
- Toda action de escrita (`SubmitPrediction`, `RegisterMatchResult`, etc.) verifica `usuario_id` da sessão contra o recurso sendo modificado — **Broken Access Control (A01)** é o item mais comum em apps desse tipo (ex.: usuário A tentando editar palpite de usuário B alterando o `usuario_id` no payload).

## 3. Defesa em profundidade — bloqueio de palpites

Esta é a regra de negócio mais sensível a fraude do sistema (ver ADR-004):

1. **Frontend:** desabilita o formulário e mostra contagem regressiva — UX, não segurança.
2. **Backend (use case):** revalida `now() (UTC) < partida.data_hora_utc - janela_bloqueio` a cada `SubmitPrediction`, **independente do que o frontend mandou**.
3. **Banco (opcional, fase 2):** trigger que rejeita `INSERT/UPDATE` em `palpites` se a partida já começou — camada extra caso algum código futuro pule o use case.

## 4. Injeção (A03) e validação de entrada

- **SQL Injection:** toda query via ORM (Prisma/Drizzle) com queries parametrizadas — **proibido** concatenar strings em SQL. Se uma query raw for inevitável, usar parâmetros nomeados/posicionais do driver, nunca interpolação de string.
- **Validação de DTOs:** todo input de `presentation` passa por um schema de validação (ex.: Zod) antes de chegar ao use case — tipos, ranges (ex.: `gols_casa_palpite >= 0`, números inteiros), tamanhos de string.
- **XSS:** React escapa por padrão (não usar `dangerouslySetInnerHTML` com dado de usuário). Nomes de usuário exibidos em toda a app (`nome`) devem ser tratados como texto, nunca HTML.
- **CSRF:** se usar cookies de sessão, exigir token CSRF (ou usar `SameSite=Strict`/Lax + verificação de header `Origin`/`Referer` em mutações).

## 5. Gestão de segredos

- `.env` para `DATABASE_URL`, `JWT_SECRET`, etc. — **nunca commitado** (`.gitignore` desde o primeiro commit).
- `.env.example` documenta as chaves necessárias **sem valores reais**.
- 12-Factor: configuração via variáveis de ambiente, nunca hardcoded (Guia Seção 7).

## 6. Logs de auditoria

- Ações administrativas sensíveis (`RegisterMatchResult`, `GenerateKnockoutBracket`, criação/edição de calendário) geram um registro de auditoria: `quem`, `quando`, `o quê` (diff do que mudou). Pode ser uma tabela simples `audit_log (id, usuario_id, acao, payload_json, created_at)`.
- Logs de erro nunca incluem `password_hash`, tokens de sessão ou payloads completos de login.

## 7. Componentes desatualizados (A06)

- Dependências (npm) atualizadas periodicamente; rodar `npm audit` (ou equivalente) antes de releases importantes (ex.: antes de 27/06, antes da final).

## 8. Itens explicitamente fora de escopo do MVP (justificar trade-off)

- OAuth/OIDC externo (Google/Microsoft login): YAGNI para um bolão de intranet com poucos usuários conhecidos — login simples usuário/senha é suficiente e mais rápido de entregar. Pode ser adicionado depois sem reestruturar o domínio (Identity já é um Bounded Context isolado).
- 2FA: mesmo raciocínio — risco baixo (não há dados financeiros), mas documentado como melhoria futura em `ROADMAP.md`.

---

## Checklist de segurança por PR (subset do checklist geral em AGENTS.md)

- [ ] Toda nova rota exige autenticação, exceto login/cadastro/health-check?
- [ ] Toda mutação verifica que `usuario_id` da sessão é dono do recurso (ou é `admin`)?
- [ ] Inputs validados por schema (tipo, range, tamanho)?
- [ ] Nenhuma string interpolada em SQL?
- [ ] Nenhum segredo hardcoded ou logado?
- [ ] Regra de bloqueio de palpite revalidada no backend (se a rota envolve `palpites`)?
