# DESIGN_SYSTEM.md

> Sistema de design do **Bolão Copa 2026** (camada de apresentação apenas — nenhuma regra de negócio aqui).
> **Stack:** React 19 + TailwindCSS v4 (tokens via `@theme` em `src/index.css`).
> **Quando atualizar:** novo token, novo componente visual, ou mudança de identidade.
> **Restrição legal:** identidade 100% original, inspirada no universo do futebol/Copa. **Sem** marcas, logos, emblemas, mascotes ou tipografia oficiais da FIFA / Copa do Mundo 2026. Apenas fontes/recursos livres (Google Fonts, flagcdn).

---

## 1. Conceito

> **"Energia de dia de jogo."** Estética esportiva, vibrante e em movimento — placar de estádio, cor forte, contraste alto e microinterações que dão a sensação de "ao vivo". Mobile-first, porque a arquibancada está no bolso.

Princípios:
- **Hierarquia por energia:** o que é "agora" (jogo de hoje, sua posição no ranking, palpite a fazer) brilha; o resto recua.
- **Placar é protagonista:** números grandes, tabulares, com cara de scoreboard.
- **Feedback imediato:** salvar palpite, acertar pontos e subir no ranking têm resposta visual.
- **Tokens, nunca cor crua:** todo componente consome variáveis do tema.

---

## 2. Paletas — escolha 1 das 2

Ambas atendem **WCAG AA** (texto normal ≥ 4.5:1; texto grande/ícones ≥ 3:1). Os pares de contraste críticos estão anotados. Os valores finais são afinados na implementação, mas a direção é esta.

### 🅰️ Opção A — "Sob os Refletores" (tema escuro)

Fundo escuro de estádio à noite + acentos elétricos. Moderno, ousado, "e-sports meets futebol". O placar e os destaques saltam do fundo.

| Token | Hex | Onde usar | Contraste |
|---|---|---|---|
| `--bg` | `#0B1020` | Fundo geral (azul quase preto) | base |
| `--surface` | `#151B2E` | Cards, header | — |
| `--surface-2` | `#202A45` | Cards aninhados, inputs, hover | — |
| `--border` | `#2E3A5C` | Bordas sutis | — |
| `--primary` | `#3A6BFF` | Ações principais, links, foco (azul elétrico) | branco s/ primary ≈ 4.8:1 ✅ |
| `--primary-strong` | `#2453E6` | Hover/active do primary | — |
| `--accent` | `#C7FF3D` | CTA de palpite, destaques "volt", barra do líder | texto escuro `#0B1020` s/ accent ≈ 14:1 ✅ |
| `--accent-2` | `#FF2D7E` | Detalhes "ao vivo"/torcida, badges raros (magenta) | branco ≈ 4.6:1 ✅ |
| `--text` | `#F5F7FF` | Texto principal | s/ `--bg` ≈ 16:1 ✅ |
| `--text-muted` | `#A7B0C8` | Texto secundário | s/ `--surface` ≈ 7:1 ✅ |
| `--success` | `#28D17C` | Acerto/vitória do palpite, classificados | texto escuro ≈ 8:1 ✅ |
| `--warning` | `#FFB020` | Palpite parcial, atenção | texto escuro ≈ 10:1 ✅ |
| `--danger` / `--live` | `#FF5A5A` | Erro, partida ao vivo | branco ≈ 4.5:1 ✅ |
| `--locked` | `#5C678A` | Formulário travado (cinza dessaturado) | — |

Sensação: **arena noturna, neon, alta energia.** Ótimo para placar e gráficos.

---

### 🅱️ Opção B — "Festa nas Arquibancadas" (tema claro, quente)

Fundo claro e quente + laranja-pôr-do-sol como cor primária e roxo vibrante como acento. Calor latino (sede 2026 inclui o México), festivo e luminoso. Continua "leve" para leitura longa de listas/tabelas.

| Token | Hex | Onde usar | Contraste |
|---|---|---|---|
| `--bg` | `#FBF7F2` | Fundo geral (off-white quente) | base |
| `--surface` | `#FFFFFF` | Cards, header claro | — |
| `--surface-2` | `#F4EEE6` | Inputs, hover, faixas | — |
| `--border` | `#E7DED2` | Bordas | — |
| `--primary` | `#E0480E` | Ações principais, links (laranja profundo) | branco ≈ 4.7:1 ✅ |
| `--primary-bright` | `#FF5A1F` | Decorativo/ícones/headlines grandes (laranja vivo) | uso em texto grande/ícone ✅ |
| `--accent` | `#6D28D9` | Destaques, badge do líder, foco (roxo vibrante) | branco ≈ 6.7:1 ✅ |
| `--accent-2` | `#0EA5A5` | Detalhe fresco/secundário (teal) | branco ≈ 3.3:1 (texto grande/ícone) |
| `--text` | `#1C1622` | Texto principal (plum quase preto) | s/ `--bg` ≈ 15:1 ✅ |
| `--text-muted` | `#6B6275` | Texto secundário | s/ `--surface` ≈ 6:1 ✅ |
| `--success` | `#15803D` | Acerto/vitória, classificados | branco ≈ 5.1:1 ✅ |
| `--warning` | `#B45309` | Palpite parcial | branco ≈ 5.0:1 ✅ |
| `--danger` / `--live` | `#DC2626` | Erro, ao vivo | branco ≈ 4.9:1 ✅ |
| `--locked` | `#9C94A3` | Formulário travado | em fundo claro p/ texto grande ✅ |

Sensação: **diurno, festivo, caloroso.** Mantém parentesco com a identidade verde atual (verde vira o "success/classificado"), mas com energia muito maior.

---

### Comparação rápida

| | 🅰️ Sob os Refletores | 🅱️ Festa nas Arquibancadas |
|---|---|---|
| Humor | Noturno, neon, ousado | Diurno, quente, festivo |
| Base | Escura | Clara |
| Primária | Azul elétrico | Laranja pôr-do-sol |
| Acento | Volt (verde-limão) | Roxo vibrante |
| Leitura de tabelas longas | Boa (mas exige cuidado de fadiga) | Excelente |
| "Cara de scoreboard" | Muito forte | Forte |

> **As duas usam o mesmo restante do sistema** (tipografia, espaçamento, componentes, movimento) — muda só a paleta. **Me diga A ou B** (ou um híbrido) para eu seguir à Fase 3.

---

## 3. Tipografia

Todas Google Fonts (livres), carregadas com `display=swap`.

| Papel | Família | Pesos | Uso |
|---|---|---|---|
| **Display / títulos** | **Archivo** (com eixo *expanded* quando disponível) | 700 / 800 / 900 | `h1`–`h3`, nomes de seção, banner de fase. Caixa-alta com `letter-spacing` levemente negativo nos pesos pesados → clima esportivo |
| **Texto** | **Inter** | 400 / 500 / 600 | Corpo, labels, navegação, descrições |
| **Placar / números** | **Chivo Mono** (ou Inter `tabular-nums` como fallback) | 600 / 700 | Gols, pontos, posições — alinhamento tabular tipo placar eletrônico |

Escala (mobile-first, base 16px / `1rem`):

| Token | rem | px | Uso |
|---|---|---|---|
| `--text-xs` | 0.75 | 12 | meta, legendas |
| `--text-sm` | 0.875 | 14 | corpo secundário |
| `--text-base` | 1 | 16 | corpo |
| `--text-lg` | 1.125 | 18 | subtítulo |
| `--text-xl` | 1.375 | 22 | título de página (mobile) |
| `--text-2xl` | 1.75 | 28 | título de página (desktop), placar |
| `--font-score` | 2 | 32 | placar grande (já existe no `@theme`) |
| `--text-display` | 2.5–3 | 40–48 | banner/herói |

---

## 4. Espaçamento e formas

- **Grid base 8px** (com meio-passo de 4px): `--space-1:4px`, `2:8px`, `3:12px`, `4:16px`, `6:24px`, `8:32px`, `12:48px`. `--spacing-card-gap` (já existe) = 16px.
- **Raios:** `--radius-sm:8px`, `--radius-md:12px` (cards), `--radius-lg:16px` (cards de destaque), `--radius-pill:9999px` (badges, abas, botões de pílula).
- **Elevação (sombras):**
  - `--shadow-sm`: cards em repouso.
  - `--shadow-md`: card "de hoje"/ativo, dropdowns.
  - `--shadow-glow`: brilho colorido do accent em CTAs e no líder do ranking (sutil, ex.: `0 0 0 3px color-mix(...)`).
- **Largura de conteúdo:** coluna principal `max-w-lg`/`max-w-2xl` (já em uso) mantida para leitura confortável no mobile.

---

## 5. Componentes (estados e estilo)

> Mantêm a API atual dos componentes (props inalteradas) — muda só o visual.

**Botão (`Button`)**
- Variantes: `primary` (fundo `--primary`, texto claro), `accent` (CTA forte — salvar palpite, usa `--accent` com brilho), `secondary` (contorno/`--surface-2`), `danger` (`--danger`), `ghost` (só texto, p/ "Ver palpites"/"Sair").
- Tamanhos: `sm`, `md`. Forma: `--radius-md` (ou `--radius-pill` para CTAs).
- Estados: hover (escurece/clareia + leve `translateY(-1px)`), active (`scale(0.98)`), focus-visible (anel `--primary`/`--accent` 2px com offset), disabled (opacidade 50%), loading (spinner inline em vez de só texto "Aguarde…").

**Card de partida (`MatchCard`)** — componente principal (ver FRONTEND_GUIDELINES §3)
- Cabeçalho: fase (chip), horário BRT, estádio.
- Linha de confronto: bandeira + sigla, placar/inputs `--font-score` tabular, "×" central.
- Estados visuais distintos: **aberto** (inputs realçados, CTA accent), **travado** (`--locked`, cadeado + "Palpites encerrados"), **ao vivo** (pulso `--live`), **encerrado** (placar final + categoria do acerto + `+pts`).
- Borda esquerda colorida por estado (accent = aberto, locked = travado, live = ao vivo, success/neutral = encerrado) para leitura rápida.
- "Jogo de hoje" recebe `--shadow-md` e leve realce.

**Card/linha de ranking (`LeaderboardTable`)**
- **Pódio destacado:** 1º/2º/3º com medalha + cor (ouro/prata/bronze) e o 1º com `--shadow-glow`.
- Linha do usuário atual: faixa com `--accent` translúcido + rótulo "(você)" e borda lateral.
- Pontos em `--font-score` tabular, alinhados à direita. Animação de contagem ao atualizar (respeitando reduced-motion).

**Inputs / selects**
- Fundo `--surface-2`, borda `--border`, foco com anel `--primary`. Inputs de gols numéricos grandes e tocáveis (alvo ≥ 44px no mobile). Label sempre associado (a11y).

**Badges / medalhas (`Badge`)**
- Pílula (`--radius-pill`), variantes mapeadas a tokens: `success`, `warning`, `neutral`, `locked`, `live`. Acerto/erro **nunca** só por cor — sempre com rótulo/ícone redundante (daltonismo).

**Abas e navegação (`MainLayout`)**
- **Mobile:** barra de navegação inferior fixa (bottom tab bar) com ícones + rótulo — resolve o estouro atual da nav horizontal. Item ativo com cor `--primary`/`--accent` e indicador.
- **Desktop:** header superior com nav horizontal (como hoje, repaginado). Saudação/Sair com foco visível.

**Loading**
- **Skeletons** (blocos com shimmer suave) para ranking, lista de partidas e tabelas de grupo — substituem os textos "Carregando…".

---

## 6. Movimento

- **Durações:** `--motion-fast:120ms` (hover/press), `--motion-base:200ms` (transições de estado), `--motion-slow:320ms` (entrada de cards/modais).
- **Easing:** padrão `--ease-standard: cubic-bezier(0.2, 0, 0, 1)`; entrada enfática `--ease-emphasized: cubic-bezier(0.2, 0, 0, 1.2)` (leve overshoot em sucessos).
- **Onde aplicar (microinterações sutis e performáticas — só `transform`/`opacity`):**
  - Salvar palpite: check animado + leve pulse no card ("✓ Palpite salvo").
  - Atualização de pontos/placar: contagem numérica + flash do `+pts`.
  - Ranking: transição suave de posição; brilho no líder.
  - Hover/press de botões e cards; entrada escalonada (stagger) de cards na lista.
  - Partida ao vivo: pulso lento no indicador `--live`.
  - Skeleton shimmer no carregamento.
- **Acessibilidade:** **respeitar `prefers-reduced-motion: reduce`** — desativar animações de movimento/contagem, mantendo apenas mudanças instantâneas de estado.

---

## 7. Responsividade (mobile-first)

- **Abordagem:** mobile-first; estilos base para celular, `min-width` para ampliar.
- **Breakpoints (Tailwind):** `sm 640px` (tablet retrato), `md 768px` (tablet), `lg 1024px` (desktop).
- **Padrões-chave:**
  - Navegação: **bottom tab bar no mobile**, header horizontal a partir de `md`.
  - Coluna única no mobile; ranking + gráfico podem ir lado a lado em `lg`.
  - `ClassificacaoPage`: no mobile, reduzir colunas (priorizar Pts/J/SG; demais via expandir) ou rolagem horizontal com colunas fixas; grade de 2 grupos por linha em `lg`.
  - Alvos de toque ≥ 44px (inputs de gols, abas, botões).

---

## 8. Estratégia de tokens (centralização)

- Tudo vive em `src/index.css` dentro de **`@theme`** (Tailwind v4), estendendo os tokens semânticos que já existem (`--color-success`, `--color-warning`, `--color-neutral`, `--color-locked`, `--color-live`, `--spacing-card-gap`, `--font-score`).
- Os componentes consomem os tokens via utilitários Tailwind gerados a partir do tema (ex.: `bg-primary`, `text-muted`, `rounded-md`) — **zero hex/cor crua** espalhada no JSX.
- Trocar de paleta (A↔B) ou habilitar dark mode no futuro = alterar apenas o bloco de tokens, sem tocar componentes.
- Tokens nomeados por **função semântica**, não por cor literal (`--accent`, não `--volt-green`), para que a paleta possa mudar sem renomear nada.
</content>
</invoke>
