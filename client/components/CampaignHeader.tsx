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
    <div className="shrink-0 flex flex-col">
      {/* Upper header */}
      <div className="p-4 border-b border-zinc-800 bg-[#0e0e11] flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-bold text-lg text-zinc-100 tracking-tight uppercase flex items-center gap-2">
            {campaign.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase font-semibold">
            <span>{campaign.content_type}</span>
            <span>·</span>
            <div className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${
                campaign.status === "active"
                  ? "bg-emerald-500 animate-pulse"
                  : campaign.status === "collecting"
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`} />
              <span>{campaign.status}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleStatus}
            disabled={isToggling}
            className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              campaign.status === "stopped"
                ? "bg-emerald-600 border-emerald-500 hover:bg-emerald-500 text-white"
                : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300"
            }`}
          >
            {campaign.status === "stopped" ? (
              <>
                <Play className="h-3 w-3 fill-white" /> Start
              </>
            ) : (
              <>
                <Square className="h-3 w-3 fill-zinc-300" /> Stop
              </>
            )}
          </button>

          {activeTab !== "agent" && (
            <button
              onClick={() => onTabChange("agent")}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" /> Ask StudioOracle
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="px-5 border-b border-zinc-800 bg-[#0e0e11]/50 flex gap-4 text-xs font-bold uppercase tracking-wider">
        {(["overview", "intelligence", "evidence", "agent"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`py-3.5 border-b-2 px-1 transition cursor-pointer ${
              activeTab === tab
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-zinc-500 hover:text-zinc-350"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
