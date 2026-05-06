import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import i18n from './index';

describe('i18n', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('en');
  });

  afterAll(async () => {
    await i18n.changeLanguage('en');
  });

  it('exposes en and de as supported languages', () => {
    expect(i18n.options.supportedLngs).toEqual(expect.arrayContaining(['en', 'de']));
  });

  it('translates a common namespace key in English by default', () => {
    expect(i18n.t('header.logout', { ns: 'common' })).toBe('Log out');
  });

  it('translates an auth namespace key', () => {
    expect(i18n.t('login.submit', { ns: 'auth' })).toBe('Sign in');
  });

  it('switches to German and translates the same keys', async () => {
    await i18n.changeLanguage('de');
    expect(i18n.t('header.logout', { ns: 'common' })).toBe('Abmelden');
    expect(i18n.t('login.submit', { ns: 'auth' })).toBe('Anmelden');
  });

  it('falls back to English when the language is unknown', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.t('header.logout', { ns: 'common' })).toBe('Log out');
  });
});
