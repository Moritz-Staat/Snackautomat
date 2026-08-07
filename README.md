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

Die Anwendung ist in **TypeScript** geschrieben und wird mit **Vite** zu statischem HTML/CSS/JS gebaut. Zur Laufzeit läuft alles im Browser — kein Server, keine Datenbank, kein Internet. Der einzige Netzwerkzugriff geht per HTTP POST an einen Microcontroller im lokalen Netz, der die physischen Relais steuert; ist er nicht erreichbar, läuft der Automat unverändert weiter.

---

## Projektstruktur

```
Snackautomat/
├── src/                            # Quellcode (TypeScript)
│   ├── lib/
│   │   ├── types.ts                # Gemeinsame Typen (Question, Tier, AutomatConfig …)
│   │   ├── config.ts               # Voreinstellungen + optionales Runtime-Override
│   │   ├── quiz-core.ts            # Quiz-Engine (für alle 3 Level)
│   │   ├── level-page.ts           # Level-Wrapper (für alle 3 Level)
│   │   ├── pin-modal.ts            # PIN-Modal mit Ziffernblock
│   │   ├── relay.ts                # Relais-Aufrufe (fire-and-forget)
│   │   ├── storage.ts              # Zählerstände im localStorage
│   │   ├── confetti.ts             # Gewinn-Animation
│   │   └── dom.ts                  # Typisierte DOM-Helfer
│   ├── data/
│   │   ├── level1.ts               # Fragenkatalog + Tiers (43 Fragen)
│   │   ├── level2.ts               # (55 Fragen)
│   │   └── level3.ts               # (45 Fragen)
│   └── pages/                      # Vite-Root: HTML-Seiten + Einstiegsskripte
│       ├── Automat.html            # Startseite / Levelauswahl
│       ├── automat.ts              # Screensaver, Ampel, Statistik, PIN
│       ├── automat.css
│       ├── styles/
│       │   ├── base.css            # Fluide Wurzelgröße, Fonts, PIN-Modal
│       │   ├── level.css           # Level-Seiten (alle drei)
│       │   └── quiz.css            # Quiz-Seiten (alle drei)
│       └── Einzelseiten/
│           ├── level1..3.html      # Level-Seiten (Anfänger / Fortgeschritten / Profi)
│           ├── level1..3.ts        # Einstieg je Level
│           └── QuizLevel1..3/
│               ├── index.html      # Quiz-Iframe
│               └── main.ts         # Einstieg je Quiz
├── dist/                           # Build-Ergebnis — im Repo, siehe Deployment
├── QuizImages/                     # Fragebilder (43 Bilder)
├── Images/                         # Logos, Ampelbirnen, Screensaver-Videos
├── fonts/                          # Schriftarten (Rajdhani, Roboto)
├── hilfsdateien/                   # Testseiten, nicht Teil des Builds
├── Backend/                        # Testseite für Relay-HTTP-Requests
├── config.local.example.js         # Vorlage für die lokale Laufzeitkonfiguration
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Warum die Medien nicht gebündelt werden

`Images/`, `QuizImages/` und `fonts/` bleiben außerhalb von `dist/` und werden root-absolut referenziert (`/Images/…`). Allein die drei Screensaver-Videos wiegen rund 123 MB — würde Vite sie in ein mitcommittetes `dist/` kopieren, verdoppelte sich die Repo-Größe bei jedem Build. So bleibt `dist/` unter 100 kB.

Daraus folgt die Anforderung ans Deployment: **Docroot ist das Repo-Root**, Einstiegspunkt `/dist/Automat.html`.

---

## Konfiguration

Die Konfiguration ist zweigeteilt:

| | wo | im Repo? |
|---|---|---|
| **Voreinstellungen** — Timer, `min_richtig`, Relais-Endpunkte | `src/lib/config.ts`, fest einkompiliert | ja |
| **Geheimnisse** — Admin-PINs, Relais-IP | `config.local.js` im Repo-Root | nein (`.gitignore`) |

**`config.local.js` ist optional.** Fehlt sie, greifen die Voreinstellungen und der Automat läuft normal — lediglich die Admin-PIN-Funktionen sind inaktiv und Relais-Aufrufe werden übersprungen. Das ist Absicht: vorher brach die Seite ohne Konfigurationsdatei mit einem `ReferenceError` ab und zeigte gar keine Fragen mehr an.

### Einrichtung

```bash
cp config.local.example.js config.local.js
# Datei mit echten Werten befüllen
```

Alle Felder darin sind einzeln optional; was nicht gesetzt ist, behält seine Voreinstellung. Die Struktur steht kommentiert in `config.local.example.js` — die echten PINs gehören **ausschließlich** in die lokale Datei, nie ins Repo und nie in dieses README.

---

## Deployment

Der Messe-PC soll ohne Internet und ohne `npm install` starten können. Deshalb liegt das Build-Ergebnis `dist/` **mit im Repository**.

```bash
# 1. Repository klonen
git clone https://github.com/Moritz-Staat/Snackautomat.git
cd Snackautomat

# 2. Lokale Konfiguration anlegen (optional, aber für PINs und Relais nötig)
cp config.local.example.js config.local.js

# 3. Webserver mit Docroot auf das Repo-Root starten (nginx, Apache …)
#    Einstiegspunkt: /dist/Automat.html
```

Es ist auf dem Zielrechner **kein Node und kein Build nötig** — `dist/` ist fertig.

### Entwickeln

```bash
npm install
npm run dev        # Vite-Dev-Server mit Hot Reload  -> http://localhost:5173/Automat.html
npm run typecheck  # nur tsc --noEmit
npm run build      # tsc --noEmit && vite build     -> schreibt dist/
npm run serve      # Produktionsaufbau testen       -> http://127.0.0.1:8080/dist/Automat.html
```

`npm run dev` liefert die Seiten direkt unter `/` und blendet `Images/`, `QuizImages/` und `fonts/` aus dem Repo-Root ein — ohne Build, mit Hot Reload. Zum Prüfen des echten Auslieferungspfads (Docroot = Repo-Root, Seiten unter `/dist/`) dient `npm run serve`; das Skript hat keine Abhängigkeiten und läuft auch ohne `npm install`.

Den Unterschied kennt der Code über `import.meta.env.BASE_URL` — im Build `/dist/`, im Dev-Server `/`. Deshalb stimmt der automatische Rücksprung zur Startseite in beiden Fällen.

Auf einem zweiten Monitor testen:

```bash
npm run serve -- --host 0.0.0.0 --port 8080
# dann vom Kiosk-Rechner aus http://<IP-des-Entwicklungsrechners>:8080/dist/Automat.html
```

> **Wichtig:** Nach jeder Änderung an `src/` muss `npm run build` laufen und das aktualisierte `dist/` mitcommittet werden. Sonst läuft auf dem Automaten weiter der alte Stand.

**Hinweis:** Nach einem `git pull` muss `config.local.js` **nicht** neu angelegt werden — sie liegt lokal auf dem Server und wird vom Update nicht berührt.

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

Alle drei Level nutzen dieselbe `lib/level-page.ts`, parametrisiert über das Einstiegsskript des jeweiligen Levels:

```ts
// src/pages/Einzelseiten/level1.ts
setupLevelPage({ storageKey: 'level1win', prizeEndpoint: 'level1_gewinn' });
```

Beide Werte sind über `CounterKey` bzw. `RelayEndpoint` typisiert — ein Tippfehler fällt beim `npm run build` auf, nicht erst auf der Messe. Vorher kamen sie als `data-`-Attribute ungeprüft aus dem HTML.

---

### Quiz-Engine (`lib/quiz-core.ts`)

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
├── automat.ts         (Screensaver, Ampel, PIN-Modal, Statistik-Modal)
└── automat.css → styles/base.css

level1/2/3.html        (Level-Wrapper, iFrame-Host)
├── level1/2/3.ts → lib/level-page.ts
│                     (Preisauswahl, Relais, postMessage-Empfang, PIN-Modal)
└── styles/level.css → styles/base.css

QuizLevel1/2/3/index.html  (Quiz-Iframe)
├── main.ts → lib/quiz-core.ts
│                     (Shuffle, Fragen, Feedback, Timer, Ergebnis, Konfetti)
│           → data/level1|2|3.ts   (Fragenkatalog + Tiers)
└── styles/quiz.css → styles/base.css

config.local.js        (PINs, Relais-IP — nur lokal, optional, nicht im Repo)
```

Die Engine liegt jeweils **einmal** statt dreimal: `quiz-core.ts`, `level-page.ts`, `level.css` und `quiz.css` werden von allen drei Leveln geteilt. Die Level unterscheiden sich nur noch in ihren Daten (`data/levelN.ts`) und einem dreizeiligen Einstiegsskript.

**Kommunikation zwischen Level-Seite und Quiz-Iframe:**

```
QuizLevel*/index.html  →  window.parent.postMessage("prizeCollected" | "quizFailed", origin)
level*.html            →  window.addEventListener("message", ...)   // prüft event.origin
```

Die Nachricht geht an die konkrete Origin statt an `"*"`, und der Empfänger prüft `event.origin` sowie den Nachrichteninhalt, bevor er reagiert.

### Skalierung auf dem 4K-Panel

Der Automat hängt an einem 2160×3840-Display im Hochformat. Statt fester Pixelmaße skaliert die Wurzel-Schriftgröße mit dem Viewport:

```css
html { font-size: clamp(15px, min(1.5vw, 2.2vh), 40px); }
```

Alle übrigen Maße sind in `rem` angegeben und wachsen dadurch automatisch mit. `min(vw, vh)` sorgt dafür, dass das Layout auch auf einem Querformat-Testmonitor nicht vertikal überläuft. Es gibt keine auf einen einzelnen Monitor getunten Magic Numbers mehr.

---

## Test- und Hilfsdateien

| Datei / Ordner | Zweck |
|---|---|
| `hilfsdateien/TESTH/` | Isolierte Testseite für die Quiz-Engine ohne Relay-Anbindung |
| `hilfsdateien/Testseite.html` | Einfache HTML-Testseite |
| `Backend/request.html` | Testseite zum manuellen Auslösen einzelner HTTP-Relay-Requests |

Diese Dateien sind bewusst im Repository belassen und werden für Entwicklung und Debugging benötigt. Sie sind **nicht** Teil des Vite-Builds und laufen als eigenständige HTML-Dateien.

---

*Dokumentation zuletzt aktualisiert: August 2026*
