import { create } from 'zustand';
import type { Category } from '../types';

interface MenuStore {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
}

export const useMenuStore = create<MenuStore>((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
}));
