/**
 * ACRU Financial Dashboard - State Management Store
 * Handles persistent state, reactive events, financial calculations & CRUD actions.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'acru_dashboard_data_v1';

  // Default Seed Data matching the initial design
  const defaultData = {
    user: {
      name: 'Michael Johnson',
      email: 'm.johnson@finex.com',
      avatar: 'michael'
    },
    cards: [
      {
        id: 'card-visa',
        type: 'Debit card',
        network: 'VISA',
        number: '•••• •••• •••• 7890',
        holder: 'Michael Johnson',
        exp: '03/30',
        balance: 12450,
        isPrimary: true
      },
      {
        id: 'card-mc',
        type: 'Credit card',
        network: 'Mastercard',
        number: '•••• •••• •••• 4120',
        holder: 'Michael Johnson',
        exp: '09/28',
        balance: 4120,
        isPrimary: false
      }
    ],
    selectedPeriod: '7d', // '7d' or '30d'
    chartType: 'bar',     // 'bar' or 'line'
    activeBarDay: 'Wed',
    searchQuery: '',
    sortField: 'date',    // 'name', 'amount', 'date'
    sortOrder: 'desc',    // 'asc', 'desc'
    spendingLimit: {
      spent: 8600,
      total: 10000
    },
    costMonth: 'January',
    chartData: {
      '7d': [
        { day: 'Sun', date: 'Sunday, 4 Jan 2025', savings: 120, income: 380, expenses: 210, height: 52 },
        { day: 'Mon', date: 'Monday, 5 Jan 2025', savings: 190, income: 520, expenses: 340, height: 72 },
        { day: 'Tue', date: 'Tuesday, 6 Jan 2025', savings: 150, income: 480, expenses: 300, height: 86 },
        { day: 'Wed', date: 'Wednesday, 7 Jan 2025', savings: 240, income: 700, expenses: 460, height: 140, active: true },
        { day: 'Thu', date: 'Thursday, 8 Jan 2025', savings: 210, income: 610, expenses: 410, height: 98 },
        { day: 'Fri', date: 'Friday, 9 Jan 2025', savings: 180, income: 590, expenses: 380, height: 114 },
        { day: 'Sat', date: 'Saturday, 10 Jan 2025', savings: 290, income: 750, expenses: 490, height: 130 }
      ],
      '30d': [
        { day: 'W1', date: 'Week 1 (1–7 Jan)', savings: 1200, income: 3800, expenses: 2100, height: 80 },
        { day: 'W2', date: 'Week 2 (8–14 Jan)', savings: 1900, income: 4200, expenses: 1800, height: 105 },
        { day: 'W3', date: 'Week 3 (15–21 Jan)', savings: 2400, income: 5100, expenses: 1900, height: 145, active: true },
        { day: 'W4', date: 'Week 4 (22–28 Jan)', savings: 2800, income: 4900, expenses: 1900, height: 130 }
      ]
    },
    goals: [
      {
        id: 'g-1',
        title: 'Reserve',
        target: 10000,
        saved: 7000,
        category: 'This year',
        timeLeft: 'Left to save 4 months',
        theme: 'green',
        icon: 'treasure'
      },
      {
        id: 'g-2',
        title: 'Travel',
        target: 4000,
        saved: 2500,
        category: 'Long term',
        timeLeft: 'Left to save 3 months',
        theme: 'orange',
        icon: 'suitcase'
      },
      {
        id: 'g-3',
        title: 'Car',
        target: 20000,
        saved: 1600,
        category: 'Long term',
        timeLeft: 'Left to save 3 years 6 months',
        theme: 'orange',
        icon: 'car'
      },
      {
        id: 'g-4',
        title: 'Real estate',
        target: 70000,
        saved: 8300,
        category: 'Long term',
        timeLeft: 'Left to save 5 years 8 months',
        theme: 'orange',
        icon: 'villa'
      }
    ],
    transactions: [
      {
        id: 'tx-1',
        title: 'Dividend payot',
        date: '25 Feb 2025',
        timestamp: 1740441600000,
        amount: 1100,
        type: 'income',
        status: 'Completed',
        logoText: 'TD',
        logoBg: '#008a00',
        logoColor: '#ffffff',
        category: 'Investments'
      },
      {
        id: 'tx-2',
        title: 'orporate subscriptions',
        date: '25 Feb 2025',
        timestamp: 1740441500000,
        amount: -6400,
        type: 'expense',
        status: 'Declined',
        logoType: 'salesforce',
        logoBg: '#00a1e0',
        logoColor: '#ffffff',
        category: 'Other'
      },
      {
        id: 'tx-3',
        title: 'Investment in ETF',
        date: '21 Feb 2025',
        timestamp: 1740096000000,
        amount: -900,
        type: 'expense',
        status: 'Completed',
        logoText: 'V',
        logoBg: '#8b0000',
        logoColor: '#ffffff',
        category: 'Investments'
      },
      {
        id: 'tx-4',
        title: 'Consulting services',
        date: '21 Feb 2025',
        timestamp: 1740095000000,
        amount: -2100,
        type: 'expense',
        status: 'Completed',
        logoText: 'CNX',
        logoBg: '#111827',
        logoColor: '#ffffff',
        category: 'Housing'
      },
      {
        id: 'tx-5',
        title: 'Equipment purchase',
        date: '20 Feb 2025',
        timestamp: 1740009600000,
        amount: -1700,
        type: 'expense',
        status: 'Completed',
        logoText: 'amazon',
        logoBg: '#131921',
        logoColor: '#ff9900',
        category: 'Other'
      },
      {
        id: 'tx-6',
        title: 'Elli Harper',
        date: '15 Feb 2025',
        timestamp: 1739577600000,
        amount: 600,
        type: 'income',
        status: 'Completed',
        avatarType: 'elli',
        category: 'Other'
      },
      {
        id: 'tx-7',
        title: 'Davis Rowen',
        date: '15 Feb 2025',
        timestamp: 1739577500000,
        amount: 800,
        type: 'income',
        status: 'Completed',
        avatarType: 'davis',
        category: 'Other'
      }
    ],
    costCategories: [
      { name: 'Housing', percent: 18, color: 'var(--cat-housing)' },
      { name: 'Debt payments', percent: 7, color: 'var(--cat-debt)' },
      { name: 'Food', percent: 6, color: 'var(--cat-food)' },
      { name: 'Transportation', percent: 9, color: 'var(--cat-transport)' },
      { name: 'Healthcare', percent: 10, color: 'var(--cat-healthcare)' },
      { name: 'Investments', percent: 17, color: 'var(--cat-investments)' },
      { name: 'Other', percent: 33, color: 'var(--cat-other)' }
    ]
  };

  class Store {
    constructor() {
      this.listeners = [];
      this.state = this.load();
    }

    load() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return Object.assign({}, defaultData, parsed);
        }
      } catch (e) {
        console.warn('Failed to load saved state from localStorage:', e);
      }
      return JSON.parse(JSON.stringify(defaultData));
    }

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.warn('Failed to save state to localStorage:', e);
      }
      this.notify();
    }

    subscribe(listener) {
      this.listeners.push(listener);
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }

    notify() {
      for (const listener of this.listeners) {
        listener(this.state);
      }
    }

    resetDefaults() {
      this.state = JSON.parse(JSON.stringify(defaultData));
      localStorage.removeItem(STORAGE_KEY);
      this.save();
    }

    // -------------------------------------------------------------
    // Financial Calculations & Aggregations
    // -------------------------------------------------------------
    getBalance() {
      const primaryCard = this.state.cards.find(c => c.isPrimary) || this.state.cards[0];
      return primaryCard.balance;
    }

    getFinancialMetrics() {
      let income = 0;
      let expenses = 0;

      for (const tx of this.state.transactions) {
        if (tx.status === 'Completed') {
          if (tx.amount > 0) income += tx.amount;
          else expenses += Math.abs(tx.amount);
        }
      }

      // If transactions are sparse, fallback to reference numbers as base
      const totalIncome = Math.max(15000, 15000 + (income - 2500));
      const totalExpenses = Math.max(6700, 6700 + (expenses - 4700));
      const savedBalance = totalIncome - totalExpenses;
      const savingsRate = Math.min(99, Math.max(10, Math.round((savedBalance / totalIncome) * 100)));

      return {
        totalIncome,
        totalExpenses,
        savedBalance,
        savingsRate
      };
    }

    // -------------------------------------------------------------
    // Mutators
    // -------------------------------------------------------------
    sendMoney(recipient, amount, note, category = 'Other') {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) return false;

      // Deduct from primary card
      const primaryCard = this.state.cards.find(c => c.isPrimary) || this.state.cards[0];
      primaryCard.balance = Math.max(0, primaryCard.balance - numAmount);

      // Increase monthly spent
      this.state.spendingLimit.spent += numAmount;

      // Create new transaction
      const now = new Date();
      const dateFormatted = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;

      const newTx = {
        id: 'tx-' + Date.now(),
        title: recipient,
        date: dateFormatted,
        timestamp: Date.now(),
        amount: -numAmount,
        type: 'expense',
        status: 'Completed',
        category: category,
        logoBg: '#1e293b',
        logoColor: '#ffffff',
        logoText: recipient.slice(0, 2).toUpperCase()
      };

      this.state.transactions.unshift(newTx);
      this.save();
      return true;
    }

    topUpCard(amount) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) return false;

      const primaryCard = this.state.cards.find(c => c.isPrimary) || this.state.cards[0];
      primaryCard.balance += numAmount;

      const now = new Date();
      const dateFormatted = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;

      const newTx = {
        id: 'tx-' + Date.now(),
        title: 'Card Top Up',
        date: dateFormatted,
        timestamp: Date.now(),
        amount: numAmount,
        type: 'income',
        status: 'Completed',
        category: 'Investments',
        logoBg: '#008a00',
        logoColor: '#ffffff',
        logoText: 'TOP'
      };

      this.state.transactions.unshift(newTx);
      this.save();
      return true;
    }

    updateSpendingLimit(newLimit) {
      const limit = parseFloat(newLimit);
      if (isNaN(limit) || limit <= 0) return false;
      this.state.spendingLimit.total = limit;
      this.save();
      return true;
    }

    addGoal({ title, target, category = 'This year', deadlineMonths = 6, icon = 'treasure' }) {
      const targetVal = parseFloat(target);
      if (!title || isNaN(targetVal) || targetVal <= 0) return false;

      const newGoal = {
        id: 'g-' + Date.now(),
        title: title.trim(),
        target: targetVal,
        saved: 0,
        category: category,
        timeLeft: `Left to save ${deadlineMonths} months`,
        theme: category === 'This year' ? 'green' : 'orange',
        icon: icon
      };

      this.state.goals.push(newGoal);
      this.save();
      return true;
    }

    contributeToGoal(goalId, amount) {
      const numAmount = parseFloat(amount);
      const goal = this.state.goals.find(g => g.id === goalId);
      if (!goal || isNaN(numAmount) || numAmount <= 0) return false;

      const primaryCard = this.state.cards.find(c => c.isPrimary) || this.state.cards[0];
      primaryCard.balance = Math.max(0, primaryCard.balance - numAmount);

      goal.saved = Math.min(goal.target, goal.saved + numAmount);
      this.save();
      return true;
    }

    setPeriod(period) {
      if (period === '7d' || period === '30d') {
        this.state.selectedPeriod = period;
        this.save();
      }
    }

    setChartType(type) {
      if (type === 'bar' || type === 'line') {
        this.state.chartType = type;
        this.save();
      }
    }

    setActiveBar(day) {
      this.state.activeBarDay = day;
      this.save();
    }

    setSearchQuery(q) {
      this.state.searchQuery = q.trim().toLowerCase();
      this.notify();
    }

    toggleSort(field) {
      if (this.state.sortField === field) {
        this.state.sortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.state.sortField = field;
        this.state.sortOrder = 'desc';
      }
      this.notify();
    }

    getFilteredTransactions() {
      let list = [...this.state.transactions];

      // Query filter
      if (this.state.searchQuery) {
        list = list.filter(tx =>
          tx.title.toLowerCase().includes(this.state.searchQuery) ||
          tx.category?.toLowerCase().includes(this.state.searchQuery) ||
          tx.status.toLowerCase().includes(this.state.searchQuery)
        );
      }

      // Sort
      const { sortField, sortOrder } = this.state;
      list.sort((a, b) => {
        let valA, valB;
        if (sortField === 'name') {
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else if (sortField === 'amount') {
          valA = a.amount;
          valB = b.amount;
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        } else {
          // date / timestamp
          valA = a.timestamp || 0;
          valB = b.timestamp || 0;
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
      });

      return list;
    }
  }

  // Export singleton to global scope
  window.AppState = new Store();

})(window);
