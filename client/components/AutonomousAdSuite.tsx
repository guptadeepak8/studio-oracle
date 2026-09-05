"use client";

import React, { useState } from "react";
import { Layers, Copy, Check, Download, Hash, Users, Sparkles } from "lucide-react";
import { AdCreativeVariant } from "../utils/types";
import { Button } from "./ui";
import { toast } from "sonner";

interface Props {
  adVariants?: AdCreativeVariant[];
  movieTitle?: string;
}

export default function AutonomousAdSuite({ adVariants, movieTitle = "Movie Campaign" }: Props) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [activePlatform, setActivePlatform] = useState<string>("ALL");

  if (!adVariants || adVariants.length === 0) {
    return (
      <div className="bg-[#141416] border border-[#242428] rounded-xl p-6 text-center text-zinc-400 text-sm">
        <Layers className="h-8 w-8 mx-auto mb-2 text-zinc-500 opacity-60" />
        <p>No ad suites generated yet. Sync reactions to synthesize platform ad kits.</p>
      </div>
    );
  }

  const filteredVariants =
    activePlatform === "ALL"
      ? adVariants
      : adVariants.filter((v) => v.platform.toLowerCase().includes(activePlatform.toLowerCase()));

  const handleCopyVariant = (variant: AdCreativeVariant, idx: number) => {
    const text = `📦 [AD CREATIVE DEPLOYMENT KIT]\n` +
      `Platform: ${variant.platform} (${variant.placement})\n` +
      `Headline: ${variant.primary_headline}\n` +
      `Primary Copy: ${variant.body_copy}\n` +
      `Targeting: ${variant.target_demographics}\n` +
      `Hashtags: ${variant.recommended_hashtags.join(" ")}\n` +
      `CTA: ${variant.call_to_action}`;

    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success(`${variant.platform} copy kit copied!`);
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  const handleExportAllJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(adVariants, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${movieTitle.toLowerCase().replace(/\s+/g, "_")}_ad_suite.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Complete ad suite exported to JSON!");
  };

  return (
    <div className="bg-[#141416] border border-[#242428] rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242428] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Layers className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-zinc-100">
              1-Click Cross-Platform Ad Suite
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Platform-optimized headlines, body copy, and audience targeting ready for Meta Ads & TikTok Ads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#1a1a1d] p-1 rounded-xl border border-[#28282b]">
            {["ALL", "Meta", "TikTok"].map((plat) => (
              <button
                key={plat}
                onClick={() => setActivePlatform(plat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  activePlatform === plat
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {plat === "ALL" ? "All Platforms" : plat}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportAllJSON}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export All
          </Button>
        </div>
      </div>

      {/* Ad Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVariants.map((variant, idx) => (
          <div
            key={idx}
            className="bg-[#18181b] border border-[#28282b] hover:border-zinc-600 rounded-xl p-4.5 flex flex-col justify-between space-y-4 transition"
          >
            {/* Platform & Placement Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md">
                  {variant.platform}
                </span>
                <span className="text-[10px] text-zinc-400 uppercase font-mono">
                  {variant.placement}
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Primary Headline</span>
                <h4 className="text-sm font-bold text-zinc-100 leading-snug">
                  {variant.primary_headline}
                </h4>
              </div>

              {/* Body Copy */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Ad Body Copy</span>
                <p className="text-xs text-zinc-300 leading-relaxed bg-[#111113] p-3 rounded-lg border border-[#232326]">
                  {variant.body_copy}
                </p>
              </div>

              {/* Audience Targeting */}
              <div className="space-y-1 text-xs text-zinc-400 pt-1">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-300">
                  <Users className="h-3 w-3 text-indigo-400" />
                  <span>Target Persona:</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  {variant.target_demographics}
                </p>
              </div>

              {/* Hashtags */}
              {variant.recommended_hashtags && variant.recommended_hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {variant.recommended_hashtags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CTA & Copy Action */}
            <div className="pt-3 border-t border-[#242428] flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                Button: <strong className="text-zinc-200">{variant.call_to_action}</strong>
              </span>
              <Button
                variant="secondary"
                size="xs"
                onClick={() => handleCopyVariant(variant, idx)}
                leftIcon={
                  copiedIdx === idx ? (
                    <Check className="h-3.5 w-3.5 text-[#4ade80]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )
                }
              >
                {copiedIdx === idx ? "Copied" : "Copy Kit"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
