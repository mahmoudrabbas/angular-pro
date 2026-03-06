import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class NavbarComponent implements OnInit {
  isLoading = true;
  isCurrencyDropdownOpen = false;
  isLanguageDropdownOpen = false;
  isDashboardDropdownOpen = false;
  isAllCategoriesOpen = false;
  isPagesDropdownOpen = false;
  isMobileCategoriesOpen = false;
  isMobileMenuOpen = false;

  searchQuery = '';
  selectedCategory = 'All Category';
  selectedCurrency = 'USD';
  selectedLanguage = 'English';

  categories = ['All Category', 'Category 1', 'Category 2', 'Category 3', 'Category 4'];
  currencies = ['USD', 'Euro', 'Dolar'];
  languages = ['English', 'Turkish', 'Spanish', 'Italiano'];

  sidebarCategories = [
    { name: 'Accessories', count: 3 },
    { name: 'Electronics & Computer', count: 5 },
    { name: 'Laptops & Desktops', count: 2 },
    { name: 'Mobiles & Tablets', count: 8 },
    { name: 'SmartPhone & Smart TV', count: 5 },
  ];

  // Inject the AuthService here
  constructor(
    public authService: AuthService,
    public cartService: CartService,
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
    // Load cart on init for badge count
    this.cartService.loadCart();
  }

  toggleDropdown(dropdown: string) {
    this.isCurrencyDropdownOpen = dropdown === 'currency' ? !this.isCurrencyDropdownOpen : false;
    this.isLanguageDropdownOpen = dropdown === 'language' ? !this.isLanguageDropdownOpen : false;
    this.isDashboardDropdownOpen = dropdown === 'dashboard' ? !this.isDashboardDropdownOpen : false;
  }

  toggleAllCategories() {
    this.isAllCategoriesOpen = !this.isAllCategoriesOpen;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onSearch() {
    console.log('Searching:', this.searchQuery, 'in:', this.selectedCategory);
  }

  // Add the logout method
  logout() {
    this.authService.signout();
    this.isDashboardDropdownOpen = false; // Close the dropdown menu after clicking
  }
}
