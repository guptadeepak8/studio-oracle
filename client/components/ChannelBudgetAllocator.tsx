"use client";

import React from "react";
import { DollarSign, TrendingUp, TrendingDown, Minus, PieChart } from "lucide-react";
import { ChannelBudgetGuidance } from "../utils/types";

interface Props {
  budgetShifts?: ChannelBudgetGuidance[];
}

export default function ChannelBudgetAllocator({ budgetShifts }: Props) {
  if (!budgetShifts || budgetShifts.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-8 text-center text-zinc-500 text-xs">
        <DollarSign className="h-6 w-6 mx-auto mb-2 text-zinc-600 opacity-60" />
        <p>No media budget guidance generated yet. Sync reactions to calculate channel spend shifts.</p>
      </div>
    );
  }

  const getActionBadge = (action: string) => {
    if (action.includes("OVER-INDEX") || action.includes("+")) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
          <TrendingUp className="h-3 w-3" />
          {action}
        </span>
      );
    }
    if (action.includes("REDUCE") || action.includes("-")) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
          <TrendingDown className="h-3 w-3" />
          {action}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
        <Minus className="h-3 w-3" />
        {action}
      </span>
    );
  };

  const channelColors = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-purple-500",
    "bg-zinc-500",
  ];

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <PieChart className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-zinc-100">
              Paid Media Budget Allocator
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500">
            Channel re-allocation percentages derived from audience conversion velocity and platform sentiment.
          </p>
        </div>
      </div>

      {/* Visual Allocation Stacked Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-semibold text-[10px] uppercase tracking-wider text-zinc-500">
            Recommended Spend Distribution
          </span>
          <span className="font-mono text-[11px] text-zinc-500">100% Target Pool</span>
        </div>

        <div className="h-3 w-full rounded-full overflow-hidden flex bg-zinc-950 p-0.5 gap-0.5 border border-zinc-800/80">
          {budgetShifts.map((b, idx) => {
            const color = channelColors[idx % channelColors.length];
            return (
              <div
                key={idx}
                style={{ width: `${b.recommended_allocation_pct}%` }}
                title={`${b.channel}: ${b.recommended_allocation_pct}%`}
                className={`${color} h-full rounded-full transition-all hover:opacity-90`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-1">
          {budgetShifts.map((b, idx) => {
            const color = channelColors[idx % channelColors.length];
            return (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span>{b.channel}:</span>
                <span className="font-mono font-medium text-zinc-200">{b.recommended_allocation_pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Channel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {budgetShifts.map((shift, idx) => (
          <div
            key={idx}
            className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-zinc-200">{shift.channel}</span>
              {getActionBadge(shift.spend_action)}
            </div>

            {/* Percentage Comparison */}
            <div className="flex items-center gap-3 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Current</span>
                <span className="font-mono text-xs text-zinc-400 font-medium">{shift.current_allocation_pct}%</span>
              </div>
              <span className="text-zinc-600 font-bold">→</span>
              <div>
                <span className="text-[10px] uppercase font-semibold text-indigo-400 block">Recommended</span>
                <span className="font-mono text-xs text-indigo-300 font-semibold">{shift.recommended_allocation_pct}%</span>
              </div>
            </div>

            {/* Rationale */}
            <div className="space-y-0.5 text-xs">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Buying Rationale</span>
              <p className="text-zinc-300 text-xs leading-relaxed">
                {shift.rationale}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

