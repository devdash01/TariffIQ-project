import pandas as pd
import numpy as np

try:
    import torch
except ImportError:
    pass

import faiss
import os
import time
from sentence_transformers import SentenceTransformer

# === CONFIG ===
BASE_DIR = os.getcwd() # Run from root TarrifIQ/
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "model")

INPUT_FILE = os.path.join(DATA_DIR, "hs_embedding_ready.csv")
EMBEDDINGS_FILE = os.path.join(DATA_DIR, "hs_embeddings.npy")
FAISS_INDEX_FILE = os.path.join(DATA_DIR, "hs_index.faiss")
HS_CODES_FILE = os.path.join(DATA_DIR, "hs_codes.csv")

MODEL_NAME = "all-MiniLM-L6-v2"
BATCH_SIZE = 256

# === LOAD DATA ===
print("Loading data...")
df = pd.read_csv(INPUT_FILE)
texts = df["embedding_text"].tolist()
codes = df["hs_code"].astype(str).tolist()
print(f"  Loaded {len(texts)} HS code entries.")

# === EMBED ===
print(f"Loading model: {MODEL_NAME}...")
model = SentenceTransformer(MODEL_NAME)

print(f"Encoding {len(texts)} texts (batch_size={BATCH_SIZE})...")
start = time.time()
embeddings = model.encode(
    texts,
    batch_size=BATCH_SIZE,
    show_progress_bar=True,
    normalize_embeddings=True,  # L2-normalize for cosine similarity via inner product
)
elapsed = time.time() - start
print(f"  Encoding done in {elapsed:.1f}s")

embeddings = np.array(embeddings, dtype="float32")

# === BUILD FAISS INDEX ===
dim = embeddings.shape[1]
print(f"Building FAISS index (dim={dim}, n={embeddings.shape[0]})...")
index = faiss.IndexFlatIP(dim)  # Inner product on normalized vectors = cosine similarity
index.add(embeddings)

# === SAVE ===
np.save(EMBEDDINGS_FILE, embeddings)
faiss.write_index(index, FAISS_INDEX_FILE)

codes_df = pd.DataFrame({"hs_code": codes, "embedding_text": texts})
codes_df.to_csv(HS_CODES_FILE, index=False)

print(f"\nSaved:")
print(f"  Embeddings:  {EMBEDDINGS_FILE}  ({embeddings.nbytes / 1e6:.1f} MB)")
print(f"  FAISS index: {FAISS_INDEX_FILE}")
print(f"  HS codes:    {HS_CODES_FILE}")
print(f"\nDone! {len(codes)} HS codes embedded and indexed.")
