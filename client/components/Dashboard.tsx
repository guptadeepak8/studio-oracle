"use client";

import React, { useState, useEffect, useRef, FormEvent } from "react";
import {
  Film,
  Plus,
  Search,
  MessageSquare,
  Send,
  Database,
  RefreshCw,
  User,
  Loader2,
  TrendingUp,
  AlertTriangle,
  Play,
  Heart,
  BarChart,
  MessageCircle,
  Clock,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Layers,
} from "lucide-react";
import { API_ENDPOINTS, SESSION_CONFIG } from "../utils/constants";
import { Movie, Comment, ChatMessage, IngestResponse, ChatResponse } from "../utils/types";

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
  const [newTerms, setNewTerms] = useState("");
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
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompts
  const SUGGESTED_PROMPTS = [
    "What are audiences divided about?",
    "Why did audience reaction change?",
    "What changed after the trailer?",
    "Which topics are driving negative reaction?",
    "Compare audience reactions across sources.",
    "What new evidence contradicts earlier findings?"
  ];

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

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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
    const userPrompt = `Register a new movie titled '${newTitle}' with description '${newDesc}'${newReleaseDate ? ` and release date '${newReleaseDate}'` : ""}.`;
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

  // Message renderer parsing OBSERVED, INFERRED, PREDICTION, UNKNOWN
  const renderMessageText = (text: string) => {
    const paragraphs = text.split("\n\n");
    return paragraphs.map((para, index) => {
      const paraTrimmed = para.trim();
      const isObserved =
        paraTrimmed.startsWith("OBSERVED") ||
        paraTrimmed.startsWith("*   **OBSERVED**:") ||
        paraTrimmed.startsWith("**OBSERVED**");
      const isInferred =
        paraTrimmed.startsWith("INFERRED") ||
        paraTrimmed.startsWith("*   **INFERRED**:") ||
        paraTrimmed.startsWith("**INFERRED**");
      const isPrediction =
        paraTrimmed.startsWith("PREDICTION") ||
        paraTrimmed.startsWith("*   **PREDICTION**:") ||
        paraTrimmed.startsWith("**PREDICTION**");
      const isUnknown =
        paraTrimmed.startsWith("UNKNOWN") ||
        paraTrimmed.startsWith("*   **UNKNOWN**:") ||
        paraTrimmed.startsWith("**UNKNOWN**");

      if (isObserved) {
        return (
          <div key={index} className="border-l-4 border-blue-500 bg-blue-950/20 p-3 rounded-r-lg my-2 text-xs">
            <span className="font-bold text-blue-400 block tracking-wider mb-1 uppercase">Observed Facts</span>
            <p className="text-zinc-200">{para.replace(/^(OBSERVED|\*   \*\*OBSERVED\*\*:\s*|\*\*OBSERVED\*\*\s*:?\s*)/, "")}</p>
          </div>
        );
      }
      if (isInferred) {
        return (
          <div key={index} className="border-l-4 border-amber-500 bg-amber-950/10 p-3 rounded-r-lg my-2 text-xs">
            <span className="font-bold text-amber-400 block tracking-wider mb-1 uppercase">Inferred Interpretation</span>
            <p className="text-zinc-200">{para.replace(/^(INFERRED|\*   \*\*INFERRED\*\*:\s*|\*\*INFERRED\*\*\s*:?\s*)/, "")}</p>
          </div>
        );
      }
      if (isPrediction) {
        return (
          <div key={index} className="border-l-4 border-purple-500 bg-purple-950/15 p-3 rounded-r-lg my-2 text-xs">
            <span className="font-bold text-purple-400 block tracking-wider mb-1 uppercase">Forward Hypothesis</span>
            <p className="text-zinc-200">{para.replace(/^(PREDICTION|\*   \*\*PREDICTION\*\*:\s*|\*\*PREDICTION\*\*\s*:?\s*)/, "")}</p>
          </div>
        );
      }
      if (isUnknown) {
        return (
          <div key={index} className="border-l-4 border-zinc-500 bg-zinc-900 p-3 rounded-r-lg my-2 text-xs">
            <span className="font-bold text-zinc-400 block tracking-wider mb-1 uppercase">Unknown / Data Gap</span>
            <p className="text-zinc-300">{para.replace(/^(UNKNOWN|\*   \*\*UNKNOWN\*\*:\s*|\*\*UNKNOWN\*\*\s*:?\s*)/, "")}</p>
          </div>
        );
      }
      return <p key={index} className="text-xs text-zinc-250 leading-relaxed my-1.5">{para}</p>;
    });
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
      {/* 1. AGENT INVESTIGATION: LEFT SIDEBAR (40%) */}
      <div className="w-[40%] border-r border-zinc-800 flex flex-col h-full bg-[#0c0c0e]">
        {/* Console Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-semibold tracking-wider text-xs uppercase text-amber-500">
              StudioOracle AI Agent
            </span>
          </div>
          <button
            onClick={() => fetchMovies()}
            className="p-1 hover:bg-zinc-800 rounded transition"
            title="Refresh movies"
          >
            <RefreshCw className="h-3.5 w-3.5 text-zinc-400" />
          </button>
        </div>

        {/* Suggestion Prompts / Suggestion Chips */}
        <div className="p-3 bg-zinc-900/30 border-b border-zinc-800 space-y-1.5">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">
            Quick Inquiries
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChat(p)}
                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700 transition"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[90%] ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  msg.sender === "user" ? "bg-amber-600 font-bold" : "bg-zinc-800 border border-zinc-700"
                }`}
              >
                {msg.sender === "user" ? <User className="h-3.5 w-3.5" /> : <Database className="h-3.5 w-3.5 text-amber-500" />}
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div
                  className={`rounded-xl p-3 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-amber-700 text-white rounded-tr-none"
                      : "bg-zinc-900/90 border border-zinc-800 rounded-tl-none"
                  }`}
                >
                  {msg.sender === "user" ? <p className="text-xs">{msg.text}</p> : renderMessageText(msg.text)}
                  {msg.isStreaming && (
                    <span className="inline-flex gap-0.5 ml-1 items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce"></span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat input form */}
        <div className="p-3 border-t border-zinc-800 bg-[#0e0e11] flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
            placeholder="Query the agent, e.g. What are audiences divided about?"
            className="flex-1 bg-zinc-855 border border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition text-zinc-100 placeholder-zinc-500"
          />
          <button
            onClick={() => handleSendChat()}
            disabled={!inputMessage.trim()}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 p-2 rounded-lg transition text-white"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Launch Dashboard (60%) */}
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

        {/* Interactive Redesigned Dashboard Sections */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* SECTION 1: AUDIENCE PULSE */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-amber-500" />
              <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-300">Audience Pulse</h2>
            </div>
            
            {/* Pulse Dynamic summary statement */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 text-xs leading-relaxed text-zinc-200">
              {pulseSummary}
            </div>

            {/* Support Metrics */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-zinc-900/20 border border-zinc-850 p-2.5 rounded-lg">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-medium">Evidence Collected</span>
                <span className="text-base font-bold text-zinc-200">{comments.length} comments</span>
              </div>
              <div className="bg-zinc-900/20 border border-zinc-850 p-2.5 rounded-lg">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-medium">Platform Channels</span>
                <span className="text-base font-bold text-zinc-200">YouTube</span>
              </div>
              <div className="bg-zinc-900/20 border border-zinc-850 p-2.5 rounded-lg">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-medium">Positive Ratio</span>
                <span className="text-base font-bold text-emerald-500">{sentiment.posPercent}%</span>
              </div>
              <div className="bg-zinc-900/20 border border-zinc-850 p-2.5 rounded-lg">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-medium">Dominant Topic</span>
                <span className="text-base font-bold text-amber-500 truncate block">
                  {themeStats.length > 0 ? themeStats[0].name : "Unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: WHAT CHANGED? (Time-series Timeline) */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-amber-500" />
                <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-300">What Changed?</h2>
              </div>
              <span className="text-[10px] text-zinc-500 italic">Timeline computed from raw ClickHouse logs</span>
            </div>

            {timelineData.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4 bg-zinc-900/10 border border-dashed border-zinc-850 rounded">
                No chronological data points available.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-4 relative">
                {/* Horizontal track line */}
                <div className="absolute top-[18px] left-8 right-8 h-0.5 bg-zinc-800 z-0" />
                
                {timelineData.map((t, idx) => (
                  <div key={idx} className="z-10 space-y-2 text-center">
                    {/* Node marker */}
                    <div className="flex justify-center">
                      <div className="h-8 w-8 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-[10px] font-bold text-amber-500">
                        {idx + 1}
                      </div>
                    </div>
                    {/* Data */}
                    <div className="bg-zinc-900/60 border border-zinc-850 rounded-lg p-2 space-y-1">
                      <span className="text-[9px] font-bold text-zinc-400 block">{t.label}</span>
                      <span className="text-[10px] text-amber-500 font-semibold block truncate" title={t.dominantTopic}>
                        {t.dominantTopic}
                      </span>
                      <div className="flex justify-center gap-2 text-[9px] text-zinc-500 font-medium">
                        <span className="text-emerald-500">+{t.positiveRatio}%</span>
                        <span className="text-rose-500">-{t.negativeRatio}%</span>
                      </div>
                      <p className="text-[9px] text-zinc-400 italic truncate" title={t.representativeComment}>
                        "{t.representativeComment}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GRID ROW: 3. TOP THEMES & 4. CONFLICTING SIGNALS */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* SECTION 3: TOP AUDIENCE THEMES */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart className="h-4.5 w-4.5 text-amber-500" />
                  <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-300">Top Audience Themes</h2>
                </div>
              </div>

              {themeStats.length === 0 || themeStats.every(t => t.count === 0) ? (
                <p className="text-xs text-zinc-500 text-center py-4 bg-zinc-900/10 border border-dashed border-zinc-850 rounded">
                  No themes registered. Ingest feedback to view topics.
                </p>
              ) : (
                <div className="space-y-3">
                  {themeStats.map((t) => {
                    const totalVal = Math.max(...themeStats.map(x => x.count)) || 1;
                    const widthPercent = Math.min(100, Math.round((t.count / totalVal) * 100));
                    
                    return (
                      <div key={t.name} className="space-y-1 text-xs">
                        <div className="flex justify-between text-zinc-400">
                          <span className="font-medium">{t.name}</span>
                          <span className="text-zinc-500">{t.count} mentions</span>
                        </div>
                        {/* Bar */}
                        <div className="w-full bg-zinc-850 h-2.5 rounded-full overflow-hidden flex">
                          <div
                            className="bg-zinc-700 h-full border-r border-zinc-650"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION 4: CONFLICTING SIGNALS (Audience Division) */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
                <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-300">Conflicting Signals</h2>
              </div>

              {conflictingSignals.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4 bg-zinc-900/10 border border-dashed border-zinc-850 rounded">
                  No explicit sentiment conflicts identified in current data.
                </p>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-56 pr-1">
                  {conflictingSignals.map((conf, idx) => (
                    <div key={idx} className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/40 text-[10px]">
                      {/* Theme Indicator */}
                      <div className="p-2 border-b border-zinc-850 bg-zinc-900/60 font-semibold tracking-wider text-[9px] text-amber-500">
                        CONFLICT DETECTED: {conf.theme}
                      </div>
                      
                      {/* Comparison Columns */}
                      <div className="grid grid-cols-2 divide-x divide-zinc-850">
                        {/* Positive */}
                        <div className="p-2 space-y-1">
                          <div className="flex justify-between text-[8px] text-emerald-500 font-bold">
                            <span>POSITIVE SIGNAL</span>
                            <span>{conf.positive.author}</span>
                          </div>
                          <p className="text-zinc-300 italic">"{conf.positive.text}"</p>
                        </div>
                        
                        {/* Negative */}
                        <div className="p-2 space-y-1">
                          <div className="flex justify-between text-[8px] text-rose-500 font-bold">
                            <span>CRITICAL SIGNAL</span>
                            <span>{conf.negative.author}</span>
                          </div>
                          <p className="text-zinc-300 italic">"{conf.negative.text}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* SECTION 5: EVIDENCE LEDGER (Subordinate Database view) */}
          <div className="bg-zinc-900/10 border border-zinc-850 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-4.5 w-4.5 text-zinc-400" />
                <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-400">Database Evidence Ledger</h2>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2 h-3 w-3 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter comment database..."
                  value={commentSearch}
                  onChange={(e) => setCommentSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded pl-7 pr-2 py-1 text-[10px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-60 space-y-2 pr-1">
              {isLoadingComments ? (
                <div className="flex items-center justify-center py-6 text-zinc-500 text-[10px] gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  Querying ClickHouse tables...
                </div>
              ) : filteredComments.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-6">
                  No ledger evidence records match search parameters.
                </p>
              ) : (
                filteredComments.map((comment) => {
                  const textLower = comment.text.toLowerCase();
                  const isPos =
                    textLower.includes("stunning") ||
                    textLower.includes("excited") ||
                    textLower.includes("love") ||
                    textLower.includes("beautiful") ||
                    textLower.includes("great") ||
                    textLower.includes("goosebumps") ||
                    textLower.includes("casting is spot on") ||
                    textLower.includes("exceeded my expectations");
                  const isNeg =
                    textLower.includes("disappointed") ||
                    textLower.includes("ruined") ||
                    textLower.includes("terrible") ||
                    textLower.includes("empty") ||
                    textLower.includes("cash-grab") ||
                    textLower.includes("video-gamey");

                  return (
                    <div
                      key={comment.comment_id}
                      className="p-2.5 bg-zinc-900/40 border border-zinc-850 rounded hover:border-zinc-800 transition flex items-start justify-between gap-3 text-[10px]"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-400">{comment.author}</span>
                          <span className="text-[8px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-1 py-0.2 rounded uppercase">
                            {comment.source}
                          </span>
                        </div>
                        <p className="text-zinc-300 leading-normal font-sans">"{comment.text}"</p>
                      </div>
                      
                      <div className="shrink-0 text-right space-y-1 text-[9px] text-zinc-500">
                        <span>{comment.published_at}</span>
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5 text-zinc-500" /> {comment.like_count}</span>
                          <span className={`h-1.5 w-1.5 rounded-full ${isPos ? "bg-emerald-500" : isNeg ? "bg-rose-500" : "bg-zinc-600"}`} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Track Launch Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/20">
              <h2 className="font-semibold text-sm tracking-wider uppercase text-amber-500">Track New Campaign Launch</h2>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-zinc-500 hover:text-zinc-350 text-xs px-2 py-1 rounded"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleRegisterMovie} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Launch Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gladiator II"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Description</label>
                <textarea
                  required
                  placeholder="e.g. Sequel to Gladiator following Lucius..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full h-20 bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none"
                  >
                    <option value="movie">Movie</option>
                    <option value="series">Series</option>
                    <option value="campaign">Campaign</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Release Date</label>
                  <input
                    type="date"
                    value={newReleaseDate}
                    onChange={(e) => setNewReleaseDate(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full bg-zinc-700 hover:bg-zinc-650 disabled:opacity-50 py-2.5 rounded-lg text-sm font-semibold text-white transition flex items-center justify-center gap-2 mt-2 border border-zinc-600"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering with Agent...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Campaign Record
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
