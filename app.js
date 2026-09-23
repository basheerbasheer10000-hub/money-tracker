/**
 * ACRU Financial Dashboard - Interactive Application Controller
 * Connects UI to reactive AppState with complete CRUD actions, animations & mobile navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. Toast Notification System
  // =========================================================================
  const toastContainer = document.getElementById('toast-container');
  function showToast(message, icon = '✓') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="font-size:15px;">${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // =========================================================================
  // 2. Modal System (Desktop Popup & Mobile Bottom Sheet)
  // =========================================================================
  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');

  function openModal(title, htmlContent) {
    if (!modalOverlay) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = htmlContent;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // =========================================================================
  // 3. Mobile Navigation & Drawer Controls
  // =========================================================================
  const sidebar = document.getElementById('sidebar');
  const btnMobileMenu = document.getElementById('btn-mobile-menu');
  const btnCloseSidebar = document.getElementById('btn-close-sidebar');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  const btnCollapseSidebar = document.getElementById('btn-collapse-sidebar');
  const transactionsGroup = document.getElementById('transactions-group');
  const navTransactions = document.getElementById('nav-transactions');
  const navItems = document.querySelectorAll('.nav-item');

  function openMobileDrawer() {
    if (sidebar) sidebar.classList.add('mobile-open');
    if (mobileBackdrop) mobileBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (mobileBackdrop) mobileBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (btnMobileMenu) btnMobileMenu.addEventListener('click', openMobileDrawer);
  if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', closeMobileDrawer);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileDrawer);

  // Desktop Collapse / Expand
  if (btnCollapseSidebar) {
    btnCollapseSidebar.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      const isCollapsed = sidebar.classList.contains('collapsed');
      const span = btnCollapseSidebar.querySelector('span');
      if (span) span.textContent = isCollapsed ? '' : 'Collapse sidebar';
    });
  }

  // Expand / Collapse Transactions Sub-menu
  if (navTransactions) {
    navTransactions.addEventListener('click', (e) => {
      e.stopPropagation();
      transactionsGroup.classList.toggle('expanded');
      const isExpanded = transactionsGroup.classList.contains('expanded');
      navTransactions.setAttribute('aria-expanded', isExpanded);
    });
  }

  // Navigation Links
  navItems.forEach(item => {
    item.addEventListener('click', function () {
      if (this.id === 'nav-transactions') return;
      navItems.forEach(n => n.classList.remove('active'));
      this.classList.add('active');
      if (window.innerWidth <= 980) closeMobileDrawer();
    });
  });

  // Pro Card Dismiss & Upgrade
  const proCard = document.getElementById('pro-card');
  const btnClosePro = document.getElementById('btn-close-pro');
  const btnUpgradeNow = document.getElementById('btn-upgrade-now');

  if (btnClosePro && proCard) {
    btnClosePro.addEventListener('click', (e) => {
      e.stopPropagation();
      proCard.style.opacity = '0';
      proCard.style.transform = 'scale(0.95)';
      proCard.style.transition = 'all 0.3s ease';
      setTimeout(() => { proCard.style.display = 'none'; }, 300);
      showToast('Pro banner dismissed');
    });
  }

  if (btnUpgradeNow) {
    btnUpgradeNow.addEventListener('click', () => {
      openModal('Upgrade to ACRU Pro', `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <p>Get predictive AI balance forecasts, automated receipt categorization, and instant multi-currency accounts.</p>
          <div style="background:#f8f9fb; border-radius:14px; padding:16px; border:1px solid #edf0f4;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <strong>ACRU Pro Plan</strong>
              <strong style="color:#16a34a; font-size:16px;">$19.99 / mo</strong>
            </div>
            <small style="color:#64748b;">30-day free trial. Cancel anytime with one tap.</small>
          </div>
          <button class="btn-pro" id="btn-activate-pro" style="padding:12px;">Start 30-Day Free Trial</button>
        </div>
      `);

      setTimeout(() => {
        const btn = document.getElementById('btn-activate-pro');
        if (btn) {
          btn.addEventListener('click', () => {
            closeModal();
            showToast('ACRU Pro activated successfully! Enjoy all premium insights.', '⚡');
          });
        }
      }, 50);
    });
  }

  // =========================================================================
  // 4. Reactive UI Rendering Linked to AppState
  // =========================================================================
  const mainBalanceVal = document.getElementById('main-balance-val');
  const periodLabel = document.getElementById('period-label');
  const btnFilterPeriod = document.getElementById('btn-filter-period');
  const btnChartBar = document.getElementById('btn-chart-bar');
  const btnChartLine = document.getElementById('btn-chart-line');
  const chartContainer = document.getElementById('bar-chart-container');

  const spendingBarFill = document.getElementById('spending-bar-fill');
  const spendingSpent = document.getElementById('spending-spent');
  const spendingLimit = document.getElementById('spending-limit');

  const gaugeMeterPath = document.getElementById('gauge-meter-path');
  const gaugeNumber = document.getElementById('gauge-number');

  const txListContainer = document.getElementById('tx-list-container');
  const globalSearch = document.getElementById('global-search');
  const btnSortName = document.getElementById('btn-sort-name');
  const btnSortAmount = document.getElementById('btn-sort-amount');

  // Helper formatting currency
  function fmt(val) {
    return '$' + Math.abs(Math.round(val)).toLocaleString();
  }

  function render(state) {
    // 1. Balance & Top Metrics
    const metrics = window.AppState.getFinancialMetrics();
    const balance = window.AppState.getBalance();

    if (mainBalanceVal) {
      mainBalanceVal.textContent = state.selectedPeriod === '30d' ? fmt(balance * 3.8) : fmt(balance);
    }
    if (periodLabel) {
      periodLabel.textContent = state.selectedPeriod;
    }

    // Update Top Income / Expense / Saved Balance metrics
    const metricVals = document.querySelectorAll('.balance-metrics-col .metric-val');
    if (metricVals.length >= 3) {
      metricVals[0].textContent = fmt(metrics.totalIncome);
      metricVals[1].textContent = fmt(metrics.totalExpenses);
      metricVals[2].textContent = fmt(metrics.savedBalance);
    }

    // 2. Spending Limit Card
    if (spendingSpent && spendingLimit && spendingBarFill) {
      spendingSpent.textContent = fmt(state.spendingLimit.spent);
      spendingLimit.textContent = fmt(state.spendingLimit.total);
      const limitPct = Math.min(100, Math.round((state.spendingLimit.spent / state.spendingLimit.total) * 100));
      spendingBarFill.style.width = `${limitPct}%`;
    }

    // 3. Financial Health Gauge
    if (gaugeMeterPath && gaugeNumber) {
      const pct = metrics.savingsRate;
      const totalLength = 220;
      const offset = totalLength - (totalLength * (pct / 100));
      gaugeMeterPath.style.strokeDasharray = `${totalLength}`;
      gaugeMeterPath.style.strokeDashoffset = `${offset}`;
      gaugeNumber.textContent = `${pct}%`;
    }

    // 4. Credit Cards Mockups
    const primaryCard = state.cards.find(c => c.isPrimary) || state.cards[0];
    const frontCard = document.getElementById('credit-card-front');
    if (frontCard && primaryCard) {
      const numEl = frontCard.querySelector('.card-number');
      const holderEl = frontCard.querySelector('.card-holder');
      const expEl = frontCard.querySelector('.card-exp');
      if (numEl) numEl.textContent = primaryCard.number;
      if (holderEl) holderEl.textContent = primaryCard.holder;
      if (expEl) expEl.textContent = primaryCard.exp;
    }

    // 5. Chart Rendering (Bar vs Line)
    renderChart(state);

    // 6. Goal Tracker List Rendering
    renderGoals(state);

    // 7. Transaction List Rendering
    renderTransactions(state);
  }

  // =========================================================================
  // 5. Chart Rendering (Interactive Stacked Bars or SVG Trend Line)
  // =========================================================================
  function renderChart(state) {
    if (!chartContainer) return;
    const currentData = state.chartData[state.selectedPeriod] || state.chartData['7d'];

    if (state.chartType === 'line') {
      // SVG Line Chart view
      const yAxisHtml = `
        <div class="chart-y-axis">
          <span>30</span>
          <span>20</span>
          <span>10</span>
          <span>0</span>
          <span>-10</span>
        </div>
      `;

      // Calculate SVG points
      const width = 480;
      const height = 150;
      const step = width / (currentData.length - 1);
      const points = currentData.map((d, i) => {
        const x = i * step;
        const normalized = Math.min(140, Math.max(10, d.height));
        const y = height - normalized;
        return { x, y, ...d };
      });

      const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');
      const areaPoints = `0,${height} ${polyPoints} ${width},${height}`;

      chartContainer.innerHTML = `
        ${yAxisHtml}
        <div class="chart-bars-area" style="position:relative;">
          <div class="chart-grid-lines">
            <div class="chart-grid-line"></div>
            <div class="chart-grid-line"></div>
            <div class="chart-grid-line"></div>
            <div class="chart-grid-line"></div>
            <div class="chart-grid-line"></div>
          </div>
          <svg class="chart-line-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="position:absolute; top:10px; left:0; width:100%; height:140px;">
            <defs>
              <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#82cb15" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#82cb15" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            <polygon class="chart-area-path" points="${areaPoints}"/>
            <polyline class="chart-line-path" points="${polyPoints}"/>
            ${points.map((p, idx) => `
              <circle class="chart-point ${p.day === state.activeBarDay ? 'active' : ''}" cx="${p.x}" cy="${p.y}" data-index="${idx}"/>
            `).join('')}
          </svg>
          <div class="chart-x-axis" style="position:absolute; bottom:0; left:0; right:0;">
            ${currentData.map(d => `<span class="x-label">${d.day}</span>`).join('')}
          </div>
        </div>
      `;
      return;
    }

    // Default: Stacked Bar Chart view
    const yAxisHtml = `
      <div class="chart-y-axis">
        <span>30</span>
        <span>20</span>
        <span>10</span>
        <span>0</span>
        <span>-10</span>
      </div>
    `;

    const barsHtml = currentData.map((d) => {
      const isActive = d.day === state.activeBarDay;
      const savingsH = Math.max(14, Math.round(d.savings / (state.selectedPeriod === '30d' ? 100 : 10)));
      const incomeH = Math.max(24, Math.round(d.income / (state.selectedPeriod === '30d' ? 100 : 10)));
      const expensesH = Math.max(14, Math.round(d.expenses / (state.selectedPeriod === '30d' ? 100 : 15)));

      const activeTooltipHtml = isActive ? `
        <div class="chart-tooltip" id="chart-tooltip">
          <div class="tooltip-date">${d.date}</div>
          <div class="tooltip-row">
            <div class="tooltip-label">
              <span class="legend-color-box legend-savings"></span>
              <span>Savings</span>
            </div>
            <span class="tooltip-val">$${d.savings.toLocaleString()}</span>
          </div>
          <div class="tooltip-row">
            <div class="tooltip-label">
              <span class="legend-color-box legend-income"></span>
              <span>Income</span>
            </div>
            <span class="tooltip-val">$${d.income.toLocaleString()}</span>
          </div>
          <div class="tooltip-row">
            <div class="tooltip-label">
              <span class="legend-color-box legend-expenses"></span>
              <span>Expences</span>
            </div>
            <span class="tooltip-val">$${d.expenses.toLocaleString()}</span>
          </div>
        </div>
      ` : '';

      const segmentsHtml = isActive ? `
        <div class="bar-segment segment-savings" style="height:${savingsH}px; background-color: var(--color-savings);"></div>
        <div class="bar-segment segment-income" style="height:${incomeH}px; background-color: var(--color-income);"></div>
        <div class="bar-segment segment-expenses" style="height:${expensesH}px; background-color: var(--color-expense);"></div>
      ` : `
        <div class="bar-segment" style="height:100%; background:#eef1f5;"></div>
      `;

      return `
        <div class="bar-col ${isActive ? 'active' : ''}" data-day="${d.day}">
          ${activeTooltipHtml}
          <div class="bar-stack" style="height:${d.height}px;">
            ${segmentsHtml}
          </div>
        </div>
      `;
    }).join('');

    const xAxisHtml = `
      <div class="chart-x-axis">
        ${currentData.map(d => `<span class="x-label">${d.day}</span>`).join('')}
      </div>
    `;

    chartContainer.innerHTML = `
      ${yAxisHtml}
      <div class="chart-bars-area">
        <div class="chart-grid-lines">
          <div class="chart-grid-line"></div>
          <div class="chart-grid-line"></div>
          <div class="chart-grid-line"></div>
          <div class="chart-grid-line"></div>
          <div class="chart-grid-line"></div>
        </div>
        <div class="chart-bars-row">
          ${barsHtml}
        </div>
        ${xAxisHtml}
      </div>
    `;

    // Attach hover & touch events to chart columns
    const cols = chartContainer.querySelectorAll('.bar-col');
    cols.forEach(col => {
      const day = col.getAttribute('data-day');
      col.addEventListener('mouseenter', () => window.AppState.setActiveBar(day));
      col.addEventListener('click', () => window.AppState.setActiveBar(day));
    });
  }

  // =========================================================================
  // 6. Goal Tracker Rendering & Contribution Modal
  // =========================================================================
  function renderGoals(state) {
    const goalCard = document.querySelector('.goal-tracker-card');
    if (!goalCard) return;

    const thisYearGoals = state.goals.filter(g => g.category === 'This year');
    const longTermGoals = state.goals.filter(g => g.category === 'Long term');

    function renderGoalItem(g) {
      const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
      const fillClass = g.theme === 'green' ? 'fill-green' : 'fill-orange';

      let iconSvg = '';
      if (g.icon === 'treasure') {
        iconSvg = `
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <rect x="3" y="10" width="30" height="20" rx="5" fill="#f1f5f9"/>
            <rect x="5" y="12" width="26" height="16" rx="3.5" fill="#e2e8f0"/>
            <rect x="3" y="10" width="30" height="8" rx="4" fill="#cbd5e1"/>
            <rect x="14" y="14" width="8" height="8" rx="2" fill="#82cb15"/>
            <circle cx="18" cy="18" r="1.5" fill="#ffffff"/>
          </svg>`;
      } else if (g.icon === 'suitcase') {
        iconSvg = `
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <rect x="6" y="11" width="24" height="20" rx="4.5" fill="#fed7aa"/>
            <rect x="8" y="13" width="20" height="16" rx="3" fill="#ffedd5"/>
            <path d="M14 11V7C14 5.89543 14.8954 5 16 5H20C21.1046 5 22 5.89543 22 7V11" stroke="#f97316" stroke-width="2"/>
            <line x1="13" y1="11" x2="13" y2="31" stroke="#fb923c" stroke-width="2"/>
            <line x1="23" y1="11" x2="23" y2="31" stroke="#fb923c" stroke-width="2"/>
          </svg>`;
      } else if (g.icon === 'car') {
        iconSvg = `
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <path d="M6 20L10 11C10.8 9.5 12.3 8.5 14 8.5H22C23.7 8.5 25.2 9.5 26 11L30 20V26H6V20Z" fill="#e2e8f0"/>
            <circle cx="11" cy="26" r="3.5" fill="#475569"/>
            <circle cx="25" cy="26" r="3.5" fill="#475569"/>
          </svg>`;
      } else {
        iconSvg = `
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <polygon points="18,5 4,16 9,16 9,29 27,29 27,16 32,16" fill="#e2e8f0"/>
            <polygon points="18,4 3,16 6,16 18,7 30,16 33,16" fill="#94a3b8"/>
            <rect x="15" y="21" width="6" height="8" fill="#64748b" rx="1"/>
          </svg>`;
      }

      return `
        <div class="goal-item" data-goal-id="${g.id}" style="cursor:pointer;" title="Click to add funds">
          <div class="goal-icon-wrapper">${iconSvg}</div>
          <div class="goal-details">
            <div class="goal-title-row">
              <span class="goal-name">${g.title}</span>
              <span class="goal-amounts">$${g.saved.toLocaleString()} <span>/ $${g.target.toLocaleString()}</span></span>
            </div>
            <div class="goal-progress-bar">
              <div class="goal-progress-fill ${fillClass}" style="width: ${pct}%;"></div>
            </div>
            <span class="goal-time-left">${g.timeLeft} (${pct}%)</span>
          </div>
        </div>
      `;
    }

    goalCard.innerHTML = `
      <div class="goal-header">
        <h3 class="card-title">Goal tracker</h3>
        <button class="pill-select" id="btn-add-goal">
          <span>+ Add goals</span>
        </button>
      </div>

      <div class="goal-group-label">This year</div>
      ${thisYearGoals.map(renderGoalItem).join('')}

      <div class="goal-group-label" style="margin-top: 14px;">Long term</div>
      ${longTermGoals.map(renderGoalItem).join('')}
    `;

    // Reattach "+ Add goals" button listener
    const addGoalBtn = goalCard.querySelector('#btn-add-goal');
    if (addGoalBtn) addGoalBtn.addEventListener('click', openAddGoalModal);

    // Goal click to contribute
    const goalItems = goalCard.querySelectorAll('.goal-item');
    goalItems.forEach(item => {
      item.addEventListener('click', () => {
        const goalId = item.getAttribute('data-goal-id');
        const goal = state.goals.find(g => g.id === goalId);
        if (!goal) return;

        openModal(`Deposit to ${goal.title}`, `
          <div style="display:flex; flex-direction:column; gap:14px;">
            <p>Current balance: <strong>$${goal.saved.toLocaleString()}</strong> of <strong>$${goal.target.toLocaleString()}</strong></p>
            <div>
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Deposit Amount ($)</label>
              <input type="number" id="deposit-amount-input" placeholder="250.00" value="250" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-size:18px; font-weight:700;">
            </div>
            <button class="btn-pro" id="btn-submit-deposit">Confirm Deposit</button>
          </div>
        `);

        setTimeout(() => {
          document.getElementById('btn-submit-deposit')?.addEventListener('click', () => {
            const amt = document.getElementById('deposit-amount-input').value;
            if (window.AppState.contributeToGoal(goalId, amt)) {
              closeModal();
              showToast(`Deposited $${amt} toward ${goal.title}!`, '🎯');
            } else {
              showToast('Invalid amount', '⚠️');
            }
          });
        }, 50);
      });
    });
  }

  // =========================================================================
  // 7. Transactions List Rendering
  // =========================================================================
  function renderTransactions(state) {
    if (!txListContainer) return;
    const list = window.AppState.getFilteredTransactions();

    if (list.length === 0) {
      txListContainer.innerHTML = `
        <div style="text-align:center; padding: 24px 10px; color: var(--text-muted); font-size:13px;">
          No transactions found matching your search.
        </div>
      `;
      return;
    }

    txListContainer.innerHTML = list.map(tx => {
      const isPositive = tx.amount > 0;
      const amtFormatted = isPositive ? `+ $${tx.amount.toLocaleString()}` : `- $${Math.abs(tx.amount).toLocaleString()}`;
      const amtClass = isPositive ? 'positive' : 'negative';
      const statusClass = tx.status === 'Declined' ? 'declined' : '';

      let logoBoxHtml = '';
      if (tx.avatarType === 'elli') {
        logoBoxHtml = `
          <svg class="tx-logo-box" viewBox="0 0 36 36" style="border-radius: 50%;">
            <circle cx="18" cy="18" r="18" fill="#fce7f3"/>
            <circle cx="18" cy="14" r="6" fill="#fbcfe8"/>
            <path d="M12 14C12 9 15 8 18 8C21 8 24 9 24 14C24 18 22 20 20 21L18 17L16 21C14 20 12 18 12 14Z" fill="#d97706"/>
            <path d="M8 32C8 26 12 23 18 23C24 23 28 26 28 32" fill="#ec4899"/>
          </svg>`;
      } else if (tx.avatarType === 'davis') {
        logoBoxHtml = `
          <svg class="tx-logo-box" viewBox="0 0 36 36" style="border-radius: 50%;">
            <circle cx="18" cy="18" r="18" fill="#e2e8f0"/>
            <circle cx="18" cy="14" r="6" fill="#fed7aa"/>
            <path d="M12 11C12 8 15 7 18 7C21 7 24 8 24 11L23 13H13L12 11Z" fill="#1e293b"/>
            <path d="M8 32C8 26 12 23 18 23C24 23 28 26 28 32" fill="#3b82f6"/>
          </svg>`;
      } else if (tx.logoType === 'salesforce') {
        logoBoxHtml = `
          <div class="tx-logo-box" style="background-color: #00a1e0; color: #ffffff;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
            </svg>
          </div>`;
      } else {
        const bg = tx.logoBg || '#1e293b';
        const col = tx.logoColor || '#ffffff';
        const txt = tx.logoText || tx.title.slice(0, 2).toUpperCase();
        logoBoxHtml = `<div class="tx-logo-box" style="background-color: ${bg}; color: ${col}; font-weight:700;">${txt}</div>`;
      }

      return `
        <div class="tx-item" data-id="${tx.id}">
          <div class="tx-left">
            ${logoBoxHtml}
            <div class="tx-details">
              <span class="tx-title">${tx.title}</span>
              <span class="tx-date">${tx.date}</span>
            </div>
          </div>
          <div class="tx-right">
            <span class="tx-amount ${amtClass}">${amtFormatted}</span>
            <span class="tx-status ${statusClass}">${tx.status}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // 8. Modals (Send, Top Up, Add Goal, Spending Limit, Settings)
  // =========================================================================
  function openSendModal(recipientName = '') {
    openModal('Send Money', `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div>
          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Recipient</label>
          <input type="text" id="send-recipient-input" value="${recipientName}" placeholder="Name, @handle, or email" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-family:inherit;">
        </div>
        <div>
          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Amount ($)</label>
          <input type="number" id="send-amount-input" placeholder="100.00" value="100" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-size:20px; font-weight:700;">
        </div>
        <div>
          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Category</label>
          <select id="send-category-select" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-family:inherit; background:#ffffff;">
            <option value="Food">Food & Dining</option>
            <option value="Transportation">Transportation</option>
            <option value="Housing">Housing</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Investments">Investments</option>
            <option value="Other" selected>Other / Transfer</option>
          </select>
        </div>
        <button class="btn-pro" id="btn-submit-send" style="margin-top:6px;">Confirm & Transfer</button>
      </div>
    `);

    setTimeout(() => {
      document.getElementById('btn-submit-send')?.addEventListener('click', () => {
        const recipient = document.getElementById('send-recipient-input').value.trim() || 'Quick Transfer';
        const amount = document.getElementById('send-amount-input').value;
        const category = document.getElementById('send-category-select').value;

        if (window.AppState.sendMoney(recipient, amount, '', category)) {
          closeModal();
          showToast(`Transferred $${amount} to ${recipient}!`, '💸');
        } else {
          showToast('Please enter a valid amount', '⚠️');
        }
      });
    }, 50);
  }

  function openTopUpModal() {
    openModal('Top Up Card Balance', `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <label style="display:block; font-size:12px; font-weight:600;">Choose Amount</label>
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px;">
          <button class="pill-select" style="justify-content:center; padding:10px;" onclick="document.getElementById('topup-custom').value=100">$100</button>
          <button class="pill-select" style="justify-content:center; padding:10px;" onclick="document.getElementById('topup-custom').value=500">$500</button>
          <button class="pill-select" style="justify-content:center; padding:10px;" onclick="document.getElementById('topup-custom').value=1000">$1,000</button>
        </div>
        <input type="number" id="topup-custom" placeholder="Custom amount ($)" value="500" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-weight:700;">
        <button class="btn-pro" id="btn-submit-topup">Instant Top Up</button>
      </div>
    `);

    setTimeout(() => {
      document.getElementById('btn-submit-topup')?.addEventListener('click', () => {
        const amt = document.getElementById('topup-custom').value;
        if (window.AppState.topUpCard(amt)) {
          closeModal();
          showToast(`Added $${amt} to your Debit card balance!`, '💳');
        }
      });
    }, 50);
  }

  function openAddGoalModal() {
    openModal('Create New Financial Goal', `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div>
          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Goal Title</label>
          <input type="text" id="goal-title-input" placeholder="e.g. Wedding, Laptop, Emergency" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-family:inherit;">
        </div>
        <div>
          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Target Amount ($)</label>
          <input type="number" id="goal-target-input" placeholder="5000" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-family:inherit;">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div>
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Category</label>
            <select id="goal-cat-select" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-family:inherit; background:#ffffff;">
              <option value="This year">This year</option>
              <option value="Long term">Long term</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Months to Save</label>
            <input type="number" id="goal-months-input" value="6" min="1" max="120" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-family:inherit;">
          </div>
        </div>
        <button class="btn-pro" id="btn-submit-goal" style="margin-top:6px;">Create Goal</button>
      </div>
    `);

    setTimeout(() => {
      document.getElementById('btn-submit-goal')?.addEventListener('click', () => {
        const title = document.getElementById('goal-title-input').value;
        const target = document.getElementById('goal-target-input').value;
        const category = document.getElementById('goal-cat-select').value;
        const months = document.getElementById('goal-months-input').value || 6;

        if (window.AppState.addGoal({ title, target, category, deadlineMonths: months })) {
          closeModal();
          showToast(`Goal "${title}" created successfully!`, '🎯');
        } else {
          showToast('Please specify a title and target amount', '⚠️');
        }
      });
    }, 50);
  }

  // Settings & Reset Data Dialog
  const btnSettings = document.getElementById('btn-settings');
  if (btnSettings) {
    btnSettings.addEventListener('click', () => {
      openModal('Dashboard Settings & Data', `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div>
            <strong>Account Currency</strong>
            <p style="font-size:12px; color:#64748b; margin-top:2px;">USD ($) United States Dollar</p>
          </div>
          <div style="border-top:1px solid #edf0f4; padding-top:14px;">
            <strong>Data Management</strong>
            <p style="font-size:12px; color:#64748b; margin-top:2px; margin-bottom:10px;">
              All changes are saved to your browser storage. You can restore the original sample data anytime.
            </p>
            <button class="btn-pro" id="btn-reset-data" style="background:#ef4444; color:#ffffff;">Reset to Demo Data</button>
          </div>
        </div>
      `);

      setTimeout(() => {
        document.getElementById('btn-reset-data')?.addEventListener('click', () => {
          window.AppState.resetDefaults();
          closeModal();
          showToast('All dashboard data restored to default!', '🔄');
        });
      }, 50);
    });
  }

  // Spending Limit Edit
  const btnEditLimit = document.getElementById('btn-edit-limit');
  if (btnEditLimit) {
    btnEditLimit.addEventListener('click', () => {
      openModal('Adjust Monthly Spending Cap', `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <label style="display:block; font-size:12px; font-weight:600;">Monthly Budget Limit ($)</label>
          <input type="number" id="input-new-limit" value="${window.AppState.state.spendingLimit.total}" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; font-size:18px; font-weight:700;">
          <button class="btn-pro" id="btn-save-limit">Save Budget</button>
        </div>
      `);

      setTimeout(() => {
        document.getElementById('btn-save-limit')?.addEventListener('click', () => {
          const newLim = document.getElementById('input-new-limit').value;
          if (window.AppState.updateSpendingLimit(newLim)) {
            closeModal();
            showToast(`Spending limit set to $${Number(newLim).toLocaleString()}`);
          }
        });
      }, 50);
    });
  }

  // =========================================================================
  // 9. Attach Button Listeners (Filters, Quick Actions, Search)
  // =========================================================================
  // Period Selector (7d vs 30d)
  if (btnFilterPeriod) {
    btnFilterPeriod.addEventListener('click', () => {
      const nextPeriod = window.AppState.state.selectedPeriod === '7d' ? '30d' : '7d';
      window.AppState.setPeriod(nextPeriod);
      showToast(`Showing ${nextPeriod} analytics`);
    });
  }

  // Chart Type Toggle
  if (btnChartBar && btnChartLine) {
    btnChartBar.addEventListener('click', () => {
      btnChartBar.classList.add('active');
      btnChartLine.classList.remove('active');
      window.AppState.setChartType('bar');
      showToast('Switched to Bar Chart');
    });

    btnChartLine.addEventListener('click', () => {
      btnChartLine.classList.add('active');
      btnChartBar.classList.remove('active');
      window.AppState.setChartType('line');
      showToast('Switched to Line Trend Chart');
    });
  }

  // Quick Action Buttons
  const actionButtons = document.querySelectorAll('.action-btn');
  actionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      if (action === 'Send') openSendModal();
      else if (action === 'Top up') openTopUpModal();
      else if (action === 'Request') {
        openModal('Request Money', `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <p>Request instant payment from contacts or share a link.</p>
            <div>
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Amount ($)</label>
              <input type="number" id="req-amount" placeholder="75.00" value="75" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; font-size:18px; font-weight:700;">
            </div>
            <button class="btn-pro" id="btn-submit-req">Send Payment Link</button>
          </div>
        `);
        setTimeout(() => {
          document.getElementById('btn-submit-req')?.addEventListener('click', () => {
            closeModal();
            showToast('Payment request link copied to clipboard!');
          });
        }, 50);
      } else {
        showToast(`${action} option selected`);
      }
    });
  });

  // Contact Avatar Click to Send
  const contactItems = document.querySelectorAll('.contact-item');
  contactItems.forEach(item => {
    item.addEventListener('click', () => {
      const name = item.getAttribute('data-name');
      openSendModal(name);
    });
  });

  // Search input with real-time state filter
  if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      window.AppState.setSearchQuery(e.target.value);
    });
  }

  // Sort buttons
  if (btnSortName) {
    btnSortName.addEventListener('click', () => {
      window.AppState.toggleSort('name');
      btnSortName.classList.add('active');
      btnSortAmount?.classList.remove('active');
    });
  }

  if (btnSortAmount) {
    btnSortAmount.addEventListener('click', () => {
      window.AppState.toggleSort('amount');
      btnSortAmount.classList.add('active');
      btnSortName?.classList.remove('active');
    });
  }

  // 3D Credit Card Swap Animation
  const cardCarousel = document.getElementById('card-carousel');
  const cardFront = document.getElementById('credit-card-front');
  const cardBack = document.getElementById('credit-card-back');
  let isFrontMain = true;

  if (cardCarousel && cardFront && cardBack) {
    cardCarousel.addEventListener('click', () => {
      if (isFrontMain) {
        cardFront.style.transform = 'translate(30px, 4px) scale(0.96)';
        cardFront.style.zIndex = '1';
        cardFront.style.opacity = '0.7';

        cardBack.style.transform = 'translate(-30px, -4px) scale(1.04)';
        cardBack.style.zIndex = '2';
        cardBack.style.opacity = '1';
        isFrontMain = false;
        showToast('Viewing Titanium Mastercard (Credit)');
      } else {
        cardFront.style.transform = 'translate(0, 0) scale(1)';
        cardFront.style.zIndex = '2';
        cardFront.style.opacity = '1';

        cardBack.style.transform = 'translate(0, 0) scale(1)';
        cardBack.style.zIndex = '1';
        cardBack.style.opacity = '0.85';
        isFrontMain = true;
        showToast('Viewing Primary Visa (Debit)');
      }
    });
  }

  // Add Card & Add Widget
  const btnAddCard = document.getElementById('btn-add-card');
  if (btnAddCard) {
    btnAddCard.addEventListener('click', () => {
      openModal('Connect New Card', `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Card Number</label>
            <input type="text" placeholder="•••• •••• •••• ••••" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; font-family:inherit;">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Expiry Date</label>
              <input type="text" placeholder="MM/YY" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; font-family:inherit;">
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Security CVV</label>
              <input type="password" placeholder="•••" maxlength="4" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; font-family:inherit;">
            </div>
          </div>
          <button class="btn-pro" id="btn-save-card" style="margin-top:6px;">Link Card Securely</button>
        </div>
      `);
      setTimeout(() => {
        document.getElementById('btn-save-card')?.addEventListener('click', () => {
          closeModal();
          showToast('Card linked securely!', '💳');
        });
      }, 50);
    });
  }

  const btnAddWidget = document.getElementById('btn-add-widget');
  if (btnAddWidget) {
    btnAddWidget.addEventListener('click', () => {
      openModal('Customize Widgets', `
        <div style="display:flex; flex-direction:column; gap:10px;">
          <label style="display:flex; align-items:center; gap:10px; padding:10px; border:1px solid #e2e8f0; border-radius:10px; cursor:pointer;">
            <input type="checkbox" checked> <span>Forex & Currency Converter</span>
          </label>
          <label style="display:flex; align-items:center; gap:10px; padding:10px; border:1px solid #e2e8f0; border-radius:10px; cursor:pointer;">
            <input type="checkbox" checked> <span>Stock & Index Holdings</span>
          </label>
          <label style="display:flex; align-items:center; gap:10px; padding:10px; border:1px solid #e2e8f0; border-radius:10px; cursor:pointer;">
            <input type="checkbox"> <span>Bill Payment Reminders</span>
          </label>
          <button class="btn-pro" style="margin-top:8px;" onclick="document.getElementById('modal-overlay').classList.remove('active')">Save Layout</button>
        </div>
      `);
    });
  }

  // =========================================================================
  // 10. Subscribe and Initial Render
  // =========================================================================
  window.AppState.subscribe(render);
  render(window.AppState.state);

});
