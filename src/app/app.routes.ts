// import { Routes } from '@angular/router';
// import { adminGuard } from './guards/admin.guard';

// import { ProductListComponent } from './components/product-list/product-list.component';
// import { ProductDetail } from './components/product-detail/product-detail';
// import { Home } from './components/home/home';
// import { Cart } from './components/cart/cart';
// import { Checkout } from './components/checkout/checkout';
// import { Login } from './components/login/login';
// import { Signup } from './components/signup/signup';
// import { Orders } from './components/orders/orders';
// import { CheckEmail } from './components/check-email/check-email';
// import { EmailVerified } from './components/email-verified/email-verified';
// import { ForgotPassword } from './components/forgot-password/forgot-password';
// import { ResetPassword } from './components/reset-password/reset-password';
// import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
// import { Users } from './components/users/users';
// import { AdminLayout } from './components/admin-layout/admin-layout';
// import { AdminProducts } from './components/admin-products/admin-products'; // NEW
// import { AdminOrders } from './components/admin-orders/admin-orders'; // NEW
// import { SearchResults } from './components/search-results/search-results';
// import { CategoryListComponent } from './components/categories/category-list/category-list';
// import { CategoryFormComponent } from './components/categories/category-form/category-form';
// import { PaymentSuccess } from './components/payment-success/payment-success';
// import { PaymentCancel } from './components/payment-cancel/payment-cancel';
// import { PaymentFailed } from './components/payment-failed/payment-failed';
// import { ComparePage } from './components/compare-page/compare-page';
// import { VisualSearchComponent } from './components/visual-search/visual-search';
// import { AiSetupBuilderComponent } from './components/ai-setup-builder/ai-setup-builder';

// export const routes: Routes = [
//   { path: '', redirectTo: 'home', pathMatch: 'full' },
//   { path: 'home', component: Home },
//   { path: 'product', component: ProductListComponent },
//   { path: 'product/:id', component: ProductDetail },
//   { path: 'categories', component: CategoryListComponent },
//   { path: 'category/add', component: CategoryFormComponent },
//   { path: 'category/edit/:id', component: CategoryFormComponent },
//   { path: 'cart', component: Cart },
//   { path: 'checkout', component: Checkout },
//   { path: 'payment/success', component: PaymentSuccess },
//   { path: 'payment/cancel', component: PaymentCancel },
//   { path: 'payment/failed', component: PaymentFailed },
//   { path: 'signin', component: Login },
//   { path: 'signup', component: Signup },
//   { path: 'check-email', component: CheckEmail },
//   { path: 'auth/verify-email/:token', component: EmailVerified },

//   // ── Admin (protected) ─────────────────────────────────────────────────────
//   {
//     path: 'admin',
//     component: AdminLayout,
//     canActivate: [adminGuard],
//     children: [
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//       { path: 'dashboard', component: AdminDashboard },
//       { path: 'users', component: Users },
//       { path: 'products', component: AdminProducts }, // NEW
//       { path: 'orders', component: AdminOrders }, // NEW
//     ],
//   },

//   { path: 'search', component: SearchResults },
//   { path: 'compare', component: ComparePage },
//   { path: 'forgot-password', component: ForgotPassword },
//   { path: 'visual-search', component: VisualSearchComponent },
//   { path: 'ai-setup-builder', component: AiSetupBuilderComponent },
//   { path: 'reset-password/:id/:token', component: ResetPassword },
//   { path: 'profile', component: Orders }, // User profile
//   { path: 'orders', component: Orders }, // User profile

//   { path: '**', redirectTo: '/home' },
// ];
import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetail } from './components/product-detail/product-detail';
import { Home } from './components/home/home';
import { Cart } from './components/cart/cart';
import { Checkout } from './components/checkout/checkout';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
// import { UserProfile } from './components/user-profile/user-profile';
import { CheckEmail } from './components/check-email/check-email';
import { EmailVerified } from './components/email-verified/email-verified';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { ResetPassword } from './components/reset-password/reset-password';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { Users } from './components/users/users';
import { AdminLayout } from './components/admin-layout/admin-layout';
import { SearchResults } from './components/search-results/search-results';
import { CategoryListComponent } from './components/categories/category-list/category-list';
import { CategoryFormComponent } from './components/categories/category-form/category-form';

import { PaymentSuccess } from './components/payment-success/payment-success';
import { PaymentCancel } from './components/payment-cancel/payment-cancel';
import { PaymentFailed } from './components/payment-failed/payment-failed';
import { Orders } from './components/orders/orders';
import { Dashboard } from './components/dashboard/dashboard';
import { Wishlist } from './components/wishlist/wishlist';
import { Addresses } from './components/addresses/addresses';
import { AccountSettings } from './components/account-settings/account-settings';
import { ComparePage } from './components/compare-page/compare-page';
import { VisualSearchComponent } from './components/visual-search/visual-search';
import { AiSetupBuilderComponent } from './components/ai-setup-builder/ai-setup-builder';
import { adminGuard } from './guards/admin.guard';
import { AdminProducts } from './components/admin-products/admin-products';
import { AdminOrders } from './components/admin-orders/admin-orders';
import { AdminCategories } from './components/admin-categories/admin-categories';
import { NotFoundComponent } from './components/not-found/not-found';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },

  { path: 'product', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetail },

  { path: 'dashboard', component: Dashboard },
  { path: 'wishlist', component: Wishlist },
  { path: 'addresses', component: Addresses },
  { path: 'account-settings', component: AccountSettings },

  // Category management
  { path: 'categories', component: CategoryListComponent },
  { path: 'category/add', component: CategoryFormComponent },
  { path: 'category/edit/:id', component: CategoryFormComponent },

  { path: 'cart', component: Cart }, // Shopping cart
  { path: 'checkout', component: Checkout }, // Checkout page

  // Payment results
  { path: 'payment/success', component: PaymentSuccess }, // Payment success
  { path: 'payment/cancel', component: PaymentCancel }, // Payment cancelled
  { path: 'payment/failed', component: PaymentFailed }, // Payment failed

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
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'users', component: Users },
      { path: 'products', component: AdminProducts },
      { path: 'orders', component: AdminOrders },
      { path: 'categories', component: AdminCategories },
    ],
  },

  { path: 'search', component: SearchResults },
  { path: 'compare', component: ComparePage },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'visual-search', component: VisualSearchComponent },
  {
    path: 'ai-setup-builder',
    component: AiSetupBuilderComponent,
  },

  { path: 'reset-password/:id/:token', component: ResetPassword },
  { path: 'profile', component: Orders }, // User profile
  { path: 'orders', component: Orders }, // User profile
  { path: '**', component: NotFoundComponent },
];
