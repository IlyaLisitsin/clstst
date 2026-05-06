export type LoginErrorKind = 'invalid_credentials' | 'network' | 'unknown';

export interface LoginError {
  kind: LoginErrorKind;
  message: string;
}

export type LoginResult = { ok: true } | { ok: false; error: LoginError };

export interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login(identifier: string, password: string): Promise<LoginResult>;
  logout(): Promise<void>;
}
