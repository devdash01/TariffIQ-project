# TariffIQ: Global Trade Intelligence Platform

TariffIQ is an AI-powered optimization engine designed to automate HS-code classification, landed cost calculations, and regulatory compliance for global trade.

## Key Features

- **Automated HS Classification**: Maps product descriptions to 6-digit Harmonized System codes using WCO-certified logic and a hybrid LLM/Local search pipeline.
- **Landed Cost Engine**: Real-time integration with World Bank WITS API for global tariff lookups and shipment cost simulations.
- **Compliance Auditing**: Agentic workflow for Rules of Origin (RoO) verification and trade document auditing.
- **Resilient Fallbacks**: High-fidelity local nomenclature search for offline or rate-limited environments.

## Technical Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Framer Motion.
- **Backend**: FastAPI (Python 3.10+).
- **AI/LLM**: Groq (Llama-3.3-70b), OpenAI, Tavily Search.
- **Data**: FAISS Vector Indexing, World Bank WITS API.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/devdash01/TariffIQ.git
   cd TariffIQ
   ```

2. **Setup and Launch:**
   ```bash
   npm install
   npm run dev
   ```

3. **Backend Service:**
   The backend runs concurrently with the frontend via the main dev command, but can also be launched separately:
   ```bash
   python server_entry.py
   ```

## Author
Dakshh Goel

## License
Proprietary. Developed for Trade-Tech Hackathon 2026.
