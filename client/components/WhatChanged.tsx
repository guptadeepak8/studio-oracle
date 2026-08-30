"use client";

import React from "react";

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
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-550">
          Recent audience timeline
        </h3>
      </div>

      {timelineData.length === 0 ? (
        <p className="text-xs text-zinc-500 italic py-2">
          No chronological data points available.
        </p>
      ) : (
        <div className="relative border-l border-[#1a1a1f] ml-2 pl-6 space-y-6 py-2">
          {timelineData.map((t, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Bullet Dot */}
              <div className="absolute -left-[30px] top-1 h-2 w-2 rounded-full bg-[#0a0a0c] border border-amber-500 transition group-hover:bg-amber-500" />
              
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-zinc-300">{t.label}</span>
                  <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                    {t.dominantTopic}
                  </span>
                  <div className="flex gap-2 text-[10px] text-zinc-550 font-semibold">
                    <span className="text-emerald-500">+{t.positiveRatio}%</span>
                    <span className="text-rose-500">-{t.negativeRatio}%</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-2xl">
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
