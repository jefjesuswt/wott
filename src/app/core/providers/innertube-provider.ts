import { inject, InjectionToken, Provider } from '@angular/core';
import { Innertube, UniversalCache } from 'youtubei.js/web';
import { fetchFunction } from '../utils/helpers';
import { ProxySettingsStore } from '../services/proxy-settings.store';
import { BotguardService } from '../services/botguard';
import { ToastStore } from '../services/toast.store';

export const INNERTUBE_INSTANCE = new InjectionToken<Innertube>('INNERTUBE_INSTANCE');

// 2. Define un "Proveedor" que sabe cómo crear la instancia
export function provideInnertube(): Provider {
  return {
    provide: INNERTUBE_INSTANCE,
    useFactory: async () => {
      // Inyectamos los servicios que necesitamos
      const proxyStore = inject(ProxySettingsStore);
      const botguardService = inject(BotguardService);
      const toastStore = inject(ToastStore);
      const settings = proxyStore.settings();

      try {
        console.info('[App]', `Initializing InnerTube API`);

        const instance = await Innertube.create({
          cache: new UniversalCache(true),
          // Pasamos la función fetch refactorizada con los settings
          fetch: (input, init) => fetchFunction(input, settings, init),
        });

        botguardService.init().then(() => {
          console.info('[App]', 'BotGuard client initialized');
        });

        // Preload del redirector
        const redirectorResponse = await fetchFunction(
          `https://redirector.googlevideo.com/initplayback?source=youtube&itag=0&pvi=0&pai=0&owc=yes&cmo:sensitive_content=yes&alr=yes&id=${Math.round(Math.random() * 1e5)}`,
          settings,
          { method: 'GET' },
        );
        const redirectorResponseUrl = await redirectorResponse.text();

        if (redirectorResponseUrl.startsWith('https://')) {
          localStorage.setItem('googlevideo_redirector', redirectorResponseUrl);
        }

        return instance;
      } catch (error) {
        toastStore.addToast('Failed to initialize InnerTube API', 'error');
        console.error('[App]', 'Failed to initialize Innertube', error);
        return undefined; // Devolvemos undefined en caso de error
      }
    },
  };
}
