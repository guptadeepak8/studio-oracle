import React, { useState } from "react";
import { TrendingUp, TrendingDown, Film, Play, Plus, ArrowRight } from "lucide-react";
import { Movie } from "../utils/types";
import { useAppDispatch, useAppSelector } from "../store";
import { setSelectedDropA, setSelectedDropB } from "../store/slices/dashboardSlice";
import { Card, Badge, Button } from "./ui";
import CollapsibleSection from "./common/CollapsibleSection";
import AddVideoDropModal from "./AddVideoDropModal";

function decodeHtml(html: string) {
  if (!html) return "";
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

export interface DropItem {
  id: string;
  title: string;
  url: string;
  published_at: string;
  total_comments: number;
  posPercent: number;
  negPercent: number;
  topComment: string;
}

interface TrailerComparisonProps {
  campaign: Movie;
  drops: DropItem[];
}

export default function TrailerComparison({ campaign, drops = [] }: TrailerComparisonProps) {
  const dispatch = useAppDispatch();
  const { selectedDropAId, selectedDropBId } = useAppSelector((state) => state.dashboard);
  const [showAddModal, setShowAddModal] = useState(false);

  // Auto select first two drops if available
  const activeAId = selectedDropAId && drops.some((d) => d.id === selectedDropAId) ? selectedDropAId : drops[0]?.id || "";
  const activeBId = selectedDropBId && drops.some((d) => d.id === selectedDropBId) ? selectedDropBId : drops[Math.min(1, drops.length - 1)]?.id || "";

  const dropA = drops.find((d) => d.id === activeAId) || drops[0];
  const dropB = drops.find((d) => d.id === activeBId) || drops[Math.min(1, drops.length - 1)];

  const deltaSentiment = dropA && dropB ? dropB.posPercent - dropA.posPercent : 0;
  const isSurge = deltaSentiment >= 0;

  return (
    <>
      <CollapsibleSection
        title="What Changed"
        subtitle="Audience response across video releases and milestone trailer drops."
        headerAction={
          <div className="flex items-center gap-2">
            {drops.length > 1 && (
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-300 max-w-[180px]">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase shrink-0">Drop A:</span>
                  <select
                    value={activeAId}
                    onChange={(e) => dispatch(setSelectedDropA(e.target.value))}
                    className="bg-transparent text-zinc-200 text-xs font-medium focus:outline-none cursor-pointer truncate"
                  >
                    {drops.map((d) => (
                      <option key={d.id} value={d.id} className="bg-zinc-900 text-zinc-200">
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />

                <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-300 max-w-[180px]">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase shrink-0">Drop B:</span>
                  <select
                    value={activeBId}
                    onChange={(e) => dispatch(setSelectedDropB(e.target.value))}
                    className="bg-transparent text-zinc-200 text-xs font-medium focus:outline-none cursor-pointer truncate"
                  >
                    {drops.map((d) => (
                      <option key={d.id} value={d.id} className="bg-zinc-900 text-zinc-200">
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <Button
              variant="secondary"
              size="xs"
              onClick={() => setShowAddModal(true)}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Add Video Drop
            </Button>
          </div>
        }
      >
        <Card className="p-5 space-y-5 bg-zinc-900/40 border-zinc-800/80">
          {drops.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No trailer drops or video milestones recorded yet.
            </div>
          ) : drops.length === 1 ? (
            /* Single Trailer Milestone View */
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-300 shrink-0">
                    <Film className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-100 tracking-tight" title={dropA.title}>
                      {dropA.title}
                    </h4>
                    <span className="text-[11px] text-zinc-500">Published {dropA.published_at}</span>
                  </div>
                </div>
                <Badge variant="positive">
                  Primary Campaign Drop
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Positive Excitement</span>
                  <div className="text-xl font-bold font-mono text-emerald-400">+{dropA.posPercent}%</div>
                  <span className="text-[11px] text-zinc-500">Strong resonance</span>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Audience Reactions</span>
                  <div className="text-xl font-bold font-mono text-zinc-100">{dropA.total_comments.toLocaleString()}</div>
                  <span className="text-[11px] text-zinc-500">Total verified comments</span>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Critical Friction</span>
                  <div className="text-xl font-bold font-mono text-rose-400">-{dropA.negPercent}%</div>
                  <span className="text-[11px] text-zinc-500">Friction topics</span>
                </div>
              </div>

              {dropA.topComment && (
                <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">
                    Top Audience Reaction
                  </span>
                  <p className="text-xs text-zinc-300 italic border-l-2 border-emerald-500/80 pl-2.5 py-0.5 leading-relaxed">
                    &ldquo;{decodeHtml(dropA.topComment)}&rdquo;
                  </p>
                </div>
              )}

              {/* Prompt to add second drop */}
              <div className="flex items-center justify-between flex-wrap gap-3 bg-zinc-950/40 border border-zinc-800/80 rounded-xl p-3.5">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-zinc-200 block">
                    Milestone Comparison
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Add Teaser #2 or Official Trailer #2 to track audience sentiment shifts.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setShowAddModal(true)}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                >
                  Add 2nd Drop
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* 2-Card Drop Milestone Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Drop A Card */}
                {dropA && (
                  <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-6 w-6 rounded-md bg-zinc-800/80 flex items-center justify-center text-zinc-400 shrink-0">
                          <Film className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold text-xs text-zinc-200 truncate" title={dropA.title}>
                          {dropA.title}
                        </span>
                      </div>
                      <Badge variant="default">
                        {dropA.published_at}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center py-2 px-3 bg-zinc-900/40 rounded-lg border border-zinc-800/50">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block font-mono">Positive</span>
                        <span className="font-mono text-emerald-400 font-bold text-sm">+{dropA.posPercent}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block font-mono">Comments</span>
                        <span className="font-mono text-zinc-200 font-medium text-sm">{dropA.total_comments.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block font-mono">Friction</span>
                        <span className="font-mono text-rose-400 font-bold text-sm">-{dropA.negPercent}%</span>
                      </div>
                    </div>

                    {dropA.topComment && (
                      <div>
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">
                          Top Reaction
                        </span>
                        <p className="text-xs text-zinc-300 italic border-l-2 border-emerald-500/80 pl-2 py-0.5 line-clamp-2 leading-relaxed">
                          &ldquo;{decodeHtml(dropA.topComment)}&rdquo;
                        </p>
                      </div>
                    )}

                    <div className="pt-1">
                      <a
                        href={dropA.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 font-medium"
                      >
                        <Play className="h-3 w-3 fill-zinc-400" /> Watch Video
                      </a>
                    </div>
                  </div>
                )}

                {/* Drop B Card */}
                {dropB && (
                  <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-6 w-6 rounded-md bg-zinc-800/80 flex items-center justify-center text-zinc-400 shrink-0">
                          <Film className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold text-xs text-zinc-200 truncate" title={dropB.title}>
                          {dropB.title}
                        </span>
                      </div>
                      <Badge variant="default">
                        {dropB.published_at}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center py-2 px-3 bg-zinc-900/40 rounded-lg border border-zinc-800/50">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block font-mono">Positive</span>
                        <span className="font-mono text-emerald-400 font-bold text-sm">+{dropB.posPercent}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block font-mono">Comments</span>
                        <span className="font-mono text-zinc-200 font-medium text-sm">{dropB.total_comments.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block font-mono">Friction</span>
                        <span className="font-mono text-rose-400 font-bold text-sm">-{dropB.negPercent}%</span>
                      </div>
                    </div>

                    {dropB.topComment && (
                      <div>
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">
                          Top Reaction
                        </span>
                        <p className="text-xs text-zinc-300 italic border-l-2 border-emerald-500/80 pl-2 py-0.5 line-clamp-2 leading-relaxed">
                          &ldquo;{decodeHtml(dropB.topComment)}&rdquo;
                        </p>
                      </div>
                    )}

                    <div className="pt-1">
                      <a
                        href={dropB.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 font-medium"
                      >
                        <Play className="h-3 w-3 fill-zinc-400" /> Watch Video
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Inflection Takeaway */}
              {dropA && dropB && dropA.id !== dropB.id && (
                <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isSurge ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {isSurge ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-zinc-200">
                        {isSurge ? "Positive Shift Detected" : "Drag Inflection Detected"}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {isSurge
                          ? `Audience excitement shifted by +${deltaSentiment}% positive resonance between drops.`
                          : `Audience sentiment decreased by ${Math.abs(deltaSentiment)}% between drops.`}
                      </div>
                    </div>
                  </div>

                  <Badge variant={isSurge ? "positive" : "negative"}>
                    {isSurge ? `+${deltaSentiment}% Momentum` : `${deltaSentiment}% Sentiment Shift`}
                  </Badge>
                </div>
              )}
            </>
          )}
        </Card>
      </CollapsibleSection>

      {showAddModal && (
        <AddVideoDropModal
          contentId={campaign.content_id}
          campaignTitle={campaign.title}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}
