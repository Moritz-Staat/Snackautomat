import { config, pinMatches } from './config';
import { el } from './dom';
import { setupPinModal } from './pin-modal';
import { triggerRelay } from './relay';
import { incrementCounter } from './storage';
import { isQuizResultMessage, type CounterKey, type QuizResultMessage, type RelayEndpoint } from './types';

const PREMIUM_REDIRECT_MS = 10_000;
const NORMAL_REDIRECT_MS = 3_000;
// BASE_URL statt fester Pfad: im Build '/dist/', im Dev-Server '/'.
const HOME_URL = `${import.meta.env.BASE_URL}Automat.html`;

interface LevelPageOptions {
  storageKey: CounterKey;
  prizeEndpoint: RelayEndpoint;
}

/**
 * Gemeinsame Logik der drei Level-Seiten. Sie umrahmen das eigentliche Quiz,
 * das in einem iframe laeuft und sein Ergebnis per postMessage meldet.
 */
export function setupLevelPage({ storageKey, prizeEndpoint }: LevelPageOptions): void {
  const preisauswahl = el('Preisauswahl');
  const popup = el('popup');
  const popupText = el('popupText');
  const popupGif = el<HTMLImageElement>('popupGif');
  const popupButtons = el('popupButtons');
  const normalButton = el<HTMLButtonElement>('normalButton');
  const premiumButton = el<HTMLButtonElement>('premiumButton');
  const mainContent = el('mainContent');

  let redirectTimer: number | undefined;
  let result: QuizResultMessage | undefined;

  function redirect(delay: number): void {
    if (redirectTimer !== undefined) return;
    redirectTimer = window.setTimeout(() => {
      window.location.href = HOME_URL;
    }, delay);
  }

  window.addEventListener('message', (event: MessageEvent<unknown>) => {
    // Nur Nachrichten aus dem eigenen Quiz-iframe akzeptieren.
    if (event.origin !== window.location.origin) return;
    if (!isQuizResultMessage(event.data)) return;

    result = event.data;
    preisauswahl.classList.remove('preise');
    preisauswahl.classList.add('preiseshown');
  });

  premiumButton.addEventListener('click', () => {
    popupText.textContent = 'Melde dich bei unserem Stand für dein Premium Geschenk!';
    popupGif.style.display = 'none';
    popupButtons.style.display = 'none';
    redirect(PREMIUM_REDIRECT_MS);
  });

  normalButton.addEventListener('click', () => {
    if (redirectTimer !== undefined) return;

    if (result === 'prizeCollected') {
      incrementCounter(storageKey);
      triggerRelay(prizeEndpoint);
      redirect(NORMAL_REDIRECT_MS);
    } else if (result === 'quizFailed') {
      incrementCounter('loses');
      triggerRelay('trostpreis');
      redirect(NORMAL_REDIRECT_MS);
    }

    popup.style.display = 'none';
    mainContent.classList.remove('blurred');
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
