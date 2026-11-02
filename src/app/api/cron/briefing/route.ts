import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { fetchRecentArticles } from '@/lib/rss';
import OpenAI from 'openai';
import webpush from 'web-push';

// NOTE: VAPID details are configured lazily inside GET() to avoid
// module-level initialization errors during Next.js build time.
let vapidConfigured = false;
function configureVapid() {
  if (vapidConfigured) return;
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) {
    throw new Error('Missing VAPID configuration environment variables');
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

const ARTICLES_SCHEMA = {
  type: 'object',
  properties: {
    articles: {
      type: 'array',
      minItems: 5,
      maxItems: 10,
      items: {
        type: 'object',
        required: ['id', 'title', 'category', 'source', 'sourceUrl', 'readingTimeMinutes', 'keyPoints', 'whyCounts', 'summary'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string', maxLength: 120 },
          category: {
            type: 'string',
            enum: ['Tech & AI', 'Mercati & Economia', 'Geopolitica', 'Scienza', 'Italia', 'Altro'],
          },
          source: { type: 'string' },
          sourceUrl: { type: 'string' },
          readingTimeMinutes: { type: 'number', minimum: 1, maximum: 10 },
          keyPoints: {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            items: { type: 'string' },
          },
          whyCounts: { type: 'string', maxLength: 400 },
          summary: { type: 'string', maxLength: 300 },
        },
      },
    },
  },
  required: ['articles'],
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Auth check
  const authHeader = req.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;
  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split('T')[0]!;

    // 1. Fetch RSS articles
    const rawArticles = await fetchRecentArticles();
    if (rawArticles.length === 0) {
      return NextResponse.json({ error: 'No articles found from RSS feeds' }, { status: 422 });
    }

    // 2. Build LLM prompt
    const articlesText = rawArticles
      .slice(0, 30)
      .map((a, i) => `[${i + 1}] ${a.title}\nSource: ${a.source} | URL: ${a.link}\n${a.contentSnippet}`)
      .join('\n\n---\n\n');

    const systemPrompt = `Sei un giornalista senior italiano specializzato nell'analisi delle notizie globali.
Il tuo compito è selezionare e sintetizzare le 10 notizie più rilevanti e impattanti dalla lista fornita.
Per ogni notizia devi:
- Scrivere un titolo sintetico e incisivo in italiano (max 120 caratteri)
- Assegnare la categoria corretta
- Elencare esattamente 3 punti chiave distinti e brevi
- Spiegare perché la notizia è importante in modo strategico (max 400 caratteri)
- Scrivere un breve sommario (max 300 caratteri)
- Stimare il tempo di lettura in minuti (1-5)
Usa id univoci progressivi come "article-1", "article-2" ecc.`;

    const userPrompt = `Ecco gli articoli recenti dalle fonti RSS:\n\n${articlesText}\n\nSeleziona e analizza le 10 più importanti.`;

    // 3. Call LLM
    const openai = new OpenAI({
      apiKey: process.env.LLM_API_KEY!,
      baseURL: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
    });

    const completion = await openai.chat.completions.create({
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'daily_briefing',
          strict: true,
          schema: ARTICLES_SCHEMA,
        },
      },
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty LLM response');

    const parsed = JSON.parse(content) as { articles: unknown[] };

    // 4. Upsert to Supabase
    const supabase = createServiceClient();
    const { error: upsertError } = await supabase
      .from('daily_briefings')
      .upsert({ date: today, articles: parsed.articles }, { onConflict: 'date' });

    if (upsertError) throw new Error(`Supabase upsert error: ${upsertError.message}`);

    // 5. Send push notifications
    configureVapid();
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth');

    let notificationsSent = 0;
    let notificationsFailed = 0;

    if (subscriptions && subscriptions.length > 0) {
      const payload = JSON.stringify({
        title: '☀️ Il tuo Briefing è pronto',
        body: `Scopri le ${parsed.articles.length} notizie di oggi`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'daily-briefing',
        url: '/',
      });

      await Promise.allSettled(
        subscriptions.map(async (sub) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint as string,
                keys: {
                  p256dh: sub.p256dh as string,
                  auth: sub.auth as string,
                },
              },
              payload
            );
            notificationsSent++;
          } catch (err: unknown) {
            notificationsFailed++;
            // Remove invalid subscriptions (410 Gone)
            if (err instanceof Error && 'statusCode' in err && (err as { statusCode: number }).statusCode === 410) {
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('endpoint', sub.endpoint as string);
            }
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      date: today,
      articlesCount: parsed.articles.length,
      notificationsSent,
      notificationsFailed,
    });
  } catch (error: unknown) {
    console.error('[CRON] Briefing generation failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
