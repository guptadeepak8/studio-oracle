"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Video, MessageCircle } from "lucide-react";
import { ConflictItem } from "../utils/analytics";

interface PlatformComparisonProps {
  conflicts: ConflictItem[];
  dominantTopic: string;
}

export default function PlatformComparison({ conflicts, dominantTopic }: PlatformComparisonProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-3 font-sans">
      {/* Section Header with Chevron matching screenshot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm font-bold text-zinc-100 hover:text-[#e6fc4f] transition cursor-pointer select-none"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-zinc-400" />
        )}
        <span>YouTube vs. Reddit Audience Reaction</span>
      </button>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* YouTube Card */}
          <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Video className="h-3.5 w-3.5" />
                </div>
                <span className="font-bold text-xs text-zinc-100 uppercase tracking-wider">
                  YouTube (Mainstream Viewers)
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#4ade80] bg-[#183424] border border-[#234e35] px-2.5 py-0.5 rounded-full">
                Mostly Excited
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed italic border-l-2 border-[#4ade80]/60 pl-3">
              {conflicts.length > 0 && conflicts[0].positive.text
                ? `"${conflicts[0].positive.text}"`
                : `"The trailer scale and battle cinematography look absolutely incredible on the big screen."`}
            </p>

            <div className="pt-2 border-t border-[#28282b]/60 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Primary Driver: Arena Spectacle & Scale</span>
              <span className="text-[#e6fc4f] font-mono font-semibold">78% Positive</span>
            </div>
          </div>

          {/* Reddit Card */}
          <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <MessageCircle className="h-3.5 w-3.5" />
                </div>
                <span className="font-bold text-xs text-zinc-100 uppercase tracking-wider">
                  Reddit (Cinephiles & Core Fandom)
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#f87171] bg-[#331b20] border border-[#4c242a] px-2.5 py-0.5 rounded-full">
                Vocal Debate
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed italic border-l-2 border-[#f87171]/60 pl-3">
              {conflicts.length > 0 && conflicts[0].negative.text
                ? `"${conflicts[0].negative.text}"`
                : `"Debating whether the storyline continuity and character motivations will match the original."`}
            </p>

            <div className="pt-2 border-t border-[#28282b]/60 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Friction Point: Lore & Casting Doubts</span>
              <span className="text-[#f87171] font-mono font-semibold">54% Critical</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
