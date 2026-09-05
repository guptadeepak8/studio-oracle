"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Users, Play, Square, ArrowRight } from "lucide-react";
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
              {campaign.status === "stopped" && (
                <>
                  <span className="text-zinc-600">·</span>
                  <span className="text-amber-400 font-normal normal-case">Paused</span>
                </>
              )}
            </div>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowMenu(!showMenu)}
              className="text-zinc-400 hover:text-zinc-200"
            >
              <MoreVertical className="h-4.5 w-4.5" />
            </Button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 bg-[#1c1c1f] border border-[#28282b] rounded-xl p-1.5 w-48 shadow-2xl z-20 text-sm text-zinc-300 font-sans space-y-0.5">
                  <Button
                    variant="menu-item"
                    size="sm"
                    onClick={() => router.push(`/campaign/${campaign.content_id}?tab=overview`)}
                  >
                    Open Dashboard
                  </Button>
                  <Button
                    variant="menu-item"
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={isUpdatingStatus}
                    leftIcon={
                      campaign.status === "stopped" ? (
                        <Play className="h-3.5 w-3.5 text-[#4ade80] fill-[#4ade80]" />
                      ) : (
                        <Square className="h-3.5 w-3.5 text-zinc-400 fill-zinc-400" />
                      )
                    }
                  >
                    {campaign.status === "stopped" ? "Resume Tracking" : "Pause Tracking"}
                  </Button>
                  <div className="border-t border-[#28282b] my-1" />
                  <Button
                    variant="menu-item-danger"
                    size="sm"
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                  >
                    Delete Campaign
                  </Button>
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
          <Users className="h-4 w-4 text-indigo-400" />
          <span className="font-semibold">{evidenceCount !== null ? evidenceCount.toLocaleString() : "..."}</span>
          <span className="text-zinc-400 font-normal">reactions</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/campaign/${campaign.content_id}?tab=overview`)}
          rightIcon={<ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />}
          className="text-indigo-400 hover:text-indigo-300 font-bold"
        >
          Dashboard
        </Button>
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
