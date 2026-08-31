"use client";

import React, { useState } from "react";
import { Clock, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { TimelineNode } from "../utils/analytics";

interface LaunchTimelineProps {
  timelineData: TimelineNode[];
}

export default function LaunchTimeline({ timelineData }: LaunchTimelineProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"24h" | "3d" | "drop" | "all">("all");

  return (
    <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-6 space-y-5 shadow-sm font-sans">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
            Audience Reaction Over Time
          </h3>
          <p className="text-xs text-zinc-400">
            Track how fan excitement and opinions changed during the campaign launch
          </p>
        </div>

        {/* Timeframe Selector Buttons */}
        <div className="flex items-center bg-[#18181b] border border-[#27272a] rounded-lg p-1 gap-1">
          {[
            { id: "24h", label: "24 Hours" },
            { id: "3d", label: "3 Days" },
            { id: "drop", label: "Trailer Drop" },
            { id: "all", label: "All Time" },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setSelectedTimeframe(tf.id as any)}
              className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                selectedTimeframe === tf.id
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {timelineData.length === 0 ? (
        <p className="text-xs text-zinc-400 italic py-6 text-center">
          Awaiting timeline data points. Ingest telemetry comments to track changes over time.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {timelineData.map((node, idx) => (
            <div
              key={idx}
              className="bg-[#18181b] border border-[#27272a] rounded-xl p-4.5 space-y-2.5 hover:border-zinc-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-100 bg-[#27272a] px-2.5 py-1 rounded-md">
                  {node.label}
                </span>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-emerald-400">+{node.positiveRatio}% Positive</span>
                  <span className="text-rose-400">-{node.negativeRatio}% Critical</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>Top topic: <strong className="text-amber-400 capitalize">{node.dominantTopic}</strong></span>
                <span>·</span>
                <span>{node.count} comments</span>
              </div>

              <p className="text-xs text-zinc-300 italic border-l-2 border-amber-500/40 pl-3 leading-relaxed">
                "{node.representativeComment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

