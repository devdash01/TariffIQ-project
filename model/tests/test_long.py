import json
from vendor_finder import run_pipeline

r = run_pipeline("Industrial-grade platinum catalyst pellets designed for use in petrochemical refining and chemical processing industries. These high-purity catalytic materials enhance reaction efficiency, improve yield, and support continuous operation under high-temperature industrial environments.", "Vietnam")

print(json.dumps(r, indent=2))
