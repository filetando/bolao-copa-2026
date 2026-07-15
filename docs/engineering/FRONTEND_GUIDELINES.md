# FRONTEND_GUIDELINES.md

> **Quando atualizar:** novo padrão de componente, novo design token, ou mudança na forma de exibir horários/fases.
> **Stack assumida:** React + Vite + TypeScript + TailwindCSS (ADR-001).

---

## 1. Atomic Design (Guia, Seção 6)

```
src/
├── components/
│   ├── atoms/        # Button, Badge, FlagIcon, ScoreInput, Avatar
│   ├── molecules/     # ScoreRow (bandeira+nome+gols), TeamVsTeam, PointsBadge
│   ├── organisms/     # MatchCard, LeaderboardTable, PredictionForm, GroupStandingsTable
│   ├── templates/     # MatchesByDateLayout, AuthLayout
│   └── pages/         # HomePage, MatchesPage, LoginPage, FirstAccessPage, ProfilePage
```

## 2. Design Tokens (Guia, Seção 6)

Definir em `tailwind.config` (ou CSS vars) tokens **semânticos**, não cores cruas espalhadas:

```
--color-success      (placar exato / vitória do palpite)
--color-warning      (palpite parcialmente correto)
--color-neutral
--color-locked       (formulário travado)
--color-live         (partida ao vivo)
--spacing-card-gap
--font-score         (tamanho usado para os números de gols)
```

Permite dark mode/theming futuro sem reescrever componentes.

## 3. `MatchCard` — especificação do componente principal

Conforme prompt original, cada card de partida tem:

**Cabeçalho:**
- Horário convertido para BRT (`Intl.DateTimeFormat` com `timeZone: 'America/Sao_Paulo'`, a partir do `data_hora_utc`).
- Nome da fase (`fases.nome_exibicao`).
- Estádio.

**Conteúdo:**
- Seleção A: bandeira + nome + gols (ou placeholder, ex.: "Vencedor Jogo 73", se `equipe_casa_id` for NULL).
- "×" central.
- Gols + nome + bandeira da Seleção B.
- Se a partida ainda não ocorreu e o usuário não enviou palpite: campos editáveis de gols (inputs numéricos) em vez do placar.
- Se o formulário estiver travado (bloqueio de horário): inputs desabilitados + indicador visual (`--color-locked`) + texto "Palpites encerrados".

**Rodapé:**
- Pontuação obtida nesta partida (`+25`, `+10`, etc.) — só exibido após `pontos_obtidos` não ser NULL.

**Área adicional:**
- Botão "ver palpites de outros" — só habilitado conforme regra de visibilidade definida em `DOMAIN_RULES.md`/`PRODUCT_REQUIREMENTS.md` (ex.: só após o início da partida, para não revelar estratégia entre usuários antes do bloqueio).

## 4. Heurísticas e leis de UX aplicadas

- **Visibilidade de status (Nielsen #1):** todo `MatchCard` deixa claro o estado — agendado / travado / ao vivo / encerrado + pontuação.
- **Prevenção de erros (Nielsen #5):** inputs de gols são `<input type="number" min="0" max="20">`, evitando valores absurdos antes mesmo de chegar ao backend (mas backend revalida — defesa em profundidade).
- **Doherty Threshold (<400ms):** ao salvar um palpite, UI otimista (mostra o palpite salvo imediatamente) com rollback se a API rejeitar (ex.: `409 PREDICTION_LOCKED`).
- **Lei de Jakob:** ranking geral como home segue convenção de "leaderboard" comum (posição, nome, pontos), sem reinventar.

## 5. Acessibilidade (WCAG)

- Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande/ícones de status.
- Inputs de palpite com `<label>` associado (não apenas placeholder).
- Navegação por teclado funcional na lista de partidas e no formulário de palpite.
- Bandeiras (`FlagIcon`) com `alt`/`aria-label` com o nome da seleção, não apenas a imagem.

## 6. Fusos horários no frontend

- Backend sempre manda `data_hora_utc` (ISO 8601 com `Z`).
- Frontend converte para o fuso do usuário via `Intl.DateTimeFormat`, mas o agrupamento "Quinta-feira, 11 de Junho de 2026" (conforme prompt original) usa o **fuso de exibição padrão do bolão (BRT, fixo)**, não necessariamente o fuso do dispositivo — para que todos os usuários vejam as partidas agrupadas no mesmo dia, evitando confusão em torneios com jogos de madrugada (ex.: jogo às 00h+1 ET = 01h BRT, conforme calendário oficial).

## 7. Estados de partidas no mata-mata (jogos 73–104)

- Enquanto `equipe_casa_id`/`equipe_fora_id` forem NULL, renderizar `placeholder_casa`/`placeholder_fora` (ex.: "Vencedor Jogo 73", "Melhor 3º (A/B/C/D/F)") no lugar do nome+bandeira.
- Após `GenerateKnockoutBracket` (27/06), esses campos são preenchidos e o card passa a exibir times reais — nenhuma mudança de componente necessária, só dado diferente.
