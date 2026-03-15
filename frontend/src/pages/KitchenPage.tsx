import { useEffect, useState } from 'react';
import { KitchenBoard } from '../components/kitchen/KitchenBoard';
import { api } from '../lib/api';
import { socket } from '../lib/socket';
import type { Order, OrderItemStatus, Table, TableSession } from '../types';

interface TableGroup {
  tableId: string;
  tableName: string;
  partySize: number;
  firstOrderTime: string;
  orders: Order[];
  sessionId: string;
}

export function KitchenPage() {
  const [tableGroups, setTableGroups] = useState<TableGroup[]>([]);

  async function loadActiveOrders() {
    const [tables, sessions] = await Promise.all([
      api.get<Table[]>('/tables'),
      api.get<TableSession[]>('/sessions?active=true'),
    ]);

    const groups: TableGroup[] = [];
    for (const session of sessions) {
      const orders = await api.get<Order[]>(`/orders/session/${session.id}`);
      const kitchenOrders = orders.filter((o) =>
        o.items.some((i) => i.handledBy === 'KITCHEN' && i.status !== 'DONE')
      );
      if (kitchenOrders.length === 0) continue;
      const table = tables.find((t) => t.id === session.tableId);
      if (!table) continue;
      groups.push({
        tableId: session.tableId,
        tableName: table.name,
        partySize: session.partySize,
        firstOrderTime: kitchenOrders[0].createdAt,
        orders: kitchenOrders,
        sessionId: session.id,
      });
    }
    setTableGroups(groups);
  }

  function updateItemStatus(itemId: string, status: OrderItemStatus) {
    setTableGroups((prev) =>
      prev
        .map((group) => ({
          ...group,
          orders: group.orders.map((order) => ({
            ...order,
            items: order.items.map((item) =>
              item.id === itemId ? { ...item, status } : item
            ),
          })),
        }))
        .filter((group) =>
          group.orders.some((o) =>
            o.items.some((i) => i.handledBy === 'KITCHEN' && i.status !== 'DONE')
          )
        )
    );
  }

  async function handleStatusChange(itemId: string, status: OrderItemStatus) {
    await api.patch(`/order-items/${itemId}/status`, { status });
    updateItemStatus(itemId, status);
    socket.emit('order:item_status', { itemId, status });
  }

  useEffect(() => {
    loadActiveOrders();

    socket.on('order:new', () => loadActiveOrders());
    socket.on('order:item_added', () => loadActiveOrders());
    socket.on('table:closed', () => loadActiveOrders());

    return () => {
      socket.off('order:new');
      socket.off('order:item_added');
      socket.off('table:closed');
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">주방 화면</h1>
        <span className="text-sm text-gray-300">
          {new Date().toLocaleTimeString('ko-KR')}
        </span>
      </div>
      <KitchenBoard tableGroups={tableGroups} onStatusChange={handleStatusChange} />
    </div>
  );
}
