// The first-party preference is independent for each site.
const preferenceKey = 'gd-analytics-consent';
const containerId = 'GTM-NHX2QRJ2';
let preference;
try {
  preference = localStorage.getItem(preferenceKey);
} catch {
  // A browser that blocks storage can still make a choice for this visit.
}

window.dataLayer = window.dataLayer || [];
function googleConsent() {
  window.dataLayer.push(arguments);
}

googleConsent('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
});

let analyticsLoaded = false;
function startAnalytics() {
  googleConsent('consent', 'update', { analytics_storage: 'granted' });
  if (analyticsLoaded) return;

  analyticsLoaded = true;
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const loader = document.createElement('script');
  loader.async = true;
  loader.src = 'https://www.googletagmanager.com/gtm.js?id=' + containerId;
  document.head.append(loader);
}

const settings = document.createElement('aside');
settings.className = 'gd-analytics-settings';
settings.setAttribute('aria-label', 'Analitik çerez tercihleri');
settings.innerHTML = `
  <button type="button" class="gd-analytics-toggle" aria-expanded="false" aria-controls="gd-analytics-panel">Çerez tercihleri</button>
  <div id="gd-analytics-panel" hidden>
    <p><strong>Analitik çerezler</strong></p>
    <p>İzin verirseniz Google Analytics, sayfa görüntülemeleri ve bağlantı tıklamaları gibi site kullanımını ölçer. Tercihinizi buradan değiştirebilirsiniz.</p>
    <div class="gd-analytics-actions">
      <button type="button" data-choice="denied">Reddet</button>
      <button type="button" data-choice="granted">İzin ver</button>
    </div>
  </div>
`;
document.body.append(settings);

const toggle = settings.querySelector('button');
const panel = settings.querySelector('#gd-analytics-panel');
function showPanel(show) {
  panel.hidden = !show;
  toggle.setAttribute('aria-expanded', String(show));
}
toggle.addEventListener('click', () => showPanel(panel.hidden));
settings.querySelectorAll('[data-choice]').forEach(button => {
  button.addEventListener('click', () => {
    const choice = button.dataset.choice;
    try {
      localStorage.setItem(preferenceKey, choice);
    } catch {
      // Current-page consent still applies without persistence.
    }

    if (choice === 'granted') {
      startAnalytics();
    } else {
      googleConsent('consent', 'update', { analytics_storage: 'denied' });
      if (analyticsLoaded) {
        // Further requests stop when this page's Google scripts are unloaded.
        try {
          if (localStorage.getItem(preferenceKey) === 'denied') location.reload();
        } catch {
          // Consent remains denied for the current page.
        }
      }
    }
    showPanel(false);
    toggle.focus();
  });
});

showPanel(preference !== 'granted' && preference !== 'denied');
if (preference === 'granted') startAnalytics();
