import { onError } from '@apollo/client/link/error';

export const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (!import.meta.env.DEV) return;
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, path }) => {
      console.warn(`[GraphQL] ${operation.operationName}: ${message}`, { path });
    });
  }
  if (networkError) {
    console.warn(`[Network] ${operation.operationName}:`, networkError);
  }
});
