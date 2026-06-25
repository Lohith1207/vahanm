import { create } from 'zustand';

export const useLocationStore = create((set) => ({
    pickupLocation: null,
    setPickupLocation: (location) => set({ pickupLocation: location }),
    clearLocation: () => set({ pickupLocation: null })
}));
