import { create } from 'zustand';

const getInitialState = () => {
  try {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');

    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        user,
        userRole: user.role ? user.role.toLowerCase() : null,
        isAuthenticated: true
      };
    }
  } catch (e) {
    console.error('Failed to parse user from local storage');
  }

  return {
    user: null,
    userRole: null,
    isAuthenticated: false
  };
};

export const useAuthStore = create((set) => ({
  ...getInitialState(),

  login: (userData, role) => {
    console.log('Auth store login called with:', userData, role);
    const safeRole = role ? role.toLowerCase() : null;
    set({
      user: userData,
      userRole: safeRole,
      isAuthenticated: true
    });
  },

  logout: () => set({
    user: null,
    userRole: null,
    isAuthenticated: false
  }),

  updateUser: (userData) => set((state) => ({
    user: { ...state.user, ...userData }
  })),

  setRole: (role) => set({ userRole: role }),
}));
