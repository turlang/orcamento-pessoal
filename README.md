# 📊 FinançasPro BI

O **FinançasPro BI** é um simulador de orçamento pessoal e painel de Business Intelligence (BI) de alta performance, projetado para rodar de forma 100% local, privada e offline. A aplicação transforma lançamentos financeiros brutos ou planilhas importadas do Excel em dashboards visuais e insights estratégicos em tempo real.

---

## 🚀 Principais Funcionalidades

- **Dashboard BI Nativo**: Gráficos construídos puramente em HTML5/CSS3 para máxima velocidade de renderização, sem dependências de bibliotecas pesadas de internet.
- **Análise Temporal Macroeconômica**: Gráfico de colunas que plota a evolução do seu saldo acumulado mês a mês.
- **Centro de Custos por Categoria**: Gráfico de barras horizontais com cálculo volumétrico e percentual de gastos por tipo (Moradia, Alimentação, Transporte, Lazer, Trabalho e Outros).
- **Importador Inteligente Excel/CSV**: Mecanismo com tolerância a falhas que limpa aspas, símbolos monetários (`R$`) e espaços invisíveis gerados pelo Excel.
- **Sincronização por Substituição**: Atualizações de planilha substituem os dados antigos do mês selecionado, evitando duplicidade de registros.
- **Gestão de Dados Local e Segura**: Os dados financeiros nunca saem do seu computador. Tudo é armazenado diretamente no cache do seu navegador através do `localStorage`.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estruturação semântica da aplicação.
- **CSS3 Nativo**: Design moderno, responsivo e animações fluidas de interface.
- **JavaScript (ES6+)**: Motor lógico estruturado de forma modular:
  - `script.js`: Manipulação do banco de dados local, formulários e importação de arquivos.
  - `bi-engine.js`: Cálculos estatísticos, renderização dos gráficos e geração de insights analíticos.

---

## 💻 Como Executar o Projeto

Como o projeto foi projetado com arquitetura offline e sem dependências externas, para rodá-lo basta:

1. Fazer o download ou clonar este repositório.
2. Abrir a pasta do projeto.
3. Dar um duplo clique no arquivo `index.html` para abrir diretamente no seu navegador de preferência.

---

## 📖 Manual de Uso e Operação

### 1. Seleção de Período
No topo direito do painel, utilize o campo **Período de Análise** para escolher o mês que deseja visualizar ou gerenciar. Os dados de cada mês são mantidos de forma totalmente isolada e independente.

### 2. Lançamento Manual de Dados
Utilize o formulário lateral **"Novos Lançamentos"**:
1. Escolha se a movimentação é uma **Receita** (Entrada) ou **Despesa** (Saída).
2. Digite a descrição do item (Ex: *Salário, Aluguel, Mercado*).
3. Insira o valor nominal e escolha a categoria correspondente.
4. Clique em **"Registrar no Banco de Dados"**.

### 3. Importação via Planilha do Excel
Para carregar dados em massa de forma automatizada:
1. Clique no botão cinza **`📥 Baixar Planilha Modelo`** na barra lateral para salvar o arquivo de exemplo.
2. Abra este arquivo no seu Excel e preencha com seus dados reais seguindo a estrutura padrão.
3. No painel, clique em **Escolher arquivo** dentro da seção de importação e selecione a sua planilha salva em formato `.csv`.
4. O sistema irá limpar os dados antigos do mês selecionado e injetar as novas informações instantaneamente.

---

## 📋 Estrutura Padrão da Planilha (.csv)

Para que o importador processe as informações com sucesso, o arquivo deve conter exatamente **4 colunas** e seguir a ordem abaixo:


| tipo | descricao | valor | categoria |
| :--- | :--- | :--- | :--- |
| receita | Faturamento de Vendas | 8500,00 | Trabalho |
| despesa | Aluguel Comercial | 1500,00 | Moradia |
| despesa | Compras Supermercado | 450,00 | Alimentação |

### ⚠️ Regras Cruciais de Preenchimento:
- **Coluna `tipo`**: Preencha apenas com `receita` ou `despesa` (em letras minúsculas).
- **Coluna `valor`**: Insira apenas os números puros. O sistema limpa automaticamente o símbolo `R$`.
- **Coluna `categoria`**: Use preferencialmente os termos: `Trabalho`, `Moradia`, `Alimentação`, `Transporte`, `Lazer` ou `Outros`. (O importador possui mapeamento inteligente e converterá palavras como *'mercado'* ou *'carro'* automaticamente para as categorias oficiais).
- **Formato de Salvamento**: Ao finalizar no Excel, clique em **Salvar Como** e selecione o formato **CSV (Separado por vírgulas) (*.csv)**.

---

## 🗑️ Limpeza e Reset do Sistema

Caso deseje apagar todo o histórico financeiro do navegador para reiniciar a sua contabilidade, utilize o botão vermelho **`🗑️ Limpar Todo o Histórico`**. Por segurança, o sistema exibirá uma caixa de confirmação dupla para evitar a exclusão acidental dos seus dados.

---
Desenvolvido focado em performance ágil e Business Intelligence Privado. 🚀
