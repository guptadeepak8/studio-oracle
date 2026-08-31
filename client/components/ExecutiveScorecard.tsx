"use client";

import React from "react";
import { TrendingUp, AlertTriangle, MessageSquare, Zap, Activity } from "lucide-react";
import { SentimentStats } from "../utils/analytics";

interface ExecutiveScorecardProps {
  sentiment: SentimentStats;
  totalComments: number;
  dominantTopic: string;
  pulseSummary: string;
}

export default function ExecutiveScorecard({
  sentiment,
  totalComments,
  dominantTopic,
  pulseSummary,
}: ExecutiveScorecardProps) {
  // Score from -100 to +100 based on positive and negative percentages
  const audienceScore = Math.min(100, Math.max(-100, sentiment.posPercent - sentiment.negPercent));
  const isScorePositive = audienceScore >= 0;

  return (
    <div className="space-y-4 font-sans">
      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Overall Audience Score */}
        <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-5 space-y-2 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Overall Audience Score</span>
            <Activity className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono ${isScorePositive ? "text-emerald-400" : "text-rose-400"}`}>
              {audienceScore > 0 ? `+${audienceScore}` : audienceScore}
            </span>
            <span className="text-xs text-zinc-400 font-semibold">/ 100</span>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
              audienceScore >= 30
                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                : audienceScore >= 0
                ? "bg-amber-950/60 text-amber-400 border border-amber-500/30"
                : "bg-rose-950/60 text-rose-400 border border-rose-500/30"
            }`}>
              {audienceScore >= 30 ? "High Excitement" : audienceScore >= 0 ? "Moderate" : "Needs Attention"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 pt-1">
            {sentiment.posPercent}% positive vs {sentiment.negPercent}% critical reactions
          </p>
        </div>

        {/* Card 2: Comments Tracked & Speed */}
        <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-5 space-y-2 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Audience Reactions</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-100 font-mono">
              {totalComments}
            </span>
            <span className="text-xs text-zinc-400">analyzed</span>
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-500/30">
              Live Stream
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 pt-1">
            Across YouTube comments and Reddit discussions
          </p>
        </div>

        {/* Card 3: Top Warning / Discussion */}
        <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-5 space-y-2 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Main Topic of Discussion</span>
            {sentiment.negPercent >= 20 ? (
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            ) : (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-100 capitalize truncate max-w-[180px]">
              {dominantTopic || "General Tone"}
            </span>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
              sentiment.negPercent >= 20
                ? "bg-rose-950/60 text-rose-400 border border-rose-500/30"
                : "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
            }`}>
              {sentiment.negPercent >= 20 ? "Watch Topic" : "Positive Driver"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 pt-1">
            {sentiment.negPercent >= 20 ? "Showing friction in audience comments" : "Driving high audience excitement"}
          </p>
        </div>
      </div>

      {/* Clean AI Executive Summary Banner */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4.5 flex items-start gap-3.5 shadow-sm">
        <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            Executive Summary
          </span>
          <p className="text-sm text-zinc-200 leading-relaxed font-medium">
            {pulseSummary}
          </p>
        </div>
      </div>
    </div>
  );
}
