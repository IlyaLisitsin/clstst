import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common');
  const current = (i18n.resolvedLanguage ?? i18n.language ?? 'en').slice(0, 2);

  const change = (lng: SupportedLanguage) => {
    if (current !== lng) {
      void i18n.changeLanguage(lng);
    }
  };

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className="inline-flex overflow-hidden rounded-md border border-silver-200 bg-white text-sm"
    >
      {SUPPORTED_LANGUAGES.map((lng) => {
        const active = current === lng;
        return (
          <button
            key={lng}
            type="button"
            onClick={() => change(lng)}
            aria-pressed={active}
            className={
              active
                ? 'bg-ink-900 px-3 py-1.5 font-medium uppercase tracking-tightish text-white'
                : 'px-3 py-1.5 uppercase tracking-tightish text-ink-700 hover:bg-silver-100'
            }
          >
            {lng}
          </button>
        );
      })}
    </div>
  );
}
