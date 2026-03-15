import { useState } from 'react';
import { PinGate } from '../components/admin/PinGate';
import { MenuTab } from '../components/admin/MenuTab';
import { TableEditorTab } from '../components/admin/TableEditorTab';
import { ReportTab } from '../components/admin/ReportTab';

type Tab = 'menu' | 'tables' | 'report';

export function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('menu');

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'menu', label: '메뉴 관리' },
    { id: 'tables', label: '테이블 배치' },
    { id: 'report', label: '리포트' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-800 text-white px-6 py-3 flex items-center gap-4">
        <h1 className="text-xl font-bold mr-4">관리자</h1>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded text-sm ${
              activeTab === tab.id ? 'bg-white text-gray-800' : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <button
          className="ml-auto text-xs text-gray-400 hover:text-white"
          onClick={() => { localStorage.removeItem('adminPin'); setUnlocked(false); }}
        >
          잠금
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        {activeTab === 'menu' && <MenuTab />}
        {activeTab === 'tables' && <TableEditorTab />}
        {activeTab === 'report' && <ReportTab />}
      </div>
    </div>
  );
}
