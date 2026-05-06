import { setContext } from '@apollo/client/link/context';
import { tokenStore } from '../tokenStore';

export const authLink = setContext((_operation, prevContext) => {
  const token = tokenStore.get();
  if (!token) {
    return prevContext;
  }
  const prevHeaders = (prevContext.headers ?? {}) as Record<string, string>;
  return {
    ...prevContext,
    headers: {
      ...prevHeaders,
      authorization: `Bearer ${token}`,
    },
  };
});
