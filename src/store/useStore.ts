import { create } from 'zustand';

interface Store {
    listProducts: number;
    retrieveProductCount: () => Promise<number>;
    listCode: string[];
    retrieveCodeCount: () => Promise<number>;
}

export const useStore = create<Store>((set) => ({
    listProducts: 0,
    retrieveProductCount: async () => {
        const response = await fetch("/api/products/count");
        const data = await response.json();
        set({ listProducts: data.count });
        return data.count;
    },
    listCode: [],
    retrieveCodeCount: async () => {
        const response = await fetch("/api/code/count");
        const data = await response.json();
        set({ listProducts: data.count });
        return data.count;
    },
}));


