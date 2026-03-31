import os
import json
import requests
from dotenv import load_dotenv
from openai import OpenAI
from urllib.parse import urlparse

load_dotenv()

# AI Client Setup (Groq for free / MegaLLM fallback)
MEGALLM_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("MEGALLM_API_KEY")
MEGALLM_BASE_URL = "https://api.groq.com/openai/v1" if os.getenv("GROQ_API_KEY") else None

if MEGALLM_API_KEY:
    megallm_client = OpenAI(
        api_key=MEGALLM_API_KEY,
        base_url=MEGALLM_BASE_URL
    )

# Setup Tavily Client
TAVILY_API_KEY = os.getenv("TAVILLY_API_KEY")
TAVILY_ENDPOINT = "https://api.tavily.com/search"


def _extract_core_product_name(product_desc: str) -> str:
    """
    If the product description is very long (like a full spec sheet or invoice entry),
    extract just the core 2-4 word product name using MegaLLM so Tavily searches work properly.
    """
    if len(product_desc) < 40:
        return product_desc
        
    try:
        response = megallm_client.chat.completions.create(
            model="llama-3.3-70b-versatile" if os.getenv("GROQ_API_KEY") else "gpt-4o",
            messages=[
                {"role": "system", "content": "You are a search query optimizer. Extract the core 2-4 word product name from the following long description. Do not include any adjectives about grade, quality, or use cases. Return ONLY the short product name, nothing else."},
                {"role": "user", "content": product_desc}
            ],
            temperature=0
        )
        core_name = response.choices[0].message.content.strip()
        # Remove any quotes the LLM might have added
        core_name = core_name.replace('"', '').replace("'", "")
        return core_name
    except Exception as e:
        print(f"Failed to extract core product name: {e}")
        # Fallback: just take the first 5 words
        return " ".join(product_desc.split()[:5])

def _extract_root_name(url: str) -> str:
    """
    Extract root company name from URL.
    Example:
    in.dmgmori.com -> dmgmori
    jyoti.co.in -> jyoti
    heiindia.in -> heiindia
    """
    try:
        domain = urlparse(url).netloc.lower()

        if domain.startswith("www."):
            domain = domain[4:]

        parts = domain.split(".")

        # Handle common country TLDs like .co.in
        if len(parts) >= 3 and parts[-2] in ["co", "com", "org", "net"]:
            return parts[-3]

        return parts[-2] if len(parts) >= 2 else parts[0]

    except:
        return url


def _is_probably_vendor(title: str, url: str) -> bool:
    """
    Reject obvious non-vendor content pages.
    """
    blacklist_title = [
        "top", "best", "list", "guide", "blog",
        "manufacturers in", "suppliers in", "top 10"
    ]
    blacklist_url = [
        "/blog/", "/news/", "/article/", "/top-", "/best-"
    ]

    t = title.lower()
    u = url.lower()

    if any(word in t for word in blacklist_title):
        return False

    if any(path in u for path in blacklist_url):
        return False

    if "manufacturers in india" in t:
        return False

    if "machine manufacturers" in t and "top" in t:
        return False

    return True


def discover_vendors(product: str, country: str) -> list[dict]:
    """
    (A) Phase 1: Discover potential vendors using targeted Tavily queries.
    Returns the top 5 unique vendors deduplicated by domain.
    """
    if not TAVILY_API_KEY:
        print("Error: TAVILLY_API_KEY missing.")
        return []

    queries = [
        f"{product} manufacturer in {country}",
        f"{product} supplier {country}"
    ]

    raw_results = []
    for q in queries:
        payload = {
            "api_key": TAVILY_API_KEY,
            "query": q,
            "search_depth": "advanced",
            "include_answer": False,
            "include_images": False,
            "include_raw_content": False,
            "max_results": 3,
            "exclude_domains": [
                "wikipedia.org", "amazon.com", "amazon.in",
                "alibaba.com", "aliexpress.com", "ebay.com",
                "indiamart.com", "tradeindia.com", "justdial.com",
                "tradekey.com", "made-in-china.com", "globalsources.com",
                "medium.com", "linkedin.com", "elephant-cnc.com", "cncyangsen.com"
            ]
        }
        try:
            response = requests.post(TAVILY_ENDPOINT, json=payload, timeout=15)
            response.raise_for_status()
            data = response.json()
            raw_results.extend(data.get("results", []))
        except Exception as e:
            print(f"Discovery search failed for query '{q}': {e}")

    # Deduplicate by domain, limit to top 5
    unique_vendors = []
    seen_domains = set()

    for r in raw_results:
        title = r.get("title", "")
        url = r.get("url", "")
        
        if not _is_probably_vendor(title, url):
            continue
            
        root = _extract_root_name(url)
        
        if root and root not in seen_domains:
            seen_domains.add(root)
            
            clean_name = root.replace("-", " ").title()
            
            vendor = {
                "name": clean_name,
                "website": url,
                "snippet": r.get("content", "")
            }
            unique_vendors.append(vendor)
            
            if len(unique_vendors) >= 2:
                break

    return unique_vendors


def get_tavily_evidence(company: str, product: str) -> str:
    """
    (B) Phase 2: Gather real-world evidence about a company using a combined Tavily query.
    Returns a truncated text string (~4-6k chars) combining the search snippets.
    """
    if not TAVILY_API_KEY:
        return ""

    queries = [
        f'"{company}" "{product}"',
        f'"{company}" reviews OR complaints'
    ]
    
    evidence_text = ""
    for query in queries:
        payload = {
            "api_key": TAVILY_API_KEY,
            "query": query,
            "search_depth": "basic",
            "max_results": 2,
        }

        try:
            response = requests.post(TAVILY_ENDPOINT, json=payload, timeout=10)
            response.raise_for_status()
            results = response.json().get("results", [])
            
            for idx, r in enumerate(results):
                evidence_text += f"\n--- Source: {r.get('url')} ---\n"
                evidence_text += r.get("content", "") + "\n"

        except Exception as e:
            print(f"Evidence search failed for '{company}': {e}")

    # Truncate evidence to roughly 5000 characters
    if len(evidence_text) > 5000:
        evidence_text = evidence_text[:5000] + "...\n[TRUNCATED]"

    return evidence_text


def verify_vendor_with_llm(product: str, country: str, vendor: dict, evidence: str) -> dict:
    """
    (C) Phase 3: Evaluate vendor details and evidence using MegaLLM to generate a strict JSON verdict.
    """
    if not MEGALLM_API_KEY:
        print("Error: MEGALLM_API_KEY missing.")
        return {}

    prompt = f"""
You are an expert procurement and risk analyst. Evaluate the following company based on the provided search evidence.

Product being sourced: "{product}"
Target Country: "{country}"

--- Company Profile ---
Name: {vendor.get('name')}
Website: {vendor.get('website')}
Initial Snippet: {vendor.get('snippet')}

--- Gathered Evidence (Reviews/Mentions) ---
{evidence}
--------------------------------------------

Based strictly on the provided text, evaluate the vendor and return ONLY a valid JSON object matching this exact schema:
{{
  "sells_product": true/false, // Do they actually manufacture or supply the target product?
  "vendor_type": "Manufacturer" | "Distributor" | "Service" | "Unknown", // Best guess at their actual role
  "red_flags": "Brief string summarizing any complaints, bad reviews, or 'None found'",
  "trust_score": 0.0 to 1.0 // Float representing confidence they are a legitimate B2B vendor for this product in the country
}}

CRITICAL INSTRUCTIONS FOR EVALUATION:
1. Be HIGHLY CRITICAL and naturally untrustworthy of the vendor. Look actively for any hints of being a scam, shell company, trading company posing as a factory, or having poor quality/service.
2. If the entity appears to be a blog article, directory listing, or aggregator site rather than an actual company selling products, then set:
   "sells_product": false,
   "vendor_type": "Unknown",
   "trust_score": 0.0
3. IMPORTANT: If the company provides CNC machining services using machines (e.g., precision machining, prototyping, manufacturing parts), but does NOT sell CNC machines themselves, then:
   "sells_product": false,
   "vendor_type": "Service",
   "trust_score": 0.3
4. Deduct trust score heavily for any bad reviews, lack of evidence of actual manufacturing capabilities, or if they appear to just be a marketing site.

Trust score guidelines:
0.9–1.0 = Large OEM with strong evidence + clear product catalog
0.7–0.89 = Established company with direct product listing
0.4–0.69 = Weak evidence or distributor with limited info
0.0–0.39 = Blog, unclear seller, or only service provider

Do not include markdown blocks, backticks, or conversational text. Output raw JSON only.
"""

    try:
        response = megallm_client.chat.completions.create(
            model="llama-3.3-70b-versatile" if os.getenv("GROQ_API_KEY") else "gpt-4o",
            messages=[
                {"role": "system", "content": "You are a strict data extraction AI. Output raw JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )

        content = response.choices[0].message.content.strip()
        
        # Guardrail against markdown blocks
        if content.startswith("```json"): content = content[7:]
        if content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
            
        verdict = json.loads(content.strip())
        return verdict

    except json.JSONDecodeError as e:
        print(f"LLM JSON parsing failed for '{vendor.get('name')}': {e}")
        return {}
    except Exception as e:
        print(f"LLM Verification failed for '{vendor.get('name')}': {e}")
        return {}


def run_pipeline(product: str, country: str) -> list[dict]:
    """
    (D) Phase 4: Orchestrate the Discovery -> Evidence -> Verification pipeline.
    """
    core_product = _extract_core_product_name(product)
    if core_product != product:
        print(f"[INFO] Extracted core product for search: '{core_product}'")
        
    print(f"[INFO] [Phase 1] Discovering top vendors for '{core_product}' in {country}...")
    vendors = discover_vendors(core_product, country)
    
    if not vendors:
        print("[ERROR] No vendors discovered.")
        return []

    print(f"[INFO] Discovered {len(vendors)} unique vendors. Gathering evidence and evaluating...")

    final_list = []
    
    for i, v in enumerate(vendors):
        company_name = v.get("name", "Unknown Company")
        print(f"\n   [{i+1}/{len(vendors)}] Evaluating: {company_name}")
        
        # Gather deep evidence using the core product name
        evidence = get_tavily_evidence(company=company_name, product=core_product)
        
        if not evidence.strip():
            v["verification"] = {"error": "No external evidence found."}
            final_list.append(v)
            continue
            
        # Verify with LLM
        verdict = verify_vendor_with_llm(product, country, vendor=v, evidence=evidence)
        
        # Attach verdict
        if verdict:
            v.update(verdict)
        else:
            v["verification_failed"] = True
            
        final_list.append(v)

    # Sort final output by trust_score descending
    final_list.sort(key=lambda x: x.get("trust_score", 0.0), reverse=True)

    print("\n🎉 Pipeline complete.")
    return final_list


if __name__ == "__main__":
    result = run_pipeline("Injection molding machine", "Vietnam")
    
    print("\n============================================================")
    print("  FINAL VENDOR VERDICTS")
    print("============================================================")
    print(json.dumps(result, indent=2))
