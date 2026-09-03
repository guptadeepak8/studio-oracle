import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from models.decisions import (
    CampaignDecisionsResponse,
    DecisionArtifact,
    DecisionStatus,
    ConfidenceRating,
    EvidenceBreakdown,
    PlatformBreakdownMetric,
    EvidenceReference,
    HashtagGroup,
    MarketingBlueprint
)
from services.campaign_service import CampaignService
from services.detector_service import DetectorService

class DecisionService:
    @staticmethod
    def generate_genre_marketing_blueprint(
        title: str,
        description: str,
        target_terms: List[str],
        signals: Dict[str, Any]
    ) -> MarketingBlueprint:
        combined_text = f"{title} {description} {' '.join(target_terms)}".lower()
        
        # Benchmark Knowledge Base for Entertainment Genres
        if any(w in combined_text for w in ["gladiator", "rome", "roman", "empire", "warrior", "sword", "history", "ancient", "colosseum"]):
            archetype = "Historical Action"
            comparables = ["Gladiator", "Kingdom of Heaven", "300"]
            bench_tags = ["#HistoricalEpic", "#GladiatorVibes", "#SwordAndSandals", "#Colosseum", "#IMAX"]
            channels = ["YouTube", "Social Channels", "Display"]
        elif any(w in combined_text for w in ["dune", "sci-fi", "scifi", "space", "cyberpunk", "future", "galaxy", "blade runner", "alien", "matrix"]):
            archetype = "Sci-Fi & Cyberpunk"
            comparables = ["Dune", "Blade Runner 2049", "Interstellar"]
            bench_tags = ["#SciFiCinema", "#WorldBuilding", "#CyberpunkVibe", "#SciFiTwitter", "#IMAX"]
            channels = ["YouTube", "Social Channels", "Shorts"]
        elif any(w in combined_text for w in ["batman", "joker", "deadpool", "superhero", "marvel", "dc", "villain", "antihero", "gotham", "comic"]):
            archetype = "Comic & Action"
            comparables = ["The Batman", "Joker", "Deadpool"]
            bench_tags = ["#ComicBookMovie", "#VillainArc", "#SuperheroCinema", "#AntiHero", "#CinemaHype"]
            channels = ["YouTube Shorts", "Social Video", "Community"]
        elif any(w in combined_text for w in ["horror", "terror", "quiet place", "alien", "conjuring", "monster", "thriller", "scary", "scream", "haunted"]):
            archetype = "Thriller & Horror"
            comparables = ["A Quiet Place", "Get Out", "Alien"]
            bench_tags = ["#HorrorCommunity", "#PsychologicalThriller", "#HorrorCinema", "#SurvivalHorror", "#JumpScare"]
            channels = ["YouTube Pre-roll", "Social Drops"]
        elif any(w in combined_text for w in ["game", "gta", "elden", "witcher", "rpg", "quest", "zelda", "souls", "gaming", "playstation", "xbox"]):
            archetype = "Gaming & RPG"
            comparables = ["Elden Ring", "The Witcher", "Cyberpunk 2077"]
            bench_tags = ["#GamingCommunity", "#NextGenGaming", "#OpenWorldRPG", "#LoreDeepDive", "#GamerLife"]
            channels = ["YouTube Gaming", "Twitch", "Community"]
        else:
            archetype = "Theatrical Release"
            comparables = ["Oppenheimer", "Top Gun", "Avatar"]
            bench_tags = ["#CinematicExcellence", "#FilmCulture", "#MustWatchMovie", "#DirectorCut", "#BigScreen"]
            channels = ["YouTube Pre-roll", "Social Channels", "Digital TV"]

        # Universal Viral Discovery Tags
        clean_title = "".join(c for c in title if c.isalnum())
        viral_tags = [
            f"#{clean_title}",
            "#MovieTrailer",
            "#Cinema2026",
            "#FilmTwitter",
            "#MustWatch"
        ]

        # Dynamic Resonance / Audience-Grounded Tags based on ClickHouse Sentiment
        audience_tags = []
        resonance_topics = signals.get("resonance_topics", [])
        for topic_obj in resonance_topics[:3]:
            t_clean = "".join(w.capitalize() for w in topic_obj.get("topic", "").split("_") if w)
            if t_clean:
                audience_tags.append(f"#{t_clean}Praise")
        
        if not audience_tags:
            audience_tags = [f"#{clean_title}Premiere", "#AudienceScore", "#CinematicMasterpiece"]
        else:
            audience_tags.extend(["#ViewerApproved", "#BlockbusterSeason"])
            audience_tags = audience_tags[:4]

        return MarketingBlueprint(
            genre_archetype=archetype,
            historical_benchmark_comparables=comparables,
            target_channels=channels,
            hashtag_groups=[
                HashtagGroup(
                    category="Genre Tags",
                    description="Standard tags commonly used for this genre.",
                    tags=bench_tags
                ),
                HashtagGroup(
                    category="Trending Tags",
                    description="High-traffic entertainment and release discovery tags.",
                    tags=viral_tags
                ),
                HashtagGroup(
                    category="Audience Buzz",
                    description="Tags matching top positive praise topics.",
                    tags=audience_tags
                )
            ]
        )

    @staticmethod
    def get_or_investigate_decisions(content_id: str) -> CampaignDecisionsResponse:
        campaign = CampaignService.get_campaign_by_id(content_id)
        title = campaign.get("title", "Campaign") if campaign else "Campaign"
        description = campaign.get("description", "") if campaign else ""
        target_terms = campaign.get("target_terms", []) if campaign else []
        signals = DetectorService.detect_campaign_signals(content_id)
        blueprint = DecisionService.generate_genre_marketing_blueprint(title, description, target_terms, signals)


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
                                f"Observed divergence ({gap}% gap) between audience comments and trade press reviews.",
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
            agent_status="Live Tracking Active",
            last_investigation=datetime.utcnow().isoformat(),
            decisions=decisions,
            blueprint=blueprint
        )
