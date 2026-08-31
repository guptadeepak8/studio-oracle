"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Target, Send, Users, Layers, Sparkles, Check, Copy, AlertCircle, Zap, Megaphone } from "lucide-react";
import { Movie } from "../utils/types";

interface ThemeItem {
  name: string;
  count: number;
  posPercent?: number;
  negPercent?: number;
}

interface ActionPlanItem {
  title: string;
  priority: "High Priority" | "Quick Win" | "Recommended";
  whyItMatters: string;
  action: string;
  copyDraft: string;
  channels: string[];
  audience: string;
}

interface MarketingDirectivesProps {
  campaign: Movie;
  themeStats: ThemeItem[];
}

export default function MarketingDirectives({ campaign, themeStats }: MarketingDirectivesProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateActionPlan = (stats: ThemeItem[]): ActionPlanItem[] => {
    const plans: ActionPlanItem[] = [];

    if (stats.length === 0 || stats.every((s) => s.count === 0)) {
      return [
        {
          title: "Awaiting Audience Feedback Data",
          priority: "Recommended",
          whyItMatters: `No audience feedback comments have been imported for "${campaign.title}" yet.`,
          action: "Import live comments from YouTube or Reddit to generate customized, high-priority marketing actions.",
          copyDraft: `\"Experience the cinematic event of the year. See ${campaign.title} in theaters this season.\"`,
          channels: ["YouTube", "Reddit", "Social Media"],
          audience: "General Moviegoers",
        },
      ];
    }

    // Identify high-priority friction topics (critical >= 20%)
    const frictionTopics = [...stats]
      .filter((t) => (t.negPercent ?? 0) >= 20 && t.count > 0)
      .sort((a, b) => (b.negPercent ?? 0) - (a.negPercent ?? 0));

    // Identify high-resonance positive topics (positive >= 45%)
    const positiveTopics = [...stats]
      .filter((t) => (t.posPercent ?? 0) >= 45 && t.count > 0)
      .sort((a, b) => (b.posPercent ?? 0) - (a.posPercent ?? 0));

    // 1. Critical Friction Action (Top Priority)
    if (frictionTopics.length > 0) {
      const topFriction = frictionTopics[0];
      const topicName = topFriction.name.toLowerCase();

      if (topicName.includes("cast") || topicName.includes("actor")) {
        plans.push({
          title: "Mitigate Casting Doubts with Dramatic Scene Previews",
          priority: "High Priority",
          whyItMatters: `Audience commentary shows debate regarding casting choices (${topFriction.count} mentions, ${topFriction.negPercent}% critical).`,
          action: "Shift promotional focus away from fast-paced action montage to dialogue-heavy scene previews showcasing lead actors' dramatic range.",
          copyDraft: `\"Built on drama, driven by passion. Witness powerful performances in ${campaign.title} that stand on their own merit.\"`,
          channels: ["Cinematic Featurettes", "Press Junket Interviews", "IMAX Pre-rolls"],
          audience: "Franchise purists and dramatic cinephiles",
        });
      } else if (topicName.includes("cgi") || topicName.includes("visual")) {
        plans.push({
          title: "Highlight Physical Set Sincerity & Practical Stunts",
          priority: "High Priority",
          whyItMatters: `Comments express skepticism regarding CGI realism and digital lighting (${topFriction.count} mentions, ${topFriction.negPercent}% critical).`,
          action: "Release behind-the-scenes reels highlighting practical set construction, authentic arena props, and physical stunt work.",
          copyDraft: `\"Real stunts. Physical sets. Experience the authentic craft and scale behind the making of ${campaign.title}.\"`,
          channels: ["Making-Of Featurettes", "Director Commentary Reels", "Social Video Breakdowns"],
          audience: "CGI skeptics and cinematic craft enthusiasts",
        });
      } else {
        plans.push({
          title: `Address Audience Concerns Regarding '${topFriction.name}'`,
          priority: "High Priority",
          whyItMatters: `Identified as a major friction point (${topFriction.count} mentions, ${topFriction.negPercent}% critical).`,
          action: `Deploy clarifying interviews, narrative context, and creator testimonials directly addressing '${topFriction.name}'.`,
          copyDraft: `\"Experience the true vision and craft of ${campaign.title}. In theaters this season.\"`,
          channels: ["Targeted Digital Pre-rolls", "Social Q&A Panels", "Press Releases"],
          audience: "Engaged moviegoers and online fan communities",
        });
      }
    }

    // 2. High-Resonance Driver Action (Quick Win)
    if (positiveTopics.length > 0) {
      const topPos = positiveTopics[0];
      const topicName = topPos.name.toLowerCase();

      if (topicName.includes("visual") || topicName.includes("scale") || topicName.includes("action") || topicName.includes("spectacle")) {
        plans.push({
          title: "Double Down on Large-Screen Spectacle & IMAX Ads",
          priority: "Quick Win",
          whyItMatters: `Scale, arena spectacle, and cinematography are driving massive positive resonance (${topPos.count} mentions, ${topPos.posPercent}% positive).`,
          action: `Promote IMAX, Dolby Cinema, and premium format screenings across all digital banner ads and trailer spots.`,
          copyDraft: `\"Return to a grand spectacle. Experience the visual scale of ${campaign.title} on premium large screens and IMAX.\"`,
          channels: ["IMAX Trailer Cuts", "Digital Billboards", "Premium Format Previews"],
          audience: "Blockbuster viewers and premium screen ticket buyers",
        });
      } else if (topicName.includes("soundtrack") || topicName.includes("music") || topicName.includes("score")) {
        plans.push({
          title: "Publish Official Theme Music Teasers & Audio Trends",
          priority: "Quick Win",
          whyItMatters: `The musical score is a major highlight with fans (${topPos.count} mentions, ${topPos.posPercent}% positive).`,
          action: "Release audio-only teaser clips, composer spotlight videos, and Spotify audio partner playlists.",
          copyDraft: `\"The sound of an epic return. Stream the official theme music for ${campaign.title} today.\"`,
          channels: ["Spotify Playlists", "YouTube Audio Visualizers", "TikTok Sound Trends"],
          audience: "Soundtrack listeners and music enthusiasts",
        });
      } else {
        plans.push({
          title: `Amplify High-Resonance Topic: '${topPos.name}'`,
          priority: "Quick Win",
          whyItMatters: `Fans are reacting with high excitement around '${topPos.name}' (${topPos.count} mentions, ${topPos.posPercent}% positive).`,
          action: `Anchor upcoming social media teasers and digital ad copy around '${topPos.name}'.`,
          copyDraft: `\"Discover the unforgettable ${topPos.name.toLowerCase()} that audiences are raving about in ${campaign.title}.\"`,
          channels: ["YouTube Shorts", "Instagram Reels", "Digital Ads"],
          audience: "Mainstream moviegoers and talent fandoms",
        });
      }
    }

    // 3. Narrative Lore / General Audience Expansion Action
    const storyTopic = stats.find((t) => {
      const n = t.name.toLowerCase();
      return n.includes("story") || n.includes("plot") || n.includes("lore") || n.includes("pacing");
    });

    if (storyTopic) {
      plans.push({
        title: "Clarify Story Continuity & Character Lineage",
        priority: "Recommended",
        whyItMatters: `Audience discussions show questions regarding the timeline and sequel connections (${storyTopic.count} mentions).`,
        action: `Deploy simple explainer infographics, timeline charts, and character lineage reels to build anticipation.`,
        copyDraft: `\"The story continues. Explore the characters, motivations, and narrative paths in ${campaign.title}.\"`,
        channels: ["Interactive Story Maps", "YouTube Lore Videos", "Wiki Partnerships"],
        audience: "Narrative purists and sequel skeptics",
      });
    } else {
      plans.push({
        title: "Broad Multiplex Ticket Awareness Campaign",
        priority: "Recommended",
        whyItMatters: `Audience reaction is stabilizing across key discussion indicators.`,
        action: `Promote advance ticket booking links and weekend multiplex screening times across television and digital ads.`,
        copyDraft: `\"Experience the cinematic event of the year. See ${campaign.title} in theaters this season.\"`,
        channels: ["Global TV Spots", "Digital Billboards", "Fandango Ticket Ads"],
        audience: "General moviegoing public and weekend multiplex audiences",
      });
    }

    return plans.slice(0, 3); // Top 3 high-impact strategic actions
  };

  const actionPlans = generateActionPlan(themeStats);

  const handleCopyDraft = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Section Header with Chevron matching ClickHouse Cloud */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-sm font-bold text-zinc-100 hover:text-[#e6fc4f] transition cursor-pointer select-none"
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          )}
          <span>Marketing Action Directives</span>
        </button>

        <span className="text-xs font-mono font-bold text-[#e6fc4f] bg-[#1c1c1f] border border-[#28282b] px-3 py-1 rounded-md">
          {actionPlans.length} Prioritized Directives
        </span>
      </div>

      <p className="text-xs text-zinc-500">
        AI-synthesized strategic marketing pivots and promotional ad copy based on ClickHouse telemetry.
      </p>

      {isOpen && (
        <div className="space-y-3.5">
          {actionPlans.map((plan, idx) => (
            <div
              key={idx}
              className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-5 space-y-4 shadow-xs hover:border-zinc-700 transition"
            >
              {/* Directive Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#28282b]/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-md bg-[#242428] flex items-center justify-center text-[#e6fc4f] shrink-0">
                    <Target className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="font-bold text-sm text-zinc-100">{plan.title}</h3>
                </div>

                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  plan.priority === "High Priority"
                    ? "bg-[#331b20] text-[#f87171] border border-[#4c242a]"
                    : plan.priority === "Quick Win"
                    ? "bg-[#183424] text-[#4ade80] border border-[#234e35]"
                    : "bg-[#1e293b] text-[#60a5fa] border border-[#334155]"
                }`}>
                  {plan.priority}
                </span>
              </div>

              {/* 2-Column Strategy & Copy Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Left: Audience Signal & Recommended Action */}
                <div className="space-y-3">
                  <div className="bg-[#161618] border border-[#28282b] rounded-lg p-3 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <AlertCircle className="h-3 w-3 text-[#e6fc4f]" />
                      Audience Signal Rationale
                    </span>
                    <p className="text-zinc-300 leading-relaxed font-sans">{plan.whyItMatters}</p>
                  </div>

                  <div className="bg-[#161618] border border-[#28282b] rounded-lg p-3 space-y-1">
                    <span className="text-[10px] font-bold text-[#e6fc4f] uppercase tracking-wider block flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      Recommended Marketing Action
                    </span>
                    <p className="text-zinc-100 leading-relaxed font-sans font-medium">{plan.action}</p>
                  </div>
                </div>

                {/* Right: Ad Copy Draft & Target Execution */}
                <div className="space-y-3">
                  <div className="bg-[#161618] border border-[#28282b] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                        <Send className="h-3 w-3 text-[#e6fc4f]" />
                        Ready-to-Use Promotional Copy
                      </span>
                      <button
                        onClick={() => handleCopyDraft(plan.copyDraft, idx)}
                        className="flex items-center gap-1 bg-[#e6fc4f] hover:bg-[#d8ed47] text-black font-bold text-[10px] px-2 py-0.5 rounded transition cursor-pointer shadow-xs"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="h-3 w-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy Text
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-zinc-100 font-serif italic text-xs leading-relaxed border-l-2 border-[#e6fc4f]/70 pl-2.5">
                      {plan.copyDraft}
                    </p>
                  </div>

                  <div className="bg-[#161618] border border-[#28282b] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 font-medium">Target Audience:</span>
                      <span className="font-semibold text-zinc-200">{plan.audience}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#28282b]/60">
                      <span className="text-[10px] text-zinc-500 font-medium mr-1">Channels:</span>
                      {plan.channels.map((chan, cIdx) => (
                        <span
                          key={cIdx}
                          className="bg-[#242428] border border-[#2e2e33] px-2 py-0.5 rounded text-zinc-300 text-[10px] font-medium"
                        >
                          {chan}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
