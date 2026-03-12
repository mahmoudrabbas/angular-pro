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
      content: '123 shalbi st-Minia ',
      href: 'https://maps.google.com',
    },
    {
      icon: 'fas fa-envelope',
      title: 'Mail Us',
      content: 'info@sooq.com',
      href: 'mailto:info@sooq.com',
    },
    {
      icon: 'fas fa-phone-alt',
      title: 'Telephone',
      content: '(+012) 3456 7890',
      href: 'tel:+01234567890',
    },
    {
      icon: 'fas fa-globe',
      title: 'Website',
      content: 'support@sooq.com',
      href: 'https://sooq.com',
    },
  ];

  quickLinks = [
    { label: 'Home', link: '/home' },
    { label: 'Shop', link: '/shop' },
    { label: 'About Us', link: '/about' },
    { label: 'Contact Us', link: '/contact' },
    { label: 'Track Your Order', link: '/orders' },
    { label: 'Wishlist', link: '/wishlists' },
  ];

  helpLinks = [
    { label: 'FAQ', link: '/faq' },
    { label: 'Returns & Refunds', link: '/returns' },
    { label: 'Delivery Information', link: '/orders' },
    { label: 'Privacy Policy', link: '/privacy' },
    { label: 'Terms & Conditions', link: '/terms' },
    { label: 'My Account', link: '/profile' },
  ];
}
