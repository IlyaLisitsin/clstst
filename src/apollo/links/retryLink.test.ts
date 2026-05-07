import { describe, it, expect } from 'vitest';
import { ApolloLink, execute, gql, Observable } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { RETRYABLE_STATUS_CODES, getStatusCode } from './retryLink';

const PING_QUERY = gql`
  query Ping {
    ping
  }
`;

function makeRetryLink() {
  return new RetryLink({
    delay: { initial: 5, max: 10, jitter: false },
    attempts: {
      max: 4,
      retryIf: (error) => {
        const status = getStatusCode(error);
        return status !== undefined && RETRYABLE_STATUS_CODES.has(status);
      },
    },
  });
}

function failingLink(statusCode: number, calls: { n: number }): ApolloLink {
  return new ApolloLink(() => {
    return new Observable((observer) => {
      calls.n += 1;
      const err = Object.assign(new Error(`HTTP ${statusCode}`), { statusCode });
      observer.error(err);
    });
  });
}


function run(link: ApolloLink): Promise<{ ok: true } | { ok: false; error: unknown }> {
  return new Promise((resolve) => {
    execute(link, { query: PING_QUERY }).subscribe({
      next: () => resolve({ ok: true }),
      error: (error) => resolve({ ok: false, error }),
      complete: () => {
        /* resolved on next */
      },
    });
  });
}

describe('retryLink', () => {
  it('retries on 503 and gives up after attempts.max', async () => {
    const calls = { n: 0 };
    const link = ApolloLink.from([makeRetryLink(), failingLink(503, calls)]);
    const result = await run(link);
    expect(result.ok).toBe(false);
    expect(calls.n).toBe(4);
  });

  it('retries on 502', async () => {
    const calls = { n: 0 };
    const link = ApolloLink.from([makeRetryLink(), failingLink(502, calls)]);
    await run(link);
    expect(calls.n).toBe(4);
  });

  it('retries on 429', async () => {
    const calls = { n: 0 };
    const link = ApolloLink.from([makeRetryLink(), failingLink(429, calls)]);
    await run(link);
    expect(calls.n).toBe(4);
  });

  it('does NOT retry on 400', async () => {
    const calls = { n: 0 };
    const link = ApolloLink.from([makeRetryLink(), failingLink(400, calls)]);
    const result = await run(link);
    expect(result.ok).toBe(false);
    expect(calls.n).toBe(1);
  });

});

