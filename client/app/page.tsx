"use client";

import React, { useState, useEffect } from "react";
import { Plus, Loader2, Film } from "lucide-react";

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
    <div className="flex-1 bg-zinc-950 p-8 space-y-8 overflow-y-auto max-h-screen">
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
          {activeCampaigns.length > 0 && (
            <div className="space-y-3.5">
              <h2 className="font-bold text-xs uppercase tracking-widest text-zinc-500">
                Active Campaigns ({activeCampaigns.length})
              </h2>
              <div className="grid grid-cols-3 gap-6">
                {activeCampaigns.map((c) => (
                  <CampaignCard key={c.content_id} campaign={c} onRefresh={loadCampaigns} />
                ))}
              </div>
            </div>
          )}

          {stoppedCampaigns.length > 0 && (
            <div className="space-y-3.5">
              <h2 className="font-bold text-xs uppercase tracking-widest text-zinc-500">
                Stopped Campaigns ({stoppedCampaigns.length})
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
