"use client";

import React, { FormEvent } from "react";
import { Loader2, Plus, Sparkles, X } from "lucide-react";

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
  isRegistering,
}: RegisterModalProps) {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[#121215] border border-[#27272a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h2 className="font-bold text-base tracking-wider uppercase text-zinc-100">
              Track New Campaign Launch
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-sm font-sans">
          <div className="space-y-1.5">
            <label className="font-semibold text-xs text-zinc-200 uppercase tracking-wider block">
              Campaign / Film Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Gladiator II"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-xs text-zinc-200 uppercase tracking-wider block">
              Campaign Description / Logline *
            </label>
            <textarea
              required
              placeholder="e.g. Paramount Pictures sequel following Lucius returning to the Colosseum..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full h-24 bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none focus:border-amber-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-xs text-zinc-200 uppercase tracking-wider block">
                Campaign Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition"
              >
                <option value="movie">Theatrical Movie</option>
                <option value="series">Streaming Series</option>
                <option value="campaign">Promotional Launch</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-xs text-zinc-200 uppercase tracking-wider block">
                Target Release Date
              </label>
              <input
                type="date"
                value={newReleaseDate}
                onChange={(e) => setNewReleaseDate(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#27272a]">
            <button
              type="submit"
              disabled={isRegistering}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 py-3 rounded-lg text-xs uppercase tracking-wider font-bold text-white transition flex items-center justify-center gap-2 shadow cursor-pointer border border-amber-500/30"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Initializing ClickHouse Tracking...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Initialize Campaign Workspace
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
