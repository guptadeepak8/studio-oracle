"use client";

import React, { useState } from "react";
import { Plus, Loader2, Film } from "lucide-react";
import { useCampaigns } from "../hooks/useCampaigns";
import RegisterModal from "../components/RegisterModal";
import CampaignCard from "../components/CampaignCard";

export default function Page() {
  const { campaigns, isLoading, refreshCampaigns } = useCampaigns();
  const [showModal, setShowModal] = useState(false);

  const activeCampaigns = campaigns.filter((c) => c.status !== "stopped");
  const stoppedCampaigns = campaigns.filter((c) => c.status === "stopped");

  return (
    <div className="flex-1 bg-[#0e0e10] p-8 space-y-6 overflow-y-auto max-h-screen text-zinc-100 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#202023] pb-4">
        <div className="space-y-0.5">
          <h1 className="font-bold text-xl text-zinc-100 tracking-tight">
            Campaigns / Overview
          </h1>
          <p className="text-sm text-zinc-400 font-sans">
            Real-time audience feedback and active entertainment launches.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#e6fc4f] hover:bg-[#d8ed47] text-sm font-bold px-4.5 py-2.5 rounded-lg transition text-black shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Track New Campaign</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400 text-sm gap-2">
          <Loader2 className="h-7 w-7 animate-spin text-[#e6fc4f]" />
          Connecting ClickHouse campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-[#28282b] rounded-2xl max-w-lg mx-auto my-8 bg-[#1c1c1f]/40">
          <Film className="h-10 w-10 text-zinc-500 mb-3" />
          <h3 className="font-bold text-base text-zinc-200 uppercase tracking-wider mb-1">
            No Active Campaigns
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed mb-5 max-w-sm">
            You are not currently tracking any entertainment launches. Click below to initialize your first campaign.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#e6fc4f] hover:bg-[#d8ed47] text-black font-bold px-5 py-2.5 rounded-lg text-sm transition cursor-pointer shadow-xs"
          >
            Create First Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {activeCampaigns.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Active Launches ({activeCampaigns.length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeCampaigns.map((c) => (
                  <CampaignCard key={c.content_id} campaign={c} onRefresh={refreshCampaigns} />
                ))}
              </div>
            </div>
          )}

          {stoppedCampaigns.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#202023]">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                Paused Launches ({stoppedCampaigns.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {stoppedCampaigns.map((c) => (
                  <CampaignCard key={c.content_id} campaign={c} onRefresh={refreshCampaigns} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <RegisterModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            refreshCampaigns();
          }}
        />
      )}
    </div>
  );
}
