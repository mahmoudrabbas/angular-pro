import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetail } from './components/product-detail/product-detail';
import { Home } from './components/home/home';
import { Cart } from './components/cart/cart';
import { Checkout } from './components/checkout/checkout';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import { UserProfile } from './components/user-profile/user-profile';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'products', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetail },
  { path: 'cart', component: Cart }, // Shopping cart
  { path: 'checkout', component: Checkout }, // Checkout page
  { path: 'login', component: Login }, // Login page
  { path: 'signup', component: Signup }, // Signup page
  { path: 'profile', component: UserProfile }, // User profile
  { path: '**', redirectTo: '/404' },
  { path: '**', redirectTo: '/products' },
];
