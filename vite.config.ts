import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

/**
 * Medien (Bilder, Videos, Fonts) liegen im Repo-Root neben dist/ und werden
 * bewusst NICHT gebundelt: die Screensaver-Videos allein sind ~123 MB, und
 * dist/ wird mitcommittet. Sie werden root-absolut referenziert
 * (/Images/..., /QuizImages/..., /fonts/...), damit die Pfade unabhaengig
 * von der Verzeichnistiefe der jeweiligen Seite aufgehen.
 *
 * Voraussetzung im Betrieb: Docroot des Webservers = Repo-Root,
 * Einstiegspunkt /dist/Automat.html. Siehe README, Abschnitt Deployment.
 */
const REPO_ROOT = import.meta.dirname;
const MEDIA_DIRS = ['Images', 'QuizImages', 'fonts'];
/** Optionale, nicht versionierte Laufzeitkonfiguration — darf fehlen. */
const RUNTIME_CONFIG = '/config.local.js';

const MIME: Record<string, string> = {
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
  '.js': 'text/javascript',
};

function isPassthrough(urlPath: string): boolean {
  return (
    urlPath === RUNTIME_CONFIG ||
    MEDIA_DIRS.some((d) => urlPath.startsWith(`/${d}/`))
  );
}

function mediaPlugin(): Plugin {
  return {
    name: 'snackautomat:media',
    enforce: 'pre',

    /**
     * Zur Bauzeit bleiben diese URLs unangetastet — Rollup soll sie weder
     * aufloesen noch nach dist/ kopieren.
     */
    resolveId(id) {
      return isPassthrough(id) ? { id, external: true } : null;
    },

    /**
     * Zur Entwicklungszeit liegen die Medien ausserhalb der Vite-Root
     * (src/pages) und publicDir ist aus — ohne diese Middleware liefe jeder
     * /Images/-Aufruf im Dev-Server ins Leere. Sie bildet nach, was im
     * Betrieb der Webserver mit Docroot auf dem Repo-Root tut.
     */
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = decodeURIComponent((req.url ?? '').split('?')[0] ?? '');
        if (!isPassthrough(urlPath)) return next();

        // Pfad-Traversal ausschliessen: der aufgeloeste Pfad muss im Repo liegen.
        const full = normalize(join(REPO_ROOT, urlPath));
        if (!full.startsWith(REPO_ROOT + sep)) {
          res.statusCode = 403;
          return res.end('Forbidden');
        }

        let size: number;
        try {
          const stat = statSync(full);
          if (!stat.isFile()) throw new Error('kein File');
          size = stat.size;
        } catch {
          // config.local.js darf fehlen — das ist der Normalfall.
          res.statusCode = 404;
          return res.end('Not found');
        }

        res.setHeader('Content-Type', MIME[extname(full).toLowerCase()] ?? 'application/octet-stream');
        res.setHeader('Content-Length', String(size));
        createReadStream(full).pipe(res);
        return undefined;
      });
    },

    /**
     * Das Tag fuer die optionale Laufzeitkonfiguration wird erst nach der
     * HTML-Verarbeitung eingehaengt. Stuende es im Quell-HTML, wuerde Vite
     * versuchen es zu bundeln und es am Ende schlicht entfernen.
     *
     * Bewusst ein klassisches Script (kein type="module"): es muss synchron
     * VOR den deferred Modul-Bundles laufen, damit window.AUTOMAT_CONFIG
     * gesetzt ist, wenn src/lib/config.ts es liest. Fehlt die Datei, gibt es
     * einen 404 in der Konsole und sonst nichts — die Voreinstellungen greifen.
     */
    transformIndexHtml: {
      order: 'post',
      handler() {
        return [{ tag: 'script', attrs: { src: RUNTIME_CONFIG }, injectTo: 'head-prepend' }];
      },
    },
  };
}

const page = (...segments: string[]) => resolve(REPO_ROOT, 'src/pages', ...segments);

export default defineConfig(({ command }) => ({
  root: resolve(REPO_ROOT, 'src/pages'),
  publicDir: false,
  // Im Betrieb liegen die Seiten unter /dist/, im Dev-Server direkt unter /.
  // Der Code liest den Wert ueber import.meta.env.BASE_URL, damit die
  // Rueckkehr zur Startseite in beiden Faellen stimmt.
  base: command === 'build' ? '/dist/' : '/',
  plugins: [mediaPlugin()],
  // Gemeinsame Module liegen in src/lib, also ausserhalb der Vite-Root.
  server: { fs: { allow: [resolve(REPO_ROOT, 'src')] } },
  build: {
    outDir: resolve(REPO_ROOT, 'dist'),
    emptyOutDir: true,
    target: 'es2020',
    rollupOptions: {
      input: {
        automat: page('Automat.html'),
        level1: page('Einzelseiten/level1.html'),
        level2: page('Einzelseiten/level2.html'),
        level3: page('Einzelseiten/level3.html'),
        quiz1: page('Einzelseiten/QuizLevel1/index.html'),
        quiz2: page('Einzelseiten/QuizLevel2/index.html'),
        quiz3: page('Einzelseiten/QuizLevel3/index.html'),
      },
    },
  },
}));
