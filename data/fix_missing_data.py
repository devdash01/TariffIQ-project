import pandas as pd
import os

DATA_DIR = r"c:\Users\Dakshh Goel\TariffIQ\TarrifIQ\data"
CROSS_COUNTRY_DIR = os.path.join(DATA_DIR, "cross_country_csv")
MAIN_CSV = os.path.join(DATA_DIR, "tarrif_data.csv")

countries = ["china", "france", "india", "uae", "uk", "usa", "vietnam"]

def generate_csvs():
    print(f"Loading main dataset: {MAIN_CSV}")
    df = pd.read_csv(MAIN_CSV)
    
    # Standardize names
    df['reporter_name'] = df['reporter_name'].str.lower()
    df['product_code'] = df['product_code'].astype(str).str.zfill(6)
    
    # Define our target map for reporter names in CSV vs our internal list
    name_map = {
        "china": "china",
        "india": "india",
        "united kingdom": "uk", 
        "united states of america": "usa",
    }
    
    # Countries we want in the UI but don't have explicit CSV data for
    fallbacks = {
        "france": 12.0,  # Estimated MFN average
        "uae": 5.0,      # Common GCC rate
        "vietnam": 10.0  # Common average
    }
    
    os.makedirs(CROSS_COUNTRY_DIR, exist_ok=True)
    
    # 1. Processing explicit data from tarrif_data.csv
    for reporter_key, internal_name in name_map.items():
        print(f"Processing {internal_name} (Dataset: {reporter_key})...")
        reporter_df = df[df['reporter_name'] == reporter_key]
        if reporter_df.empty:
            print(f"  Warning: No data found for {reporter_key}")
            continue
        
        simple_df = reporter_df[['product_code', 'value']].rename(columns={
            'product_code': 'HSCode',
            'value': 'AppliedTariff'
        })
        simple_df = simple_df.dropna(subset=['AppliedTariff']).drop_duplicates(subset=['HSCode'])
        
        for partner in countries:
            if partner == internal_name: continue
            filename = f"{internal_name}_{partner}.csv"
            filepath = os.path.join(CROSS_COUNTRY_DIR, filename)
            simple_df.to_csv(filepath, index=False)

    # 2. Generating fallbacks for missing reporter data
    # Use top 1000 HS codes as placeholders if we don't have the full list
    hs_codes = df['product_code'].unique()[:1000]
    for internal_name, rate in fallbacks.items():
        print(f"Creating fallback for {internal_name} (Rate: {rate}%)...")
        fallback_df = pd.DataFrame({
            'HSCode': hs_codes,
            'AppliedTariff': rate
        })
        for partner in countries:
            if partner == internal_name: continue
            filename = f"{internal_name}_{partner}.csv"
            filepath = os.path.join(CROSS_COUNTRY_DIR, filename)
            fallback_df.to_csv(filepath, index=False)

    print("\nData synthesis complete.")

if __name__ == "__main__":
    generate_csvs()
