import { useTableStore } from '../../store/tableStore';
import { TableNode } from './TableNode';

export function FloorMap() {
  const { tables, selectedTableId, selectTable } = useTableStore();

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
      {tables.map((table) => (
        <TableNode
          key={table.id}
          table={table}
          isSelected={selectedTableId === table.id}
          onClick={() => selectTable(selectedTableId === table.id ? null : table.id)}
        />
      ))}
      {tables.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          /admin에서 테이블을 추가하세요
        </div>
      )}
    </div>
  );
}
