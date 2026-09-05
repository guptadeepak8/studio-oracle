"use client";

import React from "react";
import { Users, Newspaper, Loader2, Sparkles } from "lucide-react";

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
  let spreadBadge = "";
  if (hasAudience && hasCritics) {
    if (diff >= 15) {
      spreadBadge = `+${diff}% Critic Lead`;
    } else if (diff <= -15) {
      spreadBadge = `+${Math.abs(diff)}% Fan Lead`;
    } else {
      spreadBadge = "Consensus Aligned";
    }
  }

  const audienceQuote = decodeHtml(audience.topPositive || audience.topNegative);
  const criticQuote = decodeHtml(critics.topPositive || critics.topNegative);

  return (
    <div className="space-y-2.5 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
            Audience vs. Critics
          </span>
          <span className="text-[11px] text-zinc-500">
            (YouTube comments vs. Variety / Deadline / Forbes)
          </span>
        </div>
        {spreadBadge && (
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
            {spreadBadge}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left: Audience Social Voice Card */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 space-y-2.5 backdrop-blur-xs hover:border-zinc-700/80 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              <span>Social Comments</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-emerald-400 font-bold">
                {hasAudience ? `+${audience.posPercent}%` : "0%"}
              </span>
              <span className="text-zinc-500">
                ({audience.total.toLocaleString()} comments)
              </span>
            </div>
          </div>

          {hasAudience && audienceQuote ? (
            <p className="text-xs text-zinc-300 italic border-l-2 border-emerald-500/80 pl-2.5 py-0.5 line-clamp-2 leading-relaxed">
              &ldquo;{audienceQuote}&rdquo;
            </p>
          ) : (
            <p className="text-xs text-zinc-500 italic py-0.5">
              Awaiting audience comments...
            </p>
          )}
        </div>

        {/* Right: Critic & Press Reviews Card */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 space-y-2.5 backdrop-blur-xs hover:border-zinc-700/80 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
              <Newspaper className="h-3.5 w-3.5 text-sky-400" />
              <span>Critic & Press</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-sky-400 font-bold">
                {hasCritics ? `+${critics.posPercent}%` : "..."}
              </span>
              <span className="text-zinc-500">
                ({critics.total.toLocaleString()} reviews)
              </span>
            </div>
          </div>

          {hasCritics && criticQuote ? (
            <p className="text-xs text-zinc-300 italic border-l-2 border-sky-500/80 pl-2.5 py-0.5 line-clamp-2 leading-relaxed">
              &ldquo;{criticQuote}&rdquo;
            </p>
          ) : (
            <div className="py-0.5 flex items-center gap-2 text-xs text-zinc-500">
              <Loader2 className="h-3 w-3 text-sky-400 animate-spin shrink-0" />
              <span>Indexing press reviews...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
