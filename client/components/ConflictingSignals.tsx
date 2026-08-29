"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";

interface ConflictItem {
  theme: string;
  positive: {
    text: string;
    author: string;
    source: string;
    likes: number;
    published: string;
  };
  negative: {
    text: string;
    author: string;
    source: string;
    likes: number;
    published: string;
  };
}

interface ConflictingSignalsProps {
  conflictingSignals: ConflictItem[];
}

export default function ConflictingSignals({ conflictingSignals }: ConflictingSignalsProps) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
        <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-300">Conflicting Signals</h2>
      </div>

      {conflictingSignals.length === 0 ? (
        <p className="text-xs text-zinc-500 text-center py-4 bg-zinc-900/10 border border-dashed border-zinc-850 rounded">
          No explicit sentiment conflicts identified in current data.
        </p>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-56 pr-1">
          {conflictingSignals.map((conf, idx) => (
            <div key={idx} className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/40 text-[10px]">
              {/* Theme Indicator */}
              <div className="p-2 border-b border-zinc-850 bg-zinc-900/60 font-semibold tracking-wider text-[9px] text-amber-500">
                CONFLICT DETECTED: {conf.theme}
              </div>

              {/* Comparison Columns */}
              <div className="grid grid-cols-2 divide-x divide-zinc-850">
                {/* Positive */}
                <div className="p-2 space-y-1">
                  <div className="flex justify-between text-[8px] text-emerald-500 font-bold">
                    <span>POSITIVE SIGNAL</span>
                    <span>{conf.positive.author}</span>
                  </div>
                  <p className="text-zinc-350 italic">"{conf.positive.text}"</p>
                </div>

                {/* Negative */}
                <div className="p-2 space-y-1">
                  <div className="flex justify-between text-[8px] text-rose-500 font-bold">
                    <span>CRITICAL SIGNAL</span>
                    <span>{conf.negative.author}</span>
                  </div>
                  <p className="text-zinc-350 italic">"{conf.negative.text}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
