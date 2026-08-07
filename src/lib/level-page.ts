import { config, pinMatches } from './config';
import { setupPinModal } from './pin-modal';
import { triggerRelay } from './relay';
import { incrementCounter } from './storage';
import { isQuizResultMessage, type CounterKey, type RelayEndpoint } from './types';

/** Wie lange das Ergebnis noch stehen bleibt, bevor es zurueck zur Startseite geht. */
const RETURN_HOME_MS = 3_000;
// BASE_URL statt fester Pfad: im Build '/dist/', im Dev-Server '/'.
const HOME_URL = `${import.meta.env.BASE_URL}Automat.html`;

interface LevelPageOptions {
  storageKey: CounterKey;
  prizeEndpoint: RelayEndpoint;
}

/**
 * Gemeinsame Logik der drei Level-Seiten. Sie umrahmen das eigentliche Quiz,
 * das in einem iframe laeuft und sein Ergebnis per postMessage meldet.
 *
 * Zwischen Quizergebnis und Preisausgabe lag frueher ein Popup zur Auswahl
 * zwischen normalem und Premium-Preis (Kontaktdaten gegen hoeherwertigen
 * Preis). Das ist entfernt, der Ablauf wird neu konzipiert — siehe Issue #6.
 * Jetzt loest das Ergebnis direkt das passende Relais aus.
 */
export function setupLevelPage({ storageKey, prizeEndpoint }: LevelPageOptions): void {
  let handled = false;

  window.addEventListener('message', (event: MessageEvent<unknown>) => {
    // Nur Nachrichten aus dem eigenen Quiz-iframe akzeptieren.
    if (event.origin !== window.location.origin) return;
    if (!isQuizResultMessage(event.data)) return;
    // Ein Durchgang loest genau einmal aus, auch wenn die Nachricht doppelt kaeme.
    if (handled) return;
    handled = true;

    if (event.data === 'prizeCollected') {
      incrementCounter(storageKey);
      triggerRelay(prizeEndpoint);
    } else {
      incrementCounter('loses');
      triggerRelay('trostpreis');
    }

    window.setTimeout(() => {
      window.location.href = HOME_URL;
    }, RETURN_HOME_MS);
  });

  setupPinModal({
    onSubmit: (pin) => {
      if (!pinMatches(pin, config.pins.kontakt)) return false;
      incrementCounter('kontaktdaten');
      triggerRelay('trostpreis');
      return true;
    },
  });
}
