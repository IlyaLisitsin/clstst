import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import type { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';
import { LOGIN_MUTATION } from '@/apollo/operations/login';
import { tokenStore } from '@/apollo/tokenStore';

const successfulLoginMock = {
  request: {
    query: LOGIN_MUTATION,
    variables: { identifier: 'test@example.com', password: 'pw' },
  },
  result: {
    data: { login: { jwt: 'jwt-success' } },
  },
};

const credentialErrorMock = {
  request: {
    query: LOGIN_MUTATION,
    variables: { identifier: 'wrong@example.com', password: 'bad' },
  },
  result: {
    errors: [new GraphQLError('Invalid identifier or password')],
  },
};

const networkErrorMock = {
  request: {
    query: LOGIN_MUTATION,
    variables: { identifier: 'net@example.com', password: 'pw' },
  },
  error: new Error('boom: connection refused'),
};

function makeWrapper(mocks: ReadonlyArray<unknown>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MockedProvider mocks={mocks as never} addTypename={false}>
        <AuthProvider>{children}</AuthProvider>
      </MockedProvider>
    );
  };
}

describe('AuthProvider', () => {
  beforeEach(() => {
    tokenStore.set(null);
  });

  it('starts unauthenticated with no token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper([]) });
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(tokenStore.get()).toBeNull();
  });

  it('stores the jwt on successful login', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper([successfulLoginMock]),
    });
    let outcome: Awaited<ReturnType<typeof result.current.login>> | undefined;
    await act(async () => {
      outcome = await result.current.login('test@example.com', 'pw');
    });
    expect(outcome).toEqual({ ok: true });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.token).toBe('jwt-success');
    expect(tokenStore.get()).toBe('jwt-success');
  });

  it('classifies invalid-credential GraphQL errors and clears state', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper([credentialErrorMock]),
    });
    let outcome: Awaited<ReturnType<typeof result.current.login>> | undefined;
    await act(async () => {
      outcome = await result.current.login('wrong@example.com', 'bad');
    });
    expect(outcome?.ok).toBe(false);
    if (outcome?.ok === false) {
      expect(outcome.error.kind).toBe('invalid_credentials');
      expect(outcome.error.message).toContain('Invalid');
    }
    expect(result.current.isAuthenticated).toBe(false);
    expect(tokenStore.get()).toBeNull();
  });

  it('classifies network errors', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper([networkErrorMock]),
    });
    let outcome: Awaited<ReturnType<typeof result.current.login>> | undefined;
    await act(async () => {
      outcome = await result.current.login('net@example.com', 'pw');
    });
    expect(outcome?.ok).toBe(false);
    if (outcome?.ok === false) {
      expect(outcome.error.kind).toBe('network');
    }
    expect(tokenStore.get()).toBeNull();
  });

  it('logout clears state and token store', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper([successfulLoginMock]),
    });
    await act(async () => {
      await result.current.login('test@example.com', 'pw');
    });
    expect(tokenStore.get()).toBe('jwt-success');
    await act(async () => {
      await result.current.logout();
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(tokenStore.get()).toBeNull();
  });

  it('useAuth throws when used outside a provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
  });
});
