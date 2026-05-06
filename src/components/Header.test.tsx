import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
import { AuthContext } from '@/auth/authContext';
import type { AuthContextValue } from '@/auth/types';
import '../i18n';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeAuth(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    token: null,
    isAuthenticated: false,
    login: vi.fn().mockResolvedValue({ ok: true }),
    logout: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function renderHeader(auth: AuthContextValue) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the brand name', () => {
    renderHeader(makeAuth());
    expect(screen.getByText('FreshCells')).toBeInTheDocument();
  });

  it('hides the logout button when not authenticated', () => {
    renderHeader(makeAuth({ isAuthenticated: false }));
    expect(screen.queryByRole('button', { name: /log out/i })).not.toBeInTheDocument();
  });

  it('shows the logout button when authenticated', () => {
    renderHeader(makeAuth({ isAuthenticated: true, token: 'x' }));
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
  });

  it('calls logout and navigates to /login when logout button is clicked', async () => {
    const auth = makeAuth({ isAuthenticated: true, token: 'x' });
    renderHeader(auth);
    await userEvent.click(screen.getByRole('button', { name: /log out/i }));
    expect(auth.logout).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('renders the language switcher', () => {
    renderHeader(makeAuth());
    expect(screen.getByRole('group', { name: /language/i })).toBeInTheDocument();
  });
});
