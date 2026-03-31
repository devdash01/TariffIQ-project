"""
TariffIQ — AI Compliance Agent
================================
Uses the Tavily API to search the web for real-time compliance
and regulatory checks for a given product and country.
Then uses MegaLLM to synthesize and extract a structured checklist.

Usage (standalone demo):
    conda run -n tarrifiq python model/compliance_agent.py
"""

import os
import json
import re

from dotenv import load_dotenv
from openai import OpenAI
from tavily import TavilyClient

load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILLY_API_KEY")
MEGALLM_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("MEGALLM_API_KEY")
MEGALLM_BASE_URL = "https://api.groq.com/openai/v1" if os.getenv("GROQ_API_KEY") else None

megallm_client = OpenAI(
    api_key=MEGALLM_API_KEY,
    base_url=MEGALLM_BASE_URL
)


def _compress_compliance_query(country: str, product_desc: str) -> str:
    """
    If the product description is long, use MegaLLM to compress it into
    a search-optimized query under 300 characters for Tavily.
    """
    if len(product_desc) < 100:
        return (
            f"Import compliance regulatory requirements certification "
            f"for {product_desc} in {country} "
            f"customs rules safety standards labeling requirements"
        )
        
    try:
        prompt = f"""
        Extract the core product name and essential technical specifications from this description 
        to create a highly effective search query for trade compliance and import regulations.
        
        Product Description: {product_desc}
        Destination Country: {country}
        
        Rules:
        - Return ONLY the optimized query string.
        - The query MUST be under 250 characters.
        - Focus on keywords like 'import requirements', 'regulations', 'standards'.
        """
        
        response = megallm_client.chat.completions.create(
            model="llama-3.3-70b-versatile" if os.getenv("GROQ_API_KEY") else "gpt-4o",
            messages=[
                {"role": "system", "content": "You are a trade compliance search expert. Output ONLY the optimized search query."},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )
        optimized_query = response.choices[0].message.content.strip()
        # Clean up any potential LLM output artifacts
        optimized_query = optimized_query.replace('"', '').replace("'", "")
        
        print(f"✨ Optimized query for Tavily: '{optimized_query[:100]}...'")
        return optimized_query
        
    except Exception as e:
        print(f"Failed to compress compliance query: {e}")
        # Fallback: simple truncation with keywords
        return f"Import compliance {product_desc[:150]} in {country} regulations"


def search_compliance_info(country: str, product_desc: str) -> str:
    """
    Search the web using Tavily for compliance, regulatory, 
    and certification requirements for the given product & country.
    """
    if not TAVILY_API_KEY:
        raise ValueError("TAVILLY_API_KEY not found. Add it to your .env file.")

    client = TavilyClient(api_key=TAVILY_API_KEY)
    
    query = _compress_compliance_query(country, product_desc)
    
    try:
        # We use 'search' with search_depth='advanced' for high-quality results
        response = client.search(
            query=query, 
            search_depth="advanced",
            max_results=5,
            include_answer=True
        )
        
        # Combine the synthetic answer and the snippets from top results
        context = []
        if response.get("answer"):
            context.append(f"Summary: {response['answer']}")
            
        for res in response.get("results", []):
            context.append(f"Source ({res['url']}): {res['content']}")
            
        return "\n\n".join(context)
        
    except Exception as e:
        print(f"Tavily search failed: {e}")
        return ""


def generate_compliance_checklist(country: str, product_desc: str, search_context: str) -> dict | None:
    """
    Pass the Tavily search context to MegaLLM to synthesize a
    structured JSON checklist of actionable compliance requirements.
    """
    if not search_context:
        return None
        
    prompt = f"""
You are a senior global trade compliance officer.

Based on the provided web search context, generate a strict, actionable compliance 
and regulatory checklist for importing the following product into the specified country.

Product: {product_desc}
Destination Country: {country}

WEB SEARCH CONTEXT:
\"\"\"{search_context}\"\"\"

Return VALID JSON only in this exact format:
{{
  "product": "{product_desc}",
  "country": "{country}",
  "risk_level": "Low | Medium | High | Critical",
  "rules_of_origin_evaluation": [
    {{
      "rule_name": "Substantial Transformation | Value Addition Threshold | Manufacturing Process | Certificate Validity",
      "analysis": "Specific analysis of how the product meets or fails this rule",
      "status": "Met | Not Met | Pending"
    }}
  ],
  "compliance_checklist": [
    {{
      "category": "Certifications & Standards | Labelling & Packaging | Customs Documentation | Taxes & Duties | Prohibitions & Restrictions",
      "requirement_title": "Short title of the requirement",
      "description": "Actionable description of what needs to be done",
      "is_mandatory": true/false
    }}
  ],
  "estimated_complexity": "1-10",
  "summary_advice": "Brief summary advice for the importer."
}}

Rules:
- Be highly specific based ONLY on the provided context. If the context does not mention a specific rule, do not invent one.
- Keep descriptions actionable and detailed (at least 2 sentences).
- Generate a comprehensive checklist: try to find at least 5 to 10 distinct requirements across different categories (Certifications, Labelling, Customs, Taxes, Prohibitions).
- Return JSON strictly matching the format above. No other text.
- Return JSON strictly matching the format above. No other text.
"""

    try:
        response = megallm_client.chat.completions.create(
            model="llama-3.3-70b-versatile" if os.getenv("GROQ_API_KEY") else "gpt-4o",
            messages=[
                {"role": "system", "content": "You are a senior global trade compliance officer. Respond with valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            temperature=0,
        )
        
        content = response.choices[0].message.content.strip()
        # Clean up Markdown formatting if any
        content = re.sub(r"^```(?:json)?\s*", "", content)
        content = re.sub(r"\s*```$", "", content)
        
        return json.loads(content)
        
    except json.JSONDecodeError as e:
        print("❌ Invalid JSON returned by MegaLLM:")
        print(f"--- CONTENT START ---\n{content}\n--- CONTENT END ---")
        return None
    except Exception as e:
        print(f"❌ MegaLLM request failed: {e}")
        import traceback
        traceback.print_exc()
        return None


def run_compliance_check(country: str, product_desc: str) -> dict | None:
    """
    Main orchestration function.
    1. Searches web via Tavily
    2. Synthesizes via MegaLLM
    3. Returns structured dict
    """
    print(f"[INFO] Searching the web for {product_desc} compliance in {country}...")
    context = search_compliance_info(country, product_desc)
    
    if not context:
        print("[ERROR] Failed to retrieve web context.")
        return None
        
    # Truncate context to avoid token overflow or excessive synthesis time
    MAX_CHARS = 7000
    if len(context) > MAX_CHARS:
        print(f"[WARN] Truncating context from {len(context)} to {MAX_CHARS} chars.")
        context = context[:MAX_CHARS] + "..."

    print(f"[INFO] Synthesizing {len(context)} characters of context with AI...")
    checklist = generate_compliance_checklist(country, product_desc, context)
    
    return checklist


# ═══════════════════════════════════════════════════════════════════
#  Demo Run
# ═══════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    COUNTRY = "India"
    PRODUCT = "Semiconductor manufacturing equipment (HS 8486.20)"
    
    print("=" * 60)
    print("  TariffIQ — AI Compliance Agent")
    print("=" * 60)
    
    result = run_compliance_check(COUNTRY, PRODUCT)
    
    if result:
        print(f"\n{'━' * 60}")
        print(f"  ✅ COMPLIANCE REPORT: {result['product']} → {result['country']}")
        print(f"{'━' * 60}")
        print(f"  Risk Level : {result.get('risk_level')}")
        print(f"  Complexity : {result.get('estimated_complexity')}/10")
        print(f"  Advice     : {result.get('summary_advice')}")
        print(f"\n  📝 Checklist:")
        
        for i, item in enumerate(result.get('compliance_checklist', []), 1):
            mand = "[MANDATORY]" if item.get('is_mandatory') else "[RECOMMENDED]"
            print(f"    {i}. {mand} {item['category']} - {item['requirement_title']}")
            print(f"       {item['description']}")
            print()
    else:
        print("\n❌ Failed to generate compliance report.")
    
    print("=" * 60)
