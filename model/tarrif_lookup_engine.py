import os
import pandas as pd
from wits_api import get_preferential_tariff

# Ensure relative data path for portability
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(MODEL_DIR), "data")
TARIFF_CSV = os.path.join(DATA_DIR, "tarrif_data.csv")


def load_tariffs(path: str = TARIFF_CSV) -> pd.DataFrame:
    """Load the cleaned tariff dataset with RAM safety fallback."""
    try:
        if os.path.exists(path):
            # Only load if file is reasonably sized (< 50MB) for Render Free Tier
            if os.path.getsize(path) < 50 * 1024 * 1024:
                return pd.read_csv(path, dtype={"hs_code": str})
            else:
                print(f"[WARN] Tariff CSV {path} is too large for Render RAM. Using lightweight mode.")
    except Exception as e:
        print(f"[ERROR] Failed to load tariff CSV: {e}")
    
    # Minimal fallback data to prevent application crash
    return pd.DataFrame([
        {"hs_code": "847130", "country": "United States of America", "year": 2022, "tariff_rate": 0.0},
        {"hs_code": "847130", "country": "India", "year": 2022, "tariff_rate": 0.0},
        {"hs_code": "610910", "country": "United Kingdom", "year": 2022, "tariff_rate": 12.0}
    ])


def get_available_countries(hs_code: str, tariffs_df: pd.DataFrame) -> list[str]:
    """Return sorted list of countries that have a tariff for the given HS code."""
    hs_code = str(hs_code).zfill(6)
    matches = tariffs_df[tariffs_df["hs_code"] == hs_code]
    return sorted(matches["country"].unique().tolist())


def get_available_years(hs_code: str, country: str, tariffs_df: pd.DataFrame) -> list[int]:
    """Return sorted list of years available for a given HS code + country."""
    hs_code = str(hs_code).zfill(6)
    matches = tariffs_df[
        (tariffs_df["hs_code"] == hs_code) &
        (tariffs_df["country"] == country)
    ]
    return sorted(matches["year"].unique().tolist())


def get_tariff_rate(hs_code: str, country: str, year: int, tariffs_df: pd.DataFrame) -> float | None:
    """Look up the tariff rate (%) for a specific HS code + country + year from local CSV."""
    hs_code = str(hs_code).zfill(6)
    row = tariffs_df[
        (tariffs_df["hs_code"] == hs_code) &
        (tariffs_df["country"] == country) &
        (tariffs_df["year"] == year)
    ]
    if row.empty:
        return None
    return float(row.iloc[0]["tariff_rate"])


def get_tariff_rate_live(hs_code: str, origin: str, destination: str, year: int = 2021, fallback_rate: float | None = None) -> dict:
    """
    Look up the live effectively applied (preferential) tariff rate via WITS API.
    If WITS fails or returns no data, uses the fallback_rate.

    Returns dict with:
        ahs_rate, mfn_rate, preference_margin, has_preference, source, is_live
    """
    wits_data = get_preferential_tariff(
        reporter=destination,
        partner=origin,
        hs6=hs_code,
        year=year,
        timeout=15
    )
    
    if wits_data:
        wits_data["is_live"] = True
        return wits_data
        
    # Fallback to local
    return {
        "ahs_rate": fallback_rate,
        "mfn_rate": fallback_rate,
        "preference_margin": 0.0,
        "has_preference": False,
        "product_group": None,
        "product_label": "Local Data",
        "source": "local-csv",
        "is_live": False
    }


def calculate_total_cost(hs_code: str, country: str, year: int,
                         base_cost: float, tariffs_df: pd.DataFrame) -> dict | None:
    """
    Calculate the total landed cost given a base cost and tariff.

    Returns a dict with:
        - tariff_rate  : the duty percentage
        - duty_amount  : base_cost × tariff_rate / 100
        - total_cost   : base_cost + duty_amount
    Returns None if no tariff is found.
    """
    rate = get_tariff_rate(hs_code, country, year, tariffs_df)
    if rate is None:
        return None

    duty = round(base_cost * rate / 100, 2)
    total = round(base_cost + duty, 2)
    return {
        "tariff_rate": rate,
        "duty_amount": duty,
        "total_cost": total,
    }


# ── Interactive CLI ─────────────────────────────────────────────────
if __name__ == "__main__":
    df = load_tariffs()

    # 1. HS code
    hs = input("Enter HS code: ").strip()

    # 2. Show available countries
    countries = get_available_countries(hs, df)
    if not countries:
        print(f"No tariff data found for HS code: {hs}")
        exit()

    print(f"\n{len(countries)} countries available for HS {hs}:")
    for i, c in enumerate(countries, 1):
        print(f"  {i}. {c}")

    choice = int(input("\nSelect country (number): ").strip())
    country = countries[choice - 1]

    # 3. Show available years
    years = get_available_years(hs, country, df)
    if len(years) == 1:
        year = years[0]
        print(f"\nOnly year available: {year}")
    else:
        print(f"\nAvailable years: {years}")
        year = int(input("Select year: ").strip())

    # 4. Get tariff rate
    rate = get_tariff_rate(hs, country, year, df)
    print(f"\nTariff rate for {country} | HS {hs} | {year}: {rate}%")

    # 5. Calculate total cost
    base = float(input("\nEnter base cost ($): ").strip())
    result = calculate_total_cost(hs, country, year, base, df)

    print(f"\n{'─' * 40}")
    print(f"  Base cost     : ${base:,.2f}")
    print(f"  Tariff rate   : {result['tariff_rate']}%")
    print(f"  Duty amount   : ${result['duty_amount']:,.2f}")
    print(f"  Total cost    : ${result['total_cost']:,.2f}")
    print(f"{'─' * 40}")
