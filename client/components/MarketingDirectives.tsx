"use client";

import React from "react";
import { Megaphone, Target, CheckCircle2 } from "lucide-react";

interface ThemeItem {
  name: string;
  count: number;
  positive: number;
  negative: number;
}

interface MarketingDirectivesProps {
  themeStats: ThemeItem[];
}

export default function MarketingDirectives({ themeStats }: MarketingDirectivesProps) {
  // Generate strategic directives based on the theme counts
  const generateDirectives = (stats: ThemeItem[]) => {
    const directives = [];

    // Check if there is data
    if (stats.length === 0 || stats.every(s => s.count === 0)) {
      return [
        {
          title: "Awaiting Campaign Ingestion",
          strategy: "Ingest audience feedback comments to formulate actionable marketing positioning directives.",
          status: "Pending"
        }
      ];
    }

    stats.forEach((theme) => {
      if (theme.count > 0) {
        if (theme.name === "Casting") {
          if (theme.positive >= theme.negative) {
            directives.push({
              title: "Spotlight Leading Talents",
              strategy: "Double down on Paul Mescal and Denzel Washington in trailers, social reels, and promotional interview spotlights. Audience reaction is highly receptive.",
              status: "Recommended"
            });
          } else {
            directives.push({
              title: "Highlight Performance Depth",
              strategy: "Shift promotional material to show dramatic dialog cuts rather than action shots to build trust in actor representations.",
              status: "Tactical Shift"
            });
          }
        }

        if (theme.name === "Visuals") {
          if (theme.positive >= theme.negative) {
            directives.push({
              title: "Scale Cinematic Promo Cuts",
              strategy: "Feature high-definition scenery, Colosseum wide angles, and battlefield set pieces prominently in global ad templates.",
              status: "Recommended"
            });
          } else {
            directives.push({
              title: "Behind-The-Scenes Visual Sincerity",
              strategy: "Publish featurette videos highlighting physical sets, colosseum builds, and raw choreography to counter CGI-heavy criticisms.",
              status: "Critical Adjustment"
            });
          }
        }

        if (theme.name === "Soundtrack") {
          if (theme.positive >= theme.negative) {
            directives.push({
              title: "Publish Soundtrack Theme Reels",
              strategy: "Release the orchestral score on social channels early. High positive association can drive background hype.",
              status: "Recommended"
            });
          } else {
            directives.push({
              title: "Soundtrack Re-pitching",
              strategy: "Minimize focus on debated tracks in upcoming trailer cuts. Use neutral orchestral scoring in short-form ads.",
              status: "Critical Adjustment"
            });
          }
        }

        if (theme.name === "Story") {
          directives.push({
            title: "Explain Campaign Lore & Context",
            strategy: "Release short-form character motivation logs to clarify plot continuities. Helps transition original Gladiator fans.",
            status: "Nurturing"
          });
        }
      }
    });

    // Fallback if themes match but no custom logic exists
    if (directives.length === 0) {
      directives.push({
        title: "Broad Audience Engagement",
        strategy: "Focus messaging on general trailer hype and engagement while specific theme signals stabilize.",
        status: "Recommended"
      });
    }

    return directives;
  };

  const directives = generateDirectives(themeStats);

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-amber-500" />
        <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-300">
          Marketing Strategy Directives
        </h2>
      </div>

      <div className="space-y-3">
        {directives.map((dir, idx) => (
          <div
            key={idx}
            className="p-3 bg-zinc-900/50 border border-zinc-850 rounded-lg hover:border-zinc-800 transition flex items-start gap-3"
          >
            <div className="p-1 rounded bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
              <Target className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-200">{dir.title}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                  dir.status === "Critical Adjustment" 
                    ? "bg-rose-500/15 text-rose-400 border border-rose-500/20" 
                    : dir.status === "Recommended"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                }`}>
                  {dir.status}
                </span>
              </div>
              <p className="text-xs text-zinc-450 leading-relaxed font-sans">{dir.strategy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
