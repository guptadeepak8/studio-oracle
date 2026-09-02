"use client";

import {
  useCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignStatusMutation,
  useDeleteCampaignMutation,
} from "./queries/useCampaignsQueries";

export interface CreateCampaignPayload {
  title: string;
  content_type?: string;
  description?: string;
  release_date?: string | null;
  target_terms: string[];
  sync_mode?: string;
  initial_volume?: number;
}

export function useCampaigns() {
  const { data: campaigns = [], isLoading, refetch } = useCampaignsQuery();
  const createMutation = useCreateCampaignMutation();
  const updateStatusMutation = useUpdateCampaignStatusMutation();
  const deleteMutation = useDeleteCampaignMutation();

  const createCampaign = async (payload: CreateCampaignPayload): Promise<string | null> => {
    try {
      const res = await createMutation.mutateAsync(payload);
      return res.content_id;
    } catch {
      return null;
    }
  };

  const updateStatus = async (
    contentId: string,
    nextStatus: "active" | "stopped",
    title?: string
  ): Promise<boolean> => {
    try {
      await updateStatusMutation.mutateAsync({ contentId, status: nextStatus, title });
      return true;
    } catch {
      return false;
    }
  };

  const deleteCampaign = async (contentId: string, title?: string): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync({ contentId, title });
      return true;
    } catch {
      return false;
    }
  };

  return {
    campaigns,
    isLoading,
    isCreating: createMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refreshCampaigns: refetch,
    createCampaign,
    updateStatus,
    deleteCampaign,
  };
}
