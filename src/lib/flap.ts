/**
 * Fallblattanzeige. Jedes Zeichen sitzt in einem eigenen Blatt; aendert sich
 * der Text, klappen die Blaetter Zeichen fuer Zeichen durch einige
 * Zwischenzeichen bis zum Ziel, wie an einer echten Abfahrtstafel.
 *
 * Alle Anzeigen auf einer Seite laufen von EINER Taktuhr (ein
 * requestAnimationFrame-Loop, der nur arbeitet, solange etwas klappt). So
 * gibt es keine verstreuten Timer, und der NUC rechnet pro Takt genau einmal.
 */

const ALPHABET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ0123456789-/·';
const TICK_MS = 70;
/** Wie viele Zwischenzeichen ein Blatt hoechstens zeigt, bevor es landet. */
const MAX_STEPS = 7;
/** Versatz zwischen benachbarten Blaettern, in Takten. */
const STAGGER_TICKS = 1;

interface Cell {
  el: HTMLElement;
  char: HTMLElement;
  current: string;
  target: string;
  stepsLeft: number;
  delay: number;
  phase: boolean;
}

const active = new Set<Cell>();
let lastTick = 0;
let rafId = 0;

const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function show(cell: Cell, value: string): void {
  cell.current = value;
  cell.char.textContent = value === ' ' ? ' ' : value;
  cell.el.classList.toggle('flap--blank', value === ' ');
  // Zwei Klassen im Wechsel starten die Fall-Animation ohne Reflow neu.
  cell.phase = !cell.phase;
  cell.el.classList.toggle('tick-a', cell.phase);
  cell.el.classList.toggle('tick-b', !cell.phase);
}

function nextChar(current: string): string {
  const i = ALPHABET.indexOf(current);
  return ALPHABET[(i + 1) % ALPHABET.length] ?? ' ';
}

function loop(now: number): void {
  if (now - lastTick >= TICK_MS) {
    lastTick = now;
    for (const cell of active) {
      if (cell.delay > 0) {
        cell.delay--;
        continue;
      }
      if (cell.stepsLeft > 0) {
        cell.stepsLeft--;
        show(cell, cell.stepsLeft === 0 ? cell.target : nextChar(cell.current));
      }
      if (cell.stepsLeft === 0) active.delete(cell);
    }
  }
  rafId = active.size > 0 ? requestAnimationFrame(loop) : 0;
}

function schedule(cell: Cell, target: string, delay: number, direct = false): void {
  cell.target = target;
  if (reducedMotion) {
    show(cell, target);
    return;
  }
  cell.delay = delay;
  // direct: genau ein Klappen auf das Ziel, ohne Zwischenzeichen (fuer Countdowns,
  // bei denen eine kurz sichtbare falsche Ziffer irrefuehren wuerde).
  cell.stepsLeft = direct ? 1 : cell.current === target ? 2 : 2 + Math.floor(Math.random() * (MAX_STEPS - 1));
  active.add(cell);
  if (!rafId) rafId = requestAnimationFrame(loop);
}

export interface FlapBoard {
  /** Neuen Text anzeigen; klappt nur die Blaetter, die sich aendern. */
  set(text: string, options?: { cascade?: boolean; direct?: boolean }): void;
  /** Alle Blaetter einmal durchklappen lassen, ohne den Text zu aendern. */
  shuffle(): void;
}

/**
 * Baut in `host` eine Fallblattzeile mit `length` Blaettern (Standard:
 * Laenge des Anfangstextes). Kuerzere Texte werden mit leeren Blaettern
 * aufgefuellt, wie auf einer echten Tafel.
 */
export function createFlapBoard(host: HTMLElement, initial: string, length = initial.length): FlapBoard {
  host.classList.add('flaps');
  host.setAttribute('aria-label', host.getAttribute('aria-label') ?? initial);
  const cells: Cell[] = [];
  const frag = document.createDocumentFragment();

  for (let i = 0; i < length; i++) {
    const el = document.createElement('span');
    el.className = 'flap';
    el.setAttribute('aria-hidden', 'true');
    const char = document.createElement('span');
    char.className = 'flap__char';
    el.append(char);
    frag.append(el);
    const cell: Cell = { el, char, current: ' ', target: ' ', stepsLeft: 0, delay: 0, phase: false };
    show(cell, ' ');
    cells.push(cell);
  }
  host.replaceChildren(frag);

  const pad = (text: string): string => text.toUpperCase().padEnd(length, ' ').slice(0, length);

  const board: FlapBoard = {
    set(text, options = {}) {
      const value = pad(text);
      host.setAttribute('aria-label', text);
      cells.forEach((cell, i) => {
        const target = value[i] ?? ' ';
        if (!options.cascade && cell.current === target && !active.has(cell)) return;
        schedule(cell, target, options.direct ? 0 : i * STAGGER_TICKS, options.direct);
      });
    },
    shuffle() {
      cells.forEach((cell, i) => schedule(cell, cell.target, i * STAGGER_TICKS));
    },
  };

  board.set(initial, { cascade: true });
  return board;
}

/** Wandelt jedes Element mit `data-flap="TEXT"` in eine Fallblattzeile um. */
export function mountFlaps(root: ParentNode = document): Map<HTMLElement, FlapBoard> {
  const boards = new Map<HTMLElement, FlapBoard>();
  root.querySelectorAll<HTMLElement>('[data-flap]').forEach((host) => {
    const text = host.dataset['flap'] ?? '';
    const length = Number.parseInt(host.dataset['flapLength'] ?? '', 10);
    boards.set(host, createFlapBoard(host, text, Number.isFinite(length) ? length : text.length));
  });
  return boards;
}
