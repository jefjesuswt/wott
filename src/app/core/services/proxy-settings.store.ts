import { Injectable, signal, WritableSignal, computed } from '@angular/core';
import { ProxySettings } from '../models/core.model';

@Injectable({ providedIn: 'root' })
export class ProxySettingsStore {
  private PROXY_SETTINGS_KEY = 'proxy_settings';
  public settings: WritableSignal<ProxySettings>;
  public isProxyConfigured = computed(() => !!this.settings().host);

  constructor() {
    this.settings = signal(this.loadSettings());
  }

  private loadSettings(): ProxySettings {
    try {
      const saved = localStorage.getItem(this.PROXY_SETTINGS_KEY);
      if (saved) return JSON.parse(saved) as ProxySettings;
    } catch (e) {
      console.error('Failed to load proxy settings', e);
    }
    return { protocol: 'http', host: '', port: '' };
  }

  setSettings(newSettings: ProxySettings) {
    this.settings.set(newSettings);
    localStorage.setItem(this.PROXY_SETTINGS_KEY, JSON.stringify(newSettings));
    window.location.reload();
  }
}
