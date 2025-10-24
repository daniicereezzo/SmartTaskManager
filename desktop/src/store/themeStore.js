import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light' or 'dark'

      // Actions
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          // Apply theme to document
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
          return { theme: newTheme };
        });
      }
    }),
    {
      name: 'theme-storage'
    }
  )
);
