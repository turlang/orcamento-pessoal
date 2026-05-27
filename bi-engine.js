// FORMATADOR MONETÁRIO BR
const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

// MOTOR DE GRÁFICOS E ATUALIZAÇÃO VISUAL
function updateUI() {
    const activeTransactions = getTransactionsFromStorage(currentMonth);

    const receitas = activeTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const despesas = activeTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const saldo = receitas - despesas;
    const previsaoReceita = getMonthlyForecast(currentMonth);

    kpiReceitas.textContent = formatCurrency(receitas);
    kpiDespesas.textContent = formatCurrency(despesas);
    kpiSaldo.textContent = formatCurrency(saldo);

    if (kpiPrevisao) kpiPrevisao.textContent = formatCurrency(previsaoReceita);

    if (saldo < 0) kpiSaldo.className = "kpi-value text-rose";
    else if (saldo > 0) kpiSaldo.className = "kpi-value text-emerald";
    else kpiSaldo.className = "kpi-value";

    renderTransactionList(activeTransactions);
    renderBalanceProgress(receitas, despesas);
    renderCategoryBars(activeTransactions, despesas);
    renderTimelineChart();
    updateMetaUI(saldo);
    updateForecastUI(receitas, previsaoReceita);
    generateInsights(receitas, despesas, saldo, previsaoReceita);
}

function renderTransactionList(activeTransactions) {
    if (activeTransactions.length === 0) {
        transactionList.innerHTML = `<p class="empty-text">Nenhum registro para este período.</p>`;
        return;
    }

    transactionList.innerHTML = activeTransactions.map((t, index) => `
        <div class="t-item ${t.type}">
            <div class="t-info">
                <p title="${t.description}">${t.description}</p>
                <span>${t.category}</span>
            </div>
            <div class="t-amount-wrapper">
                <span class="${t.type === 'receita' ? 'text-emerald' : 'text-rose'}" style="font-weight:850">
                    ${t.type === 'receita' ? '+' : '-'} ${formatCurrency(t.amount)}
                </span>
                <button onclick="removeTransaction(${index})" class="btn-del" title="Excluir">×</button>
            </div>
        </div>
    `).join('');
}

function renderBalanceProgress(receitas, despesas) {
    const totalMovimentado = receitas + despesas;
    const pctReceitas = totalMovimentado > 0 ? ((receitas / totalMovimentado) * 100).toFixed(0) : 0;
    const pctDespesas = totalMovimentado > 0 ? ((despesas / totalMovimentado) * 100).toFixed(0) : 0;

    progressoReceitas.style.width = `${pctReceitas}%`;
    progressoDespesas.style.width = `${pctDespesas}%`;
    progressoReceitasVal.textContent = `${pctReceitas}%`;
    progressoDespesasVal.textContent = `${pctDespesas}%`;
}

function renderCategoryBars(activeTransactions, despesas) {
    const categories = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Educação', 'Outros'];

    if (despesas === 0) {
        categoryBarsContainer.innerHTML = `<p class="empty-text">Sem despesas mapeadas neste período.</p>`;
        return;
    }

    categoryBarsContainer.innerHTML = categories.map(cat => {
        const valorCat = activeTransactions
            .filter(t => t.type === 'despesa' && t.category === cat)
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const pctCat = ((valorCat / despesas) * 100).toFixed(0);

        return `
            <div class="cat-bar-item">
                <div class="cat-bar-header">
                    <span class="bi-label-text">${cat}</span>
                    <span class="bi-value-text">${pctCat}% (${formatCurrency(valorCat)})</span>
                </div>
                <div class="cat-bar-track">
                    <div class="cat-bar-fill" style="width: ${pctCat}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderTimelineChart() {
    const allMonths = Array.from(monthSelector.options).map(opt => ({
        value: opt.value,
        text: opt.text.split(' /')[0].slice(0, 3)
    }));

    const monthlySaldos = allMonths.map(m => {
        const transactionsList = getTransactionsFromStorage(m.value);
        const rec = transactionsList.filter(t => t.type === 'receita').reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const desp = transactionsList.filter(t => t.type === 'despesa').reduce((sum, t) => sum + Number(t.amount || 0), 0);
        return { monthValue: m.value, label: m.text, saldo: rec - desp };
    });

    const maxAbsoluteSaldo = Math.max(...monthlySaldos.map(m => Math.abs(m.saldo)), 100);

    timelineChart.innerHTML = monthlySaldos.map(m => {
        const heightPercentage = ((Math.abs(m.saldo) / maxAbsoluteSaldo) * 100).toFixed(0);
        const barType = m.saldo >= 0 ? 'positive' : 'negative';
        const isCurrent = m.monthValue === currentMonth ? 'outline: 2px solid rgba(56, 189, 248, .9); box-shadow: 0 0 18px rgba(56, 189, 248, .35);' : '';

        return `
            <div class="timeline-column">
                <div class="timeline-bar-wrapper">
                    <div class="timeline-popover">Saldo: ${formatCurrency(m.saldo)}</div>
                    <div class="timeline-bar ${barType}" style="height: ${Math.max(heightPercentage, 6)}%; ${isCurrent}"></div>
                </div>
                <div class="timeline-text-group">
                    <span class="timeline-saldo-text">${formatCurrency(m.saldo)}</span>
                    <div class="timeline-label">${m.label}</div>
                </div>
            </div>
        `;
    }).join('');
}

function updateMetaUI(saldoAtual) {
    const metaInput = document.getElementById('meta-input');
    const metaCard = document.getElementById('meta-chart-card');
    const metaBar = document.getElementById('meta-progress-bar');
    const metaProgressVal = document.getElementById('meta-progress-val');
    const metaStatusText = document.getElementById('meta-status-text');

    if (!metaInput || !metaCard) return;

    const savedMeta = localStorage.getItem(`meta_pro_${currentMonth}`);
    metaInput.value = savedMeta || '';

    const valorMeta = parseFloat(savedMeta);

    if (isNaN(valorMeta) || valorMeta <= 0) {
        metaCard.style.display = 'none';
        return;
    }

    metaCard.style.display = 'block';

    let pctAtingido = saldoAtual > 0 ? (saldoAtual / valorMeta) * 100 : 0;
    pctAtingido = Math.min(Math.max(pctAtingido, 0), 100).toFixed(0);

    metaBar.style.width = `${pctAtingido}%`;
    metaProgressVal.textContent = `${pctAtingido}%`;

    if (saldoAtual >= valorMeta) {
        metaBar.className = "progress-bar-fill bg-emerald";
        metaStatusText.innerHTML = `<strong>Meta atingida.</strong> Alvo: ${formatCurrency(valorMeta)}`;
    } else {
        metaBar.className = "progress-bar-fill bg-rose";
        metaStatusText.innerHTML = `Saldo atual vs alvo de ${formatCurrency(valorMeta)}`;
    }
}

function updateForecastUI(receitas, previsaoReceita) {
    const previsaoInput = document.getElementById('previsao-input');
    const previsaoCard = document.getElementById('previsao-chart-card');
    const previsaoBar = document.getElementById('previsao-progress-bar');
    const previsaoProgressVal = document.getElementById('previsao-progress-val');
    const previsaoStatusText = document.getElementById('previsao-status-text');

    if (!previsaoInput) return;

    previsaoInput.value = previsaoReceita > 0 ? previsaoReceita : '';

    if (!previsaoCard || previsaoReceita <= 0) {
        if (previsaoCard) previsaoCard.style.display = 'none';
        if (kpiGap) {
            kpiGap.textContent = 'Defina a previsão mensal.';
            kpiGap.className = 'kpi-note';
        }
        return;
    }

    previsaoCard.style.display = 'block';

    let pctRealizado = (receitas / previsaoReceita) * 100;
    pctRealizado = Math.min(Math.max(pctRealizado, 0), 100).toFixed(0);

    const gap = receitas - previsaoReceita;
    previsaoBar.style.width = `${pctRealizado}%`;
    previsaoProgressVal.textContent = `${pctRealizado}%`;

    if (gap >= 0) {
        previsaoBar.className = "progress-bar-fill bg-emerald";
        previsaoStatusText.innerHTML = `<strong>Previsão superada.</strong> Excedente de ${formatCurrency(gap)}.`;
        if (kpiGap) {
            kpiGap.textContent = `Acima da previsão em ${formatCurrency(gap)}.`;
            kpiGap.className = 'kpi-note text-emerald';
        }
    } else {
        previsaoBar.className = "progress-bar-fill bg-blue";
        previsaoStatusText.innerHTML = `Faltam ${formatCurrency(Math.abs(gap))} para atingir a previsão.`;
        if (kpiGap) {
            kpiGap.textContent = `Faltam ${formatCurrency(Math.abs(gap))}.`;
            kpiGap.className = 'kpi-note text-blue';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const metaInput = document.getElementById('meta-input');
    const previsaoInput = document.getElementById('previsao-input');
    const btnPDF = document.getElementById('btn-export-pdf');

    if (metaInput) {
        metaInput.addEventListener('input', (e) => {
            const val = e.target.value;
            if (!val || Number(val) <= 0) localStorage.removeItem(`meta_pro_${currentMonth}`);
            else localStorage.setItem(`meta_pro_${currentMonth}`, val);
            updateUI();
        });
    }

    if (previsaoInput) {
        previsaoInput.addEventListener('input', (e) => {
            saveMonthlyForecast(currentMonth, e.target.value);
            updateUI();
        });
    }

    if (btnPDF) {
        btnPDF.addEventListener('click', () => {
            window.print();
        });
    }
});

function generateInsights(receitas, despesas, saldo, previsaoReceita) {
    const activeTransactions = getTransactionsFromStorage(currentMonth);
    if (activeTransactions.length === 0) {
        biInsight.textContent = "Alimente o dashboard para rodar a análise automatizada de saúde financeira.";
        return;
    }

    const comprometido = receitas > 0 ? ((despesas / receitas) * 100).toFixed(1) : 100;
    const previsaoTexto = previsaoReceita > 0
        ? ` A receita realizada atingiu ${Math.min((receitas / previsaoReceita) * 100, 999).toFixed(1)}% da previsão mensal.`
        : '';

    if (saldo < 0) {
        biInsight.innerHTML = `<strong>Déficit no período:</strong> as despesas superaram as receitas. O comprometimento foi de <strong>${comprometido}%</strong> da receita.${previsaoTexto}`;
    } else if (comprometido > 75) {
        biInsight.innerHTML = `<strong>Margem estreita:</strong> você utilizou <strong>${comprometido}%</strong> dos ganhos com despesas. Revise os maiores centros de custo.${previsaoTexto}`;
    } else {
        biInsight.innerHTML = `<strong>Boa eficiência financeira:</strong> você utilizou <strong>${comprometido}%</strong> da receita e manteve saldo positivo.${previsaoTexto}`;
    }
}
