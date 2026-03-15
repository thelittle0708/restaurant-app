import type { Order, OrderItemStatus } from '../../types';
import { TableCard } from './TableCard';

interface TableGroup {
  tableId: string;
  tableName: string;
  partySize: number;
  firstOrderTime: string;
  orders: Order[];
  sessionId: string;
}

interface Props {
  tableGroups: TableGroup[];
  onStatusChange: (itemId: string, status: OrderItemStatus) => void;
}

export function KitchenBoard({ tableGroups, onStatusChange }: Props) {
  if (tableGroups.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-xl">
        주문 없음
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
      {tableGroups.map((group) => (
        <TableCard
          key={group.sessionId}
          tableName={group.tableName}
          firstOrderTime={group.firstOrderTime}
          partySize={group.partySize}
          orders={group.orders}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
