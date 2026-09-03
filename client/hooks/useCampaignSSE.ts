"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "../utils/constants";
import { campaignDetailKeys } from "./queries/useCampaignDetailQueries";
import { toast } from "sonner";

export interface SSEEventPayload {
  event: string;
  campaign_id: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export function useCampaignSSE(campaignId?: string) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!campaignId) return;

    const streamUrl = `${API_BASE_URL}/api/campaigns/${campaignId}/stream`;
    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      // Live stream connected
    };

    es.addEventListener("INGESTION_COMPLETED", (e) => {
      try {
        const payload: SSEEventPayload = JSON.parse(e.data);
        const count = payload.data?.ingested_comments || 1000;
        toast.success(`Telemetry updated: ${count.toLocaleString()} comments indexed.`);
      } catch {
        toast.success("Telemetry synchronized with ClickHouse.");
      }

      // Automatically refresh all queries for this campaign without page reload
      queryClient.invalidateQueries({ queryKey: campaignDetailKeys.all(campaignId) });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    });

    es.addEventListener("DECISIONS_UPDATED", () => {
      toast.success("Marketing recommendations updated.");
      queryClient.invalidateQueries({ queryKey: campaignDetailKeys.decisions(campaignId) });
      queryClient.invalidateQueries({ queryKey: campaignDetailKeys.analytics(campaignId) });
    });

    es.addEventListener("INGESTION_STARTED", () => {
      toast.info("Ingestion started for trailer comments...");
    });

    es.onerror = () => {
      // Handled by browser automatic reconnect
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [campaignId, queryClient]);
}
