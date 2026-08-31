"use client";

import React from "react";
import { Clock, TrendingUp, TrendingDown, GitCommit } from "lucide-react";

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
    <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-6 space-y-5 shadow-sm font-sans">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4.5 w-4.5 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-300">
            Temporal Inflection Timeline · What Changed
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          {timelineData.length} observation windows
        </span>
      </div>

      {timelineData.length === 0 ? (
        <p className="text-xs text-zinc-400 italic py-6 text-center">
          Awaiting chronological data points. Ingest telemetry to construct the timeline.
        </p>
      ) : (
        <div className="relative border-l-2 border-amber-500/30 ml-3 pl-6 space-y-6 py-2">
          {timelineData.map((t, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Bullet Dot */}
              <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-[#121215] border-2 border-amber-400 group-hover:bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)] transition" />
              
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-2 hover:border-zinc-700 transition">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-zinc-200 bg-[#27272a] px-2 py-0.5 rounded">
                      {t.label}
                    </span>
                    <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                      {t.dominantTopic}
                    </span>
                    <span className="text-[11px] text-zinc-400">({t.count} comments)</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                      <TrendingUp className="h-3 w-3" /> +{t.positiveRatio}%
                    </span>
                    <span className="flex items-center gap-1 text-rose-400 bg-rose-950/40 border border-rose-500/30 px-2 py-0.5 rounded">
                      <TrendingDown className="h-3 w-3" /> -{t.negativeRatio}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-200 font-sans leading-relaxed italic border-l-2 border-amber-500/40 pl-3 pt-0.5">
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
