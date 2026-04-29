import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private id = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string) {
    this.push('success', message);
  }
  error(message: string) {
    this.push('error', message);
  }
  info(message: string) {
    this.push('info', message);
  }

  private push(type: Toast['type'], message: string) {
    const t: Toast = { id: ++this.id, type, message };
    this.toasts.update((arr) => [...arr, t]);
    setTimeout(() => this.dismiss(t.id), 4000);
  }

  dismiss(id: number) {
    this.toasts.update((arr) => arr.filter((t) => t.id !== id));
  }
}
