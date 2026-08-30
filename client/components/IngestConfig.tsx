"use client";

import React from "react";
import { Loader2, RefreshCw } from "lucide-react";

interface IngestConfigProps {
  ingestQuery: string;
  setIngestQuery: (query: string) => void;
  ingestLimit: number;
  setIngestLimit: (limit: number) => void;
  isIngesting: boolean;
  onTriggerIngest: () => void;
}

export default function IngestConfig({
  ingestQuery,
  setIngestQuery,
  ingestLimit,
  setIngestLimit,
  isIngesting,
  onTriggerIngest,
}: IngestConfigProps) {
  return (
    <div className="bg-[#131316]/50 border border-[#1a1a1f] rounded p-5 space-y-4 text-xs font-sans">
      <div className="flex items-center gap-1.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
        <span>YouTube Ingestion Settings</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-zinc-500 font-medium block">
            Ingest search query
          </label>
          <input
            type="text"
            value={ingestQuery}
            onChange={(e) => setIngestQuery(e.target.value)}
            placeholder="YouTube video query..."
            className="w-full bg-zinc-950 border border-[#232329] rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500/50 transition"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-zinc-500 font-medium block">
            Video limit
          </label>
          <div className="flex gap-2.5">
            <input
              type="number"
              value={ingestLimit}
              onChange={(e) => setIngestLimit(parseInt(e.target.value) || 1)}
              className="w-16 bg-zinc-950 border border-[#232329] rounded px-2 py-2 text-zinc-200 text-center focus:outline-none focus:border-amber-500/50 transition"
            />
            <button
              onClick={onTriggerIngest}
              disabled={isIngesting}
              className="flex-1 bg-[#1a1a1f] hover:bg-[#232329] disabled:opacity-50 py-2 px-3 rounded text-zinc-300 transition flex items-center justify-center gap-1.5 border border-[#2d2d35] cursor-pointer font-semibold"
            >
              {isIngesting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 text-zinc-400" />
              )}
              Run Ingestion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
