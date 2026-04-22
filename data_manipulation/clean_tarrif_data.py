import pandas as pd

INPUT_FILE = "/Users/ayushbhardwaj/Documents/TarrifIQ/data/tarrif_data.csv"
OUTPUT_FILE = "/Users/ayushbhardwaj/Documents/TarrifIQ/data/tariffs_2025_clean.csv"

# Load raw
df = pd.read_csv(INPUT_FILE)

# Standardize column names (strip spaces)
df.columns = df.columns.str.strip()

# Filter latest year
df = df[df["year"] == 2025]

# Filter HS22 only
df = df[df["classification_version"] == "HS22"]

# Filter MFN applied duty only
df = df[df["indicator"].str.contains("MFN_applied_duty")]

# Keep only needed columns
df = df[[
    "reporter_name",
    "year",
    "product_code",
    "value"
]]

# Rename columns
df = df.rename(columns={
    "reporter_name": "country",
    "product_code": "hs_code",
    "value": "tariff_rate"
})

# Clean types
df["hs_code"] = df["hs_code"].astype(str).str.zfill(6)
df["tariff_rate"] = df["tariff_rate"].astype(float).round(2)

# Drop duplicates (important)
df = df.drop_duplicates(subset=["country", "hs_code", "year"])

# Save
df.to_csv(OUTPUT_FILE, index=False)

print("Cleaned dataset saved:", OUTPUT_FILE)
print("Rows:", len(df))