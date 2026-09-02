"use client";

import React, { FormEvent, useState } from "react";
import { Plus, Sparkles, X, Video, ShieldAlert, Database, Lock, CheckCircle2, Link2, Search } from "lucide-react";
import { toast } from "sonner";
import { useCampaigns } from "../hooks/useCampaigns";
import { Button, Input, Textarea, Select } from "./ui";
import IngestProgressModal from "./IngestProgressModal";

interface RegisterModalProps {
  onClose: () => void;
  onSuccess?: (contentId: string) => void;
}

interface CampaignPreset {
  title: string;
  trailerUrlOrQuery: string;
  desc: string;
  type: string;
  releaseDate: string;
}

const PRESET_CAMPAIGNS: CampaignPreset[] = [
  {
    title: "Wicked (2024)",
    trailerUrlOrQuery: "https://www.youtube.com/watch?v=6COmYeLsz4c",
    desc: "Universal Pictures musical adaptation directed by Jon M. Chu, starring Cynthia Erivo and Ariana Grande.",
    type: "movie",
    releaseDate: "2024-11-22",
  },
  {
    title: "Gladiator II",
    trailerUrlOrQuery: "https://www.youtube.com/watch?v=4rgYUipGJNo",
    desc: "Paramount Pictures historical epic directed by Ridley Scott, following Lucius entering the Colosseum.",
    type: "movie",
    releaseDate: "2024-11-22",
  },
  {
    title: "Deadpool & Wolverine",
    trailerUrlOrQuery: "https://www.youtube.com/watch?v=73_1biulkYk",
    desc: "Marvel Studios multiverse team-up featuring Ryan Reynolds and Hugh Jackman.",
    type: "movie",
    releaseDate: "2024-07-26",
  },
  {
    title: "Moana 2",
    trailerUrlOrQuery: "https://www.youtube.com/watch?v=hDZ7y8RP5HE",
    desc: "Walt Disney Animation Studios animated musical voyage starring Auli'i Cravalho and Dwayne Johnson.",
    type: "movie",
    releaseDate: "2024-11-27",
  },
];

export default function RegisterModal({
  onClose,
  onSuccess,
}: RegisterModalProps) {
  const { createCampaign, isCreating } = useCampaigns();

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("movie");
  const [newReleaseDate, setNewReleaseDate] = useState("");
  const [newTrailerUrlOrQuery, setNewTrailerUrlOrQuery] = useState("");
  const [syncMode, setSyncMode] = useState("1hr");
  const [initialVolume, setInitialVolume] = useState(1000);

  const [createdId, setCreatedId] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  // Preset selector
  const handleApplyPreset = (preset: CampaignPreset) => {
    setNewTitle(preset.title);
    setNewTrailerUrlOrQuery(preset.trailerUrlOrQuery);
    setNewDesc(preset.desc);
    setNewType(preset.type);
    setNewReleaseDate(preset.releaseDate);
    toast.success(`Loaded "${preset.title}" template with official trailer URL!`);
  };

  const handleGenerateSearchTerm = () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a campaign title first.");
      return;
    }
    setNewTrailerUrlOrQuery(`${newTitle.trim()} Official Trailer`);
    toast.success("Generated search term from title!");
  };

  const isHttpInsecure = newTrailerUrlOrQuery.trim().toLowerCase().startsWith("http://");
  const isUrl = newTrailerUrlOrQuery.trim().toLowerCase().startsWith("https://");
  const isTitleValid = newTitle.trim().length >= 2;
  const isDescValid = newDesc.trim().length >= 5;
  const isTrailerValid = newTrailerUrlOrQuery.trim().length >= 2 && !isHttpInsecure;
  const isFormValid = isTitleValid && isDescValid && isTrailerValid;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isHttpInsecure) {
      toast.error("Insecure HTTP URL detected. Please use https:// or enter search keywords.");
      return;
    }

    if (!isTitleValid) {
      toast.error("Campaign title must be at least 2 characters long.");
      return;
    }

    if (!isTrailerValid) {
      toast.error("Please provide a valid YouTube video URL (https://...) or search term.");
      return;
    }

    if (!isDescValid) {
      toast.error("Campaign description must be at least 5 characters long.");
      return;
    }

    const contentId = await createCampaign({
      title: newTitle.trim(),
      content_type: newType,
      description: newDesc.trim(),
      release_date: newReleaseDate || null,
      target_terms: [newTrailerUrlOrQuery.trim()],
      sync_mode: syncMode,
      initial_volume: initialVolume,
    });

    if (contentId) {
      setCreatedId(contentId);
      setShowProgress(true);
    }
  };

  const handleFinishProgress = () => {
    setShowProgress(false);
    onClose();
    if (createdId && onSuccess) {
      onSuccess(createdId);
    }
  };

  if (showProgress) {
    return (
      <IngestProgressModal
        isOpen={showProgress}
        onClose={handleFinishProgress}
        targetQuery={newTrailerUrlOrQuery || newTitle}
        source="youtube"
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-fade-in">
      <div className="bg-[#1c1c1f] border border-[#28282b] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#28282b] flex items-center justify-between bg-[#161618]">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-wide uppercase text-zinc-100">
                Track New Campaign Launch
              </h2>
              <span className="text-[11px] text-zinc-400 font-mono">
                Independent Title & Trailer Ingestion Target
              </span>
            </div>
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

        {/* 1-Click Quick Template Bar */}
        <div className="px-6 py-2.5 bg-[#141416] border-b border-[#242428] flex items-center gap-2 flex-wrap text-xs text-zinc-400">
          <span className="font-semibold text-zinc-300 flex items-center gap-1">
            <Video className="h-3 w-3 text-indigo-400" />
            Sample Campaigns:
          </span>
          {PRESET_CAMPAIGNS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="bg-[#1f1f23] hover:bg-[#28282d] hover:text-white text-zinc-300 px-2.5 py-1 rounded-md border border-[#2e2e33] transition cursor-pointer font-medium text-[11px]"
            >
              {preset.title}
            </button>
          ))}
        </div>

        {/* Form - 2-Column Balanced Grid */}
        <form onSubmit={handleSubmit} className="p-6 text-sm font-sans space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Primary Details */}
            <div className="space-y-4">
              {/* Field 1: Campaign / Film Title */}
              <div>
                <Input
                  label="Campaign / Film Title *"
                  required
                  placeholder="e.g. Wicked (2024) or Gladiator II"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                {!isTitleValid && newTitle.length > 0 ? (
                  <p className="text-[11px] text-amber-400 pt-1">
                    Title must contain at least 2 characters.
                  </p>
                ) : newTitle.trim().length >= 2 ? (
                  <p className="text-[11px] text-emerald-400 pt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Valid campaign title.
                  </p>
                ) : null}
              </div>

              {/* Field 2: Distinct YouTube Trailer URL or Search Query */}
              <div>
                <Input
                  label="YouTube Trailer Video (HTTPS URL or Search Term) *"
                  required
                  leftIcon={
                    isHttpInsecure ? (
                      <ShieldAlert className="h-4 w-4 text-rose-400" />
                    ) : isUrl ? (
                      <Link2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Search className="h-4 w-4 text-indigo-400" />
                    )
                  }
                  placeholder="https://www.youtube.com/watch?v=... or Gladiator II Official Trailer"
                  value={newTrailerUrlOrQuery}
                  onChange={(e) => setNewTrailerUrlOrQuery(e.target.value)}
                />

                <div className="pt-1.5 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                  {isHttpInsecure ? (
                    <div className="flex items-center gap-1 text-rose-400 font-medium">
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                      <span>Insecure HTTP detected. Only HTTPS URLs (https://...) are permitted.</span>
                    </div>
                  ) : isUrl ? (
                    <div className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Direct YouTube Video Link (HTTPS)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Lock className="h-3 w-3 text-zinc-500 inline shrink-0" />
                      <span>Paste direct YouTube URL or search keywords.</span>
                    </div>
                  )}

                  {newTitle.trim() && !newTrailerUrlOrQuery.trim() && (
                    <button
                      type="button"
                      onClick={handleGenerateSearchTerm}
                      className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      Use "{newTitle.trim()} Trailer"
                    </button>
                  )}
                </div>
              </div>

              {/* Field 3: Description (Mandatory) */}
              <div>
                <Textarea
                  label="Campaign Description / Logline *"
                  required
                  rows={3}
                  placeholder="e.g. Universal Pictures musical adaptation directed by Jon M. Chu..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
                {!isDescValid && newDesc.length > 0 ? (
                  <p className="text-[11px] text-amber-400 pt-1">
                    Description must be at least 5 characters long.
                  </p>
                ) : newDesc.trim().length >= 5 ? (
                  <p className="text-[11px] text-emerald-400 pt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Valid campaign logline.
                  </p>
                ) : null}
              </div>
            </div>

            {/* Right Column: Telemetry & Ingestion Strategy */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Content Type"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  options={[
                    { value: "movie", label: "Theatrical Film" },
                    { value: "show", label: "Streaming / TV Series" },
                    { value: "franchise", label: "Franchise IP" },
                  ]}
                />

                <Input
                  type="date"
                  label="Release Date"
                  value={newReleaseDate}
                  onChange={(e) => setNewReleaseDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Surveillance Interval"
                  value={syncMode}
                  onChange={(e) => setSyncMode(e.target.value)}
                  options={[
                    { value: "1hr", label: "Every 1 Hour (Active)" },
                    { value: "6hr", label: "Every 6 Hours" },
                    { value: "24hr", label: "Every 24 Hours" },
                    { value: "manual", label: "Manual Sync Only" },
                  ]}
                />

                <Select
                  label="Initial Comment Volume"
                  value={initialVolume}
                  onChange={(e) => setInitialVolume(parseInt(e.target.value))}
                  options={[
                    { value: 100, label: "100 Comments (Fast)" },
                    { value: 250, label: "250 Comments" },
                    { value: 500, label: "500 Comments" },
                    { value: 1000, label: "1,000 Comments (Recommended)" },
                    { value: 2500, label: "2,500 Comments (Deep Ingest)" },
                  ]}
                />
              </div>

              {/* Security & Engine Spec Banner */}
              <div className="bg-[#141416] border border-[#28282b] rounded-xl p-3.5 space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center gap-1.5 font-bold text-zinc-100">
                  <Database className="h-3.5 w-3.5 text-indigo-400" />
                  <span>ClickHouse Columnar Ingestion</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Comments are parsed into high-speed columnar arrays (`topics`, `sentiment`, `claim`) enabling sub-20ms multi-dimensional anomaly queries.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#28282b] flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              * Required fields. Ingestion targets YouTube trailers & Google Search intelligence.
            </span>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isCreating || !isFormValid}
                isLoading={isCreating}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                {isCreating ? "Initializing Pipeline..." : "Register & Start Ingestion"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
