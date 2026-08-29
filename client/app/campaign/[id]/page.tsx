"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Film,
  Play,
  Square,
  MessageSquare,
  Loader2,
  Database,
  Layers,
  Settings,
  AlertTriangle,
  PlayCircle,
  RefreshCw,
} from "lucide-react";

import { API_ENDPOINTS, SESSION_CONFIG } from "../../../utils/constants";
import { Movie, Comment, ChatMessage, IngestResponse, ChatResponse } from "../../../utils/types";

// Import modular panels
import AudiencePulse from "../../../components/AudiencePulse";
import MarketingDirectives from "../../../components/MarketingDirectives";
import WhatChanged from "../../../components/WhatChanged";
import TopThemes from "../../../components/TopThemes";
import ConflictingSignals from "../../../components/ConflictingSignals";
import EvidenceLedger from "../../../components/EvidenceLedger";
import AgentConsole from "../../../components/AgentConsole";

type ActiveTab = "overview" | "intelligence" | "evidence" | "agent";

export default function CampaignWorkspace() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Movie | null>(null);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  // Ingestion settings
  const [ingestQuery, setIngestQuery] = useState("");
  const [ingestLimit, setIngestLimit] = useState(3);
  const [isIngesting, setIsIngesting] = useState(false);

  // Evidence feedback
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentSearch, setCommentSearch] = useState("");

  // Chat agent states
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
          
          // Set welcome message scoped to campaign
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
      console.error(e);
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
      console.error(err);
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

    // Scoping session ID to the campaign ID to isolate history context
    const scopedSessionId = `session_${campaign.content_id}`;

    try {
      const res = await fetch(API_ENDPOINTS.CHAT_STREAM, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          session_id: scopedSessionId,
          user_id: SESSION_CONFIG.DEFAULT_USER_ID,
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

  const getSentimentStats = (commentsList: Comment[]) => {
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    commentsList.forEach((c) => {
      const text = c.text.toLowerCase();
      if (
        text.includes("stunning") ||
        text.includes("excited") ||
        text.includes("love") ||
        text.includes("beautiful") ||
        text.includes("great") ||
        text.includes("goosebumps") ||
        text.includes("casting is spot on") ||
        text.includes("exceeded my expectations")
      ) {
        positive++;
      } else if (
        text.includes("disappointed") ||
        text.includes("ruined") ||
        text.includes("terrible") ||
        text.includes("empty") ||
        text.includes("cash-grab") ||
        text.includes("video-gamey")
      ) {
        negative++;
      } else {
        neutral++;
      }
    });
    const total = commentsList.length || 1;
    return {
      positive,
      negative,
      neutral,
      posPercent: Math.round((positive / total) * 100),
      negPercent: Math.round((negative / total) * 100),
    };
  };

  const getThemeStats = (commentsList: Comment[]) => {
    const themes = [
      { name: "Casting", keywords: ["cast", "actor", "lead", "paul", "denzel", "role", "mescal"], count: 0, positive: 0, negative: 0 },
      { name: "Visuals", keywords: ["visual", "cgi", "effects", "scenery", "cinematography", "arena", "colosseum", "look"], count: 0, positive: 0, negative: 0 },
      { name: "Soundtrack", keywords: ["music", "song", "score", "soundtrack", "audio", "track", "orchestral"], count: 0, positive: 0, negative: 0 },
      { name: "Story", keywords: ["story", "plot", "writing", "script", "sequel", "original"], count: 0, positive: 0, negative: 0 },
      { name: "Expectations", keywords: ["expect", "hope", "wait", "hype", "goosebumps", "excited"], count: 0, positive: 0, negative: 0 },
    ];

    commentsList.forEach((c) => {
      const text = c.text.toLowerCase();
      const isPos =
        text.includes("stunning") ||
        text.includes("excited") ||
        text.includes("love") ||
        text.includes("beautiful") ||
        text.includes("great") ||
        text.includes("goosebumps") ||
        text.includes("casting is spot on") ||
        text.includes("exceeded my expectations");
      const isNeg =
        text.includes("disappointed") ||
        text.includes("ruined") ||
        text.includes("terrible") ||
        text.includes("empty") ||
        text.includes("cash-grab") ||
        text.includes("video-gamey");

      themes.forEach((t) => {
        if (t.keywords.some((kw) => text.includes(kw))) {
          t.count++;
          if (isPos) t.positive++;
          if (isNeg) t.negative++;
        }
      });
    });

    return themes.sort((a, b) => b.count - a.count);
  };

  const getTimelineData = (commentsList: Comment[]) => {
    if (commentsList.length === 0) return [];
    const sorted = [...commentsList].sort((a, b) => a.published_at.localeCompare(b.published_at));
    const chunkSize = Math.max(1, Math.ceil(sorted.length / 4));
    const intervals = [];

    for (let i = 0; i < sorted.length; i += chunkSize) {
      const chunk = sorted.slice(i, i + chunkSize);
      const firstComment = chunk[0];

      let positive = 0;
      let negative = 0;
      chunk.forEach((c) => {
        const text = c.text.toLowerCase();
        if (
          text.includes("stunning") ||
          text.includes("excited") ||
          text.includes("love") ||
          text.includes("beautiful") ||
          text.includes("great") ||
          text.includes("goosebumps") ||
          text.includes("casting is spot on") ||
          text.includes("exceeded my expectations")
        ) {
          positive++;
        } else if (
          text.includes("disappointed") ||
          text.includes("ruined") ||
          text.includes("terrible") ||
          text.includes("empty") ||
          text.includes("cash-grab") ||
          text.includes("video-gamey")
        ) {
          negative++;
        }
      });

      let label = "";
      if (firstComment) {
        const parts = firstComment.published_at.split(" ");
        if (parts.length > 1) {
          const timeParts = parts[1].split(":");
          label = `${parts[0].slice(5)} ${timeParts[0]}:${timeParts[1]}`;
        } else {
          label = firstComment.published_at;
        }
      }

      let dominantTopic = "Audience Setup";
      if (chunk.some((c) => c.text.toLowerCase().includes("cast") || c.text.toLowerCase().includes("actor"))) {
        dominantTopic = "Casting Debates";
      } else if (chunk.some((c) => c.text.toLowerCase().includes("music") || c.text.toLowerCase().includes("soundtrack"))) {
        dominantTopic = "Soundtrack Feed";
      } else if (chunk.some((c) => c.text.toLowerCase().includes("visual") || c.text.toLowerCase().includes("cgi"))) {
        dominantTopic = "CGI Critiques";
      }

      intervals.push({
        label,
        count: chunk.length,
        positiveRatio: Math.round((positive / (chunk.length || 1)) * 100),
        negativeRatio: Math.round((negative / (chunk.length || 1)) * 100),
        dominantTopic,
        representativeComment: chunk[0]?.text || "",
      });
    }
    return intervals;
  };

  const getConflictingSignals = (commentsList: Comment[]) => {
    const conflicts = [];
    const themes = [
      { name: "CASTING", keywords: ["cast", "actor", "lead", "mescal", "denzel", "role"] },
      { name: "VISUALS", keywords: ["visual", "cgi", "effects", "cinematography", "colosseum"] },
      { name: "SOUNDTRACK", keywords: ["music", "song", "score", "soundtrack"] },
    ];

    for (const t of themes) {
      let positiveComment: Comment | null = null;
      let negativeComment: Comment | null = null;

      for (const c of commentsList) {
        const text = c.text.toLowerCase();
        if (t.keywords.some((kw) => text.includes(kw))) {
          const isPos =
            text.includes("stunning") ||
            text.includes("excited") ||
            text.includes("love") ||
            text.includes("beautiful") ||
            text.includes("great") ||
            text.includes("goosebumps") ||
            text.includes("casting is spot on") ||
            text.includes("exceeded my expectations");
          const isNeg =
            text.includes("disappointed") ||
            text.includes("ruined") ||
            text.includes("terrible") ||
            text.includes("empty") ||
            text.includes("cash-grab") ||
            text.includes("video-gamey");

          if (isPos && !positiveComment) positiveComment = c;
          if (isNeg && !negativeComment) negativeComment = c;

          if (positiveComment && negativeComment) break;
        }
      }

      if (positiveComment && negativeComment) {
        conflicts.push({
          theme: t.name,
          positive: {
            text: positiveComment.text,
            author: positiveComment.author,
            source: positiveComment.source,
            likes: positiveComment.like_count,
            published: positiveComment.published_at,
          },
          negative: {
            text: negativeComment.text,
            author: negativeComment.author,
            source: negativeComment.source,
            likes: negativeComment.like_count,
            published: negativeComment.published_at,
          },
        });
      }
    }
    return conflicts;
  };

  const getPulseSummary = (commentsList: Comment[]) => {
    if (commentsList.length === 0) {
      return "No active launch telemetry found. Ingest feedback to compile audience intelligence.";
    }
    const stats = getSentimentStats(commentsList);
    const themes = getThemeStats(commentsList);
    const topTheme = themes[0];
    const secondTheme = themes[1];

    let pulseText = "Audience reaction is mixed. ";
    if (stats.posPercent > 60) pulseText = "Audience sentiment is leaning positive. ";
    else if (stats.posPercent < 35) pulseText = "Audience sentiment is leaning critical. ";

    if (topTheme && topTheme.count > 0) {
      pulseText += `Discussions are dominated by the '${topTheme.name}' topic. `;
      if (topTheme.positive > topTheme.negative) {
        pulseText += `Audiences are reacting very positively to the ${topTheme.name.toLowerCase()} elements. `;
      } else if (topTheme.negative > topTheme.positive) {
        pulseText += `There are clear visual concerns or criticisms regarding the ${topTheme.name.toLowerCase()}. `;
      }
    }
    if (secondTheme && secondTheme.count > 0) {
      pulseText += `Additionally, discussion surrounding the film's '${secondTheme.name.toLowerCase()}' is sparking divided debates.`;
    }
    return pulseText;
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
      {/* OVERLAY: Collecting Status */}
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

      {/* OVERLAY: Stopped Status (Only covers overview, intelligence, evidence tabs. Agent can still run) */}
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

      {/* Workspace Left Area (Main body - 65% when chat is open, or 100% depending on active tab) */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden ${activeTab === "agent" ? "w-[65%]" : "w-full"}`}>
        {/* Workspace Sub Header */}
        <div className="p-4 border-b border-zinc-800 bg-[#0e0e11] flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <h1 className="font-bold text-lg text-zinc-100 tracking-tight uppercase flex items-center gap-2">
              {campaign.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase font-semibold">
              <span>{campaign.content_type}</span>
              <span>·</span>
              <div className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${
                  campaign.status === "active"
                    ? "bg-emerald-500 animate-pulse"
                    : campaign.status === "collecting"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`} />
                <span>{campaign.status}</span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleStatus}
              disabled={isToggling}
              className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                campaign.status === "stopped"
                  ? "bg-emerald-600 border-emerald-500 hover:bg-emerald-500 text-white"
                  : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300"
              }`}
            >
              {campaign.status === "stopped" ? (
                <>
                  <Play className="h-3 w-3 fill-white" /> Start
                </>
              ) : (
                <>
                  <Square className="h-3 w-3 fill-zinc-300" /> Stop
                </>
              )}
            </button>

            {activeTab !== "agent" && (
              <button
                onClick={() => setActiveTab("agent")}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" /> Ask StudioOracle
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="px-5 border-b border-zinc-800 bg-[#0e0e11]/50 flex gap-4 text-xs font-bold uppercase tracking-wider shrink-0">
          {(["overview", "intelligence", "evidence", "agent"] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3.5 border-b-2 px-1 transition cursor-pointer ${
                activeTab === tab
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-350"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Tab Panel content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Meta details */}
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

                {/* Sources info */}
                <div className="col-span-2 space-y-6">
                  {/* YouTube Ingestion trigger settings */}
                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4 text-sm font-sans">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Settings className="h-4.5 w-4.5 text-amber-500" />
                      <span className="font-bold text-xs uppercase tracking-wider text-zinc-300">YouTube Feedback settings</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-500 font-bold block uppercase">Ingest Search Query</label>
                        <input
                          type="text"
                          value={ingestQuery}
                          onChange={(e) => setIngestQuery(e.target.value)}
                          placeholder="YouTube Video Query..."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-200 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-500 font-bold block uppercase">Video Limit</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={ingestLimit}
                            onChange={(e) => setIngestLimit(parseInt(e.target.value) || 1)}
                            className="w-16 bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-200 text-center"
                          />
                          <button
                            onClick={handleTriggerIngest}
                            disabled={isIngesting}
                            className="flex-1 bg-zinc-700 hover:bg-zinc-650 disabled:opacity-50 py-2 px-3 rounded-lg text-xs font-bold text-white transition flex items-center justify-center gap-1 border border-zinc-600"
                          >
                            {isIngesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                            Run YouTube Ingestion
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Core Pulse preview */}
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
              <MarketingDirectives themeStats={themeStats} />
              <WhatChanged timelineData={timelineData} />
              <div className="grid grid-cols-2 gap-5">
                <TopThemes themeStats={themeStats} />
                <ConflictingSignals conflictingSignals={conflictingSignals} />
              </div>
            </div>
          )}

          {activeTab === "evidence" && (
            <EvidenceLedger
              filteredComments={filteredComments}
              isLoadingComments={isLoadingComments}
              commentSearch={commentSearch}
              setCommentSearch={setCommentSearch}
            />
          )}

          {activeTab === "agent" && (
            <div className="h-[60vh] border border-zinc-850 rounded-xl overflow-hidden">
              <AgentConsole
                chatMessages={chatMessages}
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                onSendChat={handleSendChat}
                onRefreshMovies={fetchCampaignDetail}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
