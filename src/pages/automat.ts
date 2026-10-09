import { mountStationClock } from '../lib/clock';
import { config, pinMatches } from '../lib/config';
import { el } from '../lib/dom';
import { mountFlaps, type FlapBoard } from '../lib/flap';
import { setupPinModal } from '../lib/pin-modal';
import { triggerRelay } from '../lib/relay';
import { setupRipples } from '../lib/ripple';
import { clearCounters, incrementCounter, readAllCounters } from '../lib/storage';
import type { LevelId } from '../lib/types';

const SCREENSAVER_AFTER_MS = 20_000;
const HEADING_ANIMATION_INTERVAL_MS = 10_000;
/** So lange klappt die Zeile auf ABFAHRT und faehrt die Lok an, bevor die Seite wechselt. */
const DEPARTURE_MS = 520;

const SCREENSAVER_VIDEOS = [
  '/Images/RZ_ChrisOmat_Bildschirmschonervideo_3er_v1.mp4',
  '/Images/RZ_ChrisOmat_Bildschirmschonervideo_3er_v2.mp4',
  '/Images/RZ_ChrisOmat_Bildschirmschonervideo_3er_v3.mp4',
] as const;

/** Ab diesen Zaehlerstaenden wechselt die Ampel — Hinweis zum Nachfuellen. */
const AMPEL_ROT = { level1win: 25, level2win: 35, level3win: 25, loses: 18, kontaktdaten: 10 };
const AMPEL_GELB = { level1win: 15, level2win: 25, level3win: 15, loses: 13, kontaktdaten: 5 };

const screensaver = el('screensaver');
const video = el<HTMLVideoElement>('screensaverVideo');

let idleTimer: number | undefined;
let screensaverActive = false;

function showScreensaver(): void {
  const pick = SCREENSAVER_VIDEOS[Math.floor(Math.random() * SCREENSAVER_VIDEOS.length)];
  video.src = pick ?? SCREENSAVER_VIDEOS[0];

  screensaver.classList.remove('hidden');
  screensaverActive = true;
  // Autoplay klappt nur stumm; das Video ist im Markup bereits muted.
  void video.play().catch(() => {
    // Kann der Browser nicht abspielen, bleibt einfach die Startseite stehen.
    hideScreensaver();
  });
}

function hideScreensaver(): void {
  screensaver.classList.add('hidden');
  video.pause();
  video.currentTime = 0;
  screensaverActive = false;
}

function resetIdle(): void {
  hideScreensaver();
  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(showScreensaver, SCREENSAVER_AFTER_MS);
}

// Das Video laeuft einmal durch und kehrt dann zur Startseite zurueck.
video.addEventListener('ended', resetIdle);

document.addEventListener(
  'touchstart',
  (event) => {
    if (screensaverActive) {
      event.preventDefault();
      hideScreensaver();
    }
    resetIdle();
  },
  { passive: false },
);

// Maus nur auf Nicht-Touch-Geraeten, sonst loest der Touch-Emulationsklick
// des Kiosk-Panels doppelt aus.
if (!window.matchMedia('(pointer: coarse)').matches) {
  document.addEventListener('mousemove', resetIdle);
}
document.addEventListener('click', resetIdle);

/** Ampel-Logo: gruen/orange/rot je nach Fuellstand. */
function updateAmpel(): void {
  const counts = readAllCounters();
  const exceeds = (limits: typeof AMPEL_ROT): boolean =>
    (Object.keys(limits) as (keyof typeof limits)[]).some((key) => counts[key] > limits[key]);

  const farbe = exceeds(AMPEL_ROT) ? 'rotebirne' : exceeds(AMPEL_GELB) ? 'orangebirne' : 'grünebirne';
  el<HTMLImageElement>('zählstand').src = `/Images/${farbe}.svg`;
}

function showStats(): void {
  const counts = readAllCounters();
  el('stat-level1').textContent = String(counts.level1win);
  el('stat-level2').textContent = String(counts.level2win);
  el('stat-level3').textContent = String(counts.level3win);
  el('stat-loses').textContent = String(counts.loses);
  el('stat-kontakt').textContent = String(counts.kontaktdaten);
  el('statsModal').style.display = 'block';
  el('wholepage').classList.add('blurred');
}

function closeStats(): void {
  el('statsModal').style.display = 'none';
  el('wholepage').classList.remove('blurred');
}

el('statsClose').addEventListener('click', closeStats);
el('statsCloseBtn').addEventListener('click', closeStats);

setupPinModal({
  onSubmit: (pin) => {
    if (pinMatches(pin, config.pins.kontakt)) {
      incrementCounter('kontaktdaten');
      triggerRelay('trostpreis');
      return true;
    }
    if (pinMatches(pin, config.pins.reset)) {
      clearCounters();
      triggerRelay('reset');
      updateAmpel();
      return true;
    }
    if (pinMatches(pin, config.pins.statistik)) {
      showStats();
      return true;
    }
    return false;
  },
});

/** Die Fallblaetter der Ueberschrift klappen alle 10 s durch, damit der Automat Blicke faengt. */
function setupFlapBoards(): Map<HTMLElement, FlapBoard> {
  const boards = mountFlaps();
  const title = boards.get(el('animated-h1'));
  window.setInterval(() => title?.shuffle(), HEADING_ANIMATION_INTERVAL_MS);
  return boards;
}

/** Gleiszeilen: Takt und Gewinnschwelle aus der Konfiguration, Abfahrt beim Antippen. */
function setupTracks(boards: Map<HTMLElement, FlapBoard>): void {
  document.querySelectorAll<HTMLAnchorElement>('.track').forEach((track) => {
    const level = track.dataset['level'] as LevelId | undefined;
    const takt = track.querySelector('[data-takt]');
    const min = track.querySelector('[data-min]');
    if (level && takt) takt.textContent = String(config.frage_timer[level]);
    if (min) min.textContent = String(config.min_richtig);

    track.addEventListener('click', (event) => {
      if (track.classList.contains('is-departing')) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      track.classList.add('is-departing');
      const name = track.querySelector<HTMLElement>('.track__name');
      if (name) boards.get(name)?.set('ABFAHRT');
      window.setTimeout(() => {
        window.location.href = track.href;
      }, DEPARTURE_MS);
    });
  });
}

updateAmpel();
setupTracks(setupFlapBoards());
mountStationClock(el('clock'));
setupRipples();
resetIdle();
