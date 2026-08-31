"use client";

import React, { useState } from "react";
import { Megaphone, Target, ChevronDown, ChevronUp, Layers, Send, Users, Sparkles, Check, Copy } from "lucide-react";
import { Movie } from "../utils/types";

interface ThemeItem {
  name: string;
  count: number;
  posPercent?: number;
  negPercent?: number;
}

interface ActionPlanItem {
  title: string;
  priority: "High Priority" | "Recommended" | "Quick Win" | "Informational";
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
          title: "Waiting for Audience Comments",
          priority: "Informational",
          whyItMatters: `No comments have been imported for "${campaign.title}" yet.`,
          action: "Import YouTube or Reddit comments in the section below to generate custom marketing actions.",
          copyDraft: "N/A",
          channels: ["YouTube", "Reddit", "Social Media"],
          audience: "General Moviegoers",
        },
      ];
    }

    stats.forEach((theme) => {
      if (theme.count > 0) {
        const themeLower = theme.name.toLowerCase();
        if (themeLower === "casting" || themeLower === "cast") {
          const posRatio = theme.posPercent ?? 0;
          if (posRatio >= 50) {
            plans.push({
              title: "Spotlight Leading Actors & Chemistry",
              priority: "Recommended",
              whyItMatters: `Fans love the cast (${theme.count} mentions, ${posRatio}% positive). High excitement around the lead actors in "${campaign.title}".`,
              action: "Release talent interviews, chemistry clips, and behind-the-scenes moments to maximize star power.",
              copyDraft: `\"A spectacular performance awaits. See the star-studded cast of ${campaign.title} in theaters this season.\"`,
              channels: ["YouTube Shorts", "TikTok", "Instagram Reels", "TV Interviews"],
              audience: "Younger moviegoers (18-35) and talent fanbases",
            });
          } else {
            plans.push({
              title: "Address Casting Doubts with Dramatic Previews",
              priority: "High Priority",
              whyItMatters: `Fans express skepticism around casting choices (${theme.count} mentions, ${100 - posRatio}% critical).`,
              action: "Shift marketing focus away from quick-cut action clips to dialogue-heavy scene previews showcasing dramatic range and character depth.",
              copyDraft: `\"Built on drama, driven by passion. Witness powerful performances in ${campaign.title} that stand on their own merit.\"`,
              channels: ["Cinematic Featurettes", "Press Junkets", "IMAX Pre-rolls"],
              audience: "Original franchise purists and dramatic cinephiles",
            });
          }
        }

        if (themeLower === "visuals" || themeLower === "visual" || themeLower === "cgi" || themeLower === "visual_effects") {
          const posRatio = theme.posPercent ?? 0;

          if (posRatio >= 50) {
            plans.push({
              title: "Double Down on Large-Screen Spectacle",
              priority: "Quick Win",
              whyItMatters: `Scale and cinematography are driving massive excitement (${theme.count} mentions, ${posRatio}% positive).`,
              action: `Highlight IMAX, Dolby Cinema, and big-screen visuals in all digital banners and TV spots.`,
              copyDraft: `\"Return to a grand spectacle. Experience the visual scale of ${campaign.title} on premium large screens and IMAX.\"`,
              channels: ["IMAX Trailer Cuts", "Digital Billboards", "Premium Format Ads"],
              audience: "Blockbuster fans and premium screen ticket buyers",
            });
          } else {
            plans.push({
              title: "Show Practical Sets & Real Stunt Craftsmanship",
              priority: "High Priority",
              whyItMatters: `Comments express concern over CGI quality or visual realism (${theme.count} mentions, ${100 - posRatio}% critical).`,
              action: "Release behind-the-scenes clips showing real physical sets, authentic props, and practical stunt choreography.",
              copyDraft: `\"Real stunts. Physical sets. Experience the authentic craft and scale behind the making of ${campaign.title}.\"`,
              channels: ["Making-Of Videos", "Director Commentary", "Social Featurettes"],
              audience: "CGI skeptics and cinematic craft purists",
            });
          }
        }

        if (themeLower === "soundtrack" || themeLower === "music" || themeLower === "score") {
          const posRatio = theme.posPercent ?? 0;

          if (posRatio >= 50) {
            plans.push({
              title: "Release Official Soundtrack & Music Teasers",
              priority: "Quick Win",
              whyItMatters: `Trailer music is a major hit with audiences (${theme.count} mentions, ${posRatio}% positive).`,
              action: "Release theme music audio visualizers and partner with Spotify/Apple Music playlists.",
              copyDraft: `\"The sound of an epic return. Stream the official theme music for ${campaign.title} today.\"`,
              channels: ["Spotify Playlists", "YouTube Music", "TikTok Sound Trends"],
              audience: "Soundtrack listeners and music enthusiasts",
            });
          } else {
            plans.push({
              title: "Re-anchor Promotional Music on Classic Themes",
              priority: "Recommended",
              whyItMatters: `Trailer track choices felt out of place to fans (${theme.count} mentions, ${100 - posRatio}% critical).`,
              action: "Shift upcoming TV spots to use traditional orchestral themes rather than modern licensed songs.",
              copyDraft: `\"Composed for the big screen. Immerse yourself in the sweeping orchestral score of ${campaign.title}.\"`,
              channels: ["Orchestral Reels", "Composer Spotlight", "Atmospheric TV Spots"],
              audience: "Traditional moviegoers and classical soundtrack fans",
            });
          }
        }

        if (themeLower === "story" || themeLower === "plot" || themeLower === "lore" || themeLower === "storytelling") {
          plans.push({
            title: "Clarify Storyline Timeline & Character Origins",
            priority: "Recommended",
            whyItMatters: `Fans have questions about how the story connects with previous installments (${theme.count} mentions).`,
            action: `Deploy simple explainer infographics and character lineage videos to bridge narrative gaps.`,
            copyDraft: `\"The story continues. Explore the characters, motivations, and narrative paths in ${campaign.title}.\"`,
            channels: ["Social Infographics", "YouTube Lore Videos", "Wiki Partnerships"],
            audience: "Story-focused moviegoers and sequel skeptics",
          });
        }

        // Generic fallback for any other discovered topic
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
          plans.push({
            title: isFavorable ? `Amplify Topic: ${theme.name}` : `Address Concerns: ${theme.name}`,
            priority: isFavorable ? "Quick Win" : "High Priority",
            whyItMatters: `Emerging topic with active fan discussion (${theme.count} mentions, ${posRatio}% positive).`,
            action: isFavorable
              ? `Highlight '${theme.name}' in promotional posts to leverage positive fan resonance.`
              : `Address audience skepticism around '${theme.name}' through director interviews and social Q&As.`,
            copyDraft: isFavorable
              ? `\"Discover the unforgettable ${theme.name.toLowerCase()} that audiences are talking about in ${campaign.title}.\"`
              : `\"Experience the true vision and craft of ${campaign.title}. In theaters this season.\"`,
            channels: ["Social Media Ads", "Digital Pre-rolls", "Community Q&A"],
            audience: "Engaged moviegoers and online fan communities",
          });
        }
      }
    });

    if (plans.length === 0) {
      plans.push({
        title: "Broad Campaign Promotion",
        priority: "Recommended",
        whyItMatters: "Audience reaction is balanced across key aspects.",
        action: `Run general trailer awareness ads and advance ticket booking announcements for ${campaign.title}.`,
        copyDraft: `\"Experience the cinematic event of the year. See ${campaign.title} in theaters this season.\"`,
        channels: ["TV Spots", "Digital Billboards", "Fandango Ads"],
        audience: "General moviegoing public and weekend multiplex audiences",
      });
    }

    return plans;
  };

  const actionPlans = generateActionPlan(themeStats);

  const handleCopyDraft = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-6 space-y-5 shadow-sm font-sans">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
        <div>
          <h2 className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
            Marketing Action Plan
          </h2>
          <p className="text-xs text-zinc-400">
            Recommended next steps based on audience feedback and sentiment
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-400">
          {actionPlans.length} recommended actions
        </span>
      </div>

      <div className="space-y-3.5">
        {actionPlans.map((plan, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={idx}
              className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden hover:border-zinc-700 transition"
            >
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-4.5 flex items-center justify-between cursor-pointer select-none bg-[#18181b] hover:bg-[#1e1e24] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-100">{plan.title}</h3>
                    <span className="text-xs text-zinc-400 font-medium">Click to view recommended strategy & ready-to-use copy</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
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
                <div className="p-5 border-t border-[#27272a] bg-[#121215] space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] block">
                      Why This Matters
                    </span>
                    <p className="text-zinc-200 font-sans leading-relaxed">{plan.whyItMatters}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Recommended Action
                    </span>
                    <p className="text-zinc-100 leading-relaxed font-sans font-medium">{plan.action}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#27272a]">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] block flex items-center gap-1">
                          <Send className="h-3 w-3 text-amber-400" />
                          Ready-to-Use Copy Draft
                        </span>
                        <button
                          onClick={() => handleCopyDraft(plan.copyDraft, idx)}
                          className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 transition cursor-pointer"
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
                      <p className="text-zinc-100 font-serif italic bg-[#18181b] border border-[#27272a] rounded-lg p-3 leading-relaxed">
                        {plan.copyDraft}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] block flex items-center gap-1">
                          <Users className="h-3 w-3 text-amber-400" />
                          Target Audience
                        </span>
                        <p className="text-zinc-200 font-sans font-semibold">{plan.audience}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] block flex items-center gap-1">
                          <Layers className="h-3 w-3 text-amber-400" />
                          Recommended Channels
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {plan.channels.map((chan, cIdx) => (
                            <span
                              key={cIdx}
                              className="bg-[#18181b] border border-[#27272a] px-2.5 py-1 rounded text-zinc-200 text-[10px] font-medium"
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
