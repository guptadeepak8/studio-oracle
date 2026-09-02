"use client";

import React from "react";
import { ThemeItem } from "../utils/analytics";
import { useAppDispatch, useAppSelector } from "../store";
import { setThemeFilter, ThemeFilterType } from "../store/slices/dashboardSlice";
import { Card, Badge, Button } from "./ui";
import CollapsibleSection from "./common/CollapsibleSection";

interface WhatsWorkingProps {
  themeStats: ThemeItem[];
}

export default function WhatsWorking({ themeStats }: WhatsWorkingProps) {
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
    <CollapsibleSection
      title="What Fans Love vs. What Fans Criticize"
      headerAction={
        <div className="flex items-center gap-1.5 bg-[#161618] border border-[#28282b] rounded-lg p-1 text-xs">
          {filterOptions.map((opt) => (
            <Button
              key={opt.id}
              variant={themeFilter === opt.id ? "chip-active" : "chip"}
              size="xs"
              onClick={() => dispatch(setThemeFilter(opt.id))}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      }
    >
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
                    <Badge variant={isFavorable ? "positive" : "negative"}>
                      {isFavorable ? "Positive Driver" : "Watch Friction"}
                    </Badge>
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
    </CollapsibleSection>
  );
}
