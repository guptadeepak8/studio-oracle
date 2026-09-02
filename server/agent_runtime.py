"""
Agent Runtime shim (points to services.decision_service).
Preserved for backwards compatibility.
"""
from services.decision_service import DecisionService

class CampaignAgentRuntime:
    @staticmethod
    def run_investigation(content_id: str):
        return DecisionService.get_or_investigate_decisions(content_id)
