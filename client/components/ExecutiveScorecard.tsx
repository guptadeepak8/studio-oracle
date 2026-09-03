"use client";

import React from "react";
import { Sparkles, TrendingUp, Users, Heart } from "lucide-react";
import { SentimentStats } from "../utils/analytics";
import { Card, Badge } from "./ui";

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
      {/* 1. Hero Executive Insight Banner */}
      <Card className="p-6 bg-[#161619] border-[#28282c] flex items-start gap-4 shadow-sm">
        <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Campaign Pulse
            </span>
            <Badge variant="active">
              Live Synthesis
            </Badge>
          </div>
          <p className="text-base sm:text-lg font-semibold text-zinc-100 leading-snug">
            {pulseSummary || `Audience is responding actively to ${campaignTitle}, with strong buzz around #${dominantTopic}.`}
          </p>
        </div>
      </Card>

      {/* 2. 3 Simple Key Executive Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Audience Health Score */}
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            <span>Audience Health</span>
            <Heart className="h-4 w-4 text-rose-400/80" />
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className={`text-2xl font-bold font-mono ${isScorePositive ? "text-[#4ade80]" : "text-rose-400"}`}>
              {audienceScore > 0 ? `+${audienceScore}` : audienceScore}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              / 100 ({audienceScore >= 25 ? "Strong Excitement" : audienceScore >= 0 ? "Moderate Buzz" : "Watch Friction"})
            </span>
          </div>
        </Card>

        {/* Card 2: Reactions Analyzed */}
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            <span>Reactions Analyzed</span>
            <Users className="h-4 w-4 text-indigo-400/80" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-100 font-mono">
              {totalComments.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              audience comments & reviews
            </span>
          </div>
        </Card>

        {/* Card 3: Sentiment Breakdown */}
        <Card className="p-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            <span>Sentiment Breakdown</span>
            <TrendingUp className="h-4 w-4 text-[#4ade80]/80" />
          </div>
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-[#4ade80]">+{pos}% Positive</span>
            <span className="text-zinc-400">{neu}% Neutral</span>
            <span className="text-rose-400">-{neg}% Critical</span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden flex">
            <div className="bg-[#4ade80] h-full" style={{ width: `${pos}%` }} />
            <div className="bg-zinc-600 h-full" style={{ width: `${neu}%` }} />
            <div className="bg-rose-500 h-full" style={{ width: `${neg}%` }} />
          </div>
        </Card>
      </div>
    </div>
  );
}
