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
    <div className="bg-zinc-900/10 border border-zinc-850 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-4.5 w-4.5 text-zinc-400" />
          <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-400">Database Evidence Ledger</h2>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter comment database..."
            value={commentSearch}
            onChange={(e) => setCommentSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded pl-7 pr-2 py-1.5 text-[10px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
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
                className="p-2.5 bg-zinc-900/40 border border-zinc-855 rounded hover:border-zinc-800 transition flex items-start justify-between gap-3 text-[10px]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-zinc-400">{comment.author}</span>
                    <span className="text-[8px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.2 rounded uppercase">
                      {comment.source}
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-normal font-sans">"{comment.text}"</p>
                </div>

                <div className="shrink-0 text-right space-y-1 text-[9px] text-zinc-500">
                  <span>{comment.published_at}</span>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="flex items-center gap-0.5">
                      <Heart className="h-2.5 w-2.5 text-zinc-500" /> {comment.like_count}
                    </span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
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
