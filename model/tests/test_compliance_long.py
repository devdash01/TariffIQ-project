import os
import json
import sys

# Ensure model directory is in path
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
if MODEL_DIR not in sys.path:
    sys.path.insert(0, MODEL_DIR)

from compliance_agent import run_compliance_check

def test_long_description():
    product_desc = (
        "Industrial-grade platinum catalyst pellets designed for use in petrochemical refining "
        "and chemical processing industries. These high-purity catalytic materials enhance reaction efficiency, "
        "improve yield, and support continuous operation under high-temperature industrial environments. "
        "They are typically used in catalytic reforming, hydrocracking, and other specialized chemical processes. "
        "The pellets must meet strict environmental and purity standards for industrial application."
    )
    country = "USA"
    
    print(f"Testing compliance check for long description...")
    result = run_compliance_check(country, product_desc)
    
    if result:
        print("\n✅ Compliance check successful!")
        print(f"Product: {result.get('product')[:100]}...")
        print(f"Risk Level: {result.get('risk_level')}")
        
        print("\n🌍 Rules of Origin Evaluation:")
        for roo in result.get("rules_of_origin_evaluation", []):
            print(f"  - {roo['rule_name']}: {roo['status']}")
            print(f"    {roo['analysis']}")
            
        print(f"\n📝 Checklist items: {len(result.get('compliance_checklist', []))}")
    else:
        print("\n❌ Compliance check failed.")

if __name__ == "__main__":
    test_long_description()
