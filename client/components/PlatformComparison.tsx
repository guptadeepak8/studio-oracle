"use client";

import React from "react";
import { Video, MessageCircle } from "lucide-react";
import { Card, Badge } from "./ui";
import CollapsibleSection from "./common/CollapsibleSection";

export interface PlatformStats {
  total: number;
  posPercent: number;
  negPercent: number;
  topPositive: string;
  topNegative: string;
}

interface PlatformComparisonProps {
  platforms?: Record<string, PlatformStats>;
  dominantTopic: string;
}

export default function PlatformComparison({ platforms = {}, dominantTopic }: PlatformComparisonProps) {
  const yt = platforms["youtube"] || {
    total: 0,
    posPercent: 0,
    negPercent: 0,
    topPositive: "",
    topNegative: "",
  };

  const reddit = platforms["reddit"] || {
    total: 0,
    posPercent: 0,
    negPercent: 0,
    topPositive: "",
    topNegative: "",
  };

  return (
    <CollapsibleSection title="YouTube vs. Reddit Audience Reaction">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* YouTube Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Video className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
                YouTube Telemetry
              </span>
            </div>
            <Badge variant={yt.total > 0 && yt.posPercent >= 50 ? "positive" : "default"}>
              {yt.total > 0 ? (yt.posPercent >= 50 ? "Mostly Excited" : "Mixed Reception") : "Awaiting Data"}
            </Badge>
          </div>

          {yt.total > 0 && yt.topPositive ? (
            <p className="text-sm text-zinc-200 leading-relaxed italic border-l-3 border-[#4ade80]/70 pl-3.5 py-1">
              "{yt.topPositive}"
            </p>
          ) : (
            <p className="text-sm text-zinc-500 italic py-2">
              No YouTube comments tracked for this campaign yet.
            </p>
          )}

          <div className="pt-3 border-t border-[#28282b]/70 flex items-center justify-between text-xs text-zinc-300 font-medium">
            <span>{yt.total.toLocaleString()} Comments Analyzed</span>
            <span className="text-[#4ade80] font-mono font-bold text-sm">
              {yt.total > 0 ? `+${yt.posPercent}% Positive` : "0%"}
            </span>
          </div>
        </Card>

        {/* Reddit Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
                Reddit Discussions
              </span>
            </div>
            <Badge variant={reddit.total > 0 ? "negative" : "default"}>
              {reddit.total > 0 ? "Community Debate" : "Awaiting Data"}
            </Badge>
          </div>

          {reddit.total > 0 && (reddit.topNegative || reddit.topPositive) ? (
            <p className="text-sm text-zinc-200 leading-relaxed italic border-l-3 border-[#f87171]/70 pl-3.5 py-1">
              "{reddit.topNegative || reddit.topPositive}"
            </p>
          ) : (
            <p className="text-sm text-zinc-500 italic py-2">
              No Reddit discussion comments ingested yet.
            </p>
          )}

          <div className="pt-3 border-t border-[#28282b]/70 flex items-center justify-between text-xs text-zinc-300 font-medium">
            <span>{reddit.total.toLocaleString()} Discussions Ingested</span>
            <span className="text-[#f87171] font-mono font-bold text-sm">
              {reddit.total > 0 ? `-${reddit.negPercent}% Critical` : "0%"}
            </span>
          </div>
        </Card>
      </div>
    </CollapsibleSection>
  );
}
