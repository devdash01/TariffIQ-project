"""
Convert all .xlsx files in cross_country_preffered/ to .csv
Reads the 'Country-TariffData' sheet and extracts the HS code
from the Product column into a separate column.
"""

import os
import pandas as pd

XLSX_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data", "cross_country_preffered",
)

OUTPUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data", "cross_country_csv",
)

os.makedirs(OUTPUT_DIR, exist_ok=True)

converted = 0

for filename in sorted(os.listdir(XLSX_DIR)):
    if not filename.endswith(".xlsx"):
        continue

    filepath = os.path.join(XLSX_DIR, filename)
    df = pd.read_excel(filepath, sheet_name="Country-TariffData")

    # Extract HS code from "010599 - Description" format
    df["hs_code"] = df["Product"].str.extract(r"^(\d+)").iloc[:, 0]

    csv_name = filename.replace(".xlsx", ".csv")
    out_path = os.path.join(OUTPUT_DIR, csv_name)
    df.to_csv(out_path, index=False)

    converted += 1
    print(f"  ✅ {filename} → {csv_name}  ({len(df)} rows)")

print(f"\nDone. Converted {converted} files → {OUTPUT_DIR}")
