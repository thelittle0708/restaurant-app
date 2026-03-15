import { useState } from 'react';
import { useMenuStore } from '../../store/menuStore';
import { useOrderStore } from '../../store/orderStore';
import { api } from '../../lib/api';
import type { Order } from '../../types';

interface Props { sessionId: string; tableId: string; }

export function OrderInput({ sessionId, tableId: _tableId }: Props) {
  const { categories } = useMenuStore();
  const { addOrder } = useOrderStore();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isOpen, setIsOpen] = useState(false);

  function addToCart(menuItemId: string) {
    setCart((c) => ({ ...c, [menuItemId]: (c[menuItemId] || 0) + 1 }));
  }

  function removeFromCart(menuItemId: string) {
    setCart((c) => {
      const next = { ...c };
      if (next[menuItemId] <= 1) delete next[menuItemId];
      else next[menuItemId]--;
      return next;
    });
  }

  async function submitOrder() {
    const items = Object.entries(cart).map(([menuItemId, quantity]) => ({ menuItemId, quantity }));
    if (items.length === 0) return;
    const order = await api.post<Order>('/orders', { tableSessionId: sessionId, items });
    addOrder(order);
    setCart({});
    setIsOpen(false);
  }

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="mt-2">
      <button
        className="w-full bg-blue-500 text-white py-2 rounded text-sm font-semibold"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '닫기' : `주문 추가${cartCount > 0 ? ` (${cartCount})` : ''}`}
      </button>

      {isOpen && (
        <div className="mt-2 border rounded-lg overflow-hidden">
          {categories.map((cat) => (
            <div key={cat.id}>
              <div className="bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                {cat.name}
              </div>
              {cat.items?.filter((i) => i.isAvailable).map((item) => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2 border-b border-gray-50">
                  <div>
                    <span className="text-sm">{item.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {item.price.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {cart[item.id] && (
                      <>
                        <button
                          className="w-6 h-6 bg-gray-200 rounded text-sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm">{cart[item.id]}</span>
                      </>
                    )}
                    <button
                      className="w-6 h-6 bg-blue-500 text-white rounded text-sm"
                      onClick={() => addToCart(item.id)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {cartCount > 0 && (
            <button
              className="w-full bg-green-500 text-white py-2 text-sm font-semibold"
              onClick={submitOrder}
            >
              주문 입력 ({cartCount}개)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
