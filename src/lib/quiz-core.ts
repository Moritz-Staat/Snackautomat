import { startConfetti } from './confetti';
import { el, onReady } from './dom';
import type { Question, QuizResultMessage, QuizSetup, Tier } from './types';

const QUESTIONS_PER_ROUND = 10;
/** Wie lange die richtige/falsche Antwort markiert bleibt, bevor es weitergeht. */
const REVEAL_MS = 1500;
/** Inaktivitaet bis zum Weichzeichner bzw. bis zum Sprung auf die Startseite. */
const BLUR_AFTER_MS = 20_000;
const RETURN_HOME_AFTER_MS = 30_000;

const TIMER_GREEN = '#62b55a';
const TIMER_RED = '#c62828';

/** Fisher-Yates, unverzerrt. */
function shuffle<T>(input: readonly T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function preload(image: string | undefined): void {
  if (!image) return;
  new Image().src = imageUrl(image);
}

/** Fragebilder liegen im Repo-Root unter /QuizImages/ und werden nicht gebundelt. */
function imageUrl(image: string): string {
  return `/QuizImages/${image}`;
}

function pickTier(tiers: readonly Tier[], numCorrect: number): Tier {
  const sorted = [...tiers].sort((a, b) => b.min - a.min);
  return sorted.find((t) => numCorrect >= t.min) ?? sorted[sorted.length - 1]!;
}

export function initQuiz(setup: QuizSetup): void {
  onReady(() => run(setup));
}

function run(setup: QuizSetup): void {
  const qText = el('question-text');
  const aBtns = el('answer-buttons');
  const qImg = el<HTMLImageElement>('question-image');
  const pBar = el('progress-bar');
  const pText = el('progress-text');
  const blurEl = el('blur-overlay');
  const timerBar = el('timer-bar');
  const container = el('question-container');

  const round: Question[] = shuffle(setup.questions).slice(0, QUESTIONS_PER_ROUND);
  let idx = 0;
  let numCorrect = 0;
  let isBlurred = false;

  let blurTimer: number | undefined;
  let inactiveTimer: number | undefined;
  let questionTimer: number | undefined;
  let advanceTimer: number | undefined;

  function startQuestionTimer(): void {
    clearQuestionTimer();
    const seconds = setup.timerSeconds;
    timerBar.style.transition = 'none';
    timerBar.style.width = '100%';
    timerBar.style.backgroundColor = TIMER_GREEN;
    void timerBar.offsetWidth; // Reflow erzwingen, sonst startet die Animation nicht neu
    timerBar.style.transition =
      `width ${seconds}s linear, background-color ${seconds * 0.4}s ease ${seconds * 0.5}s`;
    timerBar.style.width = '0%';
    timerBar.style.backgroundColor = TIMER_RED;
    questionTimer = window.setTimeout(onTimerExpired, seconds * 1000);
  }

  function clearQuestionTimer(): void {
    window.clearTimeout(questionTimer);
    questionTimer = undefined;
    timerBar.style.transition = 'none';
    timerBar.style.width = '0%';
  }

  function lockAnswers(chosen: HTMLButtonElement | null, wasCorrect: boolean): void {
    aBtns.querySelectorAll<HTMLButtonElement>('.btn').forEach((b) => {
      b.disabled = true;
      if (chosen && b === chosen) {
        b.classList.add(wasCorrect ? 'btn-correct' : 'btn-wrong');
      } else if (b.dataset['c'] === '1') {
        b.classList.add('btn-hint');
      }
    });
  }

  function advance(): void {
    window.clearTimeout(advanceTimer);
    advanceTimer = window.setTimeout(() => {
      idx++;
      const next = round[idx];
      if (next) showQuestion(next);
      else showResults();
    }, REVEAL_MS);
  }

  function onTimerExpired(): void {
    lockAnswers(null, false);
    resetInactivity();
    advance();
  }

  function showQuestion(q: Question): void {
    qText.innerText = q.question;

    if (q.image) {
      qImg.src = imageUrl(q.image);
      qImg.alt = '';
      qImg.style.display = 'block';
    } else {
      qImg.removeAttribute('src');
      qImg.style.display = 'none';
    }

    // DocumentFragment: eine einzige DOM-Einfuegung statt vier Reflows
    const frag = document.createDocumentFragment();
    for (const answer of q.answers) {
      const btn = document.createElement('button');
      btn.innerText = answer.text;
      btn.className = 'btn';
      btn.dataset['c'] = answer.correct ? '1' : '0';
      frag.appendChild(btn);
    }
    aBtns.replaceChildren(frag);

    updateBar();
    preload(round[idx + 1]?.image); // naechstes Bild laden, waehrend gelesen wird
    startQuestionTimer();
  }

  /** Ein delegierter Listener statt einem pro Button. */
  function onAnswer(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const btn = target.closest<HTMLButtonElement>('.btn');
    if (!btn || btn.disabled || !aBtns.contains(btn)) return;

    clearQuestionTimer();

    const correct = btn.dataset['c'] === '1';
    if (correct) numCorrect++;

    lockAnswers(btn, correct);
    resetInactivity();
    advance();
  }

  function showResults(): void {
    clearQuestionTimer();
    const tier = pickTier(setup.tiers, numCorrect);
    if (tier.win) startConfetti();

    const img = document.createElement('img');
    img.src = '/Images/LOGO.svg';
    img.id = 'result-image';
    img.alt = '';

    const txt = document.createElement('div');
    txt.id = 'result-text';
    txt.innerText = tier.text;

    const btn = document.createElement('button');
    btn.innerText = tier.win ? 'Preis abholen' : 'Zurück zum Start';
    btn.className = 'btn';
    btn.addEventListener('click', () => {
      const message: QuizResultMessage = tier.win ? 'prizeCollected' : 'quizFailed';
      // Gleiche Herkunft (iframe im selben Dokument), daher kein Wildcard-Target.
      window.parent.postMessage(message, window.location.origin);
    });

    const frag = document.createDocumentFragment();
    frag.append(img, txt, btn);
    container.replaceChildren(frag);
  }

  function updateBar(): void {
    const num = idx + 1;
    pBar.style.width = `${(num / round.length) * 100}%`;
    pText.innerText = `${num}/${round.length}`;
  }

  function resetInactivity(): void {
    window.clearTimeout(blurTimer);
    window.clearTimeout(inactiveTimer);
    if (isBlurred) {
      document.body.classList.remove('blur');
      blurEl.style.display = 'none';
      isBlurred = false;
    }
    blurTimer = window.setTimeout(() => {
      document.body.classList.add('blur');
      blurEl.style.display = 'flex';
      isBlurred = true;
    }, BLUR_AFTER_MS);
    inactiveTimer = window.setTimeout(() => {
      // BASE_URL statt fester Pfad: im Build '/dist/', im Dev-Server '/'.
      window.top!.location.href = `${import.meta.env.BASE_URL}Automat.html`;
    }, RETURN_HOME_AFTER_MS);
  }

  aBtns.addEventListener('click', onAnswer);
  document.addEventListener('click', resetInactivity);
  document.addEventListener('touchstart', resetInactivity, { passive: true });

  const first = round[0];
  if (!first) {
    qText.innerText = 'Keine Fragen konfiguriert.';
    return;
  }
  for (const q of round) preload(q.image);
  showQuestion(first);
  resetInactivity();
}
