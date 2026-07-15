# CLAUDE.md

> Este arquivo complementa `AGENTS.md`. Enquanto `AGENTS.md` define **regras e checklists** (o "o quê"), `CLAUDE.md` descreve **como pensar** antes, durante e depois de programar (o "como"). Não duplica regras — sempre que houver sobreposição, `AGENTS.md` é a referência normativa.
>
> **Quando atualizar:** quando um padrão de raciocínio se mostrar insuficiente na prática (ex.: Claude entregou algo "tecnicamente certo" mas que quebrou uma regra de negócio por falta de contexto).

---

## 1. Antes de programar: construa o modelo mental

Antes de escrever qualquer linha de código, responda internamente (e, se relevante, explicite na resposta):

1. **Que problema de negócio isso resolve?** Mapeie para `DOMAIN_RULES.md`. Se a tarefa fala em "terceiro lugar", verifique se é o terceiro colocado de grupo (`tournament`, `DOMAIN_RULES.md` §4/§5) — o único conceito de "terceiro lugar" que existe no domínio hoje.
2. **Em qual camada e Bounded Context isso vive?** (`ARCHITECTURE.md`). Se a resposta não for óbvia, é sinal de que a tarefa pode estar misturando responsabilidades — separe antes de codar.
3. **Quais invariantes não podem ser quebradas?** Ex.: "um palpite não pode existir após o bloqueio", "a combinação do Anexo C sempre tem 8 letras únicas", "pontos de palpite só existem após a partida ser `encerrada`".

## 2. Como analisar impacto antes de mudar algo existente

- Pergunte: **"o que mais usa isso?"** — não apenas o arquivo que você está olhando, mas use cases, controllers, componentes, e principalmente **ports/interfaces** que cruzam Bounded Contexts (`TournamentReadPort` é o ponto de maior atenção — qualquer mudança em `tournament` que afete esse port impacta `bolao`).
- Pergunte: **"isso é aditivo ou destrutivo?"** — adicionar um campo opcional é seguro; renomear/remover algo usado por outra camada não é.
- Se a mudança é em uma regra de `DOMAIN_RULES.md`, trate como uma mudança de **especificação**, não de implementação: atualize o documento primeiro (com aprovação humana), depois o código, depois os testes — nessa ordem, para que o documento continue sendo a fonte da verdade.

## 3. Como evitar regressões

- Comportamento existente sem teste = comportamento não documentado. Antes de alterar, escreva o teste que descreve o comportamento atual (mesmo que pareça óbvio) — isso vira sua rede de segurança.
- Para os módulos de `domain` mais críticos (`ClassificacaoService`, `RegraPontuacao`, `AnexoCLookup`, `BracketGeneratorService`), trate qualquer alteração como cirurgia: rode os testes de `TESTING_STRATEGY.md` §2 **antes e depois**.
- Nunca "ajuste o teste para passar" sem entender se a mudança no código está correta — isso esconde regressões em vez de evitá-las.

## 4. Como validar regras de negócio

- Toda vez que implementar algo de `DOMAIN_RULES.md`, **cite a seção** em comentário no código (ex.: `// DOMAIN_RULES.md §7, linha "Vencedor + saldo de gols" → 15 pts`).
- Para regras numéricas (pontuação, multiplicadores, deduções de fair play), construa pelo menos um exemplo numérico concreto e verifique manualmente antes de escrever o teste — se o exemplo manual não bater com `DOMAIN_RULES.md`, o entendimento da regra está errado, não o código ainda.
- Para o Anexo C: nunca reescreva os 495 valores "de cabeça" — sempre carregue de `confrontos_terceiros` (dado já validado e gerado a partir do arquivo oficial da FIFA).

## 5. Como respeitar a arquitetura sem dogmatismo

- A Dependency Rule e os Bounded Contexts existem para **este projeto neste tamanho**. Se em algum momento a estrutura parecer "burocrática demais" para uma mudança trivial, isso pode ser um sinal real (YAGNI) — mas a resposta é **discutir e propor simplificação documentada** (atualizar `ARCHITECTURE.md`/`DECISIONS_LOG.md`), não simplesmente ignorar a regra naquele PR específico.
- Lembre-se da calibragem em `ARCHITECTURE.md` §0: CQRS, Event Sourcing, Saga, Circuit Breaker entre serviços, sharding — **não existem neste projeto e não devem aparecer "por precaução"**. Se você (Claude) sentir a tentação de sugerir um desses padrões, é quase certamente Guia Seção 0 sendo violado — pare e reavalie.

## 6. Como gerar código consistente

- Releia um arquivo "irmão" já existente (mesma camada, mesmo Bounded Context) antes de criar um novo, para manter o mesmo estilo de nomenclatura, tratamento de erro e organização.
- Prefira expandir um padrão já estabelecido a inventar um novo — se dois use cases já seguem uma estrutura, o terceiro segue a mesma, mesmo que você "ache" outra forma melhor (discuta a melhoria separadamente, como refactor, não misturada com a feature nova).

## 7. Comunicação com o dono do projeto

- Seja direto sobre incerteza: "não tenho certeza se X está coberto por `DOMAIN_RULES.md` — posso adicionar a seguinte redação?" é melhor do que assumir e seguir.
- Ao final de uma tarefa, resuma: o que foi implementado, quais testes rodaram (e o resultado), quais documentos foram atualizados, e o que ficou pendente/foi adiado (com referência ao `ROADMAP.md` se aplicável).

## 8. Versionamento — obrigatório ao final de cada tarefa

Após o critério de aceite de uma tarefa ser atendido, **sempre** executar na ordem:

```bash
git add <arquivos relevantes>
git commit -m "feat(marco1): tarefa N - <resumo>"
git push
```

Não pular o `push` — cada tarefa deve ter seu checkpoint no GitHub antes de iniciar a próxima.

## 9. Gestão de contexto — antes de iniciar uma tarefa nova

Antes de começar qualquer tarefa nova, rodar `/compact` para comprimir o histórico da conversa e liberar espaço no contexto. Isso evita degradação de qualidade nas respostas à medida que a sessão cresce.
