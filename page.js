'use client';

import { LANGUAGES } from '../lib/i18n';

export default function LanguageSwitcher({ lang, setLang }) {
  return (
    <div className="lang" role="group" aria-label="Language">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          className={lang === l.code ? 'active' : ''}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
