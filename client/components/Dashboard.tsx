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
    // Add user request to chat log
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
        // Reset form & reload
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
          // Tell the user about ingestion status
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
  const handleSendChat = async () => {
    if (!inputMessage.trim()) return;

    const userMsgId = Math.random().toString();
    setChatMessages((prev) => [...prev, { id: userMsgId, sender: "user", text: inputMessage }]);
    const currentQuery = inputMessage;
    setInputMessage("");

    const agentMsgId = Math.random().toString();
    setChatMessages((prev) => [...prev, { id: agentMsgId, sender: "agent", text: "", isStreaming: true }]);

    try {
      const res = await fetch(API_ENDPOINTS.CHAT_STREAM, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentQuery,
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

  // Basic client side sentiment helper for ClickHouse analytics log
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
        text.includes("positive") ||
        text.includes("goosebumps") ||
        text.includes("casting is spot on") ||
        text.includes("exceeded my expectations")
      ) {
        positive++;
      } else if (
        text.includes("disappointed") ||
        text.includes("ruined") ||
        text.includes("terrible") ||
        text.includes("negative") ||
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

  const sentiment = getSentimentStats(comments);
  const filteredComments = comments.filter((c) =>
    c.text.toLowerCase().includes(commentSearch.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* LEFT COLUMN: Chat & Command Panel (40%) */}
      <div className="w-[40%] border-r border-zinc-800 flex flex-col h-full bg-zinc-900/50">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-semibold tracking-wider text-sm uppercase text-amber-500">
              StudioOracle Console
            </span>
          </div>
          <button
            onClick={() => fetchMovies()}
            className="p-1 hover:bg-zinc-800 rounded transition"
            title="Refresh movies"
          >
            <RefreshCw className="h-4 w-4 text-zinc-400" />
          </button>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  msg.sender === "user" ? "bg-amber-600" : "bg-zinc-750 border border-zinc-700"
                }`}
              >
                {msg.sender === "user" ? <User className="h-4 w-4" /> : <Database className="h-4 w-4 text-amber-500" />}
              </div>
              <div className="flex flex-col gap-1">
                <div
                  className={`rounded-xl p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-amber-600 text-white rounded-tr-none"
                      : "bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-tl-none"
                  }`}
                >
                  {msg.text}
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
        <div className="p-4 border-t border-zinc-800 bg-[#0e0e11]">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              placeholder="Query the database or ask the agent..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition text-zinc-100 placeholder-zinc-500"
            />
            <button
              onClick={handleSendChat}
              disabled={!inputMessage.trim()}
              className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 p-2 rounded-lg transition text-white"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Movies and Ingest Dashboard (60%) */}
      <div className="w-[60%] flex flex-col h-full bg-zinc-950">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <Film className="h-5 w-5 text-amber-500" />
            <h1 className="font-semibold text-zinc-100 tracking-tight">Launch Intelligence Dashboard</h1>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-1.5 bg-zinc-700 hover:bg-zinc-650 border border-zinc-600 text-xs px-3 py-1.5 rounded-lg transition text-zinc-100 font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Track Launch
          </button>
        </div>

        {/* Selected Movie Overview using bg-zinc-700 context for controls and backdrops */}
        <div className="p-6 border-b border-zinc-800 grid grid-cols-3 gap-6 bg-zinc-900/40">
          {/* Col 1: Selector */}
          <div className="col-span-1 space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Active Launch</label>
            {isLoadingMovies ? (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
                Loading movies...
              </div>
            ) : (
              <select
                value={selectedMovie?.content_id || ""}
                onChange={(e) => {
                  const m = movies.find((x) => x.content_id === e.target.value);
                  if (m) setSelectedMovie(m);
                }}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition"
              >
                {movies.map((m) => (
                  <option key={m.content_id} value={m.content_id}>
                    {m.title}
                  </option>
                ))}
              </select>
            )}
            {selectedMovie && (
              <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                {selectedMovie.description}
              </p>
            )}
          </div>

          {/* Col 2: Ingestion Controls in bg-zinc-700 border framework */}
          {selectedMovie && (
            <div className="col-span-1 border-l border-r border-zinc-850 px-6 space-y-3">
              <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold block">Ingestion Engine</span>
              <div className="space-y-2">
                <input
                  type="text"
                  value={ingestQuery}
                  onChange={(e) => setIngestQuery(e.target.value)}
                  placeholder="YouTube Search Query..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] text-zinc-400 font-medium">Limit:</span>
                  <input
                    type="number"
                    value={ingestLimit}
                    onChange={(e) => setIngestLimit(parseInt(e.target.value) || 1)}
                    className="w-12 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-zinc-100 text-center"
                  />
                  <button
                    onClick={handleTriggerIngest}
                    disabled={isIngesting}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-650 disabled:opacity-50 py-1 px-2.5 rounded-lg text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 border border-zinc-600"
                  >
                    {isIngesting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    Ingest Feedback
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Col 3: Quick Stats */}
          <div className="col-span-1 space-y-3">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold block">ClickHouse Analytics</span>
            {isLoadingComments ? (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
                Loading stats...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-zinc-800/80 border border-zinc-700 rounded-lg p-2">
                  <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block">Evidence Count</span>
                  <span className="text-xl font-bold text-zinc-100">{comments.length}</span>
                </div>
                <div className="bg-zinc-800/80 border border-zinc-700 rounded-lg p-2">
                  <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block">Positive Sentiment</span>
                  <span className="text-xl font-bold text-emerald-500">{sentiment.posPercent}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sentiment Progress Bar */}
        {comments.length > 0 && (
          <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900/20 flex items-center justify-between gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <span>Sentiment profile:</span>
            </div>
            <div className="flex-1 max-w-lg h-2.5 rounded-full overflow-hidden bg-zinc-800 flex">
              <div className="bg-emerald-600 h-full" style={{ width: `${sentiment.posPercent}%` }} title="Positive" />
              <div className="bg-zinc-700 h-full" style={{ width: `${100 - sentiment.posPercent - sentiment.negPercent}%` }} title="Neutral" />
              <div className="bg-rose-600 h-full" style={{ width: `${sentiment.negPercent}%` }} title="Negative" />
            </div>
            <div className="flex gap-3 text-zinc-400 text-[10px]">
              <span className="flex items-center gap-1"><span className="h-2 w-2 bg-emerald-600 rounded-full" /> {sentiment.positive} Positive</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 bg-zinc-700 rounded-full" /> {comments.length - sentiment.positive - sentiment.negative} Neutral</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 bg-rose-600 rounded-full" /> {sentiment.negative} Negative</span>
            </div>
          </div>
        )}

        {/* Comments Feed Panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/20">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-amber-500" />
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Database Evidence Log</span>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter evidence comments..."
                value={commentSearch}
                onChange={(e) => setCommentSearch(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoadingComments ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                Querying comments log from ClickHouse...
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs p-8 text-center border border-dashed border-zinc-800 rounded-xl max-w-md mx-auto my-12 bg-zinc-900/20">
                <AlertTriangle className="h-8 w-8 text-zinc-655 mb-2" />
                No evidence found. Trigger YouTube feedback ingestion above or change movie query.
              </div>
            ) : (
              filteredComments.map((comment) => {
                const textLower = comment.text.toLowerCase();
                const isPos = textLower.includes("stunning") || textLower.includes("excited") || textLower.includes("love") || textLower.includes("beautiful") || textLower.includes("great") || textLower.includes("goosebumps") || textLower.includes("casting is spot on") || textLower.includes("exceeded my expectations");
                const isNeg = textLower.includes("disappointed") || textLower.includes("ruined") || textLower.includes("terrible") || textLower.includes("empty") || textLower.includes("cash-grab") || textLower.includes("video-gamey");

                return (
                  <div
                    key={comment.comment_id}
                    className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl hover:border-zinc-700/80 transition"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-350">{comment.author}</span>
                        <span className="text-[10px] text-zinc-400 bg-zinc-805 border border-zinc-750 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {comment.source}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                        <span>{comment.published_at}</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
                          {comment.like_count}
                        </span>
                        <span className={`h-1.5 w-1.5 rounded-full ${isPos ? "bg-emerald-500" : isNeg ? "bg-rose-500" : "bg-zinc-600"}`} title={isPos ? "Positive" : isNeg ? "Negative" : "Neutral"} />
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">{comment.text}</p>
                  </div>
                );
              })
            )}
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Description</label>
                <textarea
                  required
                  placeholder="e.g. Sequel to Gladiator following Lucius..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full h-20 bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
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
