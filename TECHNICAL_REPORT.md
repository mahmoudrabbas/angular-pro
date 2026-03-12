# Technical Report: E-Commerce Angular Application

## 1. Project Overview

### 1.1 Project Information
- **Project Name**: E-Commerce Project
- **Version**: 0.0.0
- **Framework**: Angular 21.1.0
- **Package Manager**: npm 11.8.0

### 1.2 Project Type
This is a full-featured e-commerce web application built with Angular 21, featuring both customer-facing storefront and admin dashboard functionalities.

---

## 2. Technology Stack

### 2.1 Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | ^21.1.0 | Frontend framework |
| TypeScript | ~5.9.2 | Type-safe JavaScript |
| RxJS | ~7.8.0 | Reactive programming |
| Bootstrap | ^5.3.8 | CSS framework |
| Bootstrap Icons | ^1.13.1 | Icon library |
| PrimeNG | ^21.1.2 | UI component library |
| jQuery | ^3.7.1 | DOM manipulation |

### 2.2 Additional Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| jsPDF | ^4.2.0 | PDF generation |
| @types/jspdf | ^1.3.3 | jsPDF TypeScript types |
| @primeuix/themes | ^2.0.3 | PrimeNG theming |

### 2.3 Development Tools
| Tool | Version | Purpose |
|------|---------|---------|
| Angular CLI | ^21.1.4 | Build and development |
| Vitest | ^4.0.8 | Unit testing |
| jsdom | ^27.1.0 | DOM testing |

---

## 3. Architecture Overview

### 3.1 Application Structure
```
src/
├── app/
│   ├── components/          # UI Components
│   │   ├── account-settings/
│   │   ├── addresses/
│   │   ├── admin-categories/
│   │   ├── admin-dashboard/
│   │   ├── admin-layout/
│   │   ├── admin-orders/
│   │   ├── admin-products/
│   │   ├── ai-setup-builder/
│   │   ├── carousel/
│   │   ├── cart/
│   │   ├── categories/
│   │   ├── chatbot/
│   │   ├── check-email/
│   │   ├── checkout/
│   │   ├── compare-bar/
│   │   ├── compare-page/
│   │   ├── confirm-dialog/
│   │   ├── dashboard/
│   │   ├── email-verified/
│   │   ├── footer/
│   │   ├── forgot-password/
│   │   ├── home/
│   │   ├── login/
│   │   ├── navbar/
│   │   ├── not-found/
│   │   ├── orders/
│   │   ├── payment-cancel/
│   │   ├── payment-failed/
│   │   ├── payment-success/
│   │   ├── product-card/
│   │   ├── product-detail/
│   │   ├── product-list/
│   │   ├── products/
│   │   ├── reset-password/
│   │   ├── search-results/
│   │   ├── services/
│   │   ├── signup/
│   │   ├── toast/
│   │   ├── users/
│   │   ├── visual-search/
│   │   └── wishlist/
│   ├── environments/         # Environment configurations
│   ├── guards/              # Route guards
│   ├── interceptors/        # HTTP interceptors
│   ├── models/              # TypeScript interfaces/models
│   └── services/            # Business logic services
├── assets/                  # Static assets
└── styles.css               # Global styles
```

### 3.2 Component Categories

#### Customer-Facing Components
| Component | Path | Description |
|-----------|------|-------------|
| Home | `/home` | Landing page |
| Product List | `/product` | Product catalog |
| Product Detail | `/product/:id` | Individual product page |
| Cart | `/cart` | Shopping cart |
| Checkout | `/checkout` | Checkout process |
| Wishlist | `/wishlist` | Saved products |
| Search Results | `/search` | Search functionality |
| Compare Page | `/compare` | Product comparison |
| Visual Search | `/visual-search` | Image-based search |
| Orders | `/orders` | Order history |
| Dashboard | `/dashboard` | User dashboard |
| Addresses | `/addresses` | Address management |
| Account Settings | `/account-settings` | User profile |

#### Admin Components
| Component | Path | Description |
|-----------|------|-------------|
| Admin Layout | `/admin` | Admin panel wrapper |
| Admin Dashboard | `/admin/dashboard` | Admin overview |
| Admin Products | `/admin/products` | Product management |
| Admin Orders | `/admin/orders` | Order management |
| Admin Categories | `/admin/categories` | Category management |
| Users | `/admin/users` | User management |

#### Authentication Components
| Component | Path | Description |
|-----------|------|-------------|
| Login | `/signin` | User login |
| Signup | `/signup` | User registration |
| Check Email | `/check-email` | Email verification request |
| Email Verified | `/auth/verify-email/:token` | Email verification |
| Forgot Password | `/forgot-password` | Password reset request |
| Reset Password | `/reset-password/:id/:token` | Password reset |

---

## 4. Routing Configuration

### 4.1 Route Definitions
The application uses Angular Router with lazy loading patterns and route protection.

**Public Routes:**
- `/home` - Home page
- `/product` - Product listing
- `/product/:id` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/signin` - Login
- `/signup` - Registration
- `/search` - Search results
- `/compare` - Product comparison
- `/visual-search` - Visual search
- `/ai-setup-builder` - AI setup
- `/forgot-password` - Password recovery
- `/check-email` - Email verification request

**Protected Routes (User):**
- `/dashboard` - User dashboard
- `/wishlist` - Saved items
- `/addresses` - Address book
- `/account-settings` - Profile settings
- `/orders` - Order history
- `/profile` - User profile

**Protected Routes (Admin):**
- `/admin/*` - Admin panel (requires admin role)

### 4.2 Route Protection
The application implements route guards using functional guards:
- **Admin Guard**: Protects admin routes, checks for admin role in localStorage/sessionStorage

---

## 5. Data Layer

### 5.1 Models/Interfaces

| Model | File | Properties |
|-------|------|------------|
| User | `user.model.ts` | User data structure |
| Product | `product.model.ts` | Product data |
| Category | `category.model.ts` | Category data |
| Cart | `cart.model.ts` | Cart item structure |
| Order | `order.model.ts` | Order information |
| Review | `review.model.ts` | Product reviews |
| AuthResponse | `authResponse.model.ts` | Authentication response |

### 5.2 Services

| Service | File | Purpose |
|---------|------|---------|
| AuthService | `auth.service.ts` | Authentication logic |
| CartService | `cart.service.ts` | Shopping cart management |
| CategoryService | `category.service.ts` | Category CRUD operations |
| ProductService | `product.service.ts` | Product management |
| OrderService | `order.service.ts` | Order processing |
| PaymentService | `payment.service.ts` | Payment handling |
| WishlistService | `wishlist.service.ts` | Wishlist management |
| WishlistStateService | `wishlist-state.service.ts` | Wishlist state management |
| CompareService | `compare.service.ts` | Product comparison |
| SearchService | `search.service.ts` | Search functionality |
| UserService | `user.service.ts` | User management |
| CurrentUserService | `current-user.service.ts` | Current user state |
| ReviewService | `review.service.ts` | Review management |
| ChatService | `chat.service.ts` | Chatbot functionality |
| VisualSearchService | `visual-search.service.ts` | Visual search |
| ToastService | `toast.service.ts` | Notifications |
| ConfirmDialogService | `confirm-dialog.service.ts` | Confirmation dialogs |
| TranslationService | `translation.service.ts` | i18n support |

---

## 6. HTTP Interceptors

### 6.1 Auth Interceptor
**File**: `interceptors/auth-interceptor.ts`

Attaches Bearer token to outgoing HTTP requests:
- Checks both `localStorage` and `sessionStorage` for tokens
- Adds `Authorization: Bearer {token}` header to requests
- Supports "Remember Me" functionality

### 6.2 Error Interceptor
**File**: `interceptors/error-interceptor.ts`

Handles HTTP errors globally:
- 401 Unauthorized: Clears token and redirects to login
- 403 Forbidden: Redirects to forbidden page
- Preserves original error for downstream handling

---

## 7. Build Configuration

### 7.1 Angular Build Options
- **Builder**: `@angular/build:application`
- **Output Hashing**: All (production)
- **Source Maps**: Enabled for development

### 7.2 Styles Configuration
The application includes:
- Bootstrap CSS framework
- Bootstrap Icons
- Custom assets ( Owl Carousel, Lightbox, WOW animations)
- Global styles in `styles.css`

### 7.3 Scripts Configuration
- jQuery
- Bootstrap Bundle
- Owl Carousel
- Easing animations
- Waypoints
- Counterup
- Lightbox
- WOW animations
- Custom main.js

### 7.4 Budget Limits
| Type | Warning | Error |
|------|---------|-------|
| Initial Bundle | 1.5MB | 2MB |
| Component Styles | 20KB | 30KB |

---

## 8. Key Features

### 8.1 Customer Features
- Product browsing and search
- Product comparison
- Visual/image search
- Shopping cart
- Wishlist
- Checkout process
- Order tracking
- User dashboard
- Address management
- Account settings

### 8.2 Admin Features
- Dashboard with analytics
- Product CRUD operations
- Order management
- Category management
- User management

### 8.3 Authentication
- JWT-based authentication
- Email verification
- Password reset functionality
- Role-based access control (User/Admin)
- Remember me functionality

### 8.4 Additional Features
- AI Setup Builder
- Chatbot integration
- Compare products
- Payment integration (success/cancel/failed pages)
- Toast notifications
- Confirmation dialogs

---

## 9. Development Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm run watch` | Watch mode for development |
| `npm run test` | Run unit tests |

---

## 10. Environment Configuration

### 10.1 Development Environment
- **File**: `src/app/environments/environment.development.ts`
- Uses development API endpoints

### 10.2 Production Environment
- **File**: `src/app/environments/environment.ts`
- Uses production API endpoints

---

## 11. Code Quality

### 11.1 Formatting
- Prettier configured
- Print width: 100 characters
- Single quotes
- Angular HTML parser for templates

### 11.2 TypeScript Configuration
- Strict mode enabled
- ES2022 target
- Module resolution: Node

---

## 12. Conclusion

This Angular e-commerce application demonstrates a comprehensive implementation of a modern e-commerce platform with:

- **Scalable Architecture**: Modular component structure with lazy loading
- **Complete Feature Set**: Full customer and admin functionality
- **Security**: JWT authentication, role-based access, HTTP interceptors
- **Modern UI**: Bootstrap + PrimeNG components
- **Responsive Design**: Mobile-friendly layout
- **Developer Experience**: Hot reload, testing support, code formatting

The application follows Angular best practices and provides a solid foundation for production e-commerce deployments.
