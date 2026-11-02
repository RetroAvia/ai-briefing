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

function formatSafeExportDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('T')[0]?.split('-');
    if (parts && parts.length === 3) {
      const year = parseInt(parts[0]!, 10);
      const month = parseInt(parts[1]!, 10) - 1;
      const day = parseInt(parts[2]!, 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return new Intl.DateTimeFormat('it-IT', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(d);
      }
    }
    const fallback = new Date(dateStr);
    if (!isNaN(fallback.getTime())) {
      return new Intl.DateTimeFormat('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(fallback);
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

// Genera un documento Markdown formattato dell'intera rassegna stampa del giorno
export function generateBriefingMarkdown(briefing: DailyBriefing): string {
  const dateFormatted = formatSafeExportDate(briefing.date);

  let md = `# ☀️ AI Daily Briefing — ${dateFormatted}\n\n`;
  const articles = Array.isArray(briefing.articles) ? briefing.articles : [];
  md += `*Rassegna stampa di ${articles.length} notizie essenziali elaborate dall'Intelligenza Artificiale.*\n\n---\n\n`;

  articles.forEach((art, index) => {
    md += `### ${index + 1}. [${art.category}] ${art.title}\n`;
    md += `**Fonte**: ${art.source} | **Tempo di lettura**: ${art.readingTimeMinutes} min\n\n`;
    md += `> ${art.summary}\n\n`;
    md += `**Punti Chiave:**\n`;
    const keyPoints = Array.isArray(art.keyPoints) ? art.keyPoints : [];
    keyPoints.forEach((point) => {
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
  try {
    const content = generateBriefingMarkdown(briefing);
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI-Briefing-${briefing.date || 'oggi'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.warn('[EXPORT] Errore download markdown:', err);
  }
}

// Copia il testo completo negli appunti con fallback resiliente
export async function copyBriefingToClipboard(briefing: DailyBriefing): Promise<boolean> {
  const content = generateBriefingMarkdown(briefing);

  // Metodo moderno (Clipboard API con permessi)
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof window !== 'undefined' && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch {
      // Fallback
    }
  }

  // Metodo compatibile con connessioni non-HTTPS (textarea fallback)
  if (typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  }

  return false;
}
