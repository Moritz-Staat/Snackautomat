import { startConfetti } from './confetti';
import { el, onReady } from './dom';
import { createFlapBoard } from './flap';
import { setupRipples } from './ripple';
import type { Question, QuizResultMessage, QuizSetup, Tier } from './types';

const QUESTIONS_PER_ROUND = 10;
/** Wie lange die richtige/falsche Antwort markiert bleibt, bevor es weitergeht. */
const REVEAL_MS = 1500;
/** Inaktivitaet bis zum Weichzeichner bzw. bis zum Sprung auf die Startseite. */
const BLUR_AFTER_MS = 20_000;
const RETURN_HOME_AFTER_MS = 30_000;
/** Ab dieser Laenge wird die Frage eine Stufe kleiner gesetzt. */
const LONG_QUESTION_CHARS = 110;
/** Gleich lang wie RETURN_HOME_MS der Level-Seite, die den Rueckweg ausloest. */
const BACK_HOME_SECONDS = 3;

const TIMER_GREEN = '#62b55a';
const TIMER_SIGNAL = '#f2c230';
const KEYS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

const ICON_RIGHT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>';
const ICON_WRONG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

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

const pad2 = (n: number): string => String(n).padStart(2, '0');

export function initQuiz(setup: QuizSetup): void {
  onReady(() => run(setup));
}

function run(setup: QuizSetup): void {
  const qText = el('question-text');
  const aBtns = el('answer-buttons');
  const media = el('question-media');
  const route = el('progress-bar');
  const pText = el('progress-text');
  const blurEl = el('blur-overlay');
  const timerHand = el('timer-bar');
  const timerArc = el('timer-arc');
  const quiz = el('quiz-container');
  const container = el('question-container');

  const round: Question[] = shuffle(setup.questions).slice(0, QUESTIONS_PER_ROUND);
  let idx = 0;
  let numCorrect = 0;
  let isBlurred = false;

  let blurTimer: number | undefined;
  let inactiveTimer: number | undefined;
  let questionTimer: number | undefined;
  let advanceTimer: number | undefined;

  // Linienband: ein Halt pro Frage. Beantwortete Halte behalten ihr Ergebnis.
  const stops = round.map(() => {
    const li = document.createElement('li');
    li.className = 'stop';
    return li;
  });
  route.replaceChildren(...stops);
  const counter = createFlapBoard(pText, `01/${pad2(round.length)}`, 5);

  /**
   * Abfahrtsuhr: der Zeiger laeuft einmal herum, die Scheibe dahinter laeuft
   * ab und wechselt gegen Ende von Gruen auf Signalgelb.
   */
  function startQuestionTimer(): void {
    clearQuestionTimer();
    const seconds = setup.timerSeconds;
    timerHand.style.transition = 'none';
    timerHand.style.transform = 'rotate(0deg)';
    timerArc.style.transition = 'none';
    timerArc.style.strokeDashoffset = '0';
    timerArc.style.stroke = TIMER_GREEN;
    void timerArc.getBoundingClientRect(); // Reflow erzwingen, sonst startet die Animation nicht neu
    timerHand.style.transition = `transform ${seconds}s linear`;
    timerHand.style.transform = 'rotate(360deg)';
    timerArc.style.transition =
      `stroke-dashoffset ${seconds}s linear, stroke ${seconds * 0.3}s ease ${seconds * 0.55}s`;
    timerArc.style.strokeDashoffset = '-100';
    timerArc.style.stroke = TIMER_SIGNAL;
    questionTimer = window.setTimeout(onTimerExpired, seconds * 1000);
  }

  function clearQuestionTimer(): void {
    window.clearTimeout(questionTimer);
    questionTimer = undefined;
    // Uhr dort anhalten, wo sie gerade steht, statt sie zurueckzusetzen.
    const hand = getComputedStyle(timerHand).transform;
    const arc = getComputedStyle(timerArc);
    const offset = arc.strokeDashoffset;
    const stroke = arc.stroke;
    timerHand.style.transition = 'none';
    timerArc.style.transition = 'none';
    timerHand.style.transform = hand;
    timerArc.style.strokeDashoffset = offset;
    timerArc.style.stroke = stroke;
  }

  function markStop(state: 'right' | 'wrong'): void {
    const stop = stops[idx];
    if (!stop) return;
    stop.classList.remove('is-current');
    stop.classList.add(state === 'right' ? 'is-right' : 'is-wrong');
    stop.innerHTML = state === 'right' ? ICON_RIGHT : ICON_WRONG;
  }

  function lockAnswers(chosen: HTMLButtonElement | null, wasCorrect: boolean): void {
    aBtns.classList.add('is-locked');
    aBtns.querySelectorAll<HTMLButtonElement>('.btn').forEach((b) => {
      b.disabled = true;
      const mark = b.querySelector('.answer__mark');
      if (chosen && b === chosen) {
        b.classList.add(wasCorrect ? 'btn-correct' : 'btn-wrong');
        if (mark) mark.innerHTML = wasCorrect ? ICON_RIGHT : ICON_WRONG;
      } else if (b.dataset['c'] === '1') {
        b.classList.add('btn-hint');
        if (mark) mark.innerHTML = ICON_RIGHT;
      }
    });
    markStop(wasCorrect ? 'right' : 'wrong');
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
    qText.textContent = q.question;
    qText.classList.toggle('is-long', q.question.length > LONG_QUESTION_CHARS);
    qText.classList.remove('is-new');
    void qText.offsetWidth;
    qText.classList.add('is-new');

    if (q.image) {
      container.classList.remove('no-image');
      // Je Frage ein frisches Element: so startet die Einblendung jedes Mal neu.
      const img = document.createElement('img');
      img.id = 'question-image';
      img.src = imageUrl(q.image);
      img.alt = '';
      media.replaceChildren(img);
    } else {
      container.classList.add('no-image');
      media.replaceChildren();
    }

    // DocumentFragment: eine einzige DOM-Einfuegung statt vier Reflows
    const frag = document.createDocumentFragment();
    q.answers.forEach((answer, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn';
      btn.dataset['c'] = answer.correct ? '1' : '0';
      btn.style.setProperty('--i', String(i));

      const key = document.createElement('span');
      key.className = 'answer__key';
      key.textContent = KEYS[i] ?? String(i + 1);
      const text = document.createElement('span');
      text.className = 'answer__text';
      text.textContent = answer.text;
      const mark = document.createElement('span');
      mark.className = 'answer__mark';

      btn.append(key, text, mark);
      frag.appendChild(btn);
    });
    aBtns.classList.remove('is-locked');
    aBtns.replaceChildren(frag);

    updateRoute();
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

  /** Ersetzt die Preis-Taste durch die Ausgabe-Meldung und zaehlt bis zur Abfahrt herunter. */
  function showDispatch(action: HTMLElement, won: boolean): void {
    const status = document.createElement('p');
    status.className = 'result__status';
    status.textContent = won ? 'Dein Preis wird ausgegeben.' : 'Dein Trostpreis wird ausgegeben.';
    const back = document.createElement('p');
    back.className = 'result__back';
    back.textContent = 'Zurück zur Abfahrt in';
    const count = document.createElement('span');
    count.className = 'result__count';
    back.append(count);
    action.replaceChildren(status, back);

    let seconds = BACK_HOME_SECONDS;
    const board = createFlapBoard(count, String(seconds), 1);
    const timer = window.setInterval(() => {
      seconds = Math.max(0, seconds - 1);
      board.set(String(seconds), { direct: true });
      if (seconds === 0) window.clearInterval(timer);
    }, 1000);
  }

  function showResults(): void {
    clearQuestionTimer();
    const tier = pickTier(setup.tiers, numCorrect);
    if (tier.win) window.setTimeout(startConfetti, 700);
    quiz.classList.add('is-arrived');

    const wrap = document.createElement('div');
    wrap.className = 'result';

    // Fahrtbilanz: dieselben 10 Halte, gross, mit ihren Haken und Kreuzen.
    const summary = document.createElement('ol');
    summary.className = 'result__route';
    summary.setAttribute('aria-hidden', 'true');
    stops.forEach((stop, i) => {
      const copy = stop.cloneNode(true) as HTMLElement;
      copy.classList.remove('is-current');
      copy.style.setProperty('--i', String(i));
      summary.append(copy);
    });

    const score = document.createElement('div');
    score.className = tier.win ? 'result__score is-win' : 'result__score is-loss';

    const txt = document.createElement('div');
    txt.id = 'result-text';
    txt.textContent = tier.text;

    const action = document.createElement('div');
    action.className = 'result__action';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = tier.win ? 'Preis abholen' : 'Zurück zum Start';
    btn.className = tier.win ? 'btn result__cta' : 'btn result__cta is-home';
    btn.addEventListener('click', () => {
      btn.disabled = true;
      const message: QuizResultMessage = tier.win ? 'prizeCollected' : 'quizFailed';
      // Gleiche Herkunft (iframe im selben Dokument), daher kein Wildcard-Target.
      window.parent.postMessage(message, window.location.origin);
      showDispatch(action, tier.win);
    });
    action.append(btn);

    // Die Lok des Levels faehrt zur Ankunft ein.
    if (setup.loco) {
      const loco = document.createElement('img');
      loco.className = 'result__loco';
      loco.src = setup.loco;
      loco.alt = '';
      wrap.append(loco);
    }
    wrap.append(summary, score, txt, action);
    container.classList.remove('no-image');
    container.replaceChildren(wrap);

    // Der Punktestand zaehlt sichtbar von 00 hoch, statt einfach dazustehen.
    const total = pad2(round.length);
    const line = (n: number): string => `${pad2(n)} VON ${total} RICHTIG`;
    const scoreBoard = createFlapBoard(score, line(0));
    score.setAttribute('aria-label', `${numCorrect} von ${round.length} richtig`);
    window.setTimeout(() => scoreBoard.set(line(numCorrect)), 650);
  }

  function updateRoute(): void {
    stops.forEach((stop, i) => stop.classList.toggle('is-current', i === idx));
    counter.set(`${pad2(idx + 1)}/${pad2(round.length)}`, { direct: true });
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
  setupRipples();

  const first = round[0];
  if (!first) {
    qText.textContent = 'Keine Fragen konfiguriert.';
    return;
  }
  for (const q of round) preload(q.image);
  showQuestion(first);
  resetInactivity();
}
