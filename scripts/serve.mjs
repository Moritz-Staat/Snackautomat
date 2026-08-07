/**
 * Minimaler statischer Webserver zum Testen des Produktionsaufbaus.
 *
 * Bildet genau das nach, was im Betrieb nginx/Apache tun: Docroot ist das
 * Repo-Root, Einstiegspunkt /dist/Automat.html. Damit lassen sich die
 * root-absoluten Medienpfade (/Images/, /QuizImages/, /fonts/) und die
 * optionale /config.local.js so testen, wie sie auf der Messe ausgeliefert
 * werden.
 *
 * Ohne Abhaengigkeiten, damit das auch auf einem frisch geklonten Rechner
 * ohne npm install laeuft:
 *
 *     node scripts/serve.mjs [--port 8080] [--host 0.0.0.0]
 *
 * Fuer den echten Dauerbetrieb auf der Messe trotzdem einen richtigen
 * Webserver nehmen — das hier ist ein Testwerkzeug.
 */
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = normalize(join(fileURLToPath(new URL('.', import.meta.url)), '..'));

const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
const PORT = Number(argOf('--port', '8080'));
const HOST = argOf('--host', '127.0.0.1');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
};

const server = createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad Request');
    return;
  }

  if (urlPath === '/') urlPath = '/dist/Automat.html';

  const full = normalize(join(ROOT, urlPath));
  // Pfad-Traversal ausschliessen.
  if (full !== ROOT && !full.startsWith(ROOT + sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  let stat;
  try {
    stat = statSync(full);
  } catch {
    // /config.local.js darf fehlen — das ist der dokumentierte Normalfall.
    res.writeHead(404).end('Not found');
    return;
  }
  if (!stat.isFile()) {
    res.writeHead(404).end('Not found');
    return;
  }

  const type = MIME[extname(full).toLowerCase()] ?? 'application/octet-stream';
  const range = req.headers.range;

  // Range-Support: ohne ihn spult Chrome die Screensaver-Videos nicht sauber.
  if (range && /^bytes=\d*-\d*$/.test(range)) {
    const [startRaw, endRaw] = range.replace('bytes=', '').split('-');
    const start = startRaw ? Number(startRaw) : 0;
    const end = endRaw ? Number(endRaw) : stat.size - 1;
    if (start >= stat.size || end >= stat.size || start > end) {
      res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end();
      return;
    }
    res.writeHead(206, {
      'Content-Type': type,
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': String(end - start + 1),
    });
    createReadStream(full, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': String(stat.size),
    'Accept-Ranges': 'bytes',
    // Kiosk-Test: nichts cachen, damit ein Rebuild sofort sichtbar ist.
    'Cache-Control': 'no-store',
  });
  createReadStream(full).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`Docroot:   ${ROOT}`);
  console.log(`Startseite http://${HOST}:${PORT}/dist/Automat.html`);
  console.log('Beenden mit Strg+C');
});
