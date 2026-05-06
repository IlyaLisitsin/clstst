import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthContext } from './authContext';
import type { AuthContextValue } from './types';

function makeAuth(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    token: null,
    isAuthenticated: false,
    login: async () => ({ ok: true }),
    logout: async () => {},
    ...overrides,
  };
}

function renderAt(path: string, auth: AuthContextValue, secret: ReactNode = 'SECRET') {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<div>{secret}</div>} />
          </Route>
          <Route path="/login" element={<div>LOGIN PAGE</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when unauthenticated', () => {
    renderAt('/profile', makeAuth({ isAuthenticated: false }));
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
    expect(screen.queryByText('SECRET')).not.toBeInTheDocument();
  });

  it('renders the protected outlet when authenticated', () => {
    renderAt('/profile', makeAuth({ isAuthenticated: true, token: 'x' }));
    expect(screen.getByText('SECRET')).toBeInTheDocument();
    expect(screen.queryByText('LOGIN PAGE')).not.toBeInTheDocument();
  });
});
