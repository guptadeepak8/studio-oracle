"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Database, Play, Square, ArrowRight } from "lucide-react";
import { API_ENDPOINTS } from "../utils/constants";
import { Movie, Comment } from "../utils/types";
import { useCampaigns } from "../hooks/useCampaigns";
import DeleteConfirmModal from "./common/DeleteConfirmModal";
import { Card, CardTitle, CardDescription, CardFooter, Badge, Button } from "./ui";
import { apiRequest } from "../utils/apiClient";

interface CampaignCardProps {
  campaign: Movie;
  onRefresh?: () => void;
}

export default function CampaignCard({ campaign, onRefresh }: CampaignCardProps) {
  const router = useRouter();
  const { updateStatus, deleteCampaign, isDeleting, isUpdatingStatus } = useCampaigns();
  const [evidenceCount, setEvidenceCount] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadEvidence() {
      try {
        const data = await apiRequest<Comment[]>(API_ENDPOINTS.COMMENTS(campaign.content_id), {
          suppressErrorToast: true,
        });
        setEvidenceCount(data?.length || 0);
      } catch {
        setEvidenceCount(0);
      }
    }
    loadEvidence();
  }, [campaign.content_id]);

  const handleToggleStatus = async () => {
    const nextStatus = campaign.status === "stopped" ? "active" : "stopped";
    const ok = await updateStatus(campaign.content_id, nextStatus, campaign.title);
    if (ok) {
      setShowMenu(false);
      if (onRefresh) onRefresh();
    }
  };

  const handleDelete = async () => {
    const ok = await deleteCampaign(campaign.content_id, campaign.title);
    if (ok) {
      setShowDeleteConfirm(false);
      if (onRefresh) onRefresh();
    }
  };

  return (
    <Card className="flex flex-col justify-between gap-5 relative font-sans">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle className="truncate max-w-[230px]" title={campaign.title}>
              {campaign.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-semibold uppercase">
              <span>{campaign.content_type}</span>
              <span className="text-zinc-600">·</span>
              <Badge variant={campaign.status === "active" ? "active" : "stopped"}>
                {campaign.status === "active" ? "Active" : "Paused"}
              </Badge>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-[#28282d] rounded-lg text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            >
              <MoreVertical className="h-4.5 w-4.5" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 bg-[#1c1c1f] border border-[#28282b] rounded-xl py-2 w-48 shadow-2xl z-20 text-sm text-zinc-300 font-sans">
                  <button
                    onClick={() => router.push(`/campaign/${campaign.content_id}?tab=overview`)}
                    className="w-full text-left px-4 py-2 hover:bg-[#242428] hover:text-zinc-100 transition font-medium cursor-pointer"
                  >
                    Open Dashboard
                  </button>
                  <button
                    onClick={handleToggleStatus}
                    disabled={isUpdatingStatus}
                    className="w-full text-left px-4 py-2 hover:bg-[#242428] hover:text-zinc-100 transition font-medium flex items-center gap-2 cursor-pointer"
                  >
                    {campaign.status === "stopped" ? (
                      <>
                        <Play className="h-3.5 w-3.5 text-[#4ade80] fill-[#4ade80]" /> Resume Tracking
                      </>
                    ) : (
                      <>
                        <Square className="h-3.5 w-3.5 text-zinc-400 fill-zinc-400" /> Pause Tracking
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition font-medium border-t border-[#28282b] mt-1 pt-2 flex items-center gap-2 cursor-pointer"
                  >
                    Delete Campaign
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <CardDescription className="line-clamp-2">
          {campaign.description}
        </CardDescription>
      </div>

      <CardFooter className="pt-3">
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <Database className="h-4 w-4 text-[#e6fc4f]" />
          <span className="font-semibold">{evidenceCount !== null ? evidenceCount.toLocaleString() : "..."}</span>
          <span className="text-zinc-400 font-normal">comments</span>
        </div>

        <button
          onClick={() => router.push(`/campaign/${campaign.content_id}?tab=overview`)}
          className="flex items-center gap-1.5 text-sm font-bold text-[#e6fc4f] hover:text-[#d8ed47] hover:underline cursor-pointer group"
        >
          <span>Dashboard</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
        </button>
      </CardFooter>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={campaign.title}
        isDeleting={isDeleting}
      />
    </Card>
  );
}
