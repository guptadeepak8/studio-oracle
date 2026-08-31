"use client";

import React, { useEffect, useRef } from "react";
import { Database, Search, Loader2, Heart } from "lucide-react";
import { Comment } from "../utils/types";

interface EvidenceLedgerProps {
  filteredComments: Comment[];
  isLoadingComments: boolean;
  commentSearch: string;
  setCommentSearch: (search: string) => void;
  highlightedCommentId?: string | null;
}

export default function EvidenceLedger({
  filteredComments,
  isLoadingComments,
  commentSearch,
  setCommentSearch,
  highlightedCommentId,
}: EvidenceLedgerProps) {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (highlightedCommentId && itemRefs.current[highlightedCommentId]) {
      itemRefs.current[highlightedCommentId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedCommentId]);
  return (
    <div className="bg-transparent flex flex-col h-full overflow-hidden font-sans">
      {/* Header Controls */}
      <div className="flex items-center justify-between border-b border-[#1a1a1f] pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-zinc-400" />
          <h2 className="font-semibold text-sm text-zinc-200">
            Database Evidence Ledger
          </h2>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter comment database..."
            value={commentSearch}
            onChange={(e) => setCommentSearch(e.target.value)}
            className="w-full bg-[#131316] border border-[#232329] rounded pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-550 focus:outline-none focus:border-amber-500/50 transition"
          />
        </div>
      </div>

      {/* Ledger Feed */}
      <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 divide-y divide-[#1a1a1f]/60">
        {isLoadingComments ? (
          <div className="flex items-center justify-center py-12 text-zinc-500 text-xs gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
            Querying ClickHouse tables...
          </div>
        ) : filteredComments.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-12">
            No ledger evidence records match search parameters.
          </p>
        ) : (
          filteredComments.map((comment) => {
            const isPos = comment.sentiment === "positive";
            const isNeg = comment.sentiment === "negative";
            const isHighlighted = comment.comment_id === highlightedCommentId;

            return (
              <div
                key={comment.comment_id}
                ref={(el) => { itemRefs.current[comment.comment_id] = el; }}
                className={`py-4.5 px-3 rounded transition flex items-start justify-between gap-4 text-xs font-sans ${
                  isHighlighted
                    ? "bg-amber-500/10 border border-amber-500/50 shadow-lg ring-1 ring-amber-500/40"
                    : "hover:bg-[#131316]/30"
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-zinc-300">{comment.author}</span>
                    <span className="text-[9px] text-zinc-550 bg-[#131316] border border-[#232329] px-1.5 py-0.25 rounded uppercase tracking-wider font-semibold">
                      {comment.source}
                    </span>
                    {comment.topics && comment.topics.map((t) => (
                      <span key={t} className="text-[8px] text-zinc-400 bg-[#131316] border border-[#232329] px-1.5 py-0.25 rounded lowercase">
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-zinc-300 leading-relaxed text-sm">
                    "{comment.text}"
                  </p>
                </div>

                <div className="shrink-0 text-right space-y-1 text-xs text-zinc-500">
                  <span className="block text-[10px]">{comment.published_at}</span>
                  <div className="flex items-center justify-end gap-2.5">
                    <span className="flex items-center gap-1 font-semibold text-[10px]">
                      <Heart className="h-3 w-3 text-zinc-650" /> {comment.like_count}
                    </span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        isPos ? "bg-emerald-500" : isNeg ? "bg-rose-500" : "bg-zinc-600"
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
