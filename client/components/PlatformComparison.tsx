"use client";

import React from "react";
import { Video, Globe, Sparkles } from "lucide-react";
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

  const googleSearch = platforms["google_search"] || {
    total: 0,
    posPercent: 0,
    negPercent: 0,
    topPositive: "",
    topNegative: "",
  };

  return (
    <CollapsibleSection title="Audience Telemetry vs. Google Search Press Intelligence">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* YouTube Audience Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Video className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
                YouTube Audience Voice
              </span>
            </div>
            <Badge variant={yt.total > 0 && yt.posPercent >= 50 ? "positive" : "default"}>
              {yt.total > 0 ? (yt.posPercent >= 50 ? "Excited Fans" : "Mixed Reception") : "Awaiting Data"}
            </Badge>
          </div>

          {yt.total > 0 && yt.topPositive ? (
            <p className="text-sm text-zinc-200 leading-relaxed italic border-l-3 border-[#4ade80]/70 pl-3.5 py-1">
              "{yt.topPositive}"
            </p>
          ) : (
            <p className="text-sm text-zinc-500 italic py-2">
              No YouTube audience comments tracked yet.
            </p>
          )}

          <div className="pt-3 border-t border-[#28282b]/70 flex items-center justify-between text-xs text-zinc-300 font-medium">
            <span>{yt.total.toLocaleString()} Comments Analyzed</span>
            <span className="text-[#4ade80] font-mono font-bold text-sm">
              {yt.total > 0 ? `+${yt.posPercent}% Positive` : "0%"}
            </span>
          </div>
        </Card>

        {/* Google Search Press & Industry Grounding Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Globe className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
                Google Search Press Intelligence
              </span>
            </div>
            <Badge variant={googleSearch.total > 0 ? "info" : "default"}>
              {googleSearch.total > 0 ? "Industry & Press" : "Awaiting Search"}
            </Badge>
          </div>

          {googleSearch.total > 0 && (googleSearch.topPositive || googleSearch.topNegative) ? (
            <p className="text-sm text-zinc-200 leading-relaxed italic border-l-3 border-[#38bdf8]/70 pl-3.5 py-1">
              "{googleSearch.topPositive || googleSearch.topNegative}"
            </p>
          ) : (
            <p className="text-sm text-zinc-500 italic py-2">
              Google Search Grounding awaiting sync.
            </p>
          )}

          <div className="pt-3 border-t border-[#28282b]/70 flex items-center justify-between text-xs text-zinc-300 font-medium">
            <span>{googleSearch.total.toLocaleString()} Articles & Reviews Grounded</span>
            <span className="text-[#38bdf8] font-mono font-bold text-sm">
              {googleSearch.total > 0 ? `+${googleSearch.posPercent}% Sentiment` : "0%"}
            </span>
          </div>
        </Card>
      </div>
    </CollapsibleSection>
  );
}
