import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- MUY IMPORTANTE para [(ngModel)]
import { ProxySettingsStore } from '../../core/services/proxy-settings.store';
import { checkExtension } from '../../core/utils/helpers';
import { ProxySettings } from '../../core/models/core.model';

// Importa los iconos que creaste
import { ArrowDownIcon } from '../icons/arrow-down-icon/arrow-down-icon';
import { CheckIcon } from '../icons/check-icon/check-icon';
import { InfoIcon } from '../icons/info-icon/info-icon';
import { CloseIcon } from '../icons/close-icon/close-icon';

@Component({
  selector: 'app-settings-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ArrowDownIcon, CheckIcon, InfoIcon, CloseIcon],
  templateUrl: './settings-dialog.html',
  styleUrl: './settings-dialog.css',
})
export class SettingsDialog implements OnInit, AfterViewInit {
  // Reemplaza defineEmits
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<ProxySettings>();

  // Inyecta el store
  private proxyStore = inject(ProxySettingsStore);

  // Reemplaza 'ref'
  public YTC_BRIDGE_GITHUB_URL = 'https://github.com/LuanRT/ytc-bridge';
  public showInfoText = signal(false);
  public usingExtension = signal(false);
  public isSaving = signal(false);
  public hostError = signal('');
  public portError = signal('');

  public localSettings = signal<ProxySettings>({ ...this.proxyStore.settings() });

  // Reemplaza 'ref="dialogRef"'
  @ViewChild('dialogRef') dialogRef!: ElementRef<HTMLElement>;

  // Reemplaza 'computed' (la sintaxis es casi idéntica)
  public isFormValid = computed(() => {
    const port = this.localSettings().port;
    const isPortValid = port === '' || (Number(port) > 0 && Number(port) <= 65535);

    return (
      this.localSettings().host.trim() !== '' &&
      isPortValid &&
      !this.hostError() &&
      !this.portError()
    );
  });

  // Reemplaza onMounted (lógica)
  ngOnInit() {
    this.usingExtension.set(checkExtension());
    this.showInfoText.set(!this.proxyStore.isProxyConfigured() && !this.usingExtension());
  }

  // Reemplaza onMounted (interacción con DOM)
  ngAfterViewInit() {
    this.dialogRef.nativeElement.focus();
  }

  updateSettings(key: keyof ProxySettings, value: string | number) {
    this.localSettings.update((current) => ({
      ...current,
      [key]: value,
    }));

    // Validamos sobre la marcha
    if (key === 'host') this.validateHost();
    if (key === 'port') this.validatePort();
  }

  validateHost() {
    // FIX: Lee el valor del signal
    const host = this.localSettings().host.trim();
    if (!host) {
      this.hostError.set('Host is required');
      return;
    }
    const hostnameRegex = /^[a-zA-Z0-9.-]+$/;
    if (!hostnameRegex.test(host)) {
      this.hostError.set('Invalid hostname format');
      return;
    }
    this.hostError.set('');
  }

  validatePort() {
    // FIX: Lee el valor del signal
    const port = this.localSettings().port;
    if (port === '' || port === null) {
      this.portError.set('');
      return;
    }
    // ... (resto de la función sin cambios) ...
    const portNumber = Number(port);
    if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
      this.portError.set('Port must be between 1 and 65535');
      return;
    }
    this.portError.set('');
  }

  handleClose() {
    this.close.emit(); // Emite el evento 'close'
  }

  async handleSave() {
    this.validateHost();
    this.validatePort();
    if (!this.isFormValid()) return;

    this.isSaving.set(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.save.emit(this.localSettings()); // Emite el evento 'save' con los datos
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      this.isSaving.set(false);
    }
  }
}
