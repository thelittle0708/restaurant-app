import { useState } from 'react';
import { api } from '../../lib/api';

interface Props {
  onUnlock: () => void;
}

export function PinGate({ onUnlock }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  async function tryPin() {
    localStorage.setItem('adminPin', pin);
    try {
      await api.get('/admin/ping');
      onUnlock();
    } catch {
      setError('PIN이 올바르지 않습니다');
      localStorage.removeItem('adminPin');
      setPin('');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl p-8 shadow-lg w-80 text-center">
        <h1 className="text-2xl font-bold mb-2">관리자</h1>
        <p className="text-gray-500 text-sm mb-6">PIN을 입력하세요</p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && tryPin()}
          className="border-2 rounded-lg px-4 py-3 text-center text-2xl tracking-widest w-full mb-3"
          placeholder="●●●●"
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button
          className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold"
          onClick={tryPin}
        >
          확인
        </button>
      </div>
    </div>
  );
}
