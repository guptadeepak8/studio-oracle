"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, Film, Play, Sparkles } from "lucide-react";
import { Movie } from "../utils/types";

export interface DropItem {
  id: string;
  title: string;
  url: string;
  published_at: string;
  total_comments: number;
  posPercent: number;
  negPercent: number;
  topComment: string;
}

interface TrailerComparisonProps {
  campaign: Movie;
  drops: DropItem[];
}

export default function TrailerComparison({ campaign, drops = [] }: TrailerComparisonProps) {
  const [isOpen, setIsOpen] = useState(true);

  const [dropAId, setDropAId] = useState<string>("");
  const [dropBId, setDropBId] = useState<string>("");

  // Auto select first two drops if available
  const selectedAId = dropAId || drops[0]?.id || "";
  const selectedBId = dropBId || drops[Math.min(1, drops.length - 1)]?.id || "";

  const dropA = drops.find((d) => d.id === selectedAId) || drops[0];
  const dropB = drops.find((d) => d.id === selectedBId) || drops[Math.min(1, drops.length - 1)];

  const deltaSentiment = dropA && dropB ? dropB.posPercent - dropA.posPercent : 0;
  const isSurge = deltaSentiment >= 0;

  return (
    <div className="space-y-3 font-sans">
      {/* Section Header with Chevron matching ClickHouse Cloud */}
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
          <span>Campaign Drop & Milestone Comparison</span>
        </button>

        {/* Dynamic Milestone Drop Selectors */}
        {drops.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-[#1c1c1f] border border-[#28282b] rounded-lg px-2.5 py-1 text-zinc-300 max-w-[200px]">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase shrink-0">Drop A:</span>
              <select
                value={selectedAId}
                onChange={(e) => setDropAId(e.target.value)}
                className="bg-transparent text-zinc-100 text-xs font-semibold focus:outline-none cursor-pointer truncate"
              >
                {drops.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#1c1c1f] text-zinc-100">
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-zinc-500 font-bold">vs</span>

            <div className="flex items-center gap-1.5 bg-[#1c1c1f] border border-[#28282b] rounded-lg px-2.5 py-1 text-zinc-300 max-w-[200px]">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase shrink-0">Drop B:</span>
              <select
                value={selectedBId}
                onChange={(e) => setDropBId(e.target.value)}
                className="bg-transparent text-zinc-100 text-xs font-semibold focus:outline-none cursor-pointer truncate"
              >
                {drops.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#1c1c1f] text-zinc-100">
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-500">
        Real telemetry comparison across distinct teaser and trailer video drops stored in ClickHouse.
      </p>

      {isOpen && (
        <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-5 space-y-4 shadow-xs">
          {drops.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-xs italic">
              No video drops or trailer feeds ingested for this campaign yet. Import YouTube or Reddit feeds below to populate drop telemetry.
            </div>
          ) : (
            <>
              {/* 2-Card Drop Milestone Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Drop A Card */}
                {dropA && (
                  <div className="bg-[#161618] border border-[#28282b] rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-[#242428] flex items-center justify-center text-zinc-400 shrink-0">
                          <Film className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-bold text-xs text-zinc-200 tracking-tight truncate max-w-[230px]" title={dropA.title}>
                          {dropA.title}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-zinc-400 bg-[#242428] px-2 py-0.5 rounded shrink-0">
                        {dropA.published_at}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Audience Positive Score:</span>
                        <span className="font-mono text-zinc-100 font-bold">+{dropA.posPercent}%</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Comments Tracked:</span>
                        <span className="font-mono text-zinc-200">{dropA.total_comments}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Critical Drag:</span>
                        <span className="text-rose-400 font-mono font-medium">-{dropA.negPercent}%</span>
                      </div>
                    </div>

                    {dropA.topComment ? (
                      <p className="text-[11px] text-zinc-300 italic border-l-2 border-zinc-600 pl-2.5 leading-relaxed pt-1">
                        "{dropA.topComment}"
                      </p>
                    ) : (
                      <p className="text-[11px] text-zinc-500 italic">Awaiting top comment quote.</p>
                    )}
                  </div>
                )}

                {/* Drop B Card */}
                {dropB && (
                  <div className="bg-[#161618] border border-[#28282b] rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-[#183424] flex items-center justify-center text-[#4ade80] shrink-0">
                          <Play className="h-3.5 w-3.5 fill-[#4ade80]" />
                        </div>
                        <span className="font-bold text-xs text-zinc-100 tracking-tight truncate max-w-[230px]" title={dropB.title}>
                          {dropB.title}
                        </span>
                      </div>
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shrink-0 ${
                        isSurge
                          ? "text-[#4ade80] bg-[#183424] border border-[#234e35]"
                          : "text-rose-400 bg-[#331b20] border border-[#4c242a]"
                      }`}>
                        {isSurge ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                        {isSurge ? `+${deltaSentiment}%` : `${deltaSentiment}%`}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Audience Positive Score:</span>
                        <span className="font-mono text-[#4ade80] font-bold">+{dropB.posPercent}%</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Comments Tracked:</span>
                        <span className="font-mono text-zinc-200">{dropB.total_comments}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Critical Drag:</span>
                        <span className="text-rose-400 font-mono font-medium">-{dropB.negPercent}%</span>
                      </div>
                    </div>

                    {dropB.topComment ? (
                      <p className="text-[11px] text-zinc-300 italic border-l-2 border-[#4ade80]/60 pl-2.5 leading-relaxed pt-1">
                        "{dropB.topComment}"
                      </p>
                    ) : (
                      <p className="text-[11px] text-zinc-500 italic">Awaiting top comment quote.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Delta Takeaway Banner */}
              {dropA && dropB && dropA.id !== dropB.id && (
                <div className="bg-[#161618] border border-[#28282b] rounded-lg p-3.5 flex items-center gap-3 text-xs">
                  <div className="h-6 w-6 rounded bg-[#242428] flex items-center justify-center text-[#e6fc4f] shrink-0">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 text-zinc-300 font-sans leading-relaxed">
                    <strong className="text-zinc-100">Live Telemetry Delta:</strong> Transitioning between tracked video releases produced a net excitement shift of <span className={`font-bold font-mono ${isSurge ? "text-[#4ade80]" : "text-rose-400"}`}>{isSurge ? `+${deltaSentiment}%` : `${deltaSentiment}%`}</span> across ClickHouse audience records.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
