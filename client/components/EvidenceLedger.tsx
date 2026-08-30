"use client";

import React from "react";
import { Database, Search, Loader2, Heart } from "lucide-react";
import { Comment } from "../utils/types";

interface EvidenceLedgerProps {
  filteredComments: Comment[];
  isLoadingComments: boolean;
  commentSearch: string;
  setCommentSearch: (search: string) => void;
}

export default function EvidenceLedger({
  filteredComments,
  isLoadingComments,
  commentSearch,
  setCommentSearch,
}: EvidenceLedgerProps) {
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
                className="py-4.5 hover:bg-[#131316]/20 transition flex items-start justify-between gap-4 text-xs font-sans first:pt-2"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-zinc-300">{comment.author}</span>
                    <span className="text-[9px] text-zinc-500 bg-[#131316] border border-[#232329] px-1.5 py-0.25 rounded uppercase tracking-wider font-semibold">
                      {comment.source}
                    </span>
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
