"use client";

import React, { FormEvent, useState, useRef, useEffect } from "react";
import { Plus, Sparkles, X, Video, ShieldAlert, Database, Lock, Film, Search, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { useCampaigns } from "../hooks/useCampaigns";
import { API_BASE_URL } from "../utils/constants";
import { Button, Input, Textarea, Select } from "./ui";
import IngestProgressModal from "./IngestProgressModal";

interface RegisterModalProps {
  onClose: () => void;
  onSuccess?: (contentId: string) => void;
}

interface YouTubeTrailerResult {
  video_id: string;
  title: string;
  channel_title: string;
  description: string;
  published_at: string;
  thumbnail_url: string;
  url: string;
}

interface MovieCatalogItem {
  title: string;
  trailerUrl: string;
  desc: string;
  type: string;
  releaseDate: string;
  studio: string;
}

const POPULAR_TEMPLATES: MovieCatalogItem[] = [
  {
    title: "Wicked (2024)",
    trailerUrl: "https://www.youtube.com/watch?v=6COmYeLsz4c",
    desc: "Universal Pictures musical adaptation directed by Jon M. Chu, starring Cynthia Erivo as Elphaba and Ariana Grande as Glinda.",
    type: "movie",
    releaseDate: "2024-11-22",
    studio: "Universal Pictures",
  },
  {
    title: "Gladiator II",
    trailerUrl: "https://www.youtube.com/watch?v=4rgYUipGJNo",
    desc: "Paramount Pictures historical epic directed by Ridley Scott, following Lucius entering the Colosseum decades after Maximus.",
    type: "movie",
    releaseDate: "2024-11-22",
    studio: "Paramount Pictures",
  },
  {
    title: "Deadpool & Wolverine",
    trailerUrl: "https://www.youtube.com/watch?v=73_1biulkYk",
    desc: "Marvel Studios multiverse superhero team-up featuring Ryan Reynolds as Deadpool and Hugh Jackman returning as Wolverine.",
    type: "movie",
    releaseDate: "2024-07-26",
    studio: "Marvel Studios / Disney",
  },
  {
    title: "Moana 2",
    trailerUrl: "https://www.youtube.com/watch?v=hDZ7y8RP5HE",
    desc: "Walt Disney Animation Studios animated musical voyage starring Auli'i Cravalho and Dwayne Johnson exploring Oceania.",
    type: "movie",
    releaseDate: "2024-11-27",
    studio: "Walt Disney Animation",
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
  const [newTrailerUrl, setNewTrailerUrl] = useState("");
  const [syncMode, setSyncMode] = useState("1hr");
  const [initialVolume, setInitialVolume] = useState(1000);

  const [youtubeResults, setYoutubeResults] = useState<YouTubeTrailerResult[]>([]);
  const [isSearchingYouTube, setIsSearchingYouTube] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [createdId, setCreatedId] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const isSelectingRef = useRef(false);

  // Debounced live YouTube API search
  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    const query = newTitle.trim();
    if (query.length < 2) {
      setYoutubeResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingYouTube(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/youtube/search-trailers?q=${encodeURIComponent(query)}&limit=5`);
        if (res.ok) {
          const data: YouTubeTrailerResult[] = await res.json();
          setYoutubeResults(data);
          if (data.length > 0 && !isSelectingRef.current) {
            setShowDropdown(true);
          }
        }
      } catch (e) {
        console.error("YouTube search error:", e);
      } finally {
        setIsSearchingYouTube(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [newTitle]);

  // Clean raw YouTube title to film name
  const cleanFilmTitle = (raw: string) => {
    return raw
      .replace(/\|.*$/gi, "")
      .replace(/\[.*?\]/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/Official Trailer.*$/gi, "")
      .replace(/Teaser Trailer.*$/gi, "")
      .replace(/Trailer.*$/gi, "")
      .replace(/4K.*$/gi, "")
      .replace(/HD.*$/gi, "")
      .trim();
  };

  const handleSelectYouTubeTrailer = (trailer: YouTubeTrailerResult) => {
    isSelectingRef.current = true;
    const extractedTitle = cleanFilmTitle(trailer.title) || newTitle.trim();
    setNewTitle(extractedTitle);
    setNewTrailerUrl(trailer.url);
    if (!newDesc.trim() && trailer.description) {
      setNewDesc(trailer.description.slice(0, 300));
    }
    if (trailer.published_at) {
      setNewReleaseDate(trailer.published_at);
    }
    setShowDropdown(false);
    setYoutubeResults([]);
    setSelectedIndex(-1);
    toast.success(`Selected "${trailer.title.slice(0, 40)}..." · Live trailer URL linked!`);
  };

  const handleSelectTemplate = (template: MovieCatalogItem) => {
    isSelectingRef.current = true;
    setNewTitle(template.title);
    setNewTrailerUrl(template.trailerUrl);
    setNewDesc(template.desc);
    setNewType(template.type);
    setNewReleaseDate(template.releaseDate);
    setShowDropdown(false);
    setYoutubeResults([]);
    toast.success(`Loaded "${template.title}" template!`);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || youtubeResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < youtubeResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : youtubeResults.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectYouTubeTrailer(youtubeResults[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const isHttpInsecure = newTrailerUrl.trim().toLowerCase().startsWith("http://");
  const isUrl = newTrailerUrl.trim().toLowerCase().startsWith("https://");
  const isTitleValid = newTitle.trim().length >= 2;
  const isDescValid = newDesc.trim().length >= 5;
  const isTrailerValid = newTrailerUrl.trim().length >= 2 && !isHttpInsecure;
  const isFormValid = isTitleValid && isDescValid && isTrailerValid;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isHttpInsecure) {
      toast.error("Insecure HTTP URL detected. Please use https:// video URLs.");
      return;
    }

    if (!isTitleValid) {
      toast.error("Campaign title is required (at least 2 characters).");
      return;
    }

    if (!isTrailerValid) {
      toast.error("Please provide a valid YouTube trailer URL.");
      return;
    }

    if (!isDescValid) {
      toast.error("Campaign description is required (at least 5 characters).");
      return;
    }

    const contentId = await createCampaign({
      title: newTitle.trim(),
      content_type: newType,
      description: newDesc.trim(),
      release_date: newReleaseDate || null,
      target_terms: [newTrailerUrl.trim()],
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
        targetQuery={newTrailerUrl || newTitle}
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
              <span className="text-xs text-zinc-400">
                Track real-time audience buzz and trailer reactions
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
            Popular Templates:
          </span>
          {POPULAR_TEMPLATES.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => handleSelectTemplate(preset)}
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
              {/* Field 1: Campaign / Film Title with Live YouTube API Autocomplete */}
              <div className="relative" ref={dropdownRef}>
                <Input
                  label="Campaign / Film Title (Search Any Movie) *"
                  required
                  placeholder="Type any movie title (e.g. Gladiator II, Oppenheimer, Avatar...)"
                  value={newTitle}
                  onChange={(e) => {
                    isSelectingRef.current = false;
                    setNewTitle(e.target.value);
                  }}
                  onFocus={() => {
                    if (youtubeResults.length > 0) setShowDropdown(true);
                  }}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  rightElement={
                    isSearchingYouTube ? (
                      <div className="flex items-center gap-1 text-[11px] text-indigo-400 font-mono">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Searching YouTube...</span>
                      </div>
                    ) : undefined
                  }
                />

                {/* Live YouTube API Search Results Dropdown */}
                {showDropdown && youtubeResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-17 bg-[#1a1a1d] border border-indigo-500/40 rounded-xl shadow-2xl z-30 max-h-64 overflow-y-auto divide-y divide-[#28282b] font-sans animate-fade-in">
                    <div className="px-3 py-1.5 bg-[#141416] text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Video className="h-3 w-3 text-red-500" /> Live YouTube API Trailer Results
                      </span>
                      <span className="text-zinc-500 lowercase">Click to auto-fill official URL</span>
                    </div>

                    {youtubeResults.map((trailer, index) => (
                      <div
                        key={trailer.video_id}
                        onClick={() => handleSelectYouTubeTrailer(trailer)}
                        className={`p-3 flex items-center gap-3 cursor-pointer transition ${
                          selectedIndex === index
                            ? "bg-indigo-600/20 text-white"
                            : "hover:bg-[#242428] text-zinc-200"
                        }`}
                      >
                        {/* Video Thumbnail */}
                        <div className="relative w-20 h-12 rounded-md overflow-hidden bg-black shrink-0 border border-[#28282b]">
                          <img
                            src={trailer.thumbnail_url}
                            alt={trailer.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                            <Play className="h-4 w-4 text-white fill-white" />
                          </div>
                        </div>

                        {/* Video Info */}
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="font-bold text-xs text-zinc-100 line-clamp-1">
                            {trailer.title}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                            <span className="text-zinc-300 font-semibold">{trailer.channel_title}</span>
                            {trailer.published_at && (
                              <>
                                <span>·</span>
                                <span className="font-mono">{trailer.published_at}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Field 2: Distinct YouTube Trailer URL */}
              <div>
                <Input
                  label="YouTube Trailer Video URL *"
                  required
                  leftIcon={
                    isHttpInsecure ? (
                      <ShieldAlert className="h-4 w-4 text-rose-400" />
                    ) : isUrl ? (
                      <Video className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Video className="h-4 w-4 text-zinc-400" />
                    )
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newTrailerUrl}
                  onChange={(e) => setNewTrailerUrl(e.target.value)}
                />

                {isHttpInsecure && (
                  <div className="flex items-center gap-1 text-[11px] text-rose-400 font-medium pt-1">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                    <span>Insecure HTTP detected. Only HTTPS URLs (https://...) are permitted.</span>
                  </div>
                )}
              </div>

              {/* Field 3: Description */}
              <div>
                <Textarea
                  label="Campaign Description / Logline *"
                  required
                  rows={3}
                  placeholder="e.g. Universal Pictures musical adaptation directed by Jon M. Chu..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
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
                  label="Sync Frequency"
                  value={syncMode}
                  onChange={(e) => setSyncMode(e.target.value)}
                  options={[
                    { value: "1hr", label: "Every 1 Hour" },
                    { value: "6hr", label: "Every 6 Hours" },
                    { value: "24hr", label: "Every 24 Hours" },
                    { value: "manual", label: "Manual Sync Only" },
                  ]}
                />

                <Select
                  label="Initial Comments Target"
                  value={initialVolume}
                  onChange={(e) => setInitialVolume(parseInt(e.target.value))}
                  options={[
                    { value: 500, label: "500 Comments" },
                    { value: 1000, label: "1,000 Comments (Default)" },
                    { value: 2500, label: "2,500 Comments" },
                    { value: 100000, label: "100,000 Comments (Benchmark Scale)" },
                  ]}
                />
              </div>

              {/* Data Ingestion Spec Banner */}
              <div className="bg-[#141416] border border-[#28282b] rounded-xl p-3.5 space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center gap-1.5 font-bold text-zinc-100">
                  <Database className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Real-Time Ingestion</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Audience comments are indexed and analyzed for sentiment, topics, and audience response.
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
                {isCreating ? "Creating Campaign..." : "Create Campaign & Start Tracking"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
