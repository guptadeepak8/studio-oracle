from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
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
    created_at: str

class CampaignDecisionsResponse(BaseModel):
    campaign_id: str
    campaign_title: str
    agent_name: str
    agent_status: str
    last_investigation: str
    decisions: List[DecisionArtifact]

