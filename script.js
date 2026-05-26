// Banco de Dados Local Otimizado (Mês a Mês usando LocalStorage)
let currentMonth = document.getElementById('month-selector').value;

// Mapeamentos do DOM
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

// Carrega os dados salvos do mês selecionado
function getTransactionsFromStorage(month) {
    const data = localStorage.getItem(`financas_pro_${month}`);
    return data ? JSON.parse(data) : [];
}

// Salva os dados no armazenamento interno do navegador
function saveTransactionsToStorage(month, list) {
    localStorage.setItem(`financas_pro_${month}`, JSON.stringify(list));
}

// Formatação Monetária Padrão BR
const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// Atualização Completa da Camada Visual e Motores de BI
function updateUI() {
    const activeTransactions = getTransactionsFromStorage(currentMonth);
    
    // Cálculos de KPI Dinâmicos
    const receitas = activeTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
    const despesas = activeTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
    const saldo = receitas - despesas;

    // 1. Renderização dos Indicadores (KPIs)
    kpiReceitas.textContent = formatCurrency(receitas);
    kpiDespesas.textContent = formatCurrency(despesas);
    kpiSaldo.textContent = formatCurrency(saldo);

    if (saldo < 0) kpiSaldo.className = "kpi-value text-rose";
    else if (saldo > 0) kpiSaldo.className = "kpi-value text-emerald";
    else kpiSaldo.className = "kpi-value";

    // 2. Renderização do Extrato do Mês Atual
    if (activeTransactions.length === 0) {
        transactionList.innerHTML = `<p class="empty-text">Nenhum registro para este período.</p>`;
    } else {
        transactionList.innerHTML = activeTransactions.map((t, index) => `
            <div class="t-item ${t.type}">
                <div class="t-info">
                    <p title="${t.description}">${t.description}</p>
                    <span>${t.category}</span>
                </div>
                <div class="t-amount-wrapper">
                    <span class="${t.type === 'receita' ? 'text-emerald' : 'text-rose'}" style="font-weight:700">
                        ${t.type === 'receita' ? '+' : '-'} ${formatCurrency(t.amount)}
                    </span>
                    <button onclick="removeTransaction(${index})" class="btn-del" title="Excluir">✕</button>
                </div>
            </div>
        `).join('');
    }

    // 3. Gráfico de Balanço Estrutural Global (Proporção)
    const totalMovimentado = receitas + despesas;
    const pctReceitas = totalMovimentado > 0 ? ((receitas / totalMovimentado) * 100).toFixed(0) : 0;
    const pctDespesas = totalMovimentado > 0 ? ((despesas / totalMovimentado) * 100).toFixed(0) : 0;

    progressoReceitas.style.width = `${pctReceitas}%`;
    progressoDespesas.style.width = `${pctDespesas}%`;
    progressoReceitasVal.textContent = `${pctReceitas}%`;
    progressoDespesasVal.textContent = `${pctDespesas}%`;

    // 4. Gráfico Analítico de Custos por Categoria
    const categories = ['Trabalho', 'Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Outros'];
    if (despesas === 0) {
        categoryBarsContainer.innerHTML = `<p class="empty-text" style="font-size:12px; padding:10px 0;">Sem despesas mapeadas neste período.</p>`;
    } else {
        categoryBarsContainer.innerHTML = categories.map(cat => {
            const valorCat = activeTransactions.filter(t => t.type === 'despesa' && t.category === cat).reduce((sum, t) => sum + t.amount, 0);
            const pctCat = ((valorCat / despesas) * 100).toFixed(0);
            return `
                <div class="cat-bar-item">
                    <div class="cat-bar-header">
                        <span style="color:#475569; font-weight:600;">${cat}</span>
                        <span style="color:#1e293b; font-weight:700;">${pctCat}% (${formatCurrency(valorCat)})</span>
                    </div>
                    <div class="cat-bar-track">
                        <div class="cat-bar-fill" style="width: ${pctCat}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 5. ATUALIZAÇÃO DO GRÁFICO HISTÓRICO COMPARATIVO MÊS A MÊS
    renderTimelineChart();

    // 6. Motor de Geração de Insights de Negócio
    generateInsights(receitas, despesas, saldo);
}

// Renderização das colunas temporais de BI coletando os dados do LocalStorage
function renderTimelineChart() {
    const allMonths = Array.from(monthSelector.options).map(opt => ({ value: opt.value, text: opt.text.split(' /')[0] }));
    
    // Coleta o saldo de todos os meses para normalizar a altura gráfica
    const monthlySaldos = allMonths.map(m => {
        const transationsList = getTransactionsFromStorage(m.value);
        const rec = transationsList.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
        const desp = transationsList.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
        return { monthValue: m.value, label: m.text, saldo: rec - desp };
    });

    const maxAbsoluteSaldo = Math.max(...monthlySaldos.map(m => Math.abs(m.saldo)), 100);

    timelineChart.innerHTML = monthlySaldos.map(m => {
        // Calcula altura proporcional de forma segura até 100%
        const heightPercentage = ((Math.abs(m.saldo) / maxAbsoluteSaldo) * 100).toFixed(0);
        const barType = m.saldo >= 0 ? 'positive' : 'negative';
        const isCurrent = m.monthValue === currentMonth ? 'border: 2px solid #4f46e5; box-shadow: 0 0 8px rgba(79, 70, 229, 0.4);' : '';

        return `
            <div class="timeline-column">
                <div class="timeline-bar-wrapper">
                    <div class="timeline-popover">Saldo: ${formatCurrency(m.saldo)}</div>
                    <div class="timeline-bar ${barType}" style="height: ${Math.max(heightPercentage, 4)}%; ${isCurrent}"></div>
                </div>
                <div class="timeline-label" style="${m.monthValue === currentMonth ? 'color:#4f46e5; font-weight:800;' : ''}">${m.label}</div>
            </div>
        `;
    }).join('');
}

// Regras de Negócio e Análise de Risco
function generateInsights(receitas, despesas, saldo) {
    const activeTransactions = getTransactionsFromStorage(currentMonth);
    if (activeTransactions.length === 0) {
        biInsight.textContent = "Alimente a planilha para rodar a análise automatizada de saúde financeira e comportamento de despesa.";
        return;
    }
    const comprometido = receitas > 0 ? ((despesas / receitas) * 100).toFixed(1) : 100;

    if (saldo < 0) {
        biInsight.innerHTML = `⚠️ <strong>Déficit Operacional Recorrente:</strong> Suas despesas superaram suas receitas neste período. Você comprometeu <strong>${comprometido}%</strong> da sua receita. Alavanque novas fontes de receita ou contingencie custos nas maiores barras do gráfico de categorias.`;
    } else if (comprometido > 75) {
        biInsight.innerHTML = `⚠️ <strong>Alerta de Margem Estreita:</strong> Você está utilizando <strong>${comprometido}%</strong> dos seus ganhos com despesas operacionais. A sua liquidez livre para investimentos futuros ou caixa emergencial está perigosamente reduzida.`;
    } else {
        biInsight.innerHTML = `🎉 <strong>Geração de Valor Excelente:</strong> Parabéns! Você utilizou apenas <strong>${comprometido}%</strong> do capital disponível. O saldo livre de ${formatCurrency(saldo)} deve ser redirecionado como aporte estratégico em investimentos de longo prazo.`;
    }
}

// Gerenciamento e Escuta de Eventos
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

// Remove item específico do armazenamento
function removeTransaction(index) {
    const currentList = getTransactionsFromStorage(currentMonth);
    currentList.splice(index, 1);
    saveTransactionsToStorage(currentMonth, currentList);
    updateUI();
}

// Troca de Mês no Seletor BI
monthSelector.addEventListener('change', (e) => {
    currentMonth = e.target.value;
    updateUI();
});

// Boot inicial instantâneo 100% local
window.onload = () => {
    updateUI();
};
