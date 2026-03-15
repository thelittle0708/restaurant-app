import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useTableStore } from '../../store/tableStore';
import type { Reservation, TableSession } from '../../types';

export function ReservationPanel() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const { tables, updateTableStatus } = useTableStore();
  const [form, setForm] = useState({
    guestName: '', phoneLastDigits: '', partySize: 2,
    reservedAt: '', notes: '',
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    api.get<Reservation[]>(`/reservations?date=${today}`).then(setReservations);
  }, []);

  async function createReservation() {
    const r = await api.post<Reservation>('/reservations', form);
    setReservations((prev) => [...prev, r]);
    setShowForm(false);
    setForm({ guestName: '', phoneLastDigits: '', partySize: 2, reservedAt: '', notes: '' });
  }

  async function assignTable(reservationId: string, tableId: string) {
    await api.post<TableSession>('/sessions', {
      tableId,
      partySize: reservations.find((r) => r.id === reservationId)?.partySize || 2,
      reservationId,
    });
    await api.patch(`/reservations/${reservationId}`, { status: 'SEATED', tableId });
    setReservations((prev) => prev.filter((r) => r.id !== reservationId));
    updateTableStatus(tableId, 'OCCUPIED');
    setAssigningId(null);
  }

  const emptyTables = tables.filter((t) => t.status === 'EMPTY');

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-600">오늘 예약 ({reservations.length})</h2>
        <button
          className="text-xs bg-yellow-400 text-gray-800 px-2 py-1 rounded"
          onClick={() => setShowForm(!showForm)}
        >
          + 예약 추가
        </button>
      </div>

      {showForm && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-2 text-sm space-y-2">
          <input placeholder="이름" value={form.guestName}
            onChange={(e) => setForm({ ...form, guestName: e.target.value })}
            className="border rounded px-2 py-1 w-full text-sm" />
          <div className="flex gap-2">
            <input placeholder="연락처 뒷자리" value={form.phoneLastDigits}
              onChange={(e) => setForm({ ...form, phoneLastDigits: e.target.value })}
              className="border rounded px-2 py-1 flex-1 text-sm" />
            <input type="number" placeholder="인원" value={form.partySize} min={1}
              onChange={(e) => setForm({ ...form, partySize: Number(e.target.value) })}
              className="border rounded px-2 py-1 w-16 text-sm" />
          </div>
          <input type="datetime-local" value={form.reservedAt}
            onChange={(e) => setForm({ ...form, reservedAt: e.target.value })}
            className="border rounded px-2 py-1 w-full text-sm" />
          <input placeholder="메모" value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="border rounded px-2 py-1 w-full text-sm" />
          <div className="flex gap-2">
            <button className="flex-1 bg-yellow-400 py-1 rounded text-sm" onClick={createReservation}>저장</button>
            <button className="flex-1 bg-gray-200 py-1 rounded text-sm" onClick={() => setShowForm(false)}>취소</button>
          </div>
        </div>
      )}

      <div className="space-y-1 max-h-40 overflow-y-auto">
        {reservations.map((r) => (
          <div key={r.id} className="flex items-center justify-between bg-yellow-50 rounded px-2 py-1 text-xs">
            <div>
              <span className="font-semibold">{r.guestName}</span>
              <span className="text-gray-500 ml-1">{r.partySize}명</span>
              <span className="text-gray-400 ml-1">
                {new Date(r.reservedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {assigningId === r.id ? (
              <div className="flex gap-1 flex-wrap justify-end">
                {emptyTables.map((t) => (
                  <button key={t.id}
                    className="bg-green-500 text-white px-1 py-0.5 rounded text-xs"
                    onClick={() => assignTable(r.id, t.id)}
                  >
                    {t.name}
                  </button>
                ))}
                <button className="bg-gray-200 px-1 py-0.5 rounded text-xs" onClick={() => setAssigningId(null)}>
                  취소
                </button>
              </div>
            ) : (
              <button
                className="bg-green-500 text-white px-2 py-0.5 rounded text-xs"
                onClick={() => setAssigningId(r.id)}
              >
                배정
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
