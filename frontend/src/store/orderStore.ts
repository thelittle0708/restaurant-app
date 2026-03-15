import { create } from 'zustand';
import type { Order, OrderItem } from '../types';

interface OrderStore {
  ordersBySession: Record<string, Order[]>;
  setOrders: (sessionId: string, orders: Order[]) => void;
  addOrder: (order: Order) => void;
  addItemsToSession: (sessionId: string, order: Order) => void;
  updateItemStatus: (itemId: string, status: OrderItem['status']) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  ordersBySession: {},
  setOrders: (sessionId, orders) =>
    set((s) => ({ ordersBySession: { ...s.ordersBySession, [sessionId]: orders } })),
  addOrder: (order) =>
    set((s) => {
      const existing = s.ordersBySession[order.tableSessionId] || [];
      return {
        ordersBySession: {
          ...s.ordersBySession,
          [order.tableSessionId]: [...existing, order],
        },
      };
    }),
  addItemsToSession: (sessionId, order) =>
    set((s) => {
      const existing = s.ordersBySession[sessionId] || [];
      const markedOrder = {
        ...order,
        items: order.items.map((i) => ({ ...i, isNew: true })),
      };
      return {
        ordersBySession: { ...s.ordersBySession, [sessionId]: [...existing, markedOrder] },
      };
    }),
  updateItemStatus: (itemId, status) =>
    set((s) => {
      const updated = { ...s.ordersBySession };
      for (const sessionId in updated) {
        updated[sessionId] = updated[sessionId].map((order) => ({
          ...order,
          items: order.items.map((item) =>
            item.id === itemId ? { ...item, status } : item
          ),
        }));
      }
      return { ordersBySession: updated };
    }),
}));
