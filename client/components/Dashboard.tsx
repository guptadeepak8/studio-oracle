"use client";

import React, { useState, useEffect, FormEvent } from "react";
import {
  Film,
  Plus,
  RefreshCw,
  Loader2,
  Database,
  Layers,
  Play,
  Square,
  Settings,
  AlertTriangle,
  PlayCircle,
} from "lucide-react";

import { API_ENDPOINTS, SESSION_CONFIG } from "../utils/constants";
import { Movie, Comment, ChatMessage, IngestResponse, ChatResponse } from "../utils/types";

// Import modular sub-components
import AgentConsole from "./AgentConsole";
import AudiencePulse from "./AudiencePulse";
import MarketingDirectives from "./MarketingDirectives";
import WhatChanged from "./WhatChanged";
import TopThemes from "./TopThemes";
import ConflictingSignals from "./ConflictingSignals";
import EvidenceLedger from "./EvidenceLedger";
import RegisterModal from "./RegisterModal";

interface DashboardProps {
  initialMovies: Movie[];
}

type CampaignStatus = "active" | "stopped" | "collecting";

export default function Dashboard({ initialMovies }: DashboardProps) {
  // Movie tracking state
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(
    initialMovies.length > 0 ? initialMovies[0] : null
  );
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);

  // Campaign statuses map (persisted in local state)
  const [campaignStatuses, setCampaignStatuses] = useState<Record<string, CampaignStatus>>({});

  // Ingestion form state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("movie");
  const [newReleaseDate, setNewReleaseDate] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const [ingestQuery, setIngestQuery] = useState("");
  const [ingestLimit, setIngestLimit] = useState(3);
  const [isIngesting, setIsIngesting] = useState(false);

  // Comments/Analytics state
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentSearch, setCommentSearch] = useState("");

  // Chat/Agent state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "agent",
      text: "Hello! I am StudioOracle, your AI audience intelligence and marketing strategist. Register a campaign, ingest audience feedback, and ask me to investigate ClickHouse or formulate marketing adjustments.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Initialize campaign statuses from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem("studio_oracle_campaign_statuses");
    if (saved) {
      try {
        setCampaignStatuses(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default all to active
      const initialStatuses: Record<string, CampaignStatus> = {};
      initialMovies.forEach((m) => {
        initialStatuses[m.content_id] = "active";
      });
      setCampaignStatuses(initialStatuses);
    }
  }, [initialMovies]);

  // Save campaign statuses to localStorage
  const saveStatuses = (newStatuses: Record<string, CampaignStatus>) => {
    setCampaignStatuses(newStatuses);
    localStorage.setItem("studio_oracle_campaign_statuses", JSON.stringify(newStatuses));
  };

  // Fetch comments when movie changes
  useEffect(() => {
    if (selectedMovie) {
      fetchComments(selectedMovie.content_id);
      setIngestQuery(`${selectedMovie.title} Trailer`);
    } else {
      setComments([]);
    }
  }, [selectedMovie]);

  const fetchMovies = async (selectNewId?: string) => {
    setIsLoadingMovies(true);
    try {
      const res = await fetch(API_ENDPOINTS.MOVIES);
      if (res.ok) {
        const data = (await res.json()) as Movie[];
        setMovies(data);
        
        // Match selection
        if (selectNewId) {
          const matched = data.find((x) => x.content_id === selectNewId);
          if (matched) setSelectedMovie(matched);
        } else if (data.length > 0 && !selectedMovie) {
          setSelectedMovie(data[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching movies:", err);
    } finally {
      setIsLoadingMovies(false);
    }
  };

  const fetchComments = async (contentId: string) => {
    setIsLoadingComments(true);
    try {
      const res = await fetch(API_ENDPOINTS.COMMENTS(contentId));
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

  // Register a new movie campaign
  const handleRegisterMovie = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsRegistering(true);
    const userPrompt = `Register a new movie campaign titled '${newTitle}' with description '${newDesc}'${
      newReleaseDate ? ` and release date '${newReleaseDate}'` : ""
    }.`;
    const userMsgId = Math.random().toString();
    setChatMessages((prev) => [...prev, { id: userMsgId, sender: "user", text: userPrompt }]);

    const agentMsgId = Math.random().toString();
    setChatMessages((prev) => [...prev, { id: agentMsgId, sender: "agent", text: "Creating campaign parameters in database...", isStreaming: true }]);

    try {
      const response = await fetch(API_ENDPOINTS.CHAT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userPrompt,
          session_id: SESSION_CONFIG.DEFAULT_SESSION_ID,
          user_id: SESSION_CONFIG.DEFAULT_USER_ID,
        }),
      });

      if (response.ok) {
        const result = (await response.json()) as ChatResponse;
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === agentMsgId ? { ...msg, text: result.response, isStreaming: false } : msg
          )
        );
        
        // Reset inputs and close modal
        const tempTitle = newTitle;
        setNewTitle("");
        setNewDesc("");
        setNewReleaseDate("");
        setShowRegisterModal(false);

        // Fetch new campaigns
        setIsLoadingMovies(true);
        const listRes = await fetch(API_ENDPOINTS.MOVIES);
        if (listRes.ok) {
          const data = (await listRes.json()) as Movie[];
          setMovies(data);
          // Find the newly registered campaign ID
          const matched = data.find((x) => x.title.toLowerCase() === tempTitle.toLowerCase());
          if (matched) {
            setSelectedMovie(matched);
            
            // Put campaign into collecting state
            const updated = { ...campaignStatuses };
            updated[matched.content_id] = "collecting";
            saveStatuses(updated);

            // Simulate data collection pipelines for 2.5 seconds
            setTimeout(() => {
              const finished = { ...updated };
              finished[matched.content_id] = "active";
              saveStatuses(finished);
            }, 2500);
          }
        }
      } else {
        throw new Error("API registration failed");
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === agentMsgId
            ? { ...msg, text: "Failed to register campaign metadata.", isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsRegistering(false);
      setIsLoadingMovies(false);
    }
  };

  // Trigger manual YouTube ingestion
  const handleTriggerIngest = async () => {
    if (!selectedMovie || !ingestQuery.trim()) return;

    setIsIngesting(true);
    try {
      const res = await fetch(API_ENDPOINTS.INGEST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_id: selectedMovie.content_id,
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
          fetchComments(selectedMovie.content_id);
        } else {
          alert(`Ingestion failed: ${data.message || "Unknown error"}`);
        }
      }
    } catch (err) {
      console.error("Ingestion error:", err);
      alert("Failed to connect to ingestion server.");
    } finally {
      setIsIngesting(false);
    }
  };

  // Send SSE chat stream query to the agent
  const handleSendChat = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsgId = Math.random().toString();
    setChatMessages((prev) => [...prev, { id: userMsgId, sender: "user", text: textToSend }]);
    if (!messageText) setInputMessage("");

    const agentMsgId = Math.random().toString();
    setChatMessages((prev) => [...prev, { id: agentMsgId, sender: "agent", text: "", isStreaming: true }]);

    try {
      const res = await fetch(API_ENDPOINTS.CHAT_STREAM, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          session_id: SESSION_CONFIG.DEFAULT_SESSION_ID,
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
      console.error("Streaming error:", err);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === agentMsgId ? { ...msg, text: "Error connecting to agent.", isStreaming: false } : msg
        )
      );
    }
  };

  // Start / Stop campaign handlers
  const handleToggleCampaignStatus = (contentId: string) => {
    const currentStatus = campaignStatuses[contentId] || "active";
    const nextStatus = currentStatus === "stopped" ? "active" : "stopped";
    const updated = { ...campaignStatuses };
    updated[contentId] = nextStatus;
    saveStatuses(updated);
  };

  // Client side sentiment statistics
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

  // Dynamic Theme/Topics statistics calculator
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

  // Dynamic timeline generator
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

  // Dynamic conflicting signals searcher
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

  // Dynamic summary compiler
  const getPulseSummary = (commentsList: Comment[]) => {
    if (commentsList.length === 0) {
      return "No active launch telemetry found. Start a campaign and run Ingest Feedback to compile audience intelligence.";
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

  const sentiment = getSentimentStats(comments);
  const themeStats = getThemeStats(comments);
  const timelineData = getTimelineData(comments);
  const conflictingSignals = getConflictingSignals(comments);
  const pulseSummary = getPulseSummary(comments);
  const filteredComments = comments.filter((c) =>
    c.text.toLowerCase().includes(commentSearch.toLowerCase())
  );

  const selectedCampaignStatus = selectedMovie ? campaignStatuses[selectedMovie.content_id] || "active" : "active";

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* COLUMN 1: CAMPAIGN MANAGER: LEFT SIDEBAR (20%) */}
      <div className="w-[20%] border-r border-zinc-800 flex flex-col h-full bg-[#0d0d0f] shrink-0 text-sm">
        {/* Campaign Header */}
        <div className="p-4.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
          <span className="font-bold text-xs uppercase tracking-wider text-zinc-350">Campaigns</span>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs px-2.5 py-1 rounded transition text-zinc-100 font-bold"
          >
            <Plus className="h-3.5 w-3.5" />
            Track
          </button>
        </div>

        {/* Campaign List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold block mb-1">
            Tracked Campaigns
          </span>
          {isLoadingMovies ? (
            <div className="flex items-center gap-2 text-xs text-zinc-550 py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Syncing list...
            </div>
          ) : (
            movies.map((m) => {
              const status = campaignStatuses[m.content_id] || "active";
              const isActive = selectedMovie?.content_id === m.content_id;
              return (
                <div
                  key={m.content_id}
                  onClick={() => setSelectedMovie(m)}
                  className={`p-3 rounded-lg border transition cursor-pointer flex flex-col gap-1.5 ${
                    isActive
                      ? "bg-zinc-800/80 border-amber-500/50"
                      : "bg-zinc-900/30 border-zinc-850 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-zinc-200 truncate pr-2 block max-w-[120px]" title={m.title}>
                      {m.title}
                    </span>
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${
                        status === "active" 
                          ? "bg-emerald-500 animate-pulse" 
                          : status === "collecting"
                          ? "bg-amber-500 animate-spin border border-dashed border-amber-600"
                          : "bg-rose-500"
                      }`} />
                      <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">
                        {status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions / Toggles */}
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1.5 border-t border-zinc-850/50">
                    <span className="capitalize">{m.content_type}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCampaignStatus(m.content_id);
                      }}
                      className="hover:text-zinc-300 font-semibold flex items-center gap-1"
                    >
                      {status === "stopped" ? (
                        <>
                          <Play className="h-2.5 w-2.5 text-emerald-500 fill-emerald-500" /> Resume
                        </>
                      ) : (
                        <>
                          <Square className="h-2.5 w-2.5 text-rose-500 fill-rose-500" /> Stop
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Configuration / Ingest Settings */}
        {selectedMovie && selectedCampaignStatus === "active" && (
          <div className="p-4.5 border-t border-zinc-850 bg-black/30 space-y-3.5">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5" />
              Ingestion Configs
            </span>
            <div className="space-y-2">
              <input
                type="text"
                value={ingestQuery}
                onChange={(e) => setIngestQuery(e.target.value)}
                placeholder="YouTube Search Query..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
              <div className="flex gap-2 items-center">
                <span className="text-xs text-zinc-500 font-bold">Limit:</span>
                <input
                  type="number"
                  value={ingestLimit}
                  onChange={(e) => setIngestLimit(parseInt(e.target.value) || 1)}
                  className="w-10 bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-zinc-200 text-center"
                />
                <button
                  onClick={handleTriggerIngest}
                  disabled={isIngesting}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-650 disabled:opacity-50 py-1.5 px-2 rounded text-xs font-bold text-white transition flex items-center justify-center gap-1 border border-zinc-600 shadow"
                >
                  {isIngesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  Ingest Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* COLUMN 2: INTELLIGENCE DASHBOARD: CENTER COLUMN (45%) */}
      <div className="w-[45%] flex flex-col h-full overflow-hidden bg-zinc-950 border-r border-zinc-800">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#0e0e11] shrink-0">
          <div className="flex items-center gap-2.5">
            <Film className="h-5 w-5 text-amber-500" />
            <h1 className="font-bold text-sm tracking-wider uppercase text-zinc-100">
              {selectedMovie ? `${selectedMovie.title} Campaign` : "Launch Intelligence Dashboard"}
            </h1>
          </div>
        </div>

        {/* Dashboard Content Panes */}
        <div className="flex-1 overflow-y-auto p-5 relative">
          {/* OVERLAY 1: COLLECTING STATE */}
          {selectedCampaignStatus === "collecting" && (
            <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center text-center p-8 z-30 animate-fade-in">
              <Loader2 className="h-10 w-10 animate-spin text-amber-500 mb-4" />
              <h3 className="font-bold text-base text-zinc-100 uppercase tracking-widest mb-1.5">
                Data Collection Active
              </h3>
              <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
                Establishing communication with ClickHouse evidence pipeline. Summarizing YouTube audience comments and setting campaign markers...
              </p>
            </div>
          )}

          {/* OVERLAY 2: STOPPED STATE */}
          {selectedCampaignStatus === "stopped" && (
            <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center text-center p-8 z-30 animate-fade-in">
              <AlertTriangle className="h-10 w-10 text-rose-500 mb-4" />
              <h3 className="font-bold text-base text-zinc-100 uppercase tracking-widest mb-1.5">
                Campaign Tracking Stopped
              </h3>
              <p className="text-sm text-zinc-400 max-w-sm leading-relaxed mb-4">
                This campaign was stopped. Ingestion is paused, and analytics computations are disabled.
              </p>
              <button
                onClick={() => selectedMovie && handleToggleCampaignStatus(selectedMovie.content_id)}
                className="bg-emerald-600 hover:bg-emerald-500 text-xs uppercase tracking-wider font-bold text-white px-4 py-2 rounded shadow flex items-center gap-1.5"
              >
                <PlayCircle className="h-4 w-4" /> Resume Tracking
              </button>
            </div>
          )}

          {/* Actual Dashboard panels */}
          <div className="space-y-6">
            <AudiencePulse
              comments={comments}
              sentiment={sentiment}
              pulseSummary={pulseSummary}
              dominantTopic={themeStats.length > 0 ? themeStats[0].name : "Unknown"}
            />

            <MarketingDirectives themeStats={themeStats} />

            <WhatChanged timelineData={timelineData} />

            <div className="grid grid-cols-2 gap-5">
              <TopThemes themeStats={themeStats} />
              <ConflictingSignals conflictingSignals={conflictingSignals} />
            </div>

            <EvidenceLedger
              filteredComments={filteredComments}
              isLoadingComments={isLoadingComments}
              commentSearch={commentSearch}
              setCommentSearch={setCommentSearch}
            />
          </div>
        </div>
      </div>

      {/* COLUMN 3: AGENT INVESTIGATION: RIGHT COLUMN (35%) */}
      <AgentConsole
        chatMessages={chatMessages}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onSendChat={handleSendChat}
        onRefreshMovies={fetchMovies}
      />

      {/* Track Launch Modal Overlay */}
      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSubmit={handleRegisterMovie}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          newDesc={newDesc}
          setNewDesc={setNewDesc}
          newType={newType}
          setNewType={setNewType}
          newReleaseDate={newReleaseDate}
          setNewReleaseDate={setNewReleaseDate}
          isRegistering={isRegistering}
        />
      )}
    </div>
  );
}
