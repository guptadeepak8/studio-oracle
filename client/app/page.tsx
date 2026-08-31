"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Loader2, Film, Sparkles, Database, ArrowRight, ShieldCheck, PlayCircle, BarChart3 } from "lucide-react";

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
    <div className="flex-1 bg-[#09090b] p-8 space-y-8 overflow-y-auto max-h-screen text-zinc-100">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <h1 className="font-bold text-2xl uppercase tracking-wider text-zinc-100">
              Studio Launchpad
            </h1>
          </div>
          <p className="text-sm text-zinc-400 font-sans max-w-2xl leading-relaxed">
            Real-time audience telemetry and evidence-backed intelligence engine for high-stakes entertainment campaigns.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-lg transition text-white shadow-md hover:shadow-amber-500/20 cursor-pointer border border-amber-500/30"
        >
          <Plus className="h-4 w-4" />
          Track New Campaign
        </button>
      </div>

      {/* 3-Step Workflow Onboarding Guide */}
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-[#121215] border border-[#27272a] rounded-xl p-5 space-y-2.5 hover:border-zinc-700 transition">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
            01
          </div>
          <h3 className="font-semibold text-sm text-zinc-200">1. Initialize Campaign</h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Register your movie, series, or promotional launch with search terms and release milestones.
          </p>
        </div>

        <div className="bg-[#121215] border border-[#27272a] rounded-xl p-5 space-y-2.5 hover:border-zinc-700 transition">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
            02
          </div>
          <h3 className="font-semibold text-sm text-zinc-200">2. Ingest Live Telemetry</h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Stream YouTube comments and Reddit enthusiast threads into ClickHouse with Gemini batch sentiment classification.
          </p>
        </div>

        <div className="bg-[#121215] border border-[#27272a] rounded-xl p-5 space-y-2.5 hover:border-zinc-700 transition">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
            03
          </div>
          <h3 className="font-semibold text-sm text-zinc-200">3. Reason & Direct</h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Investigate why audience reactions changed, identify polarizing contradictions, and generate targeted marketing directives.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400 text-sm gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
          Synchronizing ClickHouse campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-[#27272a] rounded-2xl max-w-lg mx-auto my-8 bg-[#121215]/50">
          <Film className="h-12 w-12 text-zinc-500 mb-3" />
          <h3 className="font-bold text-base text-zinc-200 uppercase tracking-widest mb-1.5">
            No Active Campaigns
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-5 max-w-sm">
            You are not currently monitoring any entertainment launches. Click below to initialize your first campaign.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition cursor-pointer shadow"
          >
            Create First Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {activeCampaigns.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-xs uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <span>Active Telemetry Streams</span>
                  <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                    {activeCampaigns.length} Active
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {activeCampaigns.map((c) => (
                  <CampaignCard key={c.content_id} campaign={c} onRefresh={loadCampaigns} />
                ))}
              </div>
            </div>
          )}

          {stoppedCampaigns.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#27272a]">
              <h2 className="font-bold text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <span>Paused Campaigns ({stoppedCampaigns.length})</span>
              </h2>
              <div className="grid grid-cols-3 gap-6">
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
          isRegistering={isRegistering}
        />
      )}
    </div>
  );
}
