"use client";

import React, { useState } from "react";
import { Loader2, RefreshCw, Radio, Sparkles, MessageCircle, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { API_BASE_URL } from "../utils/constants";

interface IngestConfigProps {
  campaignId: string;
  ingestQuery: string;
  setIngestQuery: (query: string) => void;
  ingestLimit: number;
  setIngestLimit: (limit: number) => void;
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
  isIngesting,
  onTriggerIngest,
  onRefreshAll,
}: IngestConfigProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isIngestingReddit, setIsIngestingReddit] = useState(false);

  const handleTriggerReddit = async () => {
    setIsIngestingReddit(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/campaigns/${campaignId}/ingest-reddit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: ingestQuery }),
      });
      if (res.ok) {
        onRefreshAll();
      } else {
        alert("Failed to ingest Reddit discussions.");
      }
    } catch (e) {
      console.error(e);
      alert("Error triggering Reddit ingestion.");
    } finally {
      setIsIngestingReddit(false);
    }
  };

  return (
    <div className="space-y-3 font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm font-bold text-zinc-100 hover:text-[#e6fc4f] transition cursor-pointer select-none"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-zinc-400" />
        )}
        <span>Telemetry Ingestion Controls · YouTube & Reddit</span>
      </button>

      {isOpen && (
        <div className="bg-[#1c1c1f] border border-[#28282b] rounded-xl p-5 space-y-4 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1 md:col-span-2">
              <label className="text-zinc-400 font-medium block text-[11px]">
                Search Query / Video Keyword
              </label>
              <input
                type="text"
                value={ingestQuery}
                onChange={(e) => setIngestQuery(e.target.value)}
                placeholder="e.g. Gladiator II Official Trailer reaction"
                className="w-full bg-[#161618] border border-[#28282b] rounded-lg px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#e6fc4f] transition font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-medium block text-[11px]">
                Batch Video Limit
              </label>
              <input
                type="number"
                value={ingestLimit}
                onChange={(e) => setIngestLimit(parseInt(e.target.value) || 1)}
                className="w-full bg-[#161618] border border-[#28282b] rounded-lg px-3.5 py-2 text-xs text-zinc-100 text-center focus:outline-none focus:border-[#e6fc4f] transition font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onTriggerIngest}
              disabled={isIngesting || isIngestingReddit}
              className="flex-1 bg-[#e6fc4f] hover:bg-[#d8ed47] disabled:opacity-50 py-2 px-4 rounded-md text-black font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isIngesting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Importing YouTube Telemetry...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Import YouTube Telemetry</span>
                </>
              )}
            </button>

            <button
              onClick={handleTriggerReddit}
              disabled={isIngesting || isIngestingReddit}
              className="flex-1 bg-[#242428] hover:bg-[#2c2c32] disabled:opacity-50 py-2 px-4 rounded-md text-zinc-200 font-bold text-xs border border-[#323238] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isIngestingReddit ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#e6fc4f]" />
                  <span>Importing Reddit Discussions...</span>
                </>
              ) : (
                <>
                  <MessageCircle className="h-3.5 w-3.5 text-[#e6fc4f]" />
                  <span>Import Reddit Discussions</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
