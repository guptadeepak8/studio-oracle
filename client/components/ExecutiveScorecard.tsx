"use client";

import React from "react";
import { Sparkles, TrendingUp, Users, Heart, Hash } from "lucide-react";
import { SentimentStats } from "../utils/analytics";

interface ExecutiveScorecardProps {
  sentiment: SentimentStats;
  totalComments: number;
  dominantTopic: string;
  pulseSummary: string;
  releaseDate?: string | null;
  campaignTitle: string;
}

export default function ExecutiveScorecard({
  sentiment,
  totalComments,
  dominantTopic,
  pulseSummary,
}: ExecutiveScorecardProps) {
  const pos = sentiment.posPercent || 0;
  const neg = sentiment.negPercent || 0;
  const neu = sentiment.neutral ? Math.round((sentiment.neutral / Math.max(1, totalComments)) * 100) : Math.max(0, 100 - pos - neg);
  const audienceScore = Math.min(100, Math.max(-100, pos - neg));
  const isScorePositive = audienceScore >= 0;

  return (
    <div className="space-y-3 font-sans">
      {/* 4-Metric High-Density Command Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Net Sentiment */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 space-y-1 backdrop-blur-xs hover:border-zinc-700/80 transition">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Net Sentiment</span>
            <Heart className="h-3 w-3 text-zinc-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-bold font-mono tracking-tight ${isScorePositive ? "text-emerald-400" : "text-rose-400"}`}>
              {audienceScore > 0 ? `+${audienceScore}` : audienceScore}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">/ 100</span>
          </div>
          <div className="text-[10px] text-zinc-500 font-medium">
            {audienceScore >= 25 ? "High Resonance" : audienceScore >= 0 ? "Positive Buzz" : "Critical Drag"}
          </div>
        </div>

        {/* Metric 2: Comments Tracked */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 space-y-1 backdrop-blur-xs hover:border-zinc-700/80 transition">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Verified Reactions</span>
            <Users className="h-3 w-3 text-zinc-600" />
          </div>
          <div className="text-xl font-bold text-zinc-100 font-mono tracking-tight">
            {totalComments.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500">
            YouTube & Press Indexed
          </div>
        </div>

        {/* Metric 3: Polarity Breakdown */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 space-y-1.5 backdrop-blur-xs hover:border-zinc-700/80 transition">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Polarity Split</span>
            <TrendingUp className="h-3 w-3 text-zinc-600" />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono font-medium">
            <span className="text-emerald-400">+{pos}%</span>
            <span className="text-zinc-500">{neu}%</span>
            <span className="text-rose-400">-{neg}%</span>
          </div>
          <div className="w-full bg-zinc-800/80 h-1 rounded-full overflow-hidden flex">
            <div className="bg-emerald-400 h-full" style={{ width: `${pos}%` }} />
            <div className="bg-zinc-600 h-full" style={{ width: `${neu}%` }} />
            <div className="bg-rose-500 h-full" style={{ width: `${neg}%` }} />
          </div>
        </div>

        {/* Metric 4: Key Theme Focus */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 space-y-1 backdrop-blur-xs hover:border-zinc-700/80 transition">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Dominant Discussion</span>
            <Hash className="h-3 w-3 text-zinc-600" />
          </div>
          <div className="text-sm font-semibold text-zinc-200 truncate pt-0.5">
            {dominantTopic || "General Tone"}
          </div>
          <div className="text-[10px] text-zinc-500">
            Primary conversation driver
          </div>
        </div>
      </div>

      {/* Crisp Single-Line Takeaway Ribbon (Only if present and meaningful) */}
      {pulseSummary && (
        <div className="rounded-lg border border-zinc-800/70 bg-zinc-950/40 px-3.5 py-2 flex items-center gap-2 text-xs text-zinc-300">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          <span className="truncate">{pulseSummary}</span>
        </div>
      )}
    </div>
  );
}
