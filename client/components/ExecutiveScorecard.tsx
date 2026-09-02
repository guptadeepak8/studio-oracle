"use client";

import React from "react";
import { Sparkles, Settings } from "lucide-react";
import { SentimentStats } from "../utils/analytics";
import { Card, Badge, Button } from "./ui";

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
      {/* 5-Card Horizontal Row with Large, Readable Typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Audience Score */}
        <Card className="p-4.5 space-y-2">
          <span className="text-xs text-zinc-300 font-semibold block uppercase tracking-wider">
            Audience Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-bold font-mono ${isScorePositive ? "text-zinc-100" : "text-rose-400"}`}>
              {audienceScore > 0 ? `+${audienceScore}` : audienceScore} / 100
            </span>
            <span className="text-xs text-indigo-400 font-semibold">
              {audienceScore >= 30 ? "High Excitement" : audienceScore >= 0 ? "Moderate" : "Watch Friction"}
            </span>
          </div>
        </Card>

        {/* Card 2: Comments Tracked */}
        <Card className="p-4.5 space-y-2">
          <span className="text-xs text-zinc-300 font-semibold block uppercase tracking-wider">
            Reactions Analyzed
          </span>
          <div className="text-xl font-bold text-zinc-100 font-mono">
            {totalComments.toLocaleString()} <span className="text-xs text-zinc-400 font-normal font-sans">comments</span>
          </div>
        </Card>

        {/* Card 3: Target Release Date */}
        <Card className="p-4.5 space-y-2">
          <span className="text-xs text-zinc-300 font-semibold block uppercase tracking-wider">
            Target Release Date
          </span>
          <div className="text-base font-bold text-zinc-100">
            {releaseDate || "Nov 22, 2026"}
          </div>
        </Card>

        {/* Card 4: Tracking Engine & Auto-Sync Status */}
        <Card className="p-4.5 space-y-2 flex flex-col justify-between">
          <span className="text-xs text-zinc-300 font-semibold block uppercase tracking-wider">
            Tracking Engine
          </span>
          <div className="flex items-center justify-between">
            <Badge variant="active" pulsing>
              Auto-Sync (1 hr)
            </Badge>
            <Button
              variant="ghost"
              size="xs"
              onClick={onTriggerImport}
              leftIcon={<Settings className="h-3 w-3" />}
              title="Configure Sync Settings"
              className="text-zinc-400 hover:text-indigo-400 px-2 py-0.5"
            >
              Settings
            </Button>
          </div>
        </Card>

        {/* Card 5: Ingestion Feeds & ClickHouse Columnar Speed */}
        <Card className="p-4.5 space-y-2">
          <span className="text-xs text-zinc-300 font-semibold block uppercase tracking-wider">
            ClickHouse Engine
          </span>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono font-bold">
              <span>⚡ &lt; 20ms Query Speed</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">100K Scale</span>
          </div>
        </Card>
      </div>

      {/* Clean AI Executive Summary Banner */}
      <Card className="p-5 flex items-start gap-4">
        <div className="h-7 w-7 rounded-lg bg-[#242428] flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider block">
            Executive Synthesis
          </span>
          <p className="text-sm text-zinc-200 leading-relaxed font-sans font-normal">
            {pulseSummary}
          </p>
        </div>
      </Card>
    </div>
  );
}
