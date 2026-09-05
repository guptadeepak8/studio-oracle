"use client";

import React from "react";
import { Users, Newspaper, Search, Loader2 } from "lucide-react";
import { Card, Badge, Button } from "./ui";
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
  onTriggerSearch?: () => void;
  isSearching?: boolean;
}

function decodeHtml(html: string) {
  if (!html) return "";
  return html
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export default function PlatformComparison({
  platforms = {},
  dominantTopic,
  onTriggerSearch,
  isSearching = false,
}: PlatformComparisonProps) {
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
      divergenceInsight = `Critics and press reception (+${critics.posPercent}% positive) are more favorable than audience sentiment (+${audience.posPercent}%).`;
    } else if (diff <= -15) {
      divergenceInsight = `Audience excitement (+${audience.posPercent}% positive) is outperforming critic reviews (+${critics.posPercent}%).`;
    } else {
      divergenceInsight = `Audience sentiment (+${audience.posPercent}%) and critic reviews (+${critics.posPercent}%) are broadly aligned.`;
    }
  }

  const audienceQuote = decodeHtml(audience.topPositive || audience.topNegative);
  const criticQuote = decodeHtml(critics.topPositive || critics.topNegative);

  return (
    <CollapsibleSection
      title="Audience vs. Critics"
      subtitle="Comparing social comments against press reviews."
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
                  Audience Feedback
                </span>
              </div>
              <Badge variant={hasAudience && audience.posPercent >= 50 ? "positive" : "default"}>
                {hasAudience ? (audience.posPercent >= 50 ? "Positive" : "Mixed") : "No Data"}
              </Badge>
            </div>

            {hasAudience && audienceQuote ? (
              <p className="text-sm text-zinc-200 leading-relaxed italic border-l-2 border-[#4ade80] pl-3 py-1 line-clamp-3">
                &ldquo;{audienceQuote}&rdquo;
              </p>
            ) : (
              <p className="text-sm text-zinc-500 italic py-2">
                No audience comments indexed yet.
              </p>
            )}

            <div className="pt-3 border-t border-[#28282b] flex items-center justify-between text-xs text-zinc-400">
              <span>{audience.total.toLocaleString()} Comments</span>
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
                {hasCritics ? "Reviews Found" : "Not Searched"}
              </Badge>
            </div>

            {hasCritics && criticQuote ? (
              <p className="text-sm text-zinc-200 leading-relaxed italic border-l-2 border-[#38bdf8] pl-3 py-1 line-clamp-3">
                &ldquo;{criticQuote}&rdquo;
              </p>
            ) : (
              <div className="py-1 space-y-2">
                <p className="text-xs text-zinc-400">
                  No critic reviews indexed yet for this campaign.
                </p>
                {onTriggerSearch && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onTriggerSearch}
                    isLoading={isSearching}
                    leftIcon={<Search className="h-3.5 w-3.5 text-zinc-400" />}
                  >
                    {isSearching ? "Searching Web..." : "Search Critic Reviews"}
                  </Button>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-[#28282b] flex items-center justify-between text-xs text-zinc-400">
              <span>{critics.total.toLocaleString()} Articles</span>
              <span className="text-[#38bdf8] font-mono font-bold text-sm">
                {hasCritics ? `+${critics.posPercent}% Positive` : "0%"}
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
