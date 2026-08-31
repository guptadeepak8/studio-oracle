"use client";

import React from "react";
import { ArrowLeftRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

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
  const getWhyItMatters = (item: ConflictItem): string => {
    const themeName = item.theme.toLowerCase();
    const posSnippet = item.positive.text.length > 80 ? item.positive.text.slice(0, 80) + "..." : item.positive.text;
    const negSnippet = item.negative.text.length > 80 ? item.negative.text.slice(0, 80) + "..." : item.negative.text;
    
    return `Dynamic ClickHouse telemetry isolates acute audience polarization around '${themeName}'. While positive reactions highlight "${posSnippet}", skeptical comments counter with "${negSnippet}". Adjust marketing narratives to bridge this gap.`;
  };

  return (
    <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-6 space-y-6 shadow-sm font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-4.5 w-4.5 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-300">
            Polarizing Signals · Direct Evidence Conflicts
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          {conflictingSignals.length} active debate themes
        </span>
      </div>

      {conflictingSignals.length === 0 ? (
        <p className="text-xs text-zinc-400 italic py-6 text-center">
          No conflicting polarities detected across current telemetry items.
        </p>
      ) : (
        <div className="space-y-6">
          {conflictingSignals.map((conf, idx) => (
            <div key={idx} className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded">
                  Topic: {conf.theme}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Dual-Polarity Evidence Pair
                </span>
              </div>

              {/* Side-by-Side Positive vs Critical Evidence */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Positive Box */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Positive Sentiment
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">
                      {conf.positive.source}
                    </span>
                  </div>
                  <p className="text-zinc-200 italic leading-relaxed">
                    "{conf.positive.text}"
                  </p>
                  <span className="text-[11px] text-emerald-400/90 block font-semibold">
                    — {conf.positive.author}
                  </span>
                </div>

                {/* Critical Box */}
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] text-rose-400 font-bold uppercase tracking-wider">
                      <AlertCircle className="h-3.5 w-3.5" /> Critical Friction
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">
                      {conf.negative.source}
                    </span>
                  </div>
                  <p className="text-zinc-200 italic leading-relaxed">
                    "{conf.negative.text}"
                  </p>
                  <span className="text-[11px] text-rose-400/90 block font-semibold">
                    — {conf.negative.author}
                  </span>
                </div>
              </div>

              {/* Why this matters context */}
              <div className="bg-[#121215] border border-amber-500/20 p-3.5 rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[10px] tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  <span>Strategic Implication</span>
                </div>
                <p className="text-zinc-300 font-sans leading-relaxed">
                  {getWhyItMatters(conf)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
