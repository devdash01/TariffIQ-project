import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

MEGALLM_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("MEGALLM_API_KEY")
MEGALLM_BASE_URL = "https://api.groq.com/openai/v1" if os.getenv("GROQ_API_KEY") else None

megallm_client = None
if MEGALLM_API_KEY:
    try:
        from openai import OpenAI
        megallm_client = OpenAI(api_key=MEGALLM_API_KEY, base_url=MEGALLM_BASE_URL)
    except Exception as e:
        print(f"[WARN] AI client init failed: {e}")

def load_index():
    pass

def load_resources():
    pass

_hs_df = None

def get_hs_data():
    """Load and cache the HS codes from CSV."""
    global _hs_df
    if _hs_df is None:
        import pandas as pd
        try:
            # Look for the file in the parent's data directory (normal execution)
            # or in the data directory (local execution)
            data_paths = [
                os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "hs_codes.csv"),
                os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "hs_codes.csv"),
                "data/hs_codes.csv"
            ]
            for path in data_paths:
                if os.path.exists(path):
                    _hs_df = pd.read_csv(path)
                    # Ensure hs_code is string and padded to 6 chars if needed
                    _hs_df['hs_code'] = _hs_df['hs_code'].astype(str).str.zfill(4) 
                    # Add a dot for consistency if it's 6 digits (XXXX.XX)
                    _hs_df['hs_code'] = _hs_df['hs_code'].apply(lambda x: f"{x[:4]}.{x[4:]}" if len(x) >= 6 else x)
                    break
        except Exception as e:
            print(f"[ERROR] Could not load HS CSV: {e}")
            _hs_df = pd.DataFrame(columns=['hs_code', 'embedding_text'])
    return _hs_df

def keyword_search(query: str, top_k=6):
    """
    Perform a simple keyword-based search on the local HS code dataset.
    This is extremely lightweight and works on Render Free Tier (512MB).
    """
    df = get_hs_data()
    if df.empty:
        return []

    # Simple word-overlap scoring
    query_words = set(re.findall(r'\w+', query.lower()))
    
    def score_text(text):
        if not isinstance(text, str): return 0
        text_words = set(re.findall(r'\w+', text.lower()))
        # Count overlapping words, but give higher weight to exact matches in short strings
        overlap = len(query_words.intersection(text_words))
        return overlap

    # Copy and calculate scores
    scored_df = df.copy()
    scored_df['score_val'] = scored_df['embedding_text'].apply(score_text)
    
    # Filter for any overlap and sort
    results = scored_df[scored_df['score_val'] > 0].sort_values(by='score_val', ascending=False).head(top_k)
    
    candidates = []
    for _, row in results.iterrows():
        candidates.append({
            "hs_code": row['hs_code'],
            "description": row['embedding_text'].split(', classified under')[0], # Clean up the text for UI
            "score": 0.5 + (row['score_val'] / 10), # Pseudo-score
            "reasoning": f"Keyword match for '{query}' found in local tariff database.",
            "duty_rate": "8.5%", # Default placeholder for demo
            "risk": "Low"
        })
    return candidates

def search(query: str, top_k=6):
    """
    Try LLM-based HS classification first, with a robust local keyword fallback.
    """
    # 1. Try LLM if client is available
    if megallm_client:
        try:
            prompt = f"""
You are a licensed customs broker and WCO-certified HS Code specialist with 20 years of experience.

Your job: Classify the product below using the OFFICIAL Harmonized System (HS) nomenclature.
You MUST use real, valid 6-digit HS codes from the actual WCO tariff schedule.

Product description:
"{query}"

MANDATORY RULES:
1. Use ONLY real, valid HS codes that exist in the WCO Harmonized System.
2. The primary_hs MUST be the single best 6-digit code for this product.
3. Apply WCO General Rules of Interpretation (GRI 1 through 6).
4. Base classification on: material composition, primary function, end-use, and processing stage.
5. Provide exactly {top_k} candidates ordered by confidence (best first).
6. HS codes should be formatted as "XXXX.XX" (e.g. "6109.10" for knitted cotton t-shirts).

Return STRICTLY VALID JSON only — no markdown, no explanations outside the JSON object:
{{
  "primary_hs": "XXXX.XX",
  "confidence": 0.95,
  "analysis": {{
    "composition_or_material_analysis": "string",
    "functional_or_processing_analysis": "string",
    "exclusion_of_alternatives": "string",
    "information_gaps": "string",
    "final_justification": "string"
  }},
  "candidate_results": [
    {{
      "hs_code": "XXXX.XX",
      "description": "Official HS chapter/heading description",
      "score": 0.95,
      "explanation": "Why this specific code applies under GRI rules.",
      "duty_rate": "X.X%",
      "risk": "Low | Medium | High"
    }}
  ]
}}
"""
            response = megallm_client.chat.completions.create(
                model="llama-3.3-70b-versatile" if os.getenv("GROQ_API_KEY") else "gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a customs classification expert. Respond with valid JSON only."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0,
            )

            content = response.choices[0].message.content.strip()
            # Clean JSON formatting if LLM added blocks
            content = re.sub(r"^```(?:json)?\s*", "", content)
            content = re.sub(r"\s*```$", "", content)

            parsed = json.loads(content)
            
            candidates = []
            for c in parsed.get("candidate_results", []):
                candidates.append({
                    "hs_code": c.get("hs_code"),
                    "description": c.get("description"),
                    "score": c.get("score"),
                    "reasoning": c.get("explanation"),
                    "duty_rate": str(c.get("duty_rate", "Unknown")),
                    "risk": str(c.get("risk", "Medium"))
                })
                
            return candidates, parsed

        except Exception as e:
            print(f"[WARN] LLM Classification failed: {e}. Falling back to keyword search.")

    # 2. Local Keyword Fallback (if LLM fails OR no API key)
    candidates = keyword_search(query, top_k)
    
    if candidates:
        return candidates, {
            "primary_hs": candidates[0]["hs_code"],
            "confidence": 0.65,
            "analysis": {
                "final_justification": f"System matched query keywords against the local HS nomenclature database because the AI sub-processor is in offline/demo mode."
            }
        }

    # 3. Last resort hardcoded mock (only if keyword search even fails)
    mock_candidates = [
        {"hs_code": "8471.30", "description": "Portable automatic data processing machines", "score": 0.9, "reasoning": "Fallback match: Data processing (API and Local search failed)."},
        {"hs_code": "8517.12", "description": "Telephones for cellular networks", "score": 0.8, "reasoning": "Fallback match: Communication devices."}
    ]
    return mock_candidates, {"primary_hs": "8471.30"}

if __name__ == "__main__":
    c_list, data = search("Cotton T-Shirts, knitted")
    print(json.dumps(data, indent=2))
