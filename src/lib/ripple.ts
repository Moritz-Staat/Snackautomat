/**
 * Sofortige Antwort auf jede Beruehrung: ein Signalring am Finger, der kurz
 * nachklingt. Ein Automat, der beim Antippen nicht reagiert, wirkt kaputt.
 */
const MAX_RIPPLES = 4;

export function setupRipples(doc: Document = document): void {
  let live = 0;
  doc.addEventListener(
    'pointerdown',
    (event) => {
      if (live >= MAX_RIPPLES) return;
      const ring = doc.createElement('span');
      ring.className = 'ripple';
      ring.style.left = `${event.clientX}px`;
      ring.style.top = `${event.clientY}px`;
      live++;
      ring.addEventListener(
        'animationend',
        () => {
          ring.remove();
          live--;
        },
        { once: true },
      );
      doc.body.append(ring);
    },
    { passive: true },
  );
}
