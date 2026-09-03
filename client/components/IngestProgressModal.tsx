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

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      return;
    }

    // Step 1: Connecting to Feed
    const t1 = setTimeout(() => {
      setCurrentStep(2);
    }, 1500);

    // Step 2: Analyzing Comments
    const t2 = setTimeout(() => {
      setCurrentStep(3);
    }, 3200);

    // Step 3: Saving Intelligence
    const t3 = setTimeout(() => {
      setCurrentStep(4);
    }, 4800);

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
                {isYouTube ? "Syncing Audience Feedback" : "Syncing Press Grounding"}
              </h3>
              <p className="text-xs text-zinc-400 font-mono truncate max-w-[280px]">
                Target: "{targetQuery}"
              </p>
            </div>
          </div>
          <Badge variant={currentStep === 4 ? "positive" : "active"} pulsing={currentStep < 4}>
            {currentStep === 4 ? "Complete" : "In Progress"}
          </Badge>
        </div>

        {/* Animation & Step Progress */}
        <div className="p-6 space-y-6">
          {/* Progress Visualizer */}
          <div className="bg-[#121214] border border-[#232326] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-zinc-200 block">
                  {currentStep === 1 && "Connecting..."}
                  {currentStep === 2 && "Analyzing Comments..."}
                  {currentStep === 3 && "Saving Intelligence..."}
                  {currentStep === 4 && "Intelligence Synchronized"}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {currentStep === 1 && "Establishing connection to audience commentary feed"}
                  {currentStep === 2 && "Extracting sentiment polarity and key themes"}
                  {currentStep === 3 && "Materializing analytics and strategic directives"}
                  {currentStep === 4 && "Real-time updates published to dashboard"}
                </span>
              </div>
            </div>

            {currentStep < 4 ? (
              <Loader2 className="h-5 w-5 text-indigo-400 animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            )}
          </div>

          {/* Stepper Pipeline */}
          <div className="space-y-3">
            {/* Step 1 */}
            <div className={`flex items-start gap-3 p-3 rounded-lg transition-all ${currentStep === 1 ? "bg-[#242428] border border-indigo-500/30" : "opacity-75"}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${currentStep > 1 ? "bg-[#4ade80] text-black" : currentStep === 1 ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                {currentStep > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-200 block">
                  1. Connecting
                </span>
                <p className="text-[11px] text-zinc-400">
                  Retrieving audience comments and reactions for campaign milestone.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`flex items-start gap-3 p-3 rounded-lg transition-all ${currentStep === 2 ? "bg-[#242428] border border-indigo-500/30" : "opacity-75"}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${currentStep > 2 ? "bg-[#4ade80] text-black" : currentStep === 2 ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                {currentStep > 2 ? <CheckCircle2 className="h-4 w-4" /> : "2"}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-200 block">
                  2. Analyzing Comments
                </span>
                <p className="text-[11px] text-zinc-400">
                  Extracting sentiment polarity and audience friction points.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`flex items-start gap-3 p-3 rounded-lg transition-all ${currentStep === 3 ? "bg-[#242428] border border-indigo-500/30" : "opacity-75"}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${currentStep > 3 ? "bg-[#4ade80] text-black" : currentStep === 3 ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                {currentStep > 3 ? <CheckCircle2 className="h-4 w-4" /> : "3"}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-200 block">
                  3. Saving Intelligence
                </span>
                <p className="text-[11px] text-zinc-400">
                  Synthesizing executive takeaways and marketing directives.
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
              {currentStep === 4 ? "View Dashboard" : "Syncing in Background..."}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

