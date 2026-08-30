"use client";

import React from "react";
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Current audience signal
        </h3>
        <p className="text-zinc-200 text-sm leading-relaxed font-sans font-medium">
          {pulseSummary}
        </p>
      </div>

      {comments.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#1a1a1f]">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Audience Sentiment Pulse</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" /> {sentiment.posPercent}% Positive
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-zinc-600 rounded-full" />{" "}
                {100 - sentiment.posPercent - sentiment.negPercent}% Neutral
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-rose-500 rounded-full" /> {sentiment.negPercent}% Critical
              </span>
            </div>
          </div>

          <div className="w-full h-1.5 rounded-full overflow-hidden bg-zinc-800/80 flex">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${sentiment.posPercent}%` }}
              title="Positive"
            />
            <div
              className="bg-zinc-600 h-full"
              style={{ width: `${100 - sentiment.posPercent - sentiment.negPercent}%` }}
              title="Neutral"
            />
            <div
              className="bg-rose-500 h-full"
              style={{ width: `${sentiment.negPercent}%` }}
              title="Negative"
            />
          </div>
        </div>
      )}
    </div>
  );
}
