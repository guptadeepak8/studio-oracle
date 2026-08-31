export interface SentimentStats {
  positive: number;
  negative: number;
  neutral: number;
  posPercent: number;
  negPercent: number;
}

export interface ThemeItem {
  name: string;
  count: number;
  posPercent?: number;
  negPercent?: number;
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
