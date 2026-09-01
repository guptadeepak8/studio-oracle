"use client";

import React, { FormEvent } from "react";
import { Loader2, Plus, Sparkles, X, Video, Clock, Zap, Wand2 } from "lucide-react";

interface RegisterModalProps {
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  newTitle: string;
  setNewTitle: (t: string) => void;
  newDesc: string;
  setNewDesc: (d: string) => void;
  newType: string;
  setNewType: (ty: string) => void;
  newReleaseDate: string;
  setNewReleaseDate: (d: string) => void;
  newTrailerQuery: string;
  setNewTrailerQuery: (q: string) => void;
  syncMode: string;
  setSyncMode: (m: string) => void;
  initialVolume: number;
  setInitialVolume: (v: number) => void;
  isRegistering: boolean;
}

export default function RegisterModal({
  onClose,
  onSubmit,
  newTitle,
  setNewTitle,
  newDesc,
  setNewDesc,
  newType,
  setNewType,
  newReleaseDate,
  setNewReleaseDate,
  newTrailerQuery,
  setNewTrailerQuery,
  syncMode,
  setSyncMode,
  initialVolume,
  setInitialVolume,
  isRegistering,
}: RegisterModalProps) {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-fade-in">
      <div className="bg-[#1c1c1f] border border-[#28282b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[#28282b] flex items-center justify-between bg-[#161618]">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[#242428] flex items-center justify-center text-[#e6fc4f]">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="font-bold text-base tracking-wide uppercase text-zinc-100">
              Track New Campaign Launch
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-[#242428] transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4 text-sm font-sans">
          {/* Campaign Title */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-300 uppercase tracking-wider text-xs block">
              Campaign / Film Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Wicked (2024)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-[#141416] border border-[#28282b] rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#e6fc4f] transition font-sans"
            />
          </div>

          {/* YouTube Trailer Feed Requirement */}
          <div className="space-y-2 bg-[#161618] border border-[#3b3a1a] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#e6fc4f] uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Video className="h-4 w-4 text-[#e6fc4f]" />
                YouTube Trailer Target or URL *
              </label>
              <span className="text-xs text-zinc-400 font-mono">Auto-Streamed</span>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. https://www.youtube.com/watch?v=... or Wicked Official Trailer"
              value={newTrailerQuery}
              onChange={(e) => setNewTrailerQuery(e.target.value)}
              className="w-full bg-[#141416] border border-[#28282b] rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#e6fc4f] transition font-sans"
            />

            {/* Quick Auto-fill Suggestion */}
            {newTitle.trim() && !newTrailerQuery.trim() && (
              <button
                type="button"
                onClick={() => setNewTrailerQuery(`${newTitle.trim()} Official Trailer`)}
                className="flex items-center gap-1.5 text-xs text-[#e6fc4f] hover:underline cursor-pointer pt-0.5"
              >
                <Wand2 className="h-3 w-3" />
                <span>Auto-fill: <strong>"{newTitle.trim()} Official Trailer"</strong></span>
              </button>
            )}

            <p className="text-xs text-zinc-400 leading-tight pt-0.5">
              Audience comments will automatically start streaming into ClickHouse upon launch.
            </p>
          </div>

          {/* Sync Automation & Ingestion Volume Options */}
          <div className="grid grid-cols-2 gap-3.5 bg-[#161618] border border-[#28282b] rounded-xl p-3.5">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                Sync Mode
              </label>
              <select
                value={syncMode}
                onChange={(e) => setSyncMode(e.target.value)}
                className="w-full bg-[#141416] border border-[#28282b] rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-[#e6fc4f] transition cursor-pointer font-sans"
              >
                <option value="1hr">Automatic (Every 1 Hour)</option>
                <option value="6hr">Automatic (Every 6 Hours)</option>
                <option value="24hr">Automatic (Every 24 Hours)</option>
                <option value="manual">Manual Sync Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[#e6fc4f]" />
                Initial Volume
              </label>
              <select
                value={initialVolume}
                onChange={(e) => setInitialVolume(parseInt(e.target.value))}
                className="w-full bg-[#141416] border border-[#28282b] rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-[#e6fc4f] transition cursor-pointer font-sans"
              >
                <option value={1000}>1,000 Comments (Recommended)</option>
                <option value={500}>500 Comments</option>
                <option value={250}>250 Comments</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-300 uppercase tracking-wider text-xs block">
              Campaign Description / Logline *
            </label>
            <textarea
              required
              placeholder="e.g. Universal Pictures musical adaptation directed by Jon M. Chu..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full h-20 bg-[#141416] border border-[#28282b] rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none focus:border-[#e6fc4f] transition font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300 uppercase tracking-wider text-xs block">
                Campaign Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full bg-[#141416] border border-[#28282b] rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-[#e6fc4f] transition cursor-pointer"
              >
                <option value="movie">Theatrical Movie</option>
                <option value="series">Streaming Series</option>
                <option value="campaign">Promotional Drop</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300 uppercase tracking-wider text-xs block">
                Target Release Date
              </label>
              <input
                type="date"
                value={newReleaseDate}
                onChange={(e) => setNewReleaseDate(e.target.value)}
                className="w-full bg-[#141416] border border-[#28282b] rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-[#e6fc4f] transition font-sans"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#28282b]">
            <button
              type="submit"
              disabled={isRegistering || !newTitle.trim() || !newTrailerQuery.trim()}
              className="w-full bg-[#e6fc4f] hover:bg-[#d8ed47] disabled:opacity-50 py-3 rounded-lg text-sm uppercase tracking-wider font-bold text-black transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Initializing & Streaming Comments...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4.5 w-4.5 stroke-[3]" />
                  <span>Launch Campaign & Auto-Stream Feedback</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
