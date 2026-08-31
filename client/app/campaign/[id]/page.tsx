"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertTriangle, PlayCircle, Film, Sparkles, Database, MessageSquare } from "lucide-react";
import { API_ENDPOINTS, SESSION_CONFIG } from "../../../utils/constants";
import { Movie, Comment, ChatMessage, IngestResponse } from "../../../utils/types";
import {
  SentimentStats,
  ThemeItem,
  TimelineNode,
  ConflictItem,
} from "../../../utils/analytics";

import AudiencePulse from "../../../components/AudiencePulse";
import WhatChanged from "../../../components/WhatChanged";
import TopThemes from "../../../components/TopThemes";
import ConflictingSignals from "../../../components/ConflictingSignals";
import MarketingDirectives from "../../../components/MarketingDirectives";
import AgentConsole from "../../../components/AgentConsole";
import EvidenceLedger from "../../../components/EvidenceLedger";
import CampaignHeader from "../../../components/CampaignHeader";
import IngestConfig from "../../../components/IngestConfig";

function CampaignWorkspaceInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;
  const activeTab = (searchParams.get("tab") as "overview" | "evidence" | "agent") || "overview";

  const [campaign, setCampaign] = useState<Movie | null>(null);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);

  const [ingestQuery, setIngestQuery] = useState("");
  const [ingestLimit, setIngestLimit] = useState(3);
  const [isIngesting, setIsIngesting] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentSearch, setCommentSearch] = useState("");
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);

  const handleSelectEvidence = (commentId: string) => {
    setHighlightedCommentId(commentId);
    router.push(`/campaign/${campaignId}?tab=evidence`);
  };

  const [sentiment, setSentiment] = useState<SentimentStats>({
    positive: 0,
    negative: 0,
    neutral: 0,
    posPercent: 0,
    negPercent: 0,
  });
  const [themeStats, setThemeStats] = useState<ThemeItem[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineNode[]>([]);
  const [conflictingSignals, setConflictingSignals] = useState<ConflictItem[]>([]);
  const [pulseSummary, setPulseSummary] = useState("Loading audience telemetry...");
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isToggling, setIsToggling] = useState(false);

  const fetchCampaignDetail = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.MOVIES);
      if (res.ok) {
        const movies: Movie[] = await res.json();
        const found = movies.find((m) => m.content_id === campaignId);
        if (found) {
          setCampaign(found);
          setIngestQuery(found.target_terms?.[0] || `${found.title} Trailer`);
        }
      }
    } catch (err) {
      console.error("Error fetching campaign details:", err);
    } finally {
      setIsLoadingCampaign(false);
    }
  };

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const res = await fetch(API_ENDPOINTS.COMMENTS(campaignId));
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const resAnalytics = await fetch(API_ENDPOINTS.ANALYTICS(campaignId));
      if (resAnalytics.ok) {
        const data = await resAnalytics.json();
        setSentiment(data.sentiment || { positive: 0, negative: 0, neutral: 0, posPercent: 0, negPercent: 0 });
        setThemeStats(data.themes || []);
        setConflictingSignals(data.conflicts || []);
      }
      
      const resTimeline = await fetch(API_ENDPOINTS.TIMELINE(campaignId));
      if (resTimeline.ok) {
        const data = await resTimeline.json();
        setTimelineData(data || []);
      }
      
      const resPulse = await fetch(API_ENDPOINTS.PULSE(campaignId));
      if (resPulse.ok) {
        const data = await resPulse.json();
        setPulseSummary(data.pulseSummary || "Audience metrics show mixed engagement across tracked thematic aspects.");
      }
    } catch (err) {
      console.error("Error fetching campaign analytics:", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const refreshAll = () => {
    fetchCampaignDetail();
    fetchComments();
    fetchAnalytics();
  };

  useEffect(() => {
    if (campaignId) {
      refreshAll();
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
    } catch (err) {
      console.error("Error toggling campaign status:", err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleTriggerIngest = async () => {
    if (!campaign) return;
    setIsIngesting(true);
    try {
      const res = await fetch(API_ENDPOINTS.INGEST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_id: campaign.content_id,
          query: ingestQuery || campaign.title,
          limit: ingestLimit,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as IngestResponse;
        if (data.status === "success") {
          const ingestNotice: ChatMessage = {
            id: Math.random().toString(),
            sender: "agent",
            text: `### Ingestion Telemetry Complete\nObserved: Ingested ${data.ingested_comments} feedback comments from ${data.source} matching query "${ingestQuery}".`,
          };
          setChatMessages((prev) => [...prev, ingestNotice]);
          refreshAll();
        } else {
          alert(`Ingestion failed: ${data.message || "Unknown error"}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error triggering data ingestion.");
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
          msg.id === agentMsgId ? { ...msg, text: "Error connecting to agent.", isStreaming: false } : msg
        )
      );
    }
  };

  if (isLoadingCampaign) {
    return (
      <div className="flex-1 bg-[#09090b] flex flex-col items-center justify-center text-zinc-400 text-sm gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
        Synchronizing campaign workspace...
      </div>
    );
  }

  if (!campaign) return null;

  const filteredComments = comments.filter((c) =>
    c.text.toLowerCase().includes(commentSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex bg-[#09090b] overflow-hidden h-screen relative text-zinc-100 font-sans">
      {campaign.status === "collecting" && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-8 z-30">
          <Loader2 className="h-10 w-10 animate-spin text-amber-500 mb-4" />
          <h3 className="font-bold text-base text-zinc-100 uppercase tracking-widest mb-2">
            Collecting Real-Time Telemetry
          </h3>
          <p className="text-sm text-zinc-300 max-w-md leading-relaxed font-sans">
            Streaming live YouTube & Reddit discussion feeds into ClickHouse for "{campaign.title}"...
          </p>
        </div>
      )}

      {campaign.status === "stopped" && activeTab !== "agent" && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-8 z-30">
          <AlertTriangle className="h-10 w-10 text-rose-400 mb-4" />
          <h3 className="font-bold text-base text-zinc-100 uppercase tracking-widest mb-2">
            Telemetry Stream Paused
          </h3>
          <p className="text-sm text-zinc-300 max-w-md leading-relaxed mb-5 font-sans">
            Real-time audience monitoring is currently paused for this campaign.
          </p>
          <button
            onClick={handleToggleStatus}
            disabled={isToggling}
            className="bg-emerald-600 hover:bg-emerald-500 text-xs uppercase tracking-wider font-bold text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <PlayCircle className="h-4 w-4" /> Resume Monitoring
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        {/* Executive Control Header */}
        <CampaignHeader
          campaign={campaign}
          onToggleStatus={handleToggleStatus}
          isToggling={isToggling}
          activeTab={activeTab}
          onTabChange={(tab) => router.push(`/campaign/${campaignId}?tab=${tab}`)}
          evidenceCount={comments.length}
        />

        {activeTab === "agent" ? (
          <div className="flex-1 overflow-hidden">
            <AgentConsole
              chatMessages={chatMessages}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              onSendChat={handleSendChat}
              onRefreshMovies={fetchCampaignDetail}
              onSelectEvidence={handleSelectEvidence}
            />
          </div>
        ) : activeTab === "evidence" ? (
          <div className="flex-1 overflow-hidden p-8">
            <EvidenceLedger
              filteredComments={filteredComments}
              isLoadingComments={isLoadingComments}
              commentSearch={commentSearch}
              setCommentSearch={setCommentSearch}
              highlightedCommentId={highlightedCommentId}
            />
          </div>
        ) : (
          /* Unified Executive Intelligence Dashboard */
          <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Top Row: Synopsis + Ingest Trigger */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Campaign Synopsis Card */}
              <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-[#27272a] pb-3">
                  <Film className="h-4 w-4 text-amber-400" />
                  <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-300">
                    Campaign Dossier
                  </h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {campaign.description}
                </p>
                <div className="space-y-2 pt-2 border-t border-[#27272a] text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Target Tracking Terms:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {campaign.target_terms?.map((term, idx) => (
                      <span key={idx} className="bg-[#18181b] border border-[#27272a] px-2 py-0.5 rounded text-zinc-300 text-[10px] font-mono">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ingestion Stream Config */}
              <div className="lg:col-span-2">
                <IngestConfig
                  campaignId={campaign.content_id}
                  ingestQuery={ingestQuery}
                  setIngestQuery={setIngestQuery}
                  ingestLimit={ingestLimit}
                  setIngestLimit={setIngestLimit}
                  isIngesting={isIngesting}
                  onTriggerIngest={handleTriggerIngest}
                  onRefreshAll={refreshAll}
                />
              </div>
            </div>

            {/* Audience Signal Pulse */}
            <AudiencePulse
              comments={comments}
              sentiment={sentiment}
              pulseSummary={pulseSummary}
              dominantTopic={themeStats.length > 0 ? themeStats[0].name : "Unknown"}
            />

            {/* Mid Row: What Changed & Polarizing Conflicts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WhatChanged timelineData={timelineData} />
              <ConflictingSignals conflictingSignals={conflictingSignals} />
            </div>

            {/* Bottom Row: Top Themes & Actionable Directives */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <TopThemes themeStats={themeStats} />
              </div>
              <div className="lg:col-span-2">
                <MarketingDirectives campaign={campaign} themeStats={themeStats} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CampaignWorkspace() {
  return (
    <Suspense fallback={
      <div className="flex-1 bg-[#09090b] flex flex-col items-center justify-center text-zinc-400 text-sm gap-3 h-screen">
        <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
        Synchronizing workspace details...
      </div>
    }>
      <CampaignWorkspaceInner />
    </Suspense>
  );
}
