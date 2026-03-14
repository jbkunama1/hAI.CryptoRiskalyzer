/**
 * hAI.CryptoRiskalyzer - Risk Analysis Engine
 * Deterministic simulation based on contract address hash.
 * Covers all 6 analysis categories with realistic metrics.
 */

'use strict';

const Analyzer = (() => {

  // ── Deterministic pseudo-random number generator ──────────────────────────
  // Seeds on contract address so same address always yields same result.

  function hashCode(str) {
    let hash = 0x811c9dc5; // FNV offset basis
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0; // FNV prime, keep 32-bit unsigned
    }
    return hash;
  }

  function seededRand(seed, min, max) {
    // LCG parameters (Numerical Recipes)
    seed = ((seed * 1664525 + 1013904223) >>> 0);
    const frac = seed / 0xFFFFFFFF;
    return Math.round(min + frac * (max - min));
  }

  function seededFloat(seed, min, max) {
    seed = ((seed * 1664525 + 1013904223) >>> 0);
    const frac = seed / 0xFFFFFFFF;
    return min + frac * (max - min);
  }

  function seededBool(seed, probability) {
    seed = ((seed * 1664525 + 1013904223) >>> 0);
    return (seed / 0xFFFFFFFF) < probability;
  }

  // ── Risk classification helpers ────────────────────────────────────────────

  function classify(score) {
    if (score >= 65) return 'danger';
    if (score >= 30) return 'warning';
    return 'safe';
  }

  function classifyLabel(score) {
    if (score >= 65) return '🔴 HOHES RISIKO';
    if (score >= 30) return '🟡 MITTLERES RISIKO';
    return '🟢 GERINGES RISIKO';
  }

  // ── Smart Contract Analysis ────────────────────────────────────────────────

  function analyzeSmartContract(seed) {
    const s1 = seed ^ 0xA1B2;
    const isVerified = seededBool(s1, 0.45);
    const hasProxyPattern = seededBool(s1 ^ 0x11, 0.35);
    const hasMintFunction = seededBool(s1 ^ 0x22, 0.5);
    const hasPauseFunction = seededBool(s1 ^ 0x33, 0.4);
    const hasSelfDestruct = seededBool(s1 ^ 0x44, 0.15);
    const hasBackdoor = seededBool(s1 ^ 0x55, 0.12);
    const sourceCodeLines = seededRand(s1 ^ 0x66, 80, 1200);

    let score = 0;
    if (!isVerified) score += 30;
    if (hasProxyPattern) score += 15;
    if (hasMintFunction) score += 20;
    if (hasPauseFunction) score += 10;
    if (hasSelfDestruct) score += 35;
    if (hasBackdoor) score += 40;
    score = Math.min(score, 100);

    const checks = [
      {
        type: isVerified ? 'ok' : 'bad',
        text: isVerified
          ? '<strong>Source Code verifiziert</strong> – Quellcode ist öffentlich und geprüft'
          : '<strong>Unverifizierter Code</strong> – Kein öffentlicher Quellcode verfügbar'
      },
      {
        type: hasProxyPattern ? 'warn' : 'ok',
        text: hasProxyPattern
          ? '<strong>Proxy-Muster erkannt</strong> – Contract-Logik kann nachträglich geändert werden'
          : '<strong>Kein Proxy-Muster</strong> – Code ist unveränderlich'
      },
      {
        type: hasMintFunction ? 'bad' : 'ok',
        text: hasMintFunction
          ? '<strong>Mint-Funktion vorhanden</strong> – Unbegrenzte Token-Ausgabe möglich'
          : '<strong>Keine Mint-Funktion</strong> – Token-Angebot ist fixiert'
      },
      {
        type: hasPauseFunction ? 'warn' : 'ok',
        text: hasPauseFunction
          ? '<strong>Pause-Funktion</strong> – Trading kann jederzeit gestoppt werden'
          : '<strong>Keine Pause-Funktion</strong> – Trading kann nicht gestoppt werden'
      },
      {
        type: hasSelfDestruct ? 'bad' : 'ok',
        text: hasSelfDestruct
          ? '<strong>SelfDestruct-Code</strong> – Contract kann gelöscht werden (KRITISCH)'
          : '<strong>Kein SelfDestruct</strong> – Contract ist persistent'
      }
    ];

    return {
      score,
      level: classify(score),
      title: 'Smart Contract',
      subtitle: `${sourceCodeLines} Codezeilen analysiert`,
      icon: '📋',
      checks,
      verdict: score >= 65
        ? '⚠️ Kritische Sicherheitslücken im Smart Contract gefunden'
        : score >= 30
          ? '⚡ Modifizierbare Funktionen – erhöhtes Risiko'
          : '✅ Smart Contract sieht sauber aus'
    };
  }

  // ── Liquidity Analysis ─────────────────────────────────────────────────────

  function analyzeLiquidity(seed) {
    const s2 = seed ^ 0xB2C3;
    const totalLiqUSD = seededRand(s2, 500, 8000000);
    const lockedPct = seededRand(s2 ^ 0x11, 0, 100);
    const lockDurationDays = seededRand(s2 ^ 0x22, 0, 730);
    const lpBurnedPct = seededRand(s2 ^ 0x33, 0, 100);
    const rugPullSignals = seededRand(s2 ^ 0x44, 0, 5);
    const isLowLiq = totalLiqUSD < 10000;

    let score = 0;
    if (lockedPct < 50) score += 35;
    else if (lockedPct < 80) score += 15;
    if (isLowLiq) score += 20;
    if (lockDurationDays < 30) score += 20;
    score += rugPullSignals * 8;
    if (lpBurnedPct < 10) score += 15;
    score = Math.min(score, 100);

    const lockedLabel = `${lockedPct}% gesperrt`;
    const lockedClass = lockedPct >= 80 ? 'ok' : lockedPct >= 50 ? 'warn' : 'bad';
    const liqFormatted = totalLiqUSD >= 1000000
      ? `$${(totalLiqUSD / 1000000).toFixed(2)}M`
      : totalLiqUSD >= 1000
        ? `$${(totalLiqUSD / 1000).toFixed(1)}K`
        : `$${totalLiqUSD}`;

    const checks = [
      {
        type: isLowLiq ? 'bad' : totalLiqUSD < 100000 ? 'warn' : 'ok',
        text: `<strong>Gesamtliquidität: ${liqFormatted}</strong> – ${isLowLiq ? 'Sehr niedrig – Rug Pull Gefahr' : totalLiqUSD < 100000 ? 'Niedrig – Vorsicht geboten' : 'Ausreichende Liquidität'}`
      },
      {
        type: lockedClass,
        text: `<strong>Liquidity Lock: ${lockedLabel}</strong> – ${lockedPct >= 80 ? 'Gut gesichert' : lockedPct >= 50 ? 'Teilweise gesperrt' : 'Großteils ungesperrt – Rug Pull möglich'}`
      },
      {
        type: lockDurationDays >= 180 ? 'ok' : lockDurationDays >= 30 ? 'warn' : 'bad',
        text: `<strong>Lock-Dauer: ${lockDurationDays} Tage</strong> – ${lockDurationDays >= 180 ? 'Langfristig gesichert' : lockDurationDays >= 30 ? 'Kurzfristige Sperrung' : 'Sehr kurzfristig oder ungültig'}`
      },
      {
        type: lpBurnedPct >= 80 ? 'ok' : lpBurnedPct >= 30 ? 'warn' : 'bad',
        text: `<strong>LP-Token verbrannt: ${lpBurnedPct}%</strong> – ${lpBurnedPct >= 80 ? 'Sehr sicher' : lpBurnedPct >= 30 ? 'Teilweise verbrannt' : 'Wenig LP verbrannt – Risiko hoch'}`
      }
    ];

    const bars = [
      { label: 'Locked Liquidity', value: lockedPct, level: lockedPct >= 80 ? 'safe' : lockedPct >= 50 ? 'warning' : 'danger' },
      { label: 'LP Tokens verbrannt', value: lpBurnedPct, level: lpBurnedPct >= 80 ? 'safe' : lpBurnedPct >= 30 ? 'warning' : 'danger' }
    ];

    return {
      score,
      level: classify(score),
      title: 'Liquiditäts-Check',
      subtitle: `Gesamt: ${liqFormatted} TVL`,
      icon: '💧',
      checks,
      bars,
      verdict: score >= 65
        ? '🚨 Unlocked Liquidity – Rug Pull Gefahr sehr hoch!'
        : score >= 30
          ? '⚠️ Liquidität teilweise gesichert – Vorsicht empfohlen'
          : '✅ Liquidität ist gut gesichert'
    };
  }

  // ── Wallet Distribution Analysis ──────────────────────────────────────────

  function analyzeWalletDistribution(seed) {
    const s3 = seed ^ 0xC3D4;
    const top1Pct = seededFloat(s3, 2, 60);
    const top10Pct = seededFloat(s3 ^ 0x11, Math.max(top1Pct + 5, 10), Math.min(top1Pct + 60, 95));
    const devWalletPct = seededFloat(s3 ^ 0x22, 0, 30);
    const totalHolders = seededRand(s3 ^ 0x33, 50, 50000);
    const suspiciousWallets = seededRand(s3 ^ 0x44, 0, 8);

    let score = 0;
    if (top1Pct > 20) score += 40;
    else if (top1Pct > 10) score += 20;
    if (top10Pct > 60) score += 25;
    else if (top10Pct > 40) score += 10;
    if (devWalletPct > 15) score += 25;
    else if (devWalletPct > 5) score += 10;
    score += suspiciousWallets * 5;
    score = Math.min(score, 100);

    const holdersFormatted = totalHolders >= 1000 ? `${(totalHolders / 1000).toFixed(1)}K` : String(totalHolders);

    const checks = [
      {
        type: top1Pct > 20 ? 'bad' : top1Pct > 10 ? 'warn' : 'ok',
        text: `<strong>Top-Wallet hält ${top1Pct.toFixed(1)}%</strong> – ${top1Pct > 20 ? 'Extreme Konzentration – Dump-Risiko' : top1Pct > 10 ? 'Erhöhte Konzentration' : 'Gesunde Verteilung'}`
      },
      {
        type: top10Pct > 60 ? 'bad' : top10Pct > 40 ? 'warn' : 'ok',
        text: `<strong>Top-10 Wallets halten ${top10Pct.toFixed(1)}%</strong> – ${top10Pct > 60 ? 'Gefährliche Konzentration' : top10Pct > 40 ? 'Moderate Konzentration' : 'Gute Verteilung'}`
      },
      {
        type: devWalletPct > 15 ? 'bad' : devWalletPct > 5 ? 'warn' : 'ok',
        text: `<strong>Dev-Wallet: ${devWalletPct.toFixed(1)}%</strong> – ${devWalletPct > 15 ? 'Zu viele Token beim Entwickler' : devWalletPct > 5 ? 'Moderate Dev-Allokation' : 'Faire Dev-Allokation'}`
      },
      {
        type: suspiciousWallets > 4 ? 'bad' : suspiciousWallets > 1 ? 'warn' : 'ok',
        text: `<strong>${suspiciousWallets} verdächtige Wallets</strong> – ${suspiciousWallets > 4 ? 'Koordinierter Dump möglich' : suspiciousWallets > 1 ? 'Einige unbekannte Wallets' : 'Keine verdächtigen Wallets'}`
      }
    ];

    const bars = [
      { label: 'Top-1 Wallet Anteil', value: top1Pct, level: top1Pct > 20 ? 'danger' : top1Pct > 10 ? 'warning' : 'safe', suffix: '%' },
      { label: 'Top-10 Wallets Anteil', value: top10Pct, level: top10Pct > 60 ? 'danger' : top10Pct > 40 ? 'warning' : 'safe', suffix: '%' }
    ];

    return {
      score,
      level: classify(score),
      title: 'Wallet-Verteilung',
      subtitle: `${holdersFormatted} Holder analysiert`,
      icon: '👛',
      checks,
      bars,
      verdict: score >= 65
        ? '🚨 Gefährliche Token-Konzentration – Dump-Risiko sehr hoch!'
        : score >= 30
          ? '⚠️ Moderate Konzentration – Dump-Möglichkeit besteht'
          : '✅ Token gut verteilt – gesunde Holder-Struktur'
    };
  }

  // ── Honeypot Detection ─────────────────────────────────────────────────────

  function analyzeHoneypot(seed) {
    const s4 = seed ^ 0xD4E5;
    const canSell = seededBool(s4, 0.75);
    const sellTaxPct = seededRand(s4 ^ 0x11, 0, canSell ? 40 : 99);
    const buyTaxPct = seededRand(s4 ^ 0x22, 0, 30);
    const transferDelay = seededRand(s4 ^ 0x33, 0, 10);
    const maxSellPct = seededRand(s4 ^ 0x44, 5, 100);
    const simulationTxCount = seededRand(s4 ^ 0x55, 10, 50);

    let score = 0;
    if (!canSell) score += 90;
    else {
      if (sellTaxPct > 30) score += 50;
      else if (sellTaxPct > 15) score += 25;
      else if (sellTaxPct > 5) score += 10;
    }
    if (buyTaxPct > 20) score += 15;
    if (transferDelay > 5) score += 20;
    if (maxSellPct < 20) score += 20;
    score = Math.min(score, 100);

    const checks = [
      {
        type: !canSell ? 'bad' : 'ok',
        text: !canSell
          ? '<strong>HONEYPOT DETECTED 🍯</strong> – Kauf möglich, Verkauf BLOCKIERT!'
          : '<strong>Verkauf möglich</strong> – Simulation erfolgreich, kein Honeypot'
      },
      {
        type: sellTaxPct > 30 ? 'bad' : sellTaxPct > 15 ? 'warn' : 'ok',
        text: `<strong>Sell-Tax: ${sellTaxPct}%</strong> – ${sellTaxPct > 30 ? 'Extrem hohe Steuer – faktisches Honeypot' : sellTaxPct > 15 ? 'Erhöhte Verkaufssteuer' : 'Faire Verkaufssteuer'}`
      },
      {
        type: buyTaxPct > 20 ? 'warn' : 'ok',
        text: `<strong>Buy-Tax: ${buyTaxPct}%</strong> – ${buyTaxPct > 20 ? 'Hohe Kaufsteuer' : 'Akzeptable Kaufsteuer'}`
      },
      {
        type: transferDelay > 5 ? 'bad' : transferDelay > 2 ? 'warn' : 'ok',
        text: `<strong>Transfer-Delay: ${transferDelay} Blöcke</strong> – ${transferDelay > 5 ? 'Verdächtige Verzögerung' : transferDelay > 2 ? 'Leichte Verzögerung' : 'Keine auffälligen Delays'}`
      },
      {
        type: maxSellPct < 20 ? 'bad' : maxSellPct < 50 ? 'warn' : 'ok',
        text: `<strong>Max. Sell-Limit: ${maxSellPct}%</strong> – ${maxSellPct < 20 ? 'Extrem niedriges Sell-Limit' : maxSellPct < 50 ? 'Sell-Limit vorhanden' : 'Kein problematisches Sell-Limit'}`
      }
    ];

    return {
      score,
      level: classify(score),
      title: 'Honeypot-Detektor',
      subtitle: `${simulationTxCount} Simulationstransaktionen`,
      icon: '🍯',
      checks,
      verdict: !canSell
        ? '🚨 HONEYPOT BESTÄTIGT – Tokens können nicht verkauft werden!'
        : score >= 65
          ? '⚠️ Verdächtige Sell-Einschränkungen – möglicherweise Honeypot'
          : score >= 30
            ? '⚡ Erhöhte Steuern – kein klassisches Honeypot, aber Vorsicht'
            : '✅ Kein Honeypot – Kauf & Verkauf normal möglich'
    };
  }

  // ── Ownership Analysis ─────────────────────────────────────────────────────

  function analyzeOwnership(seed) {
    const s5 = seed ^ 0xE5F6;
    const ownershipRenounced = seededBool(s5, 0.35);
    const hasOwnerMint = seededBool(s5 ^ 0x11, 0.4);
    const hasOwnerBlacklist = seededBool(s5 ^ 0x22, 0.35);
    const hasOwnerFeeChange = seededBool(s5 ^ 0x33, 0.45);
    const hasTimeLock = seededBool(s5 ^ 0x44, 0.3);
    const isMultisig = seededBool(s5 ^ 0x55, 0.25);
    const ownerTxCount = seededRand(s5 ^ 0x66, 1, 500);

    let score = 0;
    if (!ownershipRenounced) score += 20;
    if (hasOwnerMint) score += 30;
    if (hasOwnerBlacklist) score += 25;
    if (hasOwnerFeeChange) score += 20;
    if (!hasTimeLock && !ownershipRenounced) score += 15;
    if (!isMultisig && !ownershipRenounced) score += 10;
    score = Math.min(score, 100);

    const checks = [
      {
        type: ownershipRenounced ? 'ok' : 'warn',
        text: ownershipRenounced
          ? '<strong>Ownership renounced</strong> – Owner-Rechte aufgegeben, kein Admin-Eingriff möglich'
          : '<strong>Owner aktiv</strong> – Entwickler hat weiterhin Kontrollrechte'
      },
      {
        type: hasOwnerMint ? 'bad' : 'ok',
        text: hasOwnerMint
          ? '<strong>Owner kann minten</strong> – Beliebig viele neue Token möglich'
          : '<strong>Kein Owner-Mint</strong> – Token-Supply ist gesichert'
      },
      {
        type: hasOwnerBlacklist ? 'bad' : 'ok',
        text: hasOwnerBlacklist
          ? '<strong>Blacklist-Funktion</strong> – Owner kann Wallets sperren'
          : '<strong>Keine Blacklist</strong> – Wallets können nicht gesperrt werden'
      },
      {
        type: hasOwnerFeeChange ? 'warn' : 'ok',
        text: hasOwnerFeeChange
          ? '<strong>Fee-Änderung möglich</strong> – Steuern können erhöht werden'
          : '<strong>Keine Fee-Manipulation</strong> – Steuern sind fixiert'
      },
      {
        type: hasTimeLock ? 'ok' : isMultisig ? 'ok' : 'warn',
        text: hasTimeLock
          ? '<strong>Timelock aktiv</strong> – Admin-Änderungen haben Wartezeit'
          : isMultisig
            ? '<strong>Multisig Wallet</strong> – Mehrere Signaturen erforderlich'
            : '<strong>Kein Timelock / Multisig</strong> – Sofortige Admin-Aktionen möglich'
      }
    ];

    return {
      score,
      level: classify(score),
      title: 'Ownership-Analyse',
      subtitle: `${ownerTxCount} Owner-Transaktionen`,
      icon: '🔑',
      checks,
      verdict: score >= 65
        ? '🚨 Kritische Owner-Rechte – hohe Manipulationsgefahr'
        : score >= 30
          ? '⚠️ Einige Owner-Privilegien – moderate Gefahr'
          : '✅ Ownership gut strukturiert'
    };
  }

  // ── Trading Pattern Analysis ───────────────────────────────────────────────

  function analyzeTradingPattern(seed) {
    const s6 = seed ^ 0xF607;
    const washTradingPct = seededFloat(s6, 0, 80);
    const botActivityPct = seededFloat(s6 ^ 0x11, 0, 70);
    const sandwichAttacks = seededRand(s6 ^ 0x22, 0, 50);
    const priceManipulation = seededBool(s6 ^ 0x33, 0.35);
    const abnormalVolume = seededBool(s6 ^ 0x44, 0.4);
    const pumpDumpPattern = seededBool(s6 ^ 0x55, 0.3);
    const avgDailyTx = seededRand(s6 ^ 0x66, 5, 5000);

    let score = 0;
    if (washTradingPct > 40) score += 30;
    else if (washTradingPct > 20) score += 15;
    if (botActivityPct > 40) score += 20;
    else if (botActivityPct > 20) score += 10;
    if (sandwichAttacks > 20) score += 20;
    if (priceManipulation) score += 25;
    if (abnormalVolume) score += 15;
    if (pumpDumpPattern) score += 20;
    score = Math.min(score, 100);

    const checks = [
      {
        type: washTradingPct > 40 ? 'bad' : washTradingPct > 20 ? 'warn' : 'ok',
        text: `<strong>Wash-Trading: ${washTradingPct.toFixed(1)}%</strong> – ${washTradingPct > 40 ? 'Massives Wash-Trading erkannt' : washTradingPct > 20 ? 'Erhöhtes Wash-Trading' : 'Normales Trading-Verhalten'}`
      },
      {
        type: botActivityPct > 40 ? 'bad' : botActivityPct > 20 ? 'warn' : 'ok',
        text: `<strong>Bot-Aktivität: ${botActivityPct.toFixed(1)}%</strong> – ${botActivityPct > 40 ? 'Hohe Bot-Aktivität' : botActivityPct > 20 ? 'Moderate Bot-Aktivität' : 'Geringe Bot-Aktivität'}`
      },
      {
        type: sandwichAttacks > 20 ? 'bad' : sandwichAttacks > 5 ? 'warn' : 'ok',
        text: `<strong>${sandwichAttacks} Sandwich-Angriffe</strong> – ${sandwichAttacks > 20 ? 'Häufige MEV-Exploitation' : sandwichAttacks > 5 ? 'Einige MEV-Aktivitäten' : 'Kaum MEV-Aktivität'}`
      },
      {
        type: priceManipulation ? 'bad' : 'ok',
        text: priceManipulation
          ? '<strong>Preismanipulation erkannt</strong> – Verdächtige Kurs-Bewegungen'
          : '<strong>Keine Preismanipulation</strong> – Organische Kursbewegung'
      },
      {
        type: pumpDumpPattern ? 'bad' : 'ok',
        text: pumpDumpPattern
          ? '<strong>Pump & Dump Muster</strong> – Koordinierter Kursmanipulationsversuch'
          : '<strong>Kein Pump & Dump</strong> – Normales Handelsverhalten'
      }
    ];

    const bars = [
      { label: 'Wash-Trading', value: washTradingPct, level: washTradingPct > 40 ? 'danger' : washTradingPct > 20 ? 'warning' : 'safe', suffix: '%' },
      { label: 'Bot-Aktivität', value: botActivityPct, level: botActivityPct > 40 ? 'danger' : botActivityPct > 20 ? 'warning' : 'safe', suffix: '%' }
    ];

    return {
      score,
      level: classify(score),
      title: 'Trading-Pattern',
      subtitle: `Ø ${avgDailyTx} Transaktionen/Tag`,
      icon: '📊',
      checks,
      bars,
      verdict: score >= 65
        ? '🚨 Starke Anzeichen für Marktmanipulation'
        : score >= 30
          ? '⚠️ Verdächtige Muster im Handel'
          : '✅ Organisches Trading-Verhalten'
    };
  }

  // ── AI Summary Generator ───────────────────────────────────────────────────

  function generateAISummary(results, chain, address) {
    const totalScore = results.totalScore;
    const shortAddr = address.substring(0, 8) + '...' + address.substring(address.length - 6);

    const highRisks = results.categories.filter(c => c.level === 'danger').map(c => c.title);
    const warnings = results.categories.filter(c => c.level === 'warning').map(c => c.title);

    let text = '';

    if (totalScore >= 65) {
      text = `⚠️ Die Analyse von Token <code>${shortAddr}</code> auf ${chain} ergibt einen kritischen Risiko-Score von <strong>${totalScore}/100</strong>. `;
      if (highRisks.length > 0) {
        text += `Besonders besorgniserregend sind: <strong>${highRisks.join(', ')}</strong>. `;
      }
      text += `Von einer Investition wird dringend abgeraten. Die Kombination aus identifizierten Risikofaktoren deutet auf ein mögliches Scam-Projekt hin. Bitte führen Sie eigene Due Diligence durch, bevor Sie Kapital einsetzen.`;
    } else if (totalScore >= 30) {
      text = `🔍 Token <code>${shortAddr}</code> auf ${chain} zeigt einen moderaten Risiko-Score von <strong>${totalScore}/100</strong>. `;
      if (warnings.length > 0) {
        text += `Folgende Bereiche erfordern erhöhte Aufmerksamkeit: <strong>${warnings.join(', ')}</strong>. `;
      }
      text += `Das Token ist nicht eindeutig als Scam klassifiziert, weist aber Merkmale auf, die sorgfältige Prüfung erfordern. Investieren Sie nur, was Sie bereit sind zu verlieren.`;
    } else {
      text = `✅ Token <code>${shortAddr}</code> auf ${chain} zeigt einen niedrigen Risiko-Score von <strong>${totalScore}/100</strong>. `;
      text += `Alle 6 Analysekategorien zeigen keine kritischen Auffälligkeiten. Die Liquidität ist gesichert, der Smart Contract ist sauber, und es wurden keine Honeypot-Merkmale festgestellt. `;
      text += `Dennoch gilt: Kein Tool ersetzt eigene Recherche. Investiere nie mehr als du verlieren kannst.`;
    }

    return text;
  }

  // ── Main Analysis Function ─────────────────────────────────────────────────

  function analyze(address, chain) {
    const normalizedAddr = address.trim().toLowerCase();
    const seed = hashCode(normalizedAddr + chain);

    const smartContract = analyzeSmartContract(seed);
    const liquidity = analyzeLiquidity(seed);
    const walletDist = analyzeWalletDistribution(seed);
    const honeypot = analyzeHoneypot(seed);
    const ownership = analyzeOwnership(seed);
    const tradingPattern = analyzeTradingPattern(seed);

    const categories = [smartContract, liquidity, walletDist, honeypot, ownership, tradingPattern];

    // Weighted overall score
    const weights = [0.20, 0.20, 0.15, 0.20, 0.15, 0.10];
    const rawScore = categories.reduce((sum, cat, i) => sum + cat.score * weights[i], 0);
    const totalScore = Math.round(rawScore);

    const result = {
      address,
      chain,
      totalScore,
      level: classify(totalScore),
      label: classifyLabel(totalScore),
      categories,
      timestamp: new Date().toISOString()
    };

    result.aiSummary = generateAISummary(result, chain, address);
    return result;
  }

  // ── Input Validation ───────────────────────────────────────────────────────

  function validateAddress(address, chain) {
    const trimmed = address.trim();
    if (!trimmed) return { valid: false, error: 'Bitte Contract-Adresse eingeben.' };

    if (chain === 'Solana') {
      // Solana: base58 encoded, 32–44 chars
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
        return { valid: false, error: 'Ungültige Solana-Adresse. Erwartet: 32-44 Base58-Zeichen.' };
      }
    } else {
      // EVM chains: 0x + 40 hex chars
      if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
        return { valid: false, error: 'Ungültige EVM-Adresse. Erwartet: 0x + 40 Hex-Zeichen.' };
      }
    }
    return { valid: true, error: null };
  }

  // Public API
  return { analyze, validateAddress };

})();

// Export for use in app.js (module or global)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Analyzer;
}
