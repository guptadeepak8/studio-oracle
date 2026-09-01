"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Database, Play, Square, Loader2, ArrowRight } from "lucide-react";
import { API_ENDPOINTS } from "../utils/constants";
import { Movie, Comment } from "../utils/types";
import { toast } from "sonner";

interface CampaignCardProps {
  campaign: Movie;
  onRefresh: () => void;
}

export default function CampaignCard({ campaign, onRefresh }: CampaignCardProps) {
  const router = useRouter();
  const [evidenceCount, setEvidenceCount] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    async function loadEvidence() {
      try {
        const res = await fetch(API_ENDPOINTS.COMMENTS(campaign.content_id));
        if (res.ok) {
          const data = (await res.json()) as Comment[];
          setEvidenceCount(data.length);
        }
      } catch (err) {
        console.error("Error loading evidence for card:", err);
      }
    }
    loadEvidence();
  }, [campaign.content_id]);

  const handleToggleStatus = async () => {
    setIsToggling(true);
    const nextStatus = campaign.status === "stopped" ? "active" : "stopped";
    try {
      const res = await fetch(API_ENDPOINTS.CAMPAIGN_STATUS(campaign.content_id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        window.dispatchEvent(new Event("refresh-campaigns"));
        onRefresh();
        if (nextStatus === "active") {
          toast.success(`"${campaign.title}" live tracking resumed.`);
        } else {
          toast.info(`"${campaign.title}" live tracking paused.`);
        }
      } else {
        toast.error("Failed to update campaign tracking status.");
      }
    } catch (e) {
      console.error("Error toggling campaign status:", e);
      toast.error("Network error toggling campaign status.");
    } finally {
      setIsToggling(false);
      setShowMenu(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(API_ENDPOINTS.DELETE_CAMPAIGN(campaign.content_id), {
        method: "DELETE",
      });
      if (res.ok) {
        window.dispatchEvent(new Event("refresh-campaigns"));
        toast.success(`"${campaign.title}" deleted and audience records purged.`);
        onRefresh();
      } else {
        toast.error("Failed to delete campaign.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error deleting campaign.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-[#1c1c1f] border border-[#28282b] hover:border-zinc-700 rounded-xl p-5 transition flex flex-col justify-between gap-4 relative shadow-xs">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-zinc-100 tracking-tight leading-snug truncate max-w-[210px]" title={campaign.title}>
              {campaign.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-semibold uppercase">
              <span>{campaign.content_type}</span>
              <span className="text-zinc-600">·</span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                campaign.status === "active"
                  ? "bg-[#183424] text-[#4ade80] border border-[#234e35]"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
              }`}>
                {campaign.status === "active" ? "Active" : "Paused"}
              </span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-[#28282d] rounded text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 bg-[#1c1c1f] border border-[#28282b] rounded-lg py-1.5 w-44 shadow-2xl z-20 text-xs text-zinc-300">
                  <button
                    onClick={() => router.push(`/campaign/${campaign.content_id}?tab=overview`)}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#242428] hover:text-zinc-100 transition font-medium cursor-pointer"
                  >
                    Open Dashboard
                  </button>
                  <button
                    onClick={handleToggleStatus}
                    disabled={isToggling}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#242428] hover:text-zinc-100 transition font-medium flex items-center gap-2 cursor-pointer"
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
                  <div className="border-t border-[#28282b] my-1" />
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-950/30 text-rose-400 transition font-medium cursor-pointer"
                  >
                    Delete Campaign
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed font-sans line-clamp-2 min-h-[32px]">
          {campaign.description}
        </p>
      </div>

      <div className="space-y-3 pt-3 border-t border-[#28282b]">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
            <span className="font-semibold text-zinc-200">
              {evidenceCount !== null ? `${evidenceCount} comments` : "Syncing..."}
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">
            Release: {campaign.release_date || "TBD"}
          </span>
        </div>

        <button
          onClick={() => router.push(`/campaign/${campaign.content_id}?tab=overview`)}
          className="w-full flex items-center justify-center gap-1.5 bg-[#242428] hover:bg-[#2e2e33] border border-[#2d2d32] text-zinc-100 font-semibold px-4 py-2 rounded-lg text-xs transition cursor-pointer"
        >
          <span>Open Dashboard</span>
          <ArrowRight className="h-3.5 w-3.5 text-[#e6fc4f]" />
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
              Delete Campaign?
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Are you sure you want to delete <span className="font-bold text-[#e6fc4f]">"{campaign.title}"</span>? This will permanently purge the campaign metadata and all associated ClickHouse audience logs.
            </p>
            <div className="flex items-center justify-end gap-3 text-xs font-semibold pt-1">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                {isDeleting && <Loader2 className="h-3 w-3 animate-spin" />}
                Delete Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
