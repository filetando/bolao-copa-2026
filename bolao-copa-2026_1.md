# Bolão Copa do Mundo FIFA 2026 — Regras, Calendário e Arquitetura

> Documento de referência para desenvolvimento de aplicativo web de bolão corporativo (intranet).

---

## Sumário

1. [Visão Geral do Torneio](#1-visão-geral-do-torneio)
2. [Estrutura da Fase de Grupos](#2-estrutura-da-fase-de-grupos)
3. [Critérios de Desempate (Fase de Grupos)](#3-critérios-de-desempate-fase-de-grupos)
4. [Classificação dos Terceiros Colocados](#4-classificação-dos-terceiros-colocados)
5. [Matriz de Alocação dos Terceiros (Anexo C FIFA)](#5-matriz-de-alocação-dos-terceiros-anexo-c-fifa)
6. [Chaveamento do Mata-Mata](#6-chaveamento-do-mata-mata)
7. [Gestão de Fusos Horários](#7-gestão-de-fusos-horários)
8. [Calendário — Fase de Grupos](#8-calendário--fase-de-grupos)
9. [Calendário — Fase Eliminatória](#9-calendário--fase-eliminatória)
10. [Sistema de Pontuação do Bolão](#10-sistema-de-pontuação-do-bolão)
11. [Multiplicadores por Fase](#11-multiplicadores-por-fase)
12. [Palpites de Longo Prazo (Mercados Estáticos)](#12-palpites-de-longo-prazo-mercados-estáticos)
13. [Notas de Arquitetura Técnica](#13-notas-de-arquitetura-técnica)

---

## 1. Visão Geral do Torneio

| Item | Detalhe |
|------|---------|
| Edição | Copa do Mundo FIFA 2026 |
| Países-sede | Estados Unidos, Canadá e México |
| Número de seleções | **48 equipes** |
| Total de partidas | **104 jogos** |
| Duração | **39 dias** |
| Abertura | **11 de junho de 2026** |
| Grande Final | **19 de julho de 2026** |

---

## 2. Estrutura da Fase de Grupos

- **12 grupos** (A a L), com **4 equipes cada**.
- Cada seleção disputa **3 partidas** dentro do seu grupo.
- Total de partidas na fase de grupos: **72 jogos**.

### Sistema de pontos

| Resultado | Pontos |
|-----------|--------|
| Vitória | 3 pontos |
| Empate | 1 ponto |
| Derrota | 0 pontos |

> **Não há prorrogação nem pênaltis na fase de grupos.**

### Classificação por grupo

- **1º e 2º colocados** de cada grupo avançam automaticamente → **24 equipes**.
- As **8 melhores equipes** entre os 12 terceiros colocados também avançam → **8 equipes adicionais**.
- Total de classificados para o mata-mata: **32 equipes**.
- **Eliminados:** as 4 piores equipes em 3º lugar e todos os 4º colocados.

---

## 3. Critérios de Desempate (Fase de Grupos)

Quando duas ou mais equipes terminam empatadas em pontos, aplica-se a seguinte hierarquia **em ordem estrita**:

> ⚠️ **Mudança importante em 2026:** O confronto direto passou a ser o **primeiro** critério (antes era o saldo de gols geral). Isso é diferente das edições anteriores (inclusive Qatar 2022).

### Hierarquia dos 7 critérios

| Ordem | Critério |
|-------|----------|
| **1º** | Pontos obtidos nos confrontos diretos entre as equipes empatadas |
| **2º** | Saldo de gols nos confrontos diretos |
| **3º** | Gols marcados (gols pró) nos confrontos diretos |
| **4º** | Saldo de gols em todas as partidas do grupo |
| **5º** | Gols marcados em todas as partidas do grupo |
| **6º** | Pontos de Fair Play (disciplina — ver tabela abaixo) |
| **7º** | Posição no Ranking Mundial da FIFA (publicação mais recente) |

> **Regra de reiteração:** Se, após aplicar os critérios de confronto direto, apenas uma equipe for separada (restando duas ainda empatadas), o algoritmo **reinicia os critérios de confronto direto** somente para essas duas equipes antes de avançar ao critério geral.

### Pontuação de Fair Play (cartões)

| Situação | Dedução |
|----------|---------|
| Cartão amarelo | −1 ponto |
| Segundo amarelo → vermelho indireto | −3 pontos |
| Vermelho direto | −4 pontos |
| Amarelo + vermelho direto | −5 pontos |

> 📌 **Referência histórica:** Em 2018, o Senegal foi eliminado em detrimento do Japão exclusivamente por acúmulo de cartões amarelos.

---

## 4. Classificação dos Terceiros Colocados

- 12 grupos produzem **12 equipes em 3º lugar**.
- Apenas as **8 melhores** avançam.
- As **4 piores** são eliminadas.

A seleção das 8 melhores segue os mesmos critérios de desempate da fase de grupos, mas comparando os 12 terceiros colocados entre si (apenas os resultados de suas 3 partidas de grupo).

---

## 5. Matriz de Alocação dos Terceiros (Anexo C FIFA)

Leve em consideração o arquivo README_confrontos_terceiros.md
O arquivo confrontos_terceiros com todas as possibilidades de confrontos existe em sql, csv e json. Pode escolher qual for melhor.

## 6. Chaveamento do Mata-Mata

As partidas da fase eliminatória são numeradas de **73 a 104**.

Em todas as fases eliminatórias, empates no tempo normal levam a **prorrogação** (2 × 15 min) e, se persistir, **pênaltis**.

### 16-Avos de Final (Jogos 73–88) — 28 de junho a 3 de julho

| Jogo | Confronto |
|------|-----------|
| 73 | 2º Grupo A × 2º Grupo B |
| 74 | 1º Grupo E × Melhor 3º (A/B/C/D/F) |
| 75 | 1º Grupo F × 2º Grupo C |
| 76 | 1º Grupo C × 2º Grupo F |
| 77 | 1º Grupo I × Melhor 3º (C/D/F/G/H) |
| 78 | 2º Grupo E × 2º Grupo I |
| 79 | 1º Grupo A × Melhor 3º (C/E/F/H/I) |
| 80 | 1º Grupo L × Melhor 3º (E/H/I/J/K) |
| 81 | 1º Grupo D × Melhor 3º (B/E/F/I/J) |
| 82 | 1º Grupo G × Melhor 3º (A/E/H/I/J) |
| 83 | 2º Grupo K × 2º Grupo L |
| 84 | 1º Grupo H × 2º Grupo J |
| 85 | 1º Grupo B × Melhor 3º (E/F/G/I/J) |
| 86 | 1º Grupo J × 2º Grupo H |
| 87 | 1º Grupo K × Melhor 3º (D/E/I/J/L) |
| 88 | 2º Grupo D × 2º Grupo G |

### Oitavas de Final (Jogos 89–96) — 4 a 7 de julho

| Jogo | Confronto |
|------|-----------|
| 89 | Venc. Jogo 74 × Venc. Jogo 77 |
| 90 | Venc. Jogo 73 × Venc. Jogo 75 |
| 91 | Venc. Jogo 76 × Venc. Jogo 78 |
| 92 | Venc. Jogo 79 × Venc. Jogo 80 |
| 93 | Venc. Jogo 83 × Venc. Jogo 84 |
| 94 | Venc. Jogo 81 × Venc. Jogo 82 |
| 95 | Venc. Jogo 86 × Venc. Jogo 88 |
| 96 | Venc. Jogo 85 × Venc. Jogo 87 |

### Quartas de Final (Jogos 97–100) — 9 a 11 de julho

| Jogo | Confronto |
|------|-----------|
| 97 | Venc. Jogo 89 × Venc. Jogo 90 |
| 98 | Venc. Jogo 93 × Venc. Jogo 94 |
| 99 | Venc. Jogo 91 × Venc. Jogo 92 |
| 100 | Venc. Jogo 95 × Venc. Jogo 96 |

### Semifinais (Jogos 101–102) — 14 e 15 de julho

| Jogo | Confronto |
|------|-----------|
| 101 | Venc. Jogo 97 × Venc. Jogo 98 |
| 102 | Venc. Jogo 99 × Venc. Jogo 100 |

### Terceiro Lugar e Final

| Jogo | Confronto | Data |
|------|-----------|------|
| 103 | Perd. Jogo 101 × Perd. Jogo 102 | **18 de julho** |
| 104 | Venc. Jogo 101 × Venc. Jogo 102 | **19 de julho (FINAL)** |

---

## 7. Gestão de Fusos Horários

Todas as datas e horas devem ser armazenadas em **UTC** no backend e convertidas para o fuso local do usuário no frontend.

| Fuso | Sigla | UTC | Diferença para Brasília (BRT / UTC-3) | Cidades |
|------|-------|-----|----------------------------------------|---------|
| Eastern Time | ET | UTC-4 | −1h (jogo às 16h ET = 17h BRT) | NY/NJ, Filadélfia, Boston, Atlanta, Miami, Toronto |
| Central Time | CT | UTC-5 | −2h (jogo às 16h CT = 18h BRT) | Dallas, Houston, Kansas City |
| México | — | UTC-6 | −3h (jogo às 16h MX = 19h BRT) | Cidade do México, Guadalajara, Monterrey |
| Pacific Time | PT | UTC-7 | −4h (jogo às 16h PT = 20h BRT) | Los Angeles, Seattle, San Francisco, Vancouver |

> 📌 O México aboliu o horário de verão em 2023, mantendo UTC-6 estável durante todo o torneio.  
> 📌 O Brasil também **não adota horário de verão** durante o torneio — usar sempre UTC-3 fixo.

**Boas práticas para o app:**
- Bloquear envio de palpites com **5 a 10 minutos de antecedência** do horário de início.
- Usar um `cron job` que verifique a cada minuto as partidas iminentes.
- Partidas simultâneas (encerramento de grupos) devem travar múltiplos formulários ao mesmo tempo.

---

## 8. Calendário — Fase de Grupos

| Fase | Data | Partida (Grupo) | Horário ET | Horário BRT | Estádio / Cidade |
|------|------|-----------------|------------|-------------|------------------|
| Abertura | 11/06 | México × África do Sul (A) | 15h00 | **16h00** | Estádio Azteca, Cidade do México |
| Abertura | 11/06 | Coreia do Sul × Rep. Tcheca (A) | 22h00 | **23h00** | Estádio Akron, Guadalajara |
| R1 | 12/06 | Canadá × Bósnia-Herzegovina (B) | 15h00 | **16h00** | BMO Field, Toronto |
| R1 | 12/06 | EUA × Paraguai (D) | 21h00 | **22h00** | SoFi Stadium, Los Angeles |
| R1 | 13/06 | Qatar × Suíça (B) | 15h00 | **16h00** | Levi's Stadium, San Francisco |
| R1 | 13/06 | **Brasil × Marrocos (C)** | 18h00 | **19h00** | MetLife Stadium, Nova Jersey |
| R1 | 13/06 | Haiti × Escócia (C) | 21h00 | **22h00** | Gillette Stadium, Boston |
| R1 | 13/06 | Austrália × Turquia (D) | 00h00+1 | **01h00** | BC Place, Vancouver |
| R1 | 14/06 | Alemanha × Curaçao (E) | 13h00 | **14h00** | NRG Stadium, Houston |
| R1 | 14/06 | Holanda × Japão (F) | 16h00 | **17h00** | AT&T Stadium, Dallas |
| R1 | 14/06 | Costa do Marfim × Equador (E) | 19h00 | **20h00** | Lincoln Financial Field, Filadélfia |
| R1 | 14/06 | Suécia × Tunísia (F) | 22h00 | **23h00** | Estadio BBVA, Monterrey |
| R1 | 15/06 | Espanha × Cabo Verde (H) | 12h00 | **13h00** | Mercedes-Benz Stadium, Atlanta |
| R1 | 15/06 | Bélgica × Egito (G) | 15h00 | **16h00** | BC Place, Vancouver |
| R1 | 15/06 | Arábia Saudita × Uruguai (H) | 18h00 | **19h00** | Hard Rock Stadium, Miami |
| R1 | 15/06 | Irã × Nova Zelândia (G) | 21h00 | **22h00** | SoFi Stadium, Los Angeles |
| R1 | 16/06 | França × Senegal (I) | 15h00 | **16h00** | MetLife Stadium, Nova Jersey |
| R1 | 17/06 | Portugal × Congo DR (K) | 13h00 | **14h00** | NRG Stadium, Houston |
| R1 | 17/06 | Inglaterra × Croácia (L) | 16h00 | **17h00** | AT&T Stadium, Dallas |
| R1 | 17/06 | Gana × Panamá (L) | 19h00 | **20h00** | BMO Field, Toronto |
| R1 | 17/06 | Uzbequistão × Colômbia (K) | 22h00 | **23h00** | Estádio Azteca, Cidade do México |
| R2 | 19/06 | Escócia × Marrocos (C) | 18h00 | **19h00** | Gillette Stadium, Boston |
| R2 | 19/06 | **Brasil × Haiti (C)** | 21h00 | **22h00** | Lincoln Financial Field, Filadélfia |
| R2 | 20/06 | Holanda × Suécia (F) | 13h00 | **14h00** | NRG Stadium, Houston |
| R2 | 20/06 | Alemanha × Costa do Marfim (E) | 16h00 | **17h00** | BMO Field, Toronto |
| R2 | 20/06 | Tunísia × Japão (F) | 22h00 | **23h00** | Estadio BBVA, Monterrey |
| R2 | 21/06 | Espanha × Arábia Saudita (H) | 12h00 | **13h00** | Mercedes-Benz Stadium, Atlanta |
| R2 | 21/06 | Bélgica × Irã (G) | 15h00 | **16h00** | SoFi Stadium, Los Angeles |
| R2 | 21/06 | Uruguai × Cabo Verde (H) | 18h00 | **19h00** | Hard Rock Stadium, Miami |
| R2 | 21/06 | Nova Zelândia × Egito (G) | 21h00 | **22h00** | BC Place, Vancouver |
| R2 | 22/06 | Noruega × Senegal (I) | 20h00 | **21h00** | MetLife Stadium, Nova Jersey |
| R2 | 23/06 | Portugal × Uzbequistão (K) | 13h00 | **14h00** | NRG Stadium, Houston |
| R2 | 23/06 | Inglaterra × Gana (L) | 16h00 | **17h00** | Gillette Stadium, Boston |
| R2 | 23/06 | Panamá × Croácia (L) | 19h00 | **20h00** | BMO Field, Toronto |
| R3 ⚡ | 24/06 | Suíça × Canadá (B) | 15h00 | **16h00** | BC Place, Vancouver |
| R3 ⚡ | 24/06 | Bósnia-Herzegovina × Qatar (B) | 15h00 | **16h00** | Lumen Field, Seattle |
| R3 ⚡ | 24/06 | **Escócia × Brasil (C)** | 18h00 | **19h00** | Hard Rock Stadium, Miami |
| R3 ⚡ | 24/06 | Marrocos × Haiti (C) | 18h00 | **19h00** | Mercedes-Benz Stadium, Atlanta |
| R3 ⚡ | 24/06 | Rep. Tcheca × México (A) | 21h00 | **22h00** | Estádio Azteca, Cidade do México |
| R3 ⚡ | 24/06 | África do Sul × Coreia do Sul (A) | 21h00 | **22h00** | Estadio BBVA, Monterrey |
| R3 ⚡ | 25/06 | Japão × Suécia (F) | 19h00 | **20h00** | AT&T Stadium, Dallas |
| R3 ⚡ | 25/06 | Tunísia × Holanda (F) | 19h00 | **20h00** | Arrowhead Stadium, Kansas City |
| R3 ⚡ | 25/06 | Equador × Alemanha (E) | 16h00 | **17h00** | MetLife Stadium, Nova Jersey |
| R3 ⚡ | 26/06 | Noruega × França (I) | 15h00 | **16h00** | Gillette Stadium, Boston |
| R3 ⚡ | 26/06 | Senegal × Iraque (I) | 15h00 | **16h00** | BMO Field, Toronto |
| R3 ⚡ | 26/06 | Uruguai × Espanha (H) | 20h00 | **21h00** | Estádio Akron, Guadalajara |
| R3 ⚡ | 26/06 | Cabo Verde × Arábia Saudita (H) | 20h00 | **21h00** | NRG Stadium, Houston |
| R3 ⚡ | 27/06 | Panamá × Inglaterra (L) | 17h00 | **18h00** | MetLife Stadium, Nova Jersey |
| R3 ⚡ | 27/06 | Croácia × Gana (L) | 18h00 | **19h00** | Lincoln Financial Field, Filadélfia |

> ⚡ **R3 = Rodada de Fechamento** — Partidas do mesmo grupo ocorrem **simultaneamente** para evitar conluio. O sistema deve bloquear os palpites de ambas as partidas ao mesmo tempo.

---

## 9. Calendário — Fase Eliminatória

| Fase | Data | Jogo | Confronto | ET | BRT | Estádio / Cidade |
|------|------|------|-----------|-----|-----|------------------|
| 16-Avos | 28/06 | **73** | 2º A × 2º B | 22h00 | **23h00** | SoFi Stadium, Los Angeles |
| 16-Avos | 29/06 | **74** | 1º E × Melhor 3º (A/B/C/D/F) | 16h00 | **17h00** | Gillette Stadium, Boston |
| 16-Avos | 29/06 | **75** | 1º F × 2º C | 21h00 | **22h00** | Estadio BBVA, Monterrey |
| 16-Avos | 29/06 | **76** | 1º C × 2º F | 21h00 | **22h00** | NRG Stadium, Houston |
| 16-Avos | 30/06 | **77** | 1º I × Melhor 3º (C/D/F/G/H) | 16h00 | **17h00** | MetLife Stadium, Nova Jersey |
| 16-Avos | 30/06 | **78** | 2º E × 2º I | 18h00 | **19h00** | AT&T Stadium, Dallas |
| 16-Avos | 30/06 | **79** | 1º A × Melhor 3º (C/E/F/H/I) | 21h00 | **22h00** | Estádio Azteca, Cidade do México |
| 16-Avos | 02/07 | **80–82** | Várias partidas simultâneas | 15h/19h/23h | ver app | LA, Toronto, Vancouver |
| 16-Avos | 03/07 | **86** | 1º J × 2º H | 15h00 | **16h00** | Hard Rock Stadium, Miami |
| 16-Avos | 03/07 | **87** | 1º K × Melhor 3º (D/E/I/J/L) | 18h00 | **19h00** | Arrowhead Stadium, Kansas City |
| 16-Avos | 03/07 | **88** | 2º D × 2º G | 21h00 | **22h00** | AT&T Stadium, Dallas |
| Oitavas | 04/07 | **89** | Venc. 74 × Venc. 77 | 17h00 | **18h00** | Lincoln Financial Field, Filadélfia |
| Oitavas | 04/07 | **90** | Venc. 73 × Venc. 75 | 20h00 | **21h00** | NRG Stadium, Houston |
| Oitavas | 05/07 | **91** | Venc. 76 × Venc. 78 | 16h00 | **17h00** | MetLife Stadium, Nova Jersey |
| Oitavas | 05/07 | **92** | Venc. 79 × Venc. 80 | 21h00 | **22h00** | Estádio Azteca, Cidade do México |
| Oitavas | 06/07 | **93** | Venc. 83 × Venc. 84 | 16h00 | **17h00** | AT&T Stadium, Dallas |
| Oitavas | 06/07 | **94** | Venc. 81 × Venc. 82 | 21h00 | **22h00** | Lumen Field, Seattle |
| Oitavas | 07/07 | **95** | Venc. 86 × Venc. 88 | 13h00 | **14h00** | Mercedes-Benz Stadium, Atlanta |
| Oitavas | 07/07 | **96** | Venc. 85 × Venc. 87 | 17h00 | **18h00** | BC Place, Vancouver |
| Quartas | 09/07 | **97** | Venc. 89 × Venc. 90 | 17h00 | **18h00** | Gillette Stadium, Boston |
| Quartas | 10/07 | **98** | Venc. 93 × Venc. 94 | 21h00 | **22h00** | SoFi Stadium, Los Angeles |
| Quartas | 11/07 | **99** | Venc. 91 × Venc. 92 | 18h00 | **19h00** | Hard Rock Stadium, Miami |
| Quartas | 11/07 | **100** | Venc. 95 × Venc. 96 | 21h00 | **22h00** | Arrowhead Stadium, Kansas City |
| Semifinal | 14/07 | **101** | Venc. 97 × Venc. 98 | 15h00 | **16h00** | AT&T Stadium, Dallas |
| Semifinal | 15/07 | **102** | Venc. 99 × Venc. 100 | 15h00 | **16h00** | Mercedes-Benz Stadium, Atlanta |
| 3º Lugar | 18/07 | **103** | Perd. 101 × Perd. 102 | 15h00 | **16h00** | Hard Rock Stadium, Miami |
| **🏆 FINAL** | **19/07** | **104** | Venc. 101 × Venc. 102 | 15h00 | **16h00** | MetLife Stadium, Nova Jersey |

---

## 10. Sistema de Pontuação do Bolão

| Categoria | Condição Lógica | Exemplo | Pontos Base |
|-----------|-----------------|---------|-------------|
| **Placar exato** | Palpite_Casa == Gols_Casa AND Palpite_Fora == Gols_Fora | Palpite 2-1, Resultado 2-1 | **25 pts** |
| **Vencedor + gols do vencedor** | Vencedor correto AND Gols_Vencedor(palpite) == Gols_Vencedor(resultado) | Palpite 2-0, Resultado 2-1 | **18 pts** |
| **Vencedor + saldo de gols** | Vencedor correto AND (Casa−Fora) palpite == (Casa−Fora) resultado | Palpite 3-1, Resultado 2-0 (ambos +2) | **15 pts** |
| **Empate correto** | Palpite empate AND Resultado empate (qualquer placar) | Palpite 1-1, Resultado 2-2 | **15 pts** |
| **Apenas vencedor** | Vencedor correto (falhou nos demais critérios) | Palpite 2-0, Resultado 3-2 | **10 pts** |
| **Erro total** | Nenhum critério acima atendido | — | **0 pts** |

> A lógica deve ser aplicada em cascata (if-else aninhado), da condição mais precisa para a menos precisa.

---

## 11. Multiplicadores por Fase

Para manter o campeonato competitivo até o final, os pontos são multiplicados conforme a fase:

| Fase | Partidas | Multiplicador |
|------|----------|---------------|
| Fase de Grupos | 1–72 | **×1** |
| 16-Avos + Oitavas de Final | 73–96 | **×1,5** |
| Quartas + Semifinais + 3º Lugar | 97–103 | **x2** |
| Grande Final | 104 | **×4** |

**Pontuação final = Pontos Base × Multiplicador da Fase**

---

## 12. Palpites de Longo Prazo (Mercados Estáticos)

Palpites que devem ser registrados **antes da abertura do torneio** (11/06/2026) e avaliados ao final:

| Mercado | Avaliação | Bônus |
|---------|-----------|-------|
| Campeão do torneio | Validação booleana em 19/07 | **+100 pts** |
| Vice-campeao do torneio | Validação booleana em 19/07 | **+70 pts** |
| Terceiro Lugar | Validação booleana em 19/07 | **+40 pts** |
| Artilheiro (Chuteira de Ouro) | Validação ao término do torneio | **+30 pts** |

> Estes palpites devem ser travados no banco de dados antes da cerimônia de abertura e não podem ser alterados após isso.

---

## 13. Notas de Arquitetura Técnica

### Banco de dados

- Utilizar banco **relacional** com suporte a transações ACID.
- Entidades principais: `Usuários`, `Equipes`, `Grupos`, `Partidas`, `Palpites`, `Fases`, `Mercados Estáticos`.
- A entidade `Equipes` deve incluir colunas dinâmicas: vitórias, empates, derrotas, gols marcados, gols sofridos, saldo, pontos, **pontos de Fair Play**.
- A entidade `Partidas` deve usar **Timestamp UTC** para horários.
- Implementar `trigger` ou `stored procedure` que popule automaticamente o mata-mata ao término da fase de grupos.

### Bloqueio de palpites

- Implementar `cron job` com verificação a cada minuto.
- Bloquear palpites **5–10 minutos antes** do horário de início de cada partida.
- Partidas simultâneas (R3) devem travar todos os formulários do grupo ao mesmo tempo.

### Algoritmo de desempate

- Implementar como **sub-rotina recursiva/iterativa** que cria sub-tabelas temporárias em memória para os cenários de empate múltiplo.
- Respeitar rigorosamente a hierarquia dos 7 critérios.
- Após separar um grupo triplo, **reiniciar o confronto direto** para a eventual dupla restante antes de avançar ao critério geral.

### Matriz do Anexo C

- Implementar como **dicionário/hash map** no backend.
- Chave: string ordenada com as letras dos 8 grupos classificados em 3º (ex: `"CDEFGHIJ"`).
- Valor: objeto com os cruzamentos de cada vencedor de grupo.
- Disparar lookup automaticamente após o término da última partida da fase de grupos (27/06).

### Frontend

- Exibir horários convertidos para **BRT (UTC-3)** usando a API de internacionalização do navegador.
- Fases eliminatórias: renderizar confrontos como "Vencedor Jogo 73" até que o banco de dados confirme o classificado.
- Leaderboard: atualizar em tempo real (WebSocket ou polling) após cada partida finalizada.

---

*Documento gerado a partir do relatório de deep research do Google Gemini — Copa do Mundo FIFA 2026.*
