/**
 * Secure token storage utility
 * Stores tokens in memory instead of localStorage to prevent XSS attacks
 * Uses sessionStorage only to track session existence, not the token itself
 */

class TokenStore {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  /**
   * Initialize token store from existing storage (on page load)
   */
  initialize(): void {
    if (typeof window === 'undefined') return;

    // Try to restore from localStorage (legacy support during migration)
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      this.accessToken = storedToken;
      // Mark that we have a session
      sessionStorage.setItem('has_session', 'true');
      // Remove from localStorage as part of migration
      localStorage.removeItem('access_token');
    } else if (sessionStorage.getItem('has_session') === 'true') {
      // Session exists but token is lost (page refresh without proper handling)
      // Clear session flag
      sessionStorage.removeItem('has_session');
    }
  }

  /**
   * Set access token
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('has_session', 'true');
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token: string): void {
    this.refreshToken = token;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('has_session');
      // Also clear localStorage for legacy support
      localStorage.removeItem('access_token');
    }
  }

  /**
   * Check if user has an active session
   */
  hasSession(): boolean {
    return this.accessToken !== null;
  }
}

// Export singleton instance
export const tokenStore = new TokenStore();

// Initialize on module load
if (typeof window !== 'undefined') {
  tokenStore.initialize();
}
