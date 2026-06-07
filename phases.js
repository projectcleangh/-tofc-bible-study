'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PHASE_QUESTION_INDEX } from '../lib/phases';

const lsGet = (k) => {
  try { return localStorage.getItem(k); } catch (e) { return null; }
};
const lsSet = (k, v) => {
  try { localStorage.setItem(k, v); } catch (e) {}
};

export default function Attendee({ t, lang }) {
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // identity
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // reflection
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);
  const [prevReflections, setPrevReflections] = useState([]);
  const [tileIdx, setTileIdx] = useState(0);
  const tilesRef = useRef(null);

  // reading
  const [passage, setPassage] = useState(null);
  const [passageLoading, setPassageLoading] = useState(false);

  // questions
  const [answer, setAnswer] = useState('');
  const [answerId, setAnswerId] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  // floor
  const [floorText, setFloorText] = useState('');
  const [floorSent, setFloorSent] = useState(false);

  const attendeeName = anonymous ? null : name || null;

  // ---- load identity once ----
  useEffect(() => {
    const savedName = lsGet('tofc_name');
    const savedAnon = lsGet('tofc_anon') === '1';
    if (savedName || savedAnon) {
      setName(savedName || '');
      setAnonymous(savedAnon);
      setLoggedIn(true);
    }
  }, []);

  // ---- load the active (latest) session + its questions ----
  const loadActive = useCallback(async () => {
    const { data: s } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setSession(s || null);
    if (s) {
      const { data: qs } = await supabase
        .from('questions')
        .select('*')
        .eq('session_id', s.id)
        .order('order_index', { ascending: true });
      setQuestions(qs || []);
      setReflectionSubmitted(lsGet(`tofc_refl_${s.id}`) === '1');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadActive();
    const ch = supabase
      .channel('attendee-sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => {
        loadActive();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadActive]);

  // ---- previous reflections for holding screen ----
  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase
        .from('reflections')
        .select('id, text, attendee_name, created_at, session_id, sessions(chapter)')
        .eq('kind', 'reflection')
        .neq('session_id', session.id)
        .order('created_at', { ascending: false })
        .limit(40);
      setPrevReflections(data || []);
    })();
  }, [session]);

  // ---- fetch passage on reading phase ----
  useEffect(() => {
    if (!session || session.phase !== 'reading') return;
    setPassageLoading(true);
    setPassage(null);
    fetch(`/api/passage?chapter=${session.chapter}`)
      .then((r) => r.json())
      .then((d) => setPassage(d))
      .catch(() => setPassage({ error: true }))
      .finally(() => setPassageLoading(false));
  }, [session && session.phase, session && session.chapter]); // eslint-disable-line

  // ---- when question phase changes, load this attendee's saved answer ----
  const currentQuestion = (() => {
    if (!session) return null;
    const idx = PHASE_QUESTION_INDEX[session.phase];
    if (!idx) return null;
    return questions.find((q) => q.order_index === idx) || null;
  })();

  useEffect(() => {
    if (!currentQuestion) return;
    const saved = lsGet(`tofc_resp_${currentQuestion.id}`);
    if (saved) {
      try {
        const o = JSON.parse(saved);
        setAnswer(o.text || '');
        setAnswerId(o.id || null);
        setAnswerSubmitted(!!o.id);
        setHandRaised(!!o.hand);
        return;
      } catch (e) {}
    }
    setAnswer('');
    setAnswerId(null);
    setAnswerSubmitted(false);
    setHandRaised(false);
  }, [currentQuestion && currentQuestion.id]); // eslint-disable-line

  // ---------------------------------------------------------------- actions
  const doLogin = () => {
    const finalAnon = anonymous;
    const finalName = finalAnon ? '' : nameInput.trim();
    if (!finalAnon && !finalName) return;
    setName(finalName);
    lsSet('tofc_name', finalName);
    lsSet('tofc_anon', finalAnon ? '1' : '0');
    setLoggedIn(true);
  };

  const submitReflection = async () => {
    if (!reflectionText.trim() || !session) return;
    await supabase.from('reflections').insert({
      session_id: session.id,
      attendee_name: attendeeName,
      text: reflectionText.trim(),
      kind: 'reflection',
    });
    lsSet(`tofc_refl_${session.id}`, '1');
    setReflectionSubmitted(true);
  };

  const saveAnswer = async () => {
    if (!currentQuestion || !session) return;
    const text = answer.trim();
    if (answerId) {
      await supabase.from('responses').update({ text }).eq('id', answerId);
      lsSet(`tofc_resp_${currentQuestion.id}`, JSON.stringify({ id: answerId, text, hand: handRaised }));
    } else {
      const { data } = await supabase
        .from('responses')
        .insert({
          session_id: session.id,
          question_id: currentQuestion.id,
          attendee_name: attendeeName,
          text,
          raised_hand: false,
        })
        .select('id')
        .single();
      if (data) {
        setAnswerId(data.id);
        lsSet(`tofc_resp_${currentQuestion.id}`, JSON.stringify({ id: data.id, text, hand: false }));
      }
    }
    setAnswerSubmitted(true);
  };

  const toggleHand = async () => {
    if (!currentQuestion || !session) return;
    const next = !handRaised;
    let id = answerId;
    if (id) {
      await supabase.from('responses').update({ raised_hand: next }).eq('id', id);
    } else {
      const { data } = await supabase
        .from('responses')
        .insert({
          session_id: session.id,
          question_id: currentQuestion.id,
          attendee_name: attendeeName,
          text: answer.trim(),
          raised_hand: next,
        })
        .select('id')
        .single();
      if (data) { id = data.id; setAnswerId(id); }
    }
    setHandRaised(next);
    if (id) lsSet(`tofc_resp_${currentQuestion.id}`, JSON.stringify({ id, text: answer.trim(), hand: next }));
  };

  const submitFloor = async () => {
    if (!floorText.trim() || !session) return;
    await supabase.from('reflections').insert({
      session_id: session.id,
      attendee_name: null,
      text: floorText.trim(),
      kind: 'floor',
    });
    setFloorText('');
    setFloorSent(true);
  };

  // ---------------------------------------------------------------- render
  if (loading) {
    return <div className="spinner" />;
  }

  // ---- LOGIN ----
  if (!loggedIn) {
    return (
      <div className="fade-in fill">
        <div className="eyebrow">{t('churchName')}</div>
        <h1 className="title">{t('login_namePrompt')}</h1>
        <p className="muted" style={{ marginTop: -2, marginBottom: 22 }}>{t('tagline')}</p>
        <label className="field">
          <span className="lab">{t('login_firstName')}</span>
          <input
            type="text"
            value={nameInput}
            disabled={anonymous}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doLogin()}
            autoComplete="given-name"
          />
        </label>
        <label className="toggle">
          <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
          <span>{t('login_anonymous')}</span>
        </label>
        <div className="sticky-foot">
          <div className="inner">
            <button className="btn btn-primary" onClick={doLogin} disabled={!anonymous && !nameInput.trim()}>
              {t('login_enter')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // greeting label
  const chapterLabel = session ? `Mark ${session.chapter}` : '';
  const greeting = session ? t('greeting', { church: t('churchName'), chapter: chapterLabel }) : t('churchName');

  // ---- NO ACTIVE SESSION ----
  if (!session) {
    return (
      <div className="fill center fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="pill" style={{ alignSelf: 'center', marginBottom: 16 }}>{t('churchName')}</div>
        <p className="prompt">{t('waitingForLeader')}</p>
      </div>
    );
  }

  const phase = session.phase;

  // ---- REFLECTION (not yet submitted) ----
  if (phase === 'reflection' && !reflectionSubmitted) {
    return (
      <div className="fade-in fill">
        <div className="pill">{greeting}</div>
        <h1 className="title" style={{ marginTop: 16 }}>{t('reflection_heading')}</h1>
        {session.reflection_prompt && <p className="prompt" style={{ marginBottom: 18 }}>{session.reflection_prompt}</p>}
        <textarea
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder={t('reflection_placeholder')}
        />
        <div className="sticky-foot">
          <div className="inner">
            <button className="btn btn-primary" onClick={submitReflection} disabled={!reflectionText.trim()}>
              {t('reflection_submit')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- HOLDING (reflection submitted, waiting) ----
  if (phase === 'reflection' && reflectionSubmitted) {
    const tiles = [1, 2, 3, 4];
    return (
      <div className="fade-in fill">
        <p className="notice">{t('holding_waiting')}</p>

        <div className="eyebrow" style={{ marginTop: 22 }}>{t('holding_howTo')}</div>
        <div
          className="tiles"
          ref={tilesRef}
          onScroll={(e) => {
            const w = e.target.firstChild ? e.target.firstChild.offsetWidth + 14 : 1;
            setTileIdx(Math.round(e.target.scrollLeft / w));
          }}
        >
          {tiles.map((n) => (
            <div className="tile" key={n}>
              <div className="num">{n} / 4</div>
              <h3>{t(`tile${n}_title`)}</h3>
              <p>{t(`tile${n}_body`)}</p>
            </div>
          ))}
        </div>
        <div className="dots">
          {tiles.map((n, i) => <i key={n} className={i === tileIdx ? 'on' : ''} />)}
        </div>

        <div className="divider" />
        <div className="eyebrow">{t('holding_previousReflections')}</div>
        {prevReflections.length === 0 ? (
          <p className="muted">{t('holding_noReflections')}</p>
        ) : (
          <div className="card">
            {prevReflections.map((r) => (
              <div className="feed-item" key={r.id}>
                <div className="meta">
                  Mark {r.sessions ? r.sessions.chapter : '?'} · {r.attendee_name || t('anonymous')}
                </div>
                <div className="body">{r.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---- READING ----
  if (phase === 'reading') {
    return (
      <div className="fade-in fill">
        <div className="pill">{chapterLabel}</div>
        <h1 className="title" style={{ marginTop: 16 }}>{t('reading_heading')}</h1>
        <a
          className="btn btn-maroon"
          href="https://www.bible.com/organizations/e2271862-78b9-4b8c-b659-005554bf9033"
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginBottom: 18, textDecoration: 'none' }}
        >
          {t('reading_openYouVersion')} ↗
        </a>
        {passageLoading && <div className="spinner" />}
        {!passageLoading && passage && passage.text && (
          <div className="card">
            <div className="eyebrow">{t('reading_source', { translation: passage.translation })}</div>
            <div className="scripture">{passage.text}</div>
          </div>
        )}
        {!passageLoading && passage && !passage.text && (
          <p className="notice" style={{ color: 'var(--danger)' }}>{t('reading_error')}</p>
        )}
      </div>
    );
  }

  // ---- QUESTION ----
  if (currentQuestion) {
    return (
      <div className="fade-in fill">
        <div className="pill">{t(`label_${currentQuestion.label}`)}</div>
        <p className="question-text" style={{ marginTop: 16 }}>{currentQuestion.text}</p>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={t('question_placeholder')}
        />
        {answerSubmitted && <p className="notice" style={{ marginTop: 12 }}>{t('question_thanks')}</p>}

        <div className="sticky-foot">
          <div className="inner">
            <div className="btn-row" style={{ marginBottom: 10 }}>
              <button
                className={handRaised ? 'btn btn-primary' : 'btn btn-ghost'}
                onClick={toggleHand}
              >
                {handRaised ? t('handRaised') : t('raiseHand')}
              </button>
            </div>
            <button className="btn btn-primary" onClick={saveAnswer} disabled={!answer.trim()}>
              {answerSubmitted ? t('question_update') : t('question_submit')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- FLOOR ----
  if (phase === 'floor') {
    return (
      <div className="fade-in fill">
        <h1 className="title">{t('floor_heading')}</h1>
        <textarea
          value={floorText}
          onChange={(e) => { setFloorText(e.target.value); setFloorSent(false); }}
          placeholder={t('floor_placeholder')}
        />
        {floorSent && <p className="notice" style={{ marginTop: 12 }}>{t('floor_sent')}</p>}
        <div className="sticky-foot">
          <div className="inner">
            <button className="btn btn-primary" onClick={submitFloor} disabled={!floorText.trim()}>
              {t('floor_submit')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- DONE ----
  return (
    <div className="fill center fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>✦</div>
      <h1 className="title" style={{ fontSize: 40 }}>{t('done_title')}</h1>
      <p className="prompt muted">{t('done_subtitle')}</p>
    </div>
  );
}
