from google.adk.tools import FunctionTool
from services.search_service import GoogleSearchService

def ground_campaign_with_google_search(content_id: str, search_query: str = None) -> str:
    """
    Perform real-time Google Search Grounding to pull live trade press reactions, critic reviews,
    and box-office projections for an entertainment campaign into ClickHouse.
    
    Args:
        content_id: The campaign UUID in ClickHouse.
        search_query: Optional custom search query (e.g. 'Gladiator II box office projections Variety').
        
    Returns:
        Summary of grounded press insights ingested into ClickHouse.
    """
    res = GoogleSearchService.search_and_ground_campaign(content_id, search_query)
    return f"Successfully grounded {res.get('ingested_insights', 0)} Google Search industry reviews into ClickHouse for campaign '{content_id}'."

google_search_grounding_tool = FunctionTool(ground_campaign_with_google_search)
