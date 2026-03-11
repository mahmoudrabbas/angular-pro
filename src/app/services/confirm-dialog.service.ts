import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  visible = signal(false);
  title = signal('');
  message = signal('');

  private resolvePromise!: (value: boolean) => void;

  open(title: string, message: string): Promise<boolean> {
    this.title.set(title);
    this.message.set(message);
    this.visible.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  confirm(): void {
    this.visible.set(false);
    this.resolvePromise(true);
  }

  cancel(): void {
    this.visible.set(false);
    this.resolvePromise(false);
  }
}
