"use client";

import React, { useState } from "react";
import { Layers, Copy, Check, Download, Users } from "lucide-react";
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
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-8 text-center text-zinc-500 text-xs">
        <Layers className="h-6 w-6 mx-auto mb-2 text-zinc-600 opacity-60" />
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
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Layers className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-zinc-100">
              Cross-Platform Ad Suite
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500">
            Platform-optimized headlines, body copy, and audience targeting for Meta & TikTok Ads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80">
            {["ALL", "Meta", "TikTok"].map((plat) => (
              <button
                key={plat}
                onClick={() => setActivePlatform(plat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  activePlatform === plat
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {plat === "ALL" ? "All Platforms" : plat}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="xs"
            onClick={handleExportAllJSON}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export JSON
          </Button>
        </div>
      </div>

      {/* Ad Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredVariants.map((variant, idx) => (
          <div
            key={idx}
            className="bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-4 flex flex-col justify-between space-y-3.5 transition"
          >
            {/* Platform & Placement Header */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  {variant.platform}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">
                  {variant.placement}
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Headline</span>
                <h4 className="text-xs font-semibold text-zinc-100 leading-snug">
                  {variant.primary_headline}
                </h4>
              </div>

              {/* Body Copy */}
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Body Copy</span>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                  {variant.body_copy}
                </p>
              </div>

              {/* Audience Targeting */}
              <div className="space-y-0.5 text-xs text-zinc-400 pt-0.5">
                <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                  <Users className="h-3 w-3 text-zinc-500" />
                  <span>Target Persona:</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-tight">
                  {variant.target_demographics}
                </p>
              </div>

              {/* Hashtags */}
              {variant.recommended_hashtags && variant.recommended_hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {variant.recommended_hashtags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] font-mono text-zinc-400 bg-zinc-900/80 px-1.5 py-0.5 rounded border border-zinc-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CTA & Copy Action */}
            <div className="pt-2.5 border-t border-zinc-800/60 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                CTA: <strong className="text-zinc-300 font-medium">{variant.call_to_action}</strong>
              </span>
              <Button
                variant="secondary"
                size="xs"
                onClick={() => handleCopyVariant(variant, idx)}
                leftIcon={
                  copiedIdx === idx ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )
                }
              >
                {copiedIdx === idx ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

