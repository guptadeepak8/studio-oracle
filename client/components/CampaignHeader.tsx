"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Play, Square, MessageSquare, RefreshCw, Trash2, Sparkles, Bot, ShieldCheck, Plus, Video } from "lucide-react";
import { Movie } from "../utils/types";
import { useCampaigns } from "../hooks/useCampaigns";
import DeleteConfirmModal from "./common/DeleteConfirmModal";
import AddVideoDropModal from "./AddVideoDropModal";
import { Badge, Button } from "./ui";

interface CampaignHeaderProps {
  campaign: Movie;
  onToggleStatus: () => void;
  isToggling: boolean;
  activeTab: "overview" | "marketing" | "agent";
  onTabChange: (tab: "overview" | "marketing" | "agent") => void;
  evidenceCount?: number;
  onRefreshData?: () => void;
  onSync1000Comments?: () => void;
  isSyncing?: boolean;
  agentStatus?: string;
}

export default function CampaignHeader({
  campaign,
  onToggleStatus,
  isToggling,
  activeTab,
  onTabChange,
  evidenceCount = 0,
  onRefreshData,
  onSync1000Comments,
  isSyncing = false,
  agentStatus = "Active",
}: CampaignHeaderProps) {
  const router = useRouter();
  const { deleteCampaign, isDeleting } = useCampaigns();
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddDropModal, setShowAddDropModal] = useState(false);

  const handleDeleteCampaign = async () => {
    const ok = await deleteCampaign(campaign.content_id, campaign.title);
    if (ok) {
      setShowDeleteModal(false);
      router.push("/");
    }
  };

  return (
    <div className="shrink-0 flex flex-col bg-[#141416] border-b border-[#202023] shadow-xs font-sans">
      <div className="px-8 py-3.5 flex items-center justify-between flex-wrap gap-4">
        {/* Left: Campaign Title & Tab Navigation */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-lg text-zinc-100 tracking-tight">
              {campaign.title}
            </h1>
            <Badge variant={campaign.status === "active" ? "active" : "stopped"}>
              {campaign.status === "active" ? "Active" : "Paused"}
            </Badge>
          </div>

          {/* Simple Mental Model Tabs: Overview | Recommendations | Ask AI */}
          <nav className="flex items-center bg-[#1b1b1e] border border-[#28282b] rounded-lg p-1 text-xs font-semibold">
            <button
              onClick={() => onTabChange("overview")}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === "overview"
                  ? "bg-[#28282d] text-zinc-100 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onTabChange("marketing")}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === "marketing"
                  ? "bg-[#28282d] text-zinc-100 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Recommendations
            </button>
            <button
              onClick={() => onTabChange("agent")}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeTab === "agent"
                  ? "bg-[#28282d] text-indigo-300 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sparkles className="h-3 w-3 text-indigo-400" />
              Ask AI
            </button>
          </nav>
        </div>

        {/* Right: Add Drop & Sync Button & Secondary Actions Menu */}
        <div className="flex items-center gap-2.5 relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddDropModal(true)}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Add Video Drop
          </Button>

          {onSync1000Comments && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onSync1000Comments}
              disabled={isSyncing}
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />}
            >
              {isSyncing ? "Syncing..." : "Sync Reactions"}
            </Button>
          )}

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              rightIcon={<ChevronDown className="h-4 w-4 text-zinc-400" />}
            >
              Actions
            </Button>

            {showActionsMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActionsMenu(false)} />
                <div className="absolute right-0 mt-2 bg-[#1c1c1f] border border-[#28282b] rounded-xl p-1.5 w-52 shadow-2xl z-20 text-sm text-zinc-300 font-sans space-y-0.5">
                  <Button
                    variant="menu-item"
                    size="sm"
                    onClick={() => {
                      onTabChange("marketing");
                      setShowActionsMenu(false);
                    }}
                  >
                    View Marketing Decisions
                  </Button>
                  <Button
                    variant="menu-item"
                    size="sm"
                    onClick={() => {
                      if (onRefreshData) onRefreshData();
                      setShowActionsMenu(false);
                    }}
                    leftIcon={<RefreshCw className="h-3.5 w-3.5 text-zinc-400" />}
                  >
                    Refresh Live Data
                  </Button>
                  
                  <div className="border-t border-[#28282b] my-1" />

                  <Button
                    variant="menu-item"
                    size="sm"
                    onClick={() => {
                      onToggleStatus();
                      setShowActionsMenu(false);
                    }}
                    disabled={isToggling}
                    leftIcon={
                      campaign.status === "stopped" ? (
                        <Play className="h-3.5 w-3.5 text-[#4ade80] fill-[#4ade80]" />
                      ) : (
                        <Square className="h-3.5 w-3.5 text-zinc-400 fill-zinc-400" />
                      )
                    }
                  >
                    {campaign.status === "stopped" ? "Resume Live Tracking" : "Pause Live Tracking"}
                  </Button>

                  <div className="border-t border-[#28282b] my-1" />

                  <Button
                    variant="menu-item-danger"
                    size="sm"
                    onClick={() => {
                      setShowActionsMenu(false);
                      setShowDeleteModal(true);
                    }}
                    leftIcon={<Trash2 className="h-3.5 w-3.5 text-rose-400" />}
                  >
                    Delete Campaign
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteCampaign}
        title={campaign.title}
        isDeleting={isDeleting}
      />

      {showAddDropModal && (
        <AddVideoDropModal
          contentId={campaign.content_id}
          campaignTitle={campaign.title}
          onClose={() => setShowAddDropModal(false)}
        />
      )}
    </div>
  );
}
