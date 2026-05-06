import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ApolloError, useApolloClient, useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '@/apollo/operations/login';
import { tokenStore } from '@/apollo/tokenStore';
import { AuthContext } from './authContext';
import type { AuthContextValue, LoginError, LoginResult } from './types';
import type { StrapiGraphQLExtensions } from '@/apollo/strapiTypes';

function extractStrapiMessages(error: ApolloError): string[] {
  const messages: string[] = [];
  for (const gqlError of error.graphQLErrors) {
    const ext = gqlError.extensions as StrapiGraphQLExtensions | undefined;
    const groups = ext?.exception?.data?.data ?? ext?.exception?.data?.message ?? [];
    for (const group of groups) {
      for (const msg of group.messages) {
        if (msg.message) messages.push(msg.message);
      }
    }
  }
  return messages;
}

function classifyLoginError(error: unknown): LoginError {
  if (error instanceof ApolloError) {
    if (error.networkError) {
      return { kind: 'network', messages: [] };
    }
    if (error.graphQLErrors.length > 0) {
      const strapiMessages = extractStrapiMessages(error);
      const looksLikeCredentials =
        strapiMessages.some((m) => /invalid|credential|password|identifier|email/i.test(m)) ||
        /invalid|credential|password|identifier|email/i.test(
          error.graphQLErrors[0]?.message ?? '',
        );
      return {
        kind: looksLikeCredentials ? 'invalid_credentials' : 'unknown',
        messages: strapiMessages,
      };
    }
  }
  if (error instanceof Error) {
    return { kind: 'unknown', messages: [error.message] };
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
            error: { kind: 'unknown', message: 'No token returned by server' },
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
