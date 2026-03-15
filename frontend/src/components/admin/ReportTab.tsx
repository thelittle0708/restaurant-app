import { useState } from 'react';
import { api } from '../../lib/api';

interface DailyReport {
  date: string;
  totalRevenue: number;
  sessionCount: number;
  menuSales: { name: string; quantity: number; revenue: number }[];
}

export function ReportTab() {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  async function loadReport() {
    setLoading(true);
    const data = await api.get<DailyReport>(`/reports/daily?date=${date}`);
    setReport(data);
    setLoading(false);
  }

  return (
    <div className="p-4">
      <div className="flex gap-3 items-center mb-6">
        <input
          type="date" value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded"
          onClick={loadReport}
          disabled={loading}
        >
          {loading ? '불러오는 중...' : '조회'}
        </button>
      </div>

      {report && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">
                {report.totalRevenue.toLocaleString()}원
              </div>
              <div className="text-sm text-gray-500 mt-1">총 매출</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{report.sessionCount}</div>
              <div className="text-sm text-gray-500 mt-1">테이블 수</div>
            </div>
          </div>

          <h3 className="font-bold mb-3">메뉴별 판매량</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 border">메뉴</th>
                <th className="text-right px-3 py-2 border">수량</th>
                <th className="text-right px-3 py-2 border">매출</th>
              </tr>
            </thead>
            <tbody>
              {report.menuSales.map((m) => (
                <tr key={m.name}>
                  <td className="px-3 py-2 border">{m.name}</td>
                  <td className="px-3 py-2 border text-right">{m.quantity}</td>
                  <td className="px-3 py-2 border text-right">{m.revenue.toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
