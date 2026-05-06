import { RetryLink } from '@apollo/client/link/retry';

export const RETRYABLE_STATUS_CODES: ReadonlySet<number> = new Set([502, 503, 429]);

export function getStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const err = error as {
    statusCode?: unknown;
    response?: { status?: unknown } | null;
  };
  if (typeof err.statusCode === 'number') {
    return err.statusCode;
  }
  if (err.response && typeof err.response.status === 'number') {
    return err.response.status;
  }
  return undefined;
}

export const retryLink = new RetryLink({
  delay: { initial: 300, max: 5000, jitter: true },
  attempts: {
    max: 4,
    retryIf: (error) => {
      const status = getStatusCode(error);
      return status !== undefined && RETRYABLE_STATUS_CODES.has(status);
    },
  },
});
