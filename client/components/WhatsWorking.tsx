"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, ThumbsUp, ThumbsDown } from "lucide-react";
import { ThemeItem } from "../utils/analytics";

interface WhatsWorkingProps {
  themeStats: ThemeItem[];
}

export default function WhatsWorking({ themeStats }: WhatsWorkingProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Group top drivers and complaints
  const sortedThemes = [...themeStats]
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div className="space-y-3 font-sans">
      {/* Section Header with Chevron matching screenshot `⌄ Credits` */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm font-bold text-zinc-100 hover:text-[#e6fc4f] transition cursor-pointer select-none"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-zinc-400" />
        )}
        <span>What Fans Love vs. What Fans Criticize</span>
      </button>

      {isOpen && (
        <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl overflow-hidden shadow-xs">
          {/* Table Header matching screenshot */}
          <div className="grid grid-cols-12 px-5 py-3 border-b border-[#28282b] text-[11px] font-semibold text-zinc-400 bg-[#17171a]">
            <div className="col-span-3">Topic Aspect</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Positive Resonance</div>
            <div className="col-span-2">Critical Drag</div>
            <div className="col-span-1 text-right">Volume</div>
          </div>

          {/* Table Rows */}
          {sortedThemes.length === 0 ? (
            <div className="p-6 text-xs text-zinc-500 italic text-center">
              Awaiting audience feedback comments to rank topics.
            </div>
          ) : (
            <div className="divide-y divide-[#28282b]/60 text-xs">
              {sortedThemes.map((theme) => {
                const pos = theme.posPercent || 0;
                const neg = theme.negPercent || 0;
                const isFavorable = pos >= 50;

                return (
                  <div
                    key={theme.name}
                    className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-[#222226] transition font-medium text-zinc-300"
                  >
                    <div className="col-span-3 font-bold text-zinc-100 capitalize">
                      {theme.name}
                    </div>

                    <div className="col-span-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isFavorable
                          ? "bg-[#183424] text-[#4ade80] border border-[#234e35]"
                          : "bg-[#331b20] text-[#f87171] border border-[#4c242a]"
                      }`}>
                        {isFavorable ? "Positive Driver" : "Watch Friction"}
                      </span>
                    </div>

                    <div className="col-span-2 text-zinc-400 text-xs">
                      {isFavorable ? "Audience Highlight" : "Community Concern"}
                    </div>

                    <div className="col-span-2 flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold w-9">{pos}%</span>
                      <div className="w-20 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#4ade80] h-full rounded-full"
                          style={{ width: `${pos}%` }}
                        />
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center gap-2">
                      <span className="font-mono text-rose-400 font-bold w-9">{neg}%</span>
                      <div className="w-20 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#f87171] h-full rounded-full"
                          style={{ width: `${neg}%` }}
                        />
                      </div>
                    </div>

                    <div className="col-span-1 text-right font-mono text-zinc-200 font-bold">
                      {theme.count}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
