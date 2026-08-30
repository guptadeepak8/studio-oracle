"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertTriangle, PlayCircle } from "lucide-react";

import { API_ENDPOINTS, SESSION_CONFIG } from "../../../utils/constants";
import { Movie, Comment, ChatMessage, IngestResponse } from "../../../utils/types";
import {
  getSentimentStats,
  getThemeStats,
  getTimelineData,
  getConflictingSignals,
  getPulseSummary,
} from "../../../utils/analytics";

import AudiencePulse from "../../../components/AudiencePulse";
import MarketingDirectives from "../../../components/MarketingDirectives";
import WhatChanged from "../../../components/WhatChanged";
import TopThemes from "../../../components/TopThemes";
import ConflictingSignals from "../../../components/ConflictingSignals";
import EvidenceLedger from "../../../components/EvidenceLedger";
import AgentConsole from "../../../components/AgentConsole";
import CampaignHeader from "../../../components/CampaignHeader";
import IngestConfig from "../../../components/IngestConfig";

type ActiveTab = "overview" | "intelligence" | "evidence" | "agent";

function CampaignWorkspaceInner() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Movie | null>(null);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
  const activeTab = (searchParams.get("tab") as ActiveTab) || "overview";

  const [ingestQuery, setIngestQuery] = useState("");
  const [ingestLimit, setIngestLimit] = useState(3);
  const [isIngesting, setIsIngesting] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentSearch, setCommentSearch] = useState("");

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isToggling, setIsToggling] = useState(false);

  const fetchCampaignDetail = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.MOVIES);
      if (res.ok) {
        const data = (await res.json()) as Movie[];
        const matched = data.find((x) => x.content_id === campaignId);
        if (matched) {
          setCampaign(matched);
          setIngestQuery(`${matched.title} Trailer`);
          
          setChatMessages([
            {
              id: "welcome",
              sender: "agent",
              text: `Hello! I am StudioOracle, your AI strategist for the "${matched.title}" campaign. How can I assist you with this campaign's audience evidence?`,
            },
          ]);
        } else {
          router.push("/");
        }
      }
    } catch (e) {
      console.error("Error fetching campaign details:", e);
    } finally {
      setIsLoadingCampaign(false);
    }
  };

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const res = await fetch(API_ENDPOINTS.COMMENTS(campaignId));
      if (res.ok) {
        const data = (await res.json()) as Comment[];
        setComments(data);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetail();
      fetchComments();
    }
  }, [campaignId]);

  const handleToggleStatus = async () => {
    if (!campaign) return;
    setIsToggling(true);
    const nextStatus = campaign.status === "stopped" ? "active" : "stopped";
    try {
      const res = await fetch(API_ENDPOINTS.CAMPAIGN_STATUS(campaign.content_id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setCampaign({ ...campaign, status: nextStatus });
        window.dispatchEvent(new Event("refresh-campaigns"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsToggling(false);
    }
  };

  const handleTriggerIngest = async () => {
    if (!campaign || !ingestQuery.trim()) return;

    setIsIngesting(true);
    try {
      const res = await fetch(API_ENDPOINTS.INGEST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_id: campaign.content_id,
          query: ingestQuery,
          limit: ingestLimit,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as IngestResponse;
        if (data.status === "success") {
          const ingestNotice: ChatMessage = {
            id: Math.random().toString(),
            sender: "agent",
            text: `[Ingestion Complete] Ingested ${data.ingested_posts} posts and ${data.ingested_comments} comments from YouTube. ClickHouse is synchronized!`,
          };
          setChatMessages((prev) => [...prev, ingestNotice]);
          fetchComments();
        } else {
          alert(`Ingestion failed: ${data.message || "Unknown error"}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to ingestion server.");
    } finally {
      setIsIngesting(false);
    }
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

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: !done });
        const lines = chunk.split("\n\n");
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
      setChatMessages((prev) =>
        prev.map((msg) => (msg.id === agentMsgId ? { ...msg, isStreaming: false } : msg))
      );
    } catch (err) {
      console.error(err);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === agentMsgId ? { ...msg, text: "Error connecting to agent.", isStreaming: false } : msg
        )
      );
    }
  };

  if (isLoadingCampaign) {
    return (
      <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center text-zinc-550 text-sm gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        Synchronizing workspace details...
      </div>
    );
  }

  if (!campaign) return null;

  const sentiment = getSentimentStats(comments);
  const themeStats = getThemeStats(comments);
  const timelineData = getTimelineData(comments);
  const conflictingSignals = getConflictingSignals(comments);
  const pulseSummary = getPulseSummary(comments);
  const filteredComments = comments.filter((c) =>
    c.text.toLowerCase().includes(commentSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex bg-zinc-950 overflow-hidden h-screen relative">
      {campaign.status === "collecting" && (
        <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center text-center p-8 z-30">
          <Loader2 className="h-10 w-10 animate-spin text-amber-500 mb-4" />
          <h3 className="font-bold text-base text-zinc-100 uppercase tracking-widest mb-1.5">
            Collecting Audience Evidence
          </h3>
          <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
            Synchronizing with ClickHouse database tables. Fetching and index-matching YouTube social feeds for "{campaign.title}"...
          </p>
        </div>
      )}

      {campaign.status === "stopped" && activeTab !== "agent" && (
        <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center text-center p-8 z-30">
          <AlertTriangle className="h-10 w-10 text-rose-500 mb-4" />
          <h3 className="font-bold text-base text-zinc-100 uppercase tracking-widest mb-1.5">
            Campaign Inactive
          </h3>
          <p className="text-sm text-zinc-400 max-w-sm leading-relaxed mb-4">
            Audience telemetry pipeline is currently stopped. Resume tracking to analyze fresh insights.
          </p>
          <button
            onClick={handleToggleStatus}
            disabled={isToggling}
            className="bg-emerald-600 hover:bg-emerald-500 text-xs uppercase tracking-wider font-bold text-white px-4 py-2.5 rounded shadow flex items-center gap-1.5 cursor-pointer"
          >
            <PlayCircle className="h-4.5 w-4.5" /> Resume Tracking
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        <CampaignHeader
          campaign={campaign}
          onToggleStatus={handleToggleStatus}
          isToggling={isToggling}
          activeTab={activeTab}
          onTabChange={(tab) => router.push(`/campaign/${campaignId}?tab=${tab}`)}
        />

        {activeTab === "agent" ? (
          <div className="flex-1 overflow-hidden">
            <AgentConsole
              chatMessages={chatMessages}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              onSendChat={handleSendChat}
              onRefreshMovies={fetchCampaignDetail}
            />
          </div>
        ) : activeTab === "evidence" ? (
          <div className="flex-1 overflow-hidden p-6">
            <EvidenceLedger
              filteredComments={filteredComments}
              isLoadingComments={isLoadingComments}
              commentSearch={commentSearch}
              setCommentSearch={setCommentSearch}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-1 bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-400">Campaign Details</h3>
                    <div className="space-y-3.5 text-sm font-sans">
                      <div>
                        <span className="text-zinc-550 block text-xs uppercase font-medium">Description</span>
                        <p className="text-zinc-250 leading-relaxed">{campaign.description}</p>
                      </div>
                      <div>
                        <span className="text-zinc-550 block text-xs uppercase font-medium">Release Date</span>
                        <p className="text-zinc-200 font-semibold">{campaign.release_date || "To Be Announced"}</p>
                      </div>
                      <div>
                        <span className="text-zinc-550 block text-xs uppercase font-medium">Target Search Terms</span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {campaign.target_terms.map((t, idx) => (
                            <span key={idx} className="bg-zinc-800 border border-zinc-700 text-xs px-2 py-0.5 rounded text-zinc-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 space-y-6">
                    <IngestConfig
                      ingestQuery={ingestQuery}
                      setIngestQuery={setIngestQuery}
                      ingestLimit={ingestLimit}
                      setIngestLimit={setIngestLimit}
                      isIngesting={isIngesting}
                      onTriggerIngest={handleTriggerIngest}
                    />

                    <AudiencePulse
                      comments={comments}
                      sentiment={sentiment}
                      pulseSummary={pulseSummary}
                      dominantTopic={themeStats.length > 0 ? themeStats[0].name : "Unknown"}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "intelligence" && (
              <div className="space-y-6">
                <MarketingDirectives campaign={campaign} themeStats={themeStats} />
                <WhatChanged timelineData={timelineData} />
                <div className="grid grid-cols-2 gap-5">
                  <TopThemes themeStats={themeStats} />
                  <ConflictingSignals conflictingSignals={conflictingSignals} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CampaignWorkspace() {
  return (
    <Suspense fallback={
      <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center text-zinc-550 text-sm gap-2 h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        Synchronizing workspace details...
      </div>
    }>
      <CampaignWorkspaceInner />
    </Suspense>
  );
}
