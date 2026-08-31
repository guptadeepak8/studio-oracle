"use client";

import React, { useState } from "react";
import { Loader2, RefreshCw, Radio, Sparkles, MessageCircle } from "lucide-react";
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
    <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-6 space-y-5 shadow-sm font-sans">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
        <div className="flex items-center gap-2">
          <Radio className="h-4.5 w-4.5 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-300">
            Telemetry Ingestion Control · YouTube & Reddit Feeds
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          Gemini Batch Classifier Active
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-zinc-300 font-semibold uppercase text-[10px] tracking-wider block">
            Search Term or Video Target
          </label>
          <input
            type="text"
            value={ingestQuery}
            onChange={(e) => setIngestQuery(e.target.value)}
            placeholder="e.g. Gladiator II Official Trailer reaction"
            className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-zinc-300 font-semibold uppercase text-[10px] tracking-wider block">
            Batch Video Limit
          </label>
          <input
            type="number"
            value={ingestLimit}
            onChange={(e) => setIngestLimit(parseInt(e.target.value) || 1)}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 text-center focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onTriggerIngest}
          disabled={isIngesting || isIngestingReddit}
          className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 py-2.5 px-4 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow cursor-pointer border border-amber-500/30"
        >
          {isIngesting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Ingesting YouTube Signals...
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              Ingest YouTube Telemetry
            </>
          )}
        </button>

        <button
          onClick={handleTriggerReddit}
          disabled={isIngesting || isIngestingReddit}
          className="flex-1 bg-[#18181b] hover:bg-[#27272a] disabled:opacity-50 py-2.5 px-4 rounded-lg text-zinc-200 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 border border-[#3f3f46] cursor-pointer"
        >
          {isIngestingReddit ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
              Ingesting Reddit Threads...
            </>
          ) : (
            <>
              <MessageCircle className="h-3.5 w-3.5 text-amber-400" />
              Ingest Reddit Threads
            </>
          )}
        </button>
      </div>
    </div>
  );
}
