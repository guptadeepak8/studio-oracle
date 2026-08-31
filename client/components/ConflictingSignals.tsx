"use client";

import React from "react";

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
    
    return `Dynamic evidence highlights direct friction surrounding the '${themeName}' aspect. While positive feedback highlights "${posSnippet}", critical commentary expresses active skepticism ("${negSnippet}"). Marketing directives should proactively address this divide.`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-550">
          Conflicting signals
        </h3>
      </div>

      {conflictingSignals.length === 0 ? (
        <p className="text-xs text-zinc-500 italic py-2">
          No explicit sentiment conflicts identified in current data.
        </p>
      ) : (
        <div className="space-y-6 pt-2">
          {conflictingSignals.map((conf, idx) => (
            <div key={idx} className="space-y-3 pb-5 border-b border-[#1a1a1f] last:border-0 last:pb-0">
              <span className="text-xs font-bold text-zinc-250 block uppercase tracking-wider">
                {conf.theme}
              </span>

              <div className="grid grid-cols-2 gap-6 text-xs font-sans">
                {/* Positive */}
                <div className="space-y-1">
                  <span className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider block">
                    Positive evidence
                  </span>
                  <p className="text-zinc-300 italic leading-relaxed">
                    "{conf.positive.text}"
                  </p>
                  <span className="text-[10px] text-zinc-550 block pt-0.5">
                    {conf.positive.author} · {conf.positive.source}
                  </span>
                </div>

                {/* Critical */}
                <div className="space-y-1">
                  <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider block">
                    Critical evidence
                  </span>
                  <p className="text-zinc-300 italic leading-relaxed">
                    "{conf.negative.text}"
                  </p>
                  <span className="text-[10px] text-zinc-550 block pt-0.5">
                    {conf.negative.author} · {conf.negative.source}
                  </span>
                </div>
              </div>

              {/* Why this matters */}
              <div className="bg-[#131316]/30 border border-[#1a1a1f] p-3.5 rounded text-xs">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">
                  Why this matters
                </span>
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
