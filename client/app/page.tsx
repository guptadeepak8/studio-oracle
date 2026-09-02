"use client";

import React, { useState } from "react";
import { Plus, Film } from "lucide-react";
import { useCampaigns } from "../hooks/useCampaigns";
import RegisterModal from "../components/RegisterModal";
import CampaignCard from "../components/CampaignCard";
import CampaignCardSkeleton from "../components/skeletons/CampaignCardSkeleton";
import { Button, PageHeader } from "../components/ui";

export default function Page() {
  const { campaigns, isLoading, refreshCampaigns } = useCampaigns();
  const [showModal, setShowModal] = useState(false);

  const activeCampaigns = campaigns.filter((c) => c.status !== "stopped");
  const stoppedCampaigns = campaigns.filter((c) => c.status === "stopped");

  return (
    <div className="flex-1 bg-[#0e0e10] p-8 space-y-6 overflow-y-auto max-h-screen text-zinc-100 font-sans">
      {/* Reusable PageHeader */}
      <PageHeader
        title="Campaigns / Overview"
        description="Real-time audience feedback and active entertainment launches."
        action={
          <Button
            onClick={() => setShowModal(true)}
            variant="primary"
            size="md"
            leftIcon={<Plus className="h-4 w-4 stroke-[3]" />}
          >
            Track New Campaign
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Loading Launches...
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
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
          <Button
            onClick={() => setShowModal(true)}
            variant="primary"
            size="md"
          >
            Create First Campaign
          </Button>
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
