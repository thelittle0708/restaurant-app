import { useEffect, useState } from 'react';
import { useMenuStore } from '../../store/menuStore';
import { api } from '../../lib/api';
import type { MenuItem, Category } from '../../types';

export function MenuTab() {
  const { categories, setCategories } = useMenuStore();
  const [editItem, setEditItem] = useState<Partial<MenuItem> | null>(null);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    api.get<Category[]>('/menus/categories').then(setCategories);
  }, []);

  async function saveItem() {
    if (!editItem) return;
    if (editItem.id) {
      await api.patch(`/menus/${editItem.id}`, editItem);
    } else {
      await api.post('/menus', editItem);
    }
    const updated = await api.get<Category[]>('/menus/categories');
    setCategories(updated);
    setEditItem(null);
  }

  async function deleteItem(id: string) {
    if (!confirm('메뉴를 삭제할까요?')) return;
    await api.delete(`/menus/${id}`);
    const updated = await api.get<Category[]>('/menus/categories');
    setCategories(updated);
  }

  async function addCategory() {
    if (!newCatName.trim()) return;
    await api.post('/menus/categories', { name: newCatName, sortOrder: categories.length });
    const updated = await api.get<Category[]>('/menus/categories');
    setCategories(updated);
    setNewCatName('');
  }

  return (
    <div className="p-4">
      {/* 카테고리 추가 */}
      <div className="flex gap-2 mb-4">
        <input
          value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
          placeholder="새 카테고리 이름"
          className="border rounded px-3 py-2 flex-1"
        />
        <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={addCategory}>
          카테고리 추가
        </button>
      </div>

      {/* 메뉴 목록 */}
      {categories.map((cat) => (
        <div key={cat.id} className="mb-6">
          <h3 className="font-bold text-gray-700 mb-2">{cat.name}</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 border">메뉴명</th>
                <th className="text-right px-3 py-2 border">가격</th>
                <th className="text-center px-3 py-2 border">처리</th>
                <th className="text-center px-3 py-2 border">품절</th>
                <th className="px-3 py-2 border"></th>
              </tr>
            </thead>
            <tbody>
              {cat.items?.map((item) => (
                <tr key={item.id} className={!item.isAvailable ? 'opacity-40' : ''}>
                  <td className="px-3 py-2 border">{item.name}</td>
                  <td className="px-3 py-2 border text-right">{item.price.toLocaleString()}원</td>
                  <td className="px-3 py-2 border text-center">
                    {item.handledBy === 'KITCHEN' ? '주방' : '홀'}
                  </td>
                  <td className="px-3 py-2 border text-center">
                    <input type="checkbox" checked={!item.isAvailable}
                      onChange={() => api.patch(`/menus/${item.id}`, { isAvailable: !item.isAvailable })
                        .then(() => api.get<Category[]>('/menus/categories').then(setCategories))}
                    />
                  </td>
                  <td className="px-3 py-2 border">
                    <div className="flex gap-1 justify-center">
                      <button className="text-blue-500 text-xs" onClick={() => setEditItem(item)}>수정</button>
                      <button className="text-red-500 text-xs" onClick={() => deleteItem(item.id)}>삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="mt-2 text-sm text-blue-500"
            onClick={() => setEditItem({ categoryId: cat.id, handledBy: 'KITCHEN', isAvailable: true, price: 0, name: '' })}
          >
            + 메뉴 추가
          </button>
        </div>
      ))}

      {/* 메뉴 편집 모달 */}
      {editItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 space-y-3">
            <h2 className="font-bold text-lg">{editItem.id ? '메뉴 수정' : '메뉴 추가'}</h2>
            <input placeholder="메뉴명" value={editItem.name || ''}
              onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
              className="border rounded px-3 py-2 w-full" />
            <input type="number" placeholder="가격" value={editItem.price || ''}
              onChange={(e) => setEditItem({ ...editItem, price: Number(e.target.value) })}
              className="border rounded px-3 py-2 w-full" />
            <select value={editItem.handledBy || 'KITCHEN'}
              onChange={(e) => setEditItem({ ...editItem, handledBy: e.target.value as 'KITCHEN' | 'HALL' })}
              className="border rounded px-3 py-2 w-full">
              <option value="KITCHEN">주방</option>
              <option value="HALL">홀</option>
            </select>
            <div className="flex gap-2">
              <button className="flex-1 bg-gray-800 text-white py-2 rounded" onClick={saveItem}>저장</button>
              <button className="flex-1 bg-gray-200 py-2 rounded" onClick={() => setEditItem(null)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
