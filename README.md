# Snackautomat – Quiz-Preisautomat

Ein browserbasierter Quiz-Automat für Messen und Events. Besucher beantworten Wissensfragen auf einem Touchscreen; bei ausreichend richtigen Antworten wird automatisch ein Preis über einen HTTP-Relay-Controller ausgegeben.

---

## Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Projektstruktur](#projektstruktur)
3. [Konfiguration](#konfiguration)
4. [Deployment](#deployment)
5. [Funktionen im Detail](#funktionen-im-detail)
   - [Startseite](#startseite-automatenhtml)
   - [Screensaver](#screensaver)
   - [Birnenwechsler (Ampel)](#birnenwechsler-ampel)
   - [PIN-Modal](#pin-modal)
   - [Statistik-Modal](#statistik-modal)
   - [Level-Seiten](#level-seiten-level1html--level3html)
   - [Quiz-Engine](#quiz-engine-quiz-corejs)
   - [Inaktivitäts-Blur & Auto-Redirect](#inaktivitäts-blur--auto-redirect)
   - [Frage-Timer](#frage-timer)
   - [Gewinn-Animation](#gewinn-animation)
   - [Ergebnisscreen & Tier-System](#ergebnisscreen--tier-system)
   - [Preisauswahl-Popup](#preisauswahl-popup)
   - [Relay-Auslösung](#relay-auslösung)
6. [Statistiken (localStorage)](#statistiken-localstorage)
7. [Technische Architektur](#technische-architektur)
8. [Test- und Hilfsdateien](#test--und-hilfsdateien)

---

## Überblick

```
Besucher tippt auf Level → Quiz startet → 10 Fragen → Ergebnis
  ≥ 8 richtig → Preis abholen → Relay löst aus → Snack fällt
  < 8 richtig → Trostpreis-Relay → automatische Rückkehr zur Startseite
```

Die Anwendung läuft vollständig im Browser (Vanilla JS, kein Framework, kein Build-Step) und kommuniziert per HTTP POST mit einem lokalen Microcontroller, der die physischen Relais steuert.

---

## Projektstruktur

```
Snackautomat/
├── site/
│   ├── Automat.html            # Startseite / Levelauswahl
│   ├── script.js               # Logik der Startseite
│   ├── styles.css              # Styles der Startseite
│   ├── config.js               # ⚠ Lokale Konfiguration (nicht im Repo, siehe .gitignore)
│   ├── config.example.js       # Vorlage für config.js
│   └── Einzelseiten/
│       ├── javalevel.js        # Gemeinsamer Level-Wrapper (für alle 3 Level)
│       ├── quiz-core.js        # Gemeinsame Quiz-Engine (für alle 3 Level)
│       ├── stylelevel1/2/3.css # Styles der Level-Seiten
│       ├── level1.html         # Level-1-Seite (Anfänger)
│       ├── level2.html         # Level-2-Seite (Fortgeschritten)
│       ├── level3.html         # Level-3-Seite (Profi)
│       ├── QuizLevel1/
│       │   ├── index.html      # Quiz-Iframe Level 1
│       │   ├── script.js       # Fragenkatalog + Tier-Konfiguration (43 Fragen)
│       │   └── styles.css      # Quiz-Iframe-Styles
│       ├── QuizLevel2/         # Analog Level 1 (55 Fragen)
│       ├── QuizLevel3/         # Analog Level 1 (45 Fragen)
│       ├── QuizImages/         # Gemeinsamer Bilderordner für alle 3 Level (43 Bilder)
│       └── TESTH/              # Testseite (isoliertes Quiz ohne Relay)
├── Images/                     # Globale Bilder (Logos, Ampelbirnen, Screensaver-Videos)
├── fonts/                      # Schriftarten (Rajdhani, Roboto)
├── Backend/                    # Testseite für Relay-HTTP-Requests
├── .gitignore
└── README.md
```

---

## Konfiguration

Alle sensiblen und installationsspezifischen Werte stehen in `site/config.js`. Diese Datei ist in `.gitignore` eingetragen und wird **nicht** ins Repository gepusht.

### Einrichtung

```bash
cp site/config.example.js site/config.js
# Datei mit echten Werten befüllen
```

### Struktur von `config.js`

```javascript
const AUTOMAT_CONFIG = {

    // Admin-PINs (werden per Numpad eingegeben)
    pins: {
        kontakt:   "151107",  // Kontaktpreis-PIN
        reset:     "1111",    // Reset-PIN (löscht alle Zählerstände)
        statistik: "258"      // Statistik-PIN
    },

    min_richtig: 8,  // Mindestanzahl richtiger Antworten für einen Gewinn

    frage_timer: {
        level1: 15,   // Sekunden pro Frage (Anfänger)
        level2: 25,   // Sekunden pro Frage (Fortgeschritten)
        level3: 40    // Sekunden pro Frage (Profi)
    },

    relais_ip: "http://192.168.0.120",

    relais_endpunkte: {
        level1_gewinn: "/Hyper",
        level2_gewinn: "/Beginner",
        level3_gewinn: "/Register",
        trostpreis:    "/Expert",
        reset:         "/Start"
    }
};
```

---

## Deployment

```bash
# 1. Repository klonen
git clone https://github.com/Moritz-Staat/Snackautomat.git

# 2. Konfiguration anlegen
cp site/config.example.js site/config.js

# 3. Webserver starten (z.B. nginx, Apache)
# Einstiegspunkt: site/Automat.html
```

**Hinweis:** Nach einem `git pull` muss `config.js` **nicht** neu angelegt werden — sie liegt lokal auf dem Server und wird vom Update nicht berührt.

---

## Funktionen im Detail

### Startseite (`Automat.html`)

Die Startseite ist der Einstiegspunkt. Sie zeigt drei anklickbare Level-Karten und steuert Screensaver, Birnenwechsler und das Admin-PIN-Modal.

---

### Screensaver

Nach **20 Sekunden Inaktivität** auf der Startseite startet automatisch ein Screensaver-Video.

- Es werden 3 verschiedene MP4-Videos zufällig ausgewählt
- Das Video spielt einmal durch und kehrt danach automatisch zur Startseite zurück
- **Beenden:** Beliebige Berührung oder Klick schließt den Screensaver sofort
- Auf Touchscreen-Geräten wird kein Mausbewegungslistener registriert (`pointer: coarse` Erkennung)
- **Auf Quiz-Seiten gibt es keinen Screensaver** — dort greift der Inaktivitäts-Blur

---

### Birnenwechsler (Ampel)

Das Logo-Bild auf der Startseite wechselt automatisch die Farbe basierend auf den aktuellen Zählerständen — als visueller Hinweis, wann der Automat aufgefüllt werden muss.

| Farbe | Bedingung |
|-------|-----------|
| Grün | Normalbetrieb |
| Orange | Level 1 > 15, Level 2 > 25, Level 3 > 15, Trostpreise > 13 **oder** Kontakt > 5 |
| Rot | Level 1 > 25, Level 2 > 35, Level 3 > 25, Trostpreise > 18 **oder** Kontakt > 10 |

Die rote Bedingung wird immer zuerst geprüft, dann orange, dann grün.

---

### PIN-Modal

Durch Tippen auf das **WuS-Logo** (unten rechts) öffnet sich ein Modal mit einem Numpad. Der Hintergrund wird dabei unscharf (Blur-Effekt). Es gibt drei PINs:

| PIN | Funktion |
|-----|-----------|
| `kontakt` | Speichert eine Kontaktanfrage im localStorage und löst das Trostpreis-Relais aus |
| `reset` | Löscht alle localStorage-Zählerstände und löst das Reset-Relais aus |
| `statistik` | Öffnet das Statistik-Modal |

Bei falschem PIN: Eingabefeld kurz rot umrandet, dann schließt das Modal automatisch.

**Hinweis:** Auf den Level-Seiten gibt es ebenfalls ein PIN-Modal, das jedoch nur die Kontakt-PIN akzeptiert.

---

### Statistik-Modal

Wird durch die Statistik-PIN geöffnet. Zeigt eine Tabelle aller gespeicherten Zählerstände:

| Feld | localStorage-Schlüssel |
|------|------------------------|
| Level 1 – Anfänger (Gewinne) | `level1win` |
| Level 2 – Fortgeschritten (Gewinne) | `level2win` |
| Level 3 – Profi (Gewinne) | `level3win` |
| Trostpreise | `loses` |
| Kontaktanfragen | `kontaktdaten` |

Schließen per Schließen-Button, X-Button oder Klick außerhalb des Modals.

---

### Level-Seiten (`level1.html` – `level3.html`)

Jede Level-Seite ist ein Wrapper um das eigentliche Quiz:

```
level1.html
  └── <iframe src="./QuizLevel1/index.html">   ← Quiz läuft hier drin
```

Die Level-Seite ist zuständig für:
- Anzeige des **Preisauswahl-Popups** nach Quiz-Ende
- **Relay-Auslösung** (Gewinn oder Trostpreis)
- **Zählerstand-Erhöhung** im localStorage
- **Automatische Rückkehr** zur Startseite nach 3–10 Sekunden
- Das **Kontakt-PIN-Modal**

Alle drei Level nutzen dieselbe `javalevel.js`, konfiguriert über HTML-Data-Attribute:

```html
<body data-storage-key="level1win" data-prize-endpoint="level1_gewinn">
```

---

### Quiz-Engine (`quiz-core.js`)

Die Kern-Logik läuft im Iframe und wird über `initQuiz(config)` gestartet.

**Ablauf:**

1. **Shuffle:** Fisher-Yates-Algorithmus mischt den Fragenkatalog und zieht 10 zufällige Fragen
2. **Bild-Preloading:** Bilder der 10 gezogenen Fragen sofort vorgeladen; Bild der nächsten Frage wird während der aktuellen im Hintergrund geladen
3. **Frageanzeige:** Frage + Bild (optional) + 4 Antwort-Buttons, gerendert per `DocumentFragment` in einem einzigen DOM-Schritt
4. **Antwort-Feedback:** Delegierter Klick-Handler; alle Buttons deaktiviert, gewählte Antwort grün/rot markiert, richtige Antwort bei Fehler zusätzlich hervorgehoben
5. **Fortschrittsbalken:** Zeigt `aktuelle Frage / 10` in Echtzeit
6. **Weiter:** 1,5 Sekunden nach Antwort automatisch zur nächsten Frage

**Fragenkataloge:**

| Level | Schwierigkeit | Fragen im Pool |
|-------|--------------|----------------|
| Level 1 | Anfänger | 43 |
| Level 2 | Fortgeschritten | 55 |
| Level 3 | Profi | 45 |

Pro Spiel werden immer 10 Fragen zufällig gezogen.

---

### Inaktivitäts-Blur & Auto-Redirect

Auf den Quiz-Seiten gibt es kein Screensaver-Video, stattdessen ein zweistufiges Inaktivitäts-System:

| Zeit ohne Interaktion | Aktion |
|-----------------------|--------|
| 20 Sekunden | Seite wird unscharf (Blur-Overlay erscheint) |
| 30 Sekunden | Automatische Weiterleitung zu `Automat.html` |

Jede Berührung oder jeder Klick setzt beide Timer zurück und entfernt den Blur sofort.

---

### Frage-Timer

Jede Frage hat einen sichtbaren Countdown-Balken direkt über dem Fortschrittsbalken. Läuft die Zeit ab, ohne dass eine Antwort gegeben wurde, zählt die Frage als falsch und das Quiz geht automatisch weiter.

Der Balken läuft von Grün nach Rot. Die Zeit pro Frage ist in `config.js` unter `frage_timer` individuell pro Level konfigurierbar:

| Level | Standard |
|-------|----------|
| Level 1 – Anfänger | 15 Sekunden |
| Level 2 – Fortgeschritten | 25 Sekunden |
| Level 3 – Profi | 40 Sekunden |

Der Frage-Timer und das bestehende Inaktivitäts-System ergänzen sich: Läuft jemand weg, greift nach 20 Sekunden der Blur und nach 30 Sekunden die Weiterleitung zur Startseite.

---

### Gewinn-Animation

Bei einem Gewinn (≥ `min_richtig` richtige Antworten) startet automatisch eine Konfetti-Animation. 130 bunte Partikel fallen über den Bildschirm und blenden nach 4 Sekunden sanft aus. Die Animation läuft als Canvas-Overlay (`z-index: 999`) und blockiert keine Interaktionen.

---

### Ergebnisscreen & Tier-System

Nach der 10. Frage wertet die Quiz-Engine das Ergebnis aus. Das Tier mit dem höchsten `min`-Wert, dessen Schwelle erreicht wurde, bestimmt die angezeigte Nachricht.

**Level 1 (Anfänger):**

| Richtige Antworten | Nachricht |
|--------------------|-----------|
| ≥ 8 (Gewinn) | Wow! Lokführer des Wissens, du hast die Strecke sehr gut gemeistert! |
| ≥ 5 | Dein Wissen nimmt Fahrt auf! Du kommst schon ziemlich gut in die richtige Spur |
| ≥ 3 | Schon nicht schlecht, wie wärs mit einer Auffrischung deines Wissens? |
| < 3 | Da musst du wohl nochmal zu unseren Schulungen! |

**Level 2 (Fortgeschritten):**

| Richtige Antworten | Nachricht |
|--------------------|-----------|
| ≥ 8 (Gewinn) | Weichen perfekt eingestellt! Du beherrschst das Bahnwissen wie ein Profi! |
| ≥ 6 | Du bist auf dem Überholgleis, das war richtig gut! |
| ≥ 4 | Die Ampel steht auf gelb – du hast einen soliden Start hingelegt, aber da ist noch Platz nach oben! |
| < 4 | Rote Ampel! Ab zu unseren Schulungen ;) |

**Level 3 (Profi):**

| Richtige Antworten | Nachricht |
|--------------------|-----------|
| ≥ 8 (Gewinn) | Wow, das war spitze! Vielleicht solltest du dich als Trainer bei uns bewerben! |
| ≥ 7 | Du scheinst dein Zeug zu können! Ein letztes Signal und du wirst zum Profi! |
| ≥ 3 | Ein paar Weichen musst du wohl noch richtig stellen! |
| < 3 | Das war wohl etwas schwer, better luck next time! |

Der Gewinn-Schwellwert (Standard: 8) ist in `config.js` unter `min_richtig` konfigurierbar und gilt für alle drei Level.

Nach dem Ergebnisscreen erscheint ein Button:
- **Gewinn:** Preis abholen → sendet `prizeCollected` per `postMessage` an die Level-Seite
- **Niederlage:** Zurück zum Start → sendet `quizFailed` per `postMessage`

---

### Preisauswahl-Popup

Nach Empfang der `postMessage` blendet die Level-Seite ein Popup ein:

**Bei Gewinn:**
- *Normaler Preis:* Erhöht den Gewinn-Zähler im localStorage, löst das Level-spezifische Relay aus, kehrt nach 3 Sekunden zur Startseite zurück
- *Premium Preis:* Zeigt Hinweis Melde dich bei unserem Stand, kehrt nach 10 Sekunden zurück (kein Relay)

**Bei Niederlage:**
- Erhöht den `loses`-Zähler im localStorage
- Löst das Trostpreis-Relay aus
- Kehrt nach 3 Sekunden zur Startseite zurück

---

### Relay-Auslösung

Alle Relay-Calls sind **fire-and-forget** HTTP-POST-Requests an den Microcontroller:

```
POST http://<relais_ip>/<endpunkt>?param=1
```

| Auslöser | Endpunkt (Standard) |
|----------|-----------------------|
| Level 1 Gewinn | `/Hyper` |
| Level 2 Gewinn | `/Beginner` |
| Level 3 Gewinn | `/Register` |
| Trostpreis / Kontaktpreis | `/Expert` |
| Reset | `/Start` |

Endpunkte und IP sind in `config.js` konfigurierbar. Netzwerkfehler werden stillschweigend ignoriert.

---

## Statistiken (localStorage)

Alle Zählerstände werden im localStorage des Browsers auf dem Gerät gespeichert. Sie überleben Seitenladevorgänge und Browser-Neustarts, gehen aber bei manuellem Cache-Leeren oder Reset-PIN verloren.

| Schlüssel | Bedeutung |
|-----------|-----------|
| `level1win` | Anzahl gewonnener Spiele auf Level 1 |
| `level2win` | Anzahl gewonnener Spiele auf Level 2 |
| `level3win` | Anzahl gewonnener Spiele auf Level 3 |
| `loses` | Anzahl nicht gewonnener Spiele (Trostpreis ausgegeben) |
| `kontaktdaten` | Anzahl ausgelöster Kontaktpreis-Anfragen |

Anzeige: Statistik-PIN → Statistik-Modal auf der Startseite
Reset: Reset-PIN (`localStorage.clear()`)

---

## Technische Architektur

```
Automat.html
├── script.js          (Screensaver, Birnenwechsler, PIN-Modal, Stats-Modal)
└── styles.css

level1/2/3.html        (Level-Wrapper, iFrame-Host)
├── javalevel.js       (Preisauswahl, Relay-Calls, postMessage-Empfang, PIN-Modal)
└── stylelevel1/2/3.css

QuizLevel1/2/3/index.html  (Quiz-Iframe)
├── quiz-core.js       (Engine: Shuffle, Fragen, Feedback, Timer, Ergebnis)
├── script.js          (Fragenkatalog + Tier-Konfiguration)
└── styles.css

config.js              (PINs, IP, Endpunkte, min_richtig — nur lokal, nicht im Repo)
```

**Kommunikation zwischen Level-Seite und Quiz-Iframe:**

```
QuizLevel*/index.html  →  window.parent.postMessage("prizeCollected" | "quizFailed", "*")
level*.html            →  window.addEventListener("message", ...)
```

Die iFrame-Architektur trennt Quiz-Logik und Level-Wrapper sauber voneinander. Beide Schichten können unabhängig entwickelt und getestet werden.

---

## Test- und Hilfsdateien

| Datei / Ordner | Zweck |
|---|---|
| `site/Einzelseiten/TESTH/` | Isolierte Testseite für die Quiz-Engine ohne Relay-Anbindung |
| `site/Einzelseiten/Testseite.html` | Einfache HTML-Testseite |
| `Backend/request.html` | Testseite zum manuellen Auslösen einzelner HTTP-Relay-Requests |

Diese Dateien sind bewusst im Repository belassen und werden für Entwicklung und Debugging benötigt.

---

*Dokumentation zuletzt aktualisiert: April 2026*
