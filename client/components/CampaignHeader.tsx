"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Play, Square, MessageSquare, RefreshCw, Trash2, Sparkles, Bot, ShieldCheck } from "lucide-react";
import { Movie } from "../utils/types";
import { useCampaigns } from "../hooks/useCampaigns";
import DeleteConfirmModal from "./common/DeleteConfirmModal";
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
  agentStatus = "Live Tracking",
}: CampaignHeaderProps) {
  const router = useRouter();
  const { deleteCampaign, isDeleting } = useCampaigns();
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getPageTitle = () => {
    if (activeTab === "marketing") return `${campaign.title} / Recommendations`;
    if (activeTab === "agent") return `${campaign.title} / AI Assistant`;
    return `${campaign.title} / Overview`;
  };

  const handleDeleteCampaign = async () => {
    const ok = await deleteCampaign(campaign.content_id, campaign.title);
    if (ok) {
      setShowDeleteModal(false);
      router.push("/");
    }
  };

  return (
    <div className="shrink-0 flex flex-col bg-[#141416] border-b border-[#202023] shadow-xs font-sans">
      <div className="px-8 py-3.5 flex items-center justify-between flex-wrap gap-3">
        {/* Left Page Title */}
        <div className="flex items-center gap-3.5">
          <h1 className="font-bold text-lg text-zinc-100 tracking-tight">
            {getPageTitle()}
          </h1>
          <Badge variant={campaign.status === "active" ? "active" : "stopped"}>
            {campaign.status === "active" ? "Active" : "Paused"}
          </Badge>
        </div>

        {/* Right Actions & Sync Button */}
        <div className="flex items-center gap-3 relative">
          {onSync1000Comments && (
            <Button
              variant="primary"
              size="sm"
              onClick={onSync1000Comments}
              disabled={isSyncing}
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />}
            >
              {isSyncing ? "Syncing 1,000 Comments..." : "Sync 1,000 Comments"}
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onTabChange(activeTab === "agent" ? "overview" : "agent")}
            leftIcon={<MessageSquare className="h-4 w-4 text-indigo-400" />}
          >
            {activeTab === "agent" ? "Back to Dashboard" : "Ask AI Assistant"}
          </Button>

          <div className="relative">
            <Button
              variant="secondary"
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
    </div>
  );
}
