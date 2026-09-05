"use client";

import React, { useState } from "react";
import { Megaphone, Copy, Check, ShieldAlert, Sparkles, CheckCircle2, Music } from "lucide-react";
import { CreatorBriefing } from "../utils/types";
import { Button } from "./ui";
import { toast } from "sonner";

interface Props {
  brief?: CreatorBriefing;
  movieTitle?: string;
}

export default function CreatorBriefingKit({ brief, movieTitle = "Movie Campaign" }: Props) {
  const [copied, setCopied] = useState(false);

  if (!brief) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-8 text-center text-zinc-500 text-xs">
        <Megaphone className="h-6 w-6 mx-auto mb-2 text-zinc-600 opacity-60" />
        <p>No creator briefs generated yet. Sync reactions to synthesize influencer guidelines.</p>
      </div>
    );
  }

  const handleCopyBrief = () => {
    let text = `📢 [INFLUENCER & CREATOR BRIEFING KIT]\n`;
    text += `Campaign: ${movieTitle} (${brief.campaign_phase})\n`;
    if (brief.recommended_audio_track) text += `Recommended Sound: ${brief.recommended_audio_track}\n\n`;

    text += `--- MANDATORY TALKING POINTS ---\n`;
    brief.core_talking_points.forEach((p) => (text += `• ${p}\n`));

    text += `\n--- CREATIVE ANGLES & VIDEO HOOKS ---\n`;
    brief.creative_angles.forEach((a) => (text += `• ${a}\n`));

    text += `\n--- STRICT DO NOTS / ANTI-SPOILERS ---\n`;
    brief.critical_donts.forEach((d) => (text += `• ${d}\n`));

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Creator briefing sheet copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Megaphone className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-zinc-100">
              Creator & Influencer Briefing Kit
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500">
            Actionable talking points, hook lines, and brand do&apos;s/don&apos;ts for TikTok and YouTube creator campaigns.
          </p>
        </div>

        <Button
          variant="secondary"
          size="xs"
          onClick={handleCopyBrief}
          leftIcon={
            copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )
          }
        >
          {copied ? "Brief Copied" : "Copy Brief"}
        </Button>
      </div>

      {/* Campaign Phase Badge & Sound Directive */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60 border border-zinc-800/80 p-3 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-[11px]">Campaign Phase:</span>
          <span className="font-semibold text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-md">
            {brief.campaign_phase}
          </span>
        </div>
        {brief.recommended_audio_track && (
          <div className="flex items-center gap-1.5 text-zinc-300 text-xs">
            <Music className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-zinc-400">Sound Directive: <strong className="text-zinc-200 font-medium">{brief.recommended_audio_track}</strong></span>
          </div>
        )}
      </div>

      {/* 3 Columns: Talking Points | Creative Angles | Strict Don'ts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Mandatory Talking Points */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Talking Points</span>
          </div>
          <ul className="space-y-2 text-xs text-zinc-300">
            {brief.core_talking_points.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                <span className="text-zinc-300">{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Creative Angles & Viral Hooks */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Creative Hooks</span>
          </div>
          <ul className="space-y-2 text-xs text-zinc-300">
            {brief.creative_angles.map((ang, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
                <span className="text-zinc-300">{ang}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strict Do Not's */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Strict Prohibitions</span>
          </div>
          <ul className="space-y-2 text-xs text-zinc-300">
            {brief.critical_donts.map((dont, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed bg-zinc-900/60 p-2.5 rounded-lg border border-rose-500/15">
                <span className="text-rose-400 font-bold shrink-0 mt-0.5">✕</span>
                <span className="text-zinc-400">{dont}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

