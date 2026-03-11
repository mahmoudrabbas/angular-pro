export interface CartProduct {
    _id: string;
    name: string;
    price: number;
    images: string[];
    inventory: {
        quantity: number;
    };
}

export interface CartItem {
    _id: string;
    product: CartProduct;
    quantity: number;
    itemTotal: number;
}

export interface Cart {
    _id: string;
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
}

export interface CartResponse {
    success: boolean;
    cart: Cart;
}

export interface CartActionResponse {
    success: boolean;
    message: string;
    cartItem?: any;
}

export interface CheckoutResponse {
    success: boolean;
    message: string;
    order_id: string;
    orderNumber: string;
    totalAmount: number;
}

/** Guest cart item stored in localStorage */
export interface GuestCartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}
