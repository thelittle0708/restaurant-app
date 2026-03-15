import type { Order, OrderItemStatus } from '../../types';
import { MenuItemCard } from './MenuItemCard';

interface Props {
  tableName: string;
  firstOrderTime: string;
  partySize: number;
  orders: Order[];
  onStatusChange: (itemId: string, status: OrderItemStatus) => void;
}

export function TableCard({ tableName, firstOrderTime, partySize, orders, onStatusChange }: Props) {
  const allKitchenItems = orders.flatMap((o) => o.items).filter((i) => i.handledBy === 'KITCHEN');
  const doneCount = allKitchenItems.filter((i) => i.status === 'DONE').length;
  const total = allKitchenItems.length;

  const timeStr = new Date(firstOrderTime).toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold">{tableName}</span>
          <span className="text-sm text-gray-500">{timeStr}</span>
          <span className="text-sm text-gray-500">{partySize}명</span>
        </div>
        <span className={`text-sm font-semibold px-2 py-0.5 rounded ${
          doneCount === total ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {doneCount}/{total} 완료
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {allKitchenItems.map((item) => (
          <MenuItemCard key={item.id} item={item} onStatusChange={onStatusChange} />
        ))}
      </div>
    </div>
  );
}
