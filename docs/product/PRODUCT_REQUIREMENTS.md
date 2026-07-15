# PRODUCT_REQUIREMENTS.md

> **Quando atualizar:** quando o escopo do MVP mudar, uma feature for adiada/antecipada, ou uma nova regra de negócio do `bolao-copa-2026_1.md` precisar virar feature.
> **Responsável:** dono do produto (você). Claude pode sugerir reordenações de prioridade, mas não decide sozinho.

---

## 1. Objetivo

Sistema web (intranet) onde colegas fazem palpites de placar para os 104 jogos da Copa 2026, acumulam pontos conforme `DOMAIN_RULES.md`, e disputam um ranking.

## 2. MVP — escopo funcional

### 2.1 Autenticação (Identity)
- Cadastro: nome, username, senha.
- Login: username, senha.
- `nome` exibido em toda a aplicação (header, leaderboard, lista de palpites).

### 2.2 Home
- Ranking geral (leaderboard): posição, nome, pontos totais.

### 2.3 Partidas
- Lista agrupada por data (fuso BRT), conforme `FRONTEND_GUIDELINES.md` §6.
- `MatchCard` por partida conforme `FRONTEND_GUIDELINES.md` §3.
- Envio/edição de palpite (gols casa/fora) respeitando bloqueio (`DOMAIN_RULES.md` §10, ADR-004).
- Exibição da pontuação obtida após a partida ser encerrada.
- Visualização dos palpites de outros usuários (quando permitido).

## 3. Fora do MVP de hoje (mas já modelado na arquitetura — ver `ROADMAP.md`)

- Geração automática do mata-mata (jogos 73–88) via Anexo C — ADR-003 define abordagem manual inicialmente.
- Cálculo automático de classificação/desempate em tempo real durante a fase de grupos (pode ser feito sob demanda/manual até 27/06).
- Integração com API externa de resultados (entrada manual de admin no MVP).
- 2FA, OAuth externo (ver `SECURITY.md` §8).
- Notificações (push/e-mail) de "palpite prestes a travar".

## 4. Critérios de aceite do MVP (resumo)

- [ ] Usuário consegue se cadastrar e logar.
- [ ] Usuário vê a lista de partidas agrupadas por data, em BRT.
- [ ] Usuário consegue enviar/editar palpite até o horário de bloqueio; após isso, recebe erro claro (frontend e backend).
- [ ] Após admin registrar resultado de uma partida, pontos são calculados e refletidos no leaderboard.
- [ ] Jogos 73–104 aparecem com placeholders legíveis mesmo sem times definidos.
