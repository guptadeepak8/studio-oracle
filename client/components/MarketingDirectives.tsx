"use client";

import React, { useState } from "react";
import { Megaphone, Target, ChevronDown, ChevronUp, Layers, Send, Users } from "lucide-react";
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
              title: "Spotlight Leading Talents",
              status: "Recommended",
              context: `Triggered by Casting theme volume (${theme.count} mentions, ${posRatio}% positive). Audiences are reacting highly favorably to the main cast and actors in the "${campaign.title}" trailer.`,
              strategy: "Deploy character-focused interview reels, talent spotlights, and behind-the-scenes actor chemistry clips. Leverage the positive association to boost awareness.",
              copyDraft: `\"A spectacular performance awaits. See the star-studded cast of ${campaign.title} in theaters this November.\"`,
              channels: ["YouTube Shorts", "TikTok Ads", "Instagram Reels", "Late-Night Show Features"],
              demographics: "Younger moviegoers (18-35), fans of the lead actors, and drama enthusiasts.",
            });
          } else {
            directives.push({
              title: "Highlight Performance Depth",
              status: "Tactical Shift",
              context: `Triggered by Casting theme criticism (${theme.count} mentions, ${100 - posRatio}% critical). Critical discussions express skepticism regarding actor fits or comparisons with historical representations.`,
              strategy: "Shift marketing focus away from quick-cut action blocks to dialogue-heavy scenes, showcasing dramatic range, actor commitment features, and director testimonials.",
              copyDraft: `\"Built on drama, driven by passion. Witness powerful performances in ${campaign.title} that stand on their own merit.\"`,
              channels: ["Cinematic Featurettes", "Press Junket Interviews", "IMAX Pre-rolls"],
              demographics: "Original franchise fans, sequel skeptics, and cinephiles.",
            });
          }
        }

        if (themeLower === "visuals" || themeLower === "visual" || themeLower === "cgi" || themeLower === "visual_effects") {
          const posRatio = theme.posPercent ?? 0;

          if (posRatio >= 50) {
            directives.push({
              title: "Scale Cinematic Promo Cuts",
              status: "Recommended",
              context: `Triggered by Visuals theme volume (${theme.count} mentions, ${posRatio}% positive). Wide-angle cinematography, set design, and scale are driving positive reactions.`,
              strategy: `Feature high-definition cinematography highlights, primary locations of ${campaign.title}, and visual effect sequences in global advertising templates.`,
              copyDraft: `\"Return to a grand spectacle. Experience the visual scale of ${campaign.title} on premium large screens and IMAX.\"`,
              channels: ["IMAX Trailer Cuts", "Premium Display Banners", "Visual-focused Social Carousel Ads"],
              demographics: "Visual aesthetic fans, premium screen audiences, and general blockbuster viewers.",
            });
          } else {
            directives.push({
              title: "Behind-The-Scenes Visual Sincerity",
              status: "Critical Adjustment",
              context: `Triggered by Visuals theme complaints (${theme.count} mentions, ${100 - posRatio}% critical). Comments express concerns regarding effects, CGI realism, or set lighting in "${campaign.title}".`,
              strategy: "Publish featurettes showing physical set construction, practical effects, real props, and stunt choreography to demonstrate the technical sincerity of production.",
              copyDraft: `\"Real stunts. Physical sets. Experience the authentic craft and scale behind the making of ${campaign.title}.\"`,
              channels: ["Making-Of Featurettes", "Director Commentary Clips", "Technical Breakdown Logs"],
              demographics: "CGI skeptics, tech-focused moviegoers, and cinematic craft purists.",
            });
          }
        }

        if (themeLower === "soundtrack" || themeLower === "music" || themeLower === "score") {
          const posRatio = theme.posPercent ?? 0;

          if (posRatio >= 50) {
            directives.push({
              title: "Publish Soundtrack Theme Reels",
              status: "Recommended",
              context: `Triggered by Soundtrack theme volume (${theme.count} mentions, ${posRatio}% positive). Soundtrack cues trigger positive nostalgia and high emotional resonance.`,
              strategy: `Release instrumental tracks or orchestral cues early on audio streaming platforms. Use the score as background audio template for user-generated content.`,
              copyDraft: `\"The score of a lifetime. Listen to the epic original soundtrack of ${campaign.title} now on Spotify.\"`,
              channels: ["Spotify Playlist Campaigns", "Social Sound Templates", "Dolby Atmos Audio Previews"],
              demographics: "Soundtrack collectors, music fans, and audio-philes.",
            });
          } else {
            directives.push({
              title: "Soundtrack Re-pitching",
              status: "Critical Adjustment",
              context: `Triggered by Soundtrack theme friction (${theme.count} mentions, ${100 - posRatio}% critical). Debates highlight friction regarding modern tracks or audio styling choices in the trailer.`,
              strategy: "Minimize focus on modern/lyric-heavy songs in upcoming television spots and trailers. Re-pitch promotional spots using classical or epic scores that align with atmosphere expectations.",
              copyDraft: `\"Hear the epic, atmospheric sound design. Experience ${campaign.title} in Dolby Atmos.\"`,
              channels: ["TV Spot Re-cuts", "Teaser 2 Releases", "Broadcast Radio Promos"],
              demographics: "Atmos/score purists and atmospheric skeptic demographics.",
            });
          }
        }

        if (themeLower === "story" || themeLower === "plot" || themeLower === "lore" || themeLower === "plot_elements" || themeLower === "storytelling") {
          directives.push({
            title: "Explain Lore & Narrative Paths",
            status: "Nurturing",
            context: `Triggered by Story/Plot theme questions (${theme.count} mentions). Audiences show questions regarding the timeline, prequel/sequel relations, or plot configurations.`,
            strategy: `Deploy explainer infographics, timeline charts, and character lineage reels to bridge the plot gap and build expectation for "${campaign.title}".`,
            copyDraft: `\"The story continues. Explore the characters, motivations, and narrative paths in ${campaign.title}.\"`,
            channels: ["Interactive Story Maps", "YouTube Lore Summaries", "Wiki Database Partnerships"],
            demographics: "Narrative purists, general audiences, and sequel skeptics.",
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
        copyDraft: `\"Experience the cinematic event of the year. See ${campaign.title} in theaters this November.\"`,
        channels: ["Global TV Spots", "Digital Billboards", "Fandango ticket partners"],
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
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-amber-500" />
        <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-300">
          Marketing Strategy Directives
        </h2>
      </div>

      <div className="space-y-3.5">
        {directives.map((dir, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={idx}
              className="bg-[#0e0e11]/60 border border-zinc-850 rounded-xl overflow-hidden hover:border-zinc-800 transition"
            >
              <div
                onClick={() => toggleExpand(idx)}
                className="p-4 flex items-center justify-between cursor-pointer select-none bg-zinc-900/40 hover:bg-zinc-900/60 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                    <Target className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-200">{dir.title}</h3>
                    <span className="text-[10px] text-zinc-550 font-medium">Click to inspect directives</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    dir.status === "Critical Adjustment"
                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                      : dir.status === "Recommended"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : dir.status === "Tactical Shift"
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  }`}>
                    {dir.status}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-zinc-550" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-550" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 border-t border-zinc-850 bg-black/10 space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-zinc-550 font-bold uppercase tracking-widest text-[9px] block">
                      Audience Evidence Context
                    </span>
                    <p className="text-zinc-300 font-sans leading-relaxed">{dir.context}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-zinc-550 font-bold uppercase tracking-widest text-[9px] block">
                      Tactical Marketing Strategy
                    </span>
                    <p className="text-zinc-250 leading-relaxed font-sans">{dir.strategy}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1 border-t border-zinc-850/50">
                    <div className="space-y-1">
                      <span className="text-zinc-550 font-bold uppercase tracking-widest text-[9px] block flex items-center gap-1">
                        <Send className="h-3 w-3 text-amber-500" />
                        Messaging Copy Draft
                      </span>
                      <p className="text-zinc-300 font-serif italic bg-zinc-900/60 border border-zinc-850 rounded p-2.5 leading-relaxed">
                        {dir.copyDraft}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-zinc-550 font-bold uppercase tracking-widest text-[9px] block flex items-center gap-1">
                          <Users className="h-3 w-3 text-amber-500" />
                          Target Demographic
                        </span>
                        <p className="text-zinc-300 font-sans font-medium">{dir.demographics}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-zinc-550 font-bold uppercase tracking-widest text-[9px] block flex items-center gap-1">
                          <Layers className="h-3 w-3 text-amber-500" />
                          Suggested Channels
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {dir.channels.map((chan, cIdx) => (
                            <span
                              key={cIdx}
                              className="bg-zinc-800 text-[10px] px-2 py-0.5 rounded text-zinc-300 border border-zinc-700 font-medium"
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
