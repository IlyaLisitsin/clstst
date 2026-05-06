import { describe, it, expect, beforeEach } from 'vitest';
import { tokenStore } from './tokenStore';

describe('tokenStore', () => {
  beforeEach(() => {
    tokenStore.set(null);
  });

  it('starts empty', () => {
    expect(tokenStore.get()).toBeNull();
  });

  it('returns the value last set', () => {
    tokenStore.set('abc');
    expect(tokenStore.get()).toBe('abc');
  });

  it('overwrites on repeated set', () => {
    tokenStore.set('first');
    tokenStore.set('second');
    expect(tokenStore.get()).toBe('second');
  });

  it('clears with null', () => {
    tokenStore.set('xyz');
    tokenStore.set(null);
    expect(tokenStore.get()).toBeNull();
  });
});
