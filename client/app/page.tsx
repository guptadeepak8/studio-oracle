"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Loader2, Film, Sparkles, Database, ArrowRight, ShieldCheck, PlayCircle, BarChart3, Star, ExternalLink } from "lucide-react";

import { API_ENDPOINTS } from "../utils/constants";
import { Movie } from "../utils/types";
import RegisterModal from "../components/RegisterModal";
import CampaignCard from "../components/CampaignCard";

export default function Page() {
  const [campaigns, setCampaigns] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("movie");
  const [newReleaseDate, setNewReleaseDate] = useState("");
  const [newTrailerQuery, setNewTrailerQuery] = useState("");
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
    if (!newTitle.trim() || !newTrailerQuery.trim()) return;

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
          target_terms: [newTrailerQuery],
        }),
      });

      if (response.ok) {
        setNewTitle("");
        setNewDesc("");
        setNewReleaseDate("");
        setNewTrailerQuery("");
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
    <div className="flex-1 bg-[#0e0e10] p-8 space-y-6 overflow-y-auto max-h-screen text-zinc-100 font-sans">
      {/* Top Header matching screenshot */}
      <div className="flex items-center justify-between border-b border-[#202023] pb-4">
        <div className="space-y-0.5">
          <h1 className="font-bold text-lg text-zinc-100 tracking-tight">
            Campaigns / Overview
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Real-time audience telemetry and active entertainment launches.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-[#e6fc4f] hover:bg-[#d8ed47] text-xs font-bold px-4 py-2 rounded-md transition text-black shadow-xs cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[3]" />
          <span>Track New Campaign</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400 text-xs gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#e6fc4f]" />
          Connecting ClickHouse campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-[#28282b] rounded-xl max-w-lg mx-auto my-8 bg-[#1c1c1f]/40">
          <Film className="h-10 w-10 text-zinc-500 mb-3" />
          <h3 className="font-bold text-sm text-zinc-200 uppercase tracking-wider mb-1">
            No Active Campaigns
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-4 max-w-sm">
            You are not currently tracking any entertainment launches. Click below to initialize your first campaign.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#e6fc4f] hover:bg-[#d8ed47] text-black font-bold px-4 py-2 rounded-md text-xs transition cursor-pointer"
          >
            Create First Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {activeCampaigns.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <span>Active Launches ({activeCampaigns.length})</span>
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeCampaigns.map((c) => (
                  <CampaignCard key={c.content_id} campaign={c} onRefresh={loadCampaigns} />
                ))}
              </div>
            </div>
          )}

          {stoppedCampaigns.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#202023]">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                Paused Launches ({stoppedCampaigns.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stoppedCampaigns.map((c) => (
                  <CampaignCard key={c.content_id} campaign={c} onRefresh={loadCampaigns} />
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
          newTrailerQuery={newTrailerQuery}
          setNewTrailerQuery={setNewTrailerQuery}
          isRegistering={isRegistering}
        />
      )}
    </div>
  );
}
