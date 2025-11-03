import { inject, InjectionToken, Provider } from '@angular/core';
import {
  fetchFunction,
  loadCachedClientConfig,
  CLIENT_CONFIG_STORAGE_KEY,
  isConfigValid,
} from '../utils/helpers';
import { OnesieHotConfig } from '../models/core.model';
import { base64ToU8 } from 'googlevideo/utils';
import { ProxySettingsStore } from '../services/proxy-settings.store';

// 1. Define el Token
export const ONESIE_CONFIG = new InjectionToken<Promise<OnesieHotConfig | undefined>>(
  'ONESIE_CONFIG',
);

// 2. Define el Proveedor
export function provideOnesieConfig(): Provider {
  return {
    provide: ONESIE_CONFIG,
    useFactory: async () => {
      const proxyStore = inject(ProxySettingsStore);
      const settings = proxyStore.settings();

      const cachedConfig = loadCachedClientConfig();
      if (cachedConfig) {
        return cachedConfig;
      }

      try {
        const tvConfigResponse = await fetchFunction(
          'https://www.youtube.com/tv_config?action_get_config=true&client=lb4&theme=cl',
          settings,
          {
            method: 'GET',
            headers: { 'User-Agent': 'Mozilla/5.0 (ChromiumStylePlatform) Cobalt/Version' },
          },
        );

        const tvConfigJson = JSON.parse((await tvConfigResponse.text()).slice(4));
        const webPlayerContextConfig =
          tvConfigJson.webPlayerContextConfig.WEB_PLAYER_CONTEXT_CONFIG_ID_LIVING_ROOM_WATCH;
        const onesieHotConfig = webPlayerContextConfig.onesieHotConfig;

        const config: OnesieHotConfig = {
          clientKeyData: base64ToU8(onesieHotConfig.clientKey),
          keyExpiresInSeconds: onesieHotConfig.keyExpiresInSeconds,
          encryptedClientKey: base64ToU8(onesieHotConfig.encryptedClientKey),
          onesieUstreamerConfig: base64ToU8(onesieHotConfig.onesieUstreamerConfig),
          baseUrl: onesieHotConfig.baseUrl,
          timestamp: Date.now(),
        };

        localStorage.setItem(CLIENT_CONFIG_STORAGE_KEY, JSON.stringify(config));
        return config;
      } catch (error) {
        console.error('[App]', 'Failed to fetch Onesie client config', error);
        return undefined;
      }
    },
  };
}

// Helper para refrescar la config si es inválida
export function provideRefreshedOnesieConfig(): Provider {
  return {
    provide: ONESIE_CONFIG,
    useFactory: async () => {
      const config = await inject(ONESIE_CONFIG);
      if (config && !isConfigValid(config)) {
        localStorage.removeItem(CLIENT_CONFIG_STORAGE_KEY);
        return inject(provideOnesieConfig).useFactory(); // Recargamos
      }
      return config;
    },
  };
}
