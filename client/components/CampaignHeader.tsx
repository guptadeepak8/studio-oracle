"use client";

import React from "react";
import { Play, Square, MessageSquare, Database } from "lucide-react";
import { Movie } from "../utils/types";

interface CampaignHeaderProps {
  campaign: Movie;
  onToggleStatus: () => void;
  isToggling: boolean;
  activeTab: "overview" | "marketing" | "agent";
  onTabChange: (tab: "overview" | "marketing" | "agent") => void;
  evidenceCount?: number;
}

export default function CampaignHeader({
  campaign,
  onToggleStatus,
  isToggling,
  activeTab,
  onTabChange,
  evidenceCount = 0,
}: CampaignHeaderProps) {
  return (
    <div className="shrink-0 flex flex-col bg-[#0c0c0e] border-b border-[#27272a] shadow-sm">
      <div className="px-8 py-5 flex items-center justify-between">
        {/* Left Title & Status */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-xl text-zinc-100 tracking-tight">
              {campaign.title}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              campaign.status === "active"
                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                : campaign.status === "collecting"
                ? "bg-amber-950/60 text-amber-400 border border-amber-500/40 animate-pulse"
                : "bg-rose-950/60 text-rose-400 border border-rose-500/40"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                campaign.status === "active" ? "bg-emerald-400" : campaign.status === "collecting" ? "bg-amber-400" : "bg-rose-400"
              }`} />
              {campaign.status === "active" ? "Tracking Active" : campaign.status === "collecting" ? "Importing" : "Paused"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
            <span className="capitalize text-zinc-200 font-semibold">{campaign.content_type}</span>
            <span className="text-zinc-600">·</span>
            <span>Target Release: <strong className="text-zinc-200">{campaign.release_date || "TBD"}</strong></span>
            <span className="text-zinc-600">·</span>
            <span className="flex items-center gap-1 text-zinc-300">
              <Database className="h-3 w-3 text-amber-500" />
              <strong>{evidenceCount}</strong> audience comments
            </span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleStatus}
            disabled={isToggling}
            className={`flex items-center gap-1.5 border px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              campaign.status === "stopped"
                ? "bg-emerald-600/10 border-emerald-500/30 hover:bg-emerald-600/20 text-emerald-400"
                : "bg-[#18181b] border-[#27272a] hover:bg-zinc-800 text-zinc-300"
            }`}
          >
            {campaign.status === "stopped" ? (
              <>
                <Play className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" /> Resume Tracking
              </>
            ) : (
              <>
                <Square className="h-3.5 w-3.5 fill-zinc-300 text-zinc-300" /> Pause Tracking
              </>
            )}
          </button>

          {activeTab !== "agent" ? (
            <button
              onClick={() => onTabChange("agent")}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Ask AI Assistant</span>
            </button>
          ) : (
            <button
              onClick={() => onTabChange("overview")}
              className="flex items-center gap-2 bg-[#18181b] hover:bg-zinc-800 text-zinc-200 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer border border-[#27272a]"
            >
              <span>Back to Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
