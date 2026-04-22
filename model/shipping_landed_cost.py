"""
# TariffIQ — Shipping & Landed Cost Engine
=========================================
Deterministic, simulation-grade freight and landed cost calculator
supporting cross-country trade analysis.

Freight costs are modeled using industry benchmark per-kg rates
with distance-normalized multipliers to simulate realistic
cross-border trade cost sensitivity.
"""

import os
import pandas as pd
from tarrif_lookup_engine import load_tariffs, get_tariff_rate, get_tariff_rate_live

# Route Distances
# Approximate trade-lane estimates (km). All routes are symmetric.

AIR_DISTANCE_KM = {
    ("china",   "india"):    3800,
    ("china",   "france"):   8200,
    ("china",   "uae"):      5900,
    ("china",   "uk"):       8100,
    ("china",   "usa"):      11000,
    ("china",   "vietnam"):  2500,
    ("france",  "india"):    6600,
    ("france",  "uae"):      5200,
    ("france",  "uk"):       350,
    ("france",  "usa"):      7400,
    ("france",  "vietnam"):  9200,
    ("india",   "uae"):      2200,
    ("india",   "uk"):       7200,
    ("india",   "usa"):      12500,
    ("india",   "vietnam"):  3500,
    ("uae",     "uk"):       5500,
    ("uae",     "usa"):      11000,
    ("uae",     "vietnam"):  5800,
    ("uk",      "usa"):      6800,
    ("uk",      "vietnam"):  9500,
    ("usa",     "vietnam"):  13500,
}

SEA_DISTANCE_KM = {
    ("china",   "india"):    9000,
    ("china",   "france"):   17000,
    ("china",   "uae"):      11000,
    ("china",   "uk"):       19500,
    ("china",   "usa"):      20000,
    ("china",   "vietnam"):  2700,
    ("france",  "india"):    11000,
    ("france",  "uae"):      9500,
    ("france",  "uk"):       1500,
    ("france",  "usa"):      6500,
    ("france",  "vietnam"):  16000,
    ("india",   "uae"):      3500,
    ("india",   "uk"):       11000,
    ("india",   "usa"):      19000,
    ("india",   "vietnam"):  5500,
    ("uae",     "uk"):       10000,
    ("uae",     "usa"):      16000,
    ("uae",     "vietnam"):  8000,
    ("uk",      "usa"):      6000,
    ("uk",      "vietnam"):  18000,
    ("usa",     "vietnam"):  18000,
}

# Shipping Rate Benchmarks

SHIPPING_RATES = {
    "air": {
        "base_charge": 250,
        "per_kg_rate": 6,
    },
    "sea": {
        "base_charge": 120,
        "per_kg_rate": 1.2,
    },
}

# Normalization Constant

DISTANCE_NORM_KM = 5000   # global mid-range normalization constant

# Supported Countries

SUPPORTED_COUNTRIES = ["china", "france", "india", "uae", "uk", "usa", "vietnam"]

# Cross-Country Data

CROSS_COUNTRY_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data", "cross_country_csv",
)

# Map between short names and names used in xlsx files
COUNTRY_NAME_MAP = {
    "china":   "China",
    "france":  "France",
    "india":   "India",
    "uae":     "United Arab Emirates",
    "uk":      "United Kingdom",
    "usa":     "United States",
    "vietnam": "Vietnam",
}

# Reverse map for lookup
COUNTRY_SHORT_MAP = {v.lower(): k for k, v in COUNTRY_NAME_MAP.items()}

# Filename pattern: reporter_partner.csv
FILE_NAME_MAP = {
    "china":   "china",
    "france":  "france",
    "india":   "india",
    "uae":     "uae",
    "uk":      "uk",
    "usa":     "usa",
    "vietnam": "vietnam",
}

# Global CSV Cache
_CSV_CACHE = {}

def load_cross_country_data(reporter: str, partner: str) -> pd.DataFrame | None:
    """
    Load and cache the cross-country tariff CSV for a reporter->partner route.
    """
    r = _normalize(reporter)
    p = _normalize(partner)
    r_file = FILE_NAME_MAP.get(r, r)
    p_file = FILE_NAME_MAP.get(p, p)

    filename = f"{r_file}_{p_file}.csv"
    if filename in _CSV_CACHE:
        return _CSV_CACHE[filename]

    filepath = os.path.join(CROSS_COUNTRY_DIR, filename)

    if not os.path.exists(filepath):
        return None

    df = pd.read_csv(filepath, dtype={"HSCode": str})
    df.rename(columns={"HSCode": "hs_code"}, inplace=True)
    _CSV_CACHE[filename] = df
    return df


# Core Functions
# ------------------------------------------------------------------

def _normalize(name: str) -> str:
    """Lowercase + strip a country name, and map to short name if possible."""
    n = name.strip().lower()
    return COUNTRY_SHORT_MAP.get(n, n)


def get_route_distance(origin: str, destination: str, mode: str) -> int:
    """
    Look up the distance (km) between two countries for a given mode.
    Routes are symmetric — order doesn't matter.
    """
    a, b = sorted([_normalize(origin), _normalize(destination)])
    table = AIR_DISTANCE_KM if mode == "air" else SEA_DISTANCE_KM
    key = (a, b)
    if key not in table:
        # DEMO FALLBACK: Return a synthetic realistic distance (5000-15000km)
        import hashlib
        h = int(hashlib.md5(f"{a}:{b}".encode()).hexdigest(), 16)
        return 5000 + (h % 10001)
    return table[key]


def calculate_shipping_cost(origin: str, destination: str, mode: str, weight_kg: float) -> dict:
    """
    Calculate freight shipping cost.
    Returns dict with: distance_km, distance_factor, shipping_cost
    """
    mode = mode.strip().lower()
    if mode not in SHIPPING_RATES:
        raise ValueError(f"Invalid mode '{mode}'. Choose 'air' or 'sea'.")

    distance_km = get_route_distance(origin, destination, mode)
    distance_factor = round(distance_km / DISTANCE_NORM_KM, 2)

    rates = SHIPPING_RATES[mode]
    shipping_cost = round(
        rates["base_charge"] + (weight_kg * rates["per_kg_rate"] * distance_factor),
        2,
    )

    return {
        "distance_km": distance_km,
        "distance_factor": distance_factor,
        "shipping_cost": shipping_cost,
    }


def calculate_import_duty(base_value: float, tariff_rate: float) -> float:
    """import_duty = base_value × (tariff_rate / 100)"""
    return round(base_value * tariff_rate / 100, 2)


def calculate_landed_cost(
    origin: str,
    destination: str,
    mode: str,
    weight_kg: float,
    product_value: float,
    tariff_rate: float,
) -> dict:
    """
    Full landed cost calculation with detailed breakdown.
    Returns: route, mode, distance_km, distance_factor, weight_kg,
             shipping_cost, insurance_cost, cif_value, tariff_rate, 
             import_duty, import_vat, gst_cost, cess_cost, 
             handling_fees, doc_fees, total_landed_cost
    """
    shipping = calculate_shipping_cost(origin, destination, mode, weight_kg)
    shipping_cost = shipping["shipping_cost"]
    
    # Insurance is typically estimated at ~3% of product value
    insurance_cost = round(product_value * 0.03, 2)
    
    # CIF (Cost, Insurance, Freight)
    cif_value = round(product_value + shipping_cost + insurance_cost, 2)
    
    # Duty is applied on CIF
    import_duty = calculate_import_duty(cif_value, tariff_rate)
    
    # Cess is often a surcharge on CIF or Duty. We'll use 1.5% of CIF for this simulation.
    cess_cost = round(cif_value * 0.015, 2)
    
    # VAT and GST are typically assessed on the dutiable value (CIF + Duty + Cess)
    dutiable_value = cif_value + import_duty + cess_cost
    
    # Additional common taxes/fees
    import_vat = round(dutiable_value * 0.12, 2)  # assumed standard 12%
    gst_cost = round(dutiable_value * 0.08, 2)    # assumed 8%
    
    handling_fees = 200.0
    doc_fees = 100.0

    total = round(cif_value + import_duty + import_vat + gst_cost + cess_cost + handling_fees + doc_fees, 2)

    def format_country(name):
        n = name.strip().lower()
        return COUNTRY_NAME_MAP.get(n, n.title())

    return {
        "route": f"{format_country(origin)} -> {format_country(destination)}",
        "mode": mode.strip().lower(),
        "distance_km": shipping["distance_km"],
        "distance_factor": shipping["distance_factor"],
        "weight_kg": weight_kg,
        "product_value": product_value,
        "shipping_cost": shipping_cost,
        "insurance_cost": insurance_cost,
        "cif_value": cif_value,
        "tariff_rate": tariff_rate,
        "import_duty": import_duty,
        "import_vat": import_vat,
        "gst_cost": gst_cost,
        "cess_cost": cess_cost,
        "handling_fees": handling_fees,
        "doc_fees": doc_fees,
        "total_landed_cost": total,
    }


def calculate_landed_cost_with_lookup(
    origin: str,
    destination: str,
    mode: str,
    weight_kg: float,
    product_value: float,
    hs_code: str,
    importing_country: str,
    year: int,
    tariffs_df=None,
) -> dict | None:
    """
    End-to-end: looks up the tariff from the dataset and computes
    the full landed cost in one call.
    """
    if tariffs_df is None:
        tariffs_df = load_tariffs()

    rate = get_tariff_rate(hs_code, importing_country, year, tariffs_df)
    if rate is None:
        return None

    return calculate_landed_cost(
        origin, destination, mode, weight_kg, product_value, rate
    )


def calculate_landed_cost_live(
    origin: str,
    destination: str,
    mode: str,
    weight_kg: float,
    product_value: float,
    hs_code: str,
    year: int = 2021, # WITS usually has latest full data for 2021/2022
) -> dict | None:
    """
    Full landed cost calculation using LIVE preferentially-adjusted 
    WITS tariffs (AHS). Falls back to csv rate if live fails.
    """
    # 1) Try to get fallback rate from CSV
    df = load_cross_country_data(reporter=destination, partner=origin)
    fallback_rate = None
    csv_product_desc = "Unknown"
    is_traded = "No"
    
    if df is not None:
        hs_str = str(hs_code).strip()
        match = df[df["hs_code"] == hs_str]
        if not match.empty:
            fallback_rate = float(match.iloc[0]["AppliedTariff"])
            csv_product_desc = match.iloc[0].get("Product", "Unknown")
            is_traded = match.iloc[0].get("IsTraded", "Yes")

    # 2) Live lookup
    tariff_data = get_tariff_rate_live(
        hs_code=hs_code, 
        origin=origin, 
        destination=destination, 
        year=year,
        fallback_rate=fallback_rate
    )
    
    rate_to_use = tariff_data["ahs_rate"]
    if rate_to_use is None:
         # DEMO FALLBACK: Use a synthetic 8.5% tariff for unknown countries
         rate_to_use = 8.5
         tariff_data["ahs_rate"] = 8.5
         tariff_data["mfn_rate"] = 10.0
         tariff_data["product_label"] = f"Simulated: HS {hs_code}"
         tariff_data["source"] = "Demo Synthetic"
         
    # 3) Calculate landed cost
    result = calculate_landed_cost(
        origin, destination, mode, weight_kg, product_value, rate_to_use
    )
    
    # 4) Enrich with preference data
    result["product_description"] = tariff_data.get("product_label", csv_product_desc)
    result["mfn_rate"] = tariff_data["mfn_rate"]
    result["applied_tariff"] = tariff_data["ahs_rate"]
    result["preference_margin"] = tariff_data["preference_margin"]
    result["has_preference"] = tariff_data["has_preference"]
    result["is_live"] = tariff_data["is_live"]
    result["is_traded"] = is_traded
    
    return result


# Cross-Country Data Functions
# ------------------------------------------------------------------

def lookup_landed_cost_by_country(
    hs_code: str,
    origin: str,
    destination: str,
    mode: str,
    weight_kg: float,
    product_value: float,
) -> dict | None:
    """
    Look up tariff from cross-country CSV data and calculate
    the full landed cost for a specific route.

    origin = exporting country (partner in CSV)
    destination = importing country (reporter in CSV)
    """
    # The CSV file is named reporter-partner, where reporter = importer
    df = load_cross_country_data(reporter=destination, partner=origin)
    if df is None:
        return None

    hs_code = str(hs_code).strip()
    match = df[df["hs_code"] == hs_code]

    if match.empty:
        return None

    row = match.iloc[0]
    tariff_rate = float(row["AppliedTariff"])

    result = calculate_landed_cost(
        origin, destination, mode, weight_kg, product_value, tariff_rate
    )

    # Enrich with cross-country data - handle missing columns gracefully for synthesized data
    result["applied_tariff"] = round(tariff_rate, 2)
    result["mfn_rate"] = round(float(row.get("MFNRate", tariff_rate + 2.5)), 2)
    result["is_traded"] = bool(row.get("IsTraded", True))
    result["has_preference"] = result["applied_tariff"] < result["mfn_rate"]
    result["product_description"] = row.get("Product", f"HS {hs_code}")

    return result


def compare_origins(
    hs_code: str,
    my_country: str,
    mode: str,
    weight_kg: float,
    product_value: float,
    origins: list[str] | None = None,
) -> list[dict]:
    """
    You are in `my_country` (importer). Compare the landed cost of
    buying the same HS code from every available origin country.

    If `origins` is None, tries all supported countries
    (except my_country itself).

    Returns a list of result dicts sorted by total_landed_cost (cheapest first).
    """
    if origins is None:
        origins = [c for c in SUPPORTED_COUNTRIES if c != _normalize(my_country)]

    results = []

    for src in origins:
        src = _normalize(src)
        if src == _normalize(my_country):
            continue

        # origin=src (exporter), destination=my_country (importer)
        result = lookup_landed_cost_by_country(
            hs_code, origin=src, destination=my_country,
            mode=mode, weight_kg=weight_kg, product_value=product_value,
        )

        if result is not None:
            results.append(result)

    # Sort by cheapest landed cost
    results.sort(key=lambda r: r["total_landed_cost"])

    return results

def compare_origins_live(
    hs_code: str,
    my_country: str,
    mode: str,
    weight_kg: float,
    product_value: float,
    origins: list[str] | None = None,
    year: int = 2021,
) -> list[dict]:
    """
    Concurrent version of compare_origins_live to speed up calculation.
    """
    from concurrent.futures import ThreadPoolExecutor

    if origins is None:
        origins = [c for c in SUPPORTED_COUNTRIES if c != _normalize(my_country)]

    results = []

    def task(src):
        src = _normalize(src)
        if src == _normalize(my_country):
            return None
        return calculate_landed_cost_live(
            origin=src, destination=my_country, hs_code=hs_code,
            mode=mode, weight_kg=weight_kg, product_value=product_value,
            year=year
        )

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(task, src) for src in origins]
        for f in futures:
            res = f.result()
            if res:
                results.append(res)

    results.sort(key=lambda r: r["total_landed_cost"])
    return results


# Demo Run
# ------------------------------------------------------------------

if __name__ == "__main__":
    # Constants
    HS_CODE       = "020422"
    MY_COUNTRY    = "india"       # you are the importer
    MODE          = "air"
    WEIGHT_KG     = 500
    PRODUCT_VALUE = 10000
    # ----------------------------------------------------------------

    print("=" * 70)
    print("  TariffIQ - Sourcing Optimization")
    print("=" * 70)
    print(f"\n  You are in : {MY_COUNTRY.upper()} (importer)")
    print(f"  HS Code    : {HS_CODE}")
    print(f"  Mode       : {MODE}")
    print(f"  Weight     : {WEIGHT_KG} kg")
    print(f"  Value      : ${PRODUCT_VALUE:,.2f}")

    # Single country lookup
    print("\n" + "-" * 70)
    print(f"  SINGLE LOOKUP: Buying from CHINA -> {MY_COUNTRY.upper()}")
    print("-" * 70)

    single = lookup_landed_cost_by_country(
        HS_CODE, origin="china", destination=MY_COUNTRY,
        mode=MODE, weight_kg=WEIGHT_KG, product_value=PRODUCT_VALUE,
    )
    if single:
        print(f"  Product     : {single['product_description']}")
        print(f"  Route       : {single['route']}")
        print(f"  Distance    : {single['distance_km']:,} km (factor: {single['distance_factor']})")
        print(f"  Shipping    : ${single['shipping_cost']:,.2f}")
        print(f"  MFN Rate    : {single['mfn_rate']}%")
        print(f"  Applied     : {single['applied_tariff']}%")
        print(f"  Duty        : ${single['import_duty']:,.2f}")
        print(f"  TOTAL       : ${single['total_landed_cost']:,.2f}")
    else:
        print("  No data found.")

    # Live Comparison mode
    print("\n" + "-" * 70)
    print(f"  LIVE WITS COMPARISON: Best country to buy from -> {MY_COUNTRY.upper()}")
    print(f"  (Queries live preferential/FTA tariff rates from World Bank)")
    print("-" * 70)

    live_results = compare_origins_live(
        HS_CODE, MY_COUNTRY, MODE, WEIGHT_KG, PRODUCT_VALUE
    )

    if live_results:
        print(f"\n  {'Rank':<5} {'Buy From':<12} {'Dist (km)':<12} {'Shipping':<10} "
              f"{'Pref Margin':<12} {'AHS %':<8} {'Duty':<12} {'TOTAL':<12}")
        print("-" * 85)

        for i, r in enumerate(live_results, 1):
            src = r["route"].split(" -> ")[0].upper()
            best = " ← CHEAPEST" if i == 1 else ""
            pref = f"(-{r['preference_margin']}%)" if r.get('has_preference') else "None"
            
            print(f"  {i:<5} {src:<12} {r['distance_km']:<12,} "
                  f"${r['shipping_cost']:<9,.2f} {pref:<12} {r['applied_tariff']:<8.2f} "
                  f"${r['import_duty']:<11,.2f} ${r['total_landed_cost']:,.2f}{best}")

        cheapest = live_results[0]
        costliest = live_results[-1]
        savings = round(costliest["total_landed_cost"] - cheapest["total_landed_cost"], 2)
        best_src = cheapest["route"].split(" -> ")[0].upper()
        if cheapest.get('has_preference'):
            fta_note = f" (Includes {cheapest['preference_margin']}% FTA Discount!)"
        else:
            fta_note = ""
        print(f"\n[INFO] Best source: {best_src} - savings of ${savings:,.2f} versus costliest option{fta_note}")
    else:
        print("  No live comparison data found for this HS code.")

    print("\n" + "-" * 70)
