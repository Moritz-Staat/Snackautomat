import { resolve } from 'node:path';
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
const MEDIA_PREFIXES = ['/Images/', '/QuizImages/', '/fonts/'];
/** Optionale, nicht versionierte Laufzeitkonfiguration — darf fehlen. */
const RUNTIME_CONFIG = '/config.local.js';

function keepMediaAbsolute(): Plugin {
  const passthrough = (id: string) =>
    id === RUNTIME_CONFIG || MEDIA_PREFIXES.some((p) => id.startsWith(p));

  return {
    name: 'snackautomat:keep-media-absolute',
    enforce: 'pre',
    resolveId(id) {
      return passthrough(id) ? { id, external: true } : null;
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
        return [
          { tag: 'script', attrs: { src: RUNTIME_CONFIG }, injectTo: 'head-prepend' },
        ];
      },
    },
  };
}

const page = (...segments: string[]) => resolve(import.meta.dirname, 'src/pages', ...segments);

export default defineConfig({
  root: resolve(import.meta.dirname, 'src/pages'),
  publicDir: false,
  base: '/dist/',
  plugins: [keepMediaAbsolute()],
  // Gemeinsame Module liegen in src/lib, also ausserhalb der Vite-Root.
  server: { fs: { allow: [resolve(import.meta.dirname, 'src')] } },
  build: {
    outDir: resolve(import.meta.dirname, 'dist'),
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
});
