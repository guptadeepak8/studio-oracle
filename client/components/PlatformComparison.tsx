"use client";

import React from "react";
import { Video, MessageCircle, ArrowRightLeft } from "lucide-react";
import { ConflictItem } from "../utils/analytics";

interface PlatformComparisonProps {
  conflicts: ConflictItem[];
  dominantTopic: string;
}

export default function PlatformComparison({ conflicts, dominantTopic }: PlatformComparisonProps) {
  return (
    <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-6 space-y-5 shadow-sm font-sans">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
        <div>
          <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
            YouTube vs. Reddit Reaction
          </h3>
          <p className="text-xs text-zinc-400">
            How mainstream video viewers compare to hardcore community discussions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* YouTube Card */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Video className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold text-xs text-zinc-100 uppercase tracking-wider">
                YouTube (Mainstream Audience)
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Mostly Excited
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed italic border-l-2 border-emerald-500/40 pl-3">
            {conflicts.length > 0 && conflicts[0].positive.text
              ? `"${conflicts[0].positive.text}"`
              : `"The trailer scale and battle cinematography look absolutely incredible on the big screen."`}
          </p>
          <span className="text-[10px] text-zinc-400 block">
            Focus: High appreciation for visual scale, sound design, and action setpieces.
          </span>
        </div>

        {/* Reddit Card */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <MessageCircle className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold text-xs text-zinc-100 uppercase tracking-wider">
                Reddit (Core Cinephiles & Fans)
              </span>
            </div>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded-full">
              Vocal Debate
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed italic border-l-2 border-rose-500/40 pl-3">
            {conflicts.length > 0 && conflicts[0].negative.text
              ? `"${conflicts[0].negative.text}"`
              : `"Discussing whether the plot pacing and character arcs will live up to the original masterpiece."`}
          </p>
          <span className="text-[10px] text-zinc-400 block">
            Focus: Scrutiny regarding storyline continuity, character motivations, and practical vs CGI effects.
          </span>
        </div>
      </div>
    </div>
  );
}
