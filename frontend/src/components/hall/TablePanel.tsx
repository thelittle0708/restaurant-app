import { useEffect, useState } from 'react';
import { useTableStore } from '../../store/tableStore';
import { useOrderStore } from '../../store/orderStore';
import { GuestInfoForm } from './GuestInfoForm';
import { OrderInput } from './OrderInput';
import { api } from '../../lib/api';
import { socket } from '../../lib/socket';
import type { TableSession, Order, OrderItem } from '../../types';

interface Props { tableId: string; }

export function TablePanel({ tableId }: Props) {
  const { tables, updateTableStatus } = useTableStore();
  const { setOrders, ordersBySession, updateItemStatus } = useOrderStore();
  const [session, setSession] = useState<TableSession | null>(null);
  const [showGuestForm, setShowGuestForm] = useState(false);

  const table = tables.find((t) => t.id === tableId);

  useEffect(() => {
    api.get<TableSession[]>(`/sessions?tableId=${tableId}&active=true`)
      .then((sessions) => {
        const active = sessions[0] || null;
        setSession(active);
        if (active) {
          api.get<Order[]>(`/orders/session/${active.id}`).then((orders) => {
            setOrders(active.id, orders);
          });
        }
      });

    socket.on('order:item_status', ({ itemId, status }: { itemId: string; status: OrderItem['status'] }) => {
      updateItemStatus(itemId, status);
    });

    return () => { socket.off('order:item_status'); };
  }, [tableId]);

  const orders = session ? (ordersBySession[session.id] || []) : [];
  const allItems = orders.flatMap((o) => o.items);
  const kitchenItems = allItems.filter((i) => i.handledBy === 'KITCHEN');
  const hallItems = allItems.filter((i) => i.handledBy === 'HALL');

  async function handleSeating(guestInfo: { partySize: number; phoneLastDigits: string; notes: string }) {
    const newSession = await api.post<TableSession>('/sessions', { tableId, ...guestInfo });
    setSession(newSession);
    setShowGuestForm(false);
    updateTableStatus(tableId, 'OCCUPIED');
  }

  async function handleCheckout() {
    if (!session) return;
    if (!confirm('계산 완료 처리하시겠습니까?')) return;
    await api.post(`/sessions/${session.id}/close`, {});
    setSession(null);
    setOrders(session.id, []);
    updateTableStatus(tableId, 'EMPTY');
  }

  async function handleHallItemDone(itemId: string) {
    await api.patch(`/order-items/${itemId}/status`, { status: 'DONE' });
    updateItemStatus(itemId, 'DONE');
  }

  const STATUS_LABEL: Record<string, string> = {
    WAITING: '대기', COOKING: '진행중', DONE: '조리완료',
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto border-t border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">{table?.name}</h2>
        {table?.status === 'EMPTY' && (
          <button
            className="bg-green-500 text-white px-3 py-1 rounded text-sm"
            onClick={() => setShowGuestForm(true)}
          >
            착석
          </button>
        )}
        {session && (
          <button
            className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
            onClick={handleCheckout}
          >
            계산 완료
          </button>
        )}
      </div>

      {showGuestForm && <GuestInfoForm onSubmit={handleSeating} onCancel={() => setShowGuestForm(false)} />}

      {session && (
        <>
          <div className="text-sm text-gray-500 mb-3">
            {session.partySize}명 · {session.phoneLastDigits && `${session.phoneLastDigits}`}
            {session.notes && ` · ${session.notes}`}
          </div>

          <OrderInput sessionId={session.id} tableId={tableId} />

          {kitchenItems.length > 0 && (
            <div className="mt-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">주방 처리</h3>
              {kitchenItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1 border-b border-gray-100 text-sm">
                  <span>{item.menuItem.name} × {item.quantity}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    item.status === 'DONE' ? 'bg-green-100 text-green-700' :
                    item.status === 'COOKING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {STATUS_LABEL[item.status]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {hallItems.length > 0 && (
            <div className="mt-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">홀 처리</h3>
              {hallItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1 border-b border-gray-100 text-sm">
                  <span>{item.menuItem.name} × {item.quantity}</span>
                  {item.status !== 'DONE' ? (
                    <button
                      className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded"
                      onClick={() => handleHallItemDone(item.id)}
                    >
                      완료
                    </button>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">완료</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
