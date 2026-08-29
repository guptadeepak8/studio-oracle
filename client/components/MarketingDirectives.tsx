"use client";

import React, { useState } from "react";
import { Megaphone, Target, ChevronDown, ChevronUp, Layers, Send, Users } from "lucide-react";

interface ThemeItem {
  name: string;
  count: number;
  positive: number;
  negative: number;
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
  themeStats: ThemeItem[];
}

export default function MarketingDirectives({ themeStats }: MarketingDirectivesProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const generateDirectives = (stats: ThemeItem[]): ExpandedDirective[] => {
    const directives: ExpandedDirective[] = [];

    if (stats.length === 0 || stats.every((s) => s.count === 0)) {
      return [
        {
          title: "Awaiting Campaign Ingestion",
          status: "Pending",
          context: "No ClickHouse audience feedback records have been ingested for this campaign yet.",
          strategy: "Run the YouTube Ingestion pipeline in the Overview tab to scan trailer comments, extract themes, and compile marketing advice.",
          copyDraft: "N/A",
          channels: ["N/A"],
          demographics: "General Moviegoing Audience",
        },
      ];
    }

    stats.forEach((theme) => {
      if (theme.count > 0) {
        if (theme.name === "Casting") {
          const totalMentions = theme.positive + theme.negative;
          const posRatio = Math.round((theme.positive / (totalMentions || 1)) * 100);

          if (theme.positive >= theme.negative) {
            directives.push({
              title: "Spotlight Leading Talents",
              status: "Recommended",
              context: `Triggered by Casting theme volume (${theme.count} mentions, ${posRatio}% positive). Audiences are reacting highly favorably to Paul Mescal and Denzel Washington's trailer presence.`,
              strategy: "Deploy character-focused interview reels, talent spotlights, and behind-the-scenes actor chemistry clips. Position Mescal as a worthy successor to the franchise legacy.",
              copyDraft: '"A new legacy is forged in blood. See Paul Mescal as Lucius and Denzel Washington as Macrinus in Gladiator II."',
              channels: ["YouTube Shorts", "TikTok Ads", "Instagram Reels", "Late-Night Talk Shows"],
              demographics: "Younger moviegoers (18-35), fans of the lead actors, and drama enthusiasts.",
            });
          } else {
            directives.push({
              title: "Highlight Performance Depth",
              status: "Tactical Shift",
              context: `Triggered by Casting theme criticism (${theme.count} mentions, ${100 - posRatio}% critical). Debates show skepticism regarding character casting fit compared to the original cast.`,
              strategy: "Shift marketing focus away from brief action-bites towards dialogue-heavy cuts, showcasing dramatic range, actor training featurettes, and director quotes validation.",
              copyDraft: '"Built on honor, driven by vengeance. Witness a powerhouse performance that stands on its own merit."',
              channels: ["Cinematic Featurettes", "Entertainment Press Junkets", "IMAX Pre-rolls"],
              demographics: "Original Gladiator nostalgics, sequel skeptics, and cinephiles.",
            });
          }
        }

        if (theme.name === "Visuals") {
          const totalMentions = theme.positive + theme.negative;
          const posRatio = Math.round((theme.positive / (totalMentions || 1)) * 100);

          if (theme.positive >= theme.negative) {
            directives.push({
              title: "Scale Cinematic Promo Cuts",
              status: "Recommended",
              context: `Triggered by Visuals theme volume (${theme.count} mentions, ${posRatio}% positive). Wide-angle arena cinematography and set scale are generating high awe-factors.`,
              strategy: "Feature high-definition battle arrangements, Colosseum combat scenery, and majestic Roman wide angles in global advertising templates.",
              copyDraft: '"Return to the arena. Witness the scale of Rome in premium screens and IMAX."',
              channels: ["IMAX Trailer Cuts", "Premium Display Banners", "Visual-focused Instagram Carousel Ads"],
              demographics: "Historical epic fans, premium-large-format screen audiences, and general blockbuster viewers.",
            });
          } else {
            directives.push({
              title: "Behind-The-Scenes Visual Sincerity",
              status: "Critical Adjustment",
              context: `Triggered by Visuals theme complaints (${theme.count} mentions, ${100 - posRatio}% critical). Critical comments express concern over 'video-gamey CGI' and digital saturation.`,
              strategy: "Publish featurettes showing physical set construction (the actual building of the Colosseum replica), real weapon crafting, and raw stunt choreography to counter CGI critiques.",
              copyDraft: '"No shortcuts. Experience the physical scale, hand-built sets, and real steel action of Gladiator II."',
              channels: ["Technical Making-Of Clips", "Director Stunt Commentaries", "Reddit AMA threads"],
              demographics: "CGI skeptics, tech-focused moviegoers, and historical accuracy purists.",
            });
          }
        }

        if (theme.name === "Soundtrack") {
          const totalMentions = theme.positive + theme.negative;
          const posRatio = Math.round((theme.positive / (totalMentions || 1)) * 100);

          if (theme.positive >= theme.negative) {
            directives.push({
              title: "Publish Soundtrack Theme Reels",
              status: "Recommended",
              context: `Triggered by Soundtrack theme volume (${theme.count} mentions, ${posRatio}% positive). Sweeping orchestral score triggers nostalgia and emotional connection.`,
              strategy: "Release orchestral tracks on audio streaming services early. Anchor short-form social video edits using original score cues to drive engagement.",
              copyDraft: '"The soul of Rome. Listen to the epic orchestral score by Harry Gregson-Williams now on Spotify."',
              channels: ["Spotify Playlist Ads", "TikTok Background Sound Templates", "Dolby Atmos Audio Previews"],
              demographics: "Soundtrack collectors, original film fans, and audio-philes.",
            });
          } else {
            directives.push({
              title: "Soundtrack Re-pitching",
              status: "Critical Adjustment",
              context: `Triggered by Soundtrack theme friction (${theme.count} mentions, ${100 - posRatio}% critical). Modern soundtrack choices in the trailer (e.g. hip-hop track overlays) break Roman atmosphere for some.`,
              strategy: "Minimize modern musical genres in subsequent TV cuts and trailers. Re-pitch with classical orchestral scores that honor Hans Zimmer's original iconic arrangements.",
              copyDraft: '"The music of gladiators. Honor the legacy with a majestic, classical orchestral experience."',
              channels: ["Broadcast TV Spot Cuts", "Trailer 2 Release", "Cinematic Radio Ads"],
              demographics: "Historical classical music fans and movie atmospherics skeptics.",
            });
          }
        }

        if (theme.name === "Story") {
          directives.push({
            title: "Explain Campaign Lore & Context",
            status: "Nurturing",
            context: `Triggered by Story theme questions (${theme.count} mentions). Users express confusion over the chronological timeline gap and character connections (e.g., Lucius's relation to Maximus).`,
            strategy: "Deploy clean lineage charts and story summary reels to bridge the 25-year timeline gap, clarifying connections to original characters without spoiling plot points.",
            copyDraft: '"A new chapter begins. Twenty-five years after the fall of Maximus, follow Lucius as he fights to reclaim the dream of Rome."',
            channels: ["Interactive Lineage Infographics", "Lore-breakdown YouTube Shorts", "Entertainment Wiki integrations"],
            demographics: "Lore-enthusiasts, casual moviegoers, and sequel skeptics.",
          });
        }
      }
    });

    if (directives.length === 0) {
      directives.push({
        title: "Broad Audience Engagement",
        status: "Recommended",
        context: "Audience discussions are currently distributed without a single dominant topic spike.",
        strategy: "Focus messaging on general action thriller beats, trailer momentum, and ticket pre-sale alerts while theme trends stabilize.",
        copyDraft: '"Experience the cinematic event of the year. Gladiator II in theaters this November."',
        channels: ["Global TV Spots", "Digital Billboard Ads", "Ticket Retailer partners"],
        demographics: "General moviegoing public, action fans, and multiplex audiences.",
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
              {/* Header Accordion Bar */}
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
                    <span className="text-[10px] text-zinc-500 font-medium">Click to inspect directives</span>
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

              {/* Accordion Content Details */}
              {isExpanded && (
                <div className="p-4 border-t border-zinc-850 bg-black/10 space-y-4 text-xs">
                  {/* Context Segment */}
                  <div className="space-y-1">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest text-[9px] block">
                      Audience Evidence Context
                    </span>
                    <p className="text-zinc-300 font-sans leading-relaxed">{dir.context}</p>
                  </div>

                  {/* Tactical Strategy Segment */}
                  <div className="space-y-1">
                    <span className="text-zinc-550 font-bold uppercase tracking-widest text-[9px] block">
                      Tactical Marketing Strategy
                    </span>
                    <p className="text-zinc-250 leading-relaxed font-sans">{dir.strategy}</p>
                  </div>

                  {/* Two Column details: Copy & Demographics */}
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
