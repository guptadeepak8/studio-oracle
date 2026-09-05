"use client";

import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  RefreshCw,
  Video,
  Target,
  Share2,
  TrendingUp,
  Film,
} from "lucide-react";
import { Movie, CampaignDecisionsResponse } from "../utils/types";
import { Card, Button } from "./ui";

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

  const hasAnyDeliverables =
    videoScripts.length > 0 ||
    adVariants.length > 0 ||
    Boolean(creatorBrief) ||
    budgetShifts.length > 0;

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Header & Quick Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#28282b] pb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="font-bold text-lg text-zinc-100 tracking-tight">
              Marketing Directives & Deliverables
            </h2>
          </div>
          <p className="text-sm text-zinc-400">
            Video cutdown scripts, cross-platform ad copy, and media budget guidance for{" "}
            <strong className="text-zinc-200">{campaign.title}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onTriggerInvestigation && (
            <Button
              variant="primary"
              size="sm"
              onClick={onTriggerInvestigation}
              isLoading={isInvestigating}
              disabled={isInvestigating}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              {isInvestigating ? "Updating Deliverables..." : "Refresh Deliverables"}
            </Button>
          )}
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      {hasAnyDeliverables && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Deliverables", icon: Layers },
            { id: "scripts", label: `Video Scripts (${videoScripts.length})`, icon: Video },
            { id: "ads", label: `Ad Copy (${adVariants.length})`, icon: Target },
            { id: "creator", label: "Creator & PR Brief", icon: Share2 },
            { id: "budget", label: "Media Budget Split", icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-[#18181b] hover:bg-[#222226] text-zinc-400 hover:text-zinc-200 border border-[#28282b]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Loading State */}
      {isLoadingDecisions && (
        <div className="py-16 text-center space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-zinc-400">
            Generating marketing deliverables from audience comments...
          </p>
        </div>
      )}

      {/* 4. Empty State */}
      {!isLoadingDecisions && !hasAnyDeliverables && (
        <Card className="p-8 text-center space-y-4 bg-[#141416] border-[#28282b]">
          <div className="h-12 w-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <Film className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-zinc-100">
              No Marketing Deliverables Generated Yet
            </h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Click below to analyze audience comments and generate timecoded video scripts, ad copy, and media budget recommendations.
            </p>
          </div>
          {onTriggerInvestigation && (
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={onTriggerInvestigation}
                isLoading={isInvestigating}
                disabled={isInvestigating}
                leftIcon={<Sparkles className="h-4 w-4" />}
              >
                {isInvestigating ? "Generating Deliverables..." : "Generate Marketing Deliverables"}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* 5. Render Deliverable Sections */}
      {!isLoadingDecisions && hasAnyDeliverables && (
        <div className="space-y-8">
          {/* Video Cutdown Scripts Section */}
          {(activeTab === "all" || activeTab === "scripts") && videoScripts.length > 0 && (
            <AutonomousVideoScripts scripts={videoScripts} movieTitle={campaign.title} />
          )}

          {/* Ad Suite Section */}
          {(activeTab === "all" || activeTab === "ads") && adVariants.length > 0 && (
            <AutonomousAdSuite adVariants={adVariants} movieTitle={campaign.title} />
          )}

          {/* Creator & Influencer Briefing Section */}
          {(activeTab === "all" || activeTab === "creator") && creatorBrief && (
            <CreatorBriefingKit brief={creatorBrief} movieTitle={campaign.title} />
          )}

          {/* Channel Budget Allocator Section */}
          {(activeTab === "all" || activeTab === "budget") && budgetShifts.length > 0 && (
            <ChannelBudgetAllocator budgetShifts={budgetShifts} />
          )}
        </div>
      )}
    </div>
  );
}
