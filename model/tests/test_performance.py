import time
import sys
import os

# Add model directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "model")))

from shipping_landed_cost import compare_origins_live

def benchmark():
    HS_CODE = "020422"
    MY_COUNTRY = "india"
    MODE = "air"
    WEIGHT_KG = 500
    PRODUCT_VALUE = 10000

    print(f"Starting benchmark for HS {HS_CODE} -> {MY_COUNTRY}...")
    
    # First run (uncached but parallel)
    start_time = time.time()
    results = compare_origins_live(HS_CODE, MY_COUNTRY, MODE, WEIGHT_KG, PRODUCT_VALUE)
    end_time = time.time()
    print(f"Run 1 (Parallel, Uncached): {end_time - start_time:.2f}s")
    
    # Second run (cached)
    start_time = time.time()
    results2 = compare_origins_live(HS_CODE, MY_COUNTRY, MODE, WEIGHT_KG, PRODUCT_VALUE)
    end_time = time.time()
    print(f"Run 2 (Cached): {end_time - start_time:.2f}s")

    if results:
        print(f"Comparison returned {len(results)} results.")
    else:
        print("Benchmark failed to return results.")

if __name__ == "__main__":
    benchmark()
