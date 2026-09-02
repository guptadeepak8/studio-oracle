"""
Database & Persistence layer shim (points to services.campaign_service and core.database).
Preserved for backwards compatibility with any legacy imports.
"""
from core.database import get_clickhouse_client, get_sqlite_connection, init_sqlite_db
from core.cache import get_cached, set_cached, invalidate_cache
from services.campaign_service import CampaignService

# Re-export functions
get_campaign_status = CampaignService.get_status
set_campaign_status = CampaignService.set_status
delete_campaign_records = CampaignService.delete_campaign
fetch_movies = CampaignService.get_all_campaigns
fetch_movie_by_id = CampaignService.get_campaign_by_id
fetch_comments = CampaignService.get_comments
fetch_comment_detail = CampaignService.get_comment_detail
fetch_campaign_analytics = CampaignService.get_analytics
fetch_platform_breakdown = CampaignService.get_platform_breakdown
fetch_campaign_drops = CampaignService.get_drops
fetch_campaign_timeline = CampaignService.get_timeline
invalidate_campaign_cache = invalidate_cache
