import { Timestamp } from "firebase/firestore";

export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled" | "accepted";

export interface OrderItem {
    name: string;
    qty: number;
    price: number;
}

export interface Order {
    id: string;
    name: string;
    contactNumber: string;
    facebook?: string;
    items: OrderItem[];
    totalPrice: number;
    status: OrderStatus;
    pickupMethod: "pickup" | "delivery";
    notes?: string;
    timestamp: string;
    fbVerified?: boolean;
}

export interface MenuItem {
    id: string;
    name: string;
    price: number;
    available: boolean;
    nameJp?: string;
    description?: string;
    image?: string;
}
