"use client";

import React from "react";
import { TrendingUp, TrendingDown, Film, Play, Sparkles } from "lucide-react";
import { Movie } from "../utils/types";
import { useAppDispatch, useAppSelector } from "../store";
import { setSelectedDropA, setSelectedDropB } from "../store/slices/dashboardSlice";
import { Card, Badge, Button } from "./ui";
import CollapsibleSection from "./common/CollapsibleSection";

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
    <CollapsibleSection
      title="What Changed"
      subtitle="Audience response across trailer releases and creative milestone drops."
      headerAction={
        drops.length > 1 ? (
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
        ) : undefined
      }
    >
      <Card className="p-6 space-y-5">
        {drops.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-sm italic">
            No trailer drops or video milestones recorded yet.
          </div>
        ) : drops.length === 1 ? (
          /* Single Trailer Milestone View */
          <div className="bg-[#161618] border border-[#28282b] rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Film className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-zinc-100 tracking-tight" title={dropA.title}>
                    {dropA.title}
                  </h4>
                  <span className="text-xs text-zinc-400">Published {dropA.published_at}</span>
                </div>
              </div>
              <Badge variant="positive">
                Primary Campaign Drop
              </Badge>
            </div>

            <p className="text-sm font-semibold text-zinc-200 leading-relaxed bg-[#1b1b1e] p-3.5 rounded-lg border border-[#28282c]">
              Following the release of <strong>"{dropA.title}"</strong>, positive audience excitement reached <strong>+{dropA.posPercent}%</strong> across {dropA.total_comments.toLocaleString()} tracked reactions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="bg-[#1c1c1f] border border-[#28282b] rounded-lg p-3.5 space-y-1">
                <span className="text-xs text-zinc-400 font-semibold uppercase">Positive Excitement</span>
                <div className="text-xl font-bold font-mono text-[#4ade80]">+{dropA.posPercent}%</div>
                <span className="text-[11px] text-zinc-400">Strong resonance</span>
              </div>
              <div className="bg-[#1c1c1f] border border-[#28282b] rounded-lg p-3.5 space-y-1">
                <span className="text-xs text-zinc-400 font-semibold uppercase">Audience Reactions</span>
                <div className="text-xl font-bold font-mono text-zinc-100">{dropA.total_comments.toLocaleString()}</div>
                <span className="text-[11px] text-zinc-400">Total verified comments</span>
              </div>
              <div className="bg-[#1c1c1f] border border-[#28282b] rounded-lg p-3.5 space-y-1">
                <span className="text-xs text-zinc-400 font-semibold uppercase">Critical Drag</span>
                <div className="text-xl font-bold font-mono text-rose-400">-{dropA.negPercent}%</div>
                <span className="text-[11px] text-zinc-400">Friction topics</span>
              </div>
            </div>

            {dropA.topComment && (
              <div className="pt-3 border-t border-[#28282b]/60">
                <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1">
                  Top Audience Quote
                </span>
                <p className="text-sm text-zinc-200 italic border-l-2 border-[#4ade80] pl-3 py-1">
                  &ldquo;{dropA.topComment}&rdquo;
                </p>
              </div>
            )}

            <div className="pt-1">
              <a
                href={dropA.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-bold"
              >
                <Play className="h-3.5 w-3.5 fill-indigo-400" /> Watch Trailer on YouTube
              </a>
            </div>
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
                    <Badge variant="default">
                      {dropA.published_at}
                    </Badge>
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

                  {dropA.topComment && (
                    <div className="pt-3 border-t border-[#28282b]/60">
                      <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1">
                        Top Fan Resonance
                      </span>
                      <p className="text-sm text-zinc-200 italic line-clamp-2">
                        &ldquo;{dropA.topComment}&rdquo;
                      </p>
                    </div>
                  )}

                  <a
                    href={dropA.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-bold pt-1"
                  >
                    <Play className="h-3.5 w-3.5 fill-indigo-400" /> Watch Trailer Video
                  </a>
                </div>
              )}

              {/* Drop B Card */}
              {dropB && (
                <div className="bg-[#161618] border border-[#28282b] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-[#242428] flex items-center justify-center text-zinc-300 shrink-0">
                        <Film className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm text-zinc-100 tracking-tight truncate max-w-[240px]" title={dropB.title}>
                        {dropB.title}
                      </span>
                    </div>
                    <Badge variant="default">
                      {dropB.published_at}
                    </Badge>
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

                  {dropB.topComment && (
                    <div className="pt-3 border-t border-[#28282b]/60">
                      <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1">
                        Top Fan Resonance
                      </span>
                      <p className="text-sm text-zinc-200 italic line-clamp-2">
                        "{dropB.topComment}"
                      </p>
                    </div>
                  )}

                  <a
                    href={dropB.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-bold pt-1"
                  >
                    <Play className="h-3.5 w-3.5 fill-indigo-400" /> Watch Trailer Video
                  </a>
                </div>
              )}
            </div>

            {/* Inflection Takeaway */}
            {dropA && dropB && dropA.id !== dropB.id && (
              <div className="pt-4 border-t border-[#28282b] flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    isSurge ? "bg-[#183424] text-[#4ade80]" : "bg-[#331b20] text-[#f87171]"
                  }`}>
                    {isSurge ? <TrendingUp className="h-4.5 w-4.5" /> : <TrendingDown className="h-4.5 w-4.5" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-zinc-100">
                      {isSurge ? "Positive Shift Detected" : "Drag Inflection Detected"}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {isSurge
                        ? `Audience excitement gained +${deltaSentiment}% positive resonance between ${dropA.published_at} and ${dropB.published_at}.`
                        : `Audience sentiment decreased by ${Math.abs(deltaSentiment)}% between drops.`}
                    </div>
                  </div>
                </div>

                <Badge variant={isSurge ? "positive" : "negative"}>
                  {isSurge ? `+${deltaSentiment}% Momentum` : `${deltaSentiment}% Sentiment Shift`}
                </Badge>
              </div>
            )}
          </>
        )}
      </Card>
    </CollapsibleSection>
  );
}
