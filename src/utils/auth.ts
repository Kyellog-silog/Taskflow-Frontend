/**
 * Authentication utilities
 */

export const shouldAttemptAuthCheck = (): boolean => {
  return !!localStorage.getItem('token')
}

export const clearAuthState = (): void => {
  localStorage.removeItem('token')
}

export const setAuthAttempted = (): void => {
  // no-op: token presence in localStorage is the sole indicator
}
