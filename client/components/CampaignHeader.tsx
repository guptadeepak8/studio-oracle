"use client";

import React, { useState } from "react";
import { ChevronDown, Play, Square, MessageSquare, Download, RefreshCw, Radio } from "lucide-react";
import { Movie } from "../utils/types";

interface CampaignHeaderProps {
  campaign: Movie;
  onToggleStatus: () => void;
  isToggling: boolean;
  activeTab: "overview" | "marketing" | "agent";
  onTabChange: (tab: "overview" | "marketing" | "agent") => void;
  evidenceCount?: number;
  onRefreshData?: () => void;
}

export default function CampaignHeader({
  campaign,
  onToggleStatus,
  isToggling,
  activeTab,
  onTabChange,
  evidenceCount = 0,
  onRefreshData,
}: CampaignHeaderProps) {
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const getPageTitle = () => {
    if (activeTab === "marketing") return `${campaign.title} / Marketing`;
    if (activeTab === "agent") return `${campaign.title} / Assistant`;
    return `${campaign.title} / Dashboard`;
  };

  return (
    <div className="shrink-0 flex flex-col bg-[#141416] border-b border-[#202023] shadow-xs">
      <div className="px-8 py-4 flex items-center justify-between">
        {/* Left Page Title matching screenshot header */}
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-base text-zinc-100 tracking-tight">
            {getPageTitle()}
          </h1>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            campaign.status === "active"
              ? "bg-[#183424] text-[#4ade80] border border-[#234e35]"
              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
          }`}>
            {campaign.status === "active" ? "Active" : "Paused"}
          </span>
        </div>

        {/* Right Actions Dropdown matching screenshot */}
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => onTabChange(activeTab === "agent" ? "overview" : "agent")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#1f1f23] hover:bg-[#28282d] text-zinc-200 border border-[#2d2d32] transition cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5 text-[#e6fc4f]" />
            <span>{activeTab === "agent" ? "Back to Dashboard" : "Ask AI Assistant"}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="flex items-center gap-1.5 bg-[#1f1f23] hover:bg-[#28282d] text-zinc-100 font-semibold px-3 py-1.5 rounded-md text-xs border border-[#2d2d32] transition cursor-pointer"
            >
              <span>Actions</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </button>

            {showActionsMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActionsMenu(false)} />
                <div className="absolute right-0 mt-1.5 bg-[#1c1c1f] border border-[#28282b] rounded-lg py-1.5 w-48 shadow-2xl z-20 text-xs text-zinc-300">
                  <button
                    onClick={() => {
                      onTabChange("marketing");
                      setShowActionsMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#242428] hover:text-zinc-100 transition font-medium cursor-pointer"
                  >
                    View Marketing Plan
                  </button>
                  <button
                    onClick={() => {
                      if (onRefreshData) onRefreshData();
                      setShowActionsMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#242428] hover:text-zinc-100 transition font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3 text-zinc-400" /> Refresh Telemetry
                  </button>
                  <div className="border-t border-[#28282b] my-1" />
                  <button
                    onClick={() => {
                      onToggleStatus();
                      setShowActionsMenu(false);
                    }}
                    disabled={isToggling}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#242428] transition font-medium flex items-center gap-2 cursor-pointer"
                  >
                    {campaign.status === "stopped" ? (
                      <>
                        <Play className="h-3 w-3 text-[#4ade80] fill-[#4ade80]" /> Resume Telemetry
                      </>
                    ) : (
                      <>
                        <Square className="h-3 w-3 text-zinc-400 fill-zinc-400" /> Pause Telemetry
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
