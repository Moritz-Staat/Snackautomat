/**
 * Vorlage fuer die lokale Konfigurationsdatei.
 * Kopiere diese Datei nach config.js und trage die echten Werte ein.
 * config.js ist in .gitignore eingetragen und wird nicht ins Repo gepusht.
 */
const AUTOMAT_CONFIG = {

    // ── Admin-PINs ───────────────────────────────────────────────────────────
    pins: {
        kontakt:   'XXXXXX',  // Kontaktpreis ausloesen (Expert-Relais)
        reset:     'XXXX',    // localStorage leeren + System zuruecksetzen
        statistik: 'XXX'      // Statistiken anzeigen
    },

    // ── Quiz-Einstellungen ────────────────────────────────────
    min_richtig: 8,          // Mindestanzahl richtiger Antworten fuer einen Gewinn

    // ── Timer-Einstellungen ───────────────────────────────────────────────────
    frage_timer: {
        level1: 15,   // Sekunden pro Frage (Anfaenger)
        level2: 25,   // Sekunden pro Frage (Fortgeschritten)
        level3: 20    // Sekunden pro Frage (Profi)
    },

    // ── Relais-Controller ────────────────────────────────────────────────────
    // IP-Adresse des Microcontrollers, der die Relais steuert
    relais_ip: 'http://192.168.X.X',

    // Endpunkte des Relais-Controllers (werden an relais_ip angehaengt)
    relais_endpunkte: {
        level1_gewinn: '/Hyper',      // Relais fuer Level-1-Gewinn
        level2_gewinn: '/Beginner',   // Relais fuer Level-2-Gewinn
        level3_gewinn: '/Register',   // Relais fuer Level-3-Gewinn
        trostpreis:    '/Expert',     // Relais fuer Trostpreis / Kontaktpreis
        reset:         '/Start'       // Reset-Relais
    }

};
