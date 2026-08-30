"use client";

import React from "react";
import { Play, Square, MessageSquare } from "lucide-react";
import { Movie } from "../utils/types";

interface CampaignHeaderProps {
  campaign: Movie;
  onToggleStatus: () => void;
  isToggling: boolean;
  activeTab: "overview" | "intelligence" | "evidence" | "agent";
  onTabChange: (tab: "overview" | "intelligence" | "evidence" | "agent") => void;
}

export default function CampaignHeader({
  campaign,
  onToggleStatus,
  isToggling,
  activeTab,
  onTabChange,
}: CampaignHeaderProps) {
  return (
    <div className="shrink-0 flex flex-col bg-[#0a0a0c] border-b border-[#1a1a1f]">
      {/* Upper header */}
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-bold text-lg text-zinc-100 tracking-tight">
            {campaign.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <span className="capitalize">{campaign.content_type}</span>
            <span className="text-zinc-600">·</span>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${
                campaign.status === "active"
                  ? "bg-emerald-500"
                  : campaign.status === "collecting"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-rose-500"
              }`} />
              <span className="capitalize">{campaign.status}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleStatus}
            disabled={isToggling}
            className={`flex items-center gap-1.5 border px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition cursor-pointer ${
              campaign.status === "stopped"
                ? "bg-emerald-600/10 border-emerald-500/20 hover:bg-emerald-600/20 text-emerald-400"
                : "bg-transparent border-[#232329] hover:bg-[#131316] text-zinc-300"
            }`}
          >
            {campaign.status === "stopped" ? (
              <>
                <Play className="h-3 w-3 fill-emerald-400 text-emerald-400" /> Start tracking
              </>
            ) : (
              <>
                <Square className="h-3 w-3 fill-zinc-300 text-zinc-350" /> Stop tracking
              </>
            )}
          </button>

          {activeTab !== "agent" && (
            <button
              onClick={() => onTabChange("agent")}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded text-xs font-semibold tracking-wide transition cursor-pointer border border-amber-600 hover:border-amber-500 shadow-sm"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Ask StudioOracle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
