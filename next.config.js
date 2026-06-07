import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // This shows a clear message in the browser console if env vars are missing.
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (local) or in Vercel (deployed).'
  );
}

export const supabase = createClient(url || '', anonKey || '', {
  realtime: { params: { eventsPerSecond: 5 } },
});

export const LEADER_PIN = process.env.NEXT_PUBLIC_LEADER_PIN || '1234';
