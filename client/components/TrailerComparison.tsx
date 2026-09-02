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

import { useAppDispatch, useAppSelector } from "../store";
import { setSelectedDropA, setSelectedDropB } from "../store/slices/dashboardSlice";

interface TrailerComparisonProps {
  campaign: Movie;
  drops: DropItem[];
}

export default function TrailerComparison({ campaign, drops = [] }: TrailerComparisonProps) {
  const [isOpen, setIsOpen] = useState(true);
  const dispatch = useAppDispatch();
  const { selectedDropAId, selectedDropBId } = useAppSelector((state) => state.dashboard);

  // Auto select first two drops if available
  const activeAId = selectedDropAId && drops.some((d) => d.id === selectedDropAId) ? selectedDropAId : drops[0]?.id || "";
  const activeBId = selectedDropBId && drops.some((d) => d.id === selectedDropBId) ? selectedDropBId : drops[Math.min(1, drops.length - 1)]?.id || "";

  const dropA = drops.find((d) => d.id === activeAId) || drops[0];
  const dropB = drops.find((d) => d.id === activeBId) || drops[Math.min(1, drops.length - 1)];

  const deltaSentiment = dropA && dropB ? dropB.posPercent - dropA.posPercent : 0;
  const isSurge = deltaSentiment >= 0;

  return (
    <div className="space-y-3 font-sans">
      {/* Section Header with Chevron */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-base font-bold text-zinc-100 hover:text-[#e6fc4f] transition cursor-pointer select-none"
        >
          {isOpen ? (
            <ChevronDown className="h-4.5 w-4.5 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4.5 w-4.5 text-zinc-400" />
          )}
          <span>Campaign Drop & Milestone Comparison</span>
        </button>

        {/* Dynamic Milestone Drop Selectors */}
        {drops.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-2 bg-[#1c1c1f] border border-[#28282b] rounded-lg px-3 py-1.5 text-zinc-200 max-w-[220px]">
              <span className="text-xs text-zinc-400 font-bold uppercase shrink-0">Drop A:</span>
              <select
                value={activeAId}
                onChange={(e) => dispatch(setSelectedDropA(e.target.value))}
                className="bg-transparent text-zinc-100 text-xs font-semibold focus:outline-none cursor-pointer truncate"
              >
                {drops.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#1c1c1f] text-zinc-100">
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-zinc-400 font-bold text-xs">vs</span>

            <div className="flex items-center gap-2 bg-[#1c1c1f] border border-[#28282b] rounded-lg px-3 py-1.5 text-zinc-200 max-w-[220px]">
              <span className="text-xs text-zinc-400 font-bold uppercase shrink-0">Drop B:</span>
              <select
                value={activeBId}
                onChange={(e) => dispatch(setSelectedDropB(e.target.value))}
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

      <p className="text-sm text-zinc-400">
        Audience reaction comparison across distinct teaser and trailer video drops stored in ClickHouse.
      </p>

      {isOpen && (
        <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-6 space-y-5 shadow-xs">
          {drops.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-sm italic">
              No video drops or trailer feeds ingested for this campaign yet. Connect a YouTube trailer above to populate drop comparisons.
            </div>
          ) : (
            <>
              {/* 2-Card Drop Milestone Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Drop A Card */}
                {dropA && (
                  <div className="bg-[#161618] border border-[#28282b] rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-[#242428] flex items-center justify-center text-zinc-300 shrink-0">
                          <Film className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-sm text-zinc-100 tracking-tight truncate max-w-[240px]" title={dropA.title}>
                          {dropA.title}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-zinc-300 bg-[#242428] px-2.5 py-1 rounded-md shrink-0">
                        {dropA.published_at}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center justify-between text-zinc-300">
                        <span>Audience Positive Score:</span>
                        <span className="font-mono text-[#4ade80] font-bold text-base">+{dropA.posPercent}%</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300">
                        <span>Comments Tracked:</span>
                        <span className="font-mono text-zinc-100 font-semibold">{dropA.total_comments.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300">
                        <span>Critical Drag:</span>
                        <span className="text-rose-400 font-mono font-semibold">-{dropA.negPercent}%</span>
                      </div>
                    </div>

                    {dropA.topComment ? (
                      <p className="text-sm text-zinc-200 italic border-l-3 border-zinc-600 pl-3 leading-relaxed pt-1">
                        "{dropA.topComment}"
                      </p>
                    ) : (
                      <p className="text-sm text-zinc-500 italic">Awaiting top comment quote.</p>
                    )}
                  </div>
                )}

                {/* Drop B Card */}
                {dropB && (
                  <div className="bg-[#161618] border border-[#28282b] rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-[#183424] flex items-center justify-center text-[#4ade80] shrink-0">
                          <Play className="h-4 w-4 fill-[#4ade80]" />
                        </div>
                        <span className="font-bold text-sm text-zinc-100 tracking-tight truncate max-w-[240px]" title={dropB.title}>
                          {dropB.title}
                        </span>
                      </div>
                      <span className={`font-mono text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1 shrink-0 ${
                        isSurge
                          ? "text-[#4ade80] bg-[#183424] border border-[#234e35]"
                          : "text-rose-400 bg-[#331b20] border border-[#4c242a]"
                      }`}>
                        {isSurge ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {isSurge ? `+${deltaSentiment}%` : `${deltaSentiment}%`}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center justify-between text-zinc-300">
                        <span>Audience Positive Score:</span>
                        <span className="font-mono text-[#4ade80] font-bold text-base">+{dropB.posPercent}%</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300">
                        <span>Comments Tracked:</span>
                        <span className="font-mono text-zinc-100 font-semibold">{dropB.total_comments.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300">
                        <span>Critical Drag:</span>
                        <span className="text-rose-400 font-mono font-semibold">-{dropB.negPercent}%</span>
                      </div>
                    </div>

                    {dropB.topComment ? (
                      <p className="text-sm text-zinc-200 italic border-l-3 border-[#4ade80]/70 pl-3 leading-relaxed pt-1">
                        "{dropB.topComment}"
                      </p>
                    ) : (
                      <p className="text-sm text-zinc-500 italic">Awaiting top comment quote.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Delta Takeaway Banner */}
              {dropA && dropB && dropA.id !== dropB.id && (
                <div className="bg-[#161618] border border-[#28282b] rounded-xl p-4 flex items-center gap-3.5 text-sm">
                  <div className="h-7 w-7 rounded-lg bg-[#242428] flex items-center justify-center text-[#e6fc4f] shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-zinc-200 font-sans leading-relaxed">
                    <strong className="text-white">Live Feedback Delta:</strong> Transitioning between tracked video releases produced a net excitement shift of <span className={`font-bold font-mono ${isSurge ? "text-[#4ade80]" : "text-rose-400"}`}>{isSurge ? `+${deltaSentiment}%` : `${deltaSentiment}%`}</span> across ClickHouse audience records.
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
