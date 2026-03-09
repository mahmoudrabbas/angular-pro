// services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  products?: ChatProduct[];
  timestamp: Date;
}

export interface ChatProduct {
  _id: string;
  name: string;
  price: number;
  shortDescription?: string;
  image: string | null;
  inStock: boolean;
  rating: number;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  products: ChatProduct[];
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly apiUrl = `${environment.apiUrl}/api/chat`;

  constructor(private http: HttpClient) {}

  sendMessage(
    message: string,
    history: { role: string; text: string }[],
  ): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.apiUrl, { message, history });
  }
}
