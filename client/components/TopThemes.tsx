"use client";

import React from "react";
import { Tag } from "lucide-react";

interface ThemeItem {
  name: string;
  count: number;
  posPercent?: number;
  negPercent?: number;
}

interface TopThemesProps {
  themeStats: ThemeItem[];
}

export default function TopThemes({ themeStats }: TopThemesProps) {
  return (
    <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-6 space-y-5 shadow-sm font-sans">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-300">
            Top Audience Discussion Themes
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          {themeStats.length} discovered aspects
        </span>
      </div>

      {themeStats.length === 0 || themeStats.every((t) => t.count === 0) ? (
        <p className="text-xs text-zinc-400 italic py-6 text-center">
          No dynamic themes registered. Ingest audience feedback to extract topics.
        </p>
      ) : (
        <div className="space-y-4">
          {themeStats.map((t) => {
            const maxVal = Math.max(...themeStats.map((x) => x.count)) || 1;
            const widthPercent = Math.min(100, Math.round((t.count / maxVal) * 100));

            return (
              <div key={t.name} className="space-y-2 bg-[#18181b] border border-[#27272a] p-3.5 rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-200 capitalize tracking-wide">
                    {t.name}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-semibold">
                    {t.posPercent !== undefined && (
                      <span className="text-emerald-400">{t.posPercent}% pos</span>
                    )}
                    {t.negPercent !== undefined && (
                      <span className="text-rose-400">{t.negPercent}% crit</span>
                    )}
                    <span className="text-zinc-400 font-mono bg-[#27272a] px-2 py-0.5 rounded">
                      {t.count} mentions
                    </span>
                  </div>
                </div>

                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
