import { config } from './config';
import type { RelayEndpoint } from './types';

/**
 * Loest ein Relais am Microcontroller aus.
 *
 * Bewusst fire-and-forget: der Automat steht auf Messen ohne Internet, und der
 * Controller haengt nur im lokalen Netz. Faellt er aus oder ist gar keine IP
 * konfiguriert, darf das die Bedienung nicht blockieren.
 */
export function triggerRelay(endpoint: RelayEndpoint): void {
  if (!config.relais_ip) return;

  const url = `${config.relais_ip}${config.relais_endpunkte[endpoint]}?param=1`;
  void fetch(url, { method: 'POST' }).catch(() => {
    /* Relais nicht erreichbar — im Messebetrieb kein Grund zum Abbruch. */
  });
}
