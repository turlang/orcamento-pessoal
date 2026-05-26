// FORMATADOR MONETÁRIO BR
const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// MOTOR DE GRÁFICOS E ATUALIZAÇÃO VISUAL (BI)
function updateUI() {
    const activeTransactions = getTransactionsFromStorage(currentMonth);
    
    // Cálculo dos Indicadores Claves (KPI)
    const receitas = activeTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
    const despesas = activeTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
    const saldo = receitas - despesas;

    // 1. Atualização Gráfica dos KPIs Numéricos
    kpiReceitas.textContent = formatCurrency(receitas);
    kpiDespesas.textContent = formatCurrency(despesas);
    kpiSaldo.textContent = formatCurrency(saldo);

    if (saldo < 0) kpiSaldo.className = "kpi-value text-rose";
    else if (saldo > 0) kpiSaldo.className = "kpi-value text-emerald";
    else kpiSaldo.className = "kpi-value";

    // 2. Renderização Textual do Extrato Consolidado
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

    // 3. Gráfico de Balanço Estrutural Global (Proporções em CSS)
    const totalMovimentado = receitas + despesas;
    const pctReceitas = totalMovimentado > 0 ? ((receitas / totalMovimentado) * 100).toFixed(0) : 0;
    const pctDespesas = totalMovimentado > 0 ? ((despesas / totalMovimentado) * 100).toFixed(0) : 0;

    progressoReceitas.style.width = `${pctReceitas}%`;
    progressoDespesas.style.width = `${pctDespesas}%`;
    progressoReceitasVal.textContent = `${pctReceitas}%`;
    progressoDespesasVal.textContent = `${pctDespesas}%`;

    // 4. Gráfico de Custos por Tipo de Gasto (Barras de Categoria)
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

    // 5. Histórico Comparativo Temporal de Saldos Mês a Mês
    renderTimelineChart();

    // 6. Geração de Diagnósticos de Negócio
    generateInsights(receitas, despesas, saldo);
}

// RENDERIZADOR DAS COLUNAS TEMPORAIS DO HISTÓRICO
function renderTimelineChart() {
    const allMonths = Array.from(monthSelector.options).map(opt => ({ value: opt.value, text: opt.text.split(' /') }));
    
    const monthlySaldos = allMonths.map(m => {
        const transationsList = getTransactionsFromStorage(m.value);
        const rec = transationsList.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
        const desp = transationsList.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
        return { monthValue: m.value, label: m.text, saldo: rec - desp };
    });

    const maxAbsoluteSaldo = Math.max(...monthlySaldos.map(m => Math.abs(m.saldo)), 100);

    timelineChart.innerHTML = monthlySaldos.map(m => {
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

// MOTOR DE DIAGNÓSTICOS PREDITIVOS
function generateInsights(receitas, despesas, saldo) {
    const activeTransactions = getTransactionsFromStorage(currentMonth);
    if (activeTransactions.length === 0) {
        biInsight.textContent = "Alimente a planilha para rodar a análise automatizada de saúde financeira.";
        return;
    }
    const comprometido = receitas > 0 ? ((despesas / receitas) * 100).toFixed(1) : 100;

    if (saldo < 0) {
        biInsight.innerHTML = `⚠️ <strong>Déficit Operacional Recorrente:</strong> Suas despesas superaram suas receitas. Você comprometeu <strong>${comprometido}%</strong> da receita.`;
    } else if (comprometido > 75) {
        biInsight.innerHTML = `⚠️ <strong>Alerta de Margem Estreita:</strong> Você está utilizando <strong>${comprometido}%</strong> dos seus ganhos com despesas.`;
    } else {
        biInsight.innerHTML = `🎉 <strong>Geração de Valor Excelente:</strong> Parabéns! Você utilizou apenas <strong>${comprometido}%</strong> do capital disponível.`;
    }
}
