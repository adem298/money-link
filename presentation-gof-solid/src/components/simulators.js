import { escapeHtml } from '../utils/javaHighlighter.js';

function nowStamp() {
  const d = new Date();
  return d.toTimeString().split(' ')[0];
}

export function createSimulatorHtml(type, state) {
  switch (type) {
    case 'singleton': {
      const logs = state.singletonLogs
        .map((l) => `<div class="log-line"><span class="ts">[${l.ts}]</span>${l.html}</div>`)
        .join('');
      return `
        <div class="sim-pane">
          <div class="sim-expr">DatabaseConnection ref = DatabaseConnection.getInstance();</div>
          <div class="sim-controls">
            <button class="sim-btn" data-sim-action="singleton-call" data-thread="main">
              ▶ Appel depuis Thread-main
            </button>
            <button class="sim-btn" data-sim-action="singleton-call" data-thread="worker-1">
              ▶ Appel depuis Worker-1
            </button>
            <button class="sim-btn secondary" data-sim-action="singleton-reset">
              ↺ Réinitialiser JVM
            </button>
          </div>
          <div class="sim-console">${logs}</div>
        </div>
      `;
    }

    case 'factory': {
      const logs = state.factoryLogs
        .map((l) => `<div class="log-line"><span class="ts">[${l.ts}]</span>${l.html}</div>`)
        .join('');
      return `
        <div class="sim-pane">
          <div class="sim-expr">Notification n = NotificationFactory.create("${escapeHtml(state.factoryChannel)}"); n.notifyUser("Cours GoF");</div>
          <div class="sim-controls">
            <button class="sim-btn ${state.factoryChannel === 'EMAIL' ? 'active-toggle' : ''}" data-sim-action="factory-create" data-channel="EMAIL">
              ▶ create("EMAIL")
            </button>
            <button class="sim-btn ${state.factoryChannel === 'SMS' ? 'active-toggle' : ''}" data-sim-action="factory-create" data-channel="SMS">
              ▶ create("SMS")
            </button>
            <button class="sim-btn ${state.factoryChannel === 'PUSH' ? 'active-toggle' : ''}" data-sim-action="factory-create" data-channel="PUSH">
              ▶ create("PUSH")
            </button>
          </div>
          <div class="sim-console">${logs}</div>
        </div>
      `;
    }

    case 'strategy': {
      const logs = state.strategyLogs
        .map((l) => `<div class="log-line"><span class="ts">[${l.ts}]</span>${l.html}</div>`)
        .join('');
      return `
        <div class="sim-pane">
          <div class="sim-expr">cart.setStrategy(new ${escapeHtml(state.strategyName)}()); cart.checkout(150.0);</div>
          <div class="sim-controls">
            <button class="sim-btn ${state.strategyName === 'CardStrategy' ? 'active-toggle' : ''}" data-sim-action="strategy-run" data-strat="CardStrategy">
              ▶ CardStrategy
            </button>
            <button class="sim-btn ${state.strategyName === 'PayPalStrategy' ? 'active-toggle' : ''}" data-sim-action="strategy-run" data-strat="PayPalStrategy">
              ▶ PayPalStrategy
            </button>
            <button class="sim-btn ${state.strategyName === 'CryptoStrategy' ? 'active-toggle' : ''}" data-sim-action="strategy-run" data-strat="CryptoStrategy">
              ▶ CryptoStrategy
            </button>
          </div>
          <div class="sim-console">${logs}</div>
        </div>
      `;
    }

    case 'decorator': {
      const { compress, encrypt, base64 } = state.decoratorLayers;
      let expr = 'new FileDataSource("rapport.txt")';
      let payload = 'Architecture_SOLID_GoF';
      if (compress) {
        expr = `new CompressionDecorator(${expr})`;
        payload = `ZIP(${payload})`;
      }
      if (encrypt) {
        expr = `new EncryptionDecorator(${expr})`;
        payload = `AES256[${payload}]`;
      }
      if (base64) {
        expr = `new Base64Decorator(${expr})`;
        payload = `B64{${payload}}`;
      }

      return `
        <div class="sim-pane">
          <div class="sim-expr">DataSource src = ${escapeHtml(expr)};</div>
          <div class="sim-controls">
            <button class="sim-btn ${compress ? 'active-toggle' : 'secondary'}" data-sim-action="decorator-toggle" data-layer="compress">
              ${compress ? '✓' : '+'} CompressionDecorator
            </button>
            <button class="sim-btn ${encrypt ? 'active-toggle' : 'secondary'}" data-sim-action="decorator-toggle" data-layer="encrypt">
              ${encrypt ? '✓' : '+'} EncryptionDecorator
            </button>
            <button class="sim-btn ${base64 ? 'active-toggle' : 'secondary'}" data-sim-action="decorator-toggle" data-layer="base64">
              ${base64 ? '✓' : '+'} Base64Decorator
            </button>
          </div>
          <div class="sim-console">
            <div class="log-line"><span class="hl-cyan">Entrée brute :</span> "Architecture_SOLID_GoF"</div>
            <div class="log-line"><span class="hl-warn">Couches actives :</span> ${
              [compress && 'Compression', encrypt && 'Chiffrement AES', base64 && 'Encodage Base64']
                .filter(Boolean)
                .join(' → ') || 'Aucune (Composant nu FileDataSource)'
            }</div>
            <div class="log-line"><span class="hl-green">Sortie disque :</span> rapport.txt &lt;= "${escapeHtml(payload)}"</div>
          </div>
        </div>
      `;
    }

    case 'observer': {
      const subs = state.observerSubs;
      const logs = state.observerLogs
        .map((l) => `<div class="log-line"><span class="ts">[${l.ts}]</span>${l.html}</div>`)
        .join('');
      return `
        <div class="sim-pane">
          <div class="sim-controls">
            <button class="sim-btn ${subs.phone ? 'active-toggle' : 'secondary'}" data-sim-action="obs-toggle" data-obs="phone">
              ${subs.phone ? '🔔' : '🔕'} PhoneDisplay
            </button>
            <button class="sim-btn ${subs.web ? 'active-toggle' : 'secondary'}" data-sim-action="obs-toggle" data-obs="web">
              ${subs.web ? '🔔' : '🔕'} WebDashboard
            </button>
            <button class="sim-btn ${subs.alert ? 'active-toggle' : 'secondary'}" data-sim-action="obs-toggle" data-obs="alert">
              ${subs.alert ? '🔔' : '🔕'} AlertCanicule
            </button>
          </div>
          <div class="sim-controls">
            <button class="sim-btn" data-sim-action="obs-emit" data-temp="21.5">
              ▶ setTemperature(21.5 °C)
            </button>
            <button class="sim-btn" data-sim-action="obs-emit" data-temp="38.0">
              ▶ setTemperature(38.0 °C 🔥)
            </button>
          </div>
          <div class="sim-console">${logs}</div>
        </div>
      `;
    }

    default:
      return '';
  }
}

export function createInitialSimState() {
  return {
    singletonCreated: false,
    singletonCount: 0,
    singletonLogs: [
      {
        ts: nowStamp(),
        html: 'JVM prête — aucune instance de <span class="hl-cyan">DatabaseConnection</span> créée (Lazy Loading).'
      }
    ],
    factoryChannel: 'EMAIL',
    factoryLogs: [
      {
        ts: nowStamp(),
        html: 'Cliquez sur un canal pour appeler <span class="hl-cyan">NotificationFactory.create(...)</span>.'
      }
    ],
    strategyName: 'CardStrategy',
    strategyLogs: [
      {
        ts: nowStamp(),
        html: 'Panier initialisé (150.00 €) — changez de <span class="hl-cyan">PaymentStrategy</span> à chaud !'
      }
    ],
    decoratorLayers: {
      compress: true,
      encrypt: true,
      base64: false
    },
    observerSubs: {
      phone: true,
      web: true,
      alert: true
    },
    observerLogs: [
      {
        ts: nowStamp(),
        html: '3 observateurs abonnés à <span class="hl-cyan">WeatherStation</span>. Émettez une mesure !'
      }
    ]
  };
}

export function handleSimAction(action, dataset, simState) {
  const ts = nowStamp();

  if (action === 'singleton-call') {
    simState.singletonCount += 1;
    if (!simState.singletonCreated) {
      simState.singletonCreated = true;
      simState.singletonLogs.unshift({
        ts,
        html: `[${escapeHtml(dataset.thread)}] 1er appel → <span class="hl-warn">new DatabaseConnection()</span> exécuté → réf <span class="hl-green">@7a81197d</span>`
      });
    } else {
      simState.singletonLogs.unshift({
        ts,
        html: `[${escapeHtml(dataset.thread)}] Appel #${simState.singletonCount} → instance existante retournée : <span class="hl-green">@7a81197d</span> (même objet !)`
      });
    }
  } else if (action === 'singleton-reset') {
    simState.singletonCreated = false;
    simState.singletonCount = 0;
    simState.singletonLogs = [
      { ts, html: 'Mémoire JVM réinitialisée (<span class="hl-cyan">instance = null</span>).' }
    ];
  } else if (action === 'factory-create') {
    const ch = dataset.channel;
    simState.factoryChannel = ch;
    const map = {
      EMAIL: 'EmailNotification → [EMAIL] Envoi SMTP : Cours GoF',
      SMS: 'SmsNotification → [SMS] Envoi opérateur : Cours GoF',
      PUSH: 'PushNotification → [PUSH] Notification mobile : Cours GoF'
    };
    simState.factoryLogs.unshift({
      ts,
      html: `Fabrique instancie <span class="hl-green">${map[ch]}</span>`
    });
  } else if (action === 'strategy-run') {
    const strat = dataset.strat;
    simState.strategyName = strat;
    const msg = {
      CardStrategy: '150.0 € payés par Carte Bancaire (**** 4242) — frais 1.5 %',
      PayPalStrategy: '150.0 € réglés instantanément via compte PayPal vérifié',
      CryptoStrategy: '150.0 € validés sur contrat intelligent Blockchain'
    };
    simState.strategyLogs.unshift({
      ts,
      html: `<span class="hl-cyan">${strat}</span> → <span class="hl-green">${msg[strat]}</span>`
    });
  } else if (action === 'decorator-toggle') {
    const layer = dataset.layer;
    simState.decoratorLayers[layer] = !simState.decoratorLayers[layer];
  } else if (action === 'obs-toggle') {
    const obs = dataset.obs;
    simState.observerSubs[obs] = !simState.observerSubs[obs];
    simState.observerLogs.unshift({
      ts,
      html: `<span class="hl-cyan">${obs}</span> est maintenant <span class="${simState.observerSubs[obs] ? 'hl-green' : 'hl-warn'}">${simState.observerSubs[obs] ? 'ABONNÉ' : 'DÉSABONNÉ'}</span>.`
    });
  } else if (action === 'obs-emit') {
    const temp = parseFloat(dataset.temp);
    const notified = [];
    if (simState.observerSubs.phone) notified.push(`[Mobile: ${temp}°C]`);
    if (simState.observerSubs.web) notified.push(`[WebUI: ${temp}°C]`);
    if (simState.observerSubs.alert) {
      notified.push(temp >= 35 ? `[ALERTE CANICULE ${temp}°C !]` : `[AlertSystem: RAS]`);
    }
    simState.observerLogs.unshift({
      ts,
      html:
        notified.length > 0
          ? `setTemperature(${temp}°C) → <span class="hl-green">${notified.join(' · ')}</span>`
          : `setTemperature(${temp}°C) → <span class="hl-warn">Aucun observateur abonné.</span>`
    });
  }
}
