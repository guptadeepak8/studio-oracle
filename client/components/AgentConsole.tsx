"use client";

import React, { useRef, useEffect } from "react";
import { RefreshCw, User, Database, Send, Download, Sparkles, Bot, MessageSquare } from "lucide-react";
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
    "What changed recently in audience reactions?",
    "Why did audience sentiment change?",
    "What are audiences most divided about?",
    "What topics are driving negative friction?",
    "Compare YouTube audience reactions with Reddit.",
    "Give me 3 high-priority marketing pivots for this campaign."
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
          <code key={key++} className="font-mono text-[11px] bg-[#141416] border border-[#28282b] px-1.5 py-0.5 rounded text-[#e6fc4f]">
            {matchText.slice(1, -1)}
          </code>
        );
      } else if (matchText.toLowerCase().startsWith("[ref:")) {
        const commentId = matchText.slice(5, -1).trim();
        parts.push(
          <button
            key={key++}
            onClick={() => onSelectEvidence && onSelectEvidence(commentId)}
            className="inline-flex items-center gap-1 font-mono text-[10px] bg-[#1c1c1f] hover:bg-[#28282d] text-[#e6fc4f] border border-[#3a3a20] px-1.5 py-0.5 rounded mx-1 cursor-pointer font-bold"
            title={`Evidence comment: ${commentId}`}
          >
            <Database className="h-2.5 w-2.5" />
            ref:{commentId.slice(0, 8)}
          </button>
        );
      }
      
      currentIdx = matchStart + matchText.length;
    }
    
    if (currentIdx < text.length) {
      parts.push(text.substring(currentIdx));
    }
    
    return parts;
  };

  const renderMessageText = (text: string) => {
    const paragraphs = text.split("\n\n");
    return paragraphs.map((para, index) => {
      if (para.startsWith("### ")) {
        return (
          <h4 key={index} className="font-bold text-base text-zinc-100 my-2 tracking-tight">
            {parseInlineMarkdown(para.replace("### ", ""))}
          </h4>
        );
      }
      if (para.startsWith("## ")) {
        return (
          <h3 key={index} className="font-bold text-lg text-zinc-100 my-3 tracking-tight border-b border-[#28282b] pb-1">
            {parseInlineMarkdown(para.replace("## ", ""))}
          </h3>
        );
      }
      if (para.startsWith("- ") || para.startsWith("* ")) {
        const items = para.split("\n");
        return (
          <ul key={index} className="space-y-2 my-2.5 pl-4 list-disc marker:text-[#e6fc4f]">
            {items.map((it, i) => (
              <li key={i} className="text-sm text-zinc-200 leading-relaxed font-sans">
                {parseInlineMarkdown(it.replace(/^[-*]\s+/, ""))}
              </li>
            ))}
          </ul>
        );
      }
      return (
        <p key={index} className="text-sm text-zinc-200 leading-relaxed font-sans my-2">
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
    <div className="w-full flex flex-col h-full bg-[#0e0e10] font-sans">
      {/* Header bar */}
      <div className="px-6 py-3.5 border-b border-[#202023] flex items-center justify-between bg-[#141416]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-[#242428] flex items-center justify-center text-[#e6fc4f]">
            <Bot className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-bold text-xs text-zinc-100 block leading-tight">
              AI Research Assistant
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Powered by ClickHouse Telemetry & Gemini 2.5 Flash
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMemo}
            disabled={chatMessages.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1c1f] hover:bg-[#28282d] border border-[#28282b] rounded-md text-xs font-semibold text-zinc-200 transition cursor-pointer disabled:opacity-40"
            title="Download Executive Intelligence Briefing"
          >
            <Download className="h-3.5 w-3.5 text-[#e6fc4f]" />
            <span>Export Briefing</span>
          </button>
          <button
            onClick={onRefreshMovies}
            className="p-1.5 hover:bg-[#1c1c1f] rounded-md text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            title="Refresh Metadata"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main chat window */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {chatMessages.length === 0 && (
          <div className="max-w-2xl mx-auto py-8 text-center space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#1c1c1f] border border-[#28282b] flex items-center justify-center text-[#e6fc4f] mx-auto">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">
              Interactive Campaign Intelligence
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Ask deep questions about audience sentiment shifts, polarization between platforms, or request custom marketing copy pivots.
            </p>
          </div>
        )}

        {chatMessages.map((msg) => {
          if (msg.sender === "user") {
            return (
              <div key={msg.id} className="flex gap-3.5 max-w-3xl ml-auto flex-row-reverse">
                <div className="h-8 w-8 rounded-full bg-[#1c1c1f] border border-[#28282b] flex items-center justify-center shrink-0 text-zinc-300">
                  <User className="h-4 w-4" />
                </div>
                <div className="bg-[#242428] border border-[#323238] rounded-xl px-4.5 py-3 text-sm text-zinc-100 font-medium font-sans">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex gap-3.5 max-w-3xl mr-auto pb-3">
              <div className="h-8 w-8 rounded-full bg-[#1c1c1f] border border-[#3a3a20] flex items-center justify-center shrink-0 text-[#e6fc4f]">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1 bg-[#1c1c1f] border border-[#28282b] rounded-xl p-5 space-y-2 min-w-0 shadow-xs">
                {renderMessageText(msg.text)}
                {msg.isStreaming && (
                  <span className="inline-flex gap-1 ml-1 items-center pt-1">
                    <span className="h-2 w-2 rounded-full bg-[#e6fc4f] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 rounded-full bg-[#e6fc4f] animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 rounded-full bg-[#e6fc4f] animate-bounce"></span>
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
        <div className="max-w-2xl mx-auto w-full px-6 pb-4 space-y-2.5">
          <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold block">
            Suggested Investigations
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {SUGGESTED_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onSendChat(p)}
                className="text-sm bg-[#1c1c1f] hover:bg-[#242428] text-zinc-200 hover:text-white border border-[#28282b] px-4 py-3 rounded-xl text-left transition font-sans font-medium cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input controls matching ClickHouse console style */}
      <div className="p-4 border-t border-[#202023] bg-[#141416] flex items-center gap-3">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSendChat()}
          placeholder="Ask AI Assistant about audience sentiment, anomalies, or messaging pivots..."
          className="flex-1 bg-[#1c1c1f] border border-[#28282b] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#e6fc4f] transition text-zinc-100 placeholder-zinc-500 font-sans"
        />
        <button
          onClick={() => onSendChat()}
          disabled={!inputMessage.trim()}
          className="bg-[#e6fc4f] hover:bg-[#d8ed47] disabled:opacity-40 px-5 py-3 rounded-lg transition text-sm font-bold text-black flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Send className="h-4 w-4 stroke-[2.5]" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
