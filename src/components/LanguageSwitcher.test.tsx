import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSwitcher } from './LanguageSwitcher';
import i18n from '@/i18n';
import '../i18n';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LanguageSwitcher', () => {
  it('renders EN and DE buttons', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole('button', { name: /en/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /de/i })).toBeInTheDocument();
  });

  it('marks the current language as active (aria-pressed)', async () => {
    await i18n.changeLanguage('en');
    render(<LanguageSwitcher />);
    expect(screen.getByRole('button', { name: 'en' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'de' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls i18n.changeLanguage when the inactive button is clicked', async () => {
    await i18n.changeLanguage('en');
    const spy = vi.spyOn(i18n, 'changeLanguage');
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole('button', { name: 'de' }));
    expect(spy).toHaveBeenCalledWith('de');
  });

  it('does not call changeLanguage when the current language button is clicked again', async () => {
    await i18n.changeLanguage('en');
    const spy = vi.spyOn(i18n, 'changeLanguage');
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole('button', { name: 'en' }));
    expect(spy).not.toHaveBeenCalled();
  });
});
