"use client";

import React, { FormEvent, useState } from "react";
import { Plus, Sparkles, X, Video, Clock, Zap, Wand2, Database } from "lucide-react";
import { useCampaigns } from "../hooks/useCampaigns";
import { Button, Input, Textarea, Select } from "./ui";

interface RegisterModalProps {
  onClose: () => void;
  onSuccess?: (contentId: string) => void;
}

export default function RegisterModal({
  onClose,
  onSuccess,
}: RegisterModalProps) {
  const { createCampaign, isCreating } = useCampaigns();

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("movie");
  const [newReleaseDate, setNewReleaseDate] = useState("");
  const [newTrailerQuery, setNewTrailerQuery] = useState("");
  const [syncMode, setSyncMode] = useState("1hr");
  const [initialVolume, setInitialVolume] = useState(1000);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTrailerQuery.trim()) return;

    const contentId = await createCampaign({
      title: newTitle.trim(),
      content_type: newType,
      description: newDesc.trim(),
      release_date: newReleaseDate || null,
      target_terms: [newTrailerQuery.trim()],
      sync_mode: syncMode,
      initial_volume: initialVolume,
    });

    if (contentId) {
      onClose();
      if (onSuccess) {
        onSuccess(contentId);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-fade-in">
      <div className="bg-[#1c1c1f] border border-[#28282b] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#28282b] flex items-center justify-between bg-[#161618]">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[#242428] flex items-center justify-center text-[#e6fc4f]">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="font-bold text-base tracking-wide uppercase text-zinc-100">
              Track New Campaign Launch
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form - 2-Column Balanced Grid */}
        <form onSubmit={handleSubmit} className="p-6 text-sm font-sans space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Primary Details */}
            <div className="space-y-4">
              {/* Campaign Title */}
              <Input
                label="Campaign / Film Title"
                required
                placeholder="e.g. Wicked (2024)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />

              {/* YouTube Trailer Target or URL */}
              <Input
                label="YouTube Trailer Target or URL"
                required
                leftIcon={<Video className="h-4 w-4 text-[#e6fc4f]" />}
                placeholder="e.g. Wicked Official Trailer or https://..."
                value={newTrailerQuery}
                onChange={(e) => setNewTrailerQuery(e.target.value)}
                rightElement={
                  newTitle.trim() && !newTrailerQuery.trim() ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => setNewTrailerQuery(`${newTitle.trim()} Official Trailer`)}
                      leftIcon={<Wand2 className="h-3 w-3 text-[#e6fc4f]" />}
                      className="text-xs text-[#e6fc4f] hover:underline p-0 h-auto font-medium"
                    >
                      Auto-fill: <span className="underline ml-1 font-bold">"{newTitle.trim()} Trailer"</span>
                    </Button>
                  ) : undefined
                }
              />

              {/* Description */}
              <Textarea
                label="Campaign Description / Logline"
                required
                rows={3}
                placeholder="e.g. Universal Pictures musical adaptation directed by Jon M. Chu..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>

            {/* Right Column: Ingestion Engine & Release Settings */}
            <div className="space-y-4">
              {/* Row 1: Sync Mode & Initial Volume */}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Sync Mode"
                  leftIcon={<Clock className="h-4 w-4 text-zinc-400" />}
                  value={syncMode}
                  onChange={(e) => setSyncMode(e.target.value)}
                  options={[
                    { value: "1hr", label: "Auto (1 Hour)" },
                    { value: "6hr", label: "Auto (6 Hours)" },
                    { value: "24hr", label: "Auto (24 Hours)" },
                    { value: "manual", label: "Manual Sync" },
                  ]}
                />

                <Select
                  label="Initial Volume"
                  leftIcon={<Zap className="h-4 w-4 text-[#e6fc4f]" />}
                  value={initialVolume}
                  onChange={(e) => setInitialVolume(parseInt(e.target.value))}
                  options={[
                    { value: 1000, label: "1,000 (Recommended)" },
                    { value: 500, label: "500 Comments" },
                    { value: 250, label: "250 Comments" },
                  ]}
                />
              </div>

              {/* Row 2: Campaign Type & Release Date */}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Campaign Type"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  options={[
                    { value: "movie", label: "Theatrical Movie" },
                    { value: "series", label: "Streaming Series" },
                    { value: "campaign", label: "Promotional Drop" },
                  ]}
                />

                <Input
                  label="Target Release Date"
                  type="date"
                  value={newReleaseDate}
                  onChange={(e) => setNewReleaseDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Bottom Footer Actions */}
          <div className="pt-4 border-t border-[#28282b] flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isCreating}
              disabled={isCreating || !newTitle.trim() || !newTrailerQuery.trim()}
              leftIcon={<Plus className="h-4 w-4 stroke-[3]" />}
            >
              {isCreating ? "Initializing & Streaming Comments..." : "Launch Campaign & Auto-Stream"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
