"use client";

import React from "react";
import { Sparkles, TrendingUp, Users, Heart } from "lucide-react";
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
  releaseDate,
  campaignTitle,
}: ExecutiveScorecardProps) {
  const pos = sentiment.posPercent || 0;
  const neg = sentiment.negPercent || 0;
  const neu = sentiment.neutral ? Math.round((sentiment.neutral / Math.max(1, totalComments)) * 100) : Math.max(0, 100 - pos - neg);
  const audienceScore = Math.min(100, Math.max(-100, pos - neg));
  const isScorePositive = audienceScore >= 0;

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Hero Summary Banner */}
      <div className="relative rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm shadow-xs overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700/30 to-transparent" />
        <div className="flex items-start gap-3.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
              Audience Overview
            </span>
            <p className="text-sm sm:text-base font-medium text-zinc-100 leading-relaxed">
              {totalComments === 0
                ? "Awaiting audience reactions from video drops. Sync trailer reactions or add a video drop to populate metrics."
                : pulseSummary || `Audience is responding actively to ${campaignTitle}, with discussion focused on #${dominantTopic}.`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. 3 High-Density Linear-Style Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Net Audience Sentiment */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4.5 space-y-2 hover:border-zinc-700/80 transition backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Audience Sentiment Score
            </span>
            <Heart className="h-3.5 w-3.5 text-zinc-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tracking-tight ${isScorePositive ? "text-emerald-400" : "text-rose-400"}`}>
              {audienceScore > 0 ? `+${audienceScore}` : audienceScore}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              / 100 ({audienceScore >= 25 ? "High Excitement" : audienceScore >= 0 ? "Moderate Buzz" : "Friction Points"})
            </span>
          </div>
        </div>

        {/* Card 2: Total Indexed Reactions */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4.5 space-y-2 hover:border-zinc-700/80 transition backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Total Reactions Analyzed
            </span>
            <Users className="h-3.5 w-3.5 text-zinc-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-100 font-mono tracking-tight">
              {totalComments.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              audience comments & reviews
            </span>
          </div>
        </div>

        {/* Card 3: Polarity Split */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4.5 space-y-2.5 hover:border-zinc-700/80 transition backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Sentiment Distribution
            </span>
            <TrendingUp className="h-3.5 w-3.5 text-zinc-500" />
          </div>
          <div className="flex items-center justify-between text-xs font-mono font-semibold">
            <span className="text-emerald-400">+{pos}% Positive</span>
            <span className="text-zinc-400">{neu}% Neutral</span>
            <span className="text-rose-400">-{neg}% Critical</span>
          </div>
          <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden flex">
            <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${pos}%` }} />
            <div className="bg-zinc-600 h-full transition-all duration-300" style={{ width: `${neu}%` }} />
            <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${neg}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
