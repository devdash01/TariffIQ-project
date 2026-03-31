"""
TariffIQ — WITS (World Integrated Trade Solution) API Client
==============================================================
Live tariff rate lookup via the World Bank WITS REST API.

Supports two endpoints:
1. **TradeStats-Tariff** (reliable) — Aggregate tariff rates by broad product
   categories (e.g. "Animal", "Chemicals", "Textiles"). Uses ISO3 alpha codes.
2. **TRN / TRAINS** (HS-6 granularity, intermittent) — Tariff at the 6-digit
   Harmonized System level. Uses UN numeric country codes. This endpoint is
   sometimes unavailable from the WITS side.

API Docs: https://wits.worldbank.org/API/V1/SDMX/V21/rest/doc
"""

import requests
from functools import lru_cache

# ── Base URLs ───────────────────────────────────────────────────────
TRADESTATS_BASE = (
    "https://wits.worldbank.org/API/V1/SDMX/V21"
    "/datasource/tradestats-tariff"
)
TRAINS_BASE = (
    "https://wits.worldbank.org/API/V1/SDMX/V21"
    "/datasource/TRN"
)

# ── ISO3 Alpha → UN Numeric Code Mapping ───────────────────────────
# Numeric codes are required by the TRN (TRAINS) SDMX endpoint.
ISO3_TO_NUMERIC = {
    "USA": "840",  "IND": "356",  "GBR": "826",  "CHN": "156",
    "FRA": "250",  "ARE": "784",  "VNM": "704",  "DEU": "276",
    "JPN": "392",  "KOR": "410",  "BRA": "076",  "CAN": "124",
    "AUS": "036",  "IDN": "360",  "MEX": "484",  "TUR": "792",
    "ZAF": "710",  "SAU": "682",  "THA": "764",  "MYS": "458",
    "SGP": "702",  "NLD": "528",  "ITA": "380",  "ESP": "724",
    "BEL": "056",  "POL": "616",  "SWE": "752",  "CHE": "756",
    "NGA": "566",  "EGY": "818",  "BGD": "050",  "PAK": "586",
    "PHL": "608",  "ARG": "032",  "COL": "170",  "CHL": "152",
    "PER": "604",  "NZL": "554",  "RUS": "643",  "WLD": "000",
}

# ── Friendly name → ISO3 mapping ───────────────────────────────────
# Matches naming in shipping_landed_cost.py
COUNTRY_NAME_TO_ISO3 = {
    "usa": "USA", "united states": "USA",
    "india": "IND",
    "uk": "GBR", "united kingdom": "GBR",
    "china": "CHN",
    "france": "FRA",
    "uae": "ARE", "united arab emirates": "ARE",
    "vietnam": "VNM",
    "germany": "DEU",
    "japan": "JPN",
    "south korea": "KOR",
    "brazil": "BRA",
    "canada": "CAN",
    "australia": "AUS",
    "indonesia": "IDN",
    "mexico": "MEX",
    "turkey": "TUR",
    "south africa": "ZAF",
    "saudi arabia": "SAU",
    "thailand": "THA",
    "malaysia": "MYS",
    "singapore": "SGP",
    "russia": "RUS",
}

# ── HS Chapter → WITS Product Group Mapping ────────────────────────
# Maps 2-digit HS chapter ranges to WITS product group IDs used
# by the tradestats-tariff endpoint.
HS_CHAPTER_TO_PRODUCT_GROUP = {
    (1, 5):   "01-05_Animal",
    (6, 15):  "06-15_Vegetable",
    (16, 24): "16-24_FoodProd",
    (25, 26): "25-26_Minerals",
    (27, 27): "27-27_Fuels",
    (28, 38): "28-38_Chemicals",
    (39, 40): "39-40_PlastiRub",
    (41, 43): "41-43_HidesSkin",
    (44, 49): "44-49_Wood",
    (50, 63): "50-63_TextCloth",
    (64, 67): "64-67_Footwear",
    (68, 71): "68-71_StoneGlas",
    (72, 83): "72-83_Metals",
    (84, 85): "84-85_MachElec",
    (86, 89): "86-89_Transport",
    (90, 99): "90-99_Miscellan",
}

# Reverse lookup: product group → human label
PRODUCT_GROUP_LABELS = {
    "01-05_Animal":    "Animal Products",
    "06-15_Vegetable": "Vegetable Products",
    "16-24_FoodProd":  "Food Products",
    "25-26_Minerals":  "Minerals",
    "27-27_Fuels":     "Fuels",
    "28-38_Chemicals": "Chemicals",
    "39-40_PlastiRub": "Plastic or Rubber",
    "41-43_HidesSkin": "Hides and Skins",
    "44-49_Wood":      "Wood Products",
    "50-63_TextCloth": "Textiles and Clothing",
    "64-67_Footwear":  "Footwear",
    "68-71_StoneGlas": "Stone and Glass",
    "72-83_Metals":    "Metals",
    "84-85_MachElec":  "Machinery and Electronics",
    "86-89_Transport": "Transportation",
    "90-99_Miscellan": "Miscellaneous",
}

# WITS tariff indicators available on the tradestats-tariff endpoint
TARIFF_INDICATORS = {
    "MFN-WGHTD-AVRG":    "MFN Weighted Average (%)",
    "MFN-SMPL-AVRG":     "MFN Simple Average (%)",
    "AHS-WGHTD-AVRG":    "AHS Weighted Average (%)",
    "AHS-SMPL-AVRG":     "AHS Simple Average (%)",
    "BND-WGHTD-AVRG":    "Bound Weighted Average (%)",
    "BND-SMPL-AVRG":     "Bound Simple Average (%)",
}


def _hs6_to_product_group(hs6: str) -> str | None:
    """Convert a 6-digit HS code to its WITS product group ID."""
    try:
        chapter = int(str(hs6).zfill(6)[:2])
    except ValueError:
        return None

    for (lo, hi), group_id in HS_CHAPTER_TO_PRODUCT_GROUP.items():
        if lo <= chapter <= hi:
            return group_id
    return None


def _resolve_iso3(code_or_name: str) -> str:
    """Resolve an ISO3 code or friendly name to an ISO3 code."""
    upper = code_or_name.strip().upper()
    if upper in ISO3_TO_NUMERIC:
        return upper
    iso3 = COUNTRY_NAME_TO_ISO3.get(code_or_name.strip().lower())
    if iso3:
        return iso3
    raise ValueError(
        f"Unknown country: '{code_or_name}'. "
        f"Use ISO3 codes (e.g. 'USA') or names (e.g. 'united states')."
    )


# ═══════════════════════════════════════════════════════════════════
#  Endpoint 1: TradeStats-Tariff (aggregate, reliable)
# ═══════════════════════════════════════════════════════════════════

@lru_cache(maxsize=128)
def get_tradestats_tariff(
    reporter: str,
    partner: str,
    year: int,
    product: str = "all",
    indicator: str = "MFN-WGHTD-AVRG",
    timeout: int = 20,
) -> list[dict] | None:
    """
    Fetch aggregate tariff rates from the TradeStats-Tariff endpoint.

    Parameters
    ----------
    reporter : str
        ISO3 code or friendly name of the importing/reporting country.
    partner : str
        ISO3 code or friendly name of the exporting/partner country.
    year : int
        Year to query (data availability varies, typically 2017-2022).
    product : str
        WITS product group ID (e.g. "01-05_Animal") or "all" for all groups.
    indicator : str
        One of the TARIFF_INDICATORS keys. Default: "MFN-WGHTD-AVRG".
    timeout : int
        HTTP request timeout in seconds.

    Returns
    -------
    list[dict] | None
        List of dicts with keys: product_group, product_label, tariff_rate,
        reporter, partner, year, indicator.
        Returns None on failure.
    """
    reporter_iso3 = _resolve_iso3(reporter)
    partner_iso3 = _resolve_iso3(partner)

    url = (
        f"{TRADESTATS_BASE}"
        f"/reporter/{reporter_iso3.lower()}"
        f"/year/{year}"
        f"/partner/{partner_iso3.lower()}"
        f"/product/{product}"
        f"/indicator/{indicator}"
        f"?format=JSON"
    )

    try:
        response = requests.get(url, timeout=timeout)
    except requests.exceptions.RequestException as e:
        print(f"[WITS TradeStats] Request failed: {e}")
        return None

    if response.status_code != 200:
        print(f"[WITS TradeStats] HTTP {response.status_code} for "
              f"{reporter_iso3}→{partner_iso3} ({year})")
        return None

    try:
        data = response.json()
    except ValueError:
        print("[WITS TradeStats] Invalid JSON response.")
        return None

    # Parse the SDMX JSON structure
    try:
        datasets = data.get("dataSets", [])
        if not datasets:
            return None

        structure = data.get("structure", {})
        dimensions = structure.get("dimensions", {}).get("series", [])

        # Find the product code dimension
        product_dim = None
        product_dim_idx = None
        for i, dim in enumerate(dimensions):
            if dim.get("id") == "PRODUCTCODE":
                product_dim = dim
                product_dim_idx = i
                break

        if not product_dim:
            return None

        product_values = product_dim.get("values", [])
        series = datasets[0].get("series", {})

        results = []
        for series_key, series_data in series.items():
            key_parts = series_key.split(":")
            product_idx = int(key_parts[product_dim_idx])
            product_info = product_values[product_idx]
            product_id = product_info["id"]
            product_name = product_info["name"]

            # Get the observation value
            obs = series_data.get("observations", {})
            if "0" in obs:
                rate = float(obs["0"][0])
            else:
                continue

            results.append({
                "product_group": product_id,
                "product_label": product_name,
                "tariff_rate": round(rate, 4),
                "reporter": reporter_iso3,
                "partner": partner_iso3,
                "year": year,
                "indicator": indicator,
            })

        return results if results else None

    except (KeyError, IndexError, TypeError, ValueError) as e:
        print(f"[WITS TradeStats] Parse error: {e}")
        return None


def get_tariff_for_hs_category(
    reporter: str,
    partner: str,
    hs6: str,
    year: int,
    indicator: str = "AHS-WGHTD-AVRG",
    timeout: int = 20,
) -> dict | None:
    """
    Get the aggregate tariff rate for the product category that contains
    a given HS-6 code. This uses the reliable TradeStats endpoint.

    For example, HS 010620 → chapter 01 → "01-05_Animal" → returns
    the MFN weighted average for "Animal Products".

    Returns
    -------
    dict | None
        Dict with: tariff_rate, product_group, product_label, hs_code,
        reporter, partner, year, indicator, source.
    """
    hs6 = str(hs6).strip().zfill(6)
    group = _hs6_to_product_group(hs6)
    if not group:
        print(f"[WITS] Cannot map HS code '{hs6}' to a product group.")
        return None

    results = get_tradestats_tariff(
        reporter, partner, year, product=group, indicator=indicator,
        timeout=timeout
    )

    if results and len(results) > 0:
        r = results[0]
        r["hs_code"] = hs6
        r["source"] = "tradestats-tariff"
        return r

    return None


# ═══════════════════════════════════════════════════════════════════
#  Endpoint 2: TRN / TRAINS (HS-6, intermittently available)
# ═══════════════════════════════════════════════════════════════════

@lru_cache(maxsize=128)
def get_tariff_rate_trains(
    reporter: str,
    partner: str,
    hs6: str,
    year: int,
    datatype: str = "reported",
    timeout: int = 15,
) -> dict | None:
    """
    Fetch a tariff rate at HS-6 granularity from the TRAINS endpoint.

    ⚠️ NOTE: This endpoint is sometimes unavailable from the WITS side.
    Consider using get_tariff_for_hs_category() as a reliable fallback.

    Parameters
    ----------
    reporter : str
        ISO3 code or friendly name of the reporting country.
    partner : str
        ISO3 code or friendly name of the partner country.
    hs6 : str
        6-digit HS code (e.g. "010620").
    year : int
        Year (e.g. 2022).
    datatype : str
        "reported" (default) or "estimated".
    timeout : int
        HTTP request timeout in seconds.

    Returns
    -------
    dict | None
        Dict with: tariff_rate, reporter, partner, hs_code, year, source.
    """
    reporter_iso3 = _resolve_iso3(reporter)
    partner_iso3 = _resolve_iso3(partner)

    reporter_num = ISO3_TO_NUMERIC.get(reporter_iso3)
    partner_num = ISO3_TO_NUMERIC.get(partner_iso3)

    if not reporter_num or not partner_num:
        raise ValueError("No numeric code mapping for one of the countries.")

    hs6 = str(hs6).strip().zfill(6)

    url = (
        f"{TRAINS_BASE}/reporter/{reporter_num}"
        f"/partner/{partner_num}"
        f"/product/{hs6}"
        f"/year/{year}"
        f"/datatype/{datatype}?format=JSON"
    )

    try:
        response = requests.get(url, timeout=timeout)
    except requests.exceptions.RequestException as e:
        print(f"[WITS TRAINS] Request failed: {e}")
        return None

    if response.status_code != 200:
        print(f"[WITS TRAINS] HTTP {response.status_code} for "
              f"{reporter_iso3}→{partner_iso3} HS:{hs6} ({year})")
        return None

    try:
        data = response.json()
    except ValueError:
        print("[WITS TRAINS] Invalid JSON response.")
        return None

    try:
        obs = data["dataSets"][0]["series"]
        for key in obs:
            rate = float(obs[key]["observations"]["0"][0])
            return {
                "tariff_rate": rate,
                "reporter": reporter_iso3,
                "partner": partner_iso3,
                "hs_code": hs6,
                "year": year,
                "source": "trains",
            }
    except (KeyError, IndexError, TypeError, ValueError) as e:
        print(f"[WITS TRAINS] Parse error: {e}")
        return None

    return None


# ═══════════════════════════════════════════════════════════════════
#  Smart Lookup: tries TRAINS first, falls back to TradeStats
# ═══════════════════════════════════════════════════════════════════

def get_tariff_rate(
    reporter: str,
    partner: str,
    hs6: str,
    year: int,
    indicator: str = "AHS-WGHTD-AVRG",
    timeout: int = 15,
) -> dict | None:
    """
    Smart tariff lookup — tries HS-6 granularity first (TRAINS) across recent years,
    then falls back to product-category average (TradeStats).
    """
    # 1. Try TRAINS (HS-6) for the requested year, and back 2 years if needed
    for lookup_year in [year, year - 1, year - 2]:
        result = get_tariff_rate_trains(
            reporter, partner, hs6, lookup_year, timeout=timeout
        )
        if result:
            return result

    # 2. Fallback to TradeStats (category-level) for the requested year
    return get_tariff_for_hs_category(
        reporter, partner, hs6, year, indicator=indicator, timeout=timeout
    )


def get_all_category_tariffs(
    reporter: str,
    partner: str,
    year: int,
    indicator: str = "AHS-WGHTD-AVRG",
    timeout: int = 20,
) -> list[dict] | None:
    """
    Fetch tariff rates for ALL product categories between a country pair.
    Useful for a quick overview of trade barriers.
    """
    return get_tradestats_tariff(
        reporter, partner, year, product="all",
        indicator=indicator, timeout=timeout
    )


def get_preferential_tariff(
    reporter: str,
    partner: str,
    hs6: str,
    year: int,
    timeout: int = 20,
) -> dict | None:
    """
    Get the effectively-applied (preferential) tariff rate.
    
    Tries granular HS-6 (TRAINS) first, falls back to product category average (TradeStats).
    """
    hs6 = str(hs6).strip().zfill(6)
    
    # 1. Attempt granular HS-6 lookup via the smart get_tariff_rate function
    # Note: TradeStats (fallback inside get_tariff_rate) use AHS-WGHTD-AVRG by default.
    granular = get_tariff_rate(reporter, partner, hs6, year, timeout=timeout)
    
    group = _hs6_to_product_group(hs6)
    label = PRODUCT_GROUP_LABELS.get(group, "Unknown Category")

    if granular:
        # If we got a result, we enrich it to match the expected format
        # Granular TRAINS data usually doesn't separate AHS/MFN in one call, 
        # so for granular we treat its result as the AHS rate.
        rate = granular["tariff_rate"]
        
        # We still fetch MFN from TradeStats for context/margin if possible
        mfn_results = get_tradestats_tariff(
            reporter, partner, year, product=group,
            indicator="MFN-SMPL-AVRG", timeout=timeout
        )
        mfn_rate = mfn_results[0]["tariff_rate"] if mfn_results else rate
        margin = round(max(0, mfn_rate - rate), 4)

        return {
            "ahs_rate": rate,
            "mfn_rate": mfn_rate,
            "preference_margin": margin,
            "has_preference": margin > 0.01,
            "product_group": group,
            "product_label": label,
            "hs_code": hs6,
            "reporter": granular["reporter"],
            "partner": granular["partner"],
            "year": year,
            "source": granular["source"],
        }

    return None


def get_all_preferential_tariffs(
    reporter: str,
    partner: str,
    year: int,
    timeout: int = 20,
) -> list[dict] | None:
    """
    Fetch AHS (preferential) and MFN tariff rates for ALL product categories
    between a country pair. Shows where preferential access exists.

    Returns
    -------
    list[dict] | None
        List of dicts, each with: product_group, product_label, ahs_rate,
        mfn_rate, preference_margin, has_preference.
    """
    ahs_data = get_tradestats_tariff(
        reporter, partner, year, product="all",
        indicator="AHS-WGHTD-AVRG", timeout=timeout
    )
    mfn_data = get_tradestats_tariff(
        reporter, partner, year, product="all",
        indicator="MFN-WGHTD-AVRG", timeout=timeout
    )

    if not ahs_data:
        return None

    # Build MFN lookup by product group
    mfn_lookup = {}
    if mfn_data:
        for row in mfn_data:
            mfn_lookup[row["product_group"]] = row["tariff_rate"]

    reporter_iso3 = _resolve_iso3(reporter)
    partner_iso3 = _resolve_iso3(partner)

    results = []
    for row in ahs_data:
        group = row["product_group"]
        ahs_rate = row["tariff_rate"]
        mfn_rate = mfn_lookup.get(group)
        label = PRODUCT_GROUP_LABELS.get(group, row.get("product_label", group))

        margin = round(mfn_rate - ahs_rate, 4) if mfn_rate is not None else 0.0

        results.append({
            "product_group": group,
            "product_label": label,
            "ahs_rate": ahs_rate,
            "mfn_rate": mfn_rate,
            "preference_margin": margin,
            "has_preference": margin > 0.01,
            "reporter": reporter_iso3,
            "partner": partner_iso3,
            "year": year,
        })

    return results if results else None


def compare_tariff_by_partners(
    reporter: str,
    partners: list[str],
    hs6: str,
    year: int,
    indicator: str = "AHS-WGHTD-AVRG",
    timeout: int = 15,
) -> list[dict]:
    """
    Compare tariff rates from different partner countries for the
    same product heading into the same reporter/importer.
    """
    results = []
    for partner in partners:
        result = get_tariff_rate(
            reporter, partner, hs6, year,
            indicator=indicator, timeout=timeout
        )
        if result:
            results.append(result)

    return sorted(results, key=lambda x: x["tariff_rate"])
