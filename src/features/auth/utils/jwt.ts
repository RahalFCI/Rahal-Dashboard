import type { SessionUser, UserRole } from '../types';

const roleClaimKeys = [
  'role',
  'roles',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
];

const idClaimKeys = [
  'sub',
  'nameid',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
];

const emailClaimKeys = ['email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  );
}

function asRole(value: unknown): UserRole {
  const role = Array.isArray(value) ? value[0] : value;
  if (role === 'Admin' || role === 'Vendor' || role === 'Explorer') return role;
  return 'Explorer';
}

function findClaim(payload: Record<string, unknown>, keys: string[]) {
  return keys.map((key) => payload[key]).find((value) => typeof value === 'string' || Array.isArray(value));
}

export function parseJwtUser(accessToken: string): SessionUser {
  const payload = JSON.parse(base64UrlDecode(accessToken.split('.')[1] ?? 'e30=')) as Record<string, unknown>;

  return {
    id: String(findClaim(payload, idClaimKeys) ?? ''),
    email: String(findClaim(payload, emailClaimKeys) ?? ''),
    role: asRole(findClaim(payload, roleClaimKeys)),
  };
}
