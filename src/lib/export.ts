import type { DailyBriefing } from '@/types';

// Haptic feedback per vibrazione sui dispositivi mobile
export function triggerHaptic(duration = 15) {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignora se non supportato o bloccato dalle policy del browser
    }
  }
}

// Genera un documento Markdown formattato dell'intera rassegna stampa del giorno
export function generateBriefingMarkdown(briefing: DailyBriefing): string {
  const dateFormatted = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(briefing.date + 'T00:00:00'));

  let md = `# ☀️ AI Daily Briefing — ${dateFormatted}\n\n`;
  md += `*Rassegna stampa di ${briefing.articles.length} notizie essenziali elaborate dall'Intelligenza Artificiale.*\n\n---\n\n`;

  briefing.articles.forEach((art, index) => {
    md += `### ${index + 1}. [${art.category}] ${art.title}\n`;
    md += `**Fonte**: ${art.source} | **Tempo di lettura**: ${art.readingTimeMinutes} min\n\n`;
    md += `> ${art.summary}\n\n`;
    md += `**Punti Chiave:**\n`;
    art.keyPoints.forEach((point) => {
      md += `- ${point}\n`;
    });
    md += `\n**✦ Perché conta nel lungo termine:**\n${art.whyCounts}\n\n`;
    md += `*Articolo originale*: [Leggi fonte](${art.sourceUrl})\n\n---\n\n`;
  });

  md += `\n*Generato da AI Briefing PWA — Consultabile 100% offline in metropolitana.*`;
  return md;
}

// Scarica il briefing come file di testo/markdown
export function downloadBriefingMarkdown(briefing: DailyBriefing) {
  const content = generateBriefingMarkdown(briefing);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AI-Briefing-${briefing.date}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Copia il testo completo negli appunti
export async function copyBriefingToClipboard(briefing: DailyBriefing): Promise<boolean> {
  const content = generateBriefingMarkdown(briefing);
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
