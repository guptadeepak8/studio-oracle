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

export interface HashtagGroup {
  category: string;
  description: string;
  tags: string[];
}

export interface MarketingBlueprint {
  genre_archetype: string;
  historical_benchmark_comparables: string[];
  target_channels: string[];
  hashtag_groups: HashtagGroup[];
}

export interface VideoScriptBeat {
  timestamp_range: string;
  beat_type: string;
  visual_direction: string;
  on_screen_text: string;
  audio_voiceover: string;
}

export interface VideoCutdownScript {
  id: string;
  format: string;
  target_channel: string;
  headline_objective: string;
  beats: VideoScriptBeat[];
  music_track_directive: string;
  call_to_action: string;
}

export interface AdCreativeVariant {
  platform: string;
  placement: string;
  primary_headline: string;
  body_copy: string;
  target_demographics: string;
  recommended_hashtags: string[];
  call_to_action: string;
}

export interface CreatorBriefing {
  campaign_phase: string;
  core_talking_points: string[];
  creative_angles: string[];
  critical_donts: string[];
  recommended_audio_track?: string;
}

export interface ChannelBudgetGuidance {
  channel: string;
  current_allocation_pct: number;
  recommended_allocation_pct: number;
  spend_action: string;
  rationale: string;
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
  blueprint?: MarketingBlueprint;
  video_scripts?: VideoCutdownScript[];
  ad_variants?: AdCreativeVariant[];
  creator_brief?: CreatorBriefing;
  budget_shifts?: ChannelBudgetGuidance[];
  created_at: string;
}

export interface CampaignDecisionsResponse {
  campaign_id: string;
  campaign_title: string;
  agent_name: string;
  agent_status: string;
  last_investigation: string;
  decisions: DecisionArtifact[];
  blueprint?: MarketingBlueprint;
  video_scripts?: VideoCutdownScript[];
  ad_variants?: AdCreativeVariant[];
  creator_brief?: CreatorBriefing;
  budget_shifts?: ChannelBudgetGuidance[];
}


