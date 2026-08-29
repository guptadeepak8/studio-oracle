"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Play,
  Square,
  Trash2,
  MoreVertical,
  Loader2,
  Database,
  Layers,
  Film,
  Megaphone,
} from "lucide-react";

import { API_ENDPOINTS } from "../utils/constants";
import { Movie, Comment } from "../utils/types";
import RegisterModal from "../components/RegisterModal";

interface CampaignCardProps {
  campaign: Movie;
  onRefresh: () => void;
  onSelect: () => void;
}

function CampaignCard({ campaign, onRefresh, onSelect }: CampaignCardProps) {
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
        console.error(err);
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
      }
    } catch (e) {
      console.error(e);
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
        onRefresh();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete campaign.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition flex flex-col gap-4 relative">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-bold text-base text-zinc-100 tracking-tight leading-snug truncate max-w-[200px]" title={campaign.title}>
            {campaign.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-zinc-450 uppercase font-semibold">
            <span>{campaign.content_type}</span>
            <span>·</span>
            <div className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${
                campaign.status === "active"
                  ? "bg-emerald-500 animate-pulse"
                  : campaign.status === "collecting"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-rose-500"
              }`} />
              <span className="capitalize">{campaign.status}</span>
            </div>
          </div>
        </div>

        {/* Action Menu Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
          >
            <MoreVertical className="h-4.5 w-4.5" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg py-1 w-40 shadow-xl z-20 text-xs text-zinc-300">
                <button
                  onClick={() => router.push(`/campaign/${campaign.content_id}`)}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-800 transition font-medium"
                >
                  Open Campaign
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={isToggling}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-800 transition font-medium flex items-center gap-1.5"
                >
                  {campaign.status === "stopped" ? (
                    <>
                      <Play className="h-3 w-3 text-emerald-500 fill-emerald-500" /> Start tracking
                    </>
                  ) : (
                    <>
                      <Square className="h-3 w-3 text-rose-500 fill-rose-500" /> Stop tracking
                    </>
                  )}
                </button>
                <div className="border-t border-zinc-800 my-1" />
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-rose-950/30 hover:text-rose-400 text-rose-500 transition font-medium"
                >
                  Delete campaign
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-xs text-zinc-450 leading-relaxed font-sans line-clamp-2 min-h-[32px]">
        {campaign.description}
      </div>

      <div className="flex items-center gap-1 text-xs text-zinc-500 pt-2 border-t border-zinc-850">
        <Database className="h-3.5 w-3.5" />
        <span>
          {evidenceCount !== null ? `${evidenceCount} evidence items` : "Syncing evidence..."} · YouTube
        </span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => router.push(`/campaign/${campaign.content_id}`)}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
        >
          Open Campaign
        </button>
        <span className="text-[10px] text-zinc-550 font-medium">
          Release: {campaign.release_date || "TBD"}
        </span>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-zinc-200 uppercase tracking-wider">
              Delete campaign?
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Are you sure you want to delete <span className="font-bold text-zinc-250">"{campaign.title}"</span>? This will permanently remove the campaign metadata and all associated ClickHouse audience logs.
            </p>
            <div className="flex items-center justify-end gap-3 text-xs font-semibold pt-1">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg transition flex items-center gap-1"
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

export default function Page() {
  const [campaigns, setCampaigns] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("movie");
  const [newReleaseDate, setNewReleaseDate] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const loadCampaigns = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.MOVIES);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (e) {
      console.error("Error loading campaigns:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
    const handleRefresh = () => loadCampaigns();
    window.addEventListener("refresh-campaigns", handleRefresh);
    return () => window.removeEventListener("refresh-campaigns", handleRefresh);
  }, []);

  const handleRegisterCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsRegistering(true);
    try {
      const response = await fetch(API_ENDPOINTS.CAMPAIGNS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content_type: newType,
          description: newDesc,
          release_date: newReleaseDate || null,
        }),
      });

      if (response.ok) {
        setNewTitle("");
        setNewDesc("");
        setNewReleaseDate("");
        setShowModal(false);
        
        window.dispatchEvent(new Event("refresh-campaigns"));
        loadCampaigns();
      } else {
        alert("Failed to register campaign.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to campaign registration server.");
    } finally {
      setIsRegistering(false);
    }
  };

  const activeCampaigns = campaigns.filter(c => c.status !== "stopped");
  const stoppedCampaigns = campaigns.filter(c => c.status === "stopped");

  return (
    <div className="flex-1 bg-zinc-950 p-8 space-y-8 overflow-y-auto max-h-screen">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
        <div className="space-y-1">
          <h1 className="font-bold text-xl uppercase tracking-wider text-zinc-100 flex items-center gap-2">
            Campaign Home
          </h1>
          <p className="text-sm text-zinc-500 font-sans">
            Track and monitor marketing signals for entertainment launches.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-zinc-700 hover:bg-zinc-650 border border-zinc-600 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition text-zinc-100 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-550 text-sm gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          Loading workspace campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-zinc-850 rounded-2xl max-w-md mx-auto my-12 bg-zinc-900/10">
          <Film className="h-10 w-10 text-zinc-600 mb-3" />
          <h3 className="font-bold text-base text-zinc-300 uppercase tracking-widest mb-1">
            No Campaigns Found
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed mb-4">
            You are not tracking any launch campaigns yet. Click "New Campaign" to initialize tracking.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold px-4 py-2 rounded-lg text-xs transition cursor-pointer"
          >
            Create First Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Campaigns */}
          {activeCampaigns.length > 0 && (
            <div className="space-y-3.5">
              <h2 className="font-bold text-xs uppercase tracking-widest text-zinc-500">
                Active Campaigns ({activeCampaigns.length})
              </h2>
              <div className="grid grid-cols-3 gap-6">
                {activeCampaigns.map((c) => (
                  <CampaignCard key={c.content_id} campaign={c} onRefresh={loadCampaigns} onSelect={() => {}} />
                ))}
              </div>
            </div>
          )}

          {/* Stopped Campaigns */}
          {stoppedCampaigns.length > 0 && (
            <div className="space-y-3.5">
              <h2 className="font-bold text-xs uppercase tracking-widest text-zinc-500">
                Stopped Campaigns ({stoppedCampaigns.length})
              </h2>
              <div className="grid grid-cols-3 gap-6">
                {stoppedCampaigns.map((c) => (
                  <CampaignCard key={c.content_id} campaign={c} onRefresh={loadCampaigns} onSelect={() => {}} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <RegisterModal
          onClose={() => setShowModal(false)}
          onSubmit={handleRegisterCampaign}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          newDesc={newDesc}
          setNewDesc={setNewDesc}
          newType={newType}
          setNewType={setNewType}
          newReleaseDate={newReleaseDate}
          setNewReleaseDate={setNewReleaseDate}
          isRegistering={isRegistering}
        />
      )}
    </div>
  );
}
