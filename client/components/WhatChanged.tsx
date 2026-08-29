"use client";

import React from "react";
import { Clock } from "lucide-react";

interface TimelineNode {
  label: string;
  count: number;
  positiveRatio: number;
  negativeRatio: number;
  dominantTopic: string;
  representativeComment: string;
}

interface WhatChangedProps {
  timelineData: TimelineNode[];
}

export default function WhatChanged({ timelineData }: WhatChangedProps) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-300">What Changed?</h2>
        </div>
        <span className="text-xs text-zinc-550 italic">Timeline computed from raw ClickHouse logs</span>
      </div>

      {timelineData.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-5 bg-zinc-900/10 border border-dashed border-zinc-850 rounded">
          No chronological data points available.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-4 relative">
          <div className="absolute top-[20px] left-8 right-8 h-0.5 bg-zinc-800 z-0" />

          {timelineData.map((t, idx) => (
            <div key={idx} className="z-10 space-y-2 text-center">
              <div className="flex justify-center">
                <div className="h-9 w-9 rounded-full bg-zinc-850 border-2 border-zinc-700 flex items-center justify-center text-xs font-bold text-amber-500">
                  {idx + 1}
                </div>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-850 rounded-lg p-3 space-y-1.5 text-left">
                <span className="text-xs font-bold text-zinc-400 block">{t.label}</span>
                <span className="text-xs text-amber-500 font-semibold block truncate" title={t.dominantTopic}>
                  {t.dominantTopic}
                </span>
                <div className="flex gap-2 text-xs text-zinc-500 font-medium">
                  <span className="text-emerald-500">+{t.positiveRatio}%</span>
                  <span className="text-rose-500">-{t.negativeRatio}%</span>
                </div>
                <p className="text-xs text-zinc-400 italic truncate" title={t.representativeComment}>
                  "{t.representativeComment}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
