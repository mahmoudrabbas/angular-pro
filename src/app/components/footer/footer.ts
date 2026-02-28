import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  contactInfo = [
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Address',
      content: '123 Street New York.USA',
    },
    {
      icon: 'fas fa-envelope',
      title: 'Mail Us',
      content: 'info@example.com',
    },
    {
      icon: 'fa fa-phone-alt',
      title: 'Telephone',
      content: '(+012) 3456 7890',
    },
    {
      icon: 'fab fa-firefox-browser',
      title: 'Yoursite@ex.com',
      content: '(+012) 3456 7890',
    },
  ];

  customerServiceLinks = [
    { label: 'Contact Us', link: '/contact' },
    { label: 'Returns', link: '/returns' },
    { label: 'Order History', link: '/order-history' },
    { label: 'Site Map', link: '/sitemap' },
    { label: 'Testimonials', link: '/testimonials' },
    { label: 'My Account', link: '/my-account' },
    { label: 'Unsubscribe Notification', link: '/unsubscribe' },
  ];

  informationLinks = [
    { label: 'About Us', link: '/about' },
    { label: 'Delivery Information', link: '/delivery' },
    { label: 'Privacy Policy', link: '/privacy' },
    { label: 'Terms & Conditions', link: '/terms' },
    { label: 'Warranty', link: '/warranty' },
    { label: 'FAQ', link: '/faq' },
    { label: 'Seller Login', link: '/seller-login' },
  ];

  extrasLinks = [
    { label: 'Brands', link: '/brands' },
    { label: 'Gift Vouchers', link: '/gift-vouchers' },
    { label: 'Affiliates', link: '/affiliates' },
    { label: 'Wishlist', link: '/wishlist' },
    { label: 'Order History', link: '/order-history' },
    { label: 'Track Your Order', link: '/track-order' },
  ];

  onSubscribe(email: string): void {
    console.log('Newsletter subscription:', email);
    // Implement newsletter subscription logic
  }
}
