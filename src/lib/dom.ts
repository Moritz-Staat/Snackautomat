/**
 * Typisierte DOM-Zugriffe. `el` wirft bewusst laut, wenn ein Element fehlt:
 * ein Tippfehler in einer ID soll beim Testen sofort auffallen und nicht erst
 * auf der Messe als stiller Ausfall.
 */
export function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) {
    throw new Error(`Element mit id="${id}" nicht gefunden`);
  }
  return found as T;
}

/** Wie `el`, aber fuer Elemente, die nur auf manchen Seiten vorkommen. */
export function optionalEl<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export function onReady(fn: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}
