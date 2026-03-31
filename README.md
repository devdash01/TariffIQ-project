# TariffIQ — Trade Optimization Platform

TariffIQ is a trade intelligence platform built to optimize landed costs, ensure global compliance, and provide automated HS code classification. The system uses natural language processing (NLP) to analyze product descriptions and cross-reference them with global tariff datasets.

---

## Live Deployment 🚀

The platform is officially deployed in a distributed cloud environment:
- **Frontend**: [Vercel](https://vercel.com) (Next.js 16)
- **Backend API**: [Render](https://render.com) (FastAPI + AI Engine)

---

## Technical Features 🛠️

- **HS Code Classification**: Uses SentenceTransformers (`all-MiniLM-L6-v2`) and FAISS Vector Search for 10ms semantic mapping of product descriptions.
- **Landed Cost Engine**: Real-time integration with the World Bank WITS API for global tariff lookups and shipment cost simulations.
- **Compliance Module**: AI-driven regulatory auditing for Rules of Origin (RoO) and generic trade risk assessment.
- **Simulation Mode**: Built-in graceful fallbacks for all AI endpoints (Groq, Tavily). If API keys are absent, the system provides high-fidelity simulated data to maintain prototype functionality.

---

## Architecture 🏛️

- **Parallel Processing**: Concurrent origin-comparison logic minimizes latency in multi-scenario simulations.
- **Environment-Aware**: Seamlessly switches between `localhost` and production API endpoints based on detected host.
- **Data Caching**: LRU-based caching for frequent WITS API calls to satisfy rate limits and performance targets.

---

## Author
**Dakshh Goel**

## License
Proprietary
