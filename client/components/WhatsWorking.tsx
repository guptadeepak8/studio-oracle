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
    <div className="space-y-3 font-sans">
      <div>
        <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
          What Fans Love vs. What Needs Work
        </h3>
        <p className="text-xs text-zinc-400">
          Positive resonance drivers and audience friction points from commentary.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Column 1: WHAT'S WORKING */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            <ThumbsUp className="h-3 w-3" />
            <span>Top Resonant Elements</span>
          </div>

          {displayWorking.length === 0 ? (
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5 text-center text-zinc-500 text-xs italic">
              Awaiting positive audience themes...
            </div>
          ) : (
            <div className="space-y-2">
              {displayWorking.map((theme) => {
                const pos = theme.posPercent || 0;
                const formattedName = theme.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

                return (
                  <div
                    key={theme.name}
                    className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 hover:border-zinc-700/80 transition flex items-center justify-between gap-3 backdrop-blur-sm"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-semibold text-xs text-zinc-200 truncate">{formattedName}</h4>
                      <span className="text-[11px] text-zinc-400 font-mono block">
                        {theme.count.toLocaleString()} comments
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold font-mono text-emerald-400 block">
                        +{pos}%
                      </span>
                      <span className="text-[10px] text-zinc-400">Positive</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Column 2: WHAT'S HURTING */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 uppercase tracking-wider">
            <AlertTriangle className="h-3 w-3" />
            <span>Key Audience Friction</span>
          </div>

          {displayHurting.length === 0 ? (
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5 text-center text-zinc-500 text-xs italic">
              No major friction points detected.
            </div>
          ) : (
            <div className="space-y-2">
              {displayHurting.map((theme) => {
                const neg = theme.negPercent || 0;
                const formattedName = theme.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

                return (
                  <div
                    key={theme.name}
                    className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 hover:border-zinc-700/80 transition flex items-center justify-between gap-3 backdrop-blur-sm"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-semibold text-xs text-zinc-200 truncate">{formattedName}</h4>
                      <span className="text-[11px] text-zinc-400 font-mono block">
                        {theme.count.toLocaleString()} comments
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold font-mono text-rose-400 block">
                        -{neg}%
                      </span>
                      <span className="text-[10px] text-zinc-400">Critical</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* View All / Collapse Button */}
      {(workingThemes.length > 4 || hurtingThemes.length > 4) && (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 py-1 font-medium transition cursor-pointer"
          >
            {showAll ? (
              <>Show Less <ChevronUp className="h-3.5 w-3.5" /></>
            ) : (
              <>View All {workingThemes.length + hurtingThemes.length} Topics <ChevronDown className="h-3.5 w-3.5" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
