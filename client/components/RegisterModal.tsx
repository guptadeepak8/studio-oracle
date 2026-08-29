"use client";

import React, { FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/20">
          <h2 className="font-semibold text-sm tracking-wider uppercase text-amber-500">
            Track New Campaign Launch
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-350 text-xs px-2 py-1 rounded">
            Close
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Launch Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Gladiator II"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Description</label>
            <textarea
              required
              placeholder="e.g. Sequel to Gladiator following Lucius..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full h-20 bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none"
              >
                <option value="movie">Movie</option>
                <option value="series">Series</option>
                <option value="campaign">Campaign</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Release Date</label>
              <input
                type="date"
                value={newReleaseDate}
                onChange={(e) => setNewReleaseDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isRegistering}
            className="w-full bg-zinc-700 hover:bg-zinc-650 disabled:opacity-50 py-2.5 rounded-lg text-sm font-semibold text-white transition flex items-center justify-center gap-2 mt-2 border border-zinc-600"
          >
            {isRegistering ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registering with Agent...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Campaign Record
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
