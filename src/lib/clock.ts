/**
 * Bahnhofsuhr. Der Sekundenzeiger laeuft in 58,5 s einmal herum und wartet
 * dann oben auf den Minutentakt, der Minutenzeiger springt. Der Lauf ist eine
 * reine CSS-Animation; JavaScript setzt nur einmal pro Minute die Stellung.
 */
const SVG_NS = 'http://www.w3.org/2000/svg';

function line(x1: number, y1: number, x2: number, y2: number, cls: string): SVGLineElement {
  const l = document.createElementNS(SVG_NS, 'line');
  l.setAttribute('x1', String(x1));
  l.setAttribute('y1', String(y1));
  l.setAttribute('x2', String(x2));
  l.setAttribute('y2', String(y2));
  l.setAttribute('class', cls);
  return l;
}

export function mountStationClock(host: HTMLElement): void {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', 'station-clock');
  svg.setAttribute('aria-hidden', 'true');

  const face = document.createElementNS(SVG_NS, 'circle');
  face.setAttribute('cx', '50');
  face.setAttribute('cy', '50');
  face.setAttribute('r', '47');
  face.setAttribute('class', 'station-clock__face');
  svg.append(face);

  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('transform', `rotate(${i * 6} 50 50)`);
    g.append(line(50, 6, 50, major ? 17 : 9.5, major ? 'station-clock__bar' : 'station-clock__tick'));
    svg.append(g);
  }

  const hour = document.createElementNS(SVG_NS, 'g');
  hour.setAttribute('class', 'station-clock__hand');
  hour.append(line(50, 60, 50, 24, 'station-clock__hour'));
  const minute = document.createElementNS(SVG_NS, 'g');
  minute.setAttribute('class', 'station-clock__hand');
  minute.append(line(50, 62, 50, 10, 'station-clock__minute'));
  const second = document.createElementNS(SVG_NS, 'g');
  second.setAttribute('class', 'station-clock__second');
  second.append(line(50, 66, 50, 22, 'station-clock__sec-line'));
  const disc = document.createElementNS(SVG_NS, 'circle');
  disc.setAttribute('cx', '50');
  disc.setAttribute('cy', '22');
  disc.setAttribute('r', '5.2');
  disc.setAttribute('class', 'station-clock__disc');
  second.append(disc);
  const hub = document.createElementNS(SVG_NS, 'circle');
  hub.setAttribute('cx', '50');
  hub.setAttribute('cy', '50');
  hub.setAttribute('r', '2');
  hub.setAttribute('class', 'station-clock__hub');

  svg.append(hour, minute, second, hub);
  host.replaceChildren(svg);

  function setHands(): void {
    const now = new Date();
    const m = now.getMinutes();
    const h = now.getHours() % 12;
    minute.style.transform = `rotate(${m * 6}deg)`;
    hour.style.transform = `rotate(${h * 30 + m * 0.5}deg)`;
    // Der Sekundenzeiger startet an der richtigen Stelle seines 60-s-Laufs.
    const intoMinute = now.getSeconds() + now.getMilliseconds() / 1000;
    second.style.animationDelay = `-${intoMinute}s`;
  }

  setHands();
  second.addEventListener('animationiteration', setHands);
}
