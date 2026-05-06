import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import { GRAPHQL_URL } from '@/config/env';
import { authLink } from './links/authLink';
import { errorLink } from './links/errorLink';
import { retryLink } from './links/retryLink';

const httpLink = new HttpLink({ uri: GRAPHQL_URL });

export const apolloClient = new ApolloClient({
  link: from([errorLink, retryLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
