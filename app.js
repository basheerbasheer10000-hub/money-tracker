/**
 * ACRU Financial Dashboard - Core Interactive Logic
 * Pure Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. Toast Notification Helper
  // =========================================================================
  const toastContainer = document.getElementById('toast-container');
  function showToast(message, icon = '✓') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // =========================================================================
  // 2. Interactive Modal Dialog
  // =========================================================================
  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');

  function openModal(title, htmlContent) {
    modalTitle.textContent = title;
    modalBody.innerHTML = htmlContent;
    modalOverlay.classList.add('active');
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // =========================================================================
  // 3. Sidebar Collapse & Navigation
  // =========================================================================
  const sidebar = document.getElementById('sidebar');
  const btnCollapse = document.getElementById('btn-collapse-sidebar');
  const navItems = document.querySelectorAll('.nav-item');
  const transactionsGroup = document.getElementById('transactions-group');
  const navTransactions = document.getElementById('nav-transactions');
  const proCard = document.getElementById('pro-card');
  const btnClosePro = document.getElementById('btn-close-pro');
  const btnUpgradeNow = document.getElementById('btn-upgrade-now');

  // Toggle Sidebar Collapse
  btnCollapse.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    btnCollapse.querySelector('span').textContent = isCollapsed ? '' : 'Collapse sidebar';
  });

  // Expand / Collapse Transactions Sub-menu
  navTransactions.addEventListener('click', (e) => {
    e.stopPropagation();
    transactionsGroup.classList.toggle('expanded');
    const isExpanded = transactionsGroup.classList.contains('expanded');
    navTransactions.setAttribute('aria-expanded', isExpanded);
  });

  // Nav Item Switching
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      if (this.id === 'nav-transactions') return; // Handled by group toggle
      navItems.forEach(n => n.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Dismiss Pro Card
  btnClosePro.addEventListener('click', (e) => {
    e.stopPropagation();
    proCard.style.opacity = '0';
    proCard.style.transform = 'scale(0.95)';
    proCard.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      proCard.style.display = 'none';
    }, 300);
    showToast('Pro announcement dismissed');
  });

  // Upgrade Now Modal
  btnUpgradeNow.addEventListener('click', () => {
    openModal('Upgrade to ACRU Pro', `
      <p style="margin-bottom: 16px;">Unlock predictive AI financial insights, unlimited automated accounts sync, priority transfers, and custom multi-currency reporting.</p>
      <div style="background: #f8f9fb; border-radius: 12px; padding: 14px; margin-bottom: 20px;">
        <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
          <strong>ACRU Pro Plan</strong>
          <strong style="color: #16a34a;">$19.99 / mo</strong>
        </div>
        <small style="color: #64748b;">30-day money-back guarantee. Cancel anytime.</small>
      </div>
      <button class="btn-pro" id="btn-confirm-upgrade" style="padding: 12px 0;">Activate 30-Day Free Trial</button>
    `);

    setTimeout(() => {
      const confirmBtn = document.getElementById('btn-confirm-upgrade');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          closeModal();
          showToast('Welcome to ACRU Pro! Premium analytics activated.', '⚡');
        });
      }
    }, 50);
  });

  // =========================================================================
  // 4. Interactive Bar Chart & Hover Tooltip
  // =========================================================================
  const barCols = document.querySelectorAll('.bar-col');
  const chartTooltip = document.getElementById('chart-tooltip');
  const tooltipDate = document.getElementById('tooltip-date');
  const tooltipSavings = document.getElementById('tooltip-savings');
  const tooltipIncome = document.getElementById('tooltip-income');
  const tooltipExpenses = document.getElementById('tooltip-expenses');

  // Cache default Wednesday bar as anchor
  const wedCol = document.getElementById('bar-wed');

  function activateBar(col) {
    barCols.forEach(b => {
      b.classList.remove('active');
      const stack = b.querySelector('.bar-stack');
      if (b !== col) {
        // Reset inactive colors
        stack.innerHTML = `<div class="bar-segment" style="height: 100%; background: #eef1f5;"></div>`;
      }
    });

    col.classList.add('active');

    // Retrieve data
    const date = col.getAttribute('data-date');
    const savings = col.getAttribute('data-savings');
    const income = col.getAttribute('data-income');
    const expenses = col.getAttribute('data-expenses');

    // Build colorful segments for active bar
    const stack = col.querySelector('.bar-stack');
    const savingsH = Math.max(14, Math.round(savings / 10));
    const incomeH = Math.max(24, Math.round(income / 10));
    const expensesH = Math.max(14, Math.round(expenses / 15));

    stack.innerHTML = `
      <div class="bar-segment segment-savings" style="height: ${savingsH}px; background-color: var(--color-savings);"></div>
      <div class="bar-segment segment-income" style="height: ${incomeH}px; background-color: var(--color-income);"></div>
      <div class="bar-segment segment-expenses" style="height: ${expensesH}px; background-color: var(--color-expense);"></div>
    `;

    // Move tooltip into this bar
    col.appendChild(chartTooltip);
    tooltipDate.textContent = date;
    tooltipSavings.textContent = `$${savings}`;
    tooltipIncome.textContent = `$${income}`;
    tooltipExpenses.textContent = `$${expenses}`;
  }

  barCols.forEach(col => {
    col.addEventListener('mouseenter', () => {
      activateBar(col);
    });
  });

  // Return to Wednesday when leaving chart area
  const chartBarsArea = document.querySelector('.chart-bars-area');
  chartBarsArea.addEventListener('mouseleave', () => {
    activateBar(wedCol);
  });

  // Period Filter Button (7d / 30d toggle)
  const btnFilterPeriod = document.getElementById('btn-filter-period');
  const periodLabel = document.getElementById('period-label');
  const mainBalanceVal = document.getElementById('main-balance-val');
  let currentPeriod = '7d';

  btnFilterPeriod.addEventListener('click', () => {
    if (currentPeriod === '7d') {
      currentPeriod = '30d';
      periodLabel.textContent = '30d';
      mainBalanceVal.textContent = '$48,920';
      showToast('Showing 30-day analytics');
    } else {
      currentPeriod = '7d';
      periodLabel.textContent = '7d';
      mainBalanceVal.textContent = '$12,450';
      showToast('Showing 7-day analytics');
    }
  });

  // Chart Type Toggle (Bar vs Line)
  const btnChartBar = document.getElementById('btn-chart-bar');
  const btnChartLine = document.getElementById('btn-chart-line');

  btnChartBar.addEventListener('click', () => {
    btnChartBar.classList.add('active');
    btnChartLine.classList.remove('active');
    showToast('Switched to Bar chart');
  });

  btnChartLine.addEventListener('click', () => {
    btnChartLine.classList.add('active');
    btnChartBar.classList.remove('active');
    showToast('Switched to Trend line chart');
  });

  // =========================================================================
  // 5. Financial Health Speedometer Gauge Animation
  // =========================================================================
  const gaugeMeterPath = document.getElementById('gauge-meter-path');
  const gaugeNumber = document.getElementById('gauge-number');

  function setGaugeValue(percent) {
    // Semi-circle arc length for radius 70: π * 70 ≈ 220
    const totalLength = 220;
    const offset = totalLength - (totalLength * (percent / 100));
    gaugeMeterPath.style.strokeDasharray = `${totalLength}`;
    gaugeMeterPath.style.strokeDashoffset = `${offset}`;
    gaugeNumber.textContent = `${percent}%`;
  }

  // Animate on load
  setTimeout(() => {
    setGaugeValue(75);
  }, 200);

  // Period filter on Health Card
  const btnHealthPeriod = document.getElementById('btn-health-period');
  btnHealthPeriod.addEventListener('click', () => {
    const is30d = btnHealthPeriod.querySelector('span').textContent === '30d';
    if (is30d) {
      btnHealthPeriod.querySelector('span').textContent = '90d';
      setGaugeValue(84);
      showToast('Health recalculated for 90 days: 84%');
    } else {
      btnHealthPeriod.querySelector('span').textContent = '30d';
      setGaugeValue(75);
      showToast('Health recalculated for 30 days: 75%');
    }
  });

  // =========================================================================
  // 6. Credit Card Stack Carousel Swap
  // =========================================================================
  const cardCarousel = document.getElementById('card-carousel');
  const cardFront = document.getElementById('credit-card-front');
  const cardBack = document.getElementById('credit-card-back');
  let isFrontMain = true;

  cardCarousel.addEventListener('click', () => {
    if (isFrontMain) {
      // Bring back card to front
      cardFront.style.transform = 'translate(36px, 4px) scale(0.96)';
      cardFront.style.zIndex = '1';
      cardFront.style.opacity = '0.7';

      cardBack.style.transform = 'translate(-36px, -4px) scale(1.04)';
      cardBack.style.zIndex = '2';
      cardBack.style.opacity = '1';
      isFrontMain = false;
      showToast('Viewing Titanium Mastercard (Credit)');
    } else {
      // Restore lime card to front
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

  // Add Card Button
  const btnAddCard = document.getElementById('btn-add-card');
  btnAddCard.addEventListener('click', () => {
    openModal('Link New Card or Account', `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div>
          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Cardholder Name</label>
          <input type="text" value="Michael Johnson" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-family:inherit;">
        </div>
        <div>
          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Card Number</label>
          <input type="text" placeholder="•••• •••• •••• ••••" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-family:inherit;">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div>
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Expiry Date</label>
            <input type="text" placeholder="MM/YY" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-family:inherit;">
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">CVV</label>
            <input type="password" placeholder="•••" maxlength="4" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-family:inherit;">
          </div>
        </div>
        <button class="btn-pro" style="margin-top:10px;" id="btn-save-new-card">Connect Card Securely</button>
      </div>
    `);

    setTimeout(() => {
      const saveBtn = document.getElementById('btn-save-new-card');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          closeModal();
          showToast('Card successfully linked!', '💳');
        });
      }
    }, 50);
  });

  // =========================================================================
  // 7. Quick Actions Row (Top up, Send, Request, History, More)
  // =========================================================================
  const actionButtons = document.querySelectorAll('.action-btn');
  actionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      if (action === 'Send') {
        openSendModal();
      } else if (action === 'Top up') {
        openTopUpModal();
      } else if (action === 'Request') {
        openModal('Request Money', `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <p>Generate a payment link or request directly from contacts.</p>
            <div>
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Amount ($)</label>
              <input type="number" placeholder="50.00" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-size:18px; font-weight:700;">
            </div>
            <button class="btn-pro" id="btn-confirm-req">Send Payment Request</button>
          </div>
        `);
        setTimeout(() => {
          document.getElementById('btn-confirm-req')?.addEventListener('click', () => {
            closeModal();
            showToast('Payment request dispatched!');
          });
        }, 50);
      } else {
        showToast(`${action} option selected`);
      }
    });
  });

  function openSendModal(recipientName = '') {
    openModal('Send Money', `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div>
          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Recipient</label>
          <input type="text" id="send-recipient-input" value="${recipientName}" placeholder="Name, email, or @handle" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-family:inherit;">
        </div>
        <div>
          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Amount ($)</label>
          <input type="number" id="send-amount-input" placeholder="100.00" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-size:20px; font-weight:700;">
        </div>
        <div>
          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">From Account</label>
          <select style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-family:inherit; background:#ffffff;">
            <option>Primary Debit (*7890) - $12,450.00</option>
            <option>Savings Account - $8,300.00</option>
          </select>
        </div>
        <button class="btn-pro" id="btn-submit-send" style="margin-top:6px;">Confirm & Transfer</button>
      </div>
    `);

    setTimeout(() => {
      document.getElementById('btn-submit-send')?.addEventListener('click', () => {
        const recipient = document.getElementById('send-recipient-input').value || 'Recipient';
        const amount = document.getElementById('send-amount-input').value || '100.00';
        closeModal();
        showToast(`Transferred $${amount} to ${recipient} successfully!`, '💸');
      });
    }, 50);
  }

  function openTopUpModal() {
    openModal('Top Up Card Balance', `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <label style="display:block; font-size:12px; font-weight:600;">Choose Amount</label>
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px;">
          <button class="pill-select" style="justify-content:center; padding:10px;" onclick="document.getElementById('topup-custom').value=100">$100</button>
          <button class="pill-select" style="justify-content:center; padding:10px;" onclick="document.getElementById('topup-custom').value=250">$250</button>
          <button class="pill-select" style="justify-content:center; padding:10px;" onclick="document.getElementById('topup-custom').value=500">$500</button>
        </div>
        <input type="number" id="topup-custom" placeholder="Custom amount ($)" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-weight:700;">
        <button class="btn-pro" id="btn-submit-topup">Instant Top Up</button>
      </div>
    `);

    setTimeout(() => {
      document.getElementById('btn-submit-topup')?.addEventListener('click', () => {
        const amt = document.getElementById('topup-custom').value || '250';
        closeModal();
        showToast(`Successfully added $${amt} to your Debit card!`, '💳');
      });
    }, 50);
  }

  // Quick Payment Contacts Row
  const contactItems = document.querySelectorAll('.contact-item');
  contactItems.forEach(item => {
    item.addEventListener('click', () => {
      const name = item.getAttribute('data-name');
      openSendModal(name);
    });
  });

  // =========================================================================
  // 8. Spending Limit Edit
  // =========================================================================
  const btnEditLimit = document.getElementById('btn-edit-limit');
  const spendingSpent = document.getElementById('spending-spent');
  const spendingLimit = document.getElementById('spending-limit');
  const spendingBarFill = document.getElementById('spending-bar-fill');

  btnEditLimit.addEventListener('click', () => {
    openModal('Adjust Monthly Spending Limit', `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <label style="display:block; font-size:12px; font-weight:600;">Monthly Cap ($)</label>
        <input type="number" id="input-new-limit" value="10000" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; font-size:18px; font-weight:700;">
        <button class="btn-pro" id="btn-save-limit">Save Limit</button>
      </div>
    `);

    setTimeout(() => {
      document.getElementById('btn-save-limit')?.addEventListener('click', () => {
        const newLim = document.getElementById('input-new-limit').value || 10000;
        spendingLimit.textContent = `$${Number(newLim).toLocaleString()}`;
        const pct = Math.min(100, Math.round((8600 / Number(newLim)) * 100));
        spendingBarFill.style.width = `${pct}%`;
        closeModal();
        showToast(`Spending limit updated to $${Number(newLim).toLocaleString()}`);
      });
    }, 50);
  });

  // =========================================================================
  // 9. Add Goals & Add Widget
  // =========================================================================
  const btnAddGoal = document.getElementById('btn-add-goal');
  btnAddGoal.addEventListener('click', () => {
    openModal('Create New Financial Goal', `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div>
          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Goal Title</label>
          <input type="text" placeholder="e.g. Vacation, Wedding, Emergency" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-family:inherit;">
        </div>
        <div>
          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Target Amount ($)</label>
          <input type="number" placeholder="5000" style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-family:inherit;">
        </div>
        <div>
          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Category</label>
          <select style="width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; outline:none; font-family:inherit;">
            <option>This year</option>
            <option>Long term</option>
          </select>
        </div>
        <button class="btn-pro" id="btn-save-goal" style="margin-top:6px;">Create Goal</button>
      </div>
    `);

    setTimeout(() => {
      document.getElementById('btn-save-goal')?.addEventListener('click', () => {
        closeModal();
        showToast('New savings goal created!');
      });
    }, 50);
  });

  const btnAddWidget = document.getElementById('btn-add-widget');
  btnAddWidget.addEventListener('click', () => {
    openModal('Add Widget to Dashboard', `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <label style="display:flex; align-items:center; gap:10px; padding:10px; border:1px solid #e2e8f0; border-radius:10px; cursor:pointer;">
          <input type="checkbox" checked> <span>Crypto Holdings Tracker</span>
        </label>
        <label style="display:flex; align-items:center; gap:10px; padding:10px; border:1px solid #e2e8f0; border-radius:10px; cursor:pointer;">
          <input type="checkbox"> <span>Real-time Forex Exchange Rates</span>
        </label>
        <label style="display:flex; align-items:center; gap:10px; padding:10px; border:1px solid #e2e8f0; border-radius:10px; cursor:pointer;">
          <input type="checkbox"> <span>Bill Payment Calendar & Reminders</span>
        </label>
        <button class="btn-pro" style="margin-top:10px;" id="btn-save-widgets">Update Dashboard Layout</button>
      </div>
    `);

    setTimeout(() => {
      document.getElementById('btn-save-widgets')?.addEventListener('click', () => {
        closeModal();
        showToast('Dashboard widgets updated!');
      });
    }, 50);
  });

  // Tips Read More link
  const linkReadMore = document.getElementById('link-read-more');
  linkReadMore.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('2025 Tax Season Preparation Tips', `
      <p style="margin-bottom:12px;"><strong>Top 3 Recommended Tax Strategies:</strong></p>
      <ol style="padding-left:20px; line-height:1.6; margin-bottom:16px;">
        <li>Maximize retirement contributions (401k & IRA) before the April deadline.</li>
        <li>Itemize deductible work & travel expenses using ACRU automatic receipt tags.</li>
        <li>Allocate 10–15% of flexible monthly surplus into high-yield tax-shielded accounts.</li>
      </ol>
      <button class="btn-pro" onclick="document.getElementById('modal-overlay').classList.remove('active')">Got it</button>
    `);
  });

  // =========================================================================
  // 10. Live Search in Transactions
  // =========================================================================
  const globalSearch = document.getElementById('global-search');
  const txItems = document.querySelectorAll('.tx-item');

  globalSearch.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    let matches = 0;

    txItems.forEach(item => {
      const name = item.getAttribute('data-name').toLowerCase();
      if (!q || name.includes(q)) {
        item.style.display = 'flex';
        matches++;
      } else {
        item.style.display = 'none';
      }
    });

    if (q && matches === 0) {
      showToast(`No transactions found matching "${q}"`);
    }
  });

  // Quick period dropdown on transactions
  const btnTxPeriod = document.getElementById('btn-tx-period');
  btnTxPeriod.addEventListener('click', () => {
    const span = btnTxPeriod.querySelector('span');
    span.textContent = span.textContent === '7d' ? '30d' : '7d';
    showToast(`Transactions filtered by ${span.textContent}`);
  });

  // Quick period dropdown on cost analysis
  const btnMonthFilter = document.getElementById('btn-month-filter');
  btnMonthFilter.addEventListener('click', () => {
    const span = btnMonthFilter.querySelector('span');
    span.textContent = span.textContent === 'January' ? 'February' : 'January';
    showToast(`Cost analysis showing ${span.textContent}`);
  });

});
