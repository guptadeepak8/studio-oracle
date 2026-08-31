"use client";

import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { ThemeItem } from "../utils/analytics";

interface WhatsWorkingProps {
  themeStats: ThemeItem[];
}

export default function WhatsWorking({ themeStats }: WhatsWorkingProps) {
  // Sort themes by positive resonance and negative friction
  const topPositives = [...themeStats]
    .filter((t) => (t.posPercent ?? 0) >= 40)
    .sort((a, b) => (b.posPercent ?? 0) - (a.posPercent ?? 0))
    .slice(0, 4);

  const topComplaints = [...themeStats]
    .filter((t) => (t.negPercent ?? 0) >= 20)
    .sort((a, b) => (b.negPercent ?? 0) - (a.negPercent ?? 0))
    .slice(0, 4);

  return (
    <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-6 space-y-6 shadow-sm font-sans">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
        <div>
          <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
            What's Working vs. What's Not
          </h3>
          <p className="text-xs text-zinc-400">
            Key topics driving fan excitement compared to areas of friction
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: What Fans Love */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <ThumbsUp className="h-4 w-4" />
            <span>What Fans Love (Top Positives)</span>
          </div>

          {topPositives.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-4">
              Gathering positive feedback...
            </p>
          ) : (
            <div className="space-y-3">
              {topPositives.map((item) => (
                <div key={item.name} className="bg-[#18181b] border border-emerald-500/20 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-100 capitalize">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-emerald-400">
                        {item.posPercent}% positive
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        ({item.count} mentions)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.posPercent || 70}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: What Fans Criticize */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <ThumbsDown className="h-4 w-4" />
            <span>What Fans Criticize (Top Concerns)</span>
          </div>

          {topComplaints.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-4">
              No significant complaints detected.
            </p>
          ) : (
            <div className="space-y-3">
              {topComplaints.map((item) => (
                <div key={item.name} className="bg-[#18181b] border border-rose-500/20 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-100 capitalize">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-rose-400">
                        {item.negPercent}% critical
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        ({item.count} mentions)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.negPercent || 35}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
