"""
TariffIQ — Demo Data Fallbacks
==============================
This module provides high-quality simulated data for use when 
API keys (Groq, Tavily, etc.) are not provided. 

This ensures the prototype remains functional for demonstrations
without requiring active billable API connections.
"""

def get_mock_hs_analysis(product_desc: str, candidates: list) -> dict:
    best = candidates[0] if candidates else {"hs_code": "0000.00", "score": 0.0}
    return {
        "primary_hs": best["hs_code"],
        "secondary_hs": candidates[1]["hs_code"] if len(candidates) > 1 else "",
        "confidence": 0.88,
        "analysis": {
            "composition_or_material_analysis": "Material verified against standard HS naming conventions.",
            "functional_or_processing_analysis": "Functional match confirmed (High).",
            "exclusion_of_alternatives": "Other headings excluded based on specificity.",
            "information_gaps": "None (using standard trade data fallback).",
            "final_justification": f"Code {best['hs_code']} represents the best semantic match for '{product_desc}'."
        },
        "candidate_explanations": {c["hs_code"]: f"Matched based on high embedding similarity ({c['score']})." for c in candidates},
        "candidate_scores": {c["hs_code"]: c["score"] for c in candidates}
    }

def get_mock_compliance_report(country: str, product_desc: str) -> dict:
    return {
        "product": product_desc,
        "country": country,
        "risk_level": "Medium",
        "estimated_complexity": "6/10",
        "summary_advice": f"Standard regulatory compliance requirements for importing into {country}. Ensure all technical documentation is translated.",
        "rules_of_origin_evaluation": [
            {
                "rule_name": "Value Addition Threshold",
                "analysis": "Matches standard 40% local content requirement for most trade agreements.",
                "status": "Met"
            },
            {
                "rule_name": "Substantial Transformation",
                "analysis": "HS Chapter change confirmed for target product.",
                "status": "Met"
            }
        ],
        "compliance_checklist": [
            {
                "category": "Certifications & Standards",
                "requirement_title": "Local Quality Standard Certification",
                "description": "Obtain necessary safety and quality certifications from local regulatory bodies.",
                "is_mandatory": True
            },
            {
                "category": "Labelling & Packaging",
                "requirement_title": "Bilingual Labelling",
                "description": "All retail packaging must show country of origin and technical specs.",
                "is_mandatory": True
            }
        ]
    }

def get_mock_vendors(country: str) -> list:
    return [
        {
            "name": f"{country} Industrial Systems",
            "website": f"https://www.{country.lower().replace(' ', '')}industrial.com",
            "snippet": "Leading manufacturer of high-precision industrial equipment.",
            "sells_product": True,
            "vendor_type": "Manufacturer",
            "red_flags": "None found",
            "trust_score": 0.88
        },
        {
            "name": "Global Trade Partners",
            "website": "https://www.globaltrade.com",
            "snippet": "Authorized distributor for international industrial brands.",
            "sells_product": True,
            "vendor_type": "Distributor",
            "red_flags": "Limited service history",
            "trust_score": 0.72
        }
    ]

def get_mock_news():
    return [
        {
            "article": {
                "title": "Global Trade Routes Stabilize Amid New Tariff Frameworks",
                "url": "#",
                "source": "Logistics World",
                "dateTime": "2026-03-31T10:00:00Z",
                "image": ""
            },
            "analysis": {
                "extracted_policy": {
                    "headline": "Tariff Stabilization Notice",
                    "affected_countries": ["Global"],
                    "tariff_direction": "stable",
                    "estimated_tariff_delta_percent": 0.0,
                    "affected_sectors": ["All"],
                    "effective_date": "2026-04-01"
                }
            }
        }
    ]
