# hAI.CryptoRiskalyzer

> **highfishAI CryptoRiskalyzer** – Professionelles AI-gestütztes Tool zur Risikoanalyse von Krypto-Tokens 🛡️

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?logo=github)](https://jbkunama1.github.io/hAI.CryptoRiskalyzer/)
[![Deploy to GitHub Pages](https://github.com/jbkunama1/hAI.CryptoRiskalyzer/actions/workflows/pages-deploy.yml/badge.svg)](https://github.com/jbkunama1/hAI.CryptoRiskalyzer/actions/workflows/pages-deploy.yml)
[![Daily Market Data Update](https://github.com/jbkunama1/hAI.CryptoRiskalyzer/actions/workflows/daily-data-update.yml/badge.svg)](https://github.com/jbkunama1/hAI.CryptoRiskalyzer/actions/workflows/daily-data-update.yml)
[![GitHub Stars](https://img.shields.io/github/stars/jbkunama1/hAI.CryptoRiskalyzer?style=social)](https://github.com/jbkunama1/hAI.CryptoRiskalyzer/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/jbkunama1/hAI.CryptoRiskalyzer?style=social)](https://github.com/jbkunama1/hAI.CryptoRiskalyzer/network/members)
[![Last Commit](https://img.shields.io/github/last-commit/jbkunama1/hAI.CryptoRiskalyzer)](https://github.com/jbkunama1/hAI.CryptoRiskalyzer/commits/main)
[![License](https://img.shields.io/github/license/jbkunama1/hAI.CryptoRiskalyzer)](LICENSE)

---

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/jbkunama1)

---

## ✨ Features

| Feature | Beschreibung |
|---|---|
| ⚡ **Instant Risiko-Score (0–100)** | Klare Gesamtbewertung auf Basis von 6 AI-Kategorien |
| 📋 **Smart Contract Prüfung** | Erkennt unverifizierte Code-Bases, Proxy-Muster, Mint-/SelfDestruct-Funktionen |
| 💧 **Liquiditäts-Check** | Warnt vor Unlocked Liquidity (Rug Pull Gefahr), analysiert LP-Token-Locks |
| 👛 **Wallet-Verteilung** | Identifiziert gefährliche Token-Konzentration bei einzelnen Wallets |
| 🍯 **Honeypot-Detektor** | Simuliert Kauf/Verkauf-Transaktionen, um blockierte Sells zu erkennen |
| 🔑 **Ownership-Analyse** | Prüft Owner-Rechte, Blacklist-Funktionen und Mint-Privilegien |
| 📊 **Trading-Pattern** | Erkennt Wash-Trading, Bot-Aktivität, Pump & Dump und MEV-Angriffe |

## 🌐 Multi-Chain Support

- **Ethereum** (ETH)
- **BNB Smart Chain** (BSC)
- **Polygon** (MATIC)
- **Base**
- **Solana**

## 🎨 UI / Design

- Dark-Theme mit professionellem Glassmorphismus-Design
- Farbkodierung: 🔴 Rot (Gefahr ≥65), 🟡 Gelb (Warnung 30–64), 🟢 Grün (Sicher <30)
- Animierter Ring-Score mit Counter-Animation
- Echtzeit-Simulation mit schrittweiser Analyse-Anzeige
- Vollständig responsiv (Mobile-First)

## 🚀 Lokale Nutzung

Da es sich um eine reine Frontend-Anwendung handelt, reicht es, `index.html` im Browser zu öffnen:

```bash
# Option 1: Direkt öffnen
open index.html

# Option 2: Mit lokalem Server (empfohlen)
npx serve .
# oder
python3 -m http.server 8080
```

Dann im Browser: `http://localhost:8080`

## 📁 Projektstruktur

```
hAI.CryptoRiskalyzer/
├── index.html          # Haupt-HTML-Datei (Single Page App)
├── css/
│   └── style.css       # Dark-Theme Styles
├── js/
│   ├── analyzer.js     # Risikoanalyse-Engine (6 Kategorien)
│   ├── app.js          # UI-Controller & Event-Handling
│   └── market.js       # Marktdaten-Banner (Fear & Greed, Trending)
├── data/
│   └── market-data.json  # Täglich aktualisierte Marktdaten (GitHub Actions)
├── .github/
│   └── workflows/
│       ├── daily-data-update.yml  # Täglicher Marktdaten-Fetch (06:00 UTC)
│       └── pages-deploy.yml       # GitHub Pages Deployment bei Push auf main
├── LICENSE
└── README.md
```

## 🤖 GitHub Actions Automatisierung

| Workflow | Trigger | Beschreibung |
|---|---|---|
| **Daily Market Data Update** | Täglich 06:00 UTC (+ manuell) | Holt Fear & Greed Index, Trending Coins, Top 10 Market Caps von kostenlosen APIs und committed `data/market-data.json` |
| **Deploy to GitHub Pages** | Push auf `main` + nach Data Update | Deployed die aktuellste Version automatisch auf GitHub Pages |

Die Seite zeigt oben immer den **Fear & Greed Index** und die **Trending Coins** des Tages – diese werden täglich automatisch aktualisiert.

## ⚠️ Haftungsausschluss

Diese Analyse dient **nur zu Informationszwecken** und stellt **keine Anlageberatung** dar.
Krypto-Investitionen sind hochriskant. Investiere nur, was du verlieren kannst.

---

*Gebaut mit ❤️ für die Crypto-Community · hAI.CryptoRiskalyzer © 2026*

