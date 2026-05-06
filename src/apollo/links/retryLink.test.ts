import { describe, it, expect } from 'vitest';
import { ApolloLink, execute, gql, Observable } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { getStatusCode, RETRYABLE_STATUS_CODES } from './retryLink';

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

function recoveringLink(failuresBeforeSuccess: number, statusCode: number, calls: { n: number }): ApolloLink {
  return new ApolloLink(() => {
    return new Observable((observer) => {
      calls.n += 1;
      if (calls.n <= failuresBeforeSuccess) {
        const err = Object.assign(new Error(`HTTP ${statusCode}`), { statusCode });
        observer.error(err);
        return;
      }
      observer.next({ data: { ping: 'ok' } });
      observer.complete();
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

  it('does NOT retry on 401', async () => {
    const calls = { n: 0 };
    const link = ApolloLink.from([makeRetryLink(), failingLink(401, calls)]);
    await run(link);
    expect(calls.n).toBe(1);
  });

  it('does NOT retry on 500', async () => {
    const calls = { n: 0 };
    const link = ApolloLink.from([makeRetryLink(), failingLink(500, calls)]);
    await run(link);
    expect(calls.n).toBe(1);
  });

  it('succeeds when a transient 503 resolves before max retries', async () => {
    const calls = { n: 0 };
    const link = ApolloLink.from([makeRetryLink(), recoveringLink(2, 503, calls)]);
    const result = await run(link);
    expect(result.ok).toBe(true);
    expect(calls.n).toBe(3);
  });
});

describe('getStatusCode', () => {
  it('returns undefined for non-objects', () => {
    expect(getStatusCode(null)).toBeUndefined();
    expect(getStatusCode(undefined)).toBeUndefined();
    expect(getStatusCode('boom')).toBeUndefined();
  });

  it('reads .statusCode (Apollo ServerError shape)', () => {
    expect(getStatusCode({ statusCode: 503 })).toBe(503);
  });

  it('falls back to .response.status (fetch response shape)', () => {
    expect(getStatusCode({ response: { status: 429 } })).toBe(429);
  });

  it('returns undefined when neither field is a number', () => {
    expect(getStatusCode({ statusCode: 'oops' })).toBeUndefined();
    expect(getStatusCode({ response: null })).toBeUndefined();
  });
});
