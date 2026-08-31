"use client";

import React from "react";
import { Plus, CheckCircle2, MessageSquare, Sparkles } from "lucide-react";
import { SentimentStats } from "../utils/analytics";

interface ExecutiveScorecardProps {
  sentiment: SentimentStats;
  totalComments: number;
  dominantTopic: string;
  pulseSummary: string;
  releaseDate?: string | null;
  campaignTitle: string;
  onTriggerImport?: () => void;
}

export default function ExecutiveScorecard({
  sentiment,
  totalComments,
  dominantTopic,
  pulseSummary,
  releaseDate,
  campaignTitle,
  onTriggerImport,
}: ExecutiveScorecardProps) {
  const audienceScore = Math.min(100, Math.max(-100, (sentiment.posPercent || 0) - (sentiment.negPercent || 0)));
  const isScorePositive = audienceScore >= 0;

  return (
    <div className="space-y-4 font-sans">
      {/* Exact 5-Card Horizontal Row matching the screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Plan / Score */}
        <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-4 space-y-1.5 shadow-xs">
          <span className="text-[11px] text-zinc-400 font-medium block">
            Audience Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-base font-bold font-mono ${isScorePositive ? "text-zinc-100" : "text-rose-400"}`}>
              {audienceScore > 0 ? `+${audienceScore}` : audienceScore} / 100
            </span>
            <span className="text-[11px] text-[#e6fc4f] hover:underline cursor-pointer font-medium">
              {audienceScore >= 30 ? "High Excitement" : audienceScore >= 0 ? "Moderate" : "Watch Friction"}
            </span>
          </div>
        </div>

        {/* Card 2: Comments Tracked */}
        <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-4 space-y-1.5 shadow-xs">
          <span className="text-[11px] text-zinc-400 font-medium block">
            Reactions Analyzed
          </span>
          <div className="text-base font-bold text-zinc-100 font-mono">
            {totalComments} <span className="text-xs text-zinc-400 font-normal font-sans">comments</span>
          </div>
        </div>

        {/* Card 3: Target Release Date */}
        <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-4 space-y-1.5 shadow-xs">
          <span className="text-[11px] text-zinc-400 font-medium block">
            Target Release Date
          </span>
          <div className="text-base font-bold text-zinc-100">
            {releaseDate || "Nov 22, 2026"}
          </div>
        </div>

        {/* Card 4: Action Button with Lime/Yellow styling matching screenshot */}
        <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-4 space-y-1.5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] text-zinc-400 font-medium block">
            Telemetry Action
          </span>
          <button
            onClick={onTriggerImport}
            className="w-full flex items-center justify-center gap-1.5 bg-[#e6fc4f] hover:bg-[#d8ed47] text-black font-bold text-xs py-1.5 px-3 rounded-md transition cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>Import Comments</span>
          </button>
        </div>

        {/* Card 5: Ingestion Feeds */}
        <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-4 space-y-1.5 shadow-xs">
          <span className="text-[11px] text-zinc-400 font-medium block">
            Telemetry Channels
          </span>
          <div className="flex items-center gap-1.5 text-xs text-zinc-100 font-medium truncate">
            <span className="h-2 w-2 rounded-full bg-[#4ade80]" />
            <span>YouTube & Reddit</span>
          </div>
        </div>
      </div>

      {/* Clean AI Executive Summary Banner */}
      <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-4.5 flex items-start gap-3.5 shadow-xs">
        <div className="h-6 w-6 rounded-md bg-[#242428] flex items-center justify-center text-[#e6fc4f] shrink-0 mt-0.5">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
            Executive Synthesis
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans font-medium">
            {pulseSummary}
          </p>
        </div>
      </div>
    </div>
  );
}
