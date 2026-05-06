import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/auth/useAuth';
import { USER_QUERY } from '@/apollo/operations/user';

interface ReadFieldProps {
  label: string;
  value: string | null | undefined;
}

function ReadField({ label, value }: ReadFieldProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-silver-400">
        {label}
      </label>
      <input
        type="text"
        readOnly
        value={value ?? ''}
        className="w-full rounded-lg border border-silver-200 bg-silver-50 px-3.5 py-2.5 text-sm text-ink-900 outline-none"
      />
    </div>
  );
}

export function ProfilePage() {
  const { t } = useTranslation('profile');
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(USER_QUERY, { fetchPolicy: 'cache-and-network' });

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tightish text-ink-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-silver-400">{t('subtitle')}</p>
        </div>

        {loading && !data && (
          <p className="text-sm text-silver-400">{t('loading')}</p>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {t('errors.load')}
          </div>
        )}

        {data?.user && (
          <div className="space-y-4 rounded-2xl border border-silver-200 bg-white p-8 shadow-sm">
            <ReadField label={t('fields.firstName')} value={data.user.firstName} />
            <ReadField label={t('fields.lastName')} value={data.user.lastName} />
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg bg-ink-900 py-2.5 text-sm font-medium text-white transition hover:bg-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
        >
          {t('logout')}
        </button>
      </div>
    </div>
  );
}
