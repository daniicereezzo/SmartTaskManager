import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/AuthService';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Actions
      login: async (googleToken) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(googleToken);
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
            error: null
          });
          return response;
        } catch (error) {
          set({
            user: null,
            token: null,
            isLoading: false,
            error: error.message
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          error: null
        });
        // Clear any stored data
        localStorage.removeItem('auth-storage');
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          set({ user, isLoading: false });
        } catch (error) {
          set({
            user: null,
            token: null,
            isLoading: false,
            error: error.message
          });
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token
      })
    }
  )
);
