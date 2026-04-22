import sys
import os
sys.path.append(os.path.join(os.getcwd(), "model"))

from shipping_landed_cost import calculate_landed_cost_live

def test(hs, origin, dest):
    print(f"Testing HS: {hs} | {origin} -> {dest}")
    res = calculate_landed_cost_live(origin, dest, "sea", 10, 1000, hs)
    if res:
        print(f"  Tariff Rate: {res['tariff_rate']}%")
        print(f"  Source: {res['is_live']}")
        print(f"  Description: {res['product_description']}")
    else:
        print("  No data found")

if __name__ == "__main__":
    # Electronics (Machinery)
    test("850172", "China", "India")
    test("847130", "China", "India")
    
    # Textiles
    test("610910", "China", "India")
    
    # Food
    test("020110", "China", "India")
