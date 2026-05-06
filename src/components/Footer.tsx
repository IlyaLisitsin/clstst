import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation('common');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-silver-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-2 px-6 py-6 text-sm text-ink-700 sm:flex-row sm:items-center">
        <span>{t('footer.copyright', { year })}</span>
        <span className="text-silver-400">{t('footer.tagline')}</span>
      </div>
    </footer>
  );
}
