import { useMutation, useQuery } from '@tanstack/react-query';
import { authAPI } from '@/lib/api/axios-instance';
import { useAuthStore } from '@/store/authStore';
import { logger } from '@/lib/utils/logger';
import type { User, LoginCredentials, RegisterData, AuthTokens } from '@/types/user';

/**
 * Login mutation
 *
 * @returns Mutation function for login
 *
 * @example
 * ```ts
 * const { mutate: login, isPending, error } = useLogin();
 *
 * const handleLogin = (credentials: LoginCredentials) => {
 *   login(credentials, {
 *     onSuccess: (data) => {
 *       router.push('/discover');
 *     },
 *     onError: (error) => {
 *       toast.error('Login failed');
 *     }
 *   });
 * };
 * ```
 */
export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const formData = new URLSearchParams();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);

      const { data } = await authAPI.post<AuthTokens>('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return data;
    },
    onSuccess: async (tokens) => {
      // Get user profile after login
      const { data: user } = await authAPI.get<User>('/auth/me', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      // Set auth in store
      setAuth(user, tokens.access_token);
    },
  });
}

/**
 * Register mutation
 *
 * @returns Mutation function for registration
 *
 * @example
 * ```ts
 * const { mutate: register, isPending } = useRegister();
 *
 * register(userData, {
 *   onSuccess: () => {
 *     toast.success('Registration successful!');
 *     router.push('/login');
 *   }
 * });
 * ```
 */
export function useRegister() {
  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      const { data } = await authAPI.post<User>('/auth/register', userData);
      return data;
    },
  });
}

/**
 * Logout mutation
 *
 * @returns Mutation function for logout
 *
 * @example
 * ```ts
 * const { mutate: logout } = useLogout();
 *
 * <button onClick={() => logout()}>
 *   Logout
 * </button>
 * ```
 */
export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: async () => {
      try {
        await authAPI.post('/auth/logout');
      } catch (error) {
        // Logout locally even if API call fails
        logger.error('Logout API error', error);
      }
    },
    onSuccess: () => {
      clearAuth();
    },
    onSettled: () => {
      // Always clear auth, even on error
      clearAuth();
    },
  });
}

/**
 * Get current user profile
 *
 * @returns Current user query
 *
 * @example
 * ```ts
 * const { data: user, isLoading } = useCurrentUser();
 * ```
 */
export function useCurrentUser() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await authAPI.get<User>('/auth/me');
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Update user profile
 *
 * @returns Mutation function for updating profile
 *
 * @example
 * ```ts
 * const { mutate: updateProfile, isPending } = useUpdateProfile();
 *
 * updateProfile({ full_name: 'New Name' }, {
 *   onSuccess: () => toast.success('Profile updated')
 * });
 * ```
 */
export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const { data } = await authAPI.put<User>('/auth/profile', userData);
      return data;
    },
    onSuccess: (user) => {
      setUser(user);
    },
  });
}

/**
 * Change password
 *
 * @returns Mutation function for password change
 *
 * @example
 * ```ts
 * const { mutate: changePassword } = useChangePassword();
 *
 * changePassword({
 *   currentPassword: 'old',
 *   newPassword: 'new'
 * });
 * ```
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (passwords: { currentPassword: string; newPassword: string }) => {
      const { data } = await authAPI.post('/auth/change-password', {
        current_password: passwords.currentPassword,
        new_password: passwords.newPassword,
      });
      return data;
    },
  });
}

/**
 * Request password reset email
 *
 * @returns Mutation function
 *
 * @example
 * ```ts
 * const { mutate: requestReset } = usePasswordResetRequest();
 *
 * requestReset('user@example.com');
 * ```
 */
export function usePasswordResetRequest() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await authAPI.post('/auth/password-reset-request', { email });
      return data;
    },
  });
}

/**
 * Reset password with token
 *
 * @returns Mutation function
 */
export function usePasswordReset() {
  return useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      const { data } = await authAPI.post('/auth/password-reset', {
        token,
        new_password: password,
      });
      return data;
    },
  });
}

/**
 * Google OAuth login
 * Redirects to Google OAuth flow
 *
 * @returns Function to initiate Google login
 *
 * @example
 * ```ts
 * const handleGoogleLogin = useGoogleLogin();
 *
 * <button onClick={handleGoogleLogin}>
 *   Login with Google
 * </button>
 * ```
 */
export function useGoogleLogin() {
  return () => {
    const googleAuthUrl = `${process.env.NEXT_PUBLIC_AUTH_API}/auth/google/login`;
    window.location.href = googleAuthUrl;
  };
}

/**
 * Verify email
 *
 * @returns Mutation function
 */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (token: string) => {
      const { data } = await authAPI.post('/auth/verify-email', { token });
      return data;
    },
  });
}

/**
 * Resend verification email
 *
 * @returns Mutation function
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await authAPI.post('/auth/resend-verification');
      return data;
    },
  });
}

/**
 * Custom hook that combines auth store state with convenience methods
 *
 * @returns Auth state and methods
 *
 * @example
 * ```ts
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * if (!isAuthenticated) {
 *   return <LoginButton />;
 * }
 *
 * return <div>Welcome, {user.full_name}!</div>;
 * ```
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const { mutate: loginMutation, isPending: isLoggingIn } = useLogin();
  const { mutate: logoutMutation, isPending: isLoggingOut } = useLogout();

  return {
    user,
    isAuthenticated,
    isLoggingIn,
    isLoggingOut,
    login: loginMutation,
    logout: logoutMutation,
  };
}
