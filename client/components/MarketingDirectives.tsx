"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  Video,
  TrendingUp,
  RefreshCw,
  Target,
  Share2,
} from "lucide-react";
import { Movie, CampaignDecisionsResponse } from "../utils/types";
import { Button } from "./ui";

import AutonomousVideoScripts from "./AutonomousVideoScripts";
import AutonomousAdSuite from "./AutonomousAdSuite";
import CreatorBriefingKit from "./CreatorBriefingKit";
import ChannelBudgetAllocator from "./ChannelBudgetAllocator";

interface MarketingDirectivesProps {
  campaign: Movie;
  decisionsResponse: CampaignDecisionsResponse | null;
  isLoadingDecisions?: boolean;
  onTriggerInvestigation?: () => void;
  isInvestigating?: boolean;
  drops?: any[];
}

export default function MarketingDirectives({
  campaign,
  decisionsResponse,
  isLoadingDecisions = false,
  onTriggerInvestigation,
  isInvestigating = false,
}: MarketingDirectivesProps) {
  const [activeTab, setActiveTab] = useState<"all" | "scripts" | "ads" | "creator" | "budget">("all");

  const videoScripts = decisionsResponse?.video_scripts || [];
  const adVariants = decisionsResponse?.ad_variants || [];
  const creatorBrief = decisionsResponse?.creator_brief;
  const budgetShifts = decisionsResponse?.budget_shifts || [];

  const hasAnyDeliverables = videoScripts.length > 0 || adVariants.length > 0 || !!creatorBrief || budgetShifts.length > 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80">
          {[
            { id: "all", label: "All Directives", icon: Layers, count: (videoScripts.length ? 1 : 0) + (adVariants.length ? 1 : 0) + (creatorBrief ? 1 : 0) + (budgetShifts.length ? 1 : 0) },
            { id: "scripts", label: "Video Scripts", icon: Video, count: videoScripts.length },
            { id: "ads", label: "Ad Suite", icon: Target, count: adVariants.length },
            { id: "creator", label: "Creator Brief", icon: Share2, count: creatorBrief ? 1 : 0 },
            { id: "budget", label: "Media Budget", icon: TrendingUp, count: budgetShifts.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-zinc-800 text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isActive ? "bg-zinc-700 text-zinc-200" : "bg-zinc-900 text-zinc-500"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {onTriggerInvestigation && (
          <Button
            variant="secondary"
            size="xs"
            onClick={onTriggerInvestigation}
            isLoading={isInvestigating}
            disabled={isInvestigating}
            leftIcon={<RefreshCw className="h-3 w-3" />}
          >
            {isInvestigating ? "Generating..." : "Re-generate Directives"}
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoadingDecisions && (
        <div className="py-12 text-center space-y-2 bg-zinc-900/40 border border-zinc-800/80 rounded-xl">
          <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-zinc-400 font-mono">
            Synthesizing marketing directives...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingDecisions && !hasAnyDeliverables && (
        <div className="p-8 text-center space-y-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl">
          <p className="text-xs text-zinc-400">
            No marketing directives generated yet. Sync audience reactions to generate scripts and ads.
          </p>
          {onTriggerInvestigation && (
            <Button
              variant="primary"
              size="xs"
              onClick={onTriggerInvestigation}
              isLoading={isInvestigating}
              disabled={isInvestigating}
              leftIcon={<Sparkles className="h-3.5 w-3.5" />}
            >
              Generate Directives Now
            </Button>
          )}
        </div>
      )}

      {/* Deliverable Sections */}
      {!isLoadingDecisions && (
        <div className="space-y-6">
          {(activeTab === "all" || activeTab === "scripts") && videoScripts.length > 0 && (
            <AutonomousVideoScripts scripts={videoScripts} movieTitle={campaign.title} />
          )}

          {(activeTab === "all" || activeTab === "ads") && adVariants.length > 0 && (
            <AutonomousAdSuite adVariants={adVariants} movieTitle={campaign.title} />
          )}

          {(activeTab === "all" || activeTab === "creator") && creatorBrief && (
            <CreatorBriefingKit brief={creatorBrief} movieTitle={campaign.title} />
          )}

          {(activeTab === "all" || activeTab === "budget") && budgetShifts.length > 0 && (
            <ChannelBudgetAllocator budgetShifts={budgetShifts} />
          )}
        </div>
      )}
    </div>
  );
}
