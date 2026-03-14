/**
 * hAI.CryptoRiskalyzer - Main App Controller
 * Handles UI interactions, animations, and rendering results.
 */

'use strict';

(function () {

  // ── Chain Definitions ────────────────────────────────────────────────────

  const CHAINS = [
    { id: 'ethereum',  label: 'Ethereum',  short: 'ETH',  icon: '⟠', color: '#627EEA', placeholder: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    { id: 'bsc',       label: 'BSC',       short: 'BNB',  icon: '⬡', color: '#F3BA2F', placeholder: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82' },
    { id: 'polygon',   label: 'Polygon',   short: 'MATIC',icon: '⬡', color: '#8247E5', placeholder: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619' },
    { id: 'base',      label: 'Base',      short: 'BASE', icon: '🔵', color: '#0052FF', placeholder: '0x4200000000000000000000000000000000000006' },
    { id: 'solana',    label: 'Solana',    short: 'SOL',  icon: '◎', color: '#9945FF', placeholder: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }
  ];

  const LOADING_STEPS = [
    { id: 'step-contract',  label: 'Smart Contract wird geprüft...' },
    { id: 'step-liquidity', label: 'Liquidität wird analysiert...' },
    { id: 'step-wallets',   label: 'Wallet-Verteilung wird geprüft...' },
    { id: 'step-honeypot',  label: 'Honeypot-Simulation läuft...' },
    { id: 'step-ownership', label: 'Ownership wird analysiert...' },
    { id: 'step-trading',   label: 'Trading-Patterns werden untersucht...' }
  ];

  // ── State ────────────────────────────────────────────────────────────────

  let selectedChain = CHAINS[0];
  let isAnalyzing = false;

  // ── DOM References ───────────────────────────────────────────────────────

  const $ = id => document.getElementById(id);
  const chainSelector     = $('chain-selector');
  const addressInput      = $('address-input');
  const inputError        = $('input-error');
  const analyzeBtn        = $('analyze-btn');
  const loadingPanel      = $('loading-panel');
  const loadingStepsList  = $('loading-steps');
  const resultsSection    = $('results-section');
  const toastContainer    = $('toast-container');

  // ── Initialization ───────────────────────────────────────────────────────

  function init() {
    renderChainSelector();
    bindEvents();
    // Check URL params for pre-filled address/chain
    const params = new URLSearchParams(window.location.search);
    if (params.get('address')) {
      addressInput.value = params.get('address');
    }
    if (params.get('chain')) {
      const chain = CHAINS.find(c => c.id === params.get('chain'));
      if (chain) selectChain(chain);
    }
  }

  // ── Chain Selector ───────────────────────────────────────────────────────

  function renderChainSelector() {
    chainSelector.innerHTML = CHAINS.map(chain => `
      <button
        class="chain-btn${chain.id === selectedChain.id ? ' active' : ''}"
        data-chain="${chain.id}"
        title="${chain.label}"
        aria-pressed="${chain.id === selectedChain.id}"
      >
        <span class="chain-icon" style="background:${chain.color}20; color:${chain.color}">
          ${chain.icon}
        </span>
        ${chain.label}
      </button>
    `).join('');

    chainSelector.querySelectorAll('.chain-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const chain = CHAINS.find(c => c.id === btn.dataset.chain);
        if (chain) selectChain(chain);
      });
    });
  }

  function selectChain(chain) {
    selectedChain = chain;
    chainSelector.querySelectorAll('.chain-btn').forEach(btn => {
      const isActive = btn.dataset.chain === chain.id;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
    addressInput.placeholder = chain.placeholder;
    clearError();
  }

  // ── Events ───────────────────────────────────────────────────────────────

  function bindEvents() {
    analyzeBtn.addEventListener('click', handleAnalyze);
    addressInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleAnalyze();
    });
    addressInput.addEventListener('input', () => {
      clearError();
    });

    // Example addresses
    document.querySelectorAll('.example-addr').forEach(el => {
      el.addEventListener('click', () => {
        const addr = el.dataset.address;
        const chainId = el.dataset.chain;
        const chain = CHAINS.find(c => c.id === chainId);
        if (chain) selectChain(chain);
        addressInput.value = addr;
        clearError();
        showToast(`📋 Adresse übernommen (${chain ? chain.label : ''})`);
      });
    });
  }

  // ── Analyze Flow ─────────────────────────────────────────────────────────

  function handleAnalyze() {
    if (isAnalyzing) return;

    const address = addressInput.value.trim();
    const validation = Analyzer.validateAddress(address, selectedChain.label);

    if (!validation.valid) {
      showError(validation.error);
      return;
    }

    clearError();
    runAnalysis(address, selectedChain);
  }

  async function runAnalysis(address, chain) {
    isAnalyzing = true;
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span class="btn-icon">⏳</span> Analysiere...';

    // Show loading panel, hide results
    loadingPanel.classList.add('visible');
    resultsSection.classList.remove('visible');
    resultsSection.innerHTML = '';

    // Animate loading steps
    await animateLoadingSteps();

    // Run analysis (synchronous but wrapped for async flow)
    const result = await new Promise(resolve => {
      setTimeout(() => resolve(Analyzer.analyze(address, chain.label)), 200);
    });

    // Hide loading
    loadingPanel.classList.remove('visible');

    // Render and show results
    renderResults(result, chain);
    resultsSection.classList.add('visible');

    // Animate score circle and progress bars after render
    setTimeout(() => animateResults(result), 100);

    // Scroll to results
    setTimeout(() => {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 200);

    // Reset button
    isAnalyzing = false;
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '<span class="btn-icon">🔍</span> Analysieren';

    showToast(`✅ Analyse abgeschlossen – Score: ${result.totalScore}/100`);
  }

  async function animateLoadingSteps() {
    loadingStepsList.innerHTML = LOADING_STEPS.map(step => `
      <div class="loading-step" id="${step.id}">
        <span class="step-icon">⏳</span>
        <span>${step.label}</span>
      </div>
    `).join('');

    for (let i = 0; i < LOADING_STEPS.length; i++) {
      const stepEl = $(LOADING_STEPS[i].id);
      if (stepEl) {
        // Mark previous as done
        if (i > 0) {
          const prevEl = $(LOADING_STEPS[i - 1].id);
          if (prevEl) {
            prevEl.classList.remove('active');
            prevEl.classList.add('done');
            prevEl.querySelector('.step-icon').textContent = '✓';
          }
        }
        stepEl.classList.add('active');
        stepEl.querySelector('.step-icon').textContent = '⚡';
        await sleep(320 + Math.random() * 180);
      }
    }

    // Mark last step done
    const lastEl = $(LOADING_STEPS[LOADING_STEPS.length - 1].id);
    if (lastEl) {
      lastEl.classList.remove('active');
      lastEl.classList.add('done');
      lastEl.querySelector('.step-icon').textContent = '✓';
    }

    await sleep(200);
  }

  // ── Results Rendering ─────────────────────────────────────────────────────

  function renderResults(result, chain) {
    const shortAddr = result.address.substring(0, 10) + '...' + result.address.substring(result.address.length - 8);

    resultsSection.innerHTML = `
      <!-- Overall Risk Score -->
      <div class="risk-score-card" id="risk-score-card">
        <div class="score-circle-wrapper">
          <svg class="score-circle" viewBox="0 0 120 120">
            <circle class="score-circle-bg" cx="60" cy="60" r="50"/>
            <circle class="score-circle-fill" id="score-fill" cx="60" cy="60" r="50"/>
          </svg>
          <div class="score-circle-text">
            <span class="score-number" id="score-number">0</span>
            <span class="score-label-small">/100</span>
          </div>
        </div>
        <div class="score-info">
          <div class="score-title">Risiko-Score</div>
          <div class="score-verdict ${result.level}" id="score-verdict">
            ${result.label}
          </div>
          <div class="score-meta">
            <span>🔗 ${chain.label}</span>
            <span title="${result.address}">📝 ${shortAddr}</span>
            <span>⏱️ ${new Date(result.timestamp).toLocaleTimeString('de-DE')}</span>
          </div>
        </div>
      </div>

      <!-- AI Summary -->
      <div class="ai-summary-card">
        <div class="ai-summary-header">
          <div class="ai-badge">🤖 AI-Analyse</div>
          <span style="font-size:12px; color:var(--text-muted)">powered by hAI</span>
        </div>
        <div class="ai-summary-text">${result.aiSummary}</div>
      </div>

      <!-- Analysis Grid -->
      <div class="analysis-grid">
        ${result.categories.map(cat => renderCategoryCard(cat)).join('')}
      </div>
    `;
  }

  function renderCategoryCard(cat) {
    const checksHTML = cat.checks.map(check => `
      <div class="check-item">
        <span class="check-icon ${check.type}">${check.type === 'ok' ? '✓' : check.type === 'warn' ? '⚡' : '✕'}</span>
        <span class="check-text">${check.text}</span>
      </div>
    `).join('');

    const barsHTML = (cat.bars || []).map((bar, idx) => `
      <div class="progress-bar-wrapper">
        <div class="progress-bar-label">
          <span>${bar.label}</span>
          <span>${bar.value.toFixed(1)}${bar.suffix || '%'}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill ${bar.level}" id="bar-${cat.title.replace(/\s+/g, '-')}-${idx}" style="width:0%"></div>
        </div>
      </div>
    `).join('');

    return `
      <div class="analysis-card ${cat.level}">
        <div class="card-header">
          <div class="card-title-group">
            <div class="card-icon">${cat.icon}</div>
            <div>
              <div class="card-title">${cat.title}</div>
              <div class="card-subtitle">${cat.subtitle}</div>
            </div>
          </div>
          <div class="card-score-badge">
            <span class="card-score">${cat.score}</span>
            <span class="card-score-label">/ 100</span>
          </div>
        </div>
        <div class="check-list">${checksHTML}</div>
        ${barsHTML}
        <div class="card-verdict ${cat.level}">${cat.verdict}</div>
      </div>
    `;
  }

  // ── Animations ────────────────────────────────────────────────────────────

  function animateResults(result) {
    // Animate score circle
    const scoreFill = document.getElementById('score-fill');
    const scoreNumber = document.getElementById('score-number');

    if (scoreFill && scoreNumber) {
      const circumference = 314;
      const offset = circumference - (result.totalScore / 100) * circumference;
      const color = result.level === 'danger' ? '#f44336' : result.level === 'warning' ? '#ff9800' : '#4caf50';

      scoreFill.style.stroke = color;
      scoreFill.style.strokeDashoffset = String(offset);
      scoreNumber.style.color = color;

      // Count up animation
      animateCounter(scoreNumber, 0, result.totalScore, 1000);
    }

    // Animate progress bars
    result.categories.forEach(cat => {
      (cat.bars || []).forEach((bar, idx) => {
        const barEl = document.getElementById(`bar-${cat.title.replace(/\s+/g, '-')}-${idx}`);
        if (barEl) {
          setTimeout(() => {
            barEl.style.width = Math.min(bar.value, 100) + '%';
          }, 300);
        }
      });
    });
  }

  function animateCounter(el, from, to, duration) {
    const startTime = performance.now();
    const range = to - from;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(from + range * eased);
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function showError(message) {
    addressInput.classList.add('error');
    inputError.textContent = message;
    inputError.classList.add('visible');
  }

  function clearError() {
    addressInput.classList.remove('error');
    inputError.classList.remove('visible');
    inputError.textContent = '';
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
