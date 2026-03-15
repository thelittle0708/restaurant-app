import type { Table } from '../../types';

const STATUS_COLORS: Record<Table['status'], string> = {
  EMPTY: 'bg-gray-400',
  RESERVED: 'bg-yellow-400',
  OCCUPIED: 'bg-green-500',
  PICKUP_READY: 'bg-red-500',
};

const STATUS_LABELS: Record<Table['status'], string> = {
  EMPTY: '빈 자리',
  RESERVED: '예약',
  OCCUPIED: '착석',
  PICKUP_READY: '픽업대기',
};

interface Props {
  table: Table;
  isSelected: boolean;
  onClick: () => void;
}

export function TableNode({ table, isSelected, onClick }: Props) {
  return (
    <div
      className={`absolute flex flex-col items-center justify-center rounded-lg cursor-pointer
        text-white font-bold text-sm select-none transition-all
        ${STATUS_COLORS[table.status]}
        ${isSelected ? 'ring-4 ring-blue-300 ring-offset-2' : 'hover:opacity-80'}`}
      style={{ left: table.x, top: table.y, width: table.width, height: table.height }}
      onClick={onClick}
    >
      <span>{table.name}</span>
      <span className="text-xs font-normal opacity-90">{STATUS_LABELS[table.status]}</span>
    </div>
  );
}
