# TariffIQ — Trade Optimization Platform

TariffIQ is a trade intelligence platform built to optimize landed costs, ensure global compliance, and provide automated HS code classification. The system uses natural language processing (NLP) to analyze product descriptions and cross-reference them with global tariff datasets.

---

## Technical Features

- **HS Code Classification**: Uses SentenceTransformers (all-MiniLM-L6-v2) for semantic mapping of product descriptions to HS codes.
- **Landed Cost Engine**: Real-time integration with the World Bank WITS API for global tariff lookups and shipment cost simulations.
- **Compliance Module**: AI-driven regulatory auditing for Rules of Origin (RoO) and generic trade risk assessment.
- **Supply Chain Optimization**: Multi-scenario comparison of sourcing routes to identify the lowest landed cost for international shipments.

---

## Technology Stack

- **Frontend**: Next.js 16 (React 19), Tailwind CSS, Recharts.
- **Backend**: FastAPI, Uvicorn service.
- **Models**: SentenceTransformers, FAISS Vector Search, Groq LLM.
- **Data Source**: World Bank WITS (World Integrated Trade Solution) API.

---

## Installation & Setup

### 1. Requirements
Ensure you have Python 3.10+ and Node.js 18+ installed on your system.

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
GROQ_API_KEY=your_key_here
TAVILY_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
```

### 3. Usage
The project is unified into a single startup command:
```bash
npm run dev
```
*Port 3000 (Frontend) and Port 8000 (Backend) will launch concurrently.*

---

## Architecture

- **Parallel Processing**: Used for concurrent origin comparison to minimize latency in landed cost calculations.
- **Caching Layer**: Implements LRU-based caching for WITS API calls.
- **Fallbacks**: Includes synthetic data logic for trade routes not currently supported by direct API lookups.

---

## License
Proprietary
