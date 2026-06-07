// Server-side passage fetch. Keeps the ESV API key secret (never sent to phones).
// If ESV_API_KEY is set -> official ESV API. Otherwise -> public-domain World
// English Bible (WEB) via bible-api.com so the reading screen always works.

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const chapter = parseInt(searchParams.get('chapter') || '1', 10);
  const safeChapter = Math.min(Math.max(chapter, 1), 16);
  const reference = `Mark ${safeChapter}`;

  const esvKey = process.env.ESV_API_KEY;

  try {
    if (esvKey) {
      const url =
        'https://api.esv.org/v3/passage/text/?q=' +
        encodeURIComponent(reference) +
        '&include-headings=false&include-footnotes=false&include-verse-numbers=true' +
        '&include-short-copyright=false&include-passage-references=false';
      const res = await fetch(url, { headers: { Authorization: `Token ${esvKey}` } });
      if (res.ok) {
        const data = await res.json();
        const text = (data.passages && data.passages[0] ? data.passages[0] : '').trim();
        if (text) {
          return Response.json({ reference, translation: 'ESV', text });
        }
      }
    }

    // Fallback: public-domain World English Bible
    const webRes = await fetch(
      `https://bible-api.com/${encodeURIComponent(reference)}?translation=web`
    );
    if (webRes.ok) {
      const data = await webRes.json();
      const text = (data.verses || [])
        .map((v) => `[${v.verse}] ${v.text.trim()}`)
        .join(' ');
      return Response.json({
        reference,
        translation: 'WEB (public domain)',
        text: text || data.text || '',
      });
    }

    return Response.json(
      { reference, translation: null, text: '', error: 'unavailable' },
      { status: 502 }
    );
  } catch (e) {
    return Response.json(
      { reference, translation: null, text: '', error: 'fetch_failed' },
      { status: 502 }
    );
  }
}
