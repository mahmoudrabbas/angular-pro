export interface ShippingAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface OrderItem {
    product: string;
    name: string;
    price: number;
    quantity: number;
}

export interface Order {
    _id: string;
    user: string;
    orderNumber: string;
    items: OrderItem[];
    totalAmount: number;
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    orderStatus: string;
    paymentStatus: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface OrderResponse {
    success: boolean;
    order?: Order;
    orders?: Order[];
    message?: string;
}

export interface CreateOrderResponse {
    success: boolean;
    message: string;
    order_id: string;
    orderNumber: string;
    totalAmount: number;
}
