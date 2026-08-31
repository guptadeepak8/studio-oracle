"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Calendar, Filter, Sparkles } from "lucide-react";
import { TimelineNode } from "../utils/analytics";

interface LaunchTimelineProps {
  timelineData: TimelineNode[];
}

export default function LaunchTimeline({ timelineData }: LaunchTimelineProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<"24h" | "3d" | "drop" | "all">("all");

  const filteredTimeline = React.useMemo(() => {
    if (!timelineData || timelineData.length === 0) return [];
    if (selectedTimeframe === "24h") return timelineData.slice(-1);
    if (selectedTimeframe === "3d") return timelineData.slice(-3);
    if (selectedTimeframe === "drop") return timelineData.slice(0, Math.min(2, timelineData.length));
    return timelineData;
  }, [timelineData, selectedTimeframe]);

  return (
    <div className="space-y-3 font-sans">
      {/* Section Header with Chevron matching screenshot `⌄ Usage statements` */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-sm font-bold text-zinc-100 hover:text-[#e6fc4f] transition cursor-pointer select-none"
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          )}
          <span>Launch Timeline Statements</span>
        </button>

        {/* Timeframe Filter Pills */}
        <div className="flex items-center bg-[#1c1c1f] border border-[#28282b] rounded-lg p-0.5 gap-0.5">
          {[
            { id: "24h", label: "Last 24h" },
            { id: "3d", label: "Last 3 Days" },
            { id: "drop", label: "Trailer Drop" },
            { id: "all", label: "All Time" },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setSelectedTimeframe(tf.id as any)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                selectedTimeframe === tf.id
                  ? "bg-[#28282d] text-white shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Chronological telemetry statements synthesized from ClickHouse timestamp logs.
      </p>

      {isOpen && (
        <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl overflow-hidden shadow-xs">
          {/* Table Header matching screenshot */}
          <div className="grid grid-cols-12 px-5 py-3 border-b border-[#28282b] text-[11px] font-semibold text-zinc-400 bg-[#17171a]">
            <div className="col-span-3">Time Period</div>
            <div className="col-span-3">Dominant Discussion Aspect</div>
            <div className="col-span-2">Positive Ratio</div>
            <div className="col-span-2">Critical Drag</div>
            <div className="col-span-2 text-right">Sample Evidence</div>
          </div>

          {/* Table Rows */}
          {filteredTimeline.length === 0 ? (
            <div className="p-6 text-xs text-zinc-500 italic text-center">
              No timeline statements recorded for "{selectedTimeframe}".
            </div>
          ) : (
            <div className="divide-y divide-[#28282b]/60 text-xs">
              {filteredTimeline.map((node, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-[#222226] transition font-medium text-zinc-300"
                >
                  <div className="col-span-3 font-mono text-zinc-200 font-semibold flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-zinc-500" />
                    <span>{node.label}</span>
                  </div>

                  <div className="col-span-3 font-bold text-zinc-100 capitalize">
                    {node.dominantTopic}
                  </div>

                  <div className="col-span-2 font-mono text-[#4ade80] font-bold">
                    +{node.positiveRatio}%
                  </div>

                  <div className="col-span-2 font-mono text-[#f87171] font-bold">
                    -{node.negativeRatio}%
                  </div>

                  <div className="col-span-2 text-right text-[11px] text-zinc-400 truncate pl-2" title={node.representativeComment}>
                    "{node.representativeComment}"
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
