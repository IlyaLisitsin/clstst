const FALLBACK_GRAPHQL_URL = 'https://cms.trial-task.k8s.ext.fcse.io/graphql';

function readGraphqlUrl(): string {
  const fromEnv = import.meta.env.VITE_GRAPHQL_URL;
  if (typeof fromEnv === 'string' && fromEnv.length > 0) {
    return fromEnv;
  }
  return FALLBACK_GRAPHQL_URL;
}

export const GRAPHQL_URL = readGraphqlUrl();
