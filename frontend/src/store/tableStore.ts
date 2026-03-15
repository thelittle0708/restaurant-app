import { create } from 'zustand';
import type { Table } from '../types';

interface TableStore {
  tables: Table[];
  selectedTableId: string | null;
  setTables: (tables: Table[]) => void;
  updateTableStatus: (tableId: string, status: Table['status']) => void;
  selectTable: (id: string | null) => void;
}

export const useTableStore = create<TableStore>((set) => ({
  tables: [],
  selectedTableId: null,
  setTables: (tables) => set({ tables }),
  updateTableStatus: (tableId, status) =>
    set((state) => ({
      tables: state.tables.map((t) => (t.id === tableId ? { ...t, status } : t)),
    })),
  selectTable: (id) => set({ selectedTableId: id }),
}));
