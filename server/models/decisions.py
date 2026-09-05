from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class DecisionStatus(str, Enum):
    ACTIVE_RECOMMENDATION = "ACTIVE_RECOMMENDATION"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"

class ConfidenceRating(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class EvidenceReference(BaseModel):
    comment_id: str
    platform: str
    author: Optional[str] = "Anonymous Viewer"
    text: str
    sentiment: str
    topics: List[str] = []
    published_at: Optional[str] = None
    relevance_reason: Optional[str] = None

class PlatformBreakdownMetric(BaseModel):
    platform: str
    comment_count: int
    positive_pct: int
    negative_pct: int
    delta_pct: Optional[int] = 0

class EvidenceBreakdown(BaseModel):
    total_comments_analyzed: int
    time_window: str = "Last 48 Hours"
    platforms: List[PlatformBreakdownMetric] = []
    key_comment_refs: List[str] = []
    sample_evidence: List[EvidenceReference] = []

class HashtagGroup(BaseModel):
    category: str
    description: str
    tags: List[str]

class MarketingBlueprint(BaseModel):
    genre_archetype: str
    historical_benchmark_comparables: List[str]
    target_channels: List[str] = []
    hashtag_groups: List[HashtagGroup] = []

class VideoScriptBeat(BaseModel):
    timestamp_range: str
    beat_type: str
    visual_direction: str
    on_screen_text: str
    audio_voiceover: str

class VideoCutdownScript(BaseModel):
    id: str
    format: str
    target_channel: str
    headline_objective: str
    beats: List[VideoScriptBeat] = []
    music_track_directive: str
    call_to_action: str

class AdCreativeVariant(BaseModel):
    platform: str
    placement: str
    primary_headline: str
    body_copy: str
    target_demographics: str
    recommended_hashtags: List[str] = []
    call_to_action: str

class CreatorBriefing(BaseModel):
    campaign_phase: str
    core_talking_points: List[str] = []
    creative_angles: List[str] = []
    critical_donts: List[str] = []
    recommended_audio_track: Optional[str] = None

class ChannelBudgetGuidance(BaseModel):
    channel: str
    current_allocation_pct: int
    recommended_allocation_pct: int
    spend_action: str
    rationale: str

class DecisionArtifact(BaseModel):
    id: str
    campaign_id: str
    status: DecisionStatus = DecisionStatus.ACTIVE_RECOMMENDATION
    topic: str
    insight: str
    evidence: EvidenceBreakdown
    interpretation: str
    action: str
    copy_draft: Optional[str] = None
    target_channels: List[str] = []
    target_audience: Optional[str] = None
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    confidence_rating: ConfidenceRating = ConfidenceRating.HIGH
    why: List[str] = []
    blueprint: Optional[MarketingBlueprint] = None
    video_scripts: List[VideoCutdownScript] = []
    ad_variants: List[AdCreativeVariant] = []
    creator_brief: Optional[CreatorBriefing] = None
    budget_shifts: List[ChannelBudgetGuidance] = []
    created_at: str

class CampaignDecisionsResponse(BaseModel):
    campaign_id: str
    campaign_title: str
    agent_name: str
    agent_status: str
    last_investigation: str
    decisions: List[DecisionArtifact]
    blueprint: Optional[MarketingBlueprint] = None
    video_scripts: List[VideoCutdownScript] = []
    ad_variants: List[AdCreativeVariant] = []
    creator_brief: Optional[CreatorBriefing] = None
    budget_shifts: List[ChannelBudgetGuidance] = []



