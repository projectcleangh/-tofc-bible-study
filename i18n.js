# TOFC Bible Study

A mobile-first, leader-led Bible study app for **Tower of Faith Christian Centre**.
The leader advances the session; every attendee's phone moves through the same phases in
real time: **Reflection → Reading → 3 Questions → Floor questions → Done.**

**Stack:** Next.js 14 (App Router, JavaScript) · Supabase (Postgres + Realtime) · Vercel.

> **New here? Read [`SETUP.md`](./SETUP.md)** — a no-code, step-by-step deploy guide.

## Features

- **4 languages** with a switcher on every screen: English, Spanish, Yoruba, Twi (`lib/i18n.js`).
- **Real-time sync** — leader's *Advance* button moves all attendees at once.
- **Leader dashboard** (PIN-gated at the same URL): Prep mode (set chapter, prompt, 3 questions)
  and Live mode (advance, headcount, live responses, raised hands, floor questions, reset/end).
- **Accessible by design** — large type (18px+ body, 24px+ questions), 48px+ tap targets,
  high contrast, simple wording, works on low-end Android.
- **Scripture text** fetched live from the official **ESV API** (your key, server-side only),
  with an automatic **public-domain (WEB)** fallback. No copyrighted text is bundled.
- **Permanent data** — sessions, responses and reflections are never auto-deleted. The only
  delete is the leader's per-response moderation action (a `SECURITY DEFINER` function so
  attendees can't delete anything).

## Project structure

```
app/
  layout.js            Root layout + Cormorant Garamond font
  globals.css          Design system (maroon/gold/cream, dark theme)
  page.js              Shell: language state + leader PIN gate
  api/passage/route.js Server route: ESV API (+ WEB fallback)
components/
  Attendee.js          Full attendee flow
  Leader.js            Prep + Live dashboard
  LanguageSwitcher.js
lib/
  supabaseClient.js    Supabase client + leader PIN
  i18n.js              All UI strings, 4 languages
  phases.js            Phase order + helpers
supabase/
  schema.sql           Paste-and-run database schema (RLS + realtime)
.env.example           All environment variables, documented
```

## Environment variables

See `.env.example`. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_LEADER_PIN`. Optional: `ESV_API_KEY`.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in your values
npm run dev                  # http://localhost:3000
```

## Data model (future-proofed, not yet surfaced in UI)

The schema already supports, without new tables:

- **Public Slido-style display** — `responses` are readable by all; a future screen can render
  them anonymously per question.
- **AI summary of last week** — query previous `reflections`/`responses` by `session_id`.
- **Per-chapter question bank** — `questions` are keyed by `session_id` across all 16 chapters
  of Mark; a bank view can aggregate by chapter.
