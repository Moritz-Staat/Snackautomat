import { el, optionalEl } from './dom';

/**
 * Das PIN-Modal mit Ziffernblock kommt auf der Startseite und auf allen drei
 * Level-Seiten identisch vor. Die Seiten unterscheiden sich nur darin, welche
 * PINs sie akzeptieren — das kommt als Handler herein.
 *
 * `onSubmit` gibt zurueck, ob die PIN erkannt wurde. Bei `false` blinkt das
 * Eingabefeld rot und das Modal schliesst sich nach 2 s von selbst.
 */
export interface PinModalHandlers {
  onSubmit: (pin: string) => boolean;
}

export function setupPinModal({ onSubmit }: PinModalHandlers): void {
  const modal = el('pinModal');
  const input = el<HTMLInputElement>('pinInput');
  const blurTarget = el('wholepage');
  const logo = el('logo');

  let rejectTimer: number | undefined;

  function open(): void {
    modal.style.display = 'block';
    blurTarget.classList.add('blurred');
  }

  function close(): void {
    window.clearTimeout(rejectTimer);
    rejectTimer = undefined;
    input.value = '';
    input.classList.remove('error-border');
    modal.style.display = 'none';
    blurTarget.classList.remove('blurred');
  }

  logo.addEventListener('click', open);

  // Erstes .close-Element im Dokument gehoert zum PIN-Modal; das Statistik-
  // Modal bringt sein eigenes mit eigener ID mit.
  document.querySelector('#pinModal .close')?.addEventListener('click', close);

  window.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });

  el('submitPin').addEventListener('click', () => {
    if (onSubmit(input.value)) {
      close();
      return;
    }
    input.classList.add('error-border');
    window.clearTimeout(rejectTimer);
    rejectTimer = window.setTimeout(close, 2000);
  });

  document.querySelectorAll<HTMLButtonElement>('#numpad .num').forEach((button) => {
    button.addEventListener('click', () => {
      input.value += button.innerText.trim();
    });
  });

  optionalEl('backspace')?.addEventListener('click', () => {
    input.value = input.value.slice(0, -1);
  });
}
