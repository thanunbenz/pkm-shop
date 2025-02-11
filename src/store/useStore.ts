import { create } from 'zustand';

interface Store {
    count: number;
    setCount: (newCount: number) => void;
}

export const useStore = create<Store>((set) => ({
    count: 0,
    setCount: (newCount: number) => set({ count: newCount }),
}));


