import { useEffect } from 'react';
import { FloorMap } from '../components/hall/FloorMap';
import { TablePanel } from '../components/hall/TablePanel';
import { ReservationPanel } from '../components/hall/ReservationPanel';
import { useTableStore } from '../store/tableStore';
import { useMenuStore } from '../store/menuStore';
import { socket } from '../lib/socket';
import { api } from '../lib/api';
import type { Table, Category } from '../types';

export function HallPage() {
  const { setTables, updateTableStatus, selectedTableId } = useTableStore();
  const { setCategories } = useMenuStore();

  useEffect(() => {
    api.get<Table[]>('/tables').then(setTables);
    api.get<Category[]>('/menus/categories').then(setCategories);

    socket.on('table:status', ({ tableId, status }: { tableId: string; status: Table['status'] }) => {
      updateTableStatus(tableId, status);
    });

    return () => { socket.off('table:status'); };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 플로어맵 영역 */}
      <div className="flex-1 p-4">
        <h1 className="text-xl font-bold mb-3 text-gray-700">홀 현황</h1>
        <div className="w-full" style={{ height: 'calc(100vh - 80px)' }}>
          <FloorMap />
        </div>
      </div>

      {/* 우측 패널 */}
      <div className="w-96 flex flex-col border-l border-gray-200 bg-white">
        <ReservationPanel />
        {selectedTableId && <TablePanel tableId={selectedTableId} />}
      </div>
    </div>
  );
}
