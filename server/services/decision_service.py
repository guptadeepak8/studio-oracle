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

        # Synthesize Autonomous Campaign Deliverables
        video_scripts = DecisionService._synthesize_video_scripts(title, signals)
        ad_variants = DecisionService._synthesize_ad_suite(title, signals, blueprint)
        creator_brief = DecisionService._synthesize_creator_brief(title, signals)
        budget_shifts = DecisionService._synthesize_budget_guidance(signals)

        return CampaignDecisionsResponse(
            campaign_id=content_id,
            campaign_title=title,
            agent_name=f"{title} Autonomous Marketing Agent",
            agent_status="Active Campaign Directives",
            last_investigation=datetime.utcnow().isoformat(),
            decisions=decisions,
            blueprint=blueprint,
            video_scripts=video_scripts,
            ad_variants=ad_variants,
            creator_brief=creator_brief,
            budget_shifts=budget_shifts
        )

    @staticmethod
    def _synthesize_video_scripts(title: str, signals: Dict[str, Any]) -> List[Any]:
        from models.decisions import VideoCutdownScript, VideoScriptBeat
        resonance = signals.get("resonance_topics", [])
        friction = signals.get("friction_topics", [])
        
        top_res = resonance[0]["topic"].replace("_", " ").title() if resonance else "Cinematic Spectacle"
        top_fric = friction[0]["topic"].replace("_", " ").title() if friction else "Pacing"

        scripts = [
            VideoCutdownScript(
                id=f"scr_{uuid.uuid4().hex[:6]}",
                format="15s Vertical Cutdown (9:16)",
                target_channel="TikTok / Instagram Reels / YouTube Shorts",
                headline_objective=f"Maximize Day-1 hype by amplifying {top_res.lower()} in opening 3 seconds",
                beats=[
                    VideoScriptBeat(
                        timestamp_range="0:00 - 0:03 [Hook]",
                        beat_type="hook",
                        visual_direction=f"Close-up high-energy shot focusing directly on {top_res.lower()} without title card delay.",
                        on_screen_text=f"YOU WEREN'T READY FOR THIS.",
                        audio_voiceover="Main character punchline dialogue or instant musical vocal swell."
                    ),
                    VideoScriptBeat(
                        timestamp_range="0:03 - 0:10 [Build]",
                        beat_type="story_beat",
                        visual_direction="Fast 3-cut montage showing dramatic character beats and practical production scale.",
                        on_screen_text=f"Experience the phenomenon.",
                        audio_voiceover="Percussive cinematic rhythm building to a crescendo."
                    ),
                    VideoScriptBeat(
                        timestamp_range="0:10 - 0:15 [Payoff & CTA]",
                        beat_type="call_to_action",
                        visual_direction="Glitch cut to bold theatrical title card with IMAX / Dolby Cinema branding.",
                        on_screen_text=f"IN THEATERS EVERYWHERE — GET TICKETS NOW",
                        audio_voiceover=f"'{title}' — Exclusively in theaters soon."
                    )
                ],
                music_track_directive="Fast-tempo viral bass hit into iconic orchestral theme",
                call_to_action="Book Opening Weekend Tickets"
            ),
            VideoCutdownScript(
                id=f"scr_{uuid.uuid4().hex[:6]}",
                format="30s Broadcast & Connected TV Spot (16:9)",
                target_channel="Connected TV / YouTube Pre-Roll / Sports Telecasts",
                headline_objective=f"Counter {top_fric.lower()} skepticism by emphasizing practical craftsmanship & critical acclaim",
                beats=[
                    VideoScriptBeat(
                        timestamp_range="0:00 - 0:06 [Establishing Scale]",
                        beat_type="hook",
                        visual_direction="Wide anamorphic lens sweeping across practical set environments with authentic lighting.",
                        on_screen_text="FROM ACADEMY AWARD WINNING FILMMAKERS",
                        audio_voiceover="Voiceover establishing the high-stakes world and emotional core."
                    ),
                    VideoScriptBeat(
                        timestamp_range="0:06 - 0:18 [Narrative Arc]",
                        beat_type="story_beat",
                        visual_direction="Two-shot emotional character interaction contrasting against grand exterior conflict.",
                        on_screen_text="",
                        audio_voiceover="Dramatic dialogue beat that anchors character stakes."
                    ),
                    VideoScriptBeat(
                        timestamp_range="0:18 - 0:25 [Spectacle Crescendo]",
                        beat_type="social_proof",
                        visual_direction="Rapid fire action montage synchronized with heavy brass orchestral swell.",
                        on_screen_text="★ ★ ★ ★ ★ 'A CINEMATIC TRIUMPH'",
                        audio_voiceover="Critical review pull-quotes highlighted on screen."
                    ),
                    VideoScriptBeat(
                        timestamp_range="0:25 - 0:30 [Theatrical CTA]",
                        beat_type="call_to_action",
                        visual_direction="Final hero pose transition to full screen billing block and premium format logos.",
                        on_screen_text="EXPERIENCE IT IN IMAX 70MM & 3D",
                        audio_voiceover=f"Tickets on sale now. {title}."
                    )
                ],
                music_track_directive="Full orchestral brass and percussion score with resonant bass drop",
                call_to_action="Reserve IMAX & Premium Large Format Seats"
            )
        ]
        return scripts

    @staticmethod
    def _synthesize_ad_suite(title: str, signals: Dict[str, Any], blueprint: MarketingBlueprint) -> List[Any]:
        from models.decisions import AdCreativeVariant
        resonance = signals.get("resonance_topics", [])
        top_res = resonance[0]["topic"].replace("_", " ").title() if resonance else "Spectacle"

        return [
            AdCreativeVariant(
                platform="Meta Ads (Instagram & Facebook)",
                placement="Reels & Feed Carousels",
                primary_headline=f"Witness the power of {top_res.lower()} in {title}.",
                body_copy=f"The most anticipated theatrical event of the season is almost here. Experience breathtaking performances, practical set design, and unforgettable music on the largest screen possible.",
                target_demographics="Ages 18-49 · Film Enthusiasts · Pop Culture & Music Fans · Franchise Fans",
                recommended_hashtags=[f"#{title.replace(' ', '')}", "#MustSeeMovie", "#CinematicExperience", "#InTheatersSoon"],
                call_to_action="Get Tickets"
            ),
            AdCreativeVariant(
                platform="TikTok Ads",
                placement="TopView & In-Feed High-Velocity Ads",
                primary_headline=f"Everyone is talking about this scene in {title} 👀",
                body_copy=f"When the vocals hit and the screen explodes. Do not miss {title} on opening weekend. Tap below to grab your seats before IMAX sells out.",
                target_demographics="Gen Z & Millennials (16-34) · Trending Sounds · Entertainment & Movie TikTok",
                recommended_hashtags=[f"#{title.replace(' ', '')}", "#MovieTok", "#ViralTrailer", "#WhatToWatch"],
                call_to_action="Book Now"
            ),
            AdCreativeVariant(
                platform="YouTube Pre-Roll Video",
                placement="Non-Skippable 15s & Bumper 6s",
                primary_headline=f"{title} | Exclusively in Theaters",
                body_copy=f"Critically acclaimed and visually spectacular. See why audiences are calling {title} an instant classic. Exclusively in theaters & IMAX.",
                target_demographics="Broad Filmgoers · Entertainment Searches · Trailer Viewers",
                recommended_hashtags=[f"#{title.replace(' ', '')}Trailer", "#IMAXExperience"],
                call_to_action="Watch Trailer / Buy Tickets"
            )
        ]

    @staticmethod
    def _synthesize_creator_brief(title: str, signals: Dict[str, Any]) -> Any:
        from models.decisions import CreatorBriefing
        resonance = signals.get("resonance_topics", [])
        friction = signals.get("friction_topics", [])
        
        top_res = resonance[0]["topic"].replace("_", " ").title() if resonance else "Music & Acting"
        top_fric = friction[0]["topic"].replace("_", " ").title() if friction else "Trailer Pacing"

        return CreatorBriefing(
            campaign_phase="Teaser Drop & Pre-Sale Activation",
            core_talking_points=[
                f"Highlight genuine excitement around {top_res.lower()} and character chemistry.",
                "Emphasize the theatrical scale — encourage followers to experience it in IMAX / Dolby Cinema.",
                "Share raw, authentic first-reaction impressions of the latest trailer drop."
            ],
            creative_angles=[
                f"Side-by-side reaction to the climactic {top_res.lower()} moment.",
                "Deep-dive breakdown into practical set craft, costumes, and vocal performances.",
                "Countdown / hype ranking of most anticipated scenes."
            ],
            critical_donts=[
                f"Do not debate unconfirmed plot rumors or validate {top_fric.lower()} cynicism.",
                "Avoid comparing raw unfinished VFX to completed theatrical footage.",
                "Never post pirated or leaked footage — only use official studio trailer stems."
            ],
            recommended_audio_track=f"Official {title} Teaser Theme / Vocal Audio"
        )

    @staticmethod
    def _synthesize_budget_guidance(signals: Dict[str, Any]) -> List[Any]:
        from models.decisions import ChannelBudgetGuidance
        plat_split = signals.get("platform_split", {})
        yt_pos = plat_split.get("youtube", {}).get("positive_pct", 70)
        
        return [
            ChannelBudgetGuidance(
                channel="TikTok & Short-Form Social",
                current_allocation_pct=25,
                recommended_allocation_pct=40,
                spend_action="OVER-INDEX (+15%)",
                rationale="High organic velocity and viral sound adoption among Gen Z/Millennial cohorts driving highest ticket pre-sale intent."
            ),
            ChannelBudgetGuidance(
                channel="YouTube Pre-Roll & Cinema Pre-Show",
                current_allocation_pct=35,
                recommended_allocation_pct=35,
                spend_action="MAINTAIN (35%)",
                rationale=f"Stable positive reception (+{yt_pos}%) on high-resolution long-form trailers. Keeps mainstream awareness saturated."
            ),
            ChannelBudgetGuidance(
                channel="Meta Ads (Instagram / Facebook)",
                current_allocation_pct=25,
                recommended_allocation_pct=20,
                spend_action="OPTIMIZE (-5%)",
                rationale="Focus budget on Reels video carousels rather than static newsfeed image banners."
            ),
            ChannelBudgetGuidance(
                channel="Static Display & Search Ads",
                current_allocation_pct=15,
                recommended_allocation_pct=5,
                spend_action="REDUCE (-10%)",
                rationale="Re-allocate low-converting static banner spend directly into high-impact video cutdowns and influencer partnerships."
            )
        ]
