# Chaveamento do Mata-Mata — Copa do Mundo 2026

> Horários em **Brasília (BRT)**. Convertidos a partir do horário oficial ET (leste dos EUA), somando 1 hora.
> Datas e estádios das quartas em diante já são fixos; os times serão preenchidos conforme os resultados.

## Linha do tempo das fases

```
16-avos (Round of 32)  →  28/jun a 03/jul
Oitavas (Round of 16)  →  04/jul a 07/jul
Quartas de final       →  09/jul a 11/jul
Semifinais             →  14/jul e 15/jul
Disputa de 3º lugar    →  18/jul
Final                  →  19/jul  (MetLife Stadium, Nova Jersey)
```

## Diagrama do chaveamento (Mermaid)

```mermaid
flowchart LR
    %% 16-AVOS
    M73["M73 · 28/jun 16h<br/>África do Sul x Canadá<br/>Los Angeles"]
    M75["M75 · 29/jun 22h<br/>Holanda x Marrocos<br/>Monterrey"]
    M74["M74 · 29/jun 17h30<br/>Alemanha x Paraguai<br/>Boston"]
    M77["M77 · 30/jun 18h<br/>França x Suécia<br/>Nova York/NJ"]
    M76["M76 · 29/jun 14h<br/>Brasil x Japão<br/>Houston"]
    M78["M78 · 30/jun 14h<br/>Costa do Marfim x Noruega<br/>Dallas"]
    M79["M79 · 30/jun 22h<br/>México x Equador<br/>Cidade do México"]
    M80["M80 · 01/jul 13h<br/>Inglaterra x RD Congo<br/>Atlanta"]
    M83["M83 · 02/jul 20h<br/>Portugal x Croácia<br/>Toronto"]
    M84["M84 · 02/jul 16h<br/>Espanha x Áustria<br/>Los Angeles"]
    M81["M81 · 01/jul 21h<br/>EUA x Bósnia<br/>São Francisco"]
    M82["M82 · 01/jul 17h<br/>Bélgica x Senegal<br/>Seattle"]
    M86["M86 · 03/jul 19h<br/>Argentina x Cabo Verde<br/>Miami"]
    M88["M88 · 03/jul 15h<br/>Austrália x Egito<br/>Dallas"]
    M85["M85 · 03/jul 00h<br/>Suíça x Argélia<br/>Vancouver"]
    M87["M87 · 03/jul 22h30<br/>Colômbia x Gana<br/>Kansas City"]

    %% OITAVAS
    M90["M90 · 04/jul 14h<br/>Houston"]
    M89["M89 · 04/jul 18h<br/>Philadelphia"]
    M91["M91 · 05/jul 17h<br/>Nova York/NJ 🇧🇷"]
    M92["M92 · 05/jul 21h<br/>Cidade do México"]
    M93["M93 · 06/jul 16h<br/>Dallas"]
    M94["M94 · 06/jul 21h<br/>Seattle"]
    M95["M95 · 07/jul 13h<br/>Atlanta"]
    M96["M96 · 07/jul 17h<br/>Vancouver"]

    %% QUARTAS
    M97["M97 · 09/jul 17h<br/>Boston"]
    M98["M98 · 10/jul 16h<br/>Los Angeles"]
    M99["M99 · 11/jul 18h<br/>Miami 🇧🇷"]
    M100["M100 · 11/jul 22h<br/>Kansas City"]

    %% SEMIS
    M101["M101 · 14/jul 16h<br/>Dallas"]
    M102["M102 · 15/jul 16h<br/>Atlanta 🇧🇷"]

    %% 3o LUGAR E FINAL
    M103["M103 · 18/jul 17h<br/>Disputa 3º lugar<br/>Miami"]
    M104["🏆 M104 · 19/jul 16h<br/>FINAL<br/>Nova York/NJ"]

    M73 --> M90
    M75 --> M90
    M74 --> M89
    M77 --> M89
    M76 --> M91
    M78 --> M91
    M79 --> M92
    M80 --> M92
    M83 --> M93
    M84 --> M93
    M81 --> M94
    M82 --> M94
    M86 --> M95
    M88 --> M95
    M85 --> M96
    M87 --> M96

    M89 --> M97
    M90 --> M97
    M93 --> M98
    M94 --> M98
    M91 --> M99
    M92 --> M99
    M95 --> M100
    M96 --> M100

    M97 --> M101
    M98 --> M101
    M99 --> M102
    M100 --> M102

    M101 --> M104
    M102 --> M104
    M101 -.perdedor.-> M103
    M102 -.perdedor.-> M103
```

🇧🇷 = jogos que fazem parte do caminho do Brasil (Grupo C, 1º colocado) até a decisão, caso avance em cada fase.

## Resumo por fase (tabela rápida)

### 16-avos de final
| # | Data | Hora (BRT) | Confronto | Cidade | Estádio |
|---|------|-----------|-----------|--------|---------|
| 73 | 28/06 | 16:00 | África do Sul x Canadá | Los Angeles | SoFi Stadium |
| 76 | 29/06 | 14:00 | Brasil x Japão | Houston | NRG Stadium |
| 74 | 29/06 | 17:30 | Alemanha x Paraguai | Boston | Gillette Stadium |
| 75 | 29/06 | 22:00 | Holanda x Marrocos | Monterrey | Estadio BBVA |
| 78 | 30/06 | 14:00 | Costa do Marfim x Noruega | Dallas | AT&T Stadium |
| 77 | 30/06 | 18:00 | França x Suécia | Nova York/NJ | MetLife Stadium |
| 79 | 30/06 | 22:00 | México x Equador | Cidade do México | Estádio Azteca |
| 80 | 01/07 | 13:00 | Inglaterra x RD Congo | Atlanta | Mercedes-Benz Stadium |
| 82 | 01/07 | 17:00 | Bélgica x Senegal | Seattle | Lumen Field |
| 81 | 01/07 | 21:00 | EUA x Bósnia e Herzegovina | São Francisco | Levi's Stadium |
| 84 | 02/07 | 16:00 | Espanha x Áustria | Los Angeles | SoFi Stadium |
| 83 | 02/07 | 20:00 | Portugal x Croácia | Toronto | BMO Field |
| 85 | 02/07 | 00:00* | Suíça x Argélia | Vancouver | BC Place |
| 88 | 03/07 | 15:00 | Austrália x Egito | Dallas | AT&T Stadium |
| 86 | 03/07 | 19:00 | Argentina x Cabo Verde | Miami | Hard Rock Stadium |
| 87 | 03/07 | 22:30 | Colômbia x Gana | Kansas City | Arrowhead Stadium |

\* madrugada de 03/07 no horário de Brasília.

### Oitavas de final
| # | Data | Hora (BRT) | Confronto | Cidade |
|---|------|-----------|-----------|--------|
| 90 | 04/07 | 14:00 | Vencedor 73 x Vencedor 75 | Houston |
| 89 | 04/07 | 18:00 | Vencedor 74 x Vencedor 77 | Philadelphia |
| 91 | 05/07 | 17:00 | Vencedor 76 x Vencedor 78 (Brasil x Noruega) | Nova York/NJ |
| 92 | 05/07 | 21:00 | Vencedor 79 x Vencedor 80 | Cidade do México |
| 93 | 06/07 | 16:00 | Vencedor 83 x Vencedor 84 | Dallas |
| 94 | 06/07 | 21:00 | Vencedor 81 x Vencedor 82 | Seattle |
| 95 | 07/07 | 13:00 | Vencedor 86 x Vencedor 88 | Atlanta |
| 96 | 07/07 | 17:00 | Vencedor 85 x Vencedor 87 | Vancouver |

### Quartas de final
| # | Data | Hora (BRT) | Confronto | Cidade |
|---|------|-----------|-----------|--------|
| 97 | 09/07 | 17:00 | Vencedor 89 x Vencedor 90 | Boston |
| 98 | 10/07 | 16:00 | Vencedor 93 x Vencedor 94 | Los Angeles |
| 99 | 11/07 | 18:00 | Vencedor 91 x Vencedor 92 | Miami |
| 100 | 11/07 | 22:00 | Vencedor 95 x Vencedor 96 | Kansas City |

### Semifinais
| # | Data | Hora (BRT) | Confronto | Cidade |
|---|------|-----------|-----------|--------|
| 101 | 14/07 | 16:00 | Vencedor 97 x Vencedor 98 | Dallas |
| 102 | 15/07 | 16:00 | Vencedor 99 x Vencedor 100 | Atlanta |

### Disputa de 3º lugar e Final
| # | Data | Hora (BRT) | Confronto | Cidade |
|---|------|-----------|-----------|--------|
| 103 | 18/07 | 17:00* | Perdedor 101 x Perdedor 102 | Miami |
| 104 | 19/07 | 16:00 | Vencedor 101 x Vencedor 102 | Nova York/NJ (MetLife Stadium) |

\* algumas fontes indicam 18h em vez de 17h para a disputa de 3º lugar — vale confirmar no site oficial da FIFA perto da data.

---
**Fontes cruzadas:** Wikipédia (estrutura oficial do chaveamento e números de partida), Sky Sports, ESPN, worldcuppass.com (datas/horários/estádios do Round of 32 em diante), e reportagens que confirmam o caminho do Brasil.
