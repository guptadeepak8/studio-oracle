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
  confidence?: number;
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

// 6-Tier Decision Intelligence Models
export type DecisionStatus = "ACTIVE_RECOMMENDATION" | "INSUFFICIENT_EVIDENCE";
export type ConfidenceRating = "HIGH" | "MEDIUM" | "LOW";

export interface EvidenceReference {
  comment_id: string;
  platform: string;
  author?: string;
  text: string;
  sentiment: string;
  topics?: string[];
  published_at?: string;
  relevance_reason?: string;
}

export interface PlatformBreakdownMetric {
  platform: string;
  comment_count: number;
  positive_pct: number;
  negative_pct: number;
  delta_pct?: number;
}

export interface EvidenceBreakdown {
  total_comments_analyzed: number;
  time_window: string;
  platforms: PlatformBreakdownMetric[];
  key_comment_refs: string[];
  sample_evidence?: EvidenceReference[];
}

export interface DecisionArtifact {
  id: string;
  campaign_id: string;
  status: DecisionStatus;
  topic: string;
  insight: string;
  evidence: EvidenceBreakdown;
  interpretation: string;
  action: string;
  copy_draft?: string;
  target_channels?: string[];
  target_audience?: string;
  confidence_score: number;
  confidence_rating: ConfidenceRating;
  why: string[];
  created_at: string;
}

export interface CampaignDecisionsResponse {
  campaign_id: string;
  campaign_title: string;
  agent_name: string;
  agent_status: string;
  last_investigation: string;
  decisions: DecisionArtifact[];
}
