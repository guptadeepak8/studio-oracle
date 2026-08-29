"use client";

import React from "react";
import { Settings, Loader2, RefreshCw } from "lucide-react";

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
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4 text-sm font-sans">
      <div className="flex items-center gap-1.5 text-zinc-400">
        <Settings className="h-4.5 w-4.5 text-amber-500" />
        <span className="font-bold text-xs uppercase tracking-wider text-zinc-300">
          YouTube Feedback Settings
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 font-bold block uppercase">
            Ingest Search Query
          </label>
          <input
            type="text"
            value={ingestQuery}
            onChange={(e) => setIngestQuery(e.target.value)}
            placeholder="YouTube Video Query..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 font-bold block uppercase">
            Video Limit
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={ingestLimit}
              onChange={(e) => setIngestLimit(parseInt(e.target.value) || 1)}
              className="w-16 bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-200 text-center focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={onTriggerIngest}
              disabled={isIngesting}
              className="flex-1 bg-zinc-700 hover:bg-zinc-650 disabled:opacity-50 py-2 px-3 rounded-lg text-xs font-bold text-white transition flex items-center justify-center gap-1 border border-zinc-600 cursor-pointer"
            >
              {isIngesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Run YouTube Ingestion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

