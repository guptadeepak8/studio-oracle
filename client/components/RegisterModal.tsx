"use client";

import React, { FormEvent, useState, useRef, useEffect } from "react";
import { Plus, Sparkles, X, Video, ShieldAlert, Database, Lock, CheckCircle2, Link2, Film, Calendar, Clapperboard } from "lucide-react";
import { toast } from "sonner";
import { useCampaigns } from "../hooks/useCampaigns";
import { Button, Input, Textarea, Select } from "./ui";
import IngestProgressModal from "./IngestProgressModal";

interface RegisterModalProps {
  onClose: () => void;
  onSuccess?: (contentId: string) => void;
}

interface MovieCatalogItem {
  title: string;
  trailerUrl: string;
  desc: string;
  type: string;
  releaseDate: string;
  studio: string;
}

const MOVIE_CATALOG: MovieCatalogItem[] = [
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
  {
    title: "Nosferatu (2024)",
    trailerUrl: "https://www.youtube.com/watch?v=nulvWqYUM8k",
    desc: "Focus Features gothic horror masterpiece directed by Robert Eggers, starring Bill Skarsgård, Nicholas Hoult, and Lily-Rose Depp.",
    type: "movie",
    releaseDate: "2024-12-25",
    studio: "Focus Features",
  },
  {
    title: "Superman (2025)",
    trailerUrl: "https://www.youtube.com/watch?v=uhUht6vAsMY",
    desc: "DC Studios superhero film written and directed by James Gunn, starring David Corenswet as the Man of Steel.",
    type: "movie",
    releaseDate: "2025-07-11",
    studio: "DC Studios / Warner Bros.",
  },
  {
    title: "Avatar: Fire and Ash",
    trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
    desc: "20th Century Studios sci-fi epic directed by James Cameron, introducing the aggressive Ash People Na'vi clan on Pandora.",
    type: "movie",
    releaseDate: "2025-12-19",
    studio: "20th Century Studios / Disney",
  },
  {
    title: "Dune: Part Two",
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    desc: "Warner Bros. Pictures sci-fi adaptation directed by Denis Villeneuve, following Paul Atreides uniting with the Fremen.",
    type: "movie",
    releaseDate: "2024-03-01",
    studio: "Warner Bros. / Legendary",
  },
  {
    title: "Joker: Folie à Deux",
    trailerUrl: "https://www.youtube.com/watch?v=_OKAwz2NiJs",
    desc: "Warner Bros. Pictures musical psychological thriller directed by Todd Phillips, starring Joaquin Phoenix and Lady Gaga.",
    type: "movie",
    releaseDate: "2024-10-04",
    studio: "Warner Bros. Pictures",
  },
  {
    title: "Mufasa: The Lion King",
    trailerUrl: "https://www.youtube.com/watch?v=o17MF9vnabg",
    desc: "Walt Disney Studios photorealistic musical drama directed by Barry Jenkins, chronicling the rise of King Mufasa.",
    type: "movie",
    releaseDate: "2024-12-20",
    studio: "Walt Disney Pictures",
  },
  {
    title: "Sonic the Hedgehog 3",
    trailerUrl: "https://www.youtube.com/watch?v=qSu6i2iFMO0",
    desc: "Paramount Pictures action adventure starring Ben Schwartz as Sonic, Jim Carrey as Dr. Robotnik, and Keanu Reeves as Shadow.",
    type: "movie",
    releaseDate: "2024-12-20",
    studio: "Paramount Pictures",
  },
  {
    title: "Captain America: Brave New World",
    trailerUrl: "https://www.youtube.com/watch?v=1pHDWnXmK7Y",
    desc: "Marvel Studios espionage superhero film starring Anthony Mackie as Sam Wilson and Harrison Ford as Thaddeus Ross / Red Hulk.",
    type: "movie",
    releaseDate: "2025-02-14",
    studio: "Marvel Studios",
  },
  {
    title: "The Fantastic Four: First Steps",
    trailerUrl: "https://www.youtube.com/watch?v=7h3e9iM9wE0",
    desc: "Marvel Studios retro-futuristic 1960s superhero epic starring Pedro Pascal, Vanessa Kirby, Joseph Quinn, and Ebon Moss-Bachrach.",
    type: "movie",
    releaseDate: "2025-07-25",
    studio: "Marvel Studios",
  },
  {
    title: "Thunderbolts*",
    trailerUrl: "https://www.youtube.com/watch?v=v-bL8vW6p78",
    desc: "Marvel Studios antihero ensemble directed by Jake Schreier, starring Florence Pugh, Sebastian Stan, and David Harbour.",
    type: "movie",
    releaseDate: "2025-05-02",
    studio: "Marvel Studios",
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

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [createdId, setCreatedId] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  // Filter autocomplete suggestions based on user input
  const suggestions = newTitle.trim().length > 0
    ? MOVIE_CATALOG.filter((movie) =>
        movie.title.toLowerCase().includes(newTitle.toLowerCase()) ||
        movie.studio.toLowerCase().includes(newTitle.toLowerCase())
      )
    : [];

  const handleSelectMovie = (movie: MovieCatalogItem) => {
    setNewTitle(movie.title);
    setNewTrailerUrl(movie.trailerUrl);
    setNewDesc(movie.desc);
    setNewType(movie.type);
    setNewReleaseDate(movie.releaseDate);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    toast.success(`Selected "${movie.title}" · Official trailer URL loaded!`);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectMovie(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
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
      toast.error("Please provide a valid YouTube trailer URL or search query.");
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
              <span className="text-[11px] text-zinc-400 font-mono">
                Smart Movie Autocomplete & Verified Trailer Ingestion
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
            <Clapperboard className="h-3 w-3 text-indigo-400" />
            Popular Campaigns:
          </span>
          {MOVIE_CATALOG.slice(0, 4).map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => handleSelectMovie(preset)}
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
              {/* Field 1: Campaign / Film Title with Autocomplete */}
              <div className="relative" ref={suggestionsRef}>
                <Input
                  label="Campaign / Film Title *"
                  required
                  placeholder="e.g. Gladiator II, Wicked, Superman..."
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    setShowSuggestions(true);
                    setSelectedIndex(-1);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />

                {/* Smart Autocomplete Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[68px] bg-[#1a1a1d] border border-indigo-500/40 rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto divide-y divide-[#28282b] font-sans animate-fade-in">
                    <div className="px-3 py-1.5 bg-[#141416] text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center justify-between">
                      <span>Matching Movies in Catalog</span>
                      <span className="text-zinc-500 lowercase">Click to auto-populate details</span>
                    </div>
                    {suggestions.map((movie, index) => (
                      <div
                        key={movie.title}
                        onClick={() => handleSelectMovie(movie)}
                        className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition ${
                          selectedIndex === index
                            ? "bg-indigo-600/20 text-white"
                            : "hover:bg-[#242428] text-zinc-200"
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold text-xs text-zinc-100 flex items-center gap-1.5 truncate">
                            <Film className="h-3 w-3 text-indigo-400 shrink-0" />
                            <span>{movie.title}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-1">
                            {movie.studio} · {movie.desc}
                          </p>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-400 shrink-0 bg-[#141416] px-2 py-0.5 rounded border border-[#28282b]">
                          {movie.releaseDate}
                        </span>
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
                      <Link2 className="h-4 w-4 text-emerald-400" />
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
