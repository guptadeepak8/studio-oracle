import time
from typing import Any, Optional, Dict, Tuple

_QUERY_CACHE: Dict[str, Tuple[float, Any]] = {}

def get_cached(key: str, ttl_seconds: float = 15.0) -> Optional[Any]:
    if key in _QUERY_CACHE:
        timestamp, val = _QUERY_CACHE[key]
        if time.time() - timestamp < ttl_seconds:
            return val
    return None

def set_cached(key: str, val: Any) -> None:
    _QUERY_CACHE[key] = (time.time(), val)

def invalidate_cache(pattern_or_id: Optional[str] = None) -> None:
    global _QUERY_CACHE
    if pattern_or_id:
        keys_to_remove = [k for k in _QUERY_CACHE if pattern_or_id in k]
        for k in keys_to_remove:
            _QUERY_CACHE.pop(k, None)
    else:
        _QUERY_CACHE.clear()
