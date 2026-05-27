// BANCO DE DADOS LOCAL E MAPEAMENTOS DO DOM
let currentMonth = document.getElementById('month-selector').value;

const form = document.getElementById('finance-form');
const transactionList = document.getElementById('transaction-list');
const monthSelector = document.getElementById('month-selector');
const kpiReceitas = document.getElementById('kpi-receitas');
const kpiDespesas = document.getElementById('kpi-despesas');
const kpiSaldo = document.getElementById('kpi-saldo');
const biInsight = document.getElementById('bi-insight');
const progressoReceitas = document.getElementById('progresso-receitas');
const progressoDespesas = document.getElementById('progresso-despesas');
const progressoReceitasVal = document.getElementById('progresso-receitas-val');
const progressoDespesasVal = document.getElementById('progresso-despesas-val');
const categoryBarsContainer = document.getElementById('category-bars');
const timelineChart = document.getElementById('timeline-chart');
const fileInput = document.getElementById('excel-import');
const btnClearDB = document.getElementById('btn-clear-db');
const btnDownloadTemplate = document.getElementById('btn-download-template');

// FUNÇÕES DE PERSISTÊNCIA DE DADOS
function getTransactionsFromStorage(month) {
    const data = localStorage.getItem(`financas_pro_${month}`);
    return data ? JSON.parse(data) : [];
}

function saveTransactionsToStorage(month, list) {
    localStorage.setItem(`financas_pro_${month}`, JSON.stringify(list));
}

// LIMPEZA ABSOLUTA DE CARACTERES DO EXCEL
function cleanExcelText(text) {
    if (!text) return "";
    return text.trim().replace(/^["']|["']$/g, '').trim();
}

function normalizeCategoryText(text) {
    return cleanExcelText(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// IMPORTADOR BLINDADO CONTRA FORMATOS DO EXCEL (CORRIGIDO PARA PLURAIS E COLUNAS DESLOCADAS)
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const text = event.target.result;
            const lines = text.split(/\r?\n/);
            const importedTransactions = [];

            for (let i = 1; i < lines.length; i++) {
                const currentLine = lines[i].trim();
                if (!currentLine) continue;

                let columns = currentLine.includes(';') ? currentLine.split(';') : currentLine.split(',');

                // Remove colunas totalmente vazias do meio da linha para evitar deslocamentos do Excel
                columns = columns.map(col => col.trim());

                if (columns.length >= 4) {
                    const rawType = cleanExcelText(columns[0]);
                    const description = cleanExcelText(columns[1]);
                    const rawAmount = cleanExcelText(columns[2]);
                    const rawCategory = cleanExcelText(columns[3]);

                    // CORREÇÃO ESSENCIAL: Trata plurais ('despesas') e variações do Excel automaticamente
                    const cleanType = rawType.toLowerCase();
                    const type = (cleanType.includes('despesa') || cleanType.includes('saida')) ? 'despesa' : 'receita';

                    // Limpa o valor financeiro eliminando R$, pontos de milhar, aspas e substitui vírgula por ponto
                    let amountStr = rawAmount.replace('R$', '').replace(/\s/g, '');
                    if (amountStr.includes(',') && amountStr.includes('.')) {
                        amountStr = amountStr.replace(/\./g, '').replace(',', '.');
                    } else if (amountStr.includes(',')) {
                        amountStr = amountStr.replace(',', '.');
                    }
                    const amount = parseFloat(amountStr);

                    // Mapeamento Inteligente e Tolerante a Erros de Categoria
                    if (description && !isNaN(amount)) {
                        let category = "Outros";
                        const normCat = normalizeCategoryText(rawCategory);
                        const normDesc = normalizeCategoryText(description);

                        if (normCat.includes("trabalho") || normCat.includes("negocio") || normCat.includes("salario") || normDesc.includes("graziela") || normDesc.includes("ricardo")) category = "Trabalho";
                        else if (normCat.includes("moradia") || normCat.includes("aluguel") || normCat.includes("luz") || normDesc.includes("aluguel") || normDesc.includes("luz")) category = "Moradia";
                        else if (normCat.includes("alimentacao") || normCat.includes("mercado") || normDesc.includes("mercado") || normDesc.includes("rancho") || normDesc.includes("comida")) category = "Alimentação";
                        else if (normCat.includes("transporte") || normCat.includes("carro") || normCat.includes("combustivel") || normDesc.includes("carro") || normDesc.includes("combustivel") || normDesc.includes("seguro") || normDesc.includes("gasolina")) category = "Transporte";
                        else if (normCat.includes("lazer") || normCat.includes("viagem") || normDesc.includes("futebol") || normDesc.includes("internet") || normDesc.includes("internert") || normDesc.includes("show")) category = "Lazer";
                        else if (normDesc.includes("inter") || normDesc.includes("elo") || normDesc.includes("cartao") || normDesc.includes("cartao") || normDesc.includes("emprestimo")) category = "Outros";
                        else if (normDesc.includes("educacao") || normDesc.includes("escola") || normDesc.includes("curso") || normDesc.includes("livro") || normDesc.includes("material")) category = "Educação";

                        importedTransactions.push({ type, description, amount, category });
                    }
                }
            }

            if (importedTransactions.length > 0) {
                saveTransactionsToStorage(currentMonth, importedTransactions);
                updateUI();
                alert(`Sucesso! ${importedTransactions.length} lançamentos processados de forma correta no Dashboard.`);
            } else {
                alert('Erro crítico: O formato do arquivo está incorreto.\n\nVerifique se o seu arquivo possui exatamente as colunas:\ntipo, descricao, valor, categoria');
            }
            fileInput.value = '';
        };
        reader.readAsText(file, 'UTF-8');
    });
}

// CAPTURA DE LANÇAMENTO MANUAL
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const transaction = {
        type: document.getElementById('type').value,
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value
    };
    const currentList = getTransactionsFromStorage(currentMonth);
    currentList.push(transaction);
    saveTransactionsToStorage(currentMonth, currentList);
    updateUI();
    form.reset();
    document.getElementById('description').focus();
});

// EXCLUSÃO DE LANÇAMENTO PONTUAL
function removeTransaction(index) {
    const currentList = getTransactionsFromStorage(currentMonth);
    currentList.splice(index, 1);
    saveTransactionsToStorage(currentMonth, currentList);
    updateUI();
}

// SELEÇÃO DE PERÍODO CRONOLÓGICO
monthSelector.addEventListener('change', (e) => {
    currentMonth = e.target.value;
    updateUI();
});

// LÓGICA DE LIMPEZA COMPLETA DO BANCO DE DADOS
if (btnClearDB) {
    btnClearDB.addEventListener('click', () => {
        const confirmacao = confirm("⚠️ ALERTA DE SEGURANÇA:\n\nVocê tem certeza que deseja APAGAR DEFINITIVAMENTE todos os dados salvos de TODOS os meses?\nEsta ação apaga todo o histórico local e não pode ser Emperor de volta.");
        if (confirmacao) {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('financas_pro_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            updateUI();
            alert("Banco de dados resetado com sucesso! Todos os meses foram limpos.");
        }
    });
}

// LÓGICA DE DOWNLOAD DA PLANILHA MODELO
if (btnDownloadTemplate) {
    btnDownloadTemplate.addEventListener('click', () => {
        const conteudoCSV = "tipo;descricao;valor;categoria\nreceita;Faturamento de Vendas;8500,00;Trabalho\nreceita;Rendimentos de Investimentos;450,00;Trabalho\ndespesa;Aluguel do Escritorio;2200,00;Moradia\ndespesa;Conta de Luz Corporativa;340,50;Moradia\ndespesa;Suprimentos de Escritorio;620,00;Alimentação\ndespesa;Almoco Comercial;180,00;Alimentação\ndespesa;Combustivel da Frota;450,00;Transporte\ndespesa;Manutencao Preventiva;320,00;Transporte\ndespesa;Assinaturas de Softwares;150,00;Outros";
        const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "modelo_orcamento_bi.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// START DA APLICAÇÃO LOCAL
window.onload = () => {
    updateUI();
};
