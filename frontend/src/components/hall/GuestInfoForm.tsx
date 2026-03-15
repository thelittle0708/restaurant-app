import { useState } from 'react';

interface Props {
  onSubmit: (data: { partySize: number; phoneLastDigits: string; notes: string }) => void;
  onCancel: () => void;
}

export function GuestInfoForm({ onSubmit, onCancel }: Props) {
  const [partySize, setPartySize] = useState(2);
  const [phoneLastDigits, setPhoneLastDigits] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-200">
      <h3 className="text-sm font-semibold mb-2">손님 정보</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 w-16">인원</label>
          <input
            type="number" min={1} value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm w-20"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 w-16">연락처</label>
          <input
            type="text" placeholder="뒷자리" value={phoneLastDigits}
            onChange={(e) => setPhoneLastDigits(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-24"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 w-16">메모</label>
          <input
            type="text" placeholder="유아동반, 알레르기 등" value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded px-2 py-1 text-sm flex-1"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          className="flex-1 bg-green-500 text-white py-1 rounded text-sm"
          onClick={() => onSubmit({ partySize, phoneLastDigits, notes })}
        >
          착석 처리
        </button>
        <button
          className="flex-1 bg-gray-200 text-gray-700 py-1 rounded text-sm"
          onClick={onCancel}
        >
          취소
        </button>
      </div>
    </div>
  );
}
