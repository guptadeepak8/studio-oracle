"use client";

import React from "react";

interface ThemeItem {
  name: string;
  count: number;
}

interface TopThemesProps {
  themeStats: ThemeItem[];
}

export default function TopThemes({ themeStats }: TopThemesProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-550">
          Top audience themes
        </h3>
      </div>

      {themeStats.length === 0 || themeStats.every((t) => t.count === 0) ? (
        <p className="text-xs text-zinc-500 italic py-2">
          No themes registered. Ingest feedback to view topics.
        </p>
      ) : (
        <div className="space-y-4 pt-2">
          {themeStats.map((t) => {
            const totalVal = Math.max(...themeStats.map((x) => x.count)) || 1;
            const widthPercent = Math.min(100, Math.round((t.count / totalVal) * 100));

            return (
              <div key={t.name} className="space-y-1.5 text-xs font-sans">
                <div className="flex justify-between text-zinc-400">
                  <span className="font-semibold text-zinc-350">{t.name}</span>
                  <span className="text-zinc-550">{t.count} mentions</span>
                </div>
                <div className="w-full bg-[#131316] h-1.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-zinc-600 h-full rounded-full"
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
