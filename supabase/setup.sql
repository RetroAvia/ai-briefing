-- ============================================================
-- AI Briefing PWA - Supabase Database Setup Script
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Daily Briefings table
CREATE TABLE IF NOT EXISTS public.daily_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  articles jsonb NOT NULL
);

-- Index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_daily_briefings_date ON public.daily_briefings (date DESC);

-- 2. Push Subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast endpoint lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON public.push_subscriptions (endpoint);

-- ============================================================
-- Row Level Security
-- ============================================================

-- Enable RLS on daily_briefings
ALTER TABLE public.daily_briefings ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous users) to read briefings
DROP POLICY IF EXISTS "Allow public read access" ON public.daily_briefings;
CREATE POLICY "Allow public read access"
  ON public.daily_briefings
  FOR SELECT
  USING (true);

-- Push subscriptions: no direct public access (managed via API routes with service role key)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Only service role can access push_subscriptions (API routes use service role key)
-- No client-side policies needed - all access via server-side API

-- ============================================================
-- Sample data for development/testing
-- ============================================================

-- Insert a sample briefing for testing (optional - comment out in production)
/*
INSERT INTO public.daily_briefings (date, articles) VALUES (
  CURRENT_DATE,
  '[
    {
      "id": "article-1",
      "title": "OpenAI lancia GPT-5 con capacità multimodali avanzate",
      "category": "Tech & AI",
      "source": "TechCrunch",
      "sourceUrl": "https://techcrunch.com",
      "readingTimeMinutes": 3,
      "keyPoints": [
        "GPT-5 supera i benchmark precedenti del 40% nei test di ragionamento",
        "Supporto nativo per audio, video e immagini in tempo reale",
        "Disponibile per tutti gli utenti ChatGPT Plus dal 15 novembre"
      ],
      "whyCounts": "GPT-5 rappresenta un salto generazionale nell intelligenza artificiale, con implicazioni profonde per il mercato del lavoro e la produttività aziendale. Le aziende devono iniziare a pianificare l integrazione ora.",
      "summary": "OpenAI ha annunciato GPT-5, il suo modello più potente, con capacità multimodali native e un miglioramento del 40% nei benchmark di ragionamento rispetto a GPT-4o."
    }
  ]'::jsonb
) ON CONFLICT (date) DO NOTHING;
*/

-- ============================================================
-- Verify setup
-- ============================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('daily_briefings', 'push_subscriptions');
