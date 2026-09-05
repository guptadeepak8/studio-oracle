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
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-8 text-center text-zinc-500 text-xs">
        <Film className="h-6 w-6 mx-auto mb-2 text-zinc-600 opacity-60" />
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
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Video className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-zinc-100">
              Video Cutdown Scripts
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500">
            Timecoded editing directives synthesized from audience resonance and friction signals.
          </p>
        </div>

        {/* Script selector tabs */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80">
          {scripts.map((s, idx) => (
            <button
              key={s.id || idx}
              onClick={() => setActiveScriptIdx(idx)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                activeScriptIdx === idx
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {s.format.includes("15s") ? "15s Vertical (TikTok / Shorts)" : "30s Broadcast TV / OTT"}
            </button>
          ))}
        </div>
      </div>

      {/* Active Script Details */}
      <div className="space-y-4">
        {/* Objective & Metadata Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
              Editorial Objective
            </span>
            <p className="text-xs font-medium text-zinc-200 leading-snug">
              {currentScript.headline_objective}
            </p>
            <div className="flex items-center gap-2.5 text-[11px] text-zinc-500 pt-0.5">
              <span>Placement: <strong className="text-zinc-300 font-medium">{currentScript.target_channel}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Music className="h-3 w-3 text-zinc-400" />
                <span className="text-zinc-300 font-medium">{currentScript.music_track_directive}</span>
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="xs"
            onClick={() => handleCopyScript(currentScript)}
            leftIcon={
              copiedId === currentScript.id ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )
            }
          >
            {copiedId === currentScript.id ? "Script Copied" : "Copy Brief"}
          </Button>
        </div>

        {/* Timecoded Beats Timeline */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Timecoded Scene Breakdown
          </span>

          <div className="grid grid-cols-1 gap-2.5">
            {currentScript.beats.map((beat, bIdx) => (
              <div
                key={bIdx}
                className="bg-zinc-950/60 hover:bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                      <Clock className="h-3 w-3" />
                      {beat.timestamp_range}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">
                      {beat.beat_type.replace("_", " ")}
                    </span>
                  </div>
                  {beat.beat_type === "hook" && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                      <Sparkles className="h-3 w-3" />
                      Audience Hook
                    </span>
                  )}
                </div>

                {/* Visual Direction */}
                <div className="space-y-1">
                  <p className="text-zinc-300 leading-relaxed font-mono text-xs bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                    {beat.visual_direction}
                  </p>
                </div>

                {/* On-screen text & VO */}
                {(beat.on_screen_text || beat.audio_voiceover) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5 text-xs">
                    {beat.on_screen_text && (
                      <div className="bg-zinc-900/40 p-2 rounded-lg border border-zinc-800/50">
                        <span className="text-[10px] text-zinc-500 block uppercase font-semibold mb-0.5">
                          On-Screen Text
                        </span>
                        <p className="text-amber-300/90 font-medium font-mono text-xs">
                          &ldquo;{beat.on_screen_text}&rdquo;
                        </p>
                      </div>
                    )}
                    {beat.audio_voiceover && (
                      <div className="bg-zinc-900/40 p-2 rounded-lg border border-zinc-800/50">
                        <span className="text-[10px] text-zinc-500 block uppercase font-semibold mb-0.5">
                          Voiceover / Audio
                        </span>
                        <p className="text-zinc-300 italic text-xs">
                          &ldquo;{beat.audio_voiceover}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="flex items-center justify-between bg-zinc-950/40 border border-zinc-800/60 p-2.5 rounded-lg text-xs">
          <span className="text-zinc-500 text-[11px]">Primary Call to Action:</span>
          <strong className="text-indigo-300 font-medium text-xs">{currentScript.call_to_action}</strong>
        </div>
      </div>
    </div>
  );
}

