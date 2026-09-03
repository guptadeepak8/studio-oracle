"use client";

import React from "react";
import { Users, Newspaper, ArrowRight } from "lucide-react";
import { Card, Badge } from "./ui";
import CollapsibleSection from "./common/CollapsibleSection";

export interface PlatformStats {
  total: number;
  posPercent: number;
  negPercent: number;
  topPositive: string;
  topNegative: string;
}

interface PlatformComparisonProps {
  platforms?: Record<string, PlatformStats>;
  dominantTopic: string;
}

export default function PlatformComparison({ platforms = {}, dominantTopic }: PlatformComparisonProps) {
  const audience = platforms["youtube"] || {
    total: 0,
    posPercent: 0,
    negPercent: 0,
    topPositive: "",
    topNegative: "",
  };

  const critics = platforms["google_search"] || {
    total: 0,
    posPercent: 0,
    negPercent: 0,
    topPositive: "",
    topNegative: "",
  };

  const hasAudience = audience.total > 0;
  const hasCritics = critics.total > 0;

  const diff = critics.posPercent - audience.posPercent;
  let divergenceInsight = "";
  if (hasAudience && hasCritics) {
    if (diff >= 15) {
      divergenceInsight = `Trade critics and press reception (+${critics.posPercent}% positive) lead mainstream audience sentiment (+${audience.posPercent}%), with industry praise focused on production scale while fans discuss #${dominantTopic}.`;
    } else if (diff <= -15) {
      divergenceInsight = `Mainstream fan buzz (+${audience.posPercent}% positive) is outperforming trade critics (+${critics.posPercent}%), driven by viral social resonance.`;
    } else {
      divergenceInsight = `Audience enthusiasm (+${audience.posPercent}%) and trade reviews (+${critics.posPercent}%) are aligned with balanced reception across channels.`;
    }
  }

  return (
    <CollapsibleSection
      title="Audience vs. Critics"
      subtitle="Comparing social audience engagement against trade press and industry reviews."
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Audience Voice Card */}
          <Card className="p-5 space-y-3.5 bg-[#161619] border-[#28282c]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Users className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
                  Audience Sentiment
                </span>
              </div>
              <Badge variant={hasAudience && audience.posPercent >= 50 ? "positive" : "default"}>
                {hasAudience ? (audience.posPercent >= 50 ? "High Excitement" : "Mixed Reception") : "Awaiting Data"}
              </Badge>
            </div>

            {hasAudience && audience.topPositive ? (
              <p className="text-sm text-zinc-200 leading-relaxed italic border-l-2 border-[#4ade80] pl-3 py-1 line-clamp-3">
                &ldquo;{audience.topPositive}&rdquo;
              </p>
            ) : (
              <p className="text-sm text-zinc-500 italic py-2">
                Awaiting social audience comments...
              </p>
            )}

            <div className="pt-3 border-t border-[#28282b] flex items-center justify-between text-xs text-zinc-400">
              <span>{audience.total.toLocaleString()} Comments Analyzed</span>
              <span className="text-[#4ade80] font-mono font-bold text-sm">
                {hasAudience ? `+${audience.posPercent}% Positive` : "0%"}
              </span>
            </div>
          </Card>

          {/* Press & Critics Card */}
          <Card className="p-5 space-y-3.5 bg-[#161619] border-[#28282c]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Newspaper className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
                  Critic & Press Reviews
                </span>
              </div>
              <Badge variant={hasCritics ? "info" : "default"}>
                {hasCritics ? "Press & Trade" : "Awaiting Search"}
              </Badge>
            </div>

            {hasCritics && (critics.topPositive || critics.topNegative) ? (
              <p className="text-sm text-zinc-200 leading-relaxed italic border-l-2 border-[#38bdf8] pl-3 py-1 line-clamp-3">
                &ldquo;{critics.topPositive || critics.topNegative}&rdquo;
              </p>
            ) : (
              <p className="text-sm text-zinc-500 italic py-2">
                Awaiting press reviews...
              </p>
            )}

            <div className="pt-3 border-t border-[#28282b] flex items-center justify-between text-xs text-zinc-400">
              <span>{critics.total.toLocaleString()} Articles Grounded</span>
              <span className="text-[#38bdf8] font-mono font-bold text-sm">
                {hasCritics ? `+${critics.posPercent}% Sentiment` : "0%"}
              </span>
            </div>
          </Card>
        </div>

        {/* Plain-English Divergence Interpretation */}
        {divergenceInsight && (
          <div className="bg-[#141416] border border-[#242428] rounded-xl p-4 flex items-start gap-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider shrink-0 mt-0.5">
              Takeaway:
            </span>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {divergenceInsight}
            </p>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
