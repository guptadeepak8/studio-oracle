"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, ArrowRight, Play, Film, Sparkles, SlidersHorizontal, Eye } from "lucide-react";
import { Movie } from "../utils/types";
import { ThemeItem } from "../utils/analytics";

interface TrailerComparisonProps {
  campaign: Movie;
  themeStats: ThemeItem[];
}

interface DropMilestone {
  id: string;
  name: string;
  type: "teaser" | "trailer" | "tv_spot" | "clip";
  sentiment: number;
  highlight: string;
  friction: string;
  frictionShift: string;
  quote: string;
}

export default function TrailerComparison({ campaign, themeStats }: TrailerComparisonProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Available campaign drop milestones
  const AVAILABLE_DROPS: DropMilestone[] = [
    {
      id: "teaser",
      name: "Teaser Trailer Drop",
      type: "teaser",
      sentiment: 38,
      highlight: "Arena Scale & Colosseum VFX",
      friction: "Casting skepticism & music choice",
      frictionShift: "Baseline friction recorded",
      quote: "Looks visually massive, but hoping the dramatic tone matches the original masterwork.",
    },
    {
      id: "trailer_1",
      name: "Official Trailer #1",
      type: "trailer",
      sentiment: 48,
      highlight: "Colosseum scale & battle sequences",
      friction: "Story continuity & lore debate",
      frictionShift: "Initial fan discussion stabilizing",
      quote: "The scope is undeniable. Excited to see how the gladiatorial arenas come to life.",
    },
    {
      id: "trailer_2",
      name: "Official Trailer #2",
      type: "trailer",
      sentiment: 64,
      highlight: "Character dialogue & action pacing",
      friction: "Pacing concerns in third act",
      frictionShift: "Casting skepticism dropped by 42%",
      quote: "Trailer 2 completely sold me. The character dialogue and arena intensity look phenomenal.",
    },
    {
      id: "super_bowl",
      name: "Super Bowl TV Spot",
      type: "tv_spot",
      sentiment: 72,
      highlight: "High-octane arena chariot spectacle",
      friction: "Mainstream ticket price sensitivity",
      frictionShift: "General moviegoer awareness surged by 85%",
      quote: "The chariot battle in the arena looks breathtaking on TV broadcast.",
    },
    {
      id: "final_trailer",
      name: "Final IMAX Trailer",
      type: "trailer",
      sentiment: 81,
      highlight: "Full cast ensemble & IMAX aspect ratio",
      friction: "Runtime and ticket availability",
      frictionShift: "Core fandom sentiment overwhelmingly positive",
      quote: "Day one ticket booked. The cinematography and performances look legendary.",
    },
  ];

  const [dropAId, setDropAId] = useState<string>("teaser");
  const [dropBId, setDropBId] = useState<string>("trailer_2");

  const dropA = AVAILABLE_DROPS.find((d) => d.id === dropAId) || AVAILABLE_DROPS[0];
  const dropB = AVAILABLE_DROPS.find((d) => d.id === dropBId) || AVAILABLE_DROPS[2];

  const deltaSentiment = dropB.sentiment - dropA.sentiment;
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
          <span>What Changed: Campaign Drop & Milestone Comparison</span>
        </button>

        {/* Milestone Drop Selectors */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-[#1c1c1f] border border-[#28282b] rounded-lg px-2.5 py-1 text-zinc-300">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Baseline:</span>
            <select
              value={dropAId}
              onChange={(e) => setDropAId(e.target.value)}
              className="bg-transparent text-zinc-100 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {AVAILABLE_DROPS.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#1c1c1f] text-zinc-100">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-zinc-500 font-bold">vs</span>

          <div className="flex items-center gap-1.5 bg-[#1c1c1f] border border-[#28282b] rounded-lg px-2.5 py-1 text-zinc-300">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Compare:</span>
            <select
              value={dropBId}
              onChange={(e) => setDropBId(e.target.value)}
              className="bg-transparent text-zinc-100 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {AVAILABLE_DROPS.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#1c1c1f] text-zinc-100">
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Compare sentiment inflection, highlight shifts, and friction reduction between any two teaser, trailer, or TV spot releases.
      </p>

      {isOpen && (
        <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-5 space-y-4 shadow-xs">
          {/* 2-Card Drop Milestone Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Drop A Card */}
            <div className="bg-[#161618] border border-[#28282b] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-[#242428] flex items-center justify-center text-zinc-400">
                    <Film className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-xs text-zinc-200 uppercase tracking-wider">
                    {dropA.name}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-zinc-300 bg-[#242428] px-2 py-0.5 rounded">
                  Baseline Drop
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Audience Positive Score:</span>
                  <span className="font-mono text-zinc-200 font-bold">+{dropA.sentiment}%</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Primary Highlight:</span>
                  <span className="text-zinc-200 font-medium">{dropA.highlight}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Identified Friction:</span>
                  <span className="text-rose-400 font-medium">{dropA.friction}</span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 italic border-l-2 border-zinc-600 pl-2.5 leading-relaxed pt-1">
                "{dropA.quote}"
              </p>
            </div>

            {/* Drop B Card */}
            <div className="bg-[#161618] border border-[#28282b] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-[#183424] flex items-center justify-center text-[#4ade80]">
                    <Play className="h-3.5 w-3.5 fill-[#4ade80]" />
                  </div>
                  <span className="font-bold text-xs text-zinc-100 uppercase tracking-wider">
                    {dropB.name}
                  </span>
                </div>
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                  isSurge
                    ? "text-[#4ade80] bg-[#183424] border border-[#234e35]"
                    : "text-rose-400 bg-[#331b20] border border-[#4c242a]"
                }`}>
                  {isSurge ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isSurge ? `+${deltaSentiment}% Surge` : `${deltaSentiment}% Drag`}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Audience Positive Score:</span>
                  <span className="font-mono text-[#4ade80] font-bold">+{dropB.sentiment}%</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Primary Highlight:</span>
                  <span className="text-zinc-100 font-medium">{dropB.highlight}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Friction Shift:</span>
                  <span className="text-[#4ade80] font-medium">{dropB.frictionShift}</span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-300 italic border-l-2 border-[#4ade80]/60 pl-2.5 leading-relaxed pt-1">
                "{dropB.quote}"
              </p>
            </div>
          </div>

          {/* Bottom Delta Takeaway Banner */}
          <div className="bg-[#161618] border border-[#28282b] rounded-lg p-3.5 flex items-center gap-3 text-xs">
            <div className="h-6 w-6 rounded bg-[#242428] flex items-center justify-center text-[#e6fc4f] shrink-0">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 text-zinc-300 font-sans leading-relaxed">
              <strong className="text-zinc-100">Executive Drop Takeaway:</strong> Transitioning from <span className="font-bold text-zinc-100">{dropA.name}</span> to <span className="font-bold text-zinc-100">{dropB.name}</span> shifted net excitement from +{dropA.sentiment}% to +{dropB.sentiment}% ({isSurge ? `+${deltaSentiment}% increase` : `${deltaSentiment}% decrease`}).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
