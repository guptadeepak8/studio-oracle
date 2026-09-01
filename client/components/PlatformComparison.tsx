"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Video, MessageCircle } from "lucide-react";

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
}

export default function PlatformComparison({ platforms = {}, dominantTopic }: PlatformComparisonProps) {
  const [isOpen, setIsOpen] = useState(true);

  const yt = platforms["youtube"] || {
    total: 0,
    posPercent: 0,
    negPercent: 0,
    topPositive: "",
    topNegative: "",
  };

  const reddit = platforms["reddit"] || {
    total: 0,
    posPercent: 0,
    negPercent: 0,
    topPositive: "",
    topNegative: "",
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Section Header with Chevron */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-base font-bold text-zinc-100 hover:text-[#e6fc4f] transition cursor-pointer select-none"
      >
        {isOpen ? (
          <ChevronDown className="h-4.5 w-4.5 text-zinc-400" />
        ) : (
          <ChevronRight className="h-4.5 w-4.5 text-zinc-400" />
        )}
        <span>YouTube vs. Reddit Audience Reaction</span>
      </button>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* YouTube Card */}
          <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Video className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
                  YouTube Telemetry
                </span>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                yt.posPercent >= 50
                  ? "text-[#4ade80] bg-[#183424] border border-[#234e35]"
                  : "text-zinc-300 bg-[#242428]"
              }`}>
                {yt.total > 0 ? (yt.posPercent >= 50 ? "Mostly Excited" : "Mixed Reception") : "Awaiting Data"}
              </span>
            </div>

            {yt.total > 0 && yt.topPositive ? (
              <p className="text-sm text-zinc-200 leading-relaxed italic border-l-3 border-[#4ade80]/70 pl-3.5 py-1">
                "{yt.topPositive}"
              </p>
            ) : (
              <p className="text-sm text-zinc-500 italic py-2">
                No YouTube comments tracked for this campaign yet.
              </p>
            )}

            <div className="pt-3 border-t border-[#28282b]/70 flex items-center justify-between text-xs text-zinc-300 font-medium">
              <span>{yt.total.toLocaleString()} Comments Analyzed</span>
              <span className="text-[#4ade80] font-mono font-bold text-sm">
                {yt.total > 0 ? `+${yt.posPercent}% Positive` : "0%"}
              </span>
            </div>
          </div>

          {/* Reddit Card */}
          <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
                  Reddit Discussions
                </span>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                reddit.total > 0
                  ? "text-[#f87171] bg-[#331b20] border border-[#4c242a]"
                  : "text-zinc-300 bg-[#242428]"
              }`}>
                {reddit.total > 0 ? "Community Debate" : "Awaiting Data"}
              </span>
            </div>

            {reddit.total > 0 && (reddit.topNegative || reddit.topPositive) ? (
              <p className="text-sm text-zinc-200 leading-relaxed italic border-l-3 border-[#f87171]/70 pl-3.5 py-1">
                "{reddit.topNegative || reddit.topPositive}"
              </p>
            ) : (
              <p className="text-sm text-zinc-500 italic py-2">
                No Reddit discussion comments ingested yet.
              </p>
            )}

            <div className="pt-3 border-t border-[#28282b]/70 flex items-center justify-between text-xs text-zinc-300 font-medium">
              <span>{reddit.total.toLocaleString()} Discussions Ingested</span>
              <span className="text-[#f87171] font-mono font-bold text-sm">
                {reddit.total > 0 ? `-${reddit.negPercent}% Critical` : "0%"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
