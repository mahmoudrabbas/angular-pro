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
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { ResetPassword } from './components/reset-password/reset-password';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { Users } from './components/users/users';
import { AdminLayout } from './components/admin-layout/admin-layout';

import { CategoryListComponent } from './components/categories/category-list/category-list';
import { CategoryFormComponent } from './components/categories/category-form/category-form';

import { PaymentSuccess } from './components/payment-success/payment-success';
import { PaymentCancel } from './components/payment-cancel/payment-cancel';
import { PaymentFailed } from './components/payment-failed/payment-failed';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },

  { path: 'product', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetail },

  // Category management
  { path: 'categories', component: CategoryListComponent },
  { path: 'category/add', component: CategoryFormComponent },
  { path: 'category/edit/:id', component: CategoryFormComponent },

  { path: 'cart', component: Cart }, // Shopping cart
  { path: 'checkout', component: Checkout }, // Checkout page

  // Payment results
  { path: 'payment/success', component: PaymentSuccess }, // Payment success
  { path: 'payment/cancel', component: PaymentCancel },   // Payment cancelled
  { path: 'payment/failed', component: PaymentFailed },   // Payment failed

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

  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'users', component: Users },
      // add more admin child routes here
    ],
  },

  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password/:id/:token', component: ResetPassword },
  { path: 'profile', component: UserProfile }, // User profile
  { path: '**', redirectTo: '/home' },
];