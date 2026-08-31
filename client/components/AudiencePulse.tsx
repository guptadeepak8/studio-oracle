"use client";

import React from "react";
import { Sparkles, AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Comment } from "../utils/types";

interface AudiencePulseProps {
  comments: Comment[];
  sentiment: {
    positive: number;
    negative: number;
    posPercent: number;
    negPercent: number;
  };
  pulseSummary: string;
  dominantTopic: string;
}

export default function AudiencePulse({
  comments,
  sentiment,
  pulseSummary,
  dominantTopic,
}: AudiencePulseProps) {
  const neutralPercent = Math.max(0, 100 - sentiment.posPercent - sentiment.negPercent);

  return (
    <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-6 space-y-6 shadow-sm font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-300">
            Real-Time Audience Signal & Synthesis
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 bg-[#18181b] border border-[#27272a] px-2.5 py-1 rounded-full">
          AI Telemetry Pulse
        </span>
      </div>

      {/* Pulse Summary Box */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4.5 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            Synthesized Intelligence
          </span>
        </div>
        <p className="text-zinc-100 text-sm leading-relaxed font-sans font-medium">
          {pulseSummary}
        </p>
      </div>

      {/* Emerging Friction Alert if negative >= 20 */}
      {sentiment.negPercent >= 20 && (
        <div className="bg-rose-950/30 border border-rose-500/40 p-4 rounded-xl flex items-start gap-3.5">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="text-xs space-y-1 flex-1">
            <span className="font-bold text-rose-300 uppercase tracking-wider text-[11px] block">
              Emerging Friction Alert · {dominantTopic}
            </span>
            <p className="text-zinc-200 font-sans leading-relaxed">
              Audience telemetry detects elevated resistance (<strong className="text-rose-400">{sentiment.negPercent}% critical sentiment</strong>). Primary friction is centered around <strong className="text-zinc-100 capitalize">"{dominantTopic}"</strong>. Review Conflicting Signals below for mitigation directives.
            </p>
          </div>
        </div>
      )}

      {/* Sentiment Metrics & Progress Bar */}
      {comments.length > 0 && (
        <div className="space-y-4 pt-2">
          {/* Sentiment Stat Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#18181b] border border-emerald-500/20 rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold text-emerald-400">Positive Excitement</span>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-zinc-100">{sentiment.posPercent}%</span>
                <span className="text-[11px] text-zinc-400">({sentiment.positive} msgs)</span>
              </div>
            </div>

            <div className="bg-[#18181b] border border-zinc-700/40 rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">Neutral Observation</span>
                <span className="h-2 w-2 rounded-full bg-zinc-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-zinc-100">{neutralPercent}%</span>
                <span className="text-[11px] text-zinc-400">({Math.max(0, comments.length - sentiment.positive - sentiment.negative)} msgs)</span>
              </div>
            </div>

            <div className="bg-[#18181b] border border-rose-500/20 rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold text-rose-400">Critical Friction</span>
                <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-zinc-100">{sentiment.negPercent}%</span>
                <span className="text-[11px] text-zinc-400">({sentiment.negative} msgs)</span>
              </div>
            </div>
          </div>

          {/* Continuous Sentiment Gauge */}
          <div className="w-full h-2 rounded-full overflow-hidden bg-zinc-800 flex shadow-inner">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${sentiment.posPercent}%` }}
              title={`Positive: ${sentiment.posPercent}%`}
            />
            <div
              className="bg-zinc-600 h-full transition-all duration-500"
              style={{ width: `${neutralPercent}%` }}
              title={`Neutral: ${neutralPercent}%`}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ width: `${sentiment.negPercent}%` }}
              title={`Critical: ${sentiment.negPercent}%`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
