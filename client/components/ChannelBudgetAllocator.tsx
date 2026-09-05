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
      <div className="bg-[#141416] border border-[#242428] rounded-xl p-6 text-center text-zinc-400 text-sm">
        <DollarSign className="h-8 w-8 mx-auto mb-2 text-zinc-500 opacity-60" />
        <p>No media budget guidance generated yet. Sync reactions to calculate channel spend shifts.</p>
      </div>
    );
  }

  const getActionBadge = (action: string) => {
    if (action.includes("OVER-INDEX") || action.includes("+")) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md">
          <TrendingUp className="h-3 w-3" />
          {action}
        </span>
      );
    }
    if (action.includes("REDUCE") || action.includes("-")) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-md">
          <TrendingDown className="h-3 w-3" />
          {action}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-md">
        <Minus className="h-3 w-3" />
        {action}
      </span>
    );
  };

  return (
    <div className="bg-[#141416] border border-[#242428] rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242428] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <PieChart className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-zinc-100">
              Dynamic Paid Media Budget Allocator
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Channel re-allocation percentages derived from audience conversion velocity and platform sentiment.
          </p>
        </div>
      </div>

      {/* Visual Allocation Stacked Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-400">
            Recommended Media Spend Split
          </span>
          <span className="font-mono text-[11px] text-zinc-400">100% Target Allocation</span>
        </div>

        <div className="h-4 w-full rounded-lg overflow-hidden flex bg-zinc-800 p-0.5 gap-0.5">
          {budgetShifts.map((b, idx) => {
            const colors = [
              "bg-indigo-500",
              "bg-emerald-500",
              "bg-purple-500",
              "bg-zinc-600",
            ];
            const color = colors[idx % colors.length];
            return (
              <div
                key={idx}
                style={{ width: `${b.recommended_allocation_pct}%` }}
                title={`${b.channel}: ${b.recommended_allocation_pct}%`}
                className={`${color} h-full rounded transition-all hover:opacity-90`}
              />
            );
          })}
        </div>
      </div>

      {/* Channel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetShifts.map((shift, idx) => (
          <div
            key={idx}
            className="bg-[#18181b] border border-[#28282b] rounded-xl p-4.5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-100">{shift.channel}</span>
              {getActionBadge(shift.spend_action)}
            </div>

            {/* Percentage Comparison */}
            <div className="flex items-center gap-4 bg-[#121214] p-3 rounded-lg border border-[#232326] text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Current Allocation</span>
                <span className="font-mono text-sm text-zinc-400 font-semibold">{shift.current_allocation_pct}%</span>
              </div>
              <span className="text-zinc-600 font-bold">→</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 block">Recommended</span>
                <span className="font-mono text-sm text-indigo-300 font-bold">{shift.recommended_allocation_pct}%</span>
              </div>
            </div>

            {/* Rationale */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Media Buying Rationale</span>
              <p className="text-zinc-300 leading-relaxed">
                {shift.rationale}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

