"use client";

import React, { FormEvent, useState } from "react";
import { Plus, Sparkles, X, Video, ShieldAlert, Wand2, Database, Lock, CheckCircle2 } from "lucide-react";
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
  query: string;
  desc: string;
  type: string;
  releaseDate: string;
}

const PRESET_CAMPAIGNS: CampaignPreset[] = [
  {
    title: "Wicked (2024)",
    query: "Wicked Official Trailer",
    desc: "Universal Pictures musical adaptation directed by Jon M. Chu, starring Cynthia Erivo and Ariana Grande.",
    type: "movie",
    releaseDate: "2024-11-22",
  },
  {
    title: "Gladiator II",
    query: "Gladiator II Official Trailer",
    desc: "Paramount Pictures historical epic directed by Ridley Scott, following Lucius entering the Colosseum.",
    type: "movie",
    releaseDate: "2024-11-22",
  },
  {
    title: "Deadpool & Wolverine",
    query: "Deadpool & Wolverine Official Trailer",
    desc: "Marvel Studios multiverse team-up featuring Ryan Reynolds and Hugh Jackman.",
    type: "movie",
    releaseDate: "2024-07-26",
  },
  {
    title: "Moana 2",
    query: "Moana 2 Official Trailer",
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
  const [newTrailerQuery, setNewTrailerQuery] = useState("");
  const [isTrailerManuallyEdited, setIsTrailerManuallyEdited] = useState(false);
  const [syncMode, setSyncMode] = useState("1hr");
  const [initialVolume, setInitialVolume] = useState(1000);

  const [createdId, setCreatedId] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  // Intelligent title change handler: syncs trailer query automatically unless user wrote a custom query
  const handleTitleChange = (val: string) => {
    setNewTitle(val);
    if (!isTrailerManuallyEdited || !newTrailerQuery.trim()) {
      if (val.trim()) {
        setNewTrailerQuery(`${val.trim()} Official Trailer`);
      } else {
        setNewTrailerQuery("");
      }
    }
  };

  // Preset selector
  const handleApplyPreset = (preset: CampaignPreset) => {
    setNewTitle(preset.title);
    setNewTrailerQuery(preset.query);
    setNewDesc(preset.desc);
    setNewType(preset.type);
    setNewReleaseDate(preset.releaseDate);
    setIsTrailerManuallyEdited(false);
    toast.success(`Loaded "${preset.title}" template!`);
  };

  const handleResetTrailerAutoFill = () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a campaign title first.");
      return;
    }
    setNewTrailerQuery(`${newTitle.trim()} Official Trailer`);
    setIsTrailerManuallyEdited(false);
    toast.success("Trailer target synchronized with campaign title!");
  };

  const isHttpInsecure = newTrailerQuery.trim().toLowerCase().startsWith("http://");
  const isTitleValid = newTitle.trim().length >= 2;
  const isDescValid = newDesc.trim().length >= 5;
  const isTrailerQueryValid = newTrailerQuery.trim().length >= 2 && !isHttpInsecure;
  const isFormValid = isTitleValid && isDescValid && isTrailerQueryValid;

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

    if (!isTrailerQueryValid) {
      toast.error("Please provide a valid search query or HTTPS YouTube URL.");
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
      target_terms: [newTrailerQuery.trim()],
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
        targetQuery={newTrailerQuery || newTitle}
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
                Auto-fill & HTTPS Security Enforced
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
            <Wand2 className="h-3 w-3 text-indigo-400" />
            1-Click Templates:
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
              {/* Campaign Title (Mandatory) */}
              <div>
                <Input
                  label="Campaign / Film Title *"
                  required
                  placeholder="e.g. Wicked (2024)"
                  value={newTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
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

              {/* YouTube Trailer Target or URL (Mandatory, HTTPS Only) */}
              <div>
                <Input
                  label="YouTube Trailer Target or HTTPS URL *"
                  required
                  leftIcon={
                    isHttpInsecure ? (
                      <ShieldAlert className="h-4 w-4 text-rose-400" />
                    ) : (
                      <Video className="h-4 w-4 text-indigo-400" />
                    )
                  }
                  placeholder="e.g. Wicked Official Trailer or https://www.youtube.com/watch?v=..."
                  value={newTrailerQuery}
                  onChange={(e) => {
                    setNewTrailerQuery(e.target.value);
                    setIsTrailerManuallyEdited(true);
                  }}
                />

                <div className="pt-1.5 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                  {isHttpInsecure ? (
                    <div className="flex items-center gap-1 text-rose-400 font-medium">
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                      <span>Insecure URL detected. Only HTTPS URLs (https://...) are permitted.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Lock className="h-3 w-3 text-emerald-400 inline shrink-0" />
                      <span>YouTube search keyword or https:// video URL.</span>
                    </div>
                  )}

                  {newTitle.trim() && (
                    <button
                      type="button"
                      onClick={handleResetTrailerAutoFill}
                      className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Wand2 className="h-3 w-3" />
                      Sync with title
                    </button>
                  )}
                </div>
              </div>

              {/* Description (Mandatory) */}
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
                  <span>ClickHouse Vectorized Storage</span>
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
