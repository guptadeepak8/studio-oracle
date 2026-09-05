"use client";

import React, { useState } from "react";
import { ThumbsUp, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { ThemeItem } from "../utils/analytics";

interface WhatsWorkingProps {
  themeStats: ThemeItem[];
}

export default function WhatsWorking({ themeStats }: WhatsWorkingProps) {
  const [showAll, setShowAll] = useState(false);

  const workingThemes = themeStats
    .filter((t) => t.count > 0 && (t.posPercent || 0) >= 35)
    .sort((a, b) => b.count - a.count);

  const hurtingThemes = themeStats
    .filter((t) => t.count > 0 && (t.negPercent || 0) >= 20)
    .sort((a, b) => (b.negPercent || 0) - (a.negPercent || 0));

  const displayWorking = showAll ? workingThemes : workingThemes.slice(0, 4);
  const displayHurting = showAll ? hurtingThemes : hurtingThemes.slice(0, 4);

  return (
    <div className="space-y-2.5 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
          Audience Drivers (Resonance vs. Friction)
        </span>
        {(workingThemes.length > 4 || hurtingThemes.length > 4) && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 font-medium transition cursor-pointer"
          >
            {showAll ? (
              <>Show Less <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>View All ({workingThemes.length + hurtingThemes.length}) <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Column 1: WHAT'S WORKING */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
            <ThumbsUp className="h-3 w-3" />
            <span>Top Resonant Drivers</span>
          </div>

          {displayWorking.length === 0 ? (
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-3 text-center text-zinc-500 text-xs">
              Awaiting audience themes...
            </div>
          ) : (
            <div className="space-y-1.5">
              {displayWorking.map((theme) => {
                const pos = theme.posPercent || 0;
                const formattedName = theme.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

                return (
                  <div
                    key={theme.name}
                    className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 hover:border-zinc-700/80 transition flex items-center justify-between gap-2 backdrop-blur-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-xs text-zinc-200 truncate">{formattedName}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        ({theme.count.toLocaleString()})
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono text-emerald-400 shrink-0">
                      +{pos}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Column 2: WHAT'S HURTING */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-rose-400 uppercase tracking-wider">
            <AlertTriangle className="h-3 w-3" />
            <span>Friction Points</span>
          </div>

          {displayHurting.length === 0 ? (
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-3 text-center text-zinc-500 text-xs">
              No critical friction detected.
            </div>
          ) : (
            <div className="space-y-1.5">
              {displayHurting.map((theme) => {
                const neg = theme.negPercent || 0;
                const formattedName = theme.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

                return (
                  <div
                    key={theme.name}
                    className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 hover:border-zinc-700/80 transition flex items-center justify-between gap-2 backdrop-blur-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-xs text-zinc-200 truncate">{formattedName}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        ({theme.count.toLocaleString()})
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono text-rose-400 shrink-0">
                      -{neg}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
