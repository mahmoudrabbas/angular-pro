import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent {
  services = [
    {
      icon: 'fa fa-sync-alt',
      title: 'Free Return',
      description: '30 days money back guarantee!',
      delay: '0.1s',
    },
    {
      icon: 'fab fa-telegram-plane',
      title: 'Free Shipping',
      description: 'Free shipping on all order',
      delay: '0.2s',
    },
    {
      icon: 'fas fa-life-ring',
      title: 'Support 24/7',
      description: 'We support online 24 hrs a day',
      delay: '0.3s',
    },
    {
      icon: 'fas fa-credit-card',
      title: 'Receive Gift Card',
      description: 'Recieve gift all over oder $50',
      delay: '0.4s',
    },
    {
      icon: 'fas fa-lock',
      title: 'Secure Payment',
      description: 'We Value Your Security',
      delay: '0.5s',
    },
    {
      icon: 'fas fa-blog',
      title: 'Online Service',
      description: 'Free return products in 30 days',
      delay: '0.6s',
    },
  ];

  trackByTitle(index: number, item: any) {
    return item.title;
  }
}
