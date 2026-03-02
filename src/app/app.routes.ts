import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetail } from './components/product-detail/product-detail';
import { Home } from './components/home/home';
import { Cart } from './components/cart/cart';
import { Checkout } from './components/checkout/checkout';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import { UserProfile } from './components/user-profile/user-profile';
import { CheckEmail } from './components/check-email/check-email';
import { EmailVerified } from './components/email-verified/email-verified';
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },

  { path: 'product', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetail },
  { path: 'cart', component: Cart }, // Shopping cart
  { path: 'checkout', component: Checkout }, // Checkout page
  { path: 'signin', component: Login }, // Login page
  { path: 'signup', component: Signup }, // Signup page
  {
    path: 'check-email',
    component: CheckEmail,
  },
  {
    // This path must match the link in emailTemplate.js:
    // ${clientUrl}/auth/verify-email/:token
    path: 'auth/verify-email/:token',
    component: EmailVerified,
  },
  { path: 'profile', component: UserProfile }, // User profile
  { path: '**', redirectTo: '/404' },
  { path: '**', redirectTo: '/products' },
];
