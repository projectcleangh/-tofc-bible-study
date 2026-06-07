'use client';

import { useEffect, useState } from 'react';
import { makeT } from '../lib/i18n';
import { LEADER_PIN } from '../lib/supabaseClient';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Attendee from '../components/Attendee';
import Leader from '../components/Leader';

export default function Page() {
  const [lang, setLangState] = useState('en');
  const [mode, setMode] = useState('attendee'); // 'attendee' | 'leader'
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [ready, setReady] = useState(false);

  // Load saved language + leader session
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('tofc_lang');
      if (savedLang) setLangState(savedLang);
      if (sessionStorage.getItem('tofc_leader') === '1') setMode('leader');
    } catch (e) {}
    setReady(true);
  }, []);

  const setLang = (l) => {
    setLangState(l);
    try {
      localStorage.setItem('tofc_lang', l);
    } catch (e) {}
  };

  const t = makeT(lang);

  const submitPin = () => {
    if (pin === String(LEADER_PIN)) {
      setMode('leader');
      setShowPin(false);
      setPin('');
      setPinError(false);
      try {
        sessionStorage.setItem('tofc_leader', '1');
      } catch (e) {}
    } else {
      setPinError(true);
    }
  };

  const exitLeader = () => {
    setMode('attendee');
    try {
      sessionStorage.removeItem('tofc_leader');
    } catch (e) {}
  };

  if (!ready) {
    return (
      <div className="app">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <span className="mark">Tower of Faith</span>
          <span className="name">TOFC Bible Study</span>
        </div>
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </div>

      {mode === 'leader' ? (
        <Leader t={t} lang={lang} onExit={exitLeader} />
      ) : (
        <Attendee t={t} lang={lang} />
      )}

      {mode === 'attendee' && !showPin && (
        <div className="foot-link">
          <button onClick={() => setShowPin(true)}>{t('leaderAccess')}</button>
        </div>
      )}

      {showPin && (
        <div className="card fade-in" style={{ marginTop: 'auto' }}>
          <div className="eyebrow">{t('leader_title')}</div>
          <label className="field">
            <span className="lab">{t('leader_enterPin')}</span>
            <input
              type="tel"
              inputMode="numeric"
              value={pin}
              placeholder={t('leader_pinPlaceholder')}
              onChange={(e) => {
                setPin(e.target.value);
                setPinError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && submitPin()}
            />
          </label>
          {pinError && <p className="notice" style={{ color: 'var(--danger)' }}>{t('leader_wrongPin')}</p>}
          <div className="btn-row">
            <button className="btn btn-ghost" onClick={() => { setShowPin(false); setPin(''); setPinError(false); }}>
              {t('back')}
            </button>
            <button className="btn btn-primary" onClick={submitPin}>{t('leader_unlock')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
