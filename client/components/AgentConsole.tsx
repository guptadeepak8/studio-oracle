"use client";

import React, { useRef, useEffect } from "react";
import { RefreshCw, User, Database, Send, Download, Sparkles, Bot } from "lucide-react";
import { ChatMessage } from "../utils/types";
import { Card, Button, Badge } from "./ui";

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
    "Compare YouTube audience comments with Google Search press reviews.",
    "Give me 3 high-priority marketing pivots for this campaign.",
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
          <code
            key={key++}
            className="font-mono text-[11px] bg-[#141416] border border-[#28282b] px-1.5 py-0.5 rounded text-[#e6fc4f]"
          >
            {matchText.slice(1, -1)}
          </code>
        );
      } else if (matchText.toLowerCase().startsWith("[ref:")) {
        const commentId = matchText.slice(5, -1).trim();
        parts.push(
          <Button
            key={key++}
            variant="chip"
            size="xs"
            onClick={() => onSelectEvidence && onSelectEvidence(commentId)}
            leftIcon={<Database className="h-2.5 w-2.5 text-[#e6fc4f]" />}
            title={`Evidence comment: ${commentId}`}
            className="font-mono text-[10px] text-[#e6fc4f] border-[#3a3a20] px-1.5 py-0.5 mx-1"
          >
            ref:{commentId.slice(0, 8)}
          </Button>
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

    const blob = new Blob([memoContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `StudioOracle_Memo_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0e0e10] overflow-hidden font-sans">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-[#202023] flex items-center justify-between bg-[#141416] shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-[#242428] flex items-center justify-center text-[#e6fc4f]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-zinc-100 flex items-center gap-2">
              <span>Audience Ops Assistant</span>
              <Badge variant="active" pulsing>
                Gemini 2.5 Pro Live
              </Badge>
            </div>
            <p className="text-xs text-zinc-400">
              Query ClickHouse comments, sentiment anomalies, and messaging strategies in natural language.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {chatMessages.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportMemo}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Export Memo
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefreshMovies}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatMessages.length === 0 && (
          <div className="text-center py-16 space-y-3 max-w-md mx-auto">
            <div className="h-12 w-12 rounded-2xl bg-[#1c1c1f] border border-[#28282b] flex items-center justify-center mx-auto text-[#e6fc4f]">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-100">
              Studio Intelligence Console
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Ask deep questions about audience reception, sentiment shifts, or request marketing copy drafts backed by real comments.
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
              <Card className="flex-1 p-5 space-y-2 min-w-0 shadow-xs">
                {renderMessageText(msg.text)}
                {msg.isStreaming && (
                  <span className="inline-flex gap-1 ml-1 items-center pt-1">
                    <span className="h-2 w-2 rounded-full bg-[#e6fc4f] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 rounded-full bg-[#e6fc4f] animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 rounded-full bg-[#e6fc4f] animate-bounce"></span>
                  </span>
                )}
              </Card>
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
              <Button
                key={idx}
                variant="outline"
                size="md"
                onClick={() => onSendChat(p)}
                className="justify-start text-left bg-[#1c1c1f] hover:bg-[#242428] font-medium p-3.5 h-auto text-sm"
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input controls */}
      <div className="p-4 border-t border-[#202023] bg-[#141416] flex items-center gap-3">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSendChat()}
          placeholder="Ask AI Assistant about audience sentiment, anomalies, or messaging pivots..."
          className="flex-1 bg-[#1c1c1f] border border-[#28282b] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#e6fc4f] transition text-zinc-100 placeholder-zinc-500 font-sans"
        />
        <Button
          variant="primary"
          size="md"
          onClick={() => onSendChat()}
          disabled={!inputMessage.trim()}
          leftIcon={<Send className="h-4 w-4 stroke-[2.5]" />}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
