/** Gemeinsame Typen für Quiz-Daten, Konfiguration und iframe-Kommunikation. */

export interface Answer {
  text: string;
  correct: boolean;
}

export interface Question {
  question: string;
  answers: Answer[];
  /** Dateiname innerhalb von /QuizImages/, z. B. "Hp0_Licht.svg". Optional. */
  image?: string;
}

/**
 * Ergebnisstufe. `min` ist die Mindestzahl richtiger Antworten.
 * Die Stufen werden absteigend nach `min` ausgewertet; der letzte Eintrag
 * (min: 0) ist der Auffangfall.
 */
export interface Tier {
  min: number;
  win: boolean;
  text: string;
}

export interface QuizSetup {
  questions: Question[];
  tiers: Tier[];
  timerSeconds: number;
  /** Lok-Illustration des Levels, faehrt bei der Ankunft ein (z. B. "/Images/01.svg"). */
  loco?: string;
}

/** Schlüssel der Relais-Endpunkte am Microcontroller. */
export type RelayEndpoint =
  | 'level1_gewinn'
  | 'level2_gewinn'
  | 'level3_gewinn'
  | 'trostpreis'
  | 'reset';

export type LevelId = 'level1' | 'level2' | 'level3';

/** localStorage-Schlüssel für die Zählerstände. */
export type CounterKey = 'level1win' | 'level2win' | 'level3win' | 'loses' | 'kontaktdaten';

export interface AutomatConfig {
  pins: {
    kontakt: string;
    reset: string;
    statistik: string;
  };
  /** Mindestanzahl richtiger Antworten für einen Gewinn. */
  min_richtig: number;
  frage_timer: Record<LevelId, number>;
  /** Basis-URL des Relais-Controllers. Leer = Relais-Aufrufe werden übersprungen. */
  relais_ip: string;
  relais_endpunkte: Record<RelayEndpoint, string>;
}

/** Was `config.local.js` überschreiben darf — alles optional. */
export type AutomatConfigOverride = {
  [K in keyof AutomatConfig]?: AutomatConfig[K] extends object
    ? Partial<AutomatConfig[K]>
    : AutomatConfig[K];
};

/** Nachricht vom Quiz-iframe an die Level-Seite. */
export type QuizResultMessage = 'prizeCollected' | 'quizFailed';

export function isQuizResultMessage(value: unknown): value is QuizResultMessage {
  return value === 'prizeCollected' || value === 'quizFailed';
}
