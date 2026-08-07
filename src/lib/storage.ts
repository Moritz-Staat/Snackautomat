import type { CounterKey } from './types';

/**
 * Zaehlerstaende im localStorage. Kapselt den Zugriff, weil localStorage im
 * Kiosk-Browser bei vollem Profil oder deaktivierten Cookies werfen kann —
 * das darf den Automaten nicht anhalten.
 */

export function readCounter(key: CounterKey): number {
  try {
    const raw = localStorage.getItem(key);
    const value = Number.parseInt(raw ?? '0', 10);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function incrementCounter(key: CounterKey): number {
  const next = readCounter(key) + 1;
  try {
    localStorage.setItem(key, String(next));
  } catch {
    /* Zaehler geht verloren, Ablauf laeuft weiter. */
  }
  return next;
}

export function clearCounters(): void {
  try {
    localStorage.clear();
  } catch {
    /* nichts zu tun */
  }
}

export function readAllCounters(): Record<CounterKey, number> {
  return {
    level1win: readCounter('level1win'),
    level2win: readCounter('level2win'),
    level3win: readCounter('level3win'),
    loses: readCounter('loses'),
    kontaktdaten: readCounter('kontaktdaten'),
  };
}
