---
name: Chris-O-Mat
description: Quiz-Snackautomat als Fallblatt-Abfahrtstafel in WuS-Dunkelgrün, für ein 4K-Touchpanel im Hochformat.
colors:
  housing: "#0b3d2a"
  housing-deep: "#062619"
  housing-edge: "#135238"
  flap: "#0f4a33"
  flap-lower: "#0c432e"
  flap-gap: "#03140c"
  flap-dull: "#22362d"
  ink: "#cde4c4"
  ink-soft: "#9fc3a4"
  ink-dim: "#6f9a7c"
  green: "#62b55a"
  green-deep: "#51a175"
  signal: "#f2c230"
  signal-ink: "#0b3d2a"
typography:
  display:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: "4.4rem"
    fontWeight: 700
    lineHeight: 1
  headline:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: "2.9rem"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: "2.3rem"
    fontWeight: 700
    lineHeight: 1.12
  body:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.12
  label:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 600
    letterSpacing: "0.18em"
  flap:
    fontFamily: "Rajdhani, sans-serif"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "tnum"
rounded:
  flap: "0.09em"
  key: "0.6rem"
  tile: "0.8rem"
  row: "0.9rem"
  cta: "1rem"
  frame: "1.1rem"
  housing: "1.6rem"
  round: "50%"
spacing:
  bezel: "0.7rem"
  inset: "1.2rem"
  gap-s: "0.9rem"
  gap-m: "1.2rem"
  gap-l: "1.4rem"
  panel-x: "2rem"
  panel-top: "2.2rem"
components:
  housing:
    backgroundColor: "{colors.housing}"
    rounded: "{rounded.housing}"
    padding: "0.7rem"
  housing-panel:
    backgroundColor: "{colors.housing-deep}"
  flap:
    backgroundColor: "{colors.flap}"
    textColor: "{colors.ink}"
    typography: "{typography.flap}"
    rounded: "{rounded.flap}"
    width: "0.74em"
    height: "1.12em"
  gleis-tile:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.tile}"
    size: "6.4rem"
  answer-row:
    backgroundColor: "{colors.flap}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.row}"
    padding: "0.7rem 1.1rem 0.7rem 0.7rem"
    height: "5.8rem"
  answer-key:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.key}"
    size: "4.4rem"
  answer-row-correct:
    backgroundColor: "{colors.green}"
    textColor: "{colors.signal-ink}"
  answer-row-hint:
    backgroundColor: "{colors.green}"
    textColor: "{colors.signal-ink}"
  answer-row-wrong:
    backgroundColor: "{colors.flap-dull}"
    textColor: "{colors.ink-dim}"
  answer-row-receded:
    backgroundColor: "{colors.flap}"
    textColor: "{colors.ink-dim}"
  cta-prize:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.cta}"
    width: "44rem"
    height: "8.6rem"
  cta-home:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.signal-ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.cta}"
    width: "44rem"
    height: "8.6rem"
  home-button:
    backgroundColor: "{colors.housing}"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    padding: "0 1.8rem 0 1.4rem"
    height: "5.6rem"
  stop:
    backgroundColor: "{colors.housing-deep}"
    rounded: "{rounded.round}"
    size: "2.6rem"
  stop-right:
    backgroundColor: "{colors.green}"
    textColor: "{colors.signal-ink}"
  stop-wrong:
    backgroundColor: "{colors.flap-dull}"
    textColor: "{colors.signal}"
  ticker-band:
    backgroundColor: "{colors.flap-gap}"
    textColor: "{colors.signal}"
    typography: "{typography.title}"
    rounded: "{rounded.key}"
    height: "4.8rem"
  numpad-key:
    backgroundColor: "{colors.flap}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    height: "5.2rem"
  numpad-submit:
    backgroundColor: "{colors.green}"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.tile}"
    height: "5.2rem"
  logo-plate:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.key}"
    padding: "0.55rem 0.8rem"
---

# Design System: Chris-O-Mat

## Overview

**Creative North Star: "Die Abfahrtstafel"**

Der Automat ist ein Fallblatt-Zugzielanzeiger. Die ganze Fläche ist Tafelgehäuse in WuS-Dunkelgrün, jeder Inhalt sitzt auf einem Blatt oder in einer Tafelzeile. Levels sind Gleise, eine Quizrunde ist eine Fahrt mit zehn Halten, das Ergebnis ist die Ankunft. Die Welt borgt ihre Mittel aus dem Bahnhof: Fallblätter mit Mittelspalt, Bahnhofsuhr, Linienband, Lauftext, Gleisnummer in Signalgelb, die Lok als Zugart-Piktogramm.

Die Tafel ist dicht und ruhig zugleich: wenige feste Schriftstufen, Rang über die Ebene (Gehäuse, eingesetzte Tafel, Blatt) statt über Größe. Bewegung ist mechanisch, nicht weich: Zeichen klappen in Schritten an einer gemeinsamen Taktuhr, Zahlen wechseln als Ereignis. Jede Berührung bekommt sofort einen Signalring am Finger.

Verweigert wird der Messe-Quiz-Standard aus weißer Fläche, bunten Kacheln und Fortschrittsbalken. Rot gibt es nicht; Fehler sind stumpfe Blätter mit gelbem Kreuz.

**Key Characteristics:**
- Totale Farbfläche in Dunkelgrün, kein Weiß, kein Rot.
- Fallblätter mit Mittelspalt als Grundbaustein für Titel, Ziele, Zähler und Ergebniszeile.
- Doppelter Rahmen: Außenschale mit eingesetzter, vertiefter Tafel.
- Eine Taktuhr (70 ms) für alles, was klappt; Bewegung nur über `transform` und `opacity`.
- Alles in rem auf einem Referenzraster von 1080 × 1920, das am kleineren Viewport-Maß hängt.

## Colors

Eine Familie dunkler, leicht kühler Grüntöne als Gehäuse, Mint als Tafelschrift, ein einziges Hauptgrün für „richtig“ und Signalgelb als einziger warmer Akzent.

### Primary
- **Hauptgrün** (`green`): richtig gewählte und gezeigte Antwort, erreichte Halte im Linienband, Takt-Zahl, Bestätigungstasten im Modal, voller Ring der Abfahrtsuhr. Schrift darauf ist immer `signal-ink`.
- **Academy-Grün** (`green-deep`): Nebenton der Markenpalette; im Build nur in den Konfettifarben, nicht als Fläche.

### Secondary
- **Signalgelb** (`signal`): Gleisnummern, Antworttasten A–D, Preis-Taste, Lauftexte, Fokusring, Berührungsring, Sekundenzeiger der Bahnhofsuhr, Kreuz bei „falsch“, ablaufender Countdown. Signalgelb trägt Handlung und Signal, nie Fläche.
- **Signal-Dunkelgrün** (`signal-ink`): Schrift und Zeichen auf Signalgelb, Hauptgrün und Mint. Identisch mit `housing`.

### Neutral
- **Gehäusegrün** (`housing`): Außenschale, Tafelrahmen der Gleise, Kopfzeile der Fahrt, Modalfläche.
- **Tafeltiefe** (`housing-deep`): eingesetzte Tafel, Seitengrund, Halte im Ruhezustand, PIN-Feld.
- **Gehäusekante** (`housing-edge`): Druckzustand einer Gleiszeile, Rand der Bahnhofsuhr.
- **Blatt oben / unten** (`flap` / `flap-lower`): die beiden Hälften eines Fallblatts, Antwortzeilen, Linienband, Ziffernblock.
- **Spaltgrund** (`flap-gap`): Mittelspalt der Blätter, Fugen zwischen Tafelzeilen, Grund der Lauftexte und der Füllstandslampe, Taste einer zurückgetretenen Antwort.
- **Stumpfes Blatt** (`flap-dull`): falsche Antwort und verfehlter Halt; entsättigt, damit „falsch“ ohne Rot lesbar bleibt.
- **Mint** (`ink`): Tafelschrift, Zifferblatt der Uhren, Herstellerschild, „Zurück zum Start“-Taste.
- **Mint gedämpft** (`ink-soft`) und **Mint matt** (`ink-dim`): Nebentext (Zuglauf, Rückzähltext), Spaltenköpfe, Takt-Einheit, zurückgetretene Antworten.

### Named Rules
**The Kein-Rot Rule.** Rot ist keine Farbe dieser Tafel. „Falsch“, PIN-Fehler und ablaufende Zeit werden mit `flap-dull`, `signal` und Bewegung gezeigt. (Die rote Profi-Lok ist eine Level-Illustration, kein Signal.)

**The Dunkle-Schrift Rule.** Auf Hauptgrün, Signalgelb und Mint steht Schrift immer in `signal-ink`, nie in Weiß.

**The Doppelte-Kodierung Rule.** Richtig und falsch tragen immer Form und Farbe: Haken bzw. Kreuz als SVG, dazu Blattfarbe und Bewegung (Puls bzw. Rucken).

## Typography

**Display Font:** Rajdhani (mit sans-serif)
**Body Font:** Rajdhani (mit sans-serif)

**Character:** Eine einzige, verbindliche Tafelschrift, selbst gehostet aus `/fonts` in den Schnitten 400, 500, 600 und 700 mit `font-display: block`. Ihre technischen, schmalen Formen tragen sowohl die Fallblätter als auch die Fragetexte.

### Hierarchy
- **Display** (700, `--t-display` 4.4rem, 1): Rückfrage bei Inaktivität („Noch da?“).
- **Headline** (700, `--t-xl` 2.9rem, 1.15): Ergebnistext, Preis- und Heimtaste, Ausgabemeldung, Statistik-Titel.
- **Title** (700, `--t-l` 2.3rem, 1.12): Fragetext, Lauftexte, Antworttasten-Buchstaben, Fahrtzähler; lange Fragen (über 110 Zeichen) auf 1.95rem.
- **Body** (500–600, `--t-m` 1.75rem, 1.12): Antworttexte, Zuglauf, Takt-Einheit, Modaltexte.
- **Label** (600, `--t-s` 1.05rem, 0.18em, Versalien): nur Spaltenköpfe über ausgerichteten Tafelspalten (GLEIS · ZIEL · TAKT).
- **Fallblatt** (700, tabellarische Ziffern, Zeilenhöhe 1): Größe kommt vom Elternelement, Blattmaße in em (0.74 × 1.12em). Titelzeile 5.1rem auf volle Innenbreite, Gleisziel 2.93rem bzw. 2.05rem für 15 Blätter, Ergebniszeile 3.15rem.

### Named Rules
**The Fünf-Stufen Rule.** Fließende Schrift nutzt nur die fünf Stufen `--t-display` bis `--t-s`. Abweichende Größen gibt es nur für Fallblattzeilen, deren Blattzahl die Breite bestimmt.

**The Versalien-Blatt Rule.** Fallblätter zeigen nur Versalien, Ziffern und `-/·` aus dem Tafelalphabet; kürzere Texte werden mit leeren Blättern aufgefüllt, wie auf einer echten Tafel.

## Layout

Zielgerät ist ein 4K-Panel hochkant (2160 × 3840). Entworfen wird auf einem Referenzraster von 1080 × 1920 mit 1rem = 20px, also 54 × 96rem: `html { font-size: min(100vw / 54, 100vh / 96) }`. Dieselbe Komposition passt dadurch auf das Panel (1rem = 40px), bei Windows-Skalierung (1080 × 1920) und auf einem quer stehenden Testmonitor (Höhe begrenzt). Alle Maße sind rem; px gibt es nicht.

Das Quiz läuft im iframe der Level-Seite. Dessen Viewport ist etwa 50 × 72rem der äußeren Seite; mit `min(100vw / 50.2, 100vh / 72)` ist ein rem innen so groß wie außen, beide Ebenen lesen sich als eine Tafel.

Jede Seite ist ein Gehäuse mit 1.2rem Abstand zum Rand und darin eine Grid-Tafel (Startseite fünf Zeilen, Level-Seite Kopf / Quiz / Fuß). Die Gleiszeilen teilen den Restraum gleich (`1fr`), mit einem Spaltenraster 6.4rem / Rest / auto, das Spaltenköpfe und Zeilen teilen. Abstände folgen 0.9 / 1.2 / 1.4rem innen und 1.8–2.4rem zwischen Bändern. Unten rechts bleibt Platz für das Herstellerschild.

## Elevation & Depth

Tiefe entsteht als Hardware: eine Außenschale mit oberem Lichtsaum und unterer Schattenkante, darin eine eingesetzte, nach innen verschattete Tafel. Blätter liegen mit kleinem, weichem Schatten darauf. Vertiefungen (Lauftextbänder, Lampe, PIN-Feld) sind Innenschatten. Modals dunkeln den Hintergrund ab, statt ihn weichzuzeichnen.

### Shadow Vocabulary
- **Gehäuse** (`--shadow`: `0 0.35rem 0.9rem rgba(1, 14, 8, 0.55)`): Außenschale, Preis-Taste.
- **Blatt** (`--shadow-flap`: `0 0.12rem 0.25rem rgba(1, 14, 8, 0.6)`): Fallblätter, Gleiskachel, Antwortzeilen, Ziffernblock, Herstellerschild.
- **Lichtsaum** (`inset 0 0.08rem 0 rgba(205, 228, 196, 0.1–0.14)`): Oberkante jeder erhabenen Fläche.
- **Vertiefung** (`inset 0 0.15–0.25rem 0.35–0.6rem rgba(0, 0, 0, 0.45–0.5)`): eingesetzte Tafel, Lauftextband, Lampe, PIN-Feld.
- **Fuge** (`inset 0 0.22rem 0 var(--flap-gap)`): Trennung zwischen Tafelzeilen statt schwebender Karten.

### Named Rules
**The Abdunkeln-statt-Weichzeichnen Rule.** Hinter Modals und bei Inaktivität wird die Seite über `opacity` (0.28 bzw. 0.15) und leichte Skalierung zurückgenommen. Großflächige `filter: blur()` und `backdrop-filter` sind in 4K auf dem NUC verboten.

## Shapes

Weiche Rechtecke in fester Abstufung, nach Größe geordnet: Blatt 0.09em, Taste 0.6rem, Kachel 0.8rem, Zeile 0.9rem, Preis-Taste 1rem, Tafelrahmen 1.1rem, Bildrahmen 1.3rem, Gehäuse 1.6rem. Innere Radien eines Rahmens sind konzentrisch (`außen − Rahmenbreite`). Kreise nur für Halte, Lampe und Uhren. Das wiederkehrende Motiv ist der waagerechte Mittelspalt: als Verlauf durch Fallblätter und Zifferntasten, als Scharniermarken an den Rändern der Antwortzeilen.

## Components

### Gehäuse (Housing)
Doppelter Rahmen aus Außenschale (`housing`, 1.6rem Radius, 0.7rem Rand, Lichtsaum oben) und eingesetzter Tafel (`housing-deep`, konzentrischer Radius, Innenschatten). Trägt jede Seite und den Bildrahmen der Frage.

### Fallblatt (Flap)
Ein Zeichen pro Blatt, 0.74 × 1.12em, Hälften `flap` / `flap-lower` mit 1,6 % Spalt in `flap-gap`. Beim Wechsel fällt die obere Hälfte als ein einziges `scaleY`-transform in drei Schritten (`steps(3)`, 1.3 Takte). Text wechselt über einige Zwischenzeichen aus dem Tafelalphabet, Blätter versetzt um einen Takt. Modus `direct` klappt genau einmal aufs Ziel und gilt für alle Zähler (Fahrtzähler, Rückzählung), damit keine falsche Ziffer aufblitzt. Der Titel klappt alle 10 s einmal durch.

### Gleiszeile und Gleiskachel
Tafelzeile mit Gleiskachel (6.4rem, `signal`, 4.6rem Ziffer, leichter Glanzverlauf), Ziel in 15 Blättern, Zuglauf in `ink-soft`, Lok als Zugart-Piktogramm, Takt mit grüner Zahl. Zeilen sind durch Fugen getrennt, nicht als Karten abgesetzt. Druck: Zeile wird `housing-edge`, Kachel sinkt 0.15rem ein. Beim Antippen klappt das Ziel auf „ABFAHRT“ und die Lok fährt aus (`--ease-in`), dann folgt der Seitenwechsel. Die Gleiskachel trägt `view-transition-name: gleis-N` und wandert in die Kopfzeile der Level-Seite.

### Lauftext (Ticker)
Signalgelbe Title-Schrift auf vertieftem Spaltgrund (4.8rem hoch, 0.6rem Radius), endlos per `translateX(-50%)` über eine doppelte Spur. Ruf des Meistertrainers oben neben der Bahnhofsuhr, Preisruf unten neben der Füllstandslampe.

### Bahnhofsuhr
SVG-Uhr in Mint statt Weiß, Zeiger in `housing`, Sekundenzeiger mit Kelle in Signalgelb, der in 58,5 s umläuft und an der Zwölf kurz hält.

### Linienband und Halte
Zehn Halte (2.6rem Kreise) auf einer Linie in `flap`. Aktueller Halt: Mint mit gelbem Ring, um 1.18 vergrößert. Erreicht: grün mit dunklem Haken. Verfehlt: stumpf mit gelbem Kreuz. Jeder Halt bleibt als Spur stehen. Daneben Abfahrtsuhr und Fahrtzähler „01/10“ in Fallblättern.

### Abfahrtsuhr (Countdown)
Mint-Zifferblatt mit einem Ring aus Strich (`pathLength` 100), der hinter einem Zeiger linear abläuft; im letzten Drittel der Zeit wechselt der Ring von Grün zu Signalgelb. Bei einer Antwort bleibt die Uhr stehen, wo sie ist.

### Antwortzeile
Blatt in `flap` mit Antworttaste (4.4rem, Signalgelb, Buchstabe A–D), Antworttext in Body und Markierungsfeld rechts. Kein durchgehender Mittelspalt (er würde den Text durchstreichen); Scharniermarken (0.5 × 0.16rem, `flap-gap`) an beiden Rändern tragen das Blatt. Zeilen klappen nacheinander von oben herein (`rotateX(-82deg)`, 70 ms Versatz). Druck: 0.15rem tiefer, 0.99.
- **Richtig gewählt:** Hauptgrün, dunkle Schrift, Taste invertiert, Haken, kurzer Puls (1.025).
- **Richtig gezeigt (Hint):** wie richtig, aber ohne Puls, damit „gewählt“ und „gezeigt“ unterscheidbar bleiben.
- **Falsch:** stumpfes Blatt, `ink-dim`-Schrift, Taste auf Spaltgrund mit gelbem Buchstaben, gelbes Kreuz, kurzes Rucken.
- **Zurückgetreten:** Schrift `ink-dim`, Taste wird leeres Blatt auf Spaltgrund.
Die Auflösung steht 1,5 s.

### Ankunft (Fahrtbilanz)
Linienband und Bühne weichen einer zentrierten Ankunft: Die Level-Lok fährt groß ein (16rem, von oben, 900 ms), darunter die zehn Halte groß (4.2rem) als Fahrtbilanz, dann die Ergebniszeile „08 VON 10 RICHTIG“ in Fallblättern, die von 00 hochklappt. Die erreichte Zahl folgt der Grammatik der Antworten: bei Gewinn grüne Blätter mit dunkelgrüner Schrift, sonst stumpfe Blätter mit signalgelber Schrift. Darunter der Stufentext in Headline.

### Aktion und Ausgabe
Preis-Taste (44 × 8.6rem, Signalgelb, Headline, `--shadow`) bei Gewinn, sonst Heimtaste in Mint; beide erscheinen erst nach der Ankunft (900 ms Verzögerung). Nach dem Antippen ersetzt eine Ausgabemeldung die Taste, darunter „Zurück zur Abfahrt in“ mit einem einzelnen Fallblatt, das im Modus `direct` von 3 herunterzählt. Gewinn startet Konfetti in Markenfarben (Canvas, 4 s).

### Heimweg
Taste im Fuß der Level-Seite: `housing`, 5.6rem hoch, grünes Haus-Symbol, „Start“ in Body 700.

### PIN- und Statistik-Modal
Gehäusefläche (30rem bzw. 38rem breit, 1.6rem Radius) über abgedunkeltem Grund. Schließen-Taste als Blatt oben rechts. PIN-Feld vertieft, Ziffern weit gesperrt. Ziffernblock 3 × 4 aus Fallblatt-Tasten (5.2rem hoch, mit Mittelspalt); „Eingabe“ in Hauptgrün. Falsche PIN: Rand Signalgelb und kurzes Schütteln. Statistik als Zeilen aus Blättern, Wert rechts in tabellarischen Ziffern.

### Herstellerschild
Das WuS-Logo auf einer Mint-Platte (0.6rem Radius) unten rechts, fest positioniert; zugleich der versteckte PIN-Auslöser.

### Berührungsring
Bei jedem `pointerdown` ein Ring (9rem, 0.35rem Signalgelb) am Finger, der in 480 ms aufzieht und verblasst; höchstens vier gleichzeitig.

### Bewegungsgrammatik
- Eine Taktuhr: alle Fallblätter einer Seite laufen von einer `requestAnimationFrame`-Schleife mit 70 ms Takt (`--tick`), die nur arbeitet, solange etwas klappt.
- Ankommen mit `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`), Abfahren mit `--ease-in` (`cubic-bezier(0.55, 0, 0.9, 0.3)`).
- Seitenwechsel über Cross-Document View Transitions: alte Seite 200 ms hinaus und leicht nach oben, neue 380 ms herein; benannte Gruppen (Gleiskachel) 420 ms.
- `prefers-reduced-motion`: Animationen und Übergänge auf 1 ms, Lauftexte stehen, Fallblätter springen ohne Zwischenzeichen aufs Ziel.

## Do's and Don'ts

### Do:
- **Do** alle Maße in rem auf dem 54 × 96rem-Raster angeben und die Wurzelgröße an `min(100vw / 54, 100vh / 96)` hängen lassen (im Quiz-iframe `min(100vw / 50.2, 100vh / 72)`).
- **Do** Farben nur über die `:root`-Variablen aus `base.css` beziehen.
- **Do** Zahlen, die sich ändern, als Fallblätter zeigen; Zähler im Modus `direct`.
- **Do** neue Bewegung an die gemeinsame Taktuhr und an `--ease-out` / `--ease-in` hängen und nur `transform` und `opacity` animieren.
- **Do** auf Grün, Gelb und Mint immer `signal-ink` als Schrift verwenden.
- **Do** richtig/falsch immer mit Haken bzw. Kreuz als Inline-SVG und eigener Bewegung doppelt kodieren.
- **Do** Medien (`Images/`, `QuizImages/`, `fonts/`) außerhalb von `dist/` mit root-absoluten Pfaden in exakter Groß-/Kleinschreibung referenzieren.

### Don't:
- **Don't** Rot als Signal- oder Markenfarbe einsetzen und keine weiße Schrift auf Grün.
- **Don't** weiße Flächen, bunte Kacheln oder Fortschrittsbalken bauen; Fortschritt ist das Linienband.
- **Don't** großflächige `filter: blur()` oder `backdrop-filter` in 4K; abdunkeln über `opacity`.
- **Don't** Tafelzeilen als schwebende Karten absetzen; Zeilen trennen Fugen.
- **Don't** einen durchgehenden Mittelspalt quer durch Fließtext legen; bei Textzeilen tragen Scharniermarken das Blatt.
- **Don't** eine zweite Schrift oder Systemschrift als Display einführen; Rajdhani ist verbindlich.
- **Don't** Versalien-Labels mit Sperrung als Überzeilen über Überschriften setzen; die Label-Stufe gibt es nur als Spaltenkopf über ausgerichteten Tafelspalten.
