import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  isAllCategoriesOpen = false; // For the categories sidebar
  isPagesDropdownOpen = false; // For pages submenu
  isMobileCategoriesOpen = false; // For mobile categories dropdown
  isMobileMenuOpen = false; // For mobile navbar collapse

  searchQuery = '';
  selectedCategory = 'All Category';
  selectedCurrency = 'USD';
  selectedLanguage = 'English';

  categories = ['All Category', 'Category 1', 'Category 2', 'Category 3', 'Category 4'];
  currencies = ['USD', 'Euro', 'Dolar'];
  languages = ['English', 'Turkish', 'Spanish', 'Italiano'];

  // Categories for the sidebar
  sidebarCategories = [
    { name: 'Accessories', count: 3 },
    { name: 'Electronics & Computer', count: 5 },
    { name: 'Laptops & Desktops', count: 2 },
    { name: 'Mobiles & Tablets', count: 8 },
    { name: 'SmartPhone & Smart TV', count: 5 },
  ];

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
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
}
