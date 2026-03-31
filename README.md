# TariffIQ — AI-Powered Trade Optimization

TariffIQ is a modern trade intelligence platform that helps businesses optimize landed costs, ensure global compliance, and classify HS codes using AI.

## Features

- **HS Code AI**: NLP-powered harmonized system code prediction with deep explainability.
- **Landed Cost Engine**: Real-time WITS API integration for global tariff lookups and cost simulations.
- **Compliance Agent**: AI-driven regulatory checks and Rules of Origin (RoO) evaluation.
- **Policy Shock Engine**: Analyzes global news for tariff changes and trade risks.

---

## Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- [Conda](https://docs.conda.io/en/latest/) (Recommended)

### 2. Environment Setup
Create a `.env` file in the root directory with the following keys:
```env
MEGALLM_API_KEY=your_key
TAVILY_API_KEY=your_key
NEWS_API_KEY=your_key
```

### 3. Backend Setup
```bash
# Create and activate environment
conda create -n tarrifiq python=3.10
conda activate tarrifiq

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
cd model
uvicorn server:app --reload --port 8000
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:3000`.

---

## Performance Optimization
The Landed Cost engine uses:
- **Parallel processing** for concurrent origin comparisons.
- **WITS API Caching** via `lru_cache` for sub-second subsequent lookups.
- **In-memory CSV Caching** for local tariff data.

## License
MIT
