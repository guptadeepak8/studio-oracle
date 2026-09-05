"use client";

import React, { useState } from "react";
import {
  Send,
  Users,
  Layers,
  Sparkles,
  Check,
  Copy,
  AlertCircle,
  Database,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Search,
  CheckCircle2,
  Video,
  Clock,
  HelpCircle,
  Hash,
  Flame,
  Trophy,
  Target,
  Share2,
} from "lucide-react";
import { Movie, CampaignDecisionsResponse, DecisionArtifact, EvidenceReference } from "../utils/types";
import TrailerComparison, { DropItem } from "./TrailerComparison";
import EvidenceDrawer from "./EvidenceDrawer";
import { Card, Badge, Button } from "./ui";

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
  drops?: DropItem[];
}

export default function MarketingDirectives({
  campaign,
  decisionsResponse,
  isLoadingDecisions = false,
  onTriggerInvestigation,
  isInvestigating = false,
  drops = [],
}: MarketingDirectivesProps) {
  const [activeTab, setActiveTab] = useState<"all" | "scripts" | "ads" | "creator" | "budget">("all");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [copiedGroup, setCopiedGroup] = useState<string | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvidenceItem, setSelectedEvidenceItem] = useState<EvidenceReference | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  const decisions: DecisionArtifact[] = decisionsResponse?.decisions || [];
  const blueprint = decisionsResponse?.blueprint;
  const videoScripts = decisionsResponse?.video_scripts || [];
  const adVariants = decisionsResponse?.ad_variants || [];
  const creatorBrief = decisionsResponse?.creator_brief;
  const budgetShifts = decisionsResponse?.budget_shifts || [];

  const handleCopyDraft = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleCopyGroupTags = (tags: string[], groupName: string) => {
    navigator.clipboard.writeText(tags.join(" "));
    setCopiedGroup(groupName);
    setTimeout(() => setCopiedGroup(null), 2500);
  };

  const handleCopySingleTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const handleOpenEvidenceDetail = (evidence: EvidenceReference) => {
    setSelectedEvidenceItem(evidence);
    setSelectedCommentId(evidence.comment_id);
    setIsDrawerOpen(true);
  };

  const handleOpenCitationTag = (commentId: string) => {
    setSelectedEvidenceItem(null);
    setSelectedCommentId(commentId);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Trailer & Creative Asset Inflection Tracker */}
      {drops.length > 0 && (
        <TrailerComparison
          drops={drops}
          campaign={campaign}
        />
      )}

      {/* 2. Autonomous Deliverables Command Hub */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#28282b] pb-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="font-bold text-lg text-zinc-100 tracking-tight">
                Autonomous Marketing Deliverables
              </h2>
            </div>
            <p className="text-sm text-zinc-400">
              Autonomous production scripts, cross-platform ad suites, and media spend guidance for{" "}
              <strong className="text-zinc-200">{campaign.title}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="active" pulsing>
              {decisionsResponse?.agent_status || "Autonomous Engine Active"}
            </Badge>

            {onTriggerInvestigation && (
              <Button
                variant="primary"
                size="sm"
                onClick={onTriggerInvestigation}
                isLoading={isInvestigating}
                disabled={isInvestigating}
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              >
                {isInvestigating ? "Synthesizing Directives..." : "Re-Synthesize Campaign"}
              </Button>
            )}
          </div>
        </div>

        {/* Deliverable Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Directives & Assets", icon: Layers },
            { id: "scripts", label: "Video Cutdown Scripts", icon: Video },
            { id: "ads", label: "1-Click Ad Suite", icon: Target },
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

        {/* Render Autonomous Components Based on Tab */}
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

        {/* Loading State */}
        {isLoadingDecisions && (
          <div className="py-16 text-center space-y-3">
            <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-zinc-400 font-mono">
              Synthesizing autonomous campaign deliverables...
            </p>
          </div>
        )}

        {/* Decisions List Empty State */}
        {!isLoadingDecisions && decisions.length === 0 && (
          <Card className="p-8 text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-100">
              No Recommendations Generated Yet
            </h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Ingest trailer comments to analyze audience sentiment and generate recommendations.
            </p>
            {onTriggerInvestigation && (
              <Button
                variant="primary"
                size="sm"
                onClick={onTriggerInvestigation}
                isLoading={isInvestigating}
                disabled={isInvestigating}
                leftIcon={<Sparkles className="h-4 w-4" />}
              >
                Analyze Comments Now
              </Button>
            )}
          </Card>
        )}

        {/* Target Hashtags & Keywords */}
        {!isLoadingDecisions && blueprint && (
          <Card className="p-5 space-y-4 border border-[#282830] bg-[#141418]">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#24242c] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Hash className="h-4 w-4 text-indigo-400" />
                  <h3 className="font-bold text-sm text-zinc-100 tracking-wide">
                    Target Hashtags & Keywords
                  </h3>
                </div>
                <p className="text-xs text-zinc-400">
                  Recommended hashtag clusters based on audience response for <strong className="text-zinc-200">{campaign.title}</strong>.
                </p>
              </div>

              {blueprint.genre_archetype && (
                <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium">
                  {blueprint.genre_archetype}
                </span>
              )}
            </div>

            {/* 3-Tier Hashtag Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {blueprint.hashtag_groups.map((group) => {
                const isCopied = copiedGroup === group.category;
                return (
                  <div
                    key={group.category}
                    className="bg-[#18181d] border border-[#282830] rounded-lg p-3.5 space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-200">
                          {group.category}
                        </span>

                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleCopyGroupTags(group.tags, group.category)}
                          leftIcon={
                            isCopied ? (
                              <Check className="h-3 w-3 text-[#4ade80]" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )
                          }
                          className="h-6 px-2 text-[11px]"
                        >
                          {isCopied ? "Copied" : "Copy All"}
                        </Button>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-tight">
                        {group.description}
                      </p>
                    </div>

                    {/* Interactive Tag Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-[#24242c]">
                      {group.tags.map((tag) => {
                        const isTagCopied = copiedTag === tag;
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleCopySingleTag(tag)}
                            title="Click to copy hashtag"
                            className={`text-[11px] font-mono px-2 py-0.5 rounded transition flex items-center gap-1 cursor-pointer ${
                              isTagCopied
                                ? "bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/40"
                                : "bg-[#202026] hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 border border-[#2c2c36]"
                            }`}
                          >
                            {tag}
                            {isTagCopied && <Check className="h-2.5 w-2.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <div className="space-y-6">
          {decisions.map((decision, idx) => {
            const isInsufficient = decision.status === "INSUFFICIENT_EVIDENCE";
            const isHighConfidence = decision.confidence_rating === "HIGH";

            return (
              <Card
                key={decision.id}
                className={`p-6 space-y-6 border transition-all ${
                  isInsufficient
                    ? "border-amber-900/40 bg-[#161614]"
                    : "border-[#28282b] bg-[#1a1a1d] hover:border-zinc-700"
                }`}
              >
                {/* 1. Header: Topic Name & Confidence */}
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#28282b] pb-3.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-md">
                      0{idx + 1}
                    </span>
                    <h3 className="font-bold text-base text-zinc-100 uppercase tracking-wide">
                      {decision.topic}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Badge variant={isInsufficient ? "warning" : "positive"}>
                      {isInsufficient ? "Needs More Data" : "Active Recommendation"}
                    </Badge>

                    <div
                      className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                        isHighConfidence
                          ? "bg-[#183424] text-[#4ade80] border-[#234e35]"
                          : "bg-[#2e2614] text-[#fbbf24] border-[#4d3c1a]"
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Evidence Confidence: {(decision.confidence_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* 2. HERO: WHAT SHOULD WE DO? */}
                <div className="bg-[#141417] border-l-4 border-indigo-500 p-4.5 rounded-r-xl space-y-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    What Should We Do?
                  </span>
                  <p className="text-base sm:text-lg font-bold text-zinc-100 leading-snug">
                    {decision.action}
                  </p>
                </div>

                {/* 3. WHY? (Executive Rationale & Insight) */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                    Why? (Strategic Rationale)
                  </span>
                  <p className="text-sm text-zinc-200 leading-relaxed font-sans">
                    {decision.insight} {decision.interpretation && `— ${decision.interpretation}`}
                  </p>

                  {decision.why && decision.why.length > 0 && (
                    <ul className="space-y-1.5 pl-4 list-disc marker:text-indigo-400 text-xs text-zinc-300 pt-1">
                      {decision.why.map((reason, rIdx) => (
                        <li key={rIdx} className="leading-relaxed">
                          {reason}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 4. EVIDENCE (Supporting Quotes & Reactions) */}
                <div className="bg-[#141416] border border-[#242428] rounded-xl p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5 text-indigo-400" />
                      Supporting Evidence
                    </span>
                    <span className="font-mono text-xs text-zinc-400">
                      {decision.evidence.total_comments_analyzed.toLocaleString()} Verified Reactions
                    </span>
                  </div>

                  {/* Sample Quotes - Unique Deduplicated Verbatim Comments */}
                  {(() => {
                    const uniqueSamples = Array.from(
                      new Map(
                        (decision.evidence.sample_evidence || [])
                          .filter((s) => s.text && s.text.trim().length > 0)
                          .map((s) => [s.text.trim().toLowerCase(), s])
                      ).values()
                    ).slice(0, 3);

                    if (uniqueSamples.length === 0) return null;

                    return (
                      <div className="space-y-2">
                        {uniqueSamples.map((sample) => (
                          <div
                            key={sample.comment_id}
                            onClick={() => handleOpenEvidenceDetail(sample)}
                            className="bg-[#1a1a1d] hover:bg-[#222226] border border-[#28282b] hover:border-zinc-600 rounded-lg p-3 text-xs text-zinc-300 flex items-center justify-between gap-3 cursor-pointer transition"
                          >
                            <p className="italic line-clamp-2">&ldquo;{sample.text}&rdquo;</p>
                            <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded font-bold shrink-0">
                              ref:{sample.comment_id.slice(0, 8)}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* 5. TARGET CHANNELS & AUDIENCE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-[#28282b]">
                  {decision.target_channels && decision.target_channels.length > 0 && (
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Layers className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Target Channels:</span>
                      <strong className="text-zinc-200">{decision.target_channels.join(", ")}</strong>
                    </div>
                  )}
                  {decision.target_audience && (
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Users className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Target Audience:</span>
                      <strong className="text-zinc-200">{decision.target_audience}</strong>
                    </div>
                  )}
                </div>

                {/* 6. OPTIONAL COPY DRAFT */}
                {decision.copy_draft && (
                  <div className="bg-[#101012] border border-[#28282b] rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        Ready-to-Use Copy Draft
                      </span>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleCopyDraft(decision.copy_draft!, decision.id)}
                        leftIcon={
                          copiedIndex === decision.id ? (
                            <Check className="h-3.5 w-3.5 text-[#4ade80]" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )
                        }
                      >
                        {copiedIndex === decision.id ? "Copied" : "Copy Draft"}
                      </Button>
                    </div>
                    <p className="text-xs font-mono text-indigo-200 leading-relaxed bg-[#151518] p-3 rounded-lg border border-[#25252a]">
                      &ldquo;{decision.copy_draft}&rdquo;
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Evidence Inspector Drawer */}
      <EvidenceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        evidenceItem={selectedEvidenceItem}
        commentId={selectedCommentId}
      />
    </div>
  );
}
