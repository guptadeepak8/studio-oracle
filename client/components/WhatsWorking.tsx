"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Filter } from "lucide-react";
import { ThemeItem } from "../utils/analytics";
import { useAppDispatch, useAppSelector } from "../store";
import { setThemeFilter, ThemeFilterType } from "../store/slices/dashboardSlice";

interface WhatsWorkingProps {
  themeStats: ThemeItem[];
}

export default function WhatsWorking({ themeStats }: WhatsWorkingProps) {
  const [isOpen, setIsOpen] = useState(true);
  const dispatch = useAppDispatch();
  const { themeFilter } = useAppSelector((state) => state.dashboard);

  // Filter themes based on Redux selection
  const filteredThemes = themeStats.filter((t) => {
    if (t.count <= 0) return false;
    const pos = t.posPercent || 0;
    if (themeFilter === "positive") return pos >= 50;
    if (themeFilter === "friction") return pos < 50;
    return true;
  });

  const sortedThemes = [...filteredThemes]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const filterOptions: { id: ThemeFilterType; label: string }[] = [
    { id: "all", label: "All Topics" },
    { id: "positive", label: "Positive Drivers" },
    { id: "friction", label: "Watch Friction" },
  ];

  return (
    <div className="space-y-3 font-sans">
      {/* Section Header with Chevron and Redux Theme Filter Pills */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-base font-bold text-zinc-100 hover:text-[#e6fc4f] transition cursor-pointer select-none"
        >
          {isOpen ? (
            <ChevronDown className="h-4.5 w-4.5 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4.5 w-4.5 text-zinc-400" />
          )}
          <span>What Fans Love vs. What Fans Criticize</span>
        </button>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#161618] border border-[#28282b] rounded-lg p-1 text-xs">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => dispatch(setThemeFilter(opt.id))}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                themeFilter === opt.id
                  ? "bg-[#242428] text-[#e6fc4f] border border-[#3b3a1a] shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isOpen && (
        <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl overflow-hidden shadow-xs">
          {/* Table Header with Clear Typography */}
          <div className="grid grid-cols-12 px-6 py-3.5 border-b border-[#28282b] text-xs font-bold text-zinc-300 uppercase tracking-wider bg-[#17171a]">
            <div className="col-span-3">Topic Aspect</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Positive Resonance</div>
            <div className="col-span-2">Critical Drag</div>
            <div className="col-span-1 text-right">Volume</div>
          </div>

          {/* Table Rows */}
          {sortedThemes.length === 0 ? (
            <div className="p-8 text-sm text-zinc-500 italic text-center">
              No topic aspects matching the selected "{themeFilter}" filter.
            </div>
          ) : (
            <div className="divide-y divide-[#28282b]/60 text-sm">
              {sortedThemes.map((theme) => {
                const pos = theme.posPercent || 0;
                const neg = theme.negPercent || 0;
                const isFavorable = pos >= 50;

                return (
                  <div
                    key={theme.name}
                    className="grid grid-cols-12 px-6 py-4 items-center hover:bg-[#222226] transition font-medium text-zinc-200"
                  >
                    <div className="col-span-3 font-bold text-zinc-100 capitalize text-sm">
                      {theme.name}
                    </div>

                    <div className="col-span-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isFavorable
                            ? "bg-[#183424] text-[#4ade80] border border-[#234e35]"
                            : "bg-[#331b20] text-[#f87171] border border-[#4c242a]"
                        }`}
                      >
                        {isFavorable ? "Positive Driver" : "Watch Friction"}
                      </span>
                    </div>

                    <div className="col-span-2 text-zinc-300 text-sm">
                      {isFavorable ? "Audience Highlight" : "Community Concern"}
                    </div>

                    <div className="col-span-2 flex items-center gap-2.5">
                      <span className="font-mono text-[#4ade80] font-bold text-sm w-10">+{pos}%</span>
                      <div className="w-24 bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#4ade80] h-full rounded-full"
                          style={{ width: `${pos}%` }}
                        />
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center gap-2.5">
                      <span className="font-mono text-[#f87171] font-bold text-sm w-10">-{neg}%</span>
                      <div className="w-24 bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#f87171] h-full rounded-full"
                          style={{ width: `${neg}%` }}
                        />
                      </div>
                    </div>

                    <div className="col-span-1 text-right font-mono text-zinc-100 font-bold text-sm">
                      {theme.count.toLocaleString()}
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
