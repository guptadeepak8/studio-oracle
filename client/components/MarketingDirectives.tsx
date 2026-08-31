"use client";

import React, { useState } from "react";
import { Megaphone, Target, ChevronDown, ChevronUp, Layers, Send, Users, Sparkles } from "lucide-react";
import { Movie } from "../utils/types";

interface ThemeItem {
  name: string;
  count: number;
  posPercent?: number;
  negPercent?: number;
}

interface ExpandedDirective {
  title: string;
  status: "Recommended" | "Critical Adjustment" | "Tactical Shift" | "Nurturing" | "Pending";
  context: string;
  strategy: string;
  copyDraft: string;
  channels: string[];
  demographics: string;
}

interface MarketingDirectivesProps {
  campaign: Movie;
  themeStats: ThemeItem[];
}

export default function MarketingDirectives({ campaign, themeStats }: MarketingDirectivesProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const generateDirectives = (stats: ThemeItem[]): ExpandedDirective[] => {
    const directives: ExpandedDirective[] = [];

    if (stats.length === 0 || stats.every((s) => s.count === 0)) {
      return [
        {
          title: "Awaiting Ingestion Telemetry",
          status: "Pending",
          context: `No audience feedback comments have been ingested for the "${campaign.title}" campaign yet.`,
          strategy: "Ingest live feedback comments in the Overview tab to parse themes and compile customized marketing directives.",
          copyDraft: "N/A",
          channels: ["N/A"],
          demographics: "General Moviegoing Audience",
        },
      ];
    }

    stats.forEach((theme) => {
      if (theme.count > 0) {
        const themeLower = theme.name.toLowerCase();
        if (themeLower === "casting" || themeLower === "cast") {
          const posRatio = theme.posPercent ?? 0;
          if (posRatio >= 50) {
            directives.push({
              title: "Spotlight Leading Talents & Chemistry",
              status: "Recommended",
              context: `Triggered by Casting theme volume (${theme.count} mentions, ${posRatio}% positive). Audiences are reacting highly favorably to the main cast in "${campaign.title}".`,
              strategy: "Deploy character-focused interview reels, talent spotlights, and behind-the-scenes actor chemistry clips. Leverage this high-sentiment anchor.",
              copyDraft: `\"A spectacular performance awaits. See the star-studded cast of ${campaign.title} in theaters this season.\"`,
              channels: ["YouTube Shorts", "TikTok Ads", "Instagram Reels", "Late-Night Features"],
              demographics: "Younger moviegoers (18-35), talent fandoms, and mainstream drama viewers.",
            });
          } else {
            directives.push({
              title: "Highlight Performance Depth & Character Stakes",
              status: "Tactical Shift",
              context: `Triggered by Casting theme friction (${theme.count} mentions, ${100 - posRatio}% critical). Comments express skepticism regarding casting fit or comparisons with predecessor characters.`,
              strategy: "Shift marketing focus away from quick-cut action clips to dialogue-heavy scene previews, showcasing dramatic depth and director testimonials.",
              copyDraft: `\"Built on drama, driven by passion. Witness powerful performances in ${campaign.title} that stand on their own merit.\"`,
              channels: ["Cinematic Featurettes", "Press Junket Previews", "IMAX Pre-rolls"],
              demographics: "Original franchise purists, sequel skeptics, and dramatic cinephiles.",
            });
          }
        }

        if (themeLower === "visuals" || themeLower === "visual" || themeLower === "cgi" || themeLower === "visual_effects") {
          const posRatio = theme.posPercent ?? 0;

          if (posRatio >= 50) {
            directives.push({
              title: "Scale Cinematic Spectacle & Large-Format Ads",
              status: "Recommended",
              context: `Triggered by Visuals theme volume (${theme.count} mentions, ${posRatio}% positive). Scale, set design, and cinematography are driving high excitement.`,
              strategy: `Feature high-definition cinematography highlights, primary locations, and arena spectacle in global IMAX and premium format campaigns.`,
              copyDraft: `\"Return to a grand spectacle. Experience the visual scale of ${campaign.title} on premium large screens and IMAX.\"`,
              channels: ["IMAX Trailer Cuts", "Premium Display Banners", "Visual Carousel Ads"],
              demographics: "Visual aesthetic fans, premium screen audiences, and general blockbuster viewers.",
            });
          } else {
            directives.push({
              title: "Behind-The-Scenes Practical Craft & Set Sincerity",
              status: "Critical Adjustment",
              context: `Triggered by Visuals theme complaints (${theme.count} mentions, ${100 - posRatio}% critical). Comments express concerns regarding CGI realism or lighting.`,
              strategy: "Publish featurettes showing physical set construction, practical stunt work, real armor/props, and technical craftsmanship to reassure skeptics.",
              copyDraft: `\"Real stunts. Physical sets. Experience the authentic craft and scale behind the making of ${campaign.title}.\"`,
              channels: ["Making-Of Featurettes", "Director Commentary Reels", "Technical Breakdown Logs"],
              demographics: "CGI skeptics, tech-focused moviegoers, and cinematic craft purists.",
            });
          }
        }

        if (themeLower === "soundtrack" || themeLower === "music" || themeLower === "score") {
          const posRatio = theme.posPercent ?? 0;

          if (posRatio >= 50) {
            directives.push({
              title: "Publish Official Score Teasers & Theme Tracks",
              status: "Recommended",
              context: `Triggered by Soundtrack theme volume (${theme.count} mentions, ${posRatio}% positive). The musical score and trailer tracks resonate strongly.`,
              strategy: "Release audio-only teaser clips, composer spotlight videos, and Spotify audio partner playlists.",
              copyDraft: `\"The sound of an epic return. Stream the official theme music for ${campaign.title} today.\"`,
              channels: ["Spotify Canvas Previews", "Apple Music Exclusives", "YouTube Audio Visualizers"],
              demographics: "Soundtrack listeners, audio enthusiasts, and emotional connection seekers.",
            });
          } else {
            directives.push({
              title: "Refocus Audio Narrative on Orchestral Roots",
              status: "Tactical Shift",
              context: `Triggered by Soundtrack theme friction (${theme.count} mentions, ${100 - posRatio}% critical). Feedback suggests trailer track choices alienated fans.`,
              strategy: "Replace modern promotional soundtrack cuts with traditional orchestral themes in TV spots and digital pre-rolls.",
              copyDraft: `\"Composed for the big screen. Immerse yourself in the sweeping orchestral score of ${campaign.title}.\"`,
              channels: ["Orchestral Session Reels", "Composer Interviews", "Atmospheric TV Spots"],
              demographics: "Traditional franchise enthusiasts and orchestral soundtrack listeners.",
            });
          }
        }

        if (themeLower === "story" || themeLower === "plot" || themeLower === "lore" || themeLower === "plot_elements" || themeLower === "storytelling") {
          directives.push({
            title: "Explain Lore & Narrative Bridge",
            status: "Nurturing",
            context: `Triggered by Story theme questions (${theme.count} mentions). Audiences show questions regarding timeline continuity or sequel relations.`,
            strategy: `Deploy explainer infographics, timeline charts, and character lineage reels to bridge narrative gaps and build expectation for "${campaign.title}".`,
            copyDraft: `\"The story continues. Explore the characters, motivations, and narrative paths in ${campaign.title}.\"`,
            channels: ["Interactive Story Maps", "YouTube Lore Summaries", "Wiki Database Partnerships"],
            demographics: "Narrative purists, general audiences, and sequel skeptics.",
          });
        }

        // Dynamic fallback for any other discovered topic
        const matchedKnown = (
          themeLower.includes("cast") ||
          themeLower.includes("visual") ||
          themeLower.includes("cgi") ||
          themeLower.includes("soundtrack") ||
          themeLower.includes("music") ||
          themeLower.includes("score") ||
          themeLower.includes("story") ||
          themeLower.includes("plot") ||
          themeLower.includes("lore")
        );

        if (!matchedKnown) {
          const posRatio = theme.posPercent ?? 0;
          const isFavorable = posRatio >= 50;
          directives.push({
            title: isFavorable ? `Amplify '${theme.name}' Messaging` : `Mitigate '${theme.name}' Friction`,
            status: isFavorable ? "Recommended" : "Critical Adjustment",
            context: `Triggered by active mentions of '${theme.name}' (${theme.count} mentions, ${posRatio}% positive). Discovered as an emerging audience talking point for "${campaign.title}".`,
            strategy: isFavorable
              ? `Leverage high audience resonance around '${theme.name}' to anchor promotional copy and creative teasers.`
              : `Deploy clarifying interviews, narrative context, and creator testimonials directly addressing '${theme.name}' concerns.`,
            copyDraft: isFavorable
              ? `\"Discover the unforgettable ${theme.name.toLowerCase()} that audiences are talking about in ${campaign.title}.\"`
              : `\"Experience the true vision and craft of ${campaign.title}. In theaters this season.\"`,
            channels: ["Targeted Digital Pre-rolls", "Social Engagement Teasers", "Community Q&A Panels"],
            demographics: "Engaged audience segments and online discussion participants.",
          });
        }
      }
    });

    if (directives.length === 0) {
      directives.push({
        title: "Broad Audience Engagement",
        status: "Recommended",
        context: "Audience themes are balanced across multiple indicators without a single spike.",
        strategy: `Promote general trailer hype, casting credits, and advance ticket booking options for ${campaign.title} as theme trends stabilize.`,
        copyDraft: `\"Experience the cinematic event of the year. See ${campaign.title} in theaters this season.\"`,
        channels: ["Global TV Spots", "Digital Billboards", "Ticket Partner Ads"],
        demographics: "General moviegoing public and weekend multiplex audiences.",
      });
    }

    return directives;
  };

  const directives = generateDirectives(themeStats);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-6 space-y-5 shadow-sm font-sans">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4.5 w-4.5 text-amber-400" />
          <h2 className="font-bold text-xs uppercase tracking-widest text-zinc-300">
            Actionable Marketing Strategy Directives
          </h2>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          {directives.length} telemetry-driven directives
        </span>
      </div>

      <div className="space-y-3.5">
        {directives.map((dir, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={idx}
              className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden hover:border-zinc-700 transition"
            >
              <div
                onClick={() => toggleExpand(idx)}
                className="p-4.5 flex items-center justify-between cursor-pointer select-none bg-[#18181b] hover:bg-[#1e1e24] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-100">{dir.title}</h3>
                    <span className="text-[11px] text-zinc-400 font-medium">Click to inspect tactical strategy & copy draft</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
                    dir.status === "Critical Adjustment"
                      ? "bg-rose-950/40 text-rose-400 border border-rose-500/40"
                      : dir.status === "Recommended"
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/40"
                      : dir.status === "Tactical Shift"
                      ? "bg-blue-950/40 text-blue-400 border border-blue-500/40"
                      : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                  }`}>
                    {dir.status}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 border-t border-[#27272a] bg-[#121215] space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] block">
                      Audience Telemetry Context
                    </span>
                    <p className="text-zinc-200 font-sans leading-relaxed">{dir.context}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Tactical Strategy Recommendation
                    </span>
                    <p className="text-zinc-200 leading-relaxed font-sans font-medium">{dir.strategy}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#27272a]">
                    <div className="space-y-1.5">
                      <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] block flex items-center gap-1">
                        <Send className="h-3 w-3 text-amber-400" />
                        Messaging Copy Draft
                      </span>
                      <p className="text-zinc-100 font-serif italic bg-[#18181b] border border-[#27272a] rounded-lg p-3 leading-relaxed">
                        {dir.copyDraft}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] block flex items-center gap-1">
                          <Users className="h-3 w-3 text-amber-400" />
                          Target Demographic
                        </span>
                        <p className="text-zinc-200 font-sans font-semibold">{dir.demographics}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] block flex items-center gap-1">
                          <Layers className="h-3 w-3 text-amber-400" />
                          Suggested Execution Channels
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {dir.channels.map((chan, cIdx) => (
                            <span
                              key={cIdx}
                              className="bg-[#18181b] border border-[#27272a] px-2 py-0.5 rounded text-zinc-300 text-[10px] font-mono"
                            >
                              {chan}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
