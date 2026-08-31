export interface Movie {
  content_id: string;
  content_type: string;
  title: string;
  description: string;
  release_date: string | null;
  target_terms: string[];
  status: "active" | "stopped" | "collecting";
}

export interface Comment {
  comment_id: string;
  post_id: string;
  source: string;
  text: string;
  author: string;
  published_at: string;
  like_count: number;
  sentiment?: "positive" | "negative" | "neutral" | "mixed" | "unknown";
  topics?: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  isStreaming?: boolean;
}

export interface IngestResponse {
  status: string;
  ingested_posts: number;
  ingested_comments: number;
  source: string;
  message?: string;
}

export interface ChatResponse {
  status: string;
  response: string;
}
