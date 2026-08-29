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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/20">
          <h2 className="font-bold text-base tracking-wider uppercase text-amber-500">
            Track New Campaign Launch
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 text-sm px-2.5 py-1 rounded">
            Close
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4 text-sm">
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-350">Campaign / Film Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Gladiator II"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-355">Description</label>
            <textarea
              required
              placeholder="e.g. Sequel to Gladiator following Lucius..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full h-24 bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none resize-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-355">Campaign Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="movie">Movie</option>
                <option value="series">Series</option>
                <option value="campaign">Campaign</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-355">Release Date</label>
              <input
                type="date"
                value={newReleaseDate}
                onChange={(e) => setNewReleaseDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isRegistering}
            className="w-full bg-zinc-700 hover:bg-zinc-650 disabled:opacity-50 py-3 rounded-lg text-sm font-bold text-white transition flex items-center justify-center gap-2 mt-2 border border-zinc-600 shadow"
          >
            {isRegistering ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                Registering Campaign...
              </>
            ) : (
              <>
                <Plus className="h-4.5 w-4.5" />
                Create Campaign Record
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
