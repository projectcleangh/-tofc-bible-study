:root {
  --maroon: #6b1a1a;
  --maroon-soft: #7d2626;
  --gold: #c9a84c;
  --gold-bright: #e0c069;
  --cream: #fdf6e3;
  --cream-dim: #d8cdb0;
  --bg: #1a0a0a;
  --bg-raised: #2a1212;
  --bg-card: #25100f;
  --line: rgba(201, 168, 76, 0.22);
  --danger: #d98a8a;
  --font: var(--font-cormorant), Georgia, 'Times New Roman', serif;

  /* Accessible type scale (mobile-first, all generous) */
  --fs-body: 19px;
  --fs-prompt: 25px;
  --fs-question: 26px;
  --fs-title: 34px;
  --tap: 52px;
}

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--cream);
  font-family: var(--font);
  font-size: var(--fs-body);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}

/* Warm atmospheric backdrop */
body {
  background:
    radial-gradient(120% 80% at 50% -10%, rgba(107, 26, 26, 0.55) 0%, rgba(26, 10, 10, 0) 60%),
    radial-gradient(90% 60% at 80% 110%, rgba(201, 168, 76, 0.08) 0%, rgba(26, 10, 10, 0) 55%),
    var(--bg);
  min-height: 100vh;
  min-height: 100dvh;
}

.app {
  max-width: 560px;
  margin: 0 auto;
  padding: 18px 20px 120px;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* ---------- Top bar ---------- */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 22px;
}
.brand { display: flex; flex-direction: column; line-height: 1.05; }
.brand .mark {
  font-size: 13px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--gold);
}
.brand .name { font-size: 21px; font-weight: 600; color: var(--cream); }

/* ---------- Language switcher ---------- */
.lang {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 3px;
}
.lang button {
  min-height: 38px;
  padding: 0 12px;
  border: none;
  background: transparent;
  color: var(--cream-dim);
  font-family: var(--font);
  font-size: 16px;
  border-radius: 999px;
  cursor: pointer;
}
.lang button.active { background: var(--gold); color: #2a1208; font-weight: 600; }

/* ---------- Headings & text ---------- */
.eyebrow {
  font-size: 14px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 10px;
}
h1.title { font-size: var(--fs-title); font-weight: 600; margin: 0 0 8px; color: var(--cream); }
.prompt { font-size: var(--fs-prompt); line-height: 1.4; color: var(--cream); }
.question-text { font-size: var(--fs-question); line-height: 1.4; color: var(--cream); margin: 6px 0 18px; }
.muted { color: var(--cream-dim); }
.center { text-align: center; }
.fill { flex: 1; }

/* ---------- Cards ---------- */
.card {
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 16px;
}

/* ---------- Inputs ---------- */
label.field { display: block; margin-bottom: 16px; }
label.field .lab { display: block; font-size: 16px; color: var(--gold); margin-bottom: 8px; letter-spacing: 0.04em; }

input[type='text'], input[type='number'], input[type='date'], input[type='tel'], textarea, select {
  width: 100%;
  min-height: var(--tap);
  background: rgba(0, 0, 0, 0.3);
  border: 1.5px solid var(--line);
  border-radius: 12px;
  color: var(--cream);
  font-family: var(--font);
  font-size: var(--fs-body);
  padding: 12px 14px;
}
textarea { min-height: 130px; resize: vertical; line-height: 1.5; }
input:focus, textarea:focus, select:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.18); }
::placeholder { color: rgba(216, 205, 176, 0.5); }
select { appearance: none; }

/* ---------- Buttons ---------- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: var(--tap);
  padding: 14px 18px;
  border: none;
  border-radius: 12px;
  font-family: var(--font);
  font-size: 21px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.08s ease, filter 0.15s ease;
}
.btn:active { transform: scale(0.985); }
.btn-primary { background: linear-gradient(180deg, var(--gold-bright), var(--gold)); color: #2a1208; }
.btn-primary:hover { filter: brightness(1.05); }
.btn-maroon { background: var(--maroon); color: var(--cream); border: 1px solid var(--maroon-soft); }
.btn-ghost { background: transparent; color: var(--gold); border: 1.5px solid var(--line); }
.btn-danger { background: transparent; color: var(--danger); border: 1.5px solid rgba(217, 138, 138, 0.4); }
.btn-sm { width: auto; min-height: 44px; font-size: 17px; padding: 8px 16px; }
.btn:disabled { opacity: 0.5; cursor: default; }

.btn-row { display: flex; gap: 10px; }
.btn-row .btn { flex: 1; }

/* ---------- Toggle ---------- */
.toggle { display: flex; align-items: center; gap: 12px; min-height: var(--tap); cursor: pointer; }
.toggle input { width: 26px; height: 26px; accent-color: var(--gold); }
.toggle span { font-size: var(--fs-body); }

/* ---------- Reading text ---------- */
.scripture { font-size: 21px; line-height: 1.65; color: var(--cream); white-space: pre-wrap; }
.scripture .vnum { color: var(--gold); font-size: 14px; vertical-align: super; margin-right: 3px; }

/* ---------- Instruction tiles (swipeable) ---------- */
.tiles {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
}
.tile {
  scroll-snap-align: center;
  flex: 0 0 84%;
  background: linear-gradient(165deg, var(--maroon), #3a1010);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 22px;
}
.tile .num { color: var(--gold); font-size: 15px; letter-spacing: 0.2em; }
.tile h3 { font-size: 26px; margin: 8px 0 10px; color: var(--cream); }
.tile p { font-size: 20px; line-height: 1.45; color: var(--cream-dim); margin: 0; }
.dots { display: flex; justify-content: center; gap: 8px; margin: 12px 0 4px; }
.dots i { width: 8px; height: 8px; border-radius: 50%; background: var(--line); }
.dots i.on { background: var(--gold); }

/* ---------- Feed items ---------- */
.feed-item { border-bottom: 1px solid var(--line); padding: 14px 0; }
.feed-item:last-child { border-bottom: none; }
.feed-item .meta { font-size: 15px; color: var(--gold); margin-bottom: 4px; }
.feed-item .body { font-size: 18px; color: var(--cream); }

/* ---------- Pills / badges ---------- */
.pill {
  display: inline-block;
  background: rgba(201, 168, 76, 0.14);
  color: var(--gold);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 14px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

/* ---------- Hand / live rows ---------- */
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 10px;
}
.row .who { font-size: 19px; color: var(--cream); }
.row .resp { font-size: 17px; color: var(--cream-dim); margin-top: 4px; }
.row-actions { display: flex; gap: 8px; flex-shrink: 0; }

/* ---------- Leader tabs ---------- */
.tabs { display: flex; gap: 8px; margin-bottom: 18px; }
.tabs button {
  flex: 1; min-height: var(--tap); border-radius: 12px; border: 1px solid var(--line);
  background: transparent; color: var(--cream-dim); font-family: var(--font); font-size: 19px; cursor: pointer;
}
.tabs button.active { background: var(--maroon); color: var(--cream); border-color: var(--maroon-soft); }

/* ---------- Phase banner ---------- */
.phase-banner {
  text-align: center; background: linear-gradient(180deg, var(--maroon), #3a1010);
  border: 1px solid var(--line); border-radius: 16px; padding: 18px; margin-bottom: 16px;
}
.phase-banner .lab { font-size: 14px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); }
.phase-banner .val { font-size: 28px; font-weight: 600; color: var(--cream); margin-top: 4px; }

/* ---------- Sticky footer action ---------- */
.sticky-foot {
  position: fixed; left: 0; right: 0; bottom: 0;
  background: linear-gradient(180deg, rgba(26, 10, 10, 0), var(--bg) 38%);
  padding: 20px 20px calc(20px + env(safe-area-inset-bottom));
}
.sticky-foot .inner { max-width: 560px; margin: 0 auto; }

/* ---------- Misc ---------- */
.divider { height: 1px; background: var(--line); margin: 22px 0; }
.notice { font-size: 16px; color: var(--gold); background: rgba(201,168,76,0.08); border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; }
.foot-link { margin-top: auto; text-align: center; padding-top: 28px; }
.foot-link button { background: none; border: none; color: var(--cream-dim); font-family: var(--font); font-size: 15px; opacity: 0.6; cursor: pointer; letter-spacing: 0.1em; }

.fade-in { animation: fade 0.4s ease; }
@keyframes fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

.spinner {
  width: 28px; height: 28px; border-radius: 50%;
  border: 3px solid var(--line); border-top-color: var(--gold);
  animation: spin 0.8s linear infinite; margin: 24px auto;
}
@keyframes spin { to { transform: rotate(360deg); } }
