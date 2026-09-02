"use client";

import React, { useEffect, useState } from "react";
import { Video, Sparkles, Database, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Card, Badge, Button } from "./ui";

interface IngestProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetQuery: string;
  source?: "youtube" | "google_search";
}

export default function IngestProgressModal({
  isOpen,
  onClose,
  targetQuery,
  source = "youtube",
}: IngestProgressModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setCommentsCount(0);
      return;
    }

    // Step 1: Connecting to API
    const t1 = setTimeout(() => {
      setCurrentStep(2);
      setCommentsCount(42);
    }, 1200);

    // Step 2: Running Gemini Classification
    const t2 = setTimeout(() => {
      setCurrentStep(3);
      setCommentsCount(128);
    }, 2800);

    // Step 3: Streaming to ClickHouse
    const t3 = setTimeout(() => {
      setCurrentStep(4);
      setCommentsCount(250);
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isYouTube = source === "youtube";

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-fade-in">
      <div className="bg-[#18181b] border border-[#28282b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#28282b] flex items-center justify-between bg-[#141416]">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              {isYouTube ? <Video className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-sky-400" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
                {isYouTube ? "Live YouTube Telemetry Stream" : "Google Search Grounding Stream"}
              </h3>
              <p className="text-xs text-zinc-400 font-mono truncate max-w-[280px]">
                Target: "{targetQuery}"
              </p>
            </div>
          </div>
          <Badge variant={currentStep === 4 ? "positive" : "active"} pulsing={currentStep < 4}>
            {currentStep === 4 ? "Complete" : "Streaming Live"}
          </Badge>
        </div>

        {/* Animation & Step Progress */}
        <div className="p-6 space-y-6">
          {/* Animated Waveform Visualizer */}
          <div className="bg-[#121214] border border-[#232326] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-end gap-1 h-6">
                <span className="w-1 bg-red-500 rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.1s] h-4" />
                <span className="w-1 bg-[#e6fc4f] rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.3s] h-6" />
                <span className="w-1 bg-[#38bdf8] rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.2s] h-3" />
                <span className="w-1 bg-[#4ade80] rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.4s] h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-200 block">
                  {currentStep === 1 && "Connecting to YouTube Data API v3..."}
                  {currentStep === 2 && "Gemini 2.5 Batch Classification Active..."}
                  {currentStep === 3 && "Vectorizing Records into ClickHouse Cloud..."}
                  {currentStep === 4 && "Telemetry Synchronized Successfully!"}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {commentsCount > 0 ? `${commentsCount} comments processed in real-time` : "Scanning trailer comment threads..."}
                </span>
              </div>
            </div>

            {currentStep < 4 ? (
              <Loader2 className="h-5 w-5 text-[#e6fc4f] animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-[#4ade80] shrink-0" />
            )}
          </div>

          {/* Stepper Pipeline */}
          <div className="space-y-3">
            {/* Step 1 */}
            <div className={`flex items-start gap-3 p-3 rounded-lg transition-all ${currentStep === 1 ? "bg-[#242428] border border-[#3b3a1a]" : "opacity-75"}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${currentStep > 1 ? "bg-[#4ade80] text-black" : currentStep === 1 ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                {currentStep > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-200 block">
                  YouTube Data API v3 Stream
                </span>
                <p className="text-[11px] text-zinc-400">
                  Targeted official trailer comments, timestamps, author handles, and like counts.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`flex items-start gap-3 p-3 rounded-lg transition-all ${currentStep === 2 ? "bg-[#242428] border border-[#3b3a1a]" : "opacity-75"}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${currentStep > 2 ? "bg-[#4ade80] text-black" : currentStep === 2 ? "bg-[#e6fc4f] text-black" : "bg-zinc-800 text-zinc-400"}`}>
                {currentStep > 2 ? <CheckCircle2 className="h-4 w-4" /> : "2"}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-200 block">
                  Gemini 2.5 Structured Batch Analysis
                </span>
                <p className="text-[11px] text-zinc-400">
                  Extracting sentiment polarity, friction topics (#pacing, #vfx), and confidence scores.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`flex items-start gap-3 p-3 rounded-lg transition-all ${currentStep === 3 ? "bg-[#242428] border border-[#3b3a1a]" : "opacity-75"}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${currentStep > 3 ? "bg-[#4ade80] text-black" : currentStep === 3 ? "bg-[#38bdf8] text-black" : "bg-zinc-800 text-zinc-400"}`}>
                {currentStep > 3 ? <CheckCircle2 className="h-4 w-4" /> : "3"}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-200 block">
                  ClickHouse Cloud Columnar Ingestion
                </span>
                <p className="text-[11px] text-zinc-400">
                  Indexing high-speed arrays for &lt;20ms multi-dimensional decision queries.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={onClose}
              className="w-full justify-center"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {currentStep === 4 ? "View Campaign Intelligence Dashboard" : "Syncing in Background..."}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
