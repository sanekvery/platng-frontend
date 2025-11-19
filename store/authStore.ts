import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';
import { tokenStore } from '@/lib/utils/tokenStore';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  clearAuth: () => void;
}

/**
 * Auth Store using Zustand
 *
 * Features:
 * - Persists user data to localStorage
 * - Access token stored in secure memory-based tokenStore (NOT in localStorage)
 * - Provides auth state and actions throughout the app
 *
 * Usage:
 * ```ts
 * const { user, isAuthenticated, setAuth, logout } = useAuthStore();
 * ```
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,

      // Set both user and token (typically after login)
      setAuth: (user, accessToken) => {
        // Store token in secure memory-based tokenStore
        tokenStore.setAccessToken(accessToken);

        set({
          user,
          isAuthenticated: true,
        });
      },

      // Update user info only
      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      // Update access token only (e.g., after refresh)
      setAccessToken: (accessToken) => {
        tokenStore.setAccessToken(accessToken);
      },

      // Logout - clear everything
      logout: () => {
        tokenStore.clearTokens();

        set({
          user: null,
          isAuthenticated: false,
        });
      },

      // Clear auth (same as logout, but semantic difference)
      clearAuth: () => {
        tokenStore.clearTokens();

        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'platng-auth',
      // Only persist user data, not the token (security best practice)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Selectors for better performance
 * Use these to subscribe to specific parts of the store
 */
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
