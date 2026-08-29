"use client";

import React from "react";
import { BarChart } from "lucide-react";

interface ThemeItem {
  name: string;
  count: number;
}

interface TopThemesProps {
  themeStats: ThemeItem[];
}

export default function TopThemes({ themeStats }: TopThemesProps) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-amber-500" />
          <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-300">Top Audience Themes</h2>
        </div>
      </div>

      {themeStats.length === 0 || themeStats.every((t) => t.count === 0) ? (
        <p className="text-sm text-zinc-500 text-center py-5 bg-zinc-900/10 border border-dashed border-zinc-850 rounded">
          No themes registered. Ingest feedback to view topics.
        </p>
      ) : (
        <div className="space-y-3.5">
          {themeStats.map((t) => {
            const totalVal = Math.max(...themeStats.map((x) => x.count)) || 1;
            const widthPercent = Math.min(100, Math.round((t.count / totalVal) * 100));

            return (
              <div key={t.name} className="space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-zinc-500 font-medium">{t.count} mentions</span>
                </div>
                <div className="w-full bg-zinc-855 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-zinc-700 h-full border-r border-zinc-650"
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
