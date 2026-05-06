import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/auth/useAuth';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const { t } = useTranslation('common');
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="border-b border-silver-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tightish text-ink-900 hover:text-ink-700"
        >
          {t('header.brand')}
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-ink-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
            >
              {t('header.logout')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
