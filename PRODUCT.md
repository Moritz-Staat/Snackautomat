# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Messebesucher am Stand der WuS-Technik (Bahntechnik: Leit- und Sicherungstechnik, Schulungen). Sie gehen vorbei, bleiben stehen, tippen sich im Stehen direkt am Bildschirm durch ein Quiz mit 10 Fragen und hoffen auf einen Snack. Nebenher: das Standpersonal, das über ein verstecktes PIN-Feld Kontaktpreise auslöst, Zähler zurücksetzt und Statistiken abruft.

## Product Purpose

Der Chris-O-Mat ist ein Quiz-Snackautomat. Er soll vorbeigehende Besucher anziehen, an den Stand holen und ein Gespräch eröffnen (Blickfang), und er soll Kontakte bzw. Leads erzeugen. Erfolg heißt: Leute bleiben stehen, spielen eine Runde zu Ende, und das Standpersonal kommt mit ihnen ins Gespräch.

## Positioning

Ein echter Automat mit physischer Preisausgabe, dessen Fragen aus dem Fachgebiet der WuS-Technik (Signale, Stellwerke, Weichen, Achszähler) stammen und vom „Meistertrainer“ Chris gestellt werden. Das Quiz zeigt Fachkompetenz spielerisch.

## Operating Context

- Messestand, laut, wechselndes Licht, viele Passanten; Bedienung im Stehen aus ca. 0,5 bis 1 m.
- Hardware: 4K-Fernseher hochkant (2160 × 3840), der selbst der Touchscreen ist. Angesteuert vom Intel NUC, Chrome im Kiosk-Modus (`scripts/kiosk.cmd`).
- Betrieb ohne Internet. Statischer Server, Docroot = Repo-Root, Einstieg `/dist/Automat.html`.
- Ein Microcontroller am lokalen Netz schaltet per HTTP-POST die Relais für die Snack-Ausgabe.

## Capabilities and Constraints

Diese Funktionen müssen erhalten bleiben:

- Startseite mit drei Levels: Anfänger, Fortgeschritten, Profi.
- Pro Runde 10 zufällige Fragen aus dem Pool (43 / 55 / 45 Fragen), je vier Antworten, optional ein Bild. Pro Frage ein Countdown (15 / 25 / 40 s, konfigurierbar). Nach jeder Antwort werden richtig und falsch für 1,5 s markiert.
- Ab `min_richtig` (Standard 8) gibt es einen Gewinn, sonst einen Trostpreis. Für das Ergebnis gibt es Stufentexte je Level. Bei einem Gewinn kommt Konfetti, dann „Preis abholen“ bzw. „Zurück zum Start“. Danach wird das Relais ausgelöst, und nach 3 s geht es zurück zur Startseite.
- Inaktivität im Quiz: nach 20 s Weichzeichner, nach 30 s Rücksprung zur Startseite. Auf der Startseite startet nach 20 s ein zufälliges Bildschirmschoner-Video, das eine Berührung beendet.
- Ein Ampel-Symbol (grün/orange/rot) zeigt den Füllstand anhand der Zähler.
- Ein PIN-Modal mit Ziffernblock hinter dem Logo: Kontakt-PIN, Reset-PIN, Statistik-PIN (auf den Level-Seiten nur die Kontakt-PIN). Dazu gibt es ein Statistik-Modal.
- Zähler im `localStorage`. Konfiguration über die optionale `config.local.js`.
- Technik: TypeScript + Vite, `dist/` liegt im Repo, Medien (`Images/`, `QuizImages/`, `fonts/`) außerhalb von `dist/` mit root-absoluten Pfaden in exakter Groß-/Kleinschreibung. Kein UI-Framework.
- Die Preisauswahl normal/premium ist entfernt. Der Lead-Ablauf wird neu konzipiert (Issue #6), das ist noch offen.

## Brand Commitments

- Schrift: Rajdhani ist verbindlich (liegt lokal unter `fonts/`).
- Farbwelt: ungefähr das bestehende WuS-Grün beibehalten (Hauptgrün `#62B55A`; Academy-Palette `#0B3D2A`, `#51A175`, `#62B55A`, `#CDE4C4`). Text auf Grün nie weiß, sondern dunkelgrün, und kein Rot als Markenfarbe.
- Name „Chris-O-Mat“ und die Rolle des Meistertrainers sind Teil der Produktgeschichte. Die Bildschirmschoner-Videos sind darauf gebrandet.
- Alles andere an der visuellen Gestaltung (Layout, Komposition, Bewegung, Komponenten) ist ausdrücklich frei.

## Evidence on Hand

- Logos: `Images/WuS_Logo.svg`, `Images/LOGO.svg`. Level-Illustrationen: `Images/01.svg`, `02.svg`, `03.svg`. Ampelbirnen: `Images/*birne.svg`.
- Fragenbilder: `QuizImages/`, teils Fotos mit bis zu 5658 px Breite. Ergebnistexte in `src/data/level*.ts`.
- Bildschirmschoner-Videos: `Images/RZ_ChrisOmat_Bildschirmschonervideo_3er_v1–v3.mp4`.
- Keine Testimonials, Kennzahlen oder Preisangaben. Solche Inhalte dürfen nicht erfunden werden.

## Product Principles

1. Aus drei Metern lesbar, aus einem halben Meter bedienbar: große Ziele, eindeutige Zustände.
2. Jede Berührung bekommt sofort eine sichtbare Antwort. Ein Automat, der zögert, wirkt kaputt.
3. Der Ablauf bleibt unverändert, besser wird nur, wie er sich anfühlt.
4. Läuft offline und ruckelfrei auf dem NUC. Bewegung nur über `transform` und `opacity`.
5. Fachlich ernst, im Ton verspielt.

## Accessibility & Inclusion

Öffentlicher Touch-Kiosk: Kontrast AA auf hellem Messelicht, Touch-Ziele deutlich über dem Minimum, `prefers-reduced-motion` respektieren. Farbe darf richtig/falsch nie allein tragen.
