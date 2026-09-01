"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Play, Square, MessageSquare, RefreshCw, Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { Movie } from "../utils/types";
import { API_ENDPOINTS } from "../utils/constants";
import { toast } from "sonner";

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
  const router = useRouter();
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getPageTitle = () => {
    if (activeTab === "marketing") return `${campaign.title} / Marketing`;
    if (activeTab === "agent") return `${campaign.title} / Assistant`;
    return `${campaign.title} / Dashboard`;
  };

  const handleDeleteCampaign = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(API_ENDPOINTS.DELETE_CAMPAIGN(campaign.content_id), {
        method: "DELETE",
      });
      if (res.ok) {
        window.dispatchEvent(new Event("refresh-campaigns"));
        toast.success(`"${campaign.title}" deleted and audience records purged.`);
        router.push("/");
      } else {
        toast.error("Failed to delete campaign.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error deleting campaign.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="shrink-0 flex flex-col bg-[#141416] border-b border-[#202023] shadow-xs font-sans">
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
                <div className="absolute right-0 mt-1.5 bg-[#1c1c1f] border border-[#28282b] rounded-lg py-1.5 w-48 shadow-2xl z-20 text-xs text-zinc-300 font-sans">
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
                    <RefreshCw className="h-3 w-3 text-zinc-400" /> Refresh Live Data
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
                        <Play className="h-3 w-3 text-[#4ade80] fill-[#4ade80]" /> Resume Live Tracking
                      </>
                    ) : (
                      <>
                        <Square className="h-3 w-3 text-zinc-400 fill-zinc-400" /> Pause Live Tracking
                      </>
                    )}
                  </button>

                  <div className="border-t border-[#28282b] my-1" />

                  {/* Delete Campaign Action */}
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setShowActionsMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3 text-rose-400" /> Delete Campaign
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Campaign Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#1c1c1f] border border-[#28282b] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Delete Campaign</span>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Are you sure you want to delete <strong className="text-white font-bold">{campaign.title}</strong>? This will permanently delete the campaign record and purge all stored audience comments and sentiment analytics from ClickHouse.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#28282b]">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:bg-[#28282b] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCampaign}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
