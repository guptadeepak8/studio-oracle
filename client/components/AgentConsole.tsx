"use client";

import React, { useRef, useEffect } from "react";
import { RefreshCw, User, Database, Send } from "lucide-react";
import { ChatMessage } from "../utils/types";

interface AgentConsoleProps {
  chatMessages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  onSendChat: (messageText?: string) => void;
  onRefreshMovies: () => void;
}

export default function AgentConsole({
  chatMessages,
  inputMessage,
  setInputMessage,
  onSendChat,
  onRefreshMovies,
}: AgentConsoleProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTED_PROMPTS = [
    "Formulate marketing strategies based on positive casting feedback.",
    "What marketing campaigns can counter negative soundtrack critiques?",
    "Draft an ad spend allocation strategy based on source platform activity.",
    "What are audiences divided about?",
    "Why did audience reaction change?",
    "What changed after the trailer?",
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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
          <div key={index} className="border-l-4 border-blue-500 bg-blue-950/20 p-3.5 rounded-r-lg my-2.5 text-sm">
            <span className="font-bold text-blue-400 block tracking-wider mb-1 uppercase text-xs">Observed Facts</span>
            <p className="text-zinc-200">
              {para.replace(/^(OBSERVED|\*   \*\*OBSERVED\*\*:\s*|\*\*OBSERVED\*\*\s*:?\s*)/, "")}
            </p>
          </div>
        );
      }
      if (isInferred) {
        return (
          <div key={index} className="border-l-4 border-amber-500 bg-amber-950/10 p-3.5 rounded-r-lg my-2.5 text-sm">
            <span className="font-bold text-amber-400 block tracking-wider mb-1 uppercase text-xs">
              Inferred Interpretation
            </span>
            <p className="text-zinc-200">
              {para.replace(/^(INFERRED|\*   \*\*INFERRED\*\*:\s*|\*\*INFERRED\*\*\s*:?\s*)/, "")}
            </p>
          </div>
        );
      }
      if (isPrediction) {
        return (
          <div key={index} className="border-l-4 border-purple-500 bg-purple-950/15 p-3.5 rounded-r-lg my-2.5 text-sm">
            <span className="font-bold text-purple-400 block tracking-wider mb-1 uppercase text-xs">
              Forward Hypothesis
            </span>
            <p className="text-zinc-200">
              {para.replace(/^(PREDICTION|\*   \*\*PREDICTION\*\*:\s*|\*\*PREDICTION\*\*\s*:?\s*)/, "")}
            </p>
          </div>
        );
      }
      if (isUnknown) {
        return (
          <div key={index} className="border-l-4 border-zinc-500 bg-zinc-900 p-3.5 rounded-r-lg my-2.5 text-sm">
            <span className="font-bold text-zinc-400 block tracking-wider mb-1 uppercase text-xs">
              Unknown / Data Gap
            </span>
            <p className="text-zinc-300">
              {para.replace(/^(UNKNOWN|\*   \*\*UNKNOWN\*\*:\s*|\*\*UNKNOWN\*\*\s*:?\s*)/, "")}
            </p>
          </div>
        );
      }
      return (
        <p key={index} className="text-sm text-zinc-205 leading-relaxed my-2">
          {para}
        </p>
      );
    });
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#0c0c0e]">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-semibold tracking-wider text-xs uppercase text-amber-500">
            StudioOracle AI Agent
          </span>
        </div>
        <button
          onClick={onRefreshMovies}
          className="p-1.5 hover:bg-zinc-800 rounded transition"
          title="Refresh movies"
        >
          <RefreshCw className="h-4 w-4 text-zinc-400" />
        </button>
      </div>

      <div className="p-4 bg-zinc-900/30 border-b border-zinc-800 space-y-2">
        <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold block mb-1">
          Marketing Strategy Suggestions
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onSendChat(p)}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-full border border-zinc-700 transition text-left"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[90%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                msg.sender === "user" ? "bg-amber-600 font-bold" : "bg-zinc-800 border border-zinc-700"
              }`}
            >
              {msg.sender === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Database className="h-4 w-4 text-amber-500" />
              )}
            </div>
            <div className="flex flex-col gap-1 w-full">
              <div
                className={`rounded-xl p-3.5 text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-amber-700 text-white rounded-tr-none"
                    : "bg-zinc-900/90 border border-zinc-800 rounded-tl-none"
                }`}
              >
                {msg.sender === "user" ? <p className="text-sm">{msg.text}</p> : renderMessageText(msg.text)}
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

      <div className="p-4 border-t border-zinc-800 bg-[#0e0e11] flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSendChat()}
          placeholder="Ask marketing strategies based on comments..."
          className="flex-1 bg-zinc-855 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition text-zinc-100 placeholder-zinc-500"
        />
        <button
          onClick={() => onSendChat()}
          disabled={!inputMessage.trim()}
          className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 p-2.5 rounded-lg transition text-white"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
