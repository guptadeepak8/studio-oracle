"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertTriangle, PlayCircle, Film, Sparkles, MessageSquare } from "lucide-react";
import { API_ENDPOINTS, SESSION_CONFIG } from "../../../utils/constants";
import { Movie, Comment, ChatMessage, IngestResponse } from "../../../utils/types";
import {
  SentimentStats,
  ThemeItem,
  TimelineNode,
  ConflictItem,
} from "../../../utils/analytics";

import ExecutiveScorecard from "../../../components/ExecutiveScorecard";
import WhatsWorking from "../../../components/WhatsWorking";
import PlatformComparison from "../../../components/PlatformComparison";
import LaunchTimeline from "../../../components/LaunchTimeline";
import MarketingDirectives from "../../../components/MarketingDirectives";
import AgentConsole from "../../../components/AgentConsole";
import CampaignHeader from "../../../components/CampaignHeader";
import IngestConfig from "../../../components/IngestConfig";

function CampaignWorkspaceInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;
  const activeTab = (searchParams.get("tab") as "overview" | "agent") || "overview";

  const [campaign, setCampaign] = useState<Movie | null>(null);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);

  const [ingestQuery, setIngestQuery] = useState("");
  const [ingestLimit, setIngestLimit] = useState(3);
  const [isIngesting, setIsIngesting] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

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
  const [pulseSummary, setPulseSummary] = useState("Loading audience summary...");

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
        setPulseSummary(data.pulseSummary || "Audience metrics show healthy engagement across key themes.");
      }
    } catch (err) {
      console.error("Error fetching campaign analytics:", err);
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
            text: `### Ingestion Complete\nImported ${data.ingested_comments} comments from ${data.source} matching "${ingestQuery}".`,
          };
          setChatMessages((prev) => [...prev, ingestNotice]);
          refreshAll();
        } else {
          alert(`Import failed: ${data.message || "Unknown error"}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error importing comments.");
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
          msg.id === agentMsgId ? { ...msg, text: "Error connecting to AI assistant.", isStreaming: false } : msg
        )
      );
    }
  };

  if (isLoadingCampaign) {
    return (
      <div className="flex-1 bg-[#09090b] flex flex-col items-center justify-center text-zinc-400 text-sm gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
        Loading campaign dashboard...
      </div>
    );
  }

  if (!campaign) return null;

  return (
    <div className="flex-1 flex bg-[#09090b] overflow-hidden h-screen relative text-zinc-100 font-sans">
      {campaign.status === "stopped" && activeTab !== "agent" && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-8 z-30">
          <AlertTriangle className="h-10 w-10 text-rose-400 mb-4" />
          <h3 className="font-bold text-base text-zinc-100 uppercase tracking-widest mb-2">
            Campaign Monitoring Paused
          </h3>
          <p className="text-sm text-zinc-300 max-w-md leading-relaxed mb-5 font-sans">
            Real-time comment tracking is currently paused for "{campaign.title}".
          </p>
          <button
            onClick={handleToggleStatus}
            disabled={isToggling}
            className="bg-emerald-600 hover:bg-emerald-500 text-xs uppercase tracking-wider font-bold text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <PlayCircle className="h-4 w-4" /> Resume Tracking
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        {/* Campaign Header */}
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
              onSelectEvidence={() => {}}
            />
          </div>
        ) : (
          /* Main Clean Executive Dashboard */
          <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* 1. Executive Summary & Scorecard */}
            <ExecutiveScorecard
              sentiment={sentiment}
              totalComments={comments.length}
              dominantTopic={themeStats.length > 0 ? themeStats[0].name : "General Tone"}
              pulseSummary={pulseSummary}
            />

            {/* 2. What's Working vs What's Not (Bars) */}
            <WhatsWorking themeStats={themeStats} />

            {/* 3. Platform Comparison: YouTube vs Reddit */}
            <PlatformComparison
              conflicts={conflictingSignals}
              dominantTopic={themeStats.length > 0 ? themeStats[0].name : "General"}
            />

            {/* 4. Audience Reaction Over Time */}
            <LaunchTimeline timelineData={timelineData} />

            {/* 5. Marketing Action Plan */}
            <MarketingDirectives campaign={campaign} themeStats={themeStats} />

            {/* 6. Import Comments Control */}
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
        Loading workspace...
      </div>
    }>
      <CampaignWorkspaceInner />
    </Suspense>
  );
}
