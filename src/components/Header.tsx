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
              aria-label={t('header.logout')}
              className="rounded-md p-1.5 text-ink-500 transition hover:bg-silver-100 hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
