import { create } from 'zustand';

export const useRideStore = create((set) => ({
  rides: [],
  activeRide: null,
  rideHistory: [],
  
  setRides: (rides) => set({ rides }),
  
  setActiveRide: (ride) => set({ activeRide: ride }),
  
  addRide: (ride) => set((state) => ({ 
    rides: [...state.rides, ride] 
  })),
  
  updateRide: (rideId, updates) => set((state) => ({
    rides: state.rides.map(ride => 
      ride.id === rideId ? { ...ride, ...updates } : ride
    ),
    activeRide: state.activeRide?.id === rideId 
      ? { ...state.activeRide, ...updates } 
      : state.activeRide
  })),
  
  setRideHistory: (history) => set({ rideHistory: history }),
}));
