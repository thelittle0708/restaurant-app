import { useEffect, useRef, useState } from 'react';
import { useTableStore } from '../../store/tableStore';
import { api } from '../../lib/api';
import type { Table } from '../../types';

export function TableEditorTab() {
  const { tables, setTables } = useTableStore();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<Table[]>('/tables').then(setTables);
  }, []);

  async function addTable() {
    const name = prompt('테이블 이름 (예: T1, 룸1)');
    if (!name) return;
    const t = await api.post<Table>('/tables', { name, x: 50, y: 50 });
    setTables([...tables, t]);
  }

  async function deleteTable(id: string) {
    if (!confirm('테이블을 삭제할까요?')) return;
    await api.delete(`/tables/${id}`);
    setTables(tables.filter((t) => t.id !== id));
  }

  function onPointerDown(e: React.PointerEvent, tableId: string) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const table = tables.find((t) => t.id === tableId)!;
    dragOffset.current = { x: e.clientX - table.x, y: e.clientY - table.y };
    setDraggingId(tableId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - dragOffset.current.x);
    const y = Math.max(0, e.clientY - rect.top - dragOffset.current.y);
    setTables(tables.map((t) => (t.id === draggingId ? { ...t, x, y } : t)));
  }

  async function onPointerUp() {
    if (!draggingId) return;
    const table = tables.find((t) => t.id === draggingId)!;
    await api.patch(`/tables/${table.id}`, { x: table.x, y: table.y });
    setDraggingId(null);
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold">테이블 배치 편집</h2>
        <button className="bg-gray-700 text-white px-4 py-2 rounded text-sm" onClick={addTable}>
          + 테이블 추가
        </button>
      </div>
      <div
        ref={canvasRef}
        className="relative bg-gray-100 rounded-xl border border-gray-300 overflow-hidden"
        style={{ height: 600 }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {tables.map((table) => (
          <div
            key={table.id}
            className="absolute bg-blue-500 text-white rounded-lg flex flex-col items-center
              justify-center cursor-grab active:cursor-grabbing select-none"
            style={{ left: table.x, top: table.y, width: table.width, height: table.height }}
            onPointerDown={(e) => onPointerDown(e, table.id)}
          >
            <span className="font-bold text-sm">{table.name}</span>
            <button
              className="text-xs text-red-200 hover:text-red-400 mt-1"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => deleteTable(table.id)}
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
