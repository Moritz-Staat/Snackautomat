/**
 * Vorlage für die lokale Laufzeitkonfiguration.
 *
 *   cp config.local.example.js config.local.js
 *
 * config.local.js steht in .gitignore und wird nicht ins Repo gepusht.
 *
 * WICHTIG: Diese Datei ist optional. Fehlt sie, laufen Startseite und Quiz
 * trotzdem — es greifen die Voreinstellungen aus src/lib/config.ts. Ohne
 * gesetzte PINs sind lediglich die Admin-Funktionen inaktiv, und ohne
 * relais_ip werden die Relais-Aufrufe übersprungen.
 *
 * Alle Felder sind einzeln optional; nicht gesetzte Werte behalten ihre
 * Voreinstellung.
 */
window.AUTOMAT_CONFIG = {

    // ── Admin-PINs ───────────────────────────────────────────────────────────
    // Werden über das Ziffernblock-Modal (Klick auf das Logo) eingegeben.
    pins: {
        kontakt:   'XXXXXX',  // Kontaktpreis auslösen (Trostpreis-Relais)
        reset:     'XXXX',    // Zählerstände leeren + Reset-Relais
        statistik: 'XXX'      // Statistik-Modal anzeigen
    },

    // ── Quiz-Einstellungen ───────────────────────────────────────────────────
    min_richtig: 8,           // Mindestanzahl richtiger Antworten für einen Gewinn

    // ── Timer ────────────────────────────────────────────────────────────────
    frage_timer: {
        level1: 15,           // Sekunden pro Frage (Anfänger)
        level2: 25,           // Sekunden pro Frage (Fortgeschritten)
        level3: 40            // Sekunden pro Frage (Profi)
    },

    // ── Relais-Controller ────────────────────────────────────────────────────
    // IP des Microcontrollers im lokalen Netz. Leer lassen = keine Relais.
    relais_ip: 'http://192.168.X.X',

    relais_endpunkte: {
        level1_gewinn: '/Hyper',
        level2_gewinn: '/Beginner',
        level3_gewinn: '/Register',
        trostpreis:    '/Expert',
        reset:         '/Start'
    }

};
