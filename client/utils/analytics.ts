import { Comment } from "./types";

export interface SentimentStats {
  positive: number;
  negative: number;
  neutral: number;
  posPercent: number;
  negPercent: number;
}

export interface ThemeItem {
  name: string;
  keywords: string[];
  count: number;
  positive: number;
  negative: number;
}

export interface TimelineNode {
  label: string;
  count: number;
  positiveRatio: number;
  negativeRatio: number;
  dominantTopic: string;
  representativeComment: string;
}

export interface ConflictItem {
  theme: string;
  positive: {
    text: string;
    author: string;
    source: string;
    likes: number;
    published: string;
  };
  negative: {
    text: string;
    author: string;
    source: string;
    likes: number;
    published: string;
  };
}

export function getSentimentStats(commentsList: Comment[]): SentimentStats {
  let positive = 0;
  let negative = 0;
  let neutral = 0;
  commentsList.forEach((c) => {
    const text = c.text.toLowerCase();
    if (
      text.includes("stunning") ||
      text.includes("excited") ||
      text.includes("love") ||
      text.includes("beautiful") ||
      text.includes("great") ||
      text.includes("goosebumps") ||
      text.includes("casting is spot on") ||
      text.includes("exceeded my expectations")
    ) {
      positive++;
    } else if (
      text.includes("disappointed") ||
      text.includes("ruined") ||
      text.includes("terrible") ||
      text.includes("empty") ||
      text.includes("cash-grab") ||
      text.includes("video-gamey")
    ) {
      negative++;
    } else {
      neutral++;
    }
  });
  const total = commentsList.length || 1;
  return {
    positive,
    negative,
    neutral,
    posPercent: Math.round((positive / total) * 100),
    negPercent: Math.round((negative / total) * 100),
  };
}

export function getThemeStats(commentsList: Comment[]): ThemeItem[] {
  const themes: ThemeItem[] = [
    { name: "Casting", keywords: ["cast", "actor", "lead", "paul", "denzel", "role", "mescal"], count: 0, positive: 0, negative: 0 },
    { name: "Visuals", keywords: ["visual", "cgi", "effects", "scenery", "cinematography", "arena", "colosseum", "look"], count: 0, positive: 0, negative: 0 },
    { name: "Soundtrack", keywords: ["music", "song", "score", "soundtrack", "audio", "track", "orchestral"], count: 0, positive: 0, negative: 0 },
    { name: "Story", keywords: ["story", "plot", "writing", "script", "sequel", "original"], count: 0, positive: 0, negative: 0 },
    { name: "Expectations", keywords: ["expect", "hope", "wait", "hype", "goosebumps", "excited"], count: 0, positive: 0, negative: 0 },
  ];

  commentsList.forEach((c) => {
    const text = c.text.toLowerCase();
    const isPos =
      text.includes("stunning") ||
      text.includes("excited") ||
      text.includes("love") ||
      text.includes("beautiful") ||
      text.includes("great") ||
      text.includes("goosebumps") ||
      text.includes("casting is spot on") ||
      text.includes("exceeded my expectations");
    const isNeg =
      text.includes("disappointed") ||
      text.includes("ruined") ||
      text.includes("terrible") ||
      text.includes("empty") ||
      text.includes("cash-grab") ||
      text.includes("video-gamey");

    themes.forEach((t) => {
      if (t.keywords.some((kw) => text.includes(kw))) {
        t.count++;
        if (isPos) t.positive++;
        if (isNeg) t.negative++;
      }
    });
  });

  return themes.sort((a, b) => b.count - a.count);
}

export function getTimelineData(commentsList: Comment[]): TimelineNode[] {
  if (commentsList.length === 0) return [];
  const sorted = [...commentsList].sort((a, b) => a.published_at.localeCompare(b.published_at));
  const chunkSize = Math.max(1, Math.ceil(sorted.length / 4));
  const intervals = [];

  for (let i = 0; i < sorted.length; i += chunkSize) {
    const chunk = sorted.slice(i, i + chunkSize);
    const firstComment = chunk[0];

    let positive = 0;
    let negative = 0;
    chunk.forEach((c) => {
      const text = c.text.toLowerCase();
      if (
        text.includes("stunning") ||
        text.includes("excited") ||
        text.includes("love") ||
        text.includes("beautiful") ||
        text.includes("great") ||
        text.includes("goosebumps") ||
        text.includes("casting is spot on") ||
        text.includes("exceeded my expectations")
      ) {
        positive++;
      } else if (
        text.includes("disappointed") ||
        text.includes("ruined") ||
        text.includes("terrible") ||
        text.includes("empty") ||
        text.includes("cash-grab") ||
        text.includes("video-gamey")
      ) {
        negative++;
      }
    });

    let label = "";
    if (firstComment) {
      const parts = firstComment.published_at.split(" ");
      if (parts.length > 1) {
        const timeParts = parts[1].split(":");
        label = `${parts[0].slice(5)} ${timeParts[0]}:${timeParts[1]}`;
      } else {
        label = firstComment.published_at;
      }
    }

    let dominantTopic = "Audience Setup";
    if (chunk.some((c) => c.text.toLowerCase().includes("cast") || c.text.toLowerCase().includes("actor"))) {
      dominantTopic = "Casting Debates";
    } else if (chunk.some((c) => c.text.toLowerCase().includes("music") || c.text.toLowerCase().includes("soundtrack"))) {
      dominantTopic = "Soundtrack Feed";
    } else if (chunk.some((c) => c.text.toLowerCase().includes("visual") || c.text.toLowerCase().includes("cgi"))) {
      dominantTopic = "CGI Critiques";
    }

    intervals.push({
      label,
      count: chunk.length,
      positiveRatio: Math.round((positive / (chunk.length || 1)) * 100),
      negativeRatio: Math.round((negative / (chunk.length || 1)) * 100),
      dominantTopic,
      representativeComment: chunk[0]?.text || "",
    });
  }
  return intervals;
}

export function getConflictingSignals(commentsList: Comment[]): ConflictItem[] {
  const conflicts = [];
  const themes = [
    { name: "CASTING", keywords: ["cast", "actor", "lead", "mescal", "denzel", "role"] },
    { name: "VISUALS", keywords: ["visual", "cgi", "effects", "cinematography", "colosseum"] },
    { name: "SOUNDTRACK", keywords: ["music", "song", "score", "soundtrack"] },
  ];

  for (const t of themes) {
    let positiveComment: Comment | null = null;
    let negativeComment: Comment | null = null;

    for (const c of commentsList) {
      const text = c.text.toLowerCase();
      if (t.keywords.some((kw) => text.includes(kw))) {
        const isPos =
          text.includes("stunning") ||
          text.includes("excited") ||
          text.includes("love") ||
          text.includes("beautiful") ||
          text.includes("great") ||
          text.includes("goosebumps") ||
          text.includes("casting is spot on") ||
          text.includes("exceeded my expectations");
        const isNeg =
          text.includes("disappointed") ||
          text.includes("ruined") ||
          text.includes("terrible") ||
          text.includes("empty") ||
          text.includes("cash-grab") ||
          text.includes("video-gamey");

        if (isPos && !positiveComment) positiveComment = c;
        if (isNeg && !negativeComment) negativeComment = c;

        if (positiveComment && negativeComment) break;
      }
    }

    if (positiveComment && negativeComment) {
      conflicts.push({
        theme: t.name,
        positive: {
          text: positiveComment.text,
          author: positiveComment.author,
          source: positiveComment.source,
          likes: positiveComment.like_count,
          published: positiveComment.published_at,
        },
        negative: {
          text: negativeComment.text,
          author: negativeComment.author,
          source: negativeComment.source,
          likes: negativeComment.like_count,
          published: negativeComment.published_at,
        },
      });
    }
  }
  return conflicts;
}

export function getPulseSummary(commentsList: Comment[]): string {
  if (commentsList.length === 0) {
    return "No active launch telemetry found. Start a campaign and run Ingest Feedback to compile audience intelligence.";
  }
  const stats = getSentimentStats(commentsList);
  const themes = getThemeStats(commentsList);
  const topTheme = themes[0];
  const secondTheme = themes[1];

  let pulseText = "Audience reaction is mixed. ";
  if (stats.posPercent > 60) pulseText = "Audience sentiment is leaning positive. ";
  else if (stats.posPercent < 35) pulseText = "Audience sentiment is leaning critical. ";

  if (topTheme && topTheme.count > 0) {
    pulseText += `Discussions are dominated by the '${topTheme.name}' topic. `;
    if (topTheme.positive > topTheme.negative) {
      pulseText += `Audiences are reacting very positively to the ${topTheme.name.toLowerCase()} elements. `;
    } else if (topTheme.negative > topTheme.positive) {
      pulseText += `There are clear visual concerns or criticisms regarding the ${topTheme.name.toLowerCase()}. `;
    }
  }
  if (secondTheme && secondTheme.count > 0) {
    pulseText += `Additionally, discussion surrounding the film's '${secondTheme.name.toLowerCase()}' is sparking divided debates.`;
  }
  return pulseText;
}

