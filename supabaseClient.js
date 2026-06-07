'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PHASES, nextPhase, prevPhase, phaseLabelKey } from '../lib/phases';

const DEFAULT_LABELS = ['Comprehension', 'Interpretation', 'Application'];

export default function Leader({ t, lang, onExit }) {
  const [tab, setTab] = useState('prep');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---- load latest session ----
  const loadSession = useCallback(async () => {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setSession(data || null);
    setLoading(false);
    return data || null;
  }, []);

  useEffect(() => {
    loadSession();
    const ch = supabase
      .channel('leader-sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => loadSession())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadSession]);

  if (loading) return <div className="spinner" />;

  return (
    <div className="fade-in fill">
      <div className="tabs">
        <button className={tab === 'prep' ? 'active' : ''} onClick={() => setTab('prep')}>{t('tab_prep')}</button>
        <button className={tab === 'live' ? 'active' : ''} onClick={() => setTab('live')}>{t('tab_live')}</button>
      </div>

      {tab === 'prep'
        ? <Prep t={t} session={session} reload={loadSession} />
        : <Live t={t} session={session} reload={loadSession} />}

      <div className="divider" />
      <button className="btn btn-ghost" onClick={onExit}>{t('leader_logout')}</button>
    </div>
  );
}

/* =========================================================================
   PREP MODE
   ========================================================================= */
function Prep({ t, session, reload }) {
  const [chapter, setChapter] = useState(1);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [prompt, setPrompt] = useState('');
  const [qs, setQs] = useState(DEFAULT_LABELS.map((label) => ({ label, text: '' })));
  const [savedMsg, setSavedMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // load current session into the form
  useEffect(() => {
    (async () => {
      if (!session) return;
      setChapter(session.chapter);
      setDate(session.date || new Date().toISOString().slice(0, 10));
      setPrompt(session.reflection_prompt || '');
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('session_id', session.id)
        .order('order_index', { ascending: true });
      if (data && data.length) {
        const filled = [1, 2, 3].map((i) => {
          const q = data.find((x) => x.order_index === i);
          return q ? { label: q.label, text: q.text } : { label: DEFAULT_LABELS[i - 1], text: '' };
        });
        setQs(filled);
      }
    })();
  }, [session && session.id]); // eslint-disable-line

  const setQ = (i, key, val) => {
    setQs((prev) => prev.map((q, idx) => (idx === i ? { ...q, [key]: val } : q)));
  };

  const flash = (msg) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(''), 2500); };

  const writeQuestions = async (sessionId) => {
    // upsert by (session_id, order_index) — questions are never deleted (no RLS
    // delete policy), so we overwrite the 3 fixed slots in place each save.
    await supabase.from('questions').upsert(
      qs.map((q, i) => ({
        session_id: sessionId,
        label: q.label,
        text: q.text.trim(),
        order_index: i + 1,
      })),
      { onConflict: 'session_id,order_index' }
    );
  };

  const saveCurrent = async () => {
    if (!session) return;
    setBusy(true);
    await supabase
      .from('sessions')
      .update({ chapter, date, reflection_prompt: prompt.trim() })
      .eq('id', session.id);
    await writeQuestions(session.id);
    await reload();
    setBusy(false);
    flash(t('prep_saved'));
  };

  const createNew = async () => {
    setBusy(true);
    const { data } = await supabase
      .from('sessions')
      .insert({ chapter, date, reflection_prompt: prompt.trim(), phase: 'reflection', headcount: 0 })
      .select('id')
      .single();
    if (data) await writeQuestions(data.id);
    await reload();
    setBusy(false);
    flash(t('prep_saved'));
  };

  return (
    <div>
      {session
        ? <p className="notice">{t('prep_loadedFrom', { chapter: `Mark ${session.chapter}` })}</p>
        : <p className="notice">{t('prep_noSession')}</p>}

      <label className="field" style={{ marginTop: 16 }}>
        <span className="lab">{t('prep_chapter')}</span>
        <select value={chapter} onChange={(e) => setChapter(parseInt(e.target.value, 10))}>
          {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>Mark {n}</option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="lab">{t('prep_date')}</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      <label className="field">
        <span className="lab">{t('prep_prompt')}</span>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t('prep_promptPlaceholder')} />
      </label>

      <div className="eyebrow" style={{ marginTop: 8 }}>{t('prep_questions')}</div>
      {qs.map((q, i) => (
        <div className="card" key={i}>
          <label className="field" style={{ marginBottom: 12 }}>
            <span className="lab">{t('prep_label')} {i + 1}</span>
            <select value={q.label} onChange={(e) => setQ(i, 'label', e.target.value)}>
              {DEFAULT_LABELS.map((l) => (
                <option key={l} value={l}>{t(`label_${l}`)}</option>
              ))}
            </select>
          </label>
          <label className="field" style={{ marginBottom: 0 }}>
            <span className="lab">{t('prep_questionText')}</span>
            <textarea value={q.text} onChange={(e) => setQ(i, 'text', e.target.value)} placeholder={t('prep_questionPlaceholder')} style={{ minHeight: 90 }} />
          </label>
        </div>
      ))}

      {savedMsg && <p className="notice">{savedMsg}</p>}

      <button className="btn btn-primary" disabled={busy || !session} onClick={saveCurrent} style={{ marginBottom: 10 }}>
        {t('prep_save')}
      </button>
      <button className="btn btn-maroon" disabled={busy} onClick={createNew}>
        {t('prep_createNew')}
      </button>
    </div>
  );
}

/* =========================================================================
   LIVE MODE
   ========================================================================= */
function Live({ t, session, reload }) {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [floor, setFloor] = useState([]);
  const [head, setHead] = useState(0);
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');

  const sessionId = session ? session.id : null;

  const loadAll = useCallback(async () => {
    if (!sessionId) return;
    const [{ data: qs }, { data: rs }, { data: fl }] = await Promise.all([
      supabase.from('questions').select('*').eq('session_id', sessionId).order('order_index'),
      supabase.from('responses').select('*').eq('session_id', sessionId).order('created_at'),
      supabase.from('reflections').select('*').eq('session_id', sessionId).eq('kind', 'floor').order('created_at'),
    ]);
    setQuestions(qs || []);
    setResponses(rs || []);
    setFloor(fl || []);
  }, [sessionId]);

  useEffect(() => {
    loadAll();
    setHead(session ? session.headcount || 0 : 0);
  }, [loadAll, session && session.headcount]); // eslint-disable-line

  // realtime: responses + floor
  useEffect(() => {
    if (!sessionId) return;
    const ch = supabase
      .channel('leader-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'responses' }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reflections' }, () => loadAll())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [sessionId, loadAll]);

  if (!session) {
    return <p className="notice">{t('prep_noSession')}</p>;
  }

  const advance = async () => {
    await supabase.from('sessions').update({ phase: nextPhase(session.phase) }).eq('id', session.id);
    reload();
  };
  const stepBack = async () => {
    await supabase.from('sessions').update({ phase: prevPhase(session.phase) }).eq('id', session.id);
    reload();
  };
  const setHeadcount = async () => {
    await supabase.from('sessions').update({ headcount: Number(head) || 0 }).eq('id', session.id);
    reload();
  };
  const reset = async () => {
    if (!confirm(t('live_confirmReset'))) return;
    await supabase.from('sessions').update({ phase: 'reflection' }).eq('id', session.id);
    reload();
  };
  const end = async () => {
    if (!confirm(t('live_confirmEnd'))) return;
    await supabase.from('sessions').update({ phase: 'done' }).eq('id', session.id);
    reload();
  };
  const dismissHand = async (id) => {
    await supabase.from('responses').update({ raised_hand: false }).eq('id', id);
    loadAll();
  };
  const deleteResponse = async (id) => {
    await supabase.rpc('delete_response', { target_id: id });
    loadAll();
  };
  const saveEdit = async () => {
    if (!editing) return;
    await supabase.from('responses').update({ text: editText }).eq('id', editing);
    setEditing(null);
    setEditText('');
    loadAll();
  };

  const phaseIdx = PHASES.indexOf(session.phase);
  const hands = responses.filter((r) => r.raised_hand);

  return (
    <div>
      <div className="phase-banner">
        <div className="lab">{t('live_currentPhase')} · Mark {session.chapter}</div>
        <div className="val">{t(phaseLabelKey(session.phase))}</div>
      </div>

      <div className="btn-row" style={{ marginBottom: 16 }}>
        <button className="btn btn-ghost btn-sm" disabled={phaseIdx <= 0} onClick={stepBack}>{t('live_back')}</button>
        <button className="btn btn-primary btn-sm" disabled={phaseIdx >= PHASES.length - 1} onClick={advance}>{t('live_advance')}</button>
      </div>

      {/* Headcount */}
      <div className="row">
        <span className="who">{t('live_headcount')}</span>
        <div className="row-actions" style={{ alignItems: 'center' }}>
          <input
            type="number"
            min="0"
            value={head}
            onChange={(e) => setHead(e.target.value)}
            style={{ width: 90, minHeight: 44 }}
          />
          <button className="btn btn-maroon btn-sm" onClick={setHeadcount}>{t('live_setHeadcount')}</button>
        </div>
      </div>

      {/* Raised hands */}
      <div className="eyebrow" style={{ marginTop: 22 }}>{t('live_raisedHands')}</div>
      {hands.length === 0 ? (
        <p className="muted">{t('live_noHands')}</p>
      ) : (
        hands.map((h) => (
          <div className="row" key={`hand-${h.id}`}>
            <span className="who">✋ {h.attendee_name || t('anonymous')}</span>
            <div className="row-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => dismissHand(h.id)}>{t('live_dismiss')}</button>
            </div>
          </div>
        ))
      )}

      {/* Responses per question */}
      <div className="eyebrow" style={{ marginTop: 22 }}>{t('live_responses')}</div>
      {questions.map((q) => {
        const rs = responses.filter((r) => r.question_id === q.id && (r.text || '').trim());
        return (
          <div className="card" key={q.id}>
            <div className="pill" style={{ marginBottom: 10 }}>{t(`label_${q.label}`)}</div>
            <p className="muted" style={{ fontSize: 17, marginTop: 0 }}>{q.text}</p>
            {rs.length === 0 ? (
              <p className="muted">{t('live_noResponses')}</p>
            ) : (
              rs.map((r) => (
                <div className="feed-item" key={r.id}>
                  <div className="meta">{r.attendee_name || t('anonymous')}</div>
                  {editing === r.id ? (
                    <>
                      <textarea value={editText} onChange={(e) => setEditText(e.target.value)} style={{ minHeight: 80, marginTop: 6 }} />
                      <div className="btn-row" style={{ marginTop: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>{t('back')}</button>
                        <button className="btn btn-primary btn-sm" onClick={saveEdit}>{t('live_save')}</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="body">{r.text}</div>
                      <div className="row-actions" style={{ marginTop: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(r.id); setEditText(r.text || ''); }}>✎</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteResponse(r.id)}>{t('live_delete')}</button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        );
      })}

      {/* Floor questions */}
      <div className="eyebrow" style={{ marginTop: 14 }}>{t('live_floorQuestions')}</div>
      {floor.length === 0 ? (
        <p className="muted">{t('live_noFloor')}</p>
      ) : (
        <div className="card">
          {floor.map((f) => (
            <div className="feed-item" key={f.id}>
              <div className="body">{f.text}</div>
            </div>
          ))}
        </div>
      )}

      <div className="divider" />
      <div className="btn-row">
        <button className="btn btn-ghost" onClick={reset}>{t('live_reset')}</button>
        <button className="btn btn-danger" onClick={end}>{t('live_end')}</button>
      </div>
    </div>
  );
}
