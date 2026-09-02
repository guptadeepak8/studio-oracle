"use client";

import React, { useEffect, useState } from "react";
import { X, Database, Video, MessageCircle, Sparkles, Clock, ThumbsUp, ShieldCheck, AlertCircle } from "lucide-react";
import { EvidenceReference } from "../utils/types";
import { API_BASE_URL } from "../utils/constants";
import { Button, Badge, Card } from "./ui";

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceItem?: EvidenceReference | null;
  commentId?: string | null;
}

export default function EvidenceDrawer({
  isOpen,
  onClose,
  evidenceItem,
  commentId,
}: EvidenceDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EvidenceReference | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setData(null);
      return;
    }

    if (evidenceItem) {
      setData(evidenceItem);
      return;
    }

    if (commentId) {
      setLoading(true);
      fetch(`${API_BASE_URL}/api/comments/detail/${commentId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Comment not found");
          return res.json();
        })
        .then((detail) => {
          setData({
            comment_id: detail.comment_id,
            platform: detail.source,
            author: detail.author || "Audience Member",
            text: detail.text,
            sentiment: detail.sentiment,
            topics: detail.topics || [],
            published_at: detail.published_at,
            relevance_reason: "Audience telemetry extracted during ClickHouse surveillance window."
          });
        })
        .catch((err) => {
          console.error("Error fetching comment detail:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, evidenceItem, commentId]);

  if (!isOpen) return null;

  const isYouTube = data?.platform?.toLowerCase().includes("youtube");
  const isGoogleSearch = data?.platform?.toLowerCase().includes("google") || data?.platform?.toLowerCase().includes("search");
  const isPositive = data?.sentiment === "positive";
  const isNegative = data?.sentiment === "negative";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#161618] border-l border-[#28282b] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-[#28282b] flex items-center justify-between bg-[#141416]">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-[#242428] flex items-center justify-center text-indigo-400">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
                  Telemetry Evidence Record
                </h3>
                <span className="font-mono text-xs text-zinc-400">
                  {data?.comment_id ? `ref:${data.comment_id}` : commentId ? `ref:${commentId}` : "ClickHouse Source"}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-zinc-400 font-mono">Retrieving ClickHouse record...</p>
              </div>
            ) : !data ? (
              <div className="py-20 text-center space-y-2 text-zinc-400 text-sm italic">
                <AlertCircle className="h-8 w-8 mx-auto text-zinc-500 mb-2" />
                Evidence record not found or data stream awaiting sync.
              </div>
            ) : (
              <>
                {/* Platform & Sentiment Indicators */}
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={isYouTube ? "warning" : "info"}>
                    <span className="flex items-center gap-1.5 capitalize">
                      {isYouTube ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <Sparkles className="h-3 w-3 text-sky-400" />
                      )}
                      {isGoogleSearch ? "Google Search Grounding" : `${data.platform} Telemetry`}
                    </span>
                  </Badge>

                  <Badge variant={isPositive ? "positive" : isNegative ? "negative" : "default"}>
                    <span className="capitalize">{data.sentiment} Sentiment</span>
                  </Badge>
                </div>

                {/* Verbatim Quote Box */}
                <Card className="p-5 space-y-3 bg-[#1c1c1f]">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Verbatim Audience Comment
                  </span>
                  <blockquote className="text-sm text-zinc-100 leading-relaxed italic border-l-2 border-[#e6fc4f] pl-3.5 py-1">
                    "{data.text}"
                  </blockquote>

                  <div className="pt-3 border-t border-[#28282b] flex items-center justify-between text-xs text-zinc-400 font-medium">
                    <span>Author: <strong className="text-zinc-200">{data.author || "Audience Member"}</strong></span>
                    {data.published_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {data.published_at.slice(0, 10)}
                      </span>
                    )}
                  </div>
                </Card>

                {/* AI Classification & Topics */}
                {data.topics && data.topics.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                      Discovered Thematic Topics
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {data.topics.map((topic, i) => (
                        <span
                          key={i}
                          className="text-xs bg-[#242428] text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-md font-mono font-medium capitalize"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agent Relevance Rationale */}
                <div className="bg-[#141416] border border-[#242428] rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" />
                    Agent Citation Rationale
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {data.relevance_reason || "Corroborates high-leverage audience sentiment pattern during current telemetry horizon."}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#28282b] bg-[#141416] flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#4ade80]" />
              <span>Verified ClickHouse Record</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close Inspector
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

