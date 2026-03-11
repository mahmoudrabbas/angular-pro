import { Injectable } from '@angular/core';

export interface Translation {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage = 'en';
  private translations: { [key: string]: Translation } = {
    en: {
      // Navigation
      'Shop': 'Shop',
      'Categories': 'Categories',
      'Pages': 'Pages',
      'About Us': 'About Us',
      'Contact Us': 'Contact Us',
      'My Account': 'My Account',
      'Dashboard': 'Dashboard',
      'Orders': 'Orders',
      'Wishlist': 'Wishlist',
      'Compare': 'Compare',
      'Cart': 'Cart',
      'Checkout': 'Checkout',
      'Login': 'Login',
      'Logout': 'Logout',
      'Register': 'Register',
      'All Category': 'All Category',
      'Electronics': 'Electronics',
      'Fashion': 'Fashion',
      'Gaming': 'Gaming',
      'Fitness': 'Fitness',
      'Books': 'Books',
      'Accessories': 'Accessories',
      'Electronics & Computer': 'Electronics & Computer',
      'Laptops & Desktops': 'Laptops & Desktops',
      'Mobiles & Tablets': 'Mobiles & Tablets',
      'SmartPhone & Smart TV': 'SmartPhone & Smart TV',
      'Currency': 'Currency',
      'Language': 'Language',
      'USD': 'USD',
      'EGP': 'EGP',
      'SAR': 'SAR',
      'English': 'English',
      'Arabic': 'Arabic',
      'Visual Search': 'Visual Search',
      'Drop your image here': 'Drop your image here',
      'or': 'or',
      'Choose File': 'Choose File',
      'Search': 'Search',
      'No results found': 'No results found',
      'Search results': 'Search results',
      'Loading': 'Loading',
      'Error': 'Error',
      'Something went wrong': 'Something went wrong'
    },
    ar: {
  
      'Shop': 'المتجر',
      'Categories': 'التصنيفات',
      'Pages': 'الصفحات',
      'About Us': 'من نحن',
      'Contact Us': 'اتصل بنا',
      'My Account': 'حسابي',
      'Dashboard': 'لوحة التحكم',
      'Orders': 'الطلبات',
      'Wishlist': 'المفضلة',
      'Compare': 'المقارنة',
      'Cart': 'السلة',
      'Checkout': 'الدفع',
      'Login': 'تسجيل الدخول',
      'Logout': 'تسجيل الخروج',
      'Register': 'التسجيل',
      'All Category': 'جميع التصنيفات',
      'Electronics': 'الإلكترونيات',
      'Fashion': 'الموضة',
      'Gaming': 'الألعاب',
      'Fitness': 'اللياقة',
      'Books': 'الكتب',
      'Accessories': 'اكسسوارات',
      'Electronics & Computer': 'الإلكترونيات والحاسوب',
      'Laptops & Desktops': 'الحواسيب المحمولة والمكتبية',
      'Mobiles & Tablets': 'الهواتف والأجهزة اللوحية',
      'SmartPhone & Smart TV': 'الهواتف الذكية والتلفزيون الذكي',
      'Currency': 'العملة',
      'Language': 'اللغة',
      'USD': 'دولار أمريكي',
      'EGP': 'جنيه مصري',
      'SAR': 'ريال سعودي',
      'English': 'الإنجليزية',
      'Arabic': 'العربية',
      'Visual Search': 'البحث البصري',
      'Drop your image here': 'اسقط صورتك هنا',
      'or': 'أو',
      'Choose File': 'اختر ملف',
      'Search': 'بحث',
      'No results found': 'لا توجد نتائج',
      'Search results': 'نتائج البحث',
      'Loading': 'جارٍ التحميل',
      'Error': 'خطأ',
      'Something went wrong': 'حدث خطأ ما',
      'Electro':'الكتورنيات سايت',
      'Home':'الرئسيه',
      'Our Products ':'منتجاتنا',
     'All Categories':'كل التصنيفات ',
     'All Products ':' كل المنتجات ',
     'Profile':' الصفحه الشخصيه ',
     'Top Selling':'اعلي مبيع',
       'Help':' المساعده',
     'Support':'الدعم',
     'Address':'العنوان ',
      
    }
  };

  constructor() {
    const savedLang = localStorage.getItem('language');
    if (savedLang && this.translations[savedLang]) {
      this.currentLanguage = savedLang;
    }
  }

  setLanguage(language: string): void {
    if (this.translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('language', language);
      // Dispatch event to notify components of language change
      window.dispatchEvent(new CustomEvent('languageChange', { detail: { language } }));
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getTranslation(key: string): string {
    return this.translations[this.currentLanguage][key] || key;
  }

  translateObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.getTranslation(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(item => this.translateObject(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const translated: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          translated[key] = this.translateObject(obj[key]);
        }
      }
      return translated;
    }
    return obj;
  }
}