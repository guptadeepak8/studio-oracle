import os
from google.adk.tools import FunctionTool
from google import genai
from google.genai import types
from ingestion.youtube import get_clickhouse_client

def analyze_visual_alignment(content_id: str, visual_concept_or_url: str = "Colosseum gladiatorial arena battle scene in golden hour lighting") -> dict:
    """
    Analyze the visual alignment between marketing keyframes/posters and audience sentiment from ClickHouse.
    
    Args:
        content_id: Campaign content UUID.
        visual_concept_or_url: Description or URL of the visual keyframe/poster asset being analyzed.
        
    Returns:
        A dictionary evaluating visual tone, target resonance, and alignment with audience sentiment.
    """
    client = get_clickhouse_client()
    
    # Query top audience themes and sentiment
    query = f"""
    SELECT topic, count() as total,
           countIf(topic_sentiments[topic] = 'positive') as pos_c,
           countIf(topic_sentiments[topic] = 'negative') as neg_c
    FROM studio_oracle.audience_comments
    ARRAY JOIN topics AS topic
    WHERE content_id = '{content_id}'
    GROUP BY topic ORDER BY total DESC LIMIT 4
    """
    rows = client.query(query).result_rows
    
    top_topics_str = ", ".join([f"{r[0]} ({r[1]} mentions, {round((r[2]/max(1, r[1]))*100)}% pos)" for r in rows]) if rows else "No telemetry recorded"
    
    try:
        genai_client = genai.Client(vertexai=True)
        prompt = (
            f"You are an entertainment marketing visual analyst. Evaluate visual alignment for a campaign.\n"
            f"Visual Asset Details: {visual_concept_or_url}\n"
            f"ClickHouse Audience Reception Signals: {top_topics_str}\n\n"
            f"Provide a brief evaluation: 1) Visual Mood & Tone, 2) Resonance with Audience Expectations, 3) Recommended Visual Refinements."
        )
        res = genai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="Provide concise, high-impact marketing visual analysis without bulleted boilerplate."
            )
        )
        analysis_text = res.text.strip()
        status = "success"
    except Exception as e:
        analysis_text = "UNKNOWN - Multimodal visual alignment analysis could not be completed at this time."
        status = "unavailable"

    return {
        "status": status,
        "content_id": content_id,
        "visual_asset": visual_concept_or_url,
        "audience_context": top_topics_str,
        "alignment_evaluation": analysis_text
    }

analyze_visual_alignment_tool = FunctionTool(analyze_visual_alignment)

