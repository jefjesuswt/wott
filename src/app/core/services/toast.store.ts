import { Injectable, signal, WritableSignal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type?: 'error' | 'info';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastStore {
  private nextId = 0;
  public toasts: WritableSignal<Toast[]> = signal([]);

  addToast(message: string, type: 'error' | 'info' = 'info', duration = 3000) {
    const id = this.nextId++;
    this.toasts.update((current) => [...current, { id, message, type, duration }]);
    return id;
  }

  removeToast(id: number) {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
