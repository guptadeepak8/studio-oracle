"""
Detector shim (points to services.detector_service).
Preserved for backwards compatibility.
"""
from services.detector_service import DetectorService

detect_campaign_signals = DetectorService.detect_campaign_signals
