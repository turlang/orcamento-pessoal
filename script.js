// Estado da Aplicação
let transactions = [];

// Elementos do DOM
const form = document.getElementById('finance-form');
const transactionList = document.getElementById('transaction-list');
const kpiReceitas = document.getElementById('kpi-receitas');
const kpiDespesas = document.getElementById('kpi-despesas');
const kpiSaldo = document.getElementById('kpi-saldo');
const biInsight = document.getElementById('bi-insight');
const progressoReceitas = document.getElementById('progresso-receitas');
const progressoDespesas = document.getElementById('progresso-despesas');
const progressoReceitasVal = document.getElementById('progresso-receitas-val');
const progressoDespesasVal = document.getElementById('progresso-despesas-val');
const categoryBarsContainer = document.getElementById('category-bars');

// Formatação Monetária
const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// Atualização da Interface do Usuário e Gráficos BI
function updateUI() {
    const receitas = transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
    const despesas = transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
    const saldo = receitas - despesas;

    // 1. Atualização dos KPIs
    kpiReceitas.textContent = formatCurrency(receitas);
    kpiDespesas.textContent = formatCurrency(despesas);
    kpiSaldo.textContent = formatCurrency(saldo);

    if (saldo < 0) kpiSaldo.className = "kpi-value text-rose";
    else if (saldo > 0) kpiSaldo.className = "kpi-value text-emerald";
    else kpiSaldo.className = "kpi-value";

    // 2. Atualização do Extrato (Histórico)
    if (transactions.length === 0) {
        transactionList.innerHTML = `<p class="empty-text">Nenhuma transação cadastrada.</p>`;
    } else {
        transactionList.innerHTML = transactions.map((t, index) => `
            <div class="t-item ${t.type}">
                <div class="t-info">
                    <p>${t.description}</p>
                    <span>${t.category}</span>
                </div>
                <div class="t-amount-wrapper">
                    <span class="${t.type === 'receita' ? 'text-emerald' : 'text-rose'}" style="font-weight:600">
                        ${t.type === 'receita' ? '+' : '-'} ${formatCurrency(t.amount)}
                    </span>
                    <button onclick="removeTransaction(${index})" class="btn-del">✕</button>
                </div>
            </div>
        `).join('');
    }

    // 3. Renderização Gráfica do BI (CSS Dinâmico de Performance Máxima)
    const totalMovimentado = receitas + despesas;
    const pctReceitas = totalMovimentado > 0 ? ((receitas / totalMovimentado) * 100).toFixed(0) : 0;
    const pctDespesas = totalMovimentado > 0 ? ((despesas / totalMovimentado) * 100).toFixed(0) : 0;

    progressoReceitas.style.width = `${pctReceitas}%`;
    progressoDespesas.style.width = `${pctDespesas}%`;
    progressoReceitasVal.textContent = `${pctReceitas}%`;
    progressoDespesasVal.textContent = `${pctDespesas}%`;

    // Gráfico de Barras de Categorias de Despesa
    const categories = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Outros'];
    
    if (despesas === 0) {
        categoryBarsContainer.innerHTML = `<p class="empty-text" style="font-size:12px; padding:5px 0;">Sem despesas para categorizar.</p>`;
    } else {
        categoryBarsContainer.innerHTML = categories.map(cat => {
            const valorCat = transactions.filter(t => t.type === 'despesa' && t.category === cat).reduce((sum, t) => sum + t.amount, 0);
            const pctCat = ((valorCat / despesas) * 100).toFixed(0);
            
            return `
                <div class="cat-bar-item">
                    <div class="cat-bar-header">
                        <span style="font-weight:500; color:#475569;">${cat}</span>
                        <span style="color:#64748b; font-weight:600;">${pctCat}% (${formatCurrency(valorCat)})</span>
                    </div>
                    <div class="cat-bar-track">
                        <div class="cat-bar-fill" style="width: ${pctCat}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 4. Mecanismo de Inteligência de BI
    generateInsights(receitas, despesas, saldo);
}

// Geração de Insights de Negócio
function generateInsights(receitas, despesas, saldo) {
    if (transactions.length === 0) {
        biInsight.textContent = "Insira seus dados financeiros para gerar uma análise automatizada em tempo real.";
        return;
    }
    const comprometido = receitas > 0 ? ((despesas / receitas) * 100).toFixed(1) : 100;

    if (saldo < 0) {
        biInsight.innerHTML = `⚠️ <strong>Alerta de Déficit:</strong> Suas despesas superaram seus ganhos. Você já comprometeu <strong>${comprometido}%</strong> do orçamento total disponível.`;
    } else if (comprometido > 70) {
        biInsight.innerHTML = `⚠️ <strong>Atenção Econômica:</strong> Você está utilizando <strong>${comprometido}%</strong> de toda a renda com despesas cotidianas. Sua capacidade de investimento reserva está crítica.`;
    } else {
        biInsight.innerHTML = `🎉 <strong>Alta Performance Financeira:</strong> Você comprometeu apenas <strong>${comprometido}%</strong> da sua receita. O saldo atual de ${formatCurrency(saldo)} está livre para aportes de longo prazo.`;
    }
}

// Captura de Eventos do Formulário
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const transaction = {
        type: document.getElementById('type').value,
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value
    };
    transactions.push(transaction);
    updateUI();
    form.reset();
    document.getElementById('description').focus();
});

// Remover Transações
function removeTransaction(index) {
    transactions.splice(index, 1);
    updateUI();
}

// Inicialização imediata sem carregamento de rede
window.onload = () => {
    updateUI();
};
