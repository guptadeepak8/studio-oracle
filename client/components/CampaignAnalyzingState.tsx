"use client";

import React from "react";
import { Loader2, MessageSquare, Video, BarChart2, RefreshCw } from "lucide-react";
import { Button } from "./ui";

interface CampaignAnalyzingStateProps {
  campaignTitle: string;
  isIngesting?: boolean;
  onRefresh?: () => void;
  onStartIngest?: () => void;
}

export default function CampaignAnalyzingState({
  campaignTitle,
  isIngesting = true,
  onRefresh,
  onStartIngest,
}: CampaignAnalyzingStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto my-auto text-center font-sans">
      <div className="w-full bg-[#141416] border border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        {/* Top Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          Processing Audience Data
        </div>

        <h2 className="text-xl font-bold text-zinc-100 tracking-tight mb-2">
          Analyzing Audience Feedback for &ldquo;{campaignTitle}&rdquo;
        </h2>
        <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed mb-8">
          We are reading audience comments and building your video cutdown scripts, ad copy, and channel recommendations.
        </p>

        {/* Step Checklist */}
        <div className="space-y-3.5 text-left max-w-md mx-auto mb-8 bg-zinc-900/60 p-4 rounded-lg border border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-zinc-200">1. Reading comments from video drops</div>
              <div className="text-[11px] text-zinc-400">Pulling real audience reactions and quotes</div>
            </div>
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
              <BarChart2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-zinc-300">2. Identifying what works & what does not</div>
              <div className="text-[11px] text-zinc-400">Sorting positive, neutral, and critical feedback</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-zinc-700 shrink-0" />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
              <Video className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-zinc-300">3. Building marketing deliverables</div>
              <div className="text-[11px] text-zinc-400">Generating 15s/30s cutdown scripts & ad variants</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-zinc-700 shrink-0" />
          </div>
        </div>

        {/* Live sync note & manual action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800/80 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>Listening for live updates — this screen will load automatically.</span>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onRefresh}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Check Status
              </Button>
            )}
            {onStartIngest && (
              <Button
                variant="primary"
                size="sm"
                onClick={onStartIngest}
                isLoading={isIngesting}
              >
                Fetch Comments
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
