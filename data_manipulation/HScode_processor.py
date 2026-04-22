import pandas as pd
import re
import os

# === CONFIG ===
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
INPUT_FILE = os.path.join(DATA_DIR, "HSProducts - HS Nomenclature.csv")
OUTPUT_FILE = os.path.join(DATA_DIR, "hs_embedding_ready.csv")

# === LOAD ===
df = pd.read_csv(INPUT_FILE)
df.columns = df.columns.str.strip()

# Normalize column names if needed
if "Product Description" in df.columns:
    df.rename(columns={"Product Description": "ProductDescription"}, inplace=True)

def clean_text(text):
    text = str(text)

    # Remove year ranges like (-2001) or (2002-2011)
    text = re.sub(r"\(\-?\d{4}.*?\)", "", text)

    # Remove leading code artifacts and dashes
    text = re.sub(r"^\d+\s*", "", text)
    text = re.sub(r"^-+\s*", "", text)
    text = re.sub(r"^--+\s*", "", text)

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    text = text.strip().rstrip(".")
    return text


# === Detect leaf nodes ===
df["NextTier"] = df["Tier"].shift(-1)
df["IsLeaf"] = df["NextTier"].isna() | (df["NextTier"] <= df["Tier"])

hierarchy = {}
results = []

for idx, row in df.iterrows():
    tier = int(row["Tier"])
    desc = clean_text(row["ProductDescription"])
    code = str(row["ProductCode"])

    # Ignore Tier 0 completely
    if tier == 0:
        continue

    # Update hierarchy
    hierarchy[tier] = desc

    # Remove deeper tiers if moving upward
    for k in list(hierarchy.keys()):
        if k > tier:
            del hierarchy[k]

    # Process only leaf nodes
    if row["IsLeaf"] and code.lower() != "total":

        ordered_tiers = sorted(hierarchy.keys())
        ordered_desc = [hierarchy[t] for t in ordered_tiers]

        # Skip if too shallow
        if len(ordered_desc) < 2:
            continue

        # Most specific
        product = ordered_desc[-1]

        # Immediate parent
        parent = ordered_desc[-2]

        # Broader context (one level above parent if exists)
        broader = ordered_desc[-3] if len(ordered_desc) >= 3 else None

        # Merge naturally
        if product.lower().startswith(parent.lower()):
            merged = product
        else:
            merged = f"{parent} {product}"

        if broader:
            final_text = f"{merged}, classified under {broader.lower()}."
        else:
            final_text = f"{merged}."

        results.append({
            "hs_code": code,
            "embedding_text": final_text
        })


# === SAVE ===
output_df = pd.DataFrame(results)
output_df.to_csv(OUTPUT_FILE, index=False)

print(f"Saved {len(output_df)} cleaned, embedding-optimized records.")