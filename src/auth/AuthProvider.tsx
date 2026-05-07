import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ApolloError, useApolloClient, useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '@/apollo/operations/login';
import { tokenStore } from '@/apollo/tokenStore';
import { AuthContext } from './authContext';
import type { AuthContextValue, LoginError, LoginResult } from './types';

function classifyLoginError(error: unknown): LoginError {
  if (error instanceof ApolloError && error.networkError) {
    return { kind: 'network', messages: [] };
  }
  return { kind: 'unknown', messages: [] };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [runLogin] = useMutation(LOGIN_MUTATION, { fetchPolicy: 'no-cache' });
  const client = useApolloClient();

  const login = useCallback(
    async (identifier: string, password: string): Promise<LoginResult> => {
      try {
        const result = await runLogin({ variables: { identifier, password } });
        const jwt = result.data?.login?.jwt;
        if (!jwt) {
          return {
            ok: false,
            error: { kind: 'unknown', messages: ['No token returned by server'] },
          };
        }
        tokenStore.set(jwt);
        setToken(jwt);
        return { ok: true };
      } catch (error) {
        tokenStore.set(null);
        setToken(null);
        return { ok: false, error: classifyLoginError(error) };
      }
    },
    [runLogin],
  );

  const logout = useCallback(async () => {
    tokenStore.set(null);
    setToken(null);
    await client.clearStore();
  }, [client]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: token !== null,
      login,
      logout,
    }),
    [token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
