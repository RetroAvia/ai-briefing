import Parser from 'rss-parser';

export interface RawArticle {
  title: string;
  link: string;
  contentSnippet: string;
  source: string;
  pubDate: string;
}

const RSS_FEEDS: Array<{ url: string; source: string; category: string }> = [
  { url: 'https://feeds.feedburner.com/ansa/tecnologia', source: 'ANSA Tech', category: 'Tech & AI' },
  { url: 'https://www.corriere.it/rss/economia.xml', source: 'Corriere Economia', category: 'Mercati & Economia' },
  { url: 'https://www.ilsole24ore.com/rss/notizie--mondo.xml', source: 'Il Sole 24 Ore', category: 'Geopolitica' },
  { url: 'https://feeds.feedburner.com/ansa/scienza_tecnologia', source: 'ANSA Scienza', category: 'Scienza' },
  { url: 'https://www.corriere.it/rss/italia.xml', source: 'Corriere Italia', category: 'Italia' },
  { url: 'https://techcrunch.com/feed/', source: 'TechCrunch', category: 'Tech & AI' },
  { url: 'https://feeds.reuters.com/reuters/technologyNews', source: 'Reuters Tech', category: 'Tech & AI' },
  { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg Markets', category: 'Mercati & Economia' },
];

export async function fetchRecentArticles(): Promise<RawArticle[]> {
  const parser = new Parser();
  const articles: RawArticle[] = [];
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        for (const item of parsed.items.slice(0, 5)) {
          const pubDate = item.pubDate ? new Date(item.pubDate).getTime() : Date.now();
          if (pubDate > oneDayAgo && item.title && item.link) {
            articles.push({
              title: item.title,
              link: item.link,
              contentSnippet: item.contentSnippet ?? item.summary ?? '',
              source: feed.source,
              pubDate: item.pubDate ?? new Date().toISOString(),
            });
          }
        }
      } catch {
        // Skip failed feeds silently
      }
    })
  );

  return articles;
}
