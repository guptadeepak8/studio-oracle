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
  dominantTopic,
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
  let spreadBadge = "";
  if (hasAudience && hasCritics) {
    if (diff >= 15) {
      spreadBadge = `+${diff}% Critic Lead`;
      divergenceInsight = `Trade reviews and critics (+${critics.posPercent}% positive) lead fan reception (+${audience.posPercent}%), with industry praise focused on production quality.`;
    } else if (diff <= -15) {
      spreadBadge = `+${Math.abs(diff)}% Fan Lead`;
      divergenceInsight = `Audience enthusiasm (+${audience.posPercent}% positive) is outperforming trade critics (+${critics.posPercent}%), driven by viral social buzz.`;
    } else {
      spreadBadge = "Aligned Consensus";
      divergenceInsight = `Audience sentiment (+${audience.posPercent}%) and trade reviews (+${critics.posPercent}%) are closely aligned.`;
    }
  }

  const audienceQuote = decodeHtml(audience.topPositive || audience.topNegative);
  const criticQuote = decodeHtml(critics.topPositive || critics.topNegative);

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
            Audience vs. Critics
          </h3>
          <p className="text-xs text-zinc-400">
            Comparing social trailer comments against trade press & critic reviews.
          </p>
        </div>
        {spreadBadge && (
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-200">
            {spreadBadge}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Left: Audience Social Voice Card */}
        <div className="relative rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 space-y-3.5 backdrop-blur-sm overflow-hidden hover:border-zinc-700/80 transition">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Users className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Social Audience Voice
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {hasAudience ? `+${audience.posPercent}% Positive` : "0%"}
            </span>
          </div>

          {hasAudience && audienceQuote ? (
            <p className="text-xs text-zinc-300 leading-relaxed italic border-l-2 border-emerald-500/60 pl-3 py-1 line-clamp-3">
              &ldquo;{audienceQuote}&rdquo;
            </p>
          ) : (
            <p className="text-xs text-zinc-500 italic py-1.5">
              Awaiting audience comments...
            </p>
          )}

          <div className="pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>{audience.total.toLocaleString()} Comments Analyzed</span>
            <span>{audience.negPercent}% Critical</span>
          </div>
        </div>

        {/* Right: Critic & Press Reviews Card */}
        <div className="relative rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 space-y-3.5 backdrop-blur-sm overflow-hidden hover:border-zinc-700/80 transition">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Newspaper className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Critic & Trade Press
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-sky-400">
              {hasCritics ? `+${critics.posPercent}% Positive` : "..."}
            </span>
          </div>

          {hasCritics && criticQuote ? (
            <p className="text-xs text-zinc-300 leading-relaxed italic border-l-2 border-sky-500/60 pl-3 py-1 line-clamp-3">
              &ldquo;{criticQuote}&rdquo;
            </p>
          ) : (
            <div className="py-1 flex items-center gap-2 text-xs text-zinc-400">
              <Loader2 className="h-3.5 w-3.5 text-sky-400 animate-spin shrink-0" />
              <span>Fetching verified trade reviews in background...</span>
            </div>
          )}

          <div className="pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>{critics.total.toLocaleString()} Articles Grounded</span>
            <span>{hasCritics ? `${critics.negPercent}% Critical` : "..."}</span>
          </div>
        </div>
      </div>

      {/* Divergence Takeaway Banner */}
      {divergenceInsight && (
        <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-3.5 flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <p><strong className="text-zinc-100 font-semibold">Key Takeaway:</strong> {divergenceInsight}</p>
        </div>
      )}
    </div>
  );
}
