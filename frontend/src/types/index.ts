export type TableStatus = 'EMPTY' | 'RESERVED' | 'OCCUPIED' | 'PICKUP_READY';
export type OrderItemStatus = 'WAITING' | 'COOKING' | 'DONE';
export type HandledBy = 'KITCHEN' | 'HALL';
export type ReservationStatus = 'PENDING' | 'SEATED' | 'CANCELLED';

export interface Table {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: TableStatus;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  handledBy: HandledBy;
  isAvailable: boolean;
  categoryId: string;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  items?: MenuItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  status: OrderItemStatus;
  handledBy: HandledBy;
  createdAt: string;
  isNew?: boolean; // client-only NEW badge
}

export interface Order {
  id: string;
  tableSessionId: string;
  createdAt: string;
  items: OrderItem[];
}

export interface TableSession {
  id: string;
  tableId: string;
  partySize: number;
  phoneLastDigits?: string;
  notes?: string;
  startedAt: string;
  closedAt?: string;
  orders?: Order[];
}

export interface Reservation {
  id: string;
  guestName: string;
  phoneLastDigits: string;
  partySize: number;
  reservedAt: string;
  notes?: string;
  tableId?: string;
  status: ReservationStatus;
}
