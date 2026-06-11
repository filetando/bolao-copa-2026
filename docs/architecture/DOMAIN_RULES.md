# DOMAIN_RULES.md

> **Fonte oficial:** `bolao-copa-2026_1.md` (mantido na raiz do repositório como documento de referência imutável). Este arquivo é a "tradução" dessas regras em **linguagem ubíqua** e formato verificável por testes — se houver divergência, `bolao-copa-2026_1.md` prevalece, mas a divergência deve ser corrigida aqui imediatamente.
>
> **Quando atualizar:** sempre que uma regra de negócio mudar, for esclarecida, ou um caso de borda for descoberto durante o desenvolvimento.
> **Responsável:** Tech Lead / dono do bolão. Claude pode propor esclarecimentos, mas não pode alterar uma regra sem confirmação humana (ver `AGENTS.md`, "limites de atuação").

---

## 1. Estrutura do torneio

- 12 grupos (A–L), 4 equipes cada, 3 jogos por equipe → 72 jogos de grupo (jogos 1–72).
- Mata-mata: jogos 73–104 (16-avos, oitavas, quartas, semis, 3º lugar, final).
- Classificam: 1º e 2º de cada grupo (24 equipes) + 8 melhores 3os colocados = 32.

## 2. Pontuação de tabela (fase de grupos)

| Resultado | Pontos |
|---|---|
| Vitória | 3 |
| Empate | 1 |
| Derrota | 0 |

Sem prorrogação/pênaltis na fase de grupos.

## 3. Critérios de desempate — hierarquia (ordem estrita)

> **Mudança 2026:** confronto direto é o **1º** critério (antes era saldo de gols geral).

1. Pontos nos confrontos diretos entre as equipes empatadas
2. Saldo de gols nos confrontos diretos
3. Gols marcados nos confrontos diretos
4. Saldo de gols geral (todas as partidas do grupo)
5. Gols marcados geral
6. Pontos de Fair Play (cartões — ver tabela abaixo)
7. Posição no Ranking Mundial FIFA (mais recente)

### Regra de reiteração (caso de borda crítico)

Se ao aplicar 1–3 (confronto direto) **apenas uma** equipe de um empate triplo (ou maior) for separada, restando duas ainda empatadas, **reinicia-se** os critérios 1–3 considerando **somente essas duas** antes de seguir para o critério 4.

> ⚠️ Este é o caso de teste mais importante do projeto. `TESTING_STRATEGY.md` exige cenários explícitos de tríplice empate com reinício.

### Fair Play (Critério 6)

| Cartão | Dedução |
|---|---|
| Amarelo | −1 |
| 2º amarelo → vermelho indireto | −3 |
| Vermelho direto | −4 |
| Amarelo + vermelho direto | −5 |

> Pontuação de Fair Play é **decrescente** (quanto menor a dedução em módulo, melhor). Em caso de empate no critério 6, segue para o critério 7.

## 4. Classificação dos terceiros colocados

- 12 terceiros, apenas os 8 melhores avançam (4 eliminados).
- Mesmos critérios da Seção 3, comparando os 12 terceiros entre si (com base apenas nos 3 jogos de grupo de cada um).
- Resultado: lista ordenada das 8 letras de grupo classificadas → **chave do Anexo C** (ordenar alfabeticamente, ex.: `"CDEFGHIJ"`).

## 5. Anexo C — alocação dos terceiros no chaveamento

- Tabela estática de 495 combinações (já convertida para `confrontos_terceiros.sql/json/csv`, ver `DATABASE.md`).
- Chave: string de 8 letras ordenadas alfabeticamente.
- Valor: para cada campeão de grupo entre **A, B, D, E, G, I, K, L**, qual grupo fornece o 3º colocado adversário.
- **Regra fixa, fora da tabela:** campeões de **C, F, H, J** sempre enfrentam **2os colocados** (definido diretamente na tabela de jogos 73–88, não depende da combinação dos terceiros).

## 6. Chaveamento do mata-mata (jogos 73–104)

Estrutura completa em `bolao-copa-2026_1.md`, Seção 6. Resumo do fluxo de dependências:
- 16-avos (73–88): alimentados por 1º/2º colocados de grupo + Anexo C (3os colocados).
- Oitavas (89–96): vencedores de pares específicos de jogos de 16-avos.
- Quartas (97–100), Semis (101–102), 3º lugar (103) e Final (104): vencedores/perdedores em cascata.
- A partir das oitavas (jogos 89+): empate no tempo normal → prorrogação (2x15min) → pênaltis se necessário. **O placar registrado para fins de pontuação do bolão é o do tempo normal** (ver Seção 8 — não há "placar exato" de pênaltis no sistema de pontuação).

## 7. Sistema de pontuação do bolão (cascata, mais precisa → menos precisa)

| # | Categoria | Condição | Pontos base |
|---|---|---|---|
| 1 | Placar exato | palpite == resultado (ambos os placares) | 25 |
| 2 | Vencedor + gols do vencedor | vencedor correto E gols do vencedor batem | 18 |
| 3 | Vencedor + saldo de gols | vencedor correto E (casa−fora) bate | 15 |
| 4 | Empate correto | ambos empate, qualquer placar | 15 |
| 5 | Apenas vencedor | vencedor correto, mais nada bate | 10 |
| 6 | Erro total | nada bate | 0 |

**Implementação:** `if/else` em cascata, na ordem acima — a primeira condição satisfeita "vence" e as demais não são avaliadas (são mutuamente exclusivas por construção, mas a ordem importa para clareza/legibilidade).

## 8. Multiplicadores por fase

| Fase | Jogos | Multiplicador |
|---|---|---|
| Grupos | 1–72 | ×1 |
| 16-avos + Oitavas | 73–96 | ×1.5 |
| Quartas + Semis + 3º lugar | 97–103 | ×2 |
| Final | 104 | ×4 |

`Pontuação final = Pontos base × Multiplicador da fase`

## 9. Mercados estáticos (palpites de longo prazo)

| Mercado | Avaliado em | Bônus |
|---|---|---|
| Campeão | 19/07 | +100 |
| Vice-campeão | 19/07 | +70 |
| Terceiro lugar (do torneio) | 19/07 | +40 |
| Artilheiro (Chuteira de Ouro) | fim do torneio | +30 |

> ⚠️ Não confundir "Terceiro lugar (do torneio)" (mercado estático, jogo 103) com "3º colocado de grupo" (Seção 4/5). São conceitos homônimos em contextos diferentes — **linguagem ubíqua exige nomes distintos no código**: `terceiroColocadoGrupo` vs. `terceiroLugarTorneio`.

**Trava:** registrados/travados antes de 11/06/2026 (abertura), imutáveis depois.

## 10. Bloqueio de palpites de partida

- Bloqueado 5–10 minutos antes do horário de início (UTC).
- Partidas simultâneas (R3 da fase de grupos, e diversos jogos do mata-mata) travam **todos** os formulários do conjunto ao mesmo tempo — o "horário de corte" é o **menor** horário de início entre as partidas do conjunto simultâneo.
- **Validação é responsabilidade do backend** (ADR-004 em `DECISIONS_LOG.md`); frontend apenas reflete o estado.

## 11. Fusos horários

- Backend: sempre UTC (`Partida.dataHoraUTC`).
- Frontend: converte para o fuso do usuário via `Intl`/API do navegador. Exibição padrão do bolão é BRT (UTC-3 fixo, Brasil não tem horário de verão durante o torneio).
- México = UTC-6 fixo (sem DST em 2026).

---

## Glossário (linguagem ubíqua)

| Termo | Significado | Contexto |
|---|---|---|
| Palpite | Previsão de placar de uma partida específica feita por um usuário | `bolao` |
| Palpite estático | Previsão de mercado de longo prazo (campeão, artilheiro, etc.) | `bolao` |
| Pontos (de tabela) | Pontuação de V/E/D usada para classificação | `tournament` |
| Pontos (do bolão) | Pontuação obtida por um palpite após aplicar a cascata + multiplicador | `bolao` |
| Confronto direto | Resultado de jogos entre as equipes empatadas, dentro do próprio grupo | `tournament` |
| Melhor 3º (X/Y/Z) | Notação do calendário oficial — referência a um dos terceiros colocados que avançam, resolvido apenas após 27/06 via Anexo C | `tournament` |
