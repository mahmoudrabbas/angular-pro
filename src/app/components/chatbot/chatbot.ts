import {
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
  HostListener,
  Inject,
  PLATFORM_ID,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RouterModule } from '@angular/router';
import { ChatService, ChatMessage, ChatProduct } from '../../services/chat.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class Chatbot implements OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('chatWindow') chatWindow!: ElementRef;

  isOpen = false;
  isTyping = false;
  isMaximized = false;
  inputMessage = '';

  // ── Drag state ──────────────────────────────────────────────────────────────
  isDragging = false;
  dragOffsetX = 0;
  dragOffsetY = 0;
  posX: number | null = null; // null = use default CSS position
  posY: number | null = null;

  messages: ChatMessage[] = [
    {
      role: 'assistant',
      text: "👋 Hi! I'm Sooq's AI shopping assistant. Ask me anything — I'll help you find the perfect product!",
      timestamp: new Date(),
    },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private chatService: ChatService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Toggle open/close ───────────────────────────────────────────────────────
  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) setTimeout(() => this.scrollToBottom(), 100);
  }

  // ── Maximize / restore ──────────────────────────────────────────────────────
  toggleMaximize(): void {
    this.isMaximized = !this.isMaximized;
    // Reset drag position when maximizing so it fills the viewport properly
    if (this.isMaximized) {
      this.posX = null;
      this.posY = null;
    }
    setTimeout(() => this.scrollToBottom(), 150);
  }

  // ── Drag: mouse down on header ──────────────────────────────────────────────
  onDragStart(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button') || this.isMaximized) return;
    event.preventDefault();

    const el = this.chatWindow.nativeElement as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.dragOffsetX = event.clientX - rect.left;
    this.dragOffsetY = event.clientY - rect.top;

    // Initialize position from current rendered position so there's no jump
    if (this.posX === null) {
      this.posX = rect.left;
      this.posY = rect.top;
    }

    this.isDragging = true;
    this.cdr.detectChanges();

    // Run move/up listeners outside Angular zone for max performance
    this.ngZone.runOutsideAngular(() => {
      const onMove = (e: MouseEvent) => this.ngZone.run(() => this.applyDrag(e.clientX, e.clientY));
      const onUp = () => {
        this.ngZone.run(() => {
          this.isDragging = false;
          this.cdr.detectChanges();
        });
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  onTouchDragStart(event: TouchEvent): void {
    if ((event.target as HTMLElement).closest('button') || this.isMaximized) return;

    const touch = event.touches[0];
    const el = this.chatWindow.nativeElement as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.dragOffsetX = touch.clientX - rect.left;
    this.dragOffsetY = touch.clientY - rect.top;

    if (this.posX === null) {
      this.posX = rect.left;
      this.posY = rect.top;
    }

    this.isDragging = true;
    this.cdr.detectChanges();

    this.ngZone.runOutsideAngular(() => {
      const onMove = (e: TouchEvent) => {
        e.preventDefault();
        this.ngZone.run(() => {
          const t = e.touches[0];
          this.applyDrag(t.clientX, t.clientY);
        });
      };
      const onEnd = () => {
        this.ngZone.run(() => {
          this.isDragging = false;
          this.cdr.detectChanges();
        });
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
      };
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    });
  }

  private applyDrag(clientX: number, clientY: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = this.chatWindow.nativeElement as HTMLElement;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = el.offsetWidth;
    const h = el.offsetHeight;

    this.posX = Math.min(Math.max(0, clientX - this.dragOffsetX), vw - w);
    this.posY = Math.min(Math.max(0, clientY - this.dragOffsetY), vh - h);
  }

  // ── Computed style for the chat window ──────────────────────────────────────
  get windowStyle(): Record<string, string> {
    if (this.isMaximized || this.posX === null) return {};
    return {
      left: `${this.posX}px`,
      top: `${this.posY}px`,
      right: 'auto',
      bottom: 'auto',
    };
  }

  // ── Messaging ────────────────────────────────────────────────────────────────
  sendMessage(): void {
    const text = this.inputMessage.trim();
    if (!text || this.isTyping) return;

    this.messages.push({ role: 'user', text, timestamp: new Date() });
    this.inputMessage = '';
    this.isTyping = true;
    this.scrollToBottom();

    const history = this.messages
      .slice(1)
      .slice(0, -1)
      .map((m) => ({ role: m.role, text: m.text }));

    this.chatService
      .sendMessage(text, history)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.messages.push({
            role: 'assistant',
            text: res.reply,
            products: res.products?.length ? res.products : undefined,
            timestamp: new Date(),
          });
          this.isTyping = false;
          this.scrollToBottom();
        },
        error: () => {
          this.messages.push({
            role: 'assistant',
            text: "Sorry, I'm having trouble connecting. Please try again in a moment.",
            timestamp: new Date(),
          });
          this.isTyping = false;
          this.scrollToBottom();
        },
      });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    this.messages = [this.messages[0]];
  }

  getRatingStars(rating: number): string {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  }

  trackByIndex(index: number): number {
    return index;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }
}
