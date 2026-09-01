"use client";

import React, { useState } from "react";
import { Loader2, RefreshCw, MessageCircle, ChevronDown, ChevronRight, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "../utils/constants";
import { toast } from "sonner";

interface IngestConfigProps {
  campaignId: string;
  ingestQuery: string;
  setIngestQuery: (query: string) => void;
  ingestLimit: number;
  setIngestLimit: (limit: number) => void;
  maxComments: number;
  setMaxComments: (count: number) => void;
  isIngesting: boolean;
  onTriggerIngest: () => void;
  onRefreshAll: () => void;
}

export default function IngestConfig({
  campaignId,
  ingestQuery,
  setIngestQuery,
  ingestLimit,
  setIngestLimit,
  maxComments,
  setMaxComments,
  isIngesting,
  onTriggerIngest,
  onRefreshAll,
}: IngestConfigProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isIngestingReddit, setIsIngestingReddit] = useState(false);
  const [syncSchedule, setSyncSchedule] = useState("1hr");

  const handleTriggerReddit = async () => {
    setIsIngestingReddit(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/campaigns/${campaignId}/ingest-reddit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: ingestQuery }),
      });
      if (res.ok) {
        const data = await res.json();
        onRefreshAll();
        toast.success(data.message || "Successfully synced Reddit community discussions!");
      } else {
        toast.error("Failed to sync Reddit discussions. Ensure tracking is active.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error syncing Reddit discussions.");
    } finally {
      setIsIngestingReddit(false);
    }
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Section Header with Chevron */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-base font-bold text-zinc-100 hover:text-[#e6fc4f] transition cursor-pointer select-none"
        >
          {isOpen ? (
            <ChevronDown className="h-4.5 w-4.5 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4.5 w-4.5 text-zinc-400" />
          )}
          <span>Live Audience Feedback Sync · YouTube & Reddit</span>
        </button>

        {/* Live Auto-Sync Status Badge */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-2 bg-[#161618] border border-[#28282b] rounded-lg px-3 py-1.5 text-zinc-200">
            <span className="h-2 w-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span className="text-xs font-semibold text-zinc-200">
              Auto-Sync: {syncSchedule === "1hr" ? "Every 1 Hour" : syncSchedule === "6hr" ? "Every 6 Hours" : syncSchedule === "24hr" ? "Every 24 Hours" : "Manual Only"}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-zinc-400">
        Automated background syncing and on-demand comment fetching from official YouTube trailers and Reddit discussion threads.
      </p>

      {isOpen && (
        <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-6 space-y-5 shadow-xs">
          {/* Form Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            {/* Search Query / Trailer Target */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs text-zinc-300 font-semibold uppercase tracking-wider block">
                Search Query or YouTube Trailer URL
              </label>
              <input
                type="text"
                value={ingestQuery}
                onChange={(e) => setIngestQuery(e.target.value)}
                placeholder="e.g. Wicked 2024 Official Trailer or https://www.youtube.com/watch?v=..."
                className="w-full bg-[#161618] border border-[#28282b] rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#e6fc4f] transition font-sans"
              />
            </div>

            {/* Batch Volume: Number of comments to fetch */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-300 font-semibold uppercase tracking-wider block">
                Comment Volume / Depth
              </label>
              <select
                value={maxComments}
                onChange={(e) => setMaxComments(parseInt(e.target.value))}
                className="w-full bg-[#161618] border border-[#28282b] rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-[#e6fc4f] transition cursor-pointer font-sans"
              >
                <option value={100}>100 Comments (Fast)</option>
                <option value={250}>250 Comments</option>
                <option value={500}>500 Comments</option>
                <option value={1000}>1,000 Comments (Recommended)</option>
                <option value={2500}>2,500 Comments (Deep Sync)</option>
              </select>
            </div>

            {/* Auto-Sync Schedule */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-300 font-semibold uppercase tracking-wider block">
                Auto-Sync Interval
              </label>
              <select
                value={syncSchedule}
                onChange={(e) => setSyncSchedule(e.target.value)}
                className="w-full bg-[#161618] border border-[#28282b] rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-[#e6fc4f] transition cursor-pointer font-sans"
              >
                <option value="1hr">Every 1 Hour (Active)</option>
                <option value="6hr">Every 6 Hours</option>
                <option value="24hr">Every 24 Hours</option>
                <option value="manual">Manual Sync Only</option>
              </select>
            </div>
          </div>

          {/* Sync Action Buttons */}
          <div className="flex items-center gap-4 pt-1">
            <button
              onClick={onTriggerIngest}
              disabled={isIngesting || isIngestingReddit}
              className="flex-1 bg-[#e6fc4f] hover:bg-[#d8ed47] disabled:opacity-50 py-2.5 px-4 rounded-lg text-black font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isIngesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Fetching & Analyzing Comments via Gemini...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 stroke-[2.5]" />
                  <span>Fetch YouTube Comments ({maxComments.toLocaleString()})</span>
                </>
              )}
            </button>

            <button
              onClick={handleTriggerReddit}
              disabled={isIngesting || isIngestingReddit}
              className="flex-1 bg-[#242428] hover:bg-[#2c2c32] disabled:opacity-50 py-2.5 px-4 rounded-lg text-zinc-200 font-bold text-sm border border-[#323238] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isIngestingReddit ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#e6fc4f]" />
                  <span>Syncing Reddit Discussions...</span>
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 text-[#e6fc4f]" />
                  <span>Sync Reddit Discussions</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
