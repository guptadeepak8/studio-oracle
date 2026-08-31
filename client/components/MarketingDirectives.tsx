"use client";

import React, { useState } from "react";
import { Megaphone, Target, ChevronDown, ChevronUp, Layers, Send, Users, Sparkles, Check, Copy, AlertCircle, ArrowUpRight, Zap } from "lucide-react";
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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateActionPlan = (stats: ThemeItem[]): ActionPlanItem[] => {
    const plans: ActionPlanItem[] = [];

    if (stats.length === 0 || stats.every((s) => s.count === 0)) {
      return [
        {
          title: "Waiting for Audience Feedback",
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
          whyItMatters: `Audience commentary shows active debate regarding casting (${topFriction.count} mentions, ${topFriction.negPercent}% critical).`,
          action: "Shift promotional focus away from quick-cut montage clips to dialogue-heavy scene previews that showcase the lead actors' emotional depth.",
          copyDraft: `\"Built on drama, driven by passion. Witness powerful performances in ${campaign.title} that stand on their own merit.\"`,
          channels: ["Cinematic Featurettes", "Press Junket Interviews", "IMAX Pre-rolls"],
          audience: "Franchise purists and dramatic cinephiles",
        });
      } else if (topicName.includes("cgi") || topicName.includes("visual")) {
        plans.push({
          title: "Highlight Physical Set Sincerity & Practical Stunts",
          priority: "High Priority",
          whyItMatters: `Comments express skepticism regarding CGI realism and digital lighting (${topFriction.count} mentions, ${topFriction.negPercent}% critical).`,
          action: "Release behind-the-scenes footage showing physical arena construction, authentic props, and real practical stunts.",
          copyDraft: `\"Real stunts. Physical sets. Experience the authentic craft and scale behind the making of ${campaign.title}.\"`,
          channels: ["Making-Of Featurettes", "Director Commentary Reels", "Social Video Breakdowns"],
          audience: "CGI skeptics and cinematic craft enthusiasts",
        });
      } else {
        plans.push({
          title: `Address Audience Concerns Regarding '${topFriction.name}'`,
          priority: "High Priority",
          whyItMatters: `Identified as a major friction point (${topFriction.count} mentions, ${topFriction.negPercent}% critical).`,
          action: `Deploy clarifying interviews, narrative context, and creator testimonials directly addressing '${topFriction.name}' concerns.`,
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

    return plans.slice(0, 4); // Limit to top 3-4 high-leverage strategic actions
  };

  const actionPlans = generateActionPlan(themeStats);

  const handleCopyDraft = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-6 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Megaphone className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-zinc-100 uppercase tracking-wider">
                Marketing Action Plan
              </h2>
              <p className="text-xs text-zinc-400">
                Top prioritized marketing adjustments and copy drafts based on audience telemetry for "{campaign.title}"
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            {actionPlans.length} Strategic Directives
          </span>
        </div>
      </div>

      {/* Action Cards List */}
      <div className="space-y-4">
        {actionPlans.map((plan, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={idx}
              className="bg-[#121215] border border-[#27272a] rounded-2xl overflow-hidden hover:border-zinc-700 transition shadow-sm"
            >
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-5 flex items-center justify-between cursor-pointer select-none bg-[#121215] hover:bg-[#18181b] transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Target className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-100">{plan.title}</h3>
                    <span className="text-xs text-zinc-400 font-medium">Click to inspect strategic rationale & ready-to-use copy draft</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    plan.priority === "High Priority"
                      ? "bg-rose-950/60 text-rose-400 border border-rose-500/40"
                      : plan.priority === "Quick Win"
                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                      : "bg-blue-950/60 text-blue-400 border border-blue-500/40"
                  }`}>
                    {plan.priority}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-6 border-t border-[#27272a] bg-[#18181b] space-y-5 text-xs">
                  {/* Rationale & Action */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 bg-[#121215] border border-[#27272a] p-4 rounded-xl">
                      <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] block flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                        Why This Matters (Audience Signal)
                      </span>
                      <p className="text-zinc-200 font-sans leading-relaxed">{plan.whyItMatters}</p>
                    </div>

                    <div className="space-y-1.5 bg-[#121215] border border-amber-500/20 p-4 rounded-xl">
                      <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        Recommended Strategic Action
                      </span>
                      <p className="text-zinc-100 font-sans leading-relaxed font-medium">{plan.action}</p>
                    </div>
                  </div>

                  {/* Copy Draft & Target Execution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-[#27272a]">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] block flex items-center gap-1.5">
                          <Send className="h-3.5 w-3.5 text-amber-400" />
                          Ready-to-Use Ad & Social Copy Draft
                        </span>
                        <button
                          onClick={() => handleCopyDraft(plan.copyDraft, idx)}
                          className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded transition cursor-pointer"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy Text
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-zinc-100 font-serif italic bg-[#121215] border border-[#27272a] rounded-xl p-3.5 leading-relaxed">
                        {plan.copyDraft}
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] block flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-amber-400" />
                          Target Audience Segment
                        </span>
                        <p className="text-zinc-200 font-sans font-semibold text-xs">{plan.audience}</p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] block flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-amber-400" />
                          Recommended Distribution Channels
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {plan.channels.map((chan, cIdx) => (
                            <span
                              key={cIdx}
                              className="bg-[#121215] border border-[#27272a] px-2.5 py-1 rounded-md text-zinc-200 text-[11px] font-medium"
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
