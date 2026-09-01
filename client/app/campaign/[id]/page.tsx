"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertTriangle, PlayCircle, Film, Sparkles, MessageSquare, Trash2, X } from "lucide-react";
import { API_ENDPOINTS, SESSION_CONFIG } from "../../../utils/constants";
import { Movie, Comment, ChatMessage, IngestResponse } from "../../../utils/types";
import { toast } from "sonner";
import {
  SentimentStats,
  ThemeItem,
  TimelineNode,
  ConflictItem,
} from "../../../utils/analytics";

import ExecutiveScorecard from "../../../components/ExecutiveScorecard";
import WhatsWorking from "../../../components/WhatsWorking";
import PlatformComparison from "../../../components/PlatformComparison";
import TrailerComparison from "../../../components/TrailerComparison";
import MarketingDirectives from "../../../components/MarketingDirectives";
import AgentConsole from "../../../components/AgentConsole";
import CampaignHeader from "../../../components/CampaignHeader";
import IngestConfig from "../../../components/IngestConfig";

function CampaignWorkspaceInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;
  const activeTab = (searchParams.get("tab") as "overview" | "marketing" | "agent") || "overview";

  const [campaign, setCampaign] = useState<Movie | null>(null);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);

  const [ingestQuery, setIngestQuery] = useState("");
  const [ingestLimit, setIngestLimit] = useState(3);
  const [maxComments, setMaxComments] = useState(1000);
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
  const [conflictingSignals, setConflictingSignals] = useState<ConflictItem[]>([]);
  const [platforms, setPlatforms] = useState<Record<string, any>>({});
  const [drops, setDrops] = useState<any[]>([]);
  const [pulseSummary, setPulseSummary] = useState("Loading audience summary...");

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");

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
        setPlatforms(data.platforms || {});
      }
      
      const resDrops = await fetch(API_ENDPOINTS.DROPS(campaignId));
      if (resDrops.ok) {
        const dropData = await resDrops.json();
        setDrops(dropData || []);
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

  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteCampaign = async () => {
    if (!campaign) return;
    setIsDeleting(true);
    try {
      const res = await fetch(API_ENDPOINTS.DELETE_CAMPAIGN(campaign.content_id), {
        method: "DELETE",
      });
      if (res.ok) {
        window.dispatchEvent(new Event("refresh-campaigns"));
        toast.success(`"${campaign.title}" deleted and audience logs purged.`);
        router.push("/");
      } else {
        toast.error("Failed to delete campaign.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error deleting campaign.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

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
        if (nextStatus === "active") {
          toast.success(`Live tracking resumed for "${campaign.title}".`);
        } else {
          toast.info(`Live tracking paused for "${campaign.title}".`);
        }
      } else {
        toast.error("Failed to update tracking status.");
      }
    } catch (err) {
      console.error("Error toggling campaign status:", err);
      toast.error("Network error updating status.");
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
          max_comments: maxComments,
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
          toast.success(`Successfully synced ${data.ingested_comments} audience comments from YouTube!`);
        } else {
          toast.error(`Comment sync failed: ${data.message || "Unknown error"}`);
        }
      } else {
        toast.error("Failed to sync comments. Ensure campaign tracking is active.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error syncing comments.");
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
      <div className="flex-1 bg-[#0e0e10] flex flex-col items-center justify-center text-zinc-400 text-xs gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-[#e6fc4f]" />
        Loading campaign dashboard...
      </div>
    );
  }

  if (!campaign) return null;

  return (
    <div className="flex-1 flex bg-[#0e0e10] overflow-hidden h-screen relative text-zinc-100 font-sans">
      {campaign.status === "stopped" && activeTab !== "agent" && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-8 z-30 font-sans">
          <AlertTriangle className="h-8 w-8 text-amber-400 mb-3" />
          <h3 className="font-bold text-base text-zinc-100 uppercase tracking-wider mb-1">
            Campaign Monitoring Paused
          </h3>
          <p className="text-xs text-zinc-400 max-w-md leading-relaxed mb-6">
            Real-time comment tracking is currently paused for <strong className="text-zinc-100">"{campaign.title}"</strong>. You can resume live tracking or permanently delete this campaign.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleStatus}
              disabled={isToggling || isDeleting}
              className="bg-[#e6fc4f] hover:bg-[#d8ed47] text-xs font-bold text-black px-5 py-2.5 rounded-lg shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <PlayCircle className="h-4 w-4 fill-black" />
              <span>Resume Live Tracking</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isToggling || isDeleting}
              className="bg-[#242428] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-[#323238] hover:border-rose-800 text-xs font-bold px-4 py-2.5 rounded-lg shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Campaign</span>
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-[#1c1c1f] border border-[#28282b] rounded-2xl w-full max-w-md p-6 space-y-4 text-left shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Confirm Campaign Deletion</span>
                  </div>
                  <button onClick={() => setShowDeleteConfirm(false)} className="text-zinc-500 hover:text-zinc-300 p-1">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Are you sure you want to delete <strong className="text-white font-bold">{campaign.title}</strong>? This will permanently delete the campaign record and purge all collected audience comments from ClickHouse.
                </p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#28282b]">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:bg-[#28282b] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCampaign}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Permanently</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        {/* Campaign Header with Actions Dropdown */}
        <CampaignHeader
          campaign={campaign}
          onToggleStatus={handleToggleStatus}
          isToggling={isToggling}
          activeTab={activeTab}
          onTabChange={(tab) => router.push(`/campaign/${campaignId}?tab=${tab}`)}
          evidenceCount={comments.length}
          onRefreshData={refreshAll}
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
        ) : activeTab === "marketing" ? (
          /* Full-Width Dedicated Marketing Action Plan Tab */
          <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full space-y-8">
            <MarketingDirectives campaign={campaign} themeStats={themeStats} drops={drops} />
          </div>
        ) : (
          /* Main ClickHouse Cloud Style Executive Dashboard */
          <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* 1. 5-Card Top Metrics Row */}
            <ExecutiveScorecard
              sentiment={sentiment}
              totalComments={comments.length}
              dominantTopic={themeStats.length > 0 ? themeStats[0].name : "General Tone"}
              pulseSummary={pulseSummary}
              releaseDate={campaign.release_date}
              campaignTitle={campaign.title}
              onTriggerImport={() => {
                const element = document.getElementById("ingest-section");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
            />

            {/* 2. What Changed: Real Drops from ClickHouse */}
            <TrailerComparison campaign={campaign} drops={drops} />

            {/* 3. Expandable Section: What Fans Love vs What's Not (Table) */}
            <WhatsWorking themeStats={themeStats} />

            {/* 4. Expandable Section: YouTube vs Reddit Reaction */}
            <PlatformComparison
              platforms={platforms}
              dominantTopic={themeStats.length > 0 ? themeStats[0].name : "General"}
            />

            {/* 5. Audience Feedback Sync Section */}
            <div id="ingest-section">
              <IngestConfig
                campaignId={campaign.content_id}
                ingestQuery={ingestQuery}
                setIngestQuery={setIngestQuery}
                ingestLimit={ingestLimit}
                setIngestLimit={setIngestLimit}
                maxComments={maxComments}
                setMaxComments={setMaxComments}
                isIngesting={isIngesting}
                onTriggerIngest={handleTriggerIngest}
                onRefreshAll={refreshAll}
              />
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
      <div className="flex-1 bg-[#0e0e10] flex flex-col items-center justify-center text-zinc-400 text-xs gap-2 h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-[#e6fc4f]" />
        Loading workspace...
      </div>
    }>
      <CampaignWorkspaceInner />
    </Suspense>
  );
}
