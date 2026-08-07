import type { AutomatConfig, AutomatConfigOverride } from './types';

/**
 * Voreinstellungen. Diese Werte sind fest einkompiliert, damit das Quiz auch
 * dann laeuft, wenn keine lokale Konfiguration vorliegt — genau das war vorher
 * der Grund, warum auf einem frischen Clone keine Fragen geladen wurden:
 * `config.js` steht in .gitignore, und der Zugriff auf das fehlende globale
 * AUTOMAT_CONFIG hat die Seite mit einem ReferenceError abgebrochen.
 *
 * Geheimnisse gehoeren NICHT hierher. PINs und die Relais-IP kommen aus der
 * optionalen, nicht versionierten Datei `config.local.js` (siehe
 * config.local.example.js im Repo-Root).
 */
const DEFAULTS: AutomatConfig = {
  // Absichtlich leer: eine leere PIN wird von requirePin() nie akzeptiert,
  // die Admin-Funktionen sind ohne config.local.js also schlicht inaktiv.
  pins: {
    kontakt: '',
    reset: '',
    statistik: '',
  },

  min_richtig: 8,

  frage_timer: {
    level1: 15,
    level2: 25,
    level3: 40,
  },

  // Leer = kein Relais-Controller konfiguriert. triggerRelay() wird dann
  // uebersprungen, statt ins Leere zu laufen.
  relais_ip: '',

  relais_endpunkte: {
    level1_gewinn: '/Hyper',
    level2_gewinn: '/Beginner',
    level3_gewinn: '/Register',
    trostpreis: '/Expert',
    reset: '/Start',
  },
};

declare global {
  interface Window {
    AUTOMAT_CONFIG?: AutomatConfigOverride;
  }
}

function merge(base: AutomatConfig, override: AutomatConfigOverride): AutomatConfig {
  return {
    pins: { ...base.pins, ...override.pins },
    min_richtig: override.min_richtig ?? base.min_richtig,
    frage_timer: { ...base.frage_timer, ...override.frage_timer },
    relais_ip: (override.relais_ip ?? base.relais_ip).replace(/\/+$/, ''),
    relais_endpunkte: { ...base.relais_endpunkte, ...override.relais_endpunkte },
  };
}

/**
 * Wirft nie. Eine fehlende oder fehlerhafte `config.local.js` fuehrt
 * hoechstens dazu, dass Voreinstellungen greifen.
 */
function load(): AutomatConfig {
  const override = typeof window !== 'undefined' ? window.AUTOMAT_CONFIG : undefined;
  if (!override || typeof override !== 'object') {
    return DEFAULTS;
  }
  try {
    return merge(DEFAULTS, override);
  } catch {
    return DEFAULTS;
  }
}

export const config: AutomatConfig = load();

/**
 * Prueft eine eingegebene PIN gegen die konfigurierte.
 * Leere konfigurierte PINs matchen nie — sonst wuerde ohne config.local.js
 * jede leere Eingabe die Admin-Funktion ausloesen.
 */
export function pinMatches(entered: string, configured: string): boolean {
  return configured.length > 0 && entered === configured;
}
