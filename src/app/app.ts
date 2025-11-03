import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // Necesario para @if, @for, [class]
import { Innertube, YTNodes } from 'youtubei.js/web';

// Importa tus servicios y providers
import { ProxySettingsStore } from './core/services/proxy-settings.store';
import { ToastStore } from './core/services/toast.store';
import { INNERTUBE_INSTANCE } from './core/providers/innertube-provider';
import { ProxySettings } from './core/models/core.model';
import { checkExtension, configImageHttpProxy, handleImageError } from './core/utils/helpers';
import { BotguardService } from './core/services/botguard';
import { useDebounce } from './core/utils/useDebounce';
import { SearchIcon } from './components/icons/search-icon/search-icon';
import { HomeIcon } from './components/icons/home-icon/home-icon';
import { SadFaceIcon } from './components/icons/sad-face-icon/sad-face-icon';
import { SettingsIcon } from './components/icons/settings-icon/settings-icon';
import { SettingsDialog } from './components/settings-dialog/settings-dialog';
import { ToastNotification } from './components/toast-notification/toast-notification';

// Define el tipo para los resultados de búsqueda
interface SearchResult {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration?: string | null;
  views?: string | null;
}

@Component({
  selector: 'app-root', // El selector en index.html
  standalone: true,
  // Importa todo lo que usas en la plantilla
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    SearchIcon,
    HomeIcon,
    SadFaceIcon,
    SettingsIcon,
    SettingsDialog,
    ToastNotification,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  // Inyección de Dependencias (reemplaza 'use...' y 'inject' de Vue)
  private router = inject(Router);
  private proxyStore = inject(ProxySettingsStore);
  private toastStore = inject(ToastStore);
  private botguardService = inject(BotguardService); // Lo inyectamos para que se inicialice

  // Inyectamos el *valor* de la promesa del proveedor
  // Usamos 'optional: true' para manejar el caso de error donde devuelve 'undefined'
  private innertube = inject(INNERTUBE_INSTANCE, { optional: true });

  // Estado (reemplaza 'ref' de Vue)
  searchQuery = signal('');
  searchResults = signal<SearchResult[]>([]);
  isLoading = signal(false);
  highlightedIndex = signal(-1);
  showSettingsDialog = signal(false);

  // Exponemos la función al template
  public handleImageError = handleImageError;

  constructor() {
    // La inicialización de Innertube y Botguard ahora ocurre en los providers
    // Platform.shim.eval... (Esta lógica debería ir en el innertube.provider.ts)
  }

  ngOnInit() {
    // Esto reemplaza tu 'onMounted'
    const isExtensionInstalled = checkExtension();
    const isProxyConfigured = this.proxyStore.isProxyConfigured(); // () para leer el computed signal

    if (!isProxyConfigured && !isExtensionInstalled) {
      this.showSettingsDialog.set(true);
    }

    if (!isExtensionInstalled && isProxyConfigured) {
      configImageHttpProxy(this.proxyStore.settings());
    }
  }

  // --- Lógica de Búsqueda (Copiada de App.vue) ---

  // Creamos la función debounced
  private performSearch = useDebounce(async () => {
    if (!this.searchQuery()) {
      this.searchResults.set([]);
      return;
    }

    this.isLoading.set(true);

    // Esperamos al innertube (que es una promesa)
    const innertube = await this.innertube;
    if (!innertube) {
      this.isLoading.set(false);
      return;
    }

    try {
      const search = await innertube.actions.execute('/search', {
        query: this.searchQuery(),
        parse: true,
      });

      if (!search.contents_memo) {
        this.searchResults.set([]);
      } else {
        const results = search.contents_memo.getType(YTNodes.Video, YTNodes.CompactVideo);
        if (results) {
          this.searchResults.set(
            results.map((result) => ({
              id: result.video_id,
              title: result.title.toString(),
              channel: result.author?.name || 'Unknown',
              thumbnail: result.thumbnails[0].url,
              duration: result.duration?.text || null,
              views: result.view_count?.text || null,
            })),
          );
          this.highlightedIndex.set(this.searchResults().length > 0 ? 0 : -1);
        } else {
          this.searchResults.set([]);
        }
      }
    } catch (error) {
      console.error('[App]', 'Search failed', error);
      this.toastStore.addToast('Search failed.', 'error');
      this.searchResults.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }, 300);

  // Manejador del evento input
  handleSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
    this.performSearch();
  }

  clearSearch() {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.highlightedIndex.set(-1);
  }

  navigateResults(direction: 'up' | 'down') {
    const results = this.searchResults();
    if (results.length === 0) return;

    if (direction === 'down') {
      this.highlightedIndex.update((i) => (i + 1) % results.length);
    } else {
      this.highlightedIndex.update((i) => (i <= 0 ? results.length - 1 : i - 1));
    }
  }

  selectHighlightedVideo() {
    const index = this.highlightedIndex();
    const result = this.searchResults()[index];
    if (result) {
      this.selectVideo(result.id);
    }
  }

  selectVideo(id: string) {
    this.clearSearch();
    this.router.navigate(['/watch', id]);
  }

  saveSettings(newSettings: ProxySettings) {
    this.proxyStore.setSettings(newSettings);
    this.showSettingsDialog.set(false);
  }
}
