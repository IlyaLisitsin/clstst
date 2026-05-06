import { describe, it, expect, beforeEach } from 'vitest';
import { ApolloLink, execute, gql, Observable, type Operation } from '@apollo/client';
import { authLink } from './authLink';
import { tokenStore } from '../tokenStore';

const PING_QUERY = gql`
  query Ping {
    ping
  }
`;

function captureContext(): { link: ApolloLink; getOp: () => Operation | undefined } {
  let captured: Operation | undefined;
  const terminating = new ApolloLink((operation) => {
    captured = operation;
    return new Observable((observer) => {
      observer.next({ data: { ping: 'ok' } });
      observer.complete();
    });
  });
  return {
    link: ApolloLink.from([authLink, terminating]),
    getOp: () => captured,
  };
}

function run(link: ApolloLink): Promise<void> {
  return new Promise((resolve, reject) => {
    execute(link, { query: PING_QUERY }).subscribe({
      complete: () => resolve(),
      error: reject,
    });
  });
}

describe('authLink', () => {
  beforeEach(() => {
    tokenStore.set(null);
  });

  it('omits the authorization header when no token is set', async () => {
    const { link, getOp } = captureContext();
    await run(link);
    const op = getOp();
    expect(op).toBeDefined();
    const headers = (op?.getContext().headers ?? {}) as Record<string, string>;
    expect(headers.authorization).toBeUndefined();
  });

  it('adds Bearer header when a token is set', async () => {
    tokenStore.set('jwt-abc');
    const { link, getOp } = captureContext();
    await run(link);
    const headers = (getOp()?.getContext().headers ?? {}) as Record<string, string>;
    expect(headers.authorization).toBe('Bearer jwt-abc');
  });

  it('reads the token lazily — token set after link construction is still picked up', async () => {
    const { link, getOp } = captureContext();
    tokenStore.set('jwt-late');
    await run(link);
    const headers = (getOp()?.getContext().headers ?? {}) as Record<string, string>;
    expect(headers.authorization).toBe('Bearer jwt-late');
  });
});
