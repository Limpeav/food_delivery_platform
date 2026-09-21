import type { Role } from '../types';

export type AuthScope = 'admin' | 'restaurant' | 'driver' | 'customer';

/**
 * Determines the active authentication scope from a pathname.
 */
export function getAuthScope(pathname?: string): AuthScope {
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
  if (path.startsWith('/admin')) {
    return 'admin';
  }
  if (path.startsWith('/restaurant')) {
    return 'restaurant';
  }
  if (path.startsWith('/driver') || path.startsWith('/delivery') || path.startsWith('/deliveries')) {
    return 'driver';
  }
  return 'customer';
}

/**
 * Returns the localStorage keys for a given scope to isolate sessions.
 */
export function getStorageKeys(scope: AuthScope) {
  return {
    accessToken: `access_token_${scope}`,
    refreshToken: `refresh_token_${scope}`,
    authUser: `auth_user_${scope}`,
    businessStatus: `business_status_${scope}`,
  };
}

/**
 * Maps an AuthScope to the expected user Role.
 */
export function getExpectedRole(scope: AuthScope): Role {
  switch (scope) {
    case 'admin':
      return 'ADMIN';
    case 'restaurant':
      return 'RESTAURANT_OWNER';
    case 'driver':
      return 'DRIVER';
    case 'customer':
      return 'CUSTOMER';
  }
}
