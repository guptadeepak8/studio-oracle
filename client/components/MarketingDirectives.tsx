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
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [copiedGroup, setCopiedGroup] = useState<string | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvidenceItem, setSelectedEvidenceItem] = useState<EvidenceReference | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  const decisions: DecisionArtifact[] = decisionsResponse?.decisions || [];
  const blueprint = decisionsResponse?.blueprint;

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

      {/* 2. Marketing Recommendations Directives */}
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#28282b] pb-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="font-bold text-lg text-zinc-100 tracking-tight">
                Marketing Recommendations
              </h2>
            </div>
            <p className="text-sm text-zinc-400">
              Actionable recommendations based on audience feedback for{" "}
              <strong className="text-zinc-200">{campaign.title}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="active" pulsing>
              {decisionsResponse?.agent_status || "Live Tracking Active"}
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
                {isInvestigating ? "Analyzing Comments..." : "Re-analyze Comments"}
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoadingDecisions && (
          <div className="py-16 text-center space-y-3">
            <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-zinc-400 font-mono">
              Analyzing comments and generating recommendations...
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
                className={`p-6 space-y-5 border transition-all ${
                  isInsufficient
                    ? "border-amber-900/40 bg-[#161614]"
                    : "border-[#28282b] bg-[#1a1a1d] hover:border-zinc-700"
                }`}
              >
                {/* Header: Topic, Status & Evidence Confidence */}
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#28282b] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-md">
                      0{idx + 1}
                    </span>
                    <h3 className="font-bold text-base text-zinc-100 uppercase tracking-wide">
                      {decision.topic}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Status Pill */}
                    <Badge variant={isInsufficient ? "warning" : "positive"}>
                      {isInsufficient ? "INSUFFICIENT EVIDENCE" : "ACTIVE RECOMMENDATION"}
                    </Badge>

                    {/* Evidence Confidence Pill */}
                    <div
                      className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                        isHighConfidence
                          ? "bg-[#183424] text-[#4ade80] border-[#234e35]"
                          : "bg-[#2e2614] text-[#fbbf24] border-[#4d3c1a]"
                      }`}
                      title="Evidence confidence derived from sample size, cross-platform corroboration, and signal stability."
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>{decision.confidence_rating} CONFIDENCE: {(decision.confidence_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* 1. TIER 1: INSIGHT */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    1. Key Audience Insight
                  </span>
                  <p className="text-base font-bold text-zinc-100 leading-snug">
                    {decision.insight}
                  </p>
                </div>

                {/* 2. TIER 2: EVIDENCE */}
                <div className="bg-[#141416] border border-[#242428] rounded-xl p-4.5 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5 text-indigo-400" />
                      2. Supporting Comments & Sentiment
                    </span>
                    <span className="font-mono text-xs text-zinc-400">
                      {decision.evidence.total_comments_analyzed.toLocaleString()} Comments Analyzed
                    </span>
                  </div>

                  {/* Platform Breakdown Progress Bars */}
                  {decision.evidence.platforms && decision.evidence.platforms.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {decision.evidence.platforms.map((plat) => (
                        <div
                          key={plat.platform}
                          className="bg-[#1a1a1d] border border-[#28282b] rounded-lg p-3 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="capitalize flex items-center gap-1.5 text-zinc-200">
                              {plat.platform.toLowerCase().includes("youtube") ? (
                                <Video className="h-3.5 w-3.5 text-red-400" />
                              ) : (
                                <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                              )}
                              {plat.platform.toLowerCase().includes("google") ? "Google Search Press" : plat.platform} ({plat.comment_count.toLocaleString()} {plat.platform.toLowerCase().includes("google") ? "reviews" : "comments"})
                            </span>
                            <span className="font-mono text-[#4ade80] font-bold">
                              +{plat.positive_pct}% Pos / -{plat.negative_pct}% Neg
                            </span>
                          </div>

                          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                            <div
                              className="bg-[#4ade80] h-full"
                              style={{ width: `${plat.positive_pct}%` }}
                            />
                            <div
                              className="bg-[#f87171] h-full"
                              style={{ width: `${plat.negative_pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sample Verbatim Comments with [ref:comment_id] */}
                  {decision.evidence.sample_evidence && decision.evidence.sample_evidence.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#28282b]">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Audience Quotes (Click to inspect):
                      </span>
                      <div className="space-y-1.5">
                        {decision.evidence.sample_evidence.map((sample) => (
                          <div
                            key={sample.comment_id}
                            onClick={() => handleOpenEvidenceDetail(sample)}
                            className="bg-[#1a1a1d] hover:bg-[#222226] border border-[#28282b] hover:border-zinc-600 rounded-lg p-3 text-xs text-zinc-300 flex items-center justify-between gap-3 cursor-pointer transition"
                          >
                            <p className="italic line-clamp-1">"{sample.text}"</p>
                            <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded font-bold shrink-0">
                              ref:{sample.comment_id.slice(0, 8)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. TIER 3: INTERPRETATION */}
                <div className="bg-[#161618] border border-[#28282b] rounded-xl p-4.5 space-y-2 text-xs leading-relaxed">
                  <span className="font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-indigo-400" />
                    3. Analysis
                  </span>
                  <p className="text-zinc-200 font-sans text-sm">{decision.interpretation}</p>
                </div>

                {/* 4. TIER 4: ACTION & READY-TO-USE COPY */}
                <div className="bg-[#161618] border border-[#28282b] rounded-xl p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      4. Recommended Action
                    </span>

                    {decision.copy_draft && (
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => handleCopyDraft(decision.copy_draft!, decision.id)}
                        leftIcon={
                          copiedIndex === decision.id ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )
                        }
                      >
                        {copiedIndex === decision.id ? "Copied" : "Copy Promotional Copy"}
                      </Button>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-zinc-100 leading-relaxed">
                    {decision.action}
                  </p>

                  {decision.copy_draft && (
                    <div className="bg-[#101012] border border-[#28282b] rounded-lg p-3.5 space-y-1.5">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                        Draft Copy for Marketing Team:
                      </span>
                      <p className="text-xs font-mono text-indigo-200 leading-relaxed bg-[#151518] p-2.5 rounded border border-[#25252a]">
                        "{decision.copy_draft}"
                      </p>
                    </div>
                  )}

                  {/* Channel & Audience Targeting Grid */}
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
                </div>

                {/* 5. TIER 5 & 6: AUDIT TRAIL / WHY */}
                {decision.why && decision.why.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#28282b]">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#4ade80]" />
                      5 & 6. Decision Audit Trail (Why this decision was made)
                    </span>
                    <ul className="space-y-1 pl-4 list-disc marker:text-[#4ade80] text-xs text-zinc-300">
                      {decision.why.map((reason, rIdx) => (
                        <li key={rIdx} className="leading-relaxed">
                          {reason}
                        </li>
                      ))}
                    </ul>
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
