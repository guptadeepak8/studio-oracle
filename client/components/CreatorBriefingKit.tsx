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
      <div className="bg-[#141416] border border-[#242428] rounded-xl p-6 text-center text-zinc-400 text-sm">
        <Megaphone className="h-8 w-8 mx-auto mb-2 text-zinc-500 opacity-60" />
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
    <div className="bg-[#141416] border border-[#242428] rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242428] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Megaphone className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-zinc-100">
              Creator & Influencer Briefing Kit
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Actionable talking points, hook lines, and strict brand do&apos;s/don&apos;ts for TikTok and YouTube creator campaigns.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopyBrief}
          leftIcon={
            copied ? (
              <Check className="h-3.5 w-3.5 text-[#4ade80]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )
          }
        >
          {copied ? "Briefing Copied" : "Copy Creator Brief"}
        </Button>
      </div>

      {/* Campaign Phase Badge & Sound Directive */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#18181b] border border-[#28282b] p-3.5 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-medium">Active Campaign Phase:</span>
          <span className="font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-md">
            {brief.campaign_phase}
          </span>
        </div>
        {brief.recommended_audio_track && (
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Music className="h-3.5 w-3.5 text-amber-400" />
            <span>Recommended Sound: <strong className="text-amber-300">{brief.recommended_audio_track}</strong></span>
          </div>
        )}
      </div>

      {/* 3 Columns: Talking Points | Creative Angles | Strict Don'ts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mandatory Talking Points */}
        <div className="bg-[#18181b] border border-[#28282b] rounded-xl p-4.5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Mandatory Talking Points</span>
          </div>
          <ul className="space-y-2.5 text-xs text-zinc-300">
            {brief.core_talking_points.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed bg-[#121214] p-2.5 rounded-lg border border-[#242428]">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Creative Angles & Viral Hooks */}
        <div className="bg-[#18181b] border border-[#28282b] rounded-xl p-4.5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
            <Sparkles className="h-4 w-4" />
            <span>Creative Angles & Hooks</span>
          </div>
          <ul className="space-y-2.5 text-xs text-zinc-300">
            {brief.creative_angles.map((ang, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed bg-[#121214] p-2.5 rounded-lg border border-[#242428]">
                <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{ang}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strict Do Not's */}
        <div className="bg-[#18181b] border border-[#28282b] rounded-xl p-4.5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400">
            <ShieldAlert className="h-4 w-4" />
            <span>Strict Brand Prohibitions</span>
          </div>
          <ul className="space-y-2.5 text-xs text-zinc-300">
            {brief.critical_donts.map((dont, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed bg-[#121214] p-2.5 rounded-lg border border-red-500/10">
                <span className="text-red-400 font-bold shrink-0 mt-0.5">✕</span>
                <span className="text-zinc-400">{dont}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

