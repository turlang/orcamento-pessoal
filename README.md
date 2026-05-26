# 📊 FinançasPro BI — Dashboard Orçamentário Premium

O **FinançasPro BI** é um simulador de orçamento pessoal e painel de Business Intelligence (BI) de alta performance. Desenvolvido com uma interface moderna e minimalista (*Slate UI / Dark Mode*), o sistema foi projetado para rodar de forma 100% local, privada e offline. 

A aplicação transforma lançamentos manuais ou planilhas importadas do Excel em dashboards gráficos altamente responsivos e relatórios gerenciais prontos para tomada de decisões.

---

## 🚀 Funcionalidades de Engenharia e Analytics

- **Interface SaaS Premium**: Design imersivo em modo escuro com alto contraste e tipografia expressiva de BI, otimizado para longas sessões de análise visual.
- **Layout Simétrico e Responsivo**: Estrutura inteligente em Grid que se centraliza perfeitamente em monitores ultrawide, notebooks e se adapta de forma fluida a smartphones e tablets.
- **Análise Temporal Macroeconômica**: Gráfico de colunas que plota a evolução do saldo líquido acumulado mês a mês, identificando superávits (verde) ou déficits (vermelho) de forma reativa.
- **Rateio por Centro de Custos**: Gráfico dinâmico que calcula o volume financeiro e o percentual exato consumido por cada tipo de despesa, ignorando as receitas para gerar um cálculo de despesa puro.
- **Monitoramento de Alvos (Metas)**: Componente inteligente que monitora o progresso de economia atual contra uma meta estipulada para o período, exibindo barras cromáticas reativas de sucesso.
- **Importador Blindado (Excel/CSV)**: Mecanismo de higienização de strings que aceita separadores por vírgula ou ponto e vírgula, trata plurais automaticamente, remove caracteres ocultos do Excel e limpa o símbolo de `R$`.
- **Sincronização por Substituição**: Evita a duplicidade indesejada de registros. Ao carregar um novo arquivo, os dados anteriores do período selecionado são totalmente atualizados.
- **Relatório Executivo PDF**: Engine embarcada via CSS (`@media print`) que, ao clicar em exportar, oculta o lixo visual de formulários/botões e reestrutura os dados analíticos de forma limpa em uma única folha A4 vertical.
- **PWA (Progressive Web App)**: Homologada pelos critérios de instalação do Google Chrome e iOS, permitindo fixar o painel como um aplicativo nativo no computador ou na tela inicial do celular.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estruturação semântica adaptada para leitores offline.
- **CSS3 Nativo**: Grid Layout, Flexbox, variáveis nativas e estilização para mídias de impressão (`@media print`).
- **JavaScript (ES6+)**: Dividido de forma modular e limpa para evitar cortes de código:
  - `script.js`: Gerenciamento do banco de dados local, validação de arquivos CSV e eventos de formulário.
  - `bi-engine.js`: Cálculos matemáticos de BI, motor reativo de gráficos nativos e geração de diagnósticos automatizados.

---

## 📖 Guia de Operação da Ferramenta

### 1. Seleção de Período Cronológico
No canto superior direito, use o seletor **Período de Análise** para escolher o mês de referência. Todas as bases de dados do sistema trabalham de forma isolada e independente mês a mês.

### 2. Importação Automatizada via Excel
1. Clique no link discreto **`📥 Baixar Planilha Modelo`** localizado na barra lateral esquerda.
2. Abra o arquivo baixado no seu Excel ou Google Sheets e preencha as linhas com os seus dados financeiros.
3. No painel, clique em **Escolher arquivo** e selecione o seu documento salvo em formato `.csv`.
4. O Dashboard recalculará e renderizará todas as visões gráficas instantaneamente.

### 3. Emissão de Relatório Analítico
Clique no botão azul **`📄 Exportar Relatório PDF`**. O assistente de impressão do seu sistema operacional se abrirá de forma integrada, pronto para salvar o seu resumo financeiro em formato PDF perfeitamente diagramado para uma única página A4.

---

## 📋 Modelo de Estrutura da Planilha (.csv)

A planilha deve conter exatamente **4 colunas**, respeitando rigorosamente a ordem abaixo para evitar deslocamentos de dados:


| tipo | descricao | valor | categoria |
| :--- | :--- | :--- | :--- |
| receita | Faturamento Mensal | 4000,00 | Trabalho |
| despesa | Aluguel Residencial | 1500,00 | Moradia |
| despesa | Rancho Supermercado | 450,50 | Alimentação |
| despesa | Parcela do Carro | 1200,00 | Transporte |

### ⚠️ Diretrizes Obrigatórias para Preenchimento:
- **Coluna Tipo**: Use os termos `receita` ou `despesa` (o sistema aceita variações no plural como `receitas` ou `despesas`).
- **Coluna Valor**: Insira apenas os numéricos puros (use vírgula ou ponto para centavos). Não digite o texto `R$` dentro da célula.
- **Mapeamento de Categoria**: Use os termos de centro de custos: `Trabalho`, `Moradia`, `Alimentação`, `Transporte`, `Lazer` ou `Outros`.
- *Nota: O importador possui inteligência cruzada. Se você escrever "combustível" na descrição e esquecer de definir a categoria, o robô remapeia automaticamente para a barra de **Transporte**.*

---

## 🔒 Segurança e Privacidade de Dados
Por motivos de governança e privacidade, **nenhum dado financeiro inserido nesta ferramenta é enviado para servidores externos ou armazenado em nuvem**. Toda a persistência é criptografada e mantida de forma individual e local no disco rígido do seu próprio navegador através da API `localStorage`. O sistema funciona de forma 100% anônima e isolada por dispositivo.
