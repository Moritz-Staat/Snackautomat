/**
 * Vorlage für die lokale Konfigurationsdatei.
 * Kopiere diese Datei nach config.js und trage die echten Werte ein.
 * config.js ist in .gitignore eingetragen und wird nicht ins Repo gepusht.
 */
const AUTOMAT_CONFIG = {

    // ── Admin-PINs ───────────────────────────────────────────────────────────
    pins: {
        kontakt:   'XXXXXX',  // Kontaktpreis auslösen (Expert-Relais)
        reset:     'XXXX',    // localStorage leeren + System zurücksetzen
        statistik: 'XXX'      // Statistiken anzeigen
    },

    // ── Relais-Controller ────────────────────────────────────────────────────
    // IP-Adresse des Microcontrollers, der die Relais steuert
    relais_ip: 'http://192.168.X.X',

    // Endpunkte des Relais-Controllers (werden an relais_ip angehängt)
    relais_endpunkte: {
        level1_gewinn: '/Hyper',      // Relais für Level-1-Gewinn
        level2_gewinn: '/Beginner',   // Relais für Level-2-Gewinn
        level3_gewinn: '/Register',   // Relais für Level-3-Gewinn
        trostpreis:    '/Expert',     // Relais für Trostpreis / Kontaktpreis
        reset:         '/Start'       // Reset-Relais
    }

};
