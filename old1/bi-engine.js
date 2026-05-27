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

    // 4. Gráfico de Custos por Tipo de Gasto (Alto Contraste de Fontes)
    const categories = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Outros'];
    if (despesas === 0) {
        categoryBarsContainer.innerHTML = `<p class="empty-text" style="font-size:12px; padding:10px 0; color: #94a3b8;">Sem despesas mapeadas neste período.</p>`;
    } else {
        categoryBarsContainer.innerHTML = categories.map(cat => {
            const valorCat = activeTransactions.filter(t => t.type === 'despesa' && t.category === cat).reduce((sum, t) => sum + t.amount, 0);
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

    // 5. Histórico Comparativo Temporal de Saldos Mês a Mês
    renderTimelineChart();

    // 6. Atualização do Monitoramento de Metas
    updateMetaUI(saldo);

    // 7. Geração de Diagnósticos de Negócio
    generateInsights(receitas, despesas, saldo);
}

// CORREÇÃO UX DA LINHA DO TEMPO (Remove palavras repetidas e duplicidade de texto)
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
        const isCurrent = m.monthValue === currentMonth ? 'border: 2px solid #4f46e5; box-shadow: 0 0 8px rgba(79, 70, 229, 0.5);' : '';

        return `
            <div class="timeline-column">
                <div class="timeline-bar-wrapper">
                    <div class="timeline-popover">Balanço: ${formatCurrency(m.saldo)}</div>
                    <div class="timeline-bar ${barType}" style="height: ${Math.max(heightPercentage, 6)}%; ${isCurrent}"></div>
                </div>
                <div class="timeline-text-group">
                    <span class="timeline-saldo-text">${m.saldo === 0 ? 'R$ 0,00' : formatCurrency(m.saldo)}</span>
                    <div class="timeline-label">${m.label}</div>
                </div>
            </div>
        `;
    }).join('');
}

// LÓGICA DO MOTOR DE METAS (LOCAL)
function updateMetaUI(saldoAtual) {
    const metaInput = document.getElementById('meta-input');
    const metaCard = document.getElementById('meta-chart-card');
    const metaBar = document.getElementById('meta-progress-bar');
    const metaProgressVal = document.getElementById('meta-progress-val');
    const metaStatusText = document.getElementById('meta-status-text');

    const savedMeta = localStorage.getItem(`meta_pro_${currentMonth}`);
    if (savedMeta) {
        metaInput.value = savedMeta;
    } else {
        metaInput.value = '';
    }

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
        metaStatusText.innerHTML = `🎉 <strong>Meta Atingida!</strong> Alvo: ${formatCurrency(valorMeta)}`;
    } else {
        metaBar.className = "progress-bar-fill bg-rose";
        metaStatusText.innerHTML = `🎯 Poupança Atual vs Alvo de ${formatCurrency(valorMeta)}`;
    }
}

// CONFIGURAÇÃO DO BOTÃO DE PDF E MUDANÇA DE META NO CARREGAMENTO
document.addEventListener('DOMContentLoaded', () => {
    const metaInput = document.getElementById('meta-input');
    const btnPDF = document.getElementById('btn-export-pdf');

    if (metaInput) {
        metaInput.addEventListener('input', (e) => {
            const val = e.target.value;
            localStorage.setItem(`meta_pro_${currentMonth}`, val);
            updateUI();
        });
    }

    if (btnPDF) {
        btnPDF.addEventListener('click', () => {
            window.print();
        });
    }
});

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
