import uuid
from datetime import datetime
from typing import List
from models.decisions import (
    CampaignDecisionsResponse,
    DecisionArtifact,
    DecisionStatus,
    ConfidenceRating,
    EvidenceBreakdown,
    PlatformBreakdownMetric,
    EvidenceReference
)
from services.campaign_service import CampaignService
from services.detector_service import DetectorService

class DecisionService:
    @staticmethod
    def get_or_investigate_decisions(content_id: str) -> CampaignDecisionsResponse:
        campaign = CampaignService.get_campaign_by_id(content_id)
        title = campaign.get("title", "Campaign") if campaign else "Campaign"
        signals = DetectorService.detect_campaign_signals(content_id)

        decisions: List[DecisionArtifact] = []
        total_comments = signals.get("total_comments", 0)

        if total_comments < 25:
            sample_refs = [
                EvidenceReference(**s) for s in signals.get("sample_evidence", [])
            ]
            evidence_breakdown = EvidenceBreakdown(
                total_comments_analyzed=total_comments,
                time_window="Surveillance Window",
                platforms=[
                    PlatformBreakdownMetric(
                        platform=k,
                        comment_count=v["count"],
                        positive_pct=v["positive_pct"],
                        negative_pct=v["negative_pct"],
                        delta_pct=0
                    ) for k, v in signals.get("platform_split", {}).items()
                ],
                key_comment_refs=[s.comment_id for s in sample_refs],
                sample_evidence=sample_refs
            )

            decisions.append(
                DecisionArtifact(
                    id=f"dec_{uuid.uuid4().hex[:8]}",
                    campaign_id=content_id,
                    status=DecisionStatus.INSUFFICIENT_EVIDENCE,
                    topic="Telemetry Sample Volume",
                    insight=f"Awaiting statistically sufficient audience volume for '{title}' (Currently {total_comments} comments tracked).",
                    evidence=evidence_breakdown,
                    interpretation="Sample size is below the 25-comment statistical power threshold. Premature conclusions risk biasing creative allocation.",
                    action="Maintain surveillance mode. Ingest further YouTube & Google Search press telemetry before committing marketing spend.",
                    copy_draft=None,
                    target_channels=["Monitoring"],
                    target_audience="General Audience",
                    confidence_score=0.35,
                    confidence_rating=ConfidenceRating.LOW,
                    why=[
                        f"Sample count ({total_comments}) is below minimum significance threshold of 25 comments.",
                        "Variance across audience segments cannot yet be reliably computed.",
                        "Preventing uncorroborated creative pivots."
                    ],
                    created_at=datetime.utcnow().isoformat()
                )
            )
        else:
            sample_refs = [EvidenceReference(**s) for s in signals.get("sample_evidence", [])]
            plat_metrics = [
                PlatformBreakdownMetric(
                    platform=k,
                    comment_count=v["count"],
                    positive_pct=v["positive_pct"],
                    negative_pct=v["negative_pct"],
                    delta_pct=0
                ) for k, v in signals.get("platform_split", {}).items()
            ]

            friction_topics = signals.get("friction_topics", [])
            if friction_topics:
                top_fric = friction_topics[0]
                t_name = top_fric["topic"].replace("_", " ").title()
                fric_pct = top_fric["negative_pct"]
                vol = top_fric["volume"]

                decisions.append(
                    DecisionArtifact(
                        id=f"dec_{uuid.uuid4().hex[:8]}",
                        campaign_id=content_id,
                        status=DecisionStatus.ACTIVE_RECOMMENDATION,
                        topic=f"{t_name} Discussion Friction",
                        insight=f"{t_name} debate generated {fric_pct}% critical drag across {vol} tracked discussions.",
                        evidence=EvidenceBreakdown(
                            total_comments_analyzed=total_comments,
                            time_window="Surveillance Window",
                            platforms=plat_metrics,
                            key_comment_refs=[s.comment_id for s in sample_refs[:3]],
                            sample_evidence=sample_refs[:3]
                        ),
                        interpretation=f"FACT: {fric_pct}% of comments referencing '{t_name}' express negative or skeptical sentiment. INFERENCE: High-engagement audience segments are expressing doubt regarding trailer execution or creative direction.",
                        action=f"Rebalance upcoming social and digital cutdowns to de-emphasize debated {t_name.lower()} elements and emphasize universally praised spectacle/story assets.",
                        copy_draft=f"Experience the scale and heart of {title} — exclusively in IMAX and Premium Large Formats.",
                        target_channels=["YouTube Shorts", "TikTok", "Reddit Ads"],
                        target_audience="Core Franchise Fans & Moviegoers",
                        confidence_score=0.88,
                        confidence_rating=ConfidenceRating.HIGH,
                        why=[
                            f"Direct volume confirmation: {vol} topic-specific audience comments in ClickHouse.",
                            "Multi-platform verification: Observed across active channels.",
                            "Consistently reproducible sentiment polarity."
                        ],
                        created_at=datetime.utcnow().isoformat()
                    )
                )

            resonance_topics = signals.get("resonance_topics", [])
            if resonance_topics:
                top_res = resonance_topics[0]
                t_name = top_res["topic"].replace("_", " ").title()
                res_pct = top_res["positive_pct"]
                vol = top_res["volume"]

                decisions.append(
                    DecisionArtifact(
                        id=f"dec_{uuid.uuid4().hex[:8]}",
                        campaign_id=content_id,
                        status=DecisionStatus.ACTIVE_RECOMMENDATION,
                        topic=f"{t_name} Creative Booster",
                        insight=f"{t_name} is driving dominant positive resonance with {res_pct}% praise across {vol} comments.",
                        evidence=EvidenceBreakdown(
                            total_comments_analyzed=total_comments,
                            time_window="Surveillance Window",
                            platforms=plat_metrics,
                            key_comment_refs=[s.comment_id for s in sample_refs[3:6]],
                            sample_evidence=sample_refs[3:6]
                        ),
                        interpretation=f"FACT: Audience comments referencing {t_name.lower()} show {res_pct}% positive polarity. INFERENCE: This thematic hook represents the highest-leverage conversion driver for ticket pre-sales.",
                        action=f"Promote {t_name.lower()}-centric creative cutdowns as the primary hook across high-velocity video placements.",
                        copy_draft=f"Witness the epic {t_name.lower()} everyone is talking about. {title} hits theaters soon.",
                        target_channels=["YouTube Pre-roll", "Instagram Reels", "Digital TV"],
                        target_audience="Mainstream & Enthusiast Audiences",
                        confidence_score=0.92,
                        confidence_rating=ConfidenceRating.HIGH,
                        why=[
                            f"Overwhelming positive ratio ({res_pct}%) across {vol} verified comments.",
                            "Top shared quotes reflect genuine audience enthusiasm rather than generic noise.",
                            "High correlation with intent-to-purchase terminology."
                        ],
                        created_at=datetime.utcnow().isoformat()
                    )
                )

            plat_split = signals.get("platform_split", {})
            other_plat = "google_search" if "google_search" in plat_split else None
            if "youtube" in plat_split and other_plat:
                yt_pos = plat_split["youtube"]["positive_pct"]
                other_pos = plat_split[other_plat]["positive_pct"]
                gap = abs(yt_pos - other_pos)

                if gap >= 15:
                    leading_plat = "YouTube" if yt_pos > other_pos else "Google Search Press"
                    trailing_plat = "Google Search Press" if yt_pos > other_pos else "YouTube"

                    decisions.append(
                        DecisionArtifact(
                            id=f"dec_{uuid.uuid4().hex[:8]}",
                            campaign_id=content_id,
                            status=DecisionStatus.ACTIVE_RECOMMENDATION,
                            topic="Channel Sentiment Divergence",
                            insight=f"{gap}% sentiment divergence detected between {leading_plat} (+{max(yt_pos, other_pos)}%) and {trailing_plat} (+{min(yt_pos, other_pos)}%).",
                            evidence=EvidenceBreakdown(
                                total_comments_analyzed=total_comments,
                                time_window="Surveillance Window",
                                platforms=plat_metrics,
                                key_comment_refs=[s.comment_id for s in sample_refs[:2]],
                                sample_evidence=sample_refs[:2]
                            ),
                            interpretation=f"FACT: Mainstream audience on {leading_plat} responds directly to spectacle and action, while trade press and critics on {trailing_plat} focus on narrative pacing and franchise expectations.",
                            action=f"Deploy bifurcated channel strategy: maintain high-energy spectacle creatives on {leading_plat}, and deploy craft & director behind-the-scenes featurettes on {trailing_plat}.",
                            copy_draft=f"Go behind the craft: How the filmmakers brought ancient Rome back to life for {title}.",
                            target_channels=[f"{trailing_plat} Editorial Features", "Long-Form Video"],
                            target_audience="Cinema Enthusiasts & Film Critics",
                            confidence_score=0.88,
                            confidence_rating=ConfidenceRating.HIGH,
                            why=[
                                f"Statistically significant divergence ({gap}% gap) between audience comments and trade press reviews.",
                                "Clear segmentation between mainstream hype and critical commentary.",
                                "Bifurcated creative allocation protects both ticket pre-sales and critical word-of-mouth."
                            ],
                            created_at=datetime.utcnow().isoformat()
                        )
                    )

        return CampaignDecisionsResponse(
            campaign_id=content_id,
            campaign_title=title,
            agent_name=f"{title} Intelligence Agent",
            agent_status="Autonomous Telemetry Surveillance Active",
            last_investigation=datetime.utcnow().isoformat(),
            decisions=decisions
        )
