"use client";

import React, { useState } from "react";
import { ThumbsUp, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { ThemeItem } from "../utils/analytics";
import { Card, Badge, Button } from "./ui";
import CollapsibleSection from "./common/CollapsibleSection";

interface WhatsWorkingProps {
  themeStats: ThemeItem[];
}

export default function WhatsWorking({ themeStats }: WhatsWorkingProps) {
  const [showAll, setShowAll] = useState(false);

  const workingThemes = themeStats
    .filter((t) => t.count > 0 && (t.posPercent || 0) >= 35)
    .sort((a, b) => b.count - a.count);

  const hurtingThemes = themeStats
    .filter((t) => t.count > 0 && (t.negPercent || 0) >= 20)
    .sort((a, b) => (b.negPercent || 0) - (a.negPercent || 0));

  const displayWorking = showAll ? workingThemes : workingThemes.slice(0, 4);
  const displayHurting = showAll ? hurtingThemes : hurtingThemes.slice(0, 4);

  return (
    <CollapsibleSection
      title="What's Working / What's Hurting"
      subtitle="Top positive drivers and audience friction points extracted from verified commentary."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: WHAT'S WORKING */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#4ade80] uppercase tracking-wider">
              <ThumbsUp className="h-4 w-4" />
              <span>What's Working</span>
            </div>

            {displayWorking.length === 0 ? (
              <Card className="p-6 text-center text-zinc-500 text-xs italic">
                Awaiting positive audience themes...
              </Card>
            ) : (
              <div className="space-y-3">
                {displayWorking.map((theme) => {
                  const pos = theme.posPercent || 0;
                  const formattedName = theme.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

                  return (
                    <Card key={theme.name} className="p-4 bg-[#161619] border-[#28282c] hover:border-zinc-700 transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-zinc-100">{formattedName}</h4>
                          <span className="text-xs text-zinc-400 font-medium block">
                            {theme.count.toLocaleString()} audience reactions
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold font-mono text-[#4ade80] block">
                            +{pos}%
                          </span>
                          <span className="text-[11px] text-zinc-400">Positive</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 2: WHAT'S HURTING */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4" />
              <span>What's Hurting</span>
            </div>

            {displayHurting.length === 0 ? (
              <Card className="p-6 text-center text-zinc-500 text-xs italic">
                No significant critical friction detected.
              </Card>
            ) : (
              <div className="space-y-3">
                {displayHurting.map((theme) => {
                  const neg = theme.negPercent || 0;
                  const formattedName = theme.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

                  return (
                    <Card key={theme.name} className="p-4 bg-[#161619] border-[#28282c] hover:border-zinc-700 transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-zinc-100">{formattedName}</h4>
                          <span className="text-xs text-zinc-400 font-medium block">
                            {theme.count.toLocaleString()} audience reactions
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold font-mono text-rose-400 block">
                            -{neg}%
                          </span>
                          <span className="text-[11px] text-zinc-400">Critical</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* View All / Collapse Button */}
        {(workingThemes.length > 4 || hurtingThemes.length > 4) && (
          <div className="text-center pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              rightIcon={showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            >
              {showAll ? "Show Less" : "View All Topics"}
            </Button>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
