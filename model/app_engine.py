import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
if MODEL_DIR not in sys.path:
    sys.path.insert(0, MODEL_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(MODEL_DIR), ".env"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
    title="TariffIQ API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*", # Fallback
        "https://tariffiq-project.vercel.app", 
        "https://tariffiq-project-git-main-devdash01s-projects.vercel.app",
        "https://tariffiq-project.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request / Response Schemas
# ------------------------------------------------------------------

class ClassifyRequest(BaseModel):
    product_description: str = Field(..., min_length=3, examples=["Cotton T-shirts, knitted, 100% cotton"])
    destination: str | None = Field(None, examples=["India"])


class LandedCostRequest(BaseModel):
    product_description: str = Field(..., min_length=3)
    origin: str = Field(..., examples=["China"])
    destination: str = Field(..., examples=["USA"])
    mode: str = Field("sea", examples=["sea", "air", "rail"])
    weight_kg: float = Field(100.0, gt=0)
    product_value: float = Field(10000.0, gt=0)
    hs_code: str | None = Field(None, description="Optional — if empty, auto-classifies first")


class ComplianceRequest(BaseModel):
    destination: str
    product_description: str

class VendorRequest(BaseModel):
    product: str
    country: str


# API Endpoints
# ------------------------------------------------------------------

@app.get("/api/health")
def health():
    return {"status": "ok", "mode": "LLM_ONLY"}


@app.post("/api/classify")
async def classify(req: ClassifyRequest):
    """
    Directly query Groq Llama-3 for HS Classification to bypass RAM limits.
    """
    from HS_code_search import search
    import demo_data

    try:
        candidates, parsed = search(query=req.product_description, top_k=6)
    except Exception as e:
        print(f"[ERROR] Classification failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    if not candidates:
        raise HTTPException(status_code=404, detail="No HS code candidates found.")

    reranked = parsed if parsed else None

    # HS lookup engine - Lazy load for RAM safety
    from tarrif_lookup_engine import get_tariff_rate, load_tariffs
    tariffs_df = load_tariffs()

    results = []
    for c in candidates:
        hs = c["hs_code"]
        rate = 0.0
        risk = "Low"
        
        # Look up actual rate if destination is provided
        if req.destination and req.destination.lower() != "select destination":
            # Simple heuristic mapping for country names in dataset
            dest_name = req.destination.title()
            if dest_name == "Usa": dest_name = "United States of America"
            if dest_name == "Uk": dest_name = "United Kingdom"
            
            try:
                # Use 2022 as default year from dataset
                lookup = get_tariff_rate(hs, dest_name, 2022, tariffs_df)
                if lookup is not None:
                    rate = lookup
                else:
                    # Try a 4-digit prefix fallback if 6-digit is missing
                    lookup_4 = get_tariff_rate(hs[:4], dest_name, 2022, tariffs_df)
                    rate = lookup_4 if lookup_4 is not None else 8.5 # realistic default
                
                # Assign to candidate object
                c["duty_rate"] = f"{rate}%"
            except Exception:
                c["duty_rate"] = "8.5%" # Reliable default for prototype
                rate = 12.5 # Fallback
        
        # Simulate risk based on HS chapters (e.g. chemicals/machinery higher risk)
        if hs.startswith(("28", "29", "30", "84", "85")):
            risk = "Medium" if np.random.random() > 0.5 else "Low"

        # Add AI reasoning/explanation if available
        ai_info = {}
        if reranked and "candidate_results" in reranked:
            ai_info = next((item for item in reranked["candidate_results"] if str(item.get("hs_code")) == str(hs)), {})
        
        # Preserve reasoning from candidates list if already set (demo mode)
        if ai_info.get("explanation"):
            c["reasoning"] = ai_info["explanation"]
        elif not c.get("reasoning"):
            c["reasoning"] = f"Semantic match found in {req.destination or 'selected'} tariff schedule."
            
        c["duty_rate"] = f"{rate}%"
        c["risk"] = risk
        results.append(c)

    # Re-sort results to put primary_hs first
    primary_hs = reranked.get("primary_hs") if reranked else (results[0]["hs_code"] if results else None)
    if primary_hs:
        results.sort(key=lambda x: str(x["hs_code"]) == str(primary_hs), reverse=True)

    return {
        "query": req.product_description,
        "results": results,
        "primary_hs": primary_hs,
        "analysis": reranked.get("analysis") if reranked else None,
        "confidence": reranked.get("confidence") if reranked else 0.85
    }


@app.post("/api/landed-cost")
def landed_cost(req: LandedCostRequest):
    """
    Calculate total landed cost for a trade route.
    If hs_code is not provided, auto-classifies first.
    """
    from HS_code_search import search
    from shipping_landed_cost import calculate_landed_cost_live, compare_origins_live

    hs_code = req.hs_code
    classification = None

    # Lazy load for RAM safety
    from tarrif_lookup_engine import load_tariffs
    tariffs_df = load_tariffs()

    # Auto-classify if no HS code provided
    if not hs_code:
        candidates, parsed = search(query=req.product_description, top_k=1)

        if candidates:
            hs_code = str(candidates[0]["hs_code"])
            classification = parsed

    if not hs_code:
        raise HTTPException(status_code=400, detail="Could not determine HS code.")

    # Calculate landed cost
    result = None
    try:
        result = calculate_landed_cost_live(
            origin=req.origin,
            destination=req.destination,
            mode=req.mode,
            weight_kg=req.weight_kg,
            product_value=req.product_value,
            hs_code=hs_code,
        )
    except Exception as e:
        print(f"[WARN] Landed cost live calculation failed: {e}. Using synthetic fallback.")

    # Always ensure we return something - synthetic fallback if live calc fails
    if result is None:
        tariff_rate = 8.5
        shipping_cost = round(req.weight_kg * (8.0 if req.mode == "air" else 2.5), 2)
        insurance_cost = round(req.product_value * 0.005, 2)
        cif_value = round(req.product_value + shipping_cost + insurance_cost, 2)
        import_duty = round(cif_value * tariff_rate / 100, 2)
        import_vat = round(cif_value * 0.12, 2)
        total = round(cif_value + import_duty + import_vat + 300, 2)
        result = {
            "route": f"{req.origin} -> {req.destination}",
            "mode": req.mode,
            "distance_km": 8000,
            "weight_kg": req.weight_kg,
            "product_value": req.product_value,
            "shipping_cost": shipping_cost,
            "insurance_cost": insurance_cost,
            "cif_value": cif_value,
            "tariff_rate": tariff_rate,
            "import_duty": import_duty,
            "import_vat": import_vat,
            "gst_cost": 0.0,
            "cess_cost": 0.0,
            "handling_fees": 200.0,
            "doc_fees": 100.0,
            "total_landed_cost": total,
            "applied_tariff": tariff_rate,
            "mfn_rate": 12.0,
            "has_preference": False,
            "is_live": False,
            "product_description": f"HS {hs_code}",
        }

    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"No tariff data found for HS {hs_code} on route {req.origin} -> {req.destination}."
        )

    # Calculate scenarios automatically for route optimization
    scenarios = []
    try:
        scenarios = compare_origins_live(
            hs_code=hs_code,
            my_country=req.destination,
            mode=req.mode,
            weight_kg=req.weight_kg,
            product_value=req.product_value,
        )
        
        # Add alternative mode for current route
        alt_mode = "air" if req.mode.lower() == "sea" else "sea"
        alt_mode_result = calculate_landed_cost_live(
            origin=req.origin,
            destination=req.destination,
            mode=alt_mode,
            weight_kg=req.weight_kg,
            product_value=req.product_value,
            hs_code=hs_code,
        )
        
        combined_scenarios = [result]
        if alt_mode_result:
            combined_scenarios.append(alt_mode_result)
            
        # Add top 4 alternative scenarios
        added_count = 0
        for s in scenarios:
            s_origin = s["route"].split(" -> ")[0].lower().strip()
            if s_origin != req.origin.lower().strip():
                combined_scenarios.append(s)
                added_count += 1
                if added_count >= 4:
                    break

    except Exception as e:
        print(f"Scenario generation failed: {e}")
        combined_scenarios = [result]

    return {
        "hs_code": hs_code,
        "classification": classification,
        "landed_cost": result,
        "scenarios": combined_scenarios,
    }


@app.post("/api/compliance")
def compliance_check(req: ComplianceRequest):
    """
    Run the AI compliance agent.
    """
    from compliance_agent import run_compliance_check
    
    try:
        from compliance_agent import run_compliance_check
        result = run_compliance_check(req.destination, req.product_description)
    except Exception as e:
        print(f"Compliance check failed: {e}. Using Demo Fallback.")
        # Robust demo fallback for presentation if API keys are missing
        result = {
            "risk_level": "Medium",
            "compliance_checklist": [
                {"requirement_title": "Certificate of Origin", "category": "Documentation", "description": "Mandatory document for preferential tariff treatment.", "is_mandatory": True},
                {"requirement_title": "Product Quality Inspection", "category": "Regulatory", "description": "Standard quality check required for industrial imports.", "is_mandatory": False},
                {"requirement_title": "Import Permit", "category": "License", "description": "Temporary permit required for this product category.", "is_mandatory": True}
            ],
            "estimated_complexity": "Moderate",
            "summary_advice": "Standard compliance procedures apply. Ensure all documentation matches the HS Code exactly to avoid customs delays.",
            "rules_of_origin_evaluation": [
                {"rule_name": "Substantial Transformation", "analysis": "Product must undergo a change in tariff heading.", "status": "Met"},
                {"rule_name": "Value Addition", "analysis": "Requires minimum 35% local value addition.", "status": "Met"}
            ]
        }

    return result

@app.post("/api/vendors")
def find_vendors(req: VendorRequest):
    """
    Run the AI vendor discovery pipeline with fallback.
    """
    try:
        from vendor_finder import run_pipeline
        vendors = run_pipeline(req.product, req.country)
    except Exception:
        # Demo fallback
        from demo_data import get_mock_vendors
        vendors = get_mock_vendors(req.country)
    return {"vendors": vendors}


@app.get("/api/news")
def get_news():
    """
    Fetch live tariff news and analyze them using the Policy Shock Engine.
    """
    try:
        from policy_shock_engine import run_policy_shock_from_live_news
        results = run_policy_shock_from_live_news(max_articles=3)
        if not results:
            raise ValueError("No live news found")
        return {"news": results}
    except Exception as e:
        print(f"Error fetching news: {e}. Using Demo Fallback.")
        from demo_data import get_mock_news
        return {"news": get_mock_news()}

@app.post("/api/parse-document")
async def parse_document(file: UploadFile = File(...)):
    """
    Extract text from a PDF invoice/spec sheet and use MegaLLM to parse
    the fields needed for the Trade Input form.
    """
    import PyPDF2
    from openai import OpenAI
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        # Extract text from PDF
        pdf_reader = PyPDF2.PdfReader(file.file)
        extracted_text = ""
        for page in pdf_reader.pages:
            extracted_text += page.extract_text() + "\n"
            
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No readable text found in PDF.")
            
        # Use Groq for free processing
        API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("MEGALLM_API_KEY")
        BASE_URL = "https://api.groq.com/openai/v1" if os.getenv("GROQ_API_KEY") else None
        
        if not API_KEY:
            raise HTTPException(status_code=500, detail="AI API key not configured. Add GROQ_API_KEY to .env")
            
        client = OpenAI(api_key=API_KEY, base_url=BASE_URL)
        
        prompt = f"""
        Extract trade and product information from the following document text.
        Return ONLY a JSON object with these exact keys. If a value is not found, leave it as an empty string "".
        
        Keys to extract:
        - name: The specific product name or title
        - category: One of ["Electronics & IT", "Apparel & Textiles", "Machinery", "Chemicals", "Food & Beverage", "Automotive Parts", "Medical Devices", "Furniture", "Toys & Games", "Other"]
        - customCategory: If category is "Other", provide a short 2-3 word category name.
        - description: A detailed 1-2 sentence description of the product.
        - material: What it is made of (e.g., 100% Cotton, Aluminum)
        - intendedUse: What it is used for
        - value: Total invoice or product value (numbers only, e.g., "5000")
        - currency: Guess the currency code (e.g. "USD", "EUR")
        - qty: Number of units (numbers only, e.g. "100")
        - weight: Total weight in kg (numbers only, e.g. "50.5")
        - dimensions: L x W x H in cm if available
        - origin: Country name where it's shipping from
        - dest: Country name where it's shipping to
        
        DOCUMENT TEXT:
        \"\"\"{extracted_text[:4000]}\"\"\"
        """
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile" if os.getenv("GROQ_API_KEY") else "gpt-4o",
            messages=[
                {"role": "system", "content": "You are a data extraction assistant. Output strictly valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )
        
        import json
        import re
        content = response.choices[0].message.content.strip()
        content = re.sub(r"^```(?:json)?\s*", "", content)
        content = re.sub(r"\s*```$", "", content)
        
        parsed = json.loads(content)
        return {"extracted_data": parsed}
        
    except Exception as e:
        print(f"Error parsing document: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse document: {str(e)}")


# Main execution
# ------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
