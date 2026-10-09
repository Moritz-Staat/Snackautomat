# Chris-O-Mat – Quiz-Snackautomat

Ein Quiz-Automat für Messen und Events der WuS-Technik. Besucher stellen sich am Touchscreen den Fragen des Meistertrainers. Ab 8 richtigen Antworten gibt der Automat über ein Relais einen Preis aus, sonst einen Trostpreis.

Die Oberfläche ist als **Abfahrtstafel im Fallblatt-Stil** gestaltet und für einen **4K-Fernseher im Hochformat (2160 × 3840)** mit Touch direkt am Bildschirm ausgelegt. Sie läuft komplett offline im Browser.

```
Besucher tippt ein Gleis an → 10 Fragen → Ankunft
  ≥ 8 richtig → „Preis abholen“      → Gewinn-Relais  → Snack fällt
  < 8 richtig → „Zurück zum Start“   → Trostpreis-Relais
  danach nach 3 s automatisch zurück zur Startseite
```

---

## Inhalt

1. [Einrichten am Automaten](#1-einrichten-am-automaten)
2. [Umstieg vom alten Stand (`site/`)](#2-umstieg-vom-alten-stand-site)
3. [Updates einspielen](#3-updates-einspielen)
4. [Konfiguration](#4-konfiguration)
5. [Funktionsweise für Besucher](#5-funktionsweise-für-besucher)
6. [Bedienung durch das Standpersonal](#6-bedienung-durch-das-standpersonal)
7. [Relais](#7-relais)
8. [Fragen, Bilder und Texte ändern](#8-fragen-bilder-und-texte-ändern)
9. [Entwicklung](#9-entwicklung)
10. [Aufbau und Technik](#10-aufbau-und-technik)
11. [Fehlerbehebung](#11-fehlerbehebung)

---

## 1. Einrichten am Automaten

### Hardware

| Teil | Rolle |
|---|---|
| 4K-Fernseher, hochkant, mit Touch | Anzeige und Bedienung |
| Intel NUC (Windows) | liefert die Seiten aus und zeigt sie in Chrome im Kiosk-Modus |
| Microcontroller mit Relais im lokalen Netz | gibt die Preise aus, angesteuert per HTTP-POST |

Internet wird im Betrieb nicht gebraucht.

### Voraussetzungen auf dem NUC

- **Git**, um das Repository zu holen und zu aktualisieren.
- **Google Chrome**.
- **Node.js**, aber nur für das mitgelieferte Startskript `scripts\kiosk.cmd` (es startet einen kleinen statischen Server). Wer stattdessen nginx oder Apache nutzt, braucht kein Node.

Ein Build ist auf dem NUC **nicht** nötig. Das fertige Ergebnis liegt in `dist/` im Repository.

### Schritt für Schritt

```bat
:: 1. Repository holen
git clone https://github.com/Moritz-Staat/Snackautomat.git
cd Snackautomat

:: 2. Lokale Konfiguration anlegen und PINs + Relais-IP eintragen
copy config.local.example.js config.local.js
notepad config.local.js

:: 3. Automat starten (Server + Chrome im Kiosk-Modus)
scripts\kiosk.cmd
```

**Beenden:** `Alt` + `F4` im Chrome-Fenster. Im Kiosk-Modus gibt es kein Fensterkreuz. Der Server beendet sich mit. Einen anderen Port wählt man mit `scripts\kiosk.cmd 9000`.

### Alternative: eigener Webserver

Wer nginx oder Apache verwendet:

- **Docroot ist das Repo-Root**, nicht `dist/`.
- **Einstiegsseite ist `/dist/Automat.html`.**

Die Medien (`Images/`, `QuizImages/`, `fonts/`) liegen neben `dist/` und werden über root-absolute Pfade wie `/Images/…` geladen. Chrome dann mit denselben Flags wie in `scripts\kiosk.cmd` auf diese URL starten.

### Windows vorbereiten

1. **Hochformat einstellen:** Einstellungen → System → Anzeige → *Anzeigeausrichtung: Hochformat*.
2. **Energiesparen, Bildschirmabschaltung und den Windows-Bildschirmschoner abschalten.** Der Automat bringt einen eigenen Bildschirmschoner mit.
3. **Skalierung:** frei wählbar (100 % oder 200 %). Das Layout richtet sich nach der Bildschirmfläche und sieht in beiden Fällen gleich aus.
4. **Autostart (empfohlen):** Eine Verknüpfung auf `scripts\kiosk.cmd` in den Autostart-Ordner legen (`Win`+`R` → `shell:startup`). Dann kommt der Automat nach einem Stromausfall von selbst wieder.

### Warum diese Chrome-Flags

| Flag in `kiosk.cmd` | Wofür |
|---|---|
| `--kiosk` | Vollbild ohne Adress- und Tableiste |
| `--autoplay-policy=no-user-gesture-required` | Der Bildschirmschoner startet ohne vorherige Berührung |
| `--overscroll-history-navigation=0` | Wischen nach rechts navigiert nicht mitten im Quiz zurück |
| `--disable-pinch` | Besucher können die Seite nicht zoomen |
| `--disable-session-crashed-bubble` | Nach einem Stromausfall erscheint kein Dialog „Seiten wiederherstellen?“ |
| `--user-data-dir=%LocalAppData%\SnackautomatKiosk` | Eigenes Profil: Die Zählerstände liegen getrennt vom Alltagsbrowser |

Unter Linux geht dasselbe mit:

```bash
node scripts/serve.mjs --port 8080 &
google-chrome --kiosk --autoplay-policy=no-user-gesture-required \
  --overscroll-history-navigation=0 --disable-pinch --noerrdialogs \
  --disable-infobars --disable-session-crashed-bubble \
  --user-data-dir=/var/lib/snackautomat-kiosk \
  http://127.0.0.1:8080/dist/Automat.html
```

### Abnahme am Gerät

- [ ] Die Startseite füllt den Bildschirm hochkant aus, nichts ist abgeschnitten.
- [ ] Die Bahnhofsuhr zeigt die richtige Uhrzeit.
- [ ] Ein Gleis antippen: Die Zeile klappt auf ABFAHRT, und das Quiz startet.
- [ ] Mit einer Gewinnrunde und einer Verliererrunde lösen die richtigen Relais aus (siehe [Relais](#7-relais)).
- [ ] Nach 20 s ohne Berührung startet auf der Startseite der Bildschirmschoner, eine Berührung beendet ihn.
- [ ] Logo unten rechts antippen, dann Statistik-PIN eingeben: Die Statistik erscheint.
- [ ] Rechner hart ausschalten und wieder einschalten: Der Automat kommt ohne Dialog zurück.

---

## 2. Umstieg vom alten Stand (`site/`)

Bis August 2026 lief der Automat als reines HTML/JS aus dem Ordner `site/`. Der aktuelle Stand ist mit TypeScript und Vite gebaut, und an drei Stellen hat sich etwas geändert:

| | Alt | Neu |
|---|---|---|
| Einstiegsseite | `site/Automat.html` | `/dist/Automat.html` (Docroot = Repo-Root) |
| Konfiguration | `site/config.js` | `config.local.js` im Repo-Root |
| Start | Webserver und Browser von Hand | `scripts\kiosk.cmd` |

**Vorgehen auf dem NUC:**

1. **Zählerstände sichern:** Im alten Stand die Statistik öffnen (Logo, Statistik-PIN) und die Werte notieren. Das neue Kiosk-Profil startet mit leeren Zählern.
2. Werte aus `site/config.js` (PINs, `relais_ip`, ggf. Timer) in eine neue `config.local.js` übertragen. Die Struktur ist dieselbe, Vorlage ist `config.local.example.js`.
3. `git pull` ausführen.
4. Webserver bzw. Kiosk-Verknüpfung auf `/dist/Automat.html` umstellen oder gleich `scripts\kiosk.cmd` verwenden.
5. Die [Abnahme am Gerät](#abnahme-am-gerät) durchgehen.

Die alte `site/config.js` wird nicht mehr gelesen und kann danach gelöscht werden.

---

## 3. Updates einspielen

```bat
cd Snackautomat
git pull
```

Danach Chrome neu starten (`Alt`+`F4`, dann `scripts\kiosk.cmd`). Ein Build ist nicht nötig. `config.local.js` bleibt beim Update unberührt, weil die Datei nicht im Repository liegt.

---

## 4. Konfiguration

Die Konfiguration hat zwei Ebenen:

| Ebene | Ort | Im Repo? |
|---|---|---|
| Voreinstellungen | `src/lib/config.ts`, fest einkompiliert | ja |
| Lokale Werte (PINs, Relais-IP, Anpassungen) | `config.local.js` im Repo-Root | **nein** (`.gitignore`) |

`config.local.js` wird bei jedem Seitenaufruf gelesen. Änderungen wirken also **ohne Build**, nach einem Neuladen bzw. Neustart von Chrome. Jedes Feld ist einzeln optional, was fehlt, behält seine Voreinstellung.

| Feld | Bedeutung | Voreinstellung |
|---|---|---|
| `pins.kontakt` | PIN für den Kontaktpreis | leer (Funktion aus) |
| `pins.reset` | PIN zum Zurücksetzen der Zähler | leer (Funktion aus) |
| `pins.statistik` | PIN für die Statistik | leer (Funktion aus) |
| `min_richtig` | Richtige Antworten für einen Gewinn | `8` |
| `frage_timer.level1` / `level2` / `level3` | Sekunden pro Frage | `15` / `25` / `40` |
| `relais_ip` | Adresse des Relais-Controllers, z. B. `http://192.168.0.120` | leer (keine Relais-Aufrufe) |
| `relais_endpunkte.*` | Pfade der einzelnen Relais | siehe [Relais](#7-relais) |

**Fehlt `config.local.js` ganz,** läuft das Quiz trotzdem. Dann sind nur die Admin-PINs wirkungslos, und es werden keine Relais ausgelöst. Echte PINs gehören ausschließlich in die lokale Datei, nie ins Repository und nie in diese README.

---

## 5. Funktionsweise für Besucher

Gestaltet ist alles als Abfahrtstafel: Die Levels sind Gleise, eine Quizrunde ist eine Fahrt mit 10 Halten, das Ergebnis ist die Ankunft.

### Startseite

- **Kopf:** „CHRIS-O-MAT“ in Fallblättern. Alle 10 s klappen die Blätter einmal durch, um Blicke zu fangen.
- **Uhr und Ruf:** Darunter eine Bahnhofsuhr mit der echten Uhrzeit und der Lauftext „Stelle dich den Fragen des Meistertrainers!“.
- **Gleise:** Drei Gleiszeilen, über die ganze Breite antippbar. Jede zeigt Gleisnummer, Ziel und Lok, dazu „10 Fragen · ab 8 richtig“ und den Takt in Sekunden pro Frage (beides aus der Konfiguration).
  - Gleis 1: Anfänger
  - Gleis 2: Fortgeschritten
  - Gleis 3: Profi
- **Fuß:** Lauftext „Gewinne coole Preise!“, Füllstandslampe links, WuS-Logo rechts.

Tippt man ein Gleis an, klappt die Zeile auf **ABFAHRT**, die Lok fährt aus, und die Level-Seite blendet über.

### Quiz

- **Kopf:** Die gewählte Tafelzeile mit Gleis, Ziel und Takt. Darunter liegt das eigentliche Quiz.
- **Linienband:** 10 Halte, der aktuelle ist gelb umrandet. Jeder beantwortete Halt behält sein Ergebnis: grün mit Haken oder stumpf mit gelbem Kreuz.
- **Abfahrtsuhr:** Die Zeit pro Frage läuft als Scheibe mit Zeiger ab und wechselt gegen Ende von Grün auf Gelb. Läuft sie ab, zählt die Frage als falsch.
- **Zähler:** `01/10` als Fallblatt.
- **Frage:** Fragebild (falls vorhanden), Frage und vier Antworten mit den Tasten **A–D**. Die Antworten klappen nacheinander herein.
- **Nach dem Antippen** bleibt die Auflösung 1,5 s stehen, dann folgt die nächste Frage:
  - Richtig gewählt: grünes Blatt mit Haken.
  - Falsch gewählt: stumpfes Blatt mit gelbem Kreuz. Die richtige Antwort wird zusätzlich grün gezeigt.

Pro Runde werden 10 Fragen zufällig aus dem Pool des Levels gezogen (43 / 55 / 45 Fragen).

### Ankunft

1. Die Lok des Levels fährt ein, darunter steht die Fahrtbilanz mit allen 10 Halten.
2. Das Ergebnis erscheint als Tafelzeile, z. B. **„08 VON 10 RICHTIG“**, und zählt von 00 hoch. Bei einem Gewinn sind die Ziffern grün, und es fällt Konfetti.
3. Dazu kommt der Stufentext des Levels (siehe [Fragen, Bilder und Texte ändern](#8-fragen-bilder-und-texte-ändern)).
4. Die Taste heißt **„Preis abholen“** (Gewinn) oder **„Zurück zum Start“**.
5. Nach dem Antippen erscheint an derselben Stelle „Dein Preis wird ausgegeben.“ bzw. „Dein Trostpreis wird ausgegeben.“ mit einem Countdown. Das Relais löst aus, nach 3 s geht es zurück zur Startseite.

### Inaktivität

| Wo | Nach | Was passiert |
|---|---|---|
| Startseite | 20 s | Ein zufälliges der drei Bildschirmschoner-Videos läuft einmal durch. Eine Berührung beendet es sofort. |
| Quiz | 20 s | Das Quiz wird abgedunkelt, „Noch da? Tippe irgendwo, um weiterzuspielen.“ erscheint. |
| Quiz | 30 s | Rücksprung zur Startseite. |

Jede Berührung setzt die Zeiten zurück. Am Finger erscheint dabei sofort ein kurzer Signalring als Rückmeldung.

---

## 6. Bedienung durch das Standpersonal

### PIN-Feld

Das **WuS-Logo unten rechts** antippen. Es öffnet sich ein Ziffernblock.

| PIN | Wirkung | Wo |
|---|---|---|
| Kontakt-PIN | Zählt eine Kontaktanfrage und löst das Trostpreis-Relais aus | Startseite und Quiz |
| Reset-PIN | Setzt alle Zähler auf 0 und löst das Reset-Relais aus | Startseite |
| Statistik-PIN | Zeigt die Statistik | Startseite |

Bei einer falschen PIN wird das Feld gelb umrandet und rüttelt, danach schließt sich der Ziffernblock.

### Statistik

| Zeile | Zähler (`localStorage`) |
|---|---|
| Level 1 – Anfänger (Gewinne) | `level1win` |
| Level 2 – Fortgeschritten (Gewinne) | `level2win` |
| Level 3 – Profi (Gewinne) | `level3win` |
| Trostpreise | `loses` |
| Kontaktanfragen | `kontaktdaten` |

Die Zähler liegen im Browserprofil des Kiosks. Sie überstehen Neustarts und `git pull`, nicht aber das Löschen des Profils oder die Reset-PIN.

### Füllstandslampe (Nachfüllen)

Die Lampe unten links auf der Startseite zeigt anhand der Zähler, wann der Automat aufgefüllt werden sollte. Rot wird zuerst geprüft:

| Farbe | Bedingung |
|---|---|
| Rot | Level 1 > 25, Level 2 > 35, Level 3 > 25, Trostpreise > 18 **oder** Kontakt > 10 |
| Orange | Level 1 > 15, Level 2 > 25, Level 3 > 15, Trostpreise > 13 **oder** Kontakt > 5 |
| Grün | sonst |

Nach dem Auffüllen die Reset-PIN eingeben.

---

## 7. Relais

Jeder Relais-Aufruf ist ein HTTP-POST an den Microcontroller, ohne auf eine Antwort zu warten:

```
POST <relais_ip><endpunkt>?param=1
```

| Auslöser | Endpunkt (Voreinstellung) |
|---|---|
| Gewinn Level 1 | `/Hyper` |
| Gewinn Level 2 | `/Beginner` |
| Gewinn Level 3 | `/Register` |
| Trostpreis und Kontakt-PIN | `/Expert` |
| Reset-PIN | `/Start` |

Ist der Controller nicht erreichbar oder `relais_ip` leer, läuft der Automat unverändert weiter. Jede Runde löst genau einmal aus. Zum Testen einzelner Relais von Hand gibt es `Backend/request.html`.

---

## 8. Fragen, Bilder und Texte ändern

| Was | Wo |
|---|---|
| Fragen, Antworten, Bilder je Level | `src/data/level1.ts`, `level2.ts`, `level3.ts` |
| Stufentexte auf dem Ergebnisbildschirm | jeweils `tiers` am Ende derselben Dateien |
| Fragebilder | Ordner `QuizImages/` |

Eine Frage sieht so aus:

```ts
{
  question: "Wer kann eine ferngestellte Weiche bedienen?",
  answers: [
    { text: "Fahrdienstleiter", correct: true },
    { text: "Bezirksleiter", correct: false },
    { text: "Triebfahrzeugführer", correct: false },
    { text: "Zugbegleiter", correct: false },
  ],
  image: "SunsetTracksCrop.jpg",   // optional, Dateiname in QuizImages/
},
```

**Wichtig:**

- **Exakte Schreibweise:** Dateinamen müssen in Groß- und Kleinschreibung exakt stimmen. Unter Windows fällt ein Fehler nicht auf, auf einem Linux-Server fehlt das Bild dann.
- **Bildgröße:** Fragebilder möglichst auf ca. 1600 px Breite verkleinern. Mehrere MB große Kamerafotos bremsen den Seitenaufbau.
- **Bauen:** Nach jeder Änderung `npm run build` ausführen und `dist/` mitcommitten (siehe [Entwicklung](#9-entwicklung)).

---

## 9. Entwicklung

```bash
npm install
npm run dev        # Dev-Server mit Hot Reload      -> http://localhost:5173/Automat.html
npm run typecheck  # nur Typprüfung
npm run build      # Typprüfung + Build             -> schreibt dist/
npm run serve      # Produktionsaufbau testen       -> http://127.0.0.1:8080/dist/Automat.html
```

> **Nach jeder Änderung an `src/`:** `npm run build` ausführen und das aktualisierte `dist/` **mitcommitten**. Der Automat liefert nur `dist/` aus. Ohne neuen Build läuft dort weiter der alte Stand.

- **Dev-Server:** `npm run dev` liefert die Seiten direkt unter `/` und blendet die Medien aus dem Repo-Root ein.
- **Produktionsaufbau:** `npm run serve` prüft den echten Pfad unter `/dist/`. Das Skript braucht kein `npm install`.
- **Rücksprung:** Den Unterschied der beiden Pfade kennt der Code über `import.meta.env.BASE_URL`, deshalb stimmt der Rücksprung zur Startseite in beiden Fällen.

**Auf einem zweiten Monitor testen:**

```bash
npm run serve -- --host 0.0.0.0 --port 8080
# vom Kiosk-Rechner aus: http://<IP-des-Entwicklungsrechners>:8080/dist/Automat.html
```

In den Chrome-Entwicklertools lässt sich die Zielauflösung mit einem eigenen Gerät „2160 × 3840“ nachstellen.

**Design:**

- `DESIGN.md` beschreibt Farben, Schrift, Komponenten und Bewegungsregeln.
- `PRODUCT.md` enthält Produktfakten und Leitplanken.
- Unter `.impeccable/` liegen der Richtungsvertrag und die Entscheidungsdaten des Redesigns.

**Zählerstände** zwischen Testläufen zurücksetzen: Reset-PIN oder in der Chrome-Konsole `localStorage.clear()`.

---

## 10. Aufbau und Technik

```
Snackautomat/
├── src/
│   ├── lib/                     # Gemeinsame Logik aller Seiten
│   │   ├── quiz-core.ts         # Quiz: Ziehen, Fragen, Uhr, Auflösung, Ankunft
│   │   ├── level-page.ts        # Level-Seite: Relais, Zähler, Rücksprung, PIN
│   │   ├── flap.ts              # Fallblätter mit gemeinsamer Taktuhr
│   │   ├── clock.ts             # Bahnhofsuhr
│   │   ├── ripple.ts            # Berührungsring
│   │   ├── confetti.ts          # Konfetti bei Gewinn
│   │   ├── config.ts            # Voreinstellungen + config.local.js
│   │   ├── relay.ts, storage.ts, pin-modal.ts, dom.ts, types.ts
│   ├── data/level1..3.ts        # Fragenkataloge und Stufentexte
│   └── pages/                   # HTML-Seiten, Einstiegsskripte, CSS
│       ├── Automat.html / automat.ts / automat.css
│       ├── styles/base.css      # Tokens, Schrift, Fallblatt, Modals, Übergänge
│       ├── styles/level.css, styles/quiz.css
│       └── Einzelseiten/level1..3.html + QuizLevel1..3/
├── dist/                        # Build-Ergebnis, wird ausgeliefert (im Repo)
├── Images/  QuizImages/  fonts/ # Medien, außerhalb von dist/
├── scripts/kiosk.cmd, serve.mjs # Kiosk-Start und statischer Server
├── config.local.example.js      # Vorlage für config.local.js
├── DESIGN.md  PRODUCT.md
└── Backend/, hilfsdateien/      # Testseiten, nicht Teil des Builds
```

### Seiten und Kommunikation

```
Automat.html  ──Gleis antippen──▶  level1..3.html  (Kopfzeile, Relais, Zähler)
                                     └── iframe: QuizLevel1..3/index.html (Quiz)
                                            │
                                            └─ postMessage("prizeCollected" | "quizFailed")
                                               an die eigene Origin; die Level-Seite prüft
                                               Origin und Inhalt, löst Relais aus, springt nach 3 s zurück
```

Seitenwechsel laufen über **Cross-Document View Transitions** (Chrome): Die alte Seite blendet aus, die neue ein.

### Skalierung auf dem 4K-Panel

Alle Maße sind in `rem` angegeben. Die Wurzelschriftgröße hängt an der Bildschirmfläche, auf einem Referenzraster von 1080 × 1920 mit 1 rem = 20 px:

```css
html { font-size: min(calc(100vw / 54), calc(100vh / 96)); }
```

- Bei 2160 × 3840 ist 1 rem = 40 px. Mit Windows-Skalierung 200 % (1080 × 1920) ist es 20 px, das Bild ist identisch.
- Auf einem quer stehenden Testmonitor begrenzt die Höhe, sodass nichts überläuft.
- Im Quiz-iframe gilt `min(100vw / 50.2, 100vh / 72)`, damit ein rem dort genauso groß ist wie außen.

### Leistung

Auf dem NUC soll in 4K nichts ruckeln:

- Bewegungen laufen über `transform` und `opacity`.
- Die Fallblätter teilen sich eine einzige Animationsschleife.
- Statt Weichzeichner wird abgedunkelt.
- Die Systemeinstellung „Bewegung reduzieren“ wird beachtet.

### Warum Medien nicht gebündelt werden

`Images/`, `QuizImages/` und `fonts/` bleiben außerhalb von `dist/`. Allein die Bildschirmschoner-Videos wiegen rund 123 MB. Würde Vite sie kopieren, verdoppelte jeder Build die Repo-Größe. Daraus folgt die Anforderung: **Docroot ist das Repo-Root.**

---

## 11. Fehlerbehebung

| Symptom | Ursache | Lösung |
|---|---|---|
| Fragen erscheinen, aber kein Relais schaltet | `relais_ip` leer oder Controller nicht erreichbar | `config.local.js` prüfen, Controller per `Backend/request.html` testen |
| Logo antippen bewirkt nichts | PINs nicht gesetzt (keine `config.local.js`) | `config.local.js` anlegen |
| Seite leer oder „nicht gefunden“ | Docroot zeigt auf `dist/` statt aufs Repo-Root, oder falsche URL | Docroot = Repo-Root, URL `/dist/Automat.html` |
| Bilder, Schrift oder Videos fehlen (nur unter Linux) | Groß-/Kleinschreibung im Dateinamen | Pfad exakt wie im Ordner schreiben, neu bauen |
| Änderung am Code wirkt nicht | `dist/` nicht neu gebaut oder nicht committet | `npm run build`, `dist/` committen, `git pull` am NUC |
| Bildschirmschoner startet nicht | Chrome ohne Autoplay-Flag gestartet | über `scripts\kiosk.cmd` starten |
| `kiosk.cmd`: „Chrome nicht gefunden“ / „node nicht im PATH“ | Chrome bzw. Node fehlt oder liegt anders | installieren oder Pfad in `scripts\kiosk.cmd` eintragen |
| Zählerstände plötzlich 0 | anderes Browserprofil (z. B. Chrome ohne `kiosk.cmd` gestartet) oder Reset-PIN | immer über `kiosk.cmd` starten, das nutzt das feste Kiosk-Profil |

---

### Test- und Hilfsdateien

| Datei | Zweck |
|---|---|
| `Backend/request.html` | Einzelne Relais von Hand auslösen |
| `hilfsdateien/TESTH/`, `hilfsdateien/Testseite.html` | Alte Testseiten, nicht Teil des Builds |

*Dokumentation zuletzt aktualisiert: Oktober 2026*
