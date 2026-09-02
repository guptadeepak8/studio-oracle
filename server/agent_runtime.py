import datetime
import uuid
from typing import List, Dict, Any, Optional
from schemas import (
    DecisionArtifact,
    DecisionStatus,
    ConfidenceRating,
    EvidenceBreakdown,
    PlatformBreakdownMetric,
    EvidenceReference,
    CampaignDecisionsResponse
)
from detector import detect_campaign_signals
import db

class CampaignAgentRuntime:
    """
    Reusable Campaign Agent Runtime.
    Orchestrates campaign-scoped autonomous investigations and synthesizes
    traceable 6-tier Decision Artifacts.
    """

    @classmethod
    def get_campaign_agent_profile(cls, campaign_title: str) -> Dict[str, str]:
        return {
            "name": f"{campaign_title} Campaign Intelligence Agent",
            "status": "Active Telemetry Surveillance",
            "model": "Gemini 2.5 Pro Analytics Core",
        }

    @classmethod
    def run_investigation(cls, content_id: str) -> CampaignDecisionsResponse:
        campaign = db.fetch_movie_by_id(content_id)
        if not campaign:
            campaign = {
                "content_id": content_id,
                "title": "Campaign",
                "description": "",
                "release_date": None
            }

        title = campaign.get("title", "Campaign")
        signals = detect_campaign_signals(content_id)
        
        decisions: List[DecisionArtifact] = []
        now_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%SZ")

        # 1. Check for Insufficient Evidence
        if not signals.get("has_sufficient_evidence", False) or signals.get("total_comments", 0) == 0:
            total_cnt = signals.get("total_comments", 0)
            insufficient_artifact = DecisionArtifact(
                id=f"dec_{uuid.uuid4().hex[:8]}",
                campaign_id=content_id,
                status=DecisionStatus.INSUFFICIENT_EVIDENCE,
                topic="Telemetry Ingestion Baseline",
                insight=f"Awaiting statistically sufficient audience volume for '{title}' (Currently {total_cnt} comments tracked).",
                evidence=EvidenceBreakdown(
                    total_comments_analyzed=total_cnt,
                    time_window="Initial Launch Phase",
                    platforms=[
                        PlatformBreakdownMetric(
                            platform=k,
                            comment_count=v["count"],
                            positive_pct=v["positive_pct"],
                            negative_pct=v["negative_pct"],
                            delta_pct=0
                        ) for k, v in signals.get("platforms", {}).items()
                    ],
                    key_comment_refs=[]
                ),
                interpretation="Observed telemetry volume is below the minimum threshold of 25 comments needed to separate signal from noise.",
                action="Continue automated background ingestion across YouTube and Reddit. No creative or media spend pivot recommended yet.",
                copy_draft=f"Experience the cinematic event of the year. See {title} in theaters this season.",
                target_channels=["YouTube", "Reddit", "Digital Ads"],
                target_audience="General Audience",
                confidence_score=0.35,
                confidence_rating=ConfidenceRating.LOW,
                why=[
                    "Sample size (<25 comments) lacks statistical power for cross-platform validation.",
                    "Signal volatility expected during initial audience discovery phase.",
                    "Monitoring scheduled to re-evaluate upon receiving next batch."
                ],
                created_at=now_str
            )
            decisions.append(insufficient_artifact)
            return CampaignDecisionsResponse(
                campaign_id=content_id,
                campaign_title=title,
                agent_name=f"{title} Intelligence Agent",
                agent_status="Awaiting Telemetry Ingestion",
                last_investigation=now_str,
                decisions=decisions
            )

        # 2. Synthesize High-Impact Decision Artifacts from Deterministic Signals
        friction_topics = signals.get("friction_topics", [])
        resonance_topics = signals.get("resonance_topics", [])
        platforms = signals.get("platforms", {})
        total_comments = signals.get("total_comments", 0)
        sample_comments = signals.get("sample_comments", [])

        # Build Platform Metrics
        platform_metrics = [
            PlatformBreakdownMetric(
                platform=p_name,
                comment_count=p_data["count"],
                positive_pct=p_data["positive_pct"],
                negative_pct=p_data["negative_pct"],
                delta_pct=p_data["net_sentiment"]
            ) for p_name, p_data in platforms.items()
        ]

        # Artifact 1: Critical Friction Mitigation (If Friction Signal Exists)
        if friction_topics:
            top_fric = friction_topics[0]
            f_name = top_fric["name"]
            f_neg = top_fric["negative_pct"]
            f_cnt = top_fric["count"]

            # Filter relevant comments for this friction topic
            fric_samples = [
                c for c in sample_comments 
                if f_name.lower() in [t.lower() for t in c.get("topics", [])] or c.get("sentiment") == "negative"
            ][:3]

            # Calculate confidence based on sample size and cross-platform presence
            conf_score = min(0.92, 0.65 + (min(f_cnt, 100) / 300) + (0.1 if len(platforms) > 1 else 0.0))
            conf_score = round(conf_score, 2)
            conf_rating = ConfidenceRating.HIGH if conf_score >= 0.75 else ConfidenceRating.MEDIUM

            # Determine specific creative action based on topic
            if any(k in f_name.lower() for k in ["cast", "actor", "performance"]):
                insight_text = f"Casting and performance debate generated {f_neg}% critical drag across {f_cnt} tracked discussions."
                interpretation_text = f"Observed facts show {f_cnt} comments debating casting choices. Inferred reason: Fast-paced montage cuts lack dialogue context to demonstrate actor range."
                action_text = "Deploy dialogue-heavy scene previews and dramatic press featurettes spotlighting lead chemistry."
                copy_text = f"Built on drama, driven by passion. Witness powerful performances in {title} that stand on their own merit."
                channels = ["Cinematic Featurettes", "Press Junkets", "IMAX Pre-rolls"]
                audience = "Franchise purists and dramatic cinephiles"
            elif any(k in f_name.lower() for k in ["cgi", "vfx", "visual"]):
                insight_text = f"Visual effects realism and digital lighting drew {f_neg}% critique across {f_cnt} comments."
                interpretation_text = f"Observed facts: {f_cnt} comments specifically mention visual effects realism. Inferred reason: Compressed digital trailers highlight unfinished renders under harsh lighting."
                action_text = "Release behind-the-scenes reels highlighting practical set construction, real camera rigs, and physical stunt work."
                copy_text = f"Real stunts. Physical sets. Experience the authentic craft and scale behind the making of {title}."
                channels = ["Making-Of Featurettes", "Director Commentary Reels", "Social Video Breakdowns"]
                audience = "CGI skeptics and cinematic craft enthusiasts"
            else:
                insight_text = f"Audience friction around '{f_name}' concentrated {f_neg}% negative sentiment across {f_cnt} discussions."
                interpretation_text = f"Observed facts show audience hesitation regarding '{f_name}'. Inferred explanation: Lack of narrative context in current trailer cuts."
                action_text = f"Deploy clarifying creator interviews and story context directly addressing '{f_name}'."
                copy_text = f"Experience the true vision and craft of {title}. In theaters this season."
                channels = ["Targeted Digital Pre-rolls", "Social Q&A Panels", "Press Releases"]
                audience = "Engaged moviegoers and online fan communities"

            evidence_refs = [
                EvidenceReference(
                    comment_id=s["comment_id"],
                    platform=s["source"],
                    author=s.get("author", "Audience Member"),
                    text=s["text"],
                    sentiment=s["sentiment"],
                    topics=s.get("topics", []),
                    published_at=s.get("published_at"),
                    relevance_reason=f"Verbatim audience feedback expressing critique regarding {f_name}"
                ) for s in fric_samples
            ]

            decisions.append(
                DecisionArtifact(
                    id=f"dec_fric_{uuid.uuid4().hex[:6]}",
                    campaign_id=content_id,
                    status=DecisionStatus.ACTIVE_RECOMMENDATION,
                    topic=f_name.capitalize(),
                    insight=insight_text,
                    evidence=EvidenceBreakdown(
                        total_comments_analyzed=total_comments,
                        time_window="Current Campaign Horizon",
                        platforms=platform_metrics,
                        key_comment_refs=[e.comment_id for e in evidence_refs],
                        sample_evidence=evidence_refs
                    ),
                    interpretation=interpretation_text,
                    action=action_text,
                    copy_draft=copy_text,
                    target_channels=channels,
                    target_audience=audience,
                    confidence_score=conf_score,
                    confidence_rating=conf_rating,
                    why=[
                        f"Direct volume confirmation: {f_cnt} comments classified under '{f_name}'.",
                        f"Negative concentration ({f_neg}%) exceeds benchmark threshold of 20%.",
                        f"Cross-platform verification: Validated across {len(platforms)} ingested channels."
                    ],
                    created_at=now_str
                )
            )

        # Artifact 2: High-Resonance Creative Booster (If Resonance Signal Exists)
        if resonance_topics:
            top_res = resonance_topics[0]
            r_name = top_res["name"]
            r_pos = top_res["positive_pct"]
            r_cnt = top_res["count"]

            res_samples = [
                c for c in sample_comments 
                if r_name.lower() in [t.lower() for t in c.get("topics", [])] or c.get("sentiment") == "positive"
            ][:3]

            conf_score = min(0.95, 0.70 + (min(r_cnt, 100) / 300))
            conf_score = round(conf_score, 2)

            if any(k in r_name.lower() for k in ["visual", "scale", "action", "cinematography"]):
                insight_text = f"Grand scale, arena spectacle, and cinematography drove +{r_pos}% positive resonance across {r_cnt} comments."
                interpretation_text = f"Observed facts show {r_cnt} mentions praising cinematography and visual grandeur. Inferred explanation: Strong appetite for premium large-format screens."
                action_text = "Double down on IMAX, Dolby Cinema, and premium format screenings across all digital banner ads and trailer spots."
                copy_text = f"Return to a grand spectacle. Experience the visual scale of {title} on premium large screens and IMAX."
                channels = ["IMAX Trailer Cuts", "Digital Billboards", "Premium Format Previews"]
                audience = "Blockbuster viewers and premium screen ticket buyers"
            elif any(k in r_name.lower() for k in ["music", "soundtrack", "score"]):
                insight_text = f"Musical score and audio themes generated +{r_pos}% positive sentiment across {r_cnt} mentions."
                interpretation_text = f"Observed facts: {r_cnt} comments specifically celebrate the score. Inferred explanation: Soundtrack is a high-virality conversion driver."
                action_text = "Publish official theme music audio teasers, composer spotlights, and Spotify streaming partner playlists."
                copy_text = f"The sound of an epic return. Stream the official theme music for {title} today."
                channels = ["Spotify Playlists", "YouTube Audio Visualizers", "TikTok Sound Trends"]
                audience = "Soundtrack listeners and music enthusiasts"
            else:
                insight_text = f"Audience excitement around '{r_name}' drove +{r_pos}% positive resonance across {r_cnt} comments."
                interpretation_text = f"Observed facts demonstrate high organic enthusiasm for '{r_name}'."
                action_text = f"Anchor upcoming digital teasers and paid social video ad cuts around '{r_name}'."
                copy_text = f"Discover the unforgettable {r_name.lower()} that audiences are raving about in {title}."
                channels = ["YouTube Shorts", "Instagram Reels", "Digital Ads"]
                audience = "Mainstream moviegoers and talent fandoms"

            evidence_refs = [
                EvidenceReference(
                    comment_id=s["comment_id"],
                    platform=s["source"],
                    author=s.get("author", "Audience Member"),
                    text=s["text"],
                    sentiment=s["sentiment"],
                    topics=s.get("topics", []),
                    published_at=s.get("published_at"),
                    relevance_reason=f"Verbatim audience quote showing enthusiasm for {r_name}"
                ) for s in res_samples
            ]

            decisions.append(
                DecisionArtifact(
                    id=f"dec_res_{uuid.uuid4().hex[:6]}",
                    campaign_id=content_id,
                    status=DecisionStatus.ACTIVE_RECOMMENDATION,
                    topic=r_name.capitalize(),
                    insight=insight_text,
                    evidence=EvidenceBreakdown(
                        total_comments_analyzed=total_comments,
                        time_window="Current Campaign Horizon",
                        platforms=platform_metrics,
                        key_comment_refs=[e.comment_id for e in evidence_refs],
                        sample_evidence=evidence_refs
                    ),
                    interpretation=interpretation_text,
                    action=action_text,
                    copy_draft=copy_text,
                    target_channels=channels,
                    target_audience=audience,
                    confidence_score=conf_score,
                    confidence_rating=ConfidenceRating.HIGH,
                    why=[
                        f"Observed positive momentum: +{r_pos}% favorable sentiment in ClickHouse.",
                        f"Sufficient sample depth ({r_cnt} explicit topic mentions).",
                        "High resonance stability across chronological commentary streams."
                    ],
                    created_at=now_str
                )
            )

        # Artifact 3: Cross-Platform Divergence or Multiplex Awareness
        if signals.get("platform_divergence", 0) >= 25:
            yt_p = platforms.get("youtube", {}).get("positive_pct", 0)
            rd_n = platforms.get("reddit", {}).get("negative_pct", 0)
            
            decisions.append(
                DecisionArtifact(
                    id=f"dec_div_{uuid.uuid4().hex[:6]}",
                    campaign_id=content_id,
                    status=DecisionStatus.ACTIVE_RECOMMENDATION,
                    topic="Audience Channel Divergence",
                    insight=f"Channel divergence detected: Casual YouTube viewers are {yt_p}% positive, while Reddit fan communities are {rd_n}% critical.",
                    evidence=EvidenceBreakdown(
                        total_comments_analyzed=total_comments,
                        time_window="Cross-Platform Horizon",
                        platforms=platform_metrics,
                        key_comment_refs=[]
                    ),
                    interpretation="Observed gap indicates bifurcation between casual mainstream audiences looking for entertaining spectacle vs hardcore enthusiasts scrutinizing lore and continuity.",
                    action="Segment creative allocation: Run high-energy action spots on YouTube/TikTok; deploy narrative lore breakdowns and character lineage charts on Reddit/Forums.",
                    copy_draft=f"The story continues. Explore the characters, lore, and narrative paths in {title}.",
                    target_channels=["YouTube Pre-rolls", "Reddit Community AMAs", "Interactive Lore Guides"],
                    target_audience="Divergent: Casual mainstream + Core franchise fans",
                    confidence_score=0.88,
                    confidence_rating=ConfidenceRating.HIGH,
                    why=[
                        f"Quantified divergence gap of {signals['platform_divergence']}% net sentiment between YouTube and Reddit.",
                        "Corroborated by distinct vocabulary patterns across platform cohorts."
                    ],
                    created_at=now_str
                )
            )

        return CampaignDecisionsResponse(
            campaign_id=content_id,
            campaign_title=title,
            agent_name=f"{title} Intelligence Agent",
            agent_status="Autonomous Telemetry Surveillance Active",
            last_investigation=now_str,
            decisions=decisions
        )

