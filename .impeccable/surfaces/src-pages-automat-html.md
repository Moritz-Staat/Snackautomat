---
version: 1
slug: "src-pages-automat-html"
primary_target: "src/pages/Automat.html"
related_targets: ["src/pages/Einzelseiten/level1.html","src/pages/Einzelseiten/level2.html","src/pages/Einzelseiten/level3.html","src/pages/Einzelseiten/QuizLevel1/index.html","src/pages/Einzelseiten/QuizLevel2/index.html","src/pages/Einzelseiten/QuizLevel3/index.html"]
---

# Chris-O-Mat Kiosk (Startseite, Level-Seiten, Quiz)

Scope: alle drei Oberflächen des Kiosks (`src/pages/Automat.html`, `src/pages/Einzelseiten/level*.html`, `src/pages/Einzelseiten/QuizLevel*/index.html`). Mode: Persuade (Besucher sollen stehen bleiben und spielen); das Quiz selbst folgt derselben Welt.

Zielgerät: 4K-TV hochkant 2160 × 3840, Touch direkt am Bildschirm, Bedienung im Stehen. Alle Größen in rem, die an `min(vw, vh)` hängen; Referenzraster 1080 × 1920.

Unveränderlich: kompletter Ablauf und alle IDs/Hooks aus PRODUCT.md (Levelwahl, 10 Fragen, Timer, 1,5-s-Auflösung, Stufen, Konfetti, postMessage, Relais, Rücksprünge, Bildschirmschoner, Ampel, PIN- und Statistik-Modal, Logo als PIN-Auslöser).

## Direction contract

THESIS: Der Automat ist eine Abfahrtstafel. Levels sind Gleise, eine Quizrunde ist eine Fahrt mit 10 Halten, das Ergebnis ist die Ankunft. Verweigert wird der Messe-Quiz-Standard aus weißer Fläche, bunten Kacheln und Fortschrittsbalken.

OWN-WORLD: Die ganze Fläche ist Tafelgehäuse in WuS-Dunkelgrün (#0B3D2A, Tiefen #062619). Inhalte sitzen auf Fallblättern mit Mittelspalt und hartem Schlagschatten. Tafelschrift Rajdhani in Mint (#CDE4C4) und Hauptgrün (#62B55A). Gleisnummern und Signalakzente in Signalgelb (#F2C230). Richtig wird zum grünen Blatt mit dunkelgrüner Schrift und ✓, falsch zum stumpfen Blatt mit gelbem ✕, rot gibt es nicht. Bahnhofsuhr, Linienband, Lauftext.

STORY: Ein Passant sieht eine lebendige Abfahrtstafel, auf der Buchstaben klappen und ein Lauftext lockt. Er versteht in zwei Sekunden: drei Gleise, drei Schwierigkeiten, ein Preis am Ziel. Er tippt ein Gleis an, fährt 10 Halte, sieht jede Station grün oder markiert und kommt an: Punkte, Stufentext, Preis.

FIRST VIEWPORT: Oben „CHRIS-O-MAT“ in Einzelfallblättern über die volle Innenbreite (ca. 6 % der Höhe; mehr erlaubt das Hochformat bei 11 Blättern nicht, korrigiert nach dem Finish-Review). Darunter ein Band aus Bahnhofsuhr links und Lauftext mit dem Ruf des Meistertrainers. Dann Spaltenköpfe GLEIS · ZIEL · TAKT und drei Gleiszeilen (je ca. 20 % der Höhe) als Primäraktion, durch Fugen getrennt in einem Tafelrahmen: Gleiskachel, Ziel in 15 Blättern über die Zeilenbreite, darunter Zuglauf-Text, Lok als Zugart-Piktogramm und Takt. Unten das Lauftextband „Gewinne coole Preise!“ in Signalgelb auf Spaltgrund, links die Füllstandslampe, rechts das WuS-Logo als Herstellerschild.

FORM: Fallblatt-Zugzielanzeiger, Platz 3 meiner Liste, Seed-Key 2d7d0496. Code-led. Signaturinteraktion: Fallblatt-Klappen (Zeichen bei Titel, Ziel, Zählern, Ergebniszeile; Zeilen bei Antworten), Abfahrtsuhr als Countdown, angetrieben von einer gemeinsamen Taktuhr, in mechanischen Schritten. Jede Berührung erzeugt eine sofortige Ringantwort am Finger. Seitenwechsel über Cross-Document-View-Transitions.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Erinnerung

Aufgenommene Verstärkungen: Zahlenwechsel als mechanisches Ereignis (Nixie), Schrittbewegung und wenige Größen (Acetat), Linienband als bleibende Spur (Décollage), totale Farbfläche (Kunstsonne), Berührungsantwort (Plankton), eine Taktuhr (Cracktro).
Offen: Lead-Ablauf (Issue #6) bleibt außerhalb dieses Umbaus.
