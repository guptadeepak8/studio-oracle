"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "../utils/constants";
import { campaignDetailKeys } from "./queries/useCampaignDetailQueries";

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

    es.addEventListener("INGESTION_COMPLETED", () => {
      // Silently refresh all queries for this campaign without layout shifts or toasts
      queryClient.invalidateQueries({ queryKey: campaignDetailKeys.all(campaignId) });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    });

    es.addEventListener("DECISIONS_UPDATED", () => {
      // Silently update deliverables
      queryClient.invalidateQueries({ queryKey: campaignDetailKeys.decisions(campaignId) });
      queryClient.invalidateQueries({ queryKey: campaignDetailKeys.analytics(campaignId) });
    });

    es.addEventListener("INGESTION_STARTED", () => {
      // Silent
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
