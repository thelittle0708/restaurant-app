import { useRef } from 'react';
import type { OrderItem, OrderItemStatus } from '../../types';

const NEXT: Record<OrderItemStatus, OrderItemStatus | null> = {
  WAITING: 'COOKING',
  COOKING: 'DONE',
  DONE: null,
};
const PREV: Record<OrderItemStatus, OrderItemStatus | null> = {
  WAITING: null,
  COOKING: 'WAITING',
  DONE: 'COOKING',
};

const STATUS_STYLE: Record<OrderItemStatus, string> = {
  WAITING: 'bg-gray-100 border-gray-300 text-gray-700',
  COOKING: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  DONE: 'bg-green-100 border-green-400 text-green-800',
};

const STATUS_LABEL: Record<OrderItemStatus, string> = {
  WAITING: '대기', COOKING: '진행중', DONE: '조리완료',
};

interface Props {
  item: OrderItem;
  onStatusChange: (itemId: string, status: OrderItemStatus) => void;
}

export function MenuItemCard({ item, onStatusChange }: Props) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  function handlePointerDown() {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      const prev = PREV[item.status];
      if (prev) onStatusChange(item.id, prev);
    }, 500);
  }

  function handlePointerUp() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!didLongPress.current) {
      const next = NEXT[item.status];
      if (next) onStatusChange(item.id, next);
    }
  }

  return (
    <button
      role="button"
      className={`relative border-2 rounded-lg p-2 text-left select-none
        active:scale-95 transition-transform min-w-24
        ${STATUS_STYLE[item.status]}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
      }}
    >
      {item.isNew && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
          NEW
        </span>
      )}
      <div className="font-semibold text-sm">{item.menuItem.name}</div>
      <div className="text-xs">× {item.quantity}</div>
      <div className="text-xs mt-1 font-medium">{STATUS_LABEL[item.status]}</div>
    </button>
  );
}
