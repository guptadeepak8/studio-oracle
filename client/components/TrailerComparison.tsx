"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, ArrowRight, Play, Film, Sparkles } from "lucide-react";
import { Movie } from "../utils/types";
import { ThemeItem } from "../utils/analytics";

interface TrailerComparisonProps {
  campaign: Movie;
  themeStats: ThemeItem[];
}

export default function TrailerComparison({ campaign, themeStats }: TrailerComparisonProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-3 font-sans">
      {/* Section Header with Chevron matching ClickHouse Cloud */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm font-bold text-zinc-100 hover:text-[#e6fc4f] transition cursor-pointer select-none"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-zinc-400" />
        )}
        <span>What Changed: Trailer 1 Drop vs. Trailer 2 Drop</span>
      </button>

      <p className="text-xs text-zinc-500">
        Audience sentiment shift and topic inflection measured between initial teaser and official trailer drops.
      </p>

      {isOpen && (
        <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-5 space-y-4 shadow-xs">
          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trailer 1 Card */}
            <div className="bg-[#161618] border border-[#28282b] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-[#242428] flex items-center justify-center text-zinc-400">
                    <Film className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-xs text-zinc-200 uppercase tracking-wider">
                    Teaser / Trailer #1 Drop
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-zinc-300 bg-[#242428] px-2 py-0.5 rounded">
                  Baseline Launch
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Net Audience Excitement:</span>
                  <span className="font-mono text-zinc-200 font-semibold">+38% Positive</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Primary Highlight:</span>
                  <span className="text-zinc-200 font-medium">Arena Scale & Colosseum VFX</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Top Friction:</span>
                  <span className="text-rose-400 font-medium">Casting skepticism & soundtrack choice</span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 italic border-l-2 border-zinc-600 pl-2.5 leading-relaxed pt-1">
                "Looks visually huge, but wondering if the dramatic tone will match the original masterwork."
              </p>
            </div>

            {/* Trailer 2 Card */}
            <div className="bg-[#161618] border border-[#28282b] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-[#183424] flex items-center justify-center text-[#4ade80]">
                    <Play className="h-3.5 w-3.5 fill-[#4ade80]" />
                  </div>
                  <span className="font-bold text-xs text-zinc-100 uppercase tracking-wider">
                    Official Trailer #2 Drop
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-[#4ade80] bg-[#183424] border border-[#234e35] px-2 py-0.5 rounded flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +26% Surge
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Net Audience Excitement:</span>
                  <span className="font-mono text-[#4ade80] font-bold">+64% Positive</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Primary Highlight:</span>
                  <span className="text-zinc-100 font-medium">Gladiatorial combat & character dialogue</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Friction Shift:</span>
                  <span className="text-[#4ade80] font-medium">Casting criticism dropped by 42%</span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-300 italic border-l-2 border-[#4ade80]/60 pl-2.5 leading-relaxed pt-1">
                "Trailer 2 completely sold me. The dialogue scenes and arena pacing look phenomenal."
              </p>
            </div>
          </div>

          {/* Bottom Delta Takeaway Banner */}
          <div className="bg-[#161618] border border-[#28282b] rounded-lg p-3.5 flex items-center gap-3 text-xs">
            <div className="h-6 w-6 rounded bg-[#242428] flex items-center justify-center text-[#e6fc4f] shrink-0">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 text-zinc-300 font-sans leading-relaxed">
              <strong className="text-zinc-100">Key Campaign Inflection:</strong> Releasing extended character dialogue in Trailer 2 successfully mitigated initial casting doubts, increasing positive sentiment velocity from +38% to +64%.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
