/**
 * hAI.CryptoRiskalyzer – Market Data Loader
 * Fetches data/market-data.json (updated daily by GitHub Actions)
 * and renders the market banner.
 */

'use strict';

(function () {

  const FEAR_GREED_LABELS = {
    'Extreme Fear':  { emoji: '😱', cls: 'fg-extreme-fear'  },
    'Fear':          { emoji: '😨', cls: 'fg-fear'           },
    'Neutral':       { emoji: '😐', cls: 'fg-neutral'        },
    'Greed':         { emoji: '😏', cls: 'fg-greed'          },
    'Extreme Greed': { emoji: '🤑', cls: 'fg-extreme-greed'  },
  };

  function formatUpdated(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('de-DE', {
        day:   '2-digit',
        month: '2-digit',
        year:  'numeric',
        hour:  '2-digit',
        minute:'2-digit',
        timeZone: 'UTC',
      }) + ' UTC';
    } catch (_) {
      return isoString;
    }
  }

  function renderBanner(data) {
    const banner  = document.getElementById('market-banner');
    const fgBadge = document.getElementById('fg-badge');
    const trending= document.getElementById('trending-coins');
    const updated = document.getElementById('market-updated');

    if (!banner) return;

    // Fear & Greed
    if (data.fear_greed && fgBadge) {
      const val   = data.fear_greed.value;
      const label = data.fear_greed.classification;
      const meta  = FEAR_GREED_LABELS[label] || { emoji: '📊', cls: 'fg-neutral' };
      fgBadge.textContent = `${meta.emoji} ${val} ${label}`;
      fgBadge.className   = `fear-greed-badge ${meta.cls}`;
    }

    // Trending coins (show up to 5 symbols)
    if (data.trending && data.trending.length && trending) {
      trending.textContent = data.trending
        .slice(0, 5)
        .map(c => c.symbol)
        .join(' · ');
    } else if (trending) {
      trending.textContent = '–';
    }

    // Last updated
    if (updated) {
      updated.textContent = data.last_updated ? formatUpdated(data.last_updated) : '–';
    }

    banner.style.display = '';
  }

  function loadMarketData() {
    // Use cache-busting query param so the daily fresh JSON is always fetched
    const url = 'data/market-data.json?_=' + Math.floor(Date.now() / 3600000); // refreshes every hour so users get the daily update within 1 h
    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(renderBanner)
      .catch(function () {
        // Silently hide the banner if data is unavailable
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMarketData);
  } else {
    loadMarketData();
  }

})();
