import { describe, expect, it } from 'vitest';
import { LEGACY_ROLE_KEYS, ROLES, ROLE_INFO, isRole, migrateRoleKeys } from '../../core/roles';

describe('roles', () => {
  it('lists every role once, with settings copy', () => {
    expect(new Set(ROLES).size).toBe(ROLES.length);
    expect(ROLE_INFO.map((r) => r.key)).toEqual([...ROLES]);
    for (const r of ROLE_INFO) expect(r.label.length).toBeGreaterThan(0);
  });
  it('maps every legacy key onto a current role', () => {
    for (const v of Object.values(LEGACY_ROLE_KEYS)) expect(isRole(v)).toBe(true);
  });
  it('migrates stored colours from the old vocabulary', () => {
    expect(migrateRoleKeys({ red: '#111111', accent: '#222222', hot: '#333333', bg: '#000000', junk: '#444444' })).toEqual({
      chrome: '#111111',
      live: '#222222',
      signal: '#333333',
      bg: '#000000',
    });
  });
  it('lets a current key win over its legacy twin', () => {
    expect(migrateRoleKeys({ red: '#111111', chrome: '#999999' })).toEqual({ chrome: '#999999' });
    expect(migrateRoleKeys({ chrome: '#999999', red: '#111111' })).toEqual({ chrome: '#999999' });
  });
  it('tolerates nothing', () => {
    expect(migrateRoleKeys(undefined)).toEqual({});
    expect(migrateRoleKeys(null)).toEqual({});
  });
});
