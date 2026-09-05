"use client";

import React, { useState } from "react";
import { Film, Copy, Check, Video, Clock, Music, Sparkles } from "lucide-react";
import { VideoCutdownScript } from "../utils/types";
import { Button } from "./ui";
import { toast } from "sonner";

interface Props {
  scripts?: VideoCutdownScript[];
  movieTitle?: string;
}

export default function AutonomousVideoScripts({ scripts, movieTitle = "Movie Campaign" }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeScriptIdx, setActiveScriptIdx] = useState(0);

  if (!scripts || scripts.length === 0) {
    return (
      <div className="bg-[#141416] border border-[#242428] rounded-xl p-6 text-center text-zinc-400 text-sm">
        <Film className="h-8 w-8 mx-auto mb-2 text-zinc-500 opacity-60" />
        <p>No video cutdown scripts generated yet. Sync reactions to synthesize scripts.</p>
      </div>
    );
  }

  const currentScript = scripts[activeScriptIdx] || scripts[0];

  const handleCopyScript = (script: VideoCutdownScript) => {
    let text = `🎬 [AUTONOMOUS TRAILER EDIT DIRECTIVE]\n`;
    text += `Project: ${movieTitle}\n`;
    text += `Format: ${script.format}\n`;
    text += `Placement: ${script.target_channel}\n`;
    text += `Objective: ${script.headline_objective}\n`;
    text += `Audio/Music: ${script.music_track_directive}\n`;
    text += `CTA: ${script.call_to_action}\n\n`;
    text += `--- TIMECODED EDITING CUES ---\n`;
    script.beats.forEach((b) => {
      text += `\n[${b.timestamp_range}] (${b.beat_type.toUpperCase()})\n`;
      text += `• Visual: ${b.visual_direction}\n`;
      if (b.on_screen_text) text += `• On-Screen Text: "${b.on_screen_text}"\n`;
      text += `• Audio/VO: ${b.audio_voiceover}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedId(script.id);
    toast.success("Complete video edit script copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="bg-[#141416] border border-[#242428] rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242428] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Video className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-zinc-100">
              Autonomous Video Cutdown Scripts
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Timecoded editing directives synthesized directly from audience resonance and friction signals.
          </p>
        </div>

        {/* Script selector tabs */}
        <div className="flex items-center gap-1.5 bg-[#1a1a1d] p-1 rounded-xl border border-[#28282b]">
          {scripts.map((s, idx) => (
            <button
              key={s.id || idx}
              onClick={() => setActiveScriptIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeScriptIdx === idx
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {s.format.includes("15s") ? "15s Vertical (TikTok)" : "30s Broadcast TV"}
            </button>
          ))}
        </div>
      </div>

      {/* Active Script Details */}
      <div className="space-y-4">
        {/* Objective & Metadata Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18181b] border border-[#2a2a2e] p-4 rounded-xl">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
              Strategic Editorial Objective
            </span>
            <p className="text-xs font-medium text-zinc-200 leading-snug">
              {currentScript.headline_objective}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1">
              <span>Channel: <strong className="text-zinc-300">{currentScript.target_channel}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Music className="h-3 w-3 text-indigo-400" />
                <span className="text-zinc-300">{currentScript.music_track_directive}</span>
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCopyScript(currentScript)}
            leftIcon={
              copiedId === currentScript.id ? (
                <Check className="h-3.5 w-3.5 text-[#4ade80]" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )
            }
          >
            {copiedId === currentScript.id ? "Script Copied" : "Copy Brief for Editors"}
          </Button>
        </div>

        {/* Timecoded Beats Timeline */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Timecoded Scene Breakdown
          </span>

          <div className="grid grid-cols-1 gap-3">
            {currentScript.beats.map((beat, bIdx) => (
              <div
                key={bIdx}
                className="bg-[#18181b] hover:bg-[#1e1e22] border border-[#28282b] rounded-xl p-4 transition space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-md">
                      <Clock className="h-3 w-3" />
                      {beat.timestamp_range}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                      {beat.beat_type.replace("_", " ")}
                    </span>
                  </div>
                  {beat.beat_type === "hook" && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                      <Sparkles className="h-3 w-3" />
                      Critical Retention Hook
                    </span>
                  )}
                </div>

                {/* Visual Direction */}
                <div className="space-y-1 text-xs">
                  <span className="text-zinc-500 font-medium block">Visual Scene Composition:</span>
                  <p className="text-zinc-200 leading-relaxed font-mono text-[11px] bg-[#111113] p-2.5 rounded-lg border border-[#232326]">
                    {beat.visual_direction}
                  </p>
                </div>

                {/* On-screen text & VO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  {beat.on_screen_text && (
                    <div className="bg-[#121214] p-2.5 rounded-lg border border-[#242428]">
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold mb-0.5">
                        On-Screen Typography
                      </span>
                      <p className="text-amber-300 font-bold font-mono text-xs">
                        &ldquo;{beat.on_screen_text}&rdquo;
                      </p>
                    </div>
                  )}
                  {beat.audio_voiceover && (
                    <div className="bg-[#121214] p-2.5 rounded-lg border border-[#242428]">
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold mb-0.5">
                        Dialogue / Voiceover Cue
                      </span>
                      <p className="text-indigo-300 italic text-xs">
                        &ldquo;{beat.audio_voiceover}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="flex items-center justify-between bg-indigo-500/5 border border-indigo-500/20 p-3 rounded-xl text-xs">
          <span className="text-zinc-400">Primary Call to Action:</span>
          <strong className="text-indigo-300 font-semibold">{currentScript.call_to_action}</strong>
        </div>
      </div>
    </div>
  );
}
