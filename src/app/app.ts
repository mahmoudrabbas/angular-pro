import { Component, signal } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';
import { RouterOutlet } from '@angular/router';
import { Chatbot } from './components/chatbot/chatbot';
import { ToastComponent } from './components/toast/toast';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    RouterOutlet,
    Chatbot,
    ToastComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('E-commerece-project');
}
