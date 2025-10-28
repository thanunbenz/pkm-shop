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
        try {
            const response = await fetch("/api/v1/products/count");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            set({ listProducts: data.count });
            return data.count;
        } catch (error) {
            console.error('Error fetching product count:', error);
            return 0;
        }
    },
    listCode: [],
    retrieveCodeCount: async () => {
        try {
            const response = await fetch("/api/v1/code/count");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            set({ listProducts: data.count });
            return data.count;
        } catch (error) {
            console.error('Error fetching code count:', error);
            return 0;
        }
    },
}));


