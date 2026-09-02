"use client";

import React, { useState } from "react";
import { RefreshCw, MessageCircle } from "lucide-react";
import { API_BASE_URL } from "../utils/constants";
import { toast } from "sonner";
import { Card, Button, Input, Select, Badge } from "./ui";
import CollapsibleSection from "./common/CollapsibleSection";

interface IngestConfigProps {
  campaignId: string;
  ingestQuery: string;
  setIngestQuery: (query: string) => void;
  ingestLimit: number;
  setIngestLimit: (limit: number) => void;
  maxComments: number;
  setMaxComments: (count: number) => void;
  isIngesting: boolean;
  onTriggerIngest: () => void;
  onRefreshAll: () => void;
}

export default function IngestConfig({
  campaignId,
  ingestQuery,
  setIngestQuery,
  ingestLimit,
  setIngestLimit,
  maxComments,
  setMaxComments,
  isIngesting,
  onTriggerIngest,
  onRefreshAll,
}: IngestConfigProps) {
  const [isIngestingReddit, setIsIngestingReddit] = useState(false);
  const [syncSchedule, setSyncSchedule] = useState("1hr");

  const handleTriggerReddit = async () => {
    setIsIngestingReddit(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/campaigns/${campaignId}/ingest-reddit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: ingestQuery }),
      });
      if (res.ok) {
        const data = await res.json();
        onRefreshAll();
        toast.success(data.message || "Successfully synced Reddit community discussions!");
      } else {
        toast.error("Failed to sync Reddit discussions. Ensure tracking is active.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error syncing Reddit discussions.");
    } finally {
      setIsIngestingReddit(false);
    }
  };

  return (
    <CollapsibleSection
      title="Live Audience Feedback Sync · YouTube & Reddit"
      subtitle="Automated background syncing and on-demand comment fetching from official YouTube trailers and Reddit discussion threads."
      headerAction={
        <Badge variant="active" pulsing>
          Auto-Sync: {syncSchedule === "1hr" ? "Every 1 Hour" : syncSchedule === "6hr" ? "Every 6 Hours" : syncSchedule === "24hr" ? "Every 24 Hours" : "Manual Only"}
        </Badge>
      }
    >
      <Card className="p-6 space-y-5">
        {/* Form Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          {/* Search Query / Trailer Target */}
          <div className="md:col-span-2">
            <Input
              label="Search Query or YouTube Trailer URL"
              value={ingestQuery}
              onChange={(e) => setIngestQuery(e.target.value)}
              placeholder="e.g. Wicked 2024 Official Trailer or https://www.youtube.com/watch?v=..."
            />
          </div>

          {/* Batch Volume */}
          <div>
            <Select
              label="Comment Volume / Depth"
              value={maxComments}
              onChange={(e) => setMaxComments(parseInt(e.target.value))}
              options={[
                { value: 100, label: "100 Comments (Fast)" },
                { value: 250, label: "250 Comments" },
                { value: 500, label: "500 Comments" },
                { value: 1000, label: "1,000 Comments (Recommended)" },
                { value: 2500, label: "2,500 Comments (Deep Sync)" },
              ]}
            />
          </div>

          {/* Auto-Sync Schedule */}
          <div>
            <Select
              label="Auto-Sync Interval"
              value={syncSchedule}
              onChange={(e) => setSyncSchedule(e.target.value)}
              options={[
                { value: "1hr", label: "Every 1 Hour (Active)" },
                { value: "6hr", label: "Every 6 Hours" },
                { value: "24hr", label: "Every 24 Hours" },
                { value: "manual", label: "Manual Sync Only" },
              ]}
            />
          </div>
        </div>

        {/* Action Buttons & Telemetry Feeds */}
        <div className="pt-4 border-t border-[#28282b] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 text-xs text-zinc-300">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-[#4ade80]" />
              <span>YouTube Data API v3 Connected</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-[#4ade80]" />
              <span>Reddit Discussions Feed Connected</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Sync Reddit Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTriggerReddit}
              isLoading={isIngestingReddit}
              disabled={isIngesting || isIngestingReddit}
              leftIcon={<MessageCircle className="h-3.5 w-3.5 text-orange-400" />}
            >
              Sync Reddit Feedback
            </Button>

            {/* Sync YouTube Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={onTriggerIngest}
              isLoading={isIngesting}
              disabled={isIngesting || isIngestingReddit}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Fetch YouTube Batch
            </Button>
          </div>
        </div>
      </Card>
    </CollapsibleSection>
  );
}
