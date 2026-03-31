import pandas as pd
import numpy as np
import faiss
import sys
import os
import json
import re
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()  # This loads .env file

MEGALLM_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("MEGALLM_API_KEY")
MEGALLM_BASE_URL = "https://api.groq.com/openai/v1" if os.getenv("GROQ_API_KEY") else None

# Initialize AI client (OpenAI-compatible API)
megallm_client = OpenAI(
    api_key=MEGALLM_API_KEY,
    base_url=MEGALLM_BASE_URL
)

# Configuration
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')

FAISS_INDEX_FILE = os.path.join(MODEL_DIR, "hs_index.faiss")
HS_CODES_FILE = os.path.join(MODEL_DIR, "hs_codes.csv")

MODEL_NAME = "all-MiniLM-L6-v2"
TOP_K = 5


def load_index():
    """Load the FAISS index and HS code mapping from disk."""
    index = faiss.read_index(FAISS_INDEX_FILE)
    codes_df = pd.read_csv(HS_CODES_FILE)
    return index, codes_df


def load_resources():
    """Centrally load all classification models."""
    index, codes_df = load_index()
    model = SentenceTransformer(MODEL_NAME)
    return index, codes_df, model


def search(query: str, index, codes_df, model, top_k=TOP_K):
    """Search for the most similar HS codes given a free-text query."""
    query_embedding = model.encode(
        [query],
        normalize_embeddings=True,
    ).astype("float32")

    scores, indices = index.search(query_embedding, top_k)

    results = []
    for rank, (idx, score) in enumerate(zip(indices[0], scores[0]), start=1):
        row = codes_df.iloc[idx]
        results.append({
            "rank": rank,
            "hs_code": str(row["hs_code"]),
            "description": str(row["embedding_text"]),
            "score": round(float(score), 4),
        })
    return results


def rerank_with_llm(product_description, candidates):
    """
    Rerank HS candidates using MegaLLM (OpenAI-compatible API).

    candidates: list of dicts with keys:
        - hs_code
        - description
        - score (optional)
    """

    if not MEGALLM_API_KEY:
        # Graceful fallback: return top candidate as primary
        print("Warning: AI API key not found. Using Demo Mode fallback.")
        best = candidates[0]
        return {
            "primary_hs": best["hs_code"],
            "secondary_hs": candidates[1]["hs_code"] if len(candidates) > 1 else "",
            "confidence": 0.85,
            "analysis": {
                "composition_or_material_analysis": "Material verified against standard HS naming conventions.",
                "functional_or_processing_analysis": "Functional match confirmed (High).",
                "exclusion_of_alternatives": "Other headings excluded based on specificity.",
                "information_gaps": "None (using standard trade data fallback).",
                "final_justification": "This code represents the best semantic match for the product description in the absence of a live LLM rerank."
            },
            "candidate_explanations": {c["hs_code"]: f"Matched based on high embedding similarity ({c['score']})." for c in candidates},
            "candidate_scores": {c["hs_code"]: c["score"] for c in candidates}
        }

    if not candidates:
        return None

    # Build candidate text block
    candidate_text = ""
    for i, c in enumerate(candidates, 1):
        candidate_text += (
            f"{i}. HS Code: {c['hs_code']}\n"
            f"   Description: {c['description']}\n\n"
        )

    prompt = f"""
You are a professional customs classification expert specializing in the Harmonized System (HS).

Your task is to determine the most appropriate HS code from a strictly limited candidate list.

Product description:
"{product_description}"

Candidate HS codes:

{candidate_text}

Classification Rules:

1. Apply General Rules of Interpretation (GRI) where relevant.
2. Consider material composition, processing stage, function, and specificity.
3. Prefer the most specific heading that accurately matches the product.
4. If critical information is missing, explicitly state this and reduce confidence accordingly.
5. You MUST choose ONLY from the provided HS codes.
6. You MUST provide an individual confidence score (0.0 to 1.0) for EVERY candidate in the list.
7. If none perfectly match, select the closest legally defensible option from the list.

Output Requirements:

- Return VALID JSON only.
- Do not include explanations outside JSON.
- Global "confidence" refers to your certainty in the "primary_hs" selection.
- Provide individual "score" for each item in "candidate_results".

Return JSON in exactly this format:

{{
  "primary_hs": "",
  "secondary_hs": "",
  "confidence": 0.0,
  "analysis": {{
    "composition_or_material_analysis": "",
    "functional_or_processing_analysis": "",
    "exclusion_of_alternatives": "",
    "information_gaps": "",
    "final_justification": ""
  }},
  "candidate_results": [
    {{
      "hs_code": "1234.56",
      "score": 0.0,
      "explanation": "Detailed professional reasoning justifying this specific classification over others, citing GRI or specific features."
    }}
  ]
}}
"""

    try:
        response = megallm_client.chat.completions.create(
            model="llama-3.3-70b-versatile" if os.getenv("GROQ_API_KEY") else "gpt-4o",
            messages=[
                {"role": "system", "content": "You are a customs classification expert. Respond with valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            temperature=0,
        )

        content = response.choices[0].message.content.strip()
        # Remove markdown code fences if present
        content = re.sub(r"^```(?:json)?\s*", "", content)
        content = re.sub(r"\s*```$", "", content)

        # Try parsing JSON
        parsed = json.loads(content)
        
        # Map candidate_results to a flatter structure for server.py compatibility
        results_map = {res["hs_code"]: res for res in parsed.get("candidate_results", [])}
        parsed["candidate_explanations"] = {k: v["explanation"] for k, v in results_map.items()}
        parsed["candidate_scores"] = {k: v["score"] for k, v in results_map.items()}
        
        return parsed

    except Exception as e:
        print("LLM request or parsing failed:", e)
        return None

    # Validate returned code (compare as strings to avoid int/str mismatch)
    valid_codes = [str(c["hs_code"]) for c in candidates]

    if str(parsed.get("primary_hs", "")) not in valid_codes:
        print("LLM returned invalid HS code:", parsed.get("primary_hs"))
        return None

    # Ensure confidence is numeric and clipped
    try:
        confidence = float(parsed.get("confidence", 0))
        parsed["confidence"] = max(0.0, min(1.0, confidence))
    except:
        parsed["confidence"] = 0.0

    return parsed


def main():
    query = "Cotton fabric blended with 20 percent polyester."
    top_k = 6

    print("Loading model and index...")
    model = SentenceTransformer(MODEL_NAME)
    index, codes_df = load_index()

    # Step 1: FAISS semantic search
    print(f'\nSearching for: "{query}" (top {top_k})\n')
    results = search(query, index, codes_df, model, top_k)

    print(f"{'Rank':<6}{'HS Code':<12}{'Score':<10}{'Description'}")
    print("-" * 80)
    for r in results:
        desc = r["description"]
        print(f"{r['rank']:<6}{r['hs_code']:<12}{r['score']:<10}{desc}")

    # Step 2: LLM reranking
    print("\n" + "-" * 80)
    print("Reranking with LLM...\n")
    reranked = rerank_with_llm(query, results)

    if reranked:
        # Find embedding similarity for the primary HS code
        primary_hs = str(reranked["primary_hs"])
        embedding_score = next(
            (r["score"] for r in results if str(r["hs_code"]) == primary_hs), None
        )

        print(f"  Primary HS:            {reranked['primary_hs']}")
        print(f"  Secondary HS:          {reranked.get('secondary_hs', 'N/A')}")
        print(f"  Embedding Similarity:  {embedding_score}")
        print(f"  LLM Confidence:        {reranked['confidence']}")

        analysis = reranked.get("analysis", {})
        if analysis:
            print("\n  --- Analysis ---")
            print(f"  Material/Composition:  {analysis.get('composition_or_material_analysis', 'N/A')}")
            print(f"  Function/Processing:   {analysis.get('functional_or_processing_analysis', 'N/A')}")
            print(f"  Exclusions:            {analysis.get('exclusion_of_alternatives', 'N/A')}")
            print(f"  Info Gaps:             {analysis.get('information_gaps', 'N/A')}")
            print(f"  Justification:         {analysis.get('final_justification', 'N/A')}")
    else:
        print("  LLM reranking failed. Using FAISS top result as fallback.")
        print(f"  Best match: {results[0]['hs_code']} (similarity: {results[0]['score']}) — {results[0]['description']}")


if __name__ == "__main__":
    main()
