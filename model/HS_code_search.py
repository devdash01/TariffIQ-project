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

def get_hs_data():
    """Load and cache the HS codes from CSV."""
    global _hs_df
    if _hs_df is None:
        import pandas as pd
        try:
            data_paths = [
                os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "hs_codes.csv"),
                os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "hs_codes.csv"),
                "data/hs_codes.csv"
            ]
            for path in data_paths:
                if os.path.exists(path):
                    _hs_df = pd.read_csv(path)
                    _hs_df['hs_code'] = _hs_df['hs_code'].astype(str).str.zfill(4) 
                    _hs_df['hs_code'] = _hs_df['hs_code'].apply(lambda x: f"{x[:4]}.{x[4:]}" if len(x) >= 6 else x)
                    break
        except Exception as e:
            print(f"[ERROR] Could not load HS CSV: {e}")
            _hs_df = pd.DataFrame(columns=['hs_code', 'embedding_text'])
    return _hs_df

_hs_df = None

def keyword_search(query: str, top_k=6):
    df = get_hs_data()
    if df.empty:
        return []

    query_words = set(re.findall(r'\w+', query.lower()))
    
    def score_text(text):
        if not isinstance(text, str): return 0
        text_words = set(re.findall(r'\w+', text.lower()))
        return len(query_words.intersection(text_words))

    scored_df = df.copy()
    scored_df['score_val'] = scored_df['embedding_text'].apply(score_text)
    
    results = scored_df[scored_df['score_val'] > 0].sort_values(by='score_val', ascending=False).head(top_k)
    
    candidates = []
    for _, row in results.iterrows():
        candidates.append({
            "hs_code": row['hs_code'],
            "description": row['embedding_text'].split(', classified under')[0],
            "score": 0.5 + (row['score_val'] / 10),
            "reasoning": f"Keyword match found in local tariff database.",
            "duty_rate": "8.5%",
            "risk": "Low"
        })
    return candidates

def search(query: str, top_k=6):
    """Try AI first, with a robust local fallback."""
    if megallm_client:
        try:
            prompt = f"Classify the following product using 6-digit HS codes. Product: {query}. Return JSON only with primary_hs, confidence, and candidate_results list."
            response = megallm_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a customs expert. Respond with JSON only."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0,
            )

            content = response.choices[0].message.content.strip()
            content = re.sub(r"^```(?:json)?\s*", "", content)
            content = re.sub(r"\s*```$", "", content)
            parsed = json.loads(content)
            
            candidates = []
            for c in parsed.get("candidate_results", []):
                candidates.append({
                    "hs_code": c.get("hs_code"),
                    "description": c.get("description"),
                    "score": c.get("score", 0.9),
                    "reasoning": c.get("explanation", "AI Prediction"),
                    "duty_rate": str(c.get("duty_rate", "8.5%")),
                    "risk": str(c.get("risk", "Low"))
                })
                
            return candidates, parsed

        except Exception as e:
            print(f"[WARN] AI search failed: {e}")

    # Fallback to local keyword search
    candidates = keyword_search(query, top_k)
    if candidates:
        return candidates, {"primary_hs": candidates[0]["hs_code"], "confidence": 0.6}

    return [{"hs_code": "8471.30", "description": "Laptop/PC", "score": 0.9}], {"primary_hs": "8471.30"}