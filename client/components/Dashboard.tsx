"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { Film, Plus, RefreshCw, Loader2, Database, Layers } from "lucide-react";

import { API_ENDPOINTS, SESSION_CONFIG } from "../utils/constants";
import { Movie, Comment, ChatMessage, IngestResponse, ChatResponse } from "../utils/types";

// Import modular sub-components
import AgentConsole from "./AgentConsole";
import AudiencePulse from "./AudiencePulse";
import WhatChanged from "./WhatChanged";
import TopThemes from "./TopThemes";
import ConflictingSignals from "./ConflictingSignals";
import EvidenceLedger from "./EvidenceLedger";
import RegisterModal from "./RegisterModal";

interface DashboardProps {
  initialMovies: Movie[];
}

export default function Dashboard({ initialMovies }: DashboardProps) {
  // Movie tracking state
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(
    initialMovies.length > 0 ? initialMovies[0] : null
  );
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);

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
      text: "Hello! I am StudioOracle, your AI audience intelligence analyst. Register a movie or series campaign, ingest audience feedback, and ask me to investigate the evidence in ClickHouse.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Synchronize state when server props change
  useEffect(() => {
    setMovies(initialMovies);
    if (initialMovies.length > 0 && !selectedMovie) {
      setSelectedMovie(initialMovies[0]);
    }
  }, [initialMovies]);

  // Fetch comments when movie changes
  useEffect(() => {
    if (selectedMovie) {
      fetchComments(selectedMovie.content_id);
      setIngestQuery(`${selectedMovie.title} Trailer`);
    } else {
      setComments([]);
    }
  }, [selectedMovie]);

  const fetchMovies = async () => {
    setIsLoadingMovies(true);
    try {
      const res = await fetch(API_ENDPOINTS.MOVIES);
      if (res.ok) {
        const data = (await res.json()) as Movie[];
        setMovies(data);
        if (data.length > 0 && !selectedMovie) {
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

  // Register a new movie via agent chat prompt
  const handleRegisterMovie = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsRegistering(true);
    const userPrompt = `Register a new movie titled '${newTitle}' with description '${newDesc}'${
      newReleaseDate ? ` and release date '${newReleaseDate}'` : ""
    }.`;
    const userMsgId = Math.random().toString();
    setChatMessages((prev) => [...prev, { id: userMsgId, sender: "user", text: userPrompt }]);

    const agentMsgId = Math.random().toString();
    setChatMessages((prev) => [...prev, { id: agentMsgId, sender: "agent", text: "Registering campaign...", isStreaming: true }]);

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
        setNewTitle("");
        setNewDesc("");
        setNewReleaseDate("");
        setShowRegisterModal(false);
        await fetchMovies();
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

  // Client side sentiment analyzer
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
      return "No active launch telemetry found. Register a movie or trailer campaign above and run Ingest Feedback to fetch real audience evidence from ClickHouse.";
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

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* 1. AGENT INVESTIGATION: LEFT SIDEBAR */}
      <AgentConsole
        chatMessages={chatMessages}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onSendChat={handleSendChat}
        onRefreshMovies={fetchMovies}
      />

      {/* RIGHT SIDE: Launch Dashboard */}
      <div className="w-[60%] flex flex-col h-full overflow-hidden bg-zinc-950">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <Film className="h-4 w-4 text-amber-500" />
            <h1 className="font-semibold text-xs tracking-wider uppercase text-zinc-100">
              StudioOracle Launch Intelligence
            </h1>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-1 bg-zinc-700 hover:bg-zinc-650 border border-zinc-600 text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded transition text-zinc-100"
          >
            <Plus className="h-3.5 w-3.5" />
            Track Launch
          </button>
        </div>

        {/* Selected Movie Controls & Meta Grid (Subordinate) */}
        <div className="p-4 border-b border-zinc-800 grid grid-cols-3 gap-4 bg-zinc-900/20 shrink-0 text-xs">
          {/* Active Launch dropdown */}
          <div className="col-span-1 space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">
              Active launch
            </span>
            {isLoadingMovies ? (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
                Loading...
              </div>
            ) : (
              <select
                value={selectedMovie?.content_id || ""}
                onChange={(e) => {
                  const m = movies.find((x) => x.content_id === e.target.value);
                  if (m) setSelectedMovie(m);
                }}
                className="w-full bg-zinc-800 border border-zinc-700 rounded p-1.5 text-xs text-zinc-200 focus:outline-none"
              >
                {movies.map((m) => (
                  <option key={m.content_id} value={m.content_id}>
                    {m.title}
                  </option>
                ))}
              </select>
            )}
            <p className="text-[10px] text-zinc-400 leading-tight">
              {selectedMovie?.description}
            </p>
          </div>

          {/* YouTube Ingestion trigger */}
          {selectedMovie && (
            <div className="col-span-1 border-l border-zinc-850 pl-4 space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">
                Ingestion Engine
              </span>
              <input
                type="text"
                value={ingestQuery}
                onChange={(e) => setIngestQuery(e.target.value)}
                placeholder="YouTube Search Query..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded p-1 text-[10px] text-zinc-200 focus:outline-none"
              />
              <div className="flex gap-1 items-center">
                <span className="text-[9px] text-zinc-500 font-bold">LMT:</span>
                <input
                  type="number"
                  value={ingestLimit}
                  onChange={(e) => setIngestLimit(parseInt(e.target.value) || 1)}
                  className="w-8 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-200 text-center"
                />
                <button
                  onClick={handleTriggerIngest}
                  disabled={isIngesting}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-650 disabled:opacity-50 py-1 px-1.5 rounded text-[10px] font-bold text-white transition flex items-center justify-center gap-1 border border-zinc-600"
                >
                  {isIngesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  Ingest
                </button>
              </div>
            </div>
          )}

          {/* Telemetry Architecture */}
          <div className="col-span-1 border-l border-zinc-850 pl-4 space-y-1 text-[10px] text-zinc-500">
            <span className="uppercase tracking-widest font-bold block">Telemetry Path</span>
            <div className="space-y-0.5">
              <p className="flex items-center gap-1 text-zinc-400">
                <Database className="h-3 w-3 text-amber-500 shrink-0" />
                ClickHouse Ingest: <span className="text-zinc-200 font-semibold">{comments.length} items</span>
              </p>
              <p className="flex items-center gap-1 text-zinc-400">
                <Layers className="h-3 w-3 text-amber-500 shrink-0" />
                ADK Agent Pipeline: <span className="text-zinc-200 font-semibold">Enabled</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modular Dashboard Sections */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AudiencePulse
            comments={comments}
            sentiment={sentiment}
            pulseSummary={pulseSummary}
            dominantTopic={themeStats.length > 0 ? themeStats[0].name : "Unknown"}
          />

          <WhatChanged timelineData={timelineData} />

          <div className="grid grid-cols-2 gap-6">
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
