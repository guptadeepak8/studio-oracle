"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { Comment } from "../utils/types";

interface AudiencePulseProps {
  comments: Comment[];
  sentiment: {
    positive: number;
    negative: number;
    posPercent: number;
    negPercent: number;
  };
  pulseSummary: string;
  dominantTopic: string;
}

export default function AudiencePulse({
  comments,
  sentiment,
  pulseSummary,
  dominantTopic,
}: AudiencePulseProps) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-amber-500" />
        <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-300">Audience Pulse</h2>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 text-sm leading-relaxed text-zinc-200">
        {pulseSummary}
      </div>

      <div className="grid grid-cols-4 gap-3 text-center">
        <div className="bg-zinc-900/20 border border-zinc-850 p-3 rounded-lg">
          <span className="text-xs text-zinc-500 uppercase tracking-widest block font-medium mb-1">
            Evidence Collected
          </span>
          <span className="text-lg font-bold text-zinc-200">{comments.length} comments</span>
        </div>
        <div className="bg-zinc-900/20 border border-zinc-850 p-3 rounded-lg">
          <span className="text-xs text-zinc-500 uppercase tracking-widest block font-medium mb-1">
            Platform Channels
          </span>
          <span className="text-lg font-bold text-zinc-200">YouTube</span>
        </div>
        <div className="bg-zinc-900/20 border border-zinc-850 p-3 rounded-lg">
          <span className="text-xs text-zinc-500 uppercase tracking-widest block font-medium mb-1">
            Positive Ratio
          </span>
          <span className="text-lg font-bold text-emerald-500">{sentiment.posPercent}%</span>
        </div>
        <div className="bg-zinc-900/20 border border-zinc-850 p-3 rounded-lg">
          <span className="text-xs text-zinc-500 uppercase tracking-widest block font-medium mb-1">
            Dominant Topic
          </span>
          <span className="text-lg font-bold text-amber-500 truncate block">{dominantTopic}</span>
        </div>
      </div>

      {comments.length > 0 && (
        <div className="py-2.5 border-t border-zinc-900/50 flex items-center justify-between gap-4 text-sm font-medium">
          <div className="flex-1 max-w-lg h-3 rounded-full overflow-hidden bg-zinc-800 flex">
            <div
              className="bg-emerald-600 h-full animate-pulse"
              style={{ width: `${sentiment.posPercent}%` }}
              title="Positive"
            />
            <div
              className="bg-zinc-700 h-full"
              style={{ width: `${100 - sentiment.posPercent - sentiment.negPercent}%` }}
              title="Neutral"
            />
            <div
              className="bg-rose-600 h-full"
              style={{ width: `${sentiment.negPercent}%` }}
              title="Negative"
            />
          </div>
          <div className="flex gap-3 text-zinc-500 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 bg-emerald-600 rounded-full" /> {sentiment.positive} Positive
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 bg-zinc-700 rounded-full" />{" "}
              {comments.length - sentiment.positive - sentiment.negative} Neutral
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 bg-rose-600 rounded-full" /> {sentiment.negative} Negative
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
