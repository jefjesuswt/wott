import { Component, OnDestroy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para @for
import { ToastStore } from '../../core/services/toast.store';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.html',
  styleUrl: './toast-notification.css',
})
export class ToastNotification implements OnDestroy {
  // 1. Inyectamos el servicio
  public toastStore = inject(ToastStore);

  // 2. Replicamos el Map de timeouts
  private timeouts = new Map<number, any>();

  constructor() {
    // 3. Replicamos 'watchEffect' con 'effect'
    effect(() => {
      const toasts = this.toastStore.toasts(); // Leemos el signal

      toasts.forEach((toast) => {
        if (!this.timeouts.has(toast.id)) {
          const timeout = setTimeout(() => {
            this.removeToastNotification(toast.id);
          }, toast.duration || 5000);
          this.timeouts.set(toast.id, timeout);
        }
      });
    });
  }

  // 4. Esta función es TypeScript puro, se copia tal cual
  removeToastNotification(id: number) {
    if (this.timeouts.has(id)) {
      clearTimeout(this.timeouts.get(id)!);
      this.timeouts.delete(id);
    }
    this.toastStore.removeToast(id); // Llamamos al método del servicio
  }

  // 5. Replicamos 'onUnmounted'
  ngOnDestroy() {
    this.timeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.timeouts.clear();
  }
}
