import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('GRAPHQL_URL', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses VITE_GRAPHQL_URL when defined', async () => {
    vi.stubEnv('VITE_GRAPHQL_URL', 'https://example.test/graphql');
    const mod = await import('./env');
    expect(mod.GRAPHQL_URL).toBe('https://example.test/graphql');
  });

  it('falls back to the documented endpoint when env var is missing', async () => {
    vi.stubEnv('VITE_GRAPHQL_URL', '');
    const mod = await import('./env');
    expect(mod.GRAPHQL_URL).toBe('https://cms.trial-task.k8s.ext.fcse.io/graphql');
  });
});
