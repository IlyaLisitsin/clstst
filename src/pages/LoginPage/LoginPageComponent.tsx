import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/auth/useAuth';
import { loginSchema, type LoginFormValues } from './loginSchema';
import type { LoginErrorKind } from '@/auth/types';

function errorKey(kind: LoginErrorKind): string {
  if (kind === 'invalid_credentials') return 'login.errors.invalidCredentials';
  if (kind === 'network') return 'login.errors.network';
  return 'login.errors.unknown';
}

export function LoginPage() {
  const { t } = useTranslation('auth');
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    setFocus('identifier');
  }, [setFocus]);

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    const result = await login(values.identifier, values.password);
    if (result.ok) {
      navigate('/profile', { replace: true });
    } else {
      setServerError(t(errorKey(result.error.kind)));
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-silver-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tightish text-ink-900">
            {t('login.title')}
          </h1>
          <p className="mt-1 text-sm text-silver-400">{t('login.subtitle')}</p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <label htmlFor="identifier" className="mb-1.5 block text-sm font-medium text-ink-900">
              {t('login.fields.identifier.label')}
            </label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              placeholder={t('login.fields.identifier.placeholder')}
              aria-invalid={!!errors.identifier}
              aria-describedby={errors.identifier ? 'identifier-error' : undefined}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-ink-900 placeholder-silver-300 outline-none transition focus:ring-2 focus:ring-ink-900 focus:ring-offset-1 ${
                errors.identifier
                  ? 'border-red-300 bg-red-50 focus:ring-red-400'
                  : 'border-silver-200 bg-white hover:border-silver-300'
              }`}
              {...register('identifier')}
            />
            {errors.identifier && (
              <p id="identifier-error" role="alert" className="mt-1.5 text-xs text-red-600">
                {t(`login.errors.${errors.identifier.message as string}`)}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-900">
              {t('login.fields.password.label')}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder={t('login.fields.password.placeholder')}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-ink-900 placeholder-silver-300 outline-none transition focus:ring-2 focus:ring-ink-900 focus:ring-offset-1 ${
                errors.password
                  ? 'border-red-300 bg-red-50 focus:ring-red-400'
                  : 'border-silver-200 bg-white hover:border-silver-300'
              }`}
              {...register('password')}
            />
            {errors.password && (
              <p id="password-error" role="alert" className="mt-1.5 text-xs text-red-600">
                {t(`login.errors.${errors.password.message as string}`)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-lg bg-ink-900 py-2.5 text-sm font-medium text-white transition hover:bg-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t('login.submitting') : t('login.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
