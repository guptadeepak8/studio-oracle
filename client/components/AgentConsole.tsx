"use client";

import React, { useRef, useEffect } from "react";
import { RefreshCw, User, Database, Send, Download } from "lucide-react";
import { ChatMessage } from "../utils/types";

interface AgentConsoleProps {
  chatMessages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  onSendChat: (messageText?: string) => void;
  onRefreshMovies: () => void;
  onSelectEvidence?: (commentId: string) => void;
}

export default function AgentConsole({
  chatMessages,
  inputMessage,
  setInputMessage,
  onSendChat,
  onRefreshMovies,
  onSelectEvidence,
}: AgentConsoleProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTED_PROMPTS = [
    "What changed recently?",
    "Why did audience reaction change?",
    "What are audiences divided about?",
    "What topics are emerging?",
    "Which topic is driving negative reaction?",
    "Compare the latest period with the previous period.",
    "What evidence supports this conclusion?",
    "What contradicts this conclusion?",
    "What don't we know yet?"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const parseInlineMarkdown = (text: string) => {
    const parts: React.ReactNode[] = [];
    let currentIdx = 0;
    const regex = /(\*\*.*?\*\*|`.*?`|\[ref:\s*[\w\-_]+\])/gi;
    let match;
    let key = 0;
    
    while ((match = regex.exec(text)) !== null) {
      const matchStart = match.index;
      const matchText = match[0];
      
      if (matchStart > currentIdx) {
        parts.push(text.substring(currentIdx, matchStart));
      }
      
      if (matchText.startsWith("**") && matchText.endsWith("**")) {
        parts.push(
          <strong key={key++} className="font-bold text-zinc-100">
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith("`") && matchText.endsWith("`")) {
        parts.push(
          <code key={key++} className="font-mono text-[11px] bg-[#131316] border border-[#232329] px-1 py-0.5 rounded text-amber-500/90">
            {matchText.slice(1, -1)}
          </code>
        );
      } else if (matchText.toLowerCase().startsWith("[ref:")) {
        const commentId = matchText.slice(5, -1).trim();
        parts.push(
          <button
            key={key++}
            onClick={() => onSelectEvidence?.(commentId)}
            className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.25 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded text-[10px] font-mono text-amber-400 cursor-pointer transition"
            title={`Inspect evidence comment ${commentId}`}
          >
            <span>🔍</span> Ref: {commentId.slice(0, 12)}
          </button>
        );
      }
      
      currentIdx = regex.lastIndex;
    }
    
    if (currentIdx < text.length) {
      parts.push(text.substring(currentIdx));
    }
    
    return parts.length > 0 ? parts : text;
  };

  const renderMessageText = (text: string) => {
    const paragraphs = text.split("\n\n");
    return paragraphs.map((para, index) => {
      const paraTrimmed = para.trim();
      
      // Check headers
      if (paraTrimmed.startsWith("###") || paraTrimmed.startsWith("##")) {
        const title = paraTrimmed.replace(/^###?\s*/, "");
        return (
          <h4 key={index} className="text-xs font-bold text-amber-500 uppercase tracking-wider pt-3 pb-1 first:pt-0">
            {title}
          </h4>
        );
      }

      // Check agent tool call/response
      const isToolCall = paraTrimmed.startsWith("> 🔍") || paraTrimmed.includes("Agent Tool Call");
      const isToolResponse = paraTrimmed.startsWith("> 📥") || paraTrimmed.includes("Agent Tool Response");
      
      if (isToolCall || isToolResponse) {
        const isResponse = isToolResponse;
        const cleanText = paraTrimmed
          .replace(/^>\s*/, "") // Remove starting >
          .replace(/\*\*/g, "") // Remove bold indicators
          .replace(/`/g, "") // Remove code ticks
          .replace(/^[🔍📥]\s*/, ""); // Remove emojis if at start
        
        return (
          <div key={index} className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 bg-[#131316] border border-[#232329]/50 px-3 py-2.5 rounded my-1.5 w-full">
            <span className="shrink-0">{isResponse ? "📥" : "🔍"}</span>
            <span className="truncate">{cleanText}</span>
          </div>
        );
      }

      // Check list items
      if (paraTrimmed.startsWith("* ") || paraTrimmed.startsWith("- ")) {
        return (
          <ul key={index} className="list-disc pl-5 my-2 space-y-1">
            {para.split("\n").map((line, lIdx) => {
              const cleanLine = line.trim().replace(/^[\*\-]\s*/, "");
              if (!cleanLine) return null;
              return (
                <li key={lIdx} className="text-sm text-zinc-250 leading-relaxed font-sans font-medium">
                  {parseInlineMarkdown(cleanLine)}
                </li>
              );
            })}
          </ul>
        );
      }

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
          <div key={index} className="border-l-2 border-blue-500 bg-blue-950/10 p-3 rounded my-2 text-xs font-sans">
            <span className="font-bold text-blue-400 block tracking-wider mb-0.5 uppercase text-[10px]">Observed Facts</span>
            <p className="text-zinc-300 text-xs">
              {parseInlineMarkdown(para.replace(/^(OBSERVED|\*   \*\*OBSERVED\*\*:\s*|\*\*OBSERVED\*\*\s*:?\s*)/, ""))}
            </p>
          </div>
        );
      }
      if (isInferred) {
        return (
          <div key={index} className="border-l-2 border-amber-500/80 bg-amber-950/5 p-3 rounded my-2 text-xs font-sans">
            <span className="font-bold text-amber-400 block tracking-wider mb-0.5 uppercase text-[10px]">
              Inferred Interpretation
            </span>
            <p className="text-zinc-300 text-xs">
              {parseInlineMarkdown(para.replace(/^(INFERRED|\*   \*\*INFERRED\*\*:\s*|\*\*INFERRED\*\*\s*:?\s*)/, ""))}
            </p>
          </div>
        );
      }
      if (isPrediction) {
        return (
          <div key={index} className="border-l-2 border-purple-500/80 bg-purple-950/10 p-3 rounded my-2 text-xs font-sans">
            <span className="font-bold text-purple-400 block tracking-wider mb-0.5 uppercase text-[10px]">
              Forward Hypothesis
            </span>
            <p className="text-zinc-300 text-xs">
              {parseInlineMarkdown(para.replace(/^(PREDICTION|\*   \*\*PREDICTION\*\*:\s*|\*\*PREDICTION\*\*\s*:?\s*)/, ""))}
            </p>
          </div>
        );
      }
      if (isUnknown) {
        return (
          <div key={index} className="border-l-2 border-zinc-650 bg-zinc-900/50 p-3 rounded my-2 text-xs font-sans">
            <span className="font-bold text-zinc-400 block tracking-wider mb-0.5 uppercase text-[10px]">
              Unknown / Data Gap
            </span>
            <p className="text-zinc-350 text-xs">
              {parseInlineMarkdown(para.replace(/^(UNKNOWN|\*   \*\*UNKNOWN\*\*:\s*|\*\*UNKNOWN\*\*\s*:?\s*)/, ""))}
            </p>
          </div>
        );
      }
      return (
        <p key={index} className="text-sm text-zinc-250 leading-relaxed font-sans font-medium my-1.5">
          {parseInlineMarkdown(para)}
        </p>
      );
    });
  };

  const handleExportMemo = () => {
    let memoContent = `# StudioOracle — Executive Intelligence Briefing\n\n`;
    memoContent += `**Generated**: ${new Date().toLocaleString()}\n\n`;
    memoContent += `---\n\n## Campaign Research Log\n\n`;

    chatMessages.forEach((msg) => {
      if (msg.sender === "user") {
        memoContent += `### 👤 Query\n${msg.text}\n\n`;
      } else {
        memoContent += `### 🤖 StudioOracle Analysis\n${msg.text}\n\n`;
      }
    });

    const blob = new Blob([memoContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `studio_oracle_executive_briefing_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#0a0a0c]">
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-[#1a1a1f] flex items-center justify-between bg-[#0a0a0c]">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
          <span className="font-semibold tracking-wider text-[11px] uppercase text-zinc-400">
            StudioOracle Research Agent
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMemo}
            disabled={chatMessages.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#131316] hover:bg-[#1a1a1f] border border-[#232329] rounded text-[10px] uppercase font-bold text-zinc-300 transition cursor-pointer disabled:opacity-40"
            title="Download Executive Intelligence Briefing"
          >
            <Download className="h-3 w-3 text-amber-500" />
            Export Briefing
          </button>
          <button
            onClick={onRefreshMovies}
            className="p-1.5 hover:bg-[#131316] rounded transition cursor-pointer"
            title="Refresh Metadata"
          >
            <RefreshCw className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-300 transition" />
          </button>
        </div>
      </div>

      {/* Main chat window */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {chatMessages.map((msg) => {
          if (msg.sender === "user") {
            return (
              <div key={msg.id} className="flex gap-4 max-w-3xl ml-auto flex-row-reverse">
                <div className="h-7 w-7 rounded-full bg-[#131316] border border-[#232329] flex items-center justify-center shrink-0">
                  <User className="h-3.5 w-3.5 text-zinc-400" />
                </div>
                <div className="bg-[#131316] border border-[#1a1a1f] rounded px-4.5 py-3 text-sm text-zinc-200 font-medium font-sans">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex gap-4 max-w-3xl mr-auto pb-4.5 first:pt-0">
              <div className="h-7 w-7 rounded-full bg-amber-500/5 border border-amber-500/15 flex items-center justify-center shrink-0">
                <Database className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <div className="flex-1 space-y-2.5 min-w-0">
                {renderMessageText(msg.text)}
                {msg.isStreaming && (
                  <span className="inline-flex gap-0.5 ml-1 items-center">
                    <span className="h-1 w-1 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-1 w-1 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-1 w-1 rounded-full bg-zinc-500 animate-bounce"></span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested prompts in empty chat */}
      {chatMessages.length <= 1 && (
        <div className="max-w-2xl mx-auto w-full px-6 pb-6 space-y-3.5">
          <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold block mb-1">
            Investigate this campaign
          </span>
          <div className="grid grid-cols-2 gap-3">
            {SUGGESTED_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onSendChat(p)}
                className="text-xs bg-[#131316] hover:bg-[#1a1a1f] text-zinc-300 border border-[#232329] px-4 py-3 rounded text-left transition font-sans font-medium cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input controls */}
      <div className="p-5 border-t border-[#1a1a1f] bg-[#0a0a0c] flex items-center gap-3">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSendChat()}
          placeholder="Ask StudioOracle to analyze campaign evidence..."
          className="flex-1 bg-[#131316] border border-[#232329] rounded px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500/50 transition text-zinc-100 placeholder-zinc-550"
        />
        <button
          onClick={() => onSendChat()}
          disabled={!inputMessage.trim()}
          className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 px-4 py-2.5 rounded transition text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer border border-amber-600 hover:border-amber-500 shadow-sm"
        >
          <Send className="h-3.5 w-3.5" />
          Send
        </button>
      </div>
    </div>
  );
}
