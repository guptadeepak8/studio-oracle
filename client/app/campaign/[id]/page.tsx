"use client";

import React, { useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertTriangle, PlayCircle, Trash2, RefreshCw } from "lucide-react";
import { API_ENDPOINTS, SESSION_CONFIG } from "../../../utils/constants";
import { ChatMessage } from "../../../utils/types";
import { useCampaignDetail } from "../../../hooks/useCampaignDetail";
import { useCampaigns } from "../../../hooks/useCampaigns";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";

import ExecutiveScorecard from "../../../components/ExecutiveScorecard";
import WhatsWorking from "../../../components/WhatsWorking";
import PlatformComparison from "../../../components/PlatformComparison";
import TrailerComparison from "../../../components/TrailerComparison";
import MarketingDirectives from "../../../components/MarketingDirectives";
import AgentConsole from "../../../components/AgentConsole";
import CampaignHeader from "../../../components/CampaignHeader";
import ExecutiveScorecardSkeleton from "../../../components/skeletons/ExecutiveScorecardSkeleton";
import CinematicLoader from "../../../components/common/CinematicLoader";
import { Button } from "../../../components/ui";
import { useCampaignSSE } from "../../../hooks/useCampaignSSE";

function CampaignWorkspaceInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;
  const activeTab = (searchParams.get("tab") as "overview" | "marketing" | "agent") || "overview";

  // Real-time Server-Sent Events (SSE) listener for zero-reload live updates
  useCampaignSSE(campaignId);

  const {
    campaign,
    isLoadingCampaign,
    comments,
    sentiment,
    themeStats,
    platforms,
    drops,
    pulseSummary,
    decisionsData,
    isLoadingDecisions,
    isInvestigating,
    isIngesting,
    isGroundingSearch,
    refreshAll,
    triggerIngest,
    triggerGoogleSearch,
    triggerInvestigation,
  } = useCampaignDetail(campaignId);

  const { updateStatus, deleteCampaign, isUpdatingStatus, isDeleting } = useCampaigns();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Chat State for Agent Console
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleToggleStatus = async () => {
    if (!campaign) return;
    const nextStatus = campaign.status === "stopped" ? "active" : "stopped";
    const ok = await updateStatus(campaign.content_id, nextStatus, campaign.title);
    if (ok) {
      refreshAll();
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaign) return;
    const ok = await deleteCampaign(campaign.content_id, campaign.title);
    if (ok) {
      setShowDeleteConfirm(false);
      router.push("/");
    }
  };

  const handleSync1000Comments = async () => {
    if (!campaign) return;
    const query = (campaign.target_terms && campaign.target_terms.length > 0)
      ? campaign.target_terms[0]
      : campaign.title;
    await triggerIngest(query, 3, 1000);
  };

  const handleSendChat = async (messageText?: string) => {
    if (!campaign) return;
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsgId = Math.random().toString();
    setChatMessages((prev) => [...prev, { id: userMsgId, sender: "user", text: textToSend }]);
    if (!messageText) setInputMessage("");

    const agentMsgId = Math.random().toString();
    setChatMessages((prev) => [...prev, { id: agentMsgId, sender: "agent", text: "", isStreaming: true }]);

    const scopedSessionId = `session_${campaign.content_id}`;

    try {
      const res = await fetch(API_ENDPOINTS.CHAT_STREAM, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          session_id: scopedSessionId,
          user_id: SESSION_CONFIG.DEFAULT_USER_ID,
          content_id: campaign.content_id,
        }),
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = "";
      let buffer = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        buffer += decoder.decode(value, { stream: !done });
        
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data) {
              accumulatedText += data;
              setChatMessages((prev) =>
                prev.map((msg) => (msg.id === agentMsgId ? { ...msg, text: accumulatedText } : msg))
              );
            }
          }
        }
      }
      
      if (buffer.startsWith("data: ")) {
        const data = buffer.slice(6);
        if (data) {
          accumulatedText += data;
        }
      }
      
      setChatMessages((prev) =>
        prev.map((msg) => (msg.id === agentMsgId ? { ...msg, text: accumulatedText, isStreaming: false } : msg))
      );
    } catch (err) {
      console.error(err);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === agentMsgId ? { ...msg, text: "Error connecting to AI assistant.", isStreaming: false } : msg
        )
      );
    }
  };

  if (isLoadingCampaign) {
    return (
      <div className="flex-1 bg-[#0e0e10] p-8 flex items-center justify-center h-screen w-full overflow-hidden">
        <CinematicLoader
          title="Loading Campaign"
          subtitle="Connecting to ClickHouse and loading audience feedback..."
        />
      </div>
    );
  }

  if (!campaign) return null;

  const isAnalyzing = comments.length === 0;

  return (
    <div className="flex-1 flex bg-[#0e0e10] overflow-hidden h-screen relative text-zinc-100 font-sans">
      {/* Paused Monitoring Overlay */}
      {campaign.status === "stopped" && activeTab !== "agent" && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-8 z-30 font-sans">
          <AlertTriangle className="h-9 w-9 text-amber-400 mb-3" />
          <h3 className="font-bold text-lg text-zinc-100 uppercase tracking-wider mb-1">
            Campaign Monitoring Paused
          </h3>
          <p className="text-sm text-zinc-400 max-w-md leading-relaxed mb-6">
            Real-time comment tracking is currently paused for <strong className="text-zinc-100">"{campaign.title}"</strong>. You can resume live tracking or permanently delete this campaign.
          </p>

          <div className="flex items-center gap-3.5">
            <Button
              variant="primary"
              size="md"
              onClick={handleToggleStatus}
              isLoading={isUpdatingStatus}
              disabled={isUpdatingStatus || isDeleting}
              leftIcon={<PlayCircle className="h-4 w-4 fill-black" />}
            >
              Resume Live Tracking
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isUpdatingStatus || isDeleting}
              leftIcon={<Trash2 className="h-4 w-4 text-rose-400" />}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 hover:border-rose-800"
            >
              Delete Campaign
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        {/* Campaign Header with Actions Dropdown */}
        <CampaignHeader
          campaign={campaign}
          onToggleStatus={handleToggleStatus}
          isToggling={isUpdatingStatus}
          activeTab={activeTab}
          onTabChange={(tab) => router.push(`/campaign/${campaignId}?tab=${tab}`)}
          evidenceCount={comments.length}
          onRefreshData={refreshAll}
          onSync1000Comments={handleSync1000Comments}
          isSyncing={isIngesting}
          agentStatus={decisionsData?.agent_status}
        />

        {activeTab === "agent" ? (
          <div className="flex-1 overflow-hidden">
            <AgentConsole
              chatMessages={chatMessages}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              onSendChat={handleSendChat}
              onRefreshMovies={refreshAll}
              onSelectEvidence={() => {}}
            />
          </div>
        ) : activeTab === "marketing" ? (
          /* Dedicated Marketing Action Plan Tab */
          <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full space-y-8">
            {comments.length === 0 && (
              <div className="bg-[#18181c] border border-indigo-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 text-indigo-400 animate-spin shrink-0" />
                  <span className="text-xs text-zinc-300">
                    Audience reactions are syncing in the background. Marketing deliverables will populate automatically once ready.
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSync1000Comments}
                  isLoading={isIngesting}
                  leftIcon={<RefreshCw className="h-3 w-3" />}
                >
                  Sync Comments
                </Button>
              </div>
            )}

            <MarketingDirectives
              campaign={campaign}
              decisionsResponse={decisionsData}
              isLoadingDecisions={isLoadingDecisions}
              isInvestigating={isInvestigating}
              onTriggerInvestigation={triggerInvestigation}
            />
          </div>
        ) : (
          /* Main Overview Dashboard */
          <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-7xl mx-auto w-full">
            {comments.length === 0 && (
              <div className="bg-[#18181c] border border-indigo-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 text-indigo-400 animate-spin shrink-0" />
                  <span className="text-xs text-zinc-300">
                    Audience comments are syncing in the background for <strong className="text-zinc-100">{campaign.title}</strong>. Metrics will populate automatically once ready.
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSync1000Comments}
                  isLoading={isIngesting}
                  leftIcon={<RefreshCw className="h-3 w-3" />}
                >
                  Sync Comments
                </Button>
              </div>
            )}

            {/* 1. Section: Audience Summary */}
            <ExecutiveScorecard
              sentiment={sentiment}
              totalComments={comments.length}
              dominantTopic={themeStats.length > 0 ? themeStats[0].name : "General"}
              pulseSummary={pulseSummary}
              releaseDate={campaign.release_date}
              campaignTitle={campaign.title}
            />

            {/* 2. What Changed: Real Drops from ClickHouse */}
            <TrailerComparison campaign={campaign} drops={drops} />

            {/* 3. Section: Key Feedback Topics */}
            <WhatsWorking themeStats={themeStats} />

            {/* 4. Section: Audience Voice vs Critic Reviews */}
            <PlatformComparison
              platforms={platforms}
              dominantTopic={themeStats.length > 0 ? themeStats[0].name : "General"}
              onTriggerSearch={() => triggerGoogleSearch()}
              isSearching={isGroundingSearch}
            />
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteCampaign}
        title={campaign.title}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default function CampaignWorkspace() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 bg-[#0e0e10] flex flex-col items-center justify-center text-zinc-400 text-sm gap-2 h-screen">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
          Loading workspace...
        </div>
      }
    >
      <CampaignWorkspaceInner />
    </Suspense>
  );
}
