import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ScriptInitService {
  private initializedCarousels = new Set<string>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  initCarousel(selector: string, options: any = {}): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const $ = (window as any).$;

    if (!$) {
      console.error('❌ jQuery not found. Make sure jquery@3.2.1 is in angular.json scripts.');
      return;
    }

    if (!$.fn || !$.fn.owlCarousel) {
      console.error('❌ OwlCarousel plugin not found. Check angular.json scripts order.');
      return;
    }

    const $el = $(selector);

    if (!$el.length) {
      console.warn(`⚠️ Carousel element not found: ${selector}`);
      return;
    }

    // Destroy cleanly if already initialized (prevents double-init crash)
    if ($el.hasClass('owl-loaded')) {
      try {
        $el.trigger('destroy.owl.carousel');
        $el.removeClass('owl-carousel owl-loaded owl-hidden');
        this.initializedCarousels.delete(selector);
        console.log(`🗑️ Existing carousel destroyed: ${selector}`);
      } catch (e) {
        console.warn('⚠️ Could not destroy existing carousel:', e);
      }
    }

    const defaultOptions = {
      autoplay: true,
      smartSpeed: 1500,
      items: 1,
      dots: false,
      loop: true,
      nav: true,
      navText: ['<i class="bi bi-chevron-left"></i>', '<i class="bi bi-chevron-right"></i>'],
    };

    try {
      $el.owlCarousel({ ...defaultOptions, ...options });
      this.initializedCarousels.add(selector);

      // Force stage width recalculation after init
      setTimeout(() => {
        $el.trigger('refresh.owl.carousel');
        console.log(`🔄 Carousel refreshed: ${selector}`);
      }, 100);

      console.log(`✅ Carousel initialized: ${selector}`);
    } catch (error) {
      console.error(`❌ owlCarousel() failed for "${selector}":`, error);
    }
  }

  destroyCarousel(selector: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const $ = (window as any).$;
    if (!$) return;

    const $el = $(selector);

    if ($el.length && $el.hasClass('owl-loaded')) {
      try {
        $el.trigger('destroy.owl.carousel');
        $el.removeClass('owl-carousel owl-loaded owl-hidden');
        this.initializedCarousels.delete(selector);
        console.log(`🗑️ Carousel destroyed: ${selector}`);
      } catch (error) {
        console.error(`❌ Error destroying carousel "${selector}":`, error);
      }
    }
  }

  initWOW(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const WOW = (window as any).WOW;

    if (!WOW) {
      console.warn('⚠️ WOW.js not found. Check angular.json scripts.');
      return;
    }

    try {
      new WOW({ live: false }).init();
      console.log('✅ WOW.js initialized');
    } catch (error) {
      console.error('❌ WOW.js init failed:', error);
    }
  }

  initCounterUp(selector: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const $ = (window as any).$;

    if (!$) {
      console.warn('⚠️ jQuery not found for CounterUp.');
      return;
    }

    if (!$.fn || !$.fn.counterUp) {
      console.warn('⚠️ counterUp plugin not found.');
      return;
    }

    try {
      $(selector).counterUp({ delay: 10, time: 2000 });
      console.log(`✅ CounterUp initialized: ${selector}`);
    } catch (error) {
      console.error(`❌ CounterUp failed for "${selector}":`, error);
    }
  }
}
