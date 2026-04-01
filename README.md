# TariffIQ: The Intelligence Layer for Global Trade

**TariffIQ** is an AI-native trade optimization platform designed to simplify global logistics, automate compliance, and optimize landed costs with zero-latency intelligence.

Built for the modern exporter, TariffIQ bridges the gap between complex regulatory datasets and actionable business strategy.

---

## 🚀 The Vision

Global trade is a $25 trillion engine, yet it remains buried in manual HS-classification, opaque tariff schedules, and fragmented compliance rules. **TariffIQ** fixes this by providing an "Intelligence Layer" that sits atop global trade data (WITS, WCO) to provide real-time, agentic decision support.

---

## 🛠️ Core Engine

### 1. Intelligent HS-Classification
Our proprietary classification agent utilizes a multi-stage NLP pipeline to map product descriptions to 6-digit Harmonized System (HS) codes with WCO-certified logic.
*   **WCO GRI Logic**: Applies General Rules of Interpretation (GRI 1-6) automatically.
*   **Zero-Latency Fallback**: Hybrid search combining Groq Llama-3 with a local 10,000+ entry nomenclature database for sub-100ms response times.

### 2. Strategic Landed Cost Optimization
Stop guessing margins. Our engine provides a granular breakdown of:
*   **Real-time Tariffs**: Live integration with World Bank WITS API.
*   **Scenario Comparison**: Automated "Route-A vs Route-B" simulations (Sea vs Air vs Rail).
*   **Landed Cost Breakdown**: CIF/FOB values, import duties, VAT, and handling fees.

### 3. Agentic Compliance Layer
Autonomous agents that audit your shipments for:
*   **Rules of Origin (RoO)**: Automated substantial transformation analysis.
*   **Documentation Check**: Smart checklists for Certificates of Origin, Bill of Lading, and Quality Inspections.
*   **Risk Mitigation**: Real-time policy shock alerts from global trade news.

---

## 🏛️ Technical Architecture

*   **Frontend**: Next.js 16 (App Router) with Tailwind CSS and Framer Motion for high-fidelity interactive trade simulations.
*   **Backend**: Enterprise-grade FastAPI (Python) with asynchronous task handling.
*   **AI Stack**: Agentic workflows powered by Groq (Llama-3.3-70b), Tavily, and EventRegistry.
*   **Persistence**: FAISS semantic vector indexing for global tariff schedules.

---

## 🏁 Getting Started

### Prerequisites
*   Node.js 18+
*   Python 3.10+
*   Groq API Key (for Smart AI classification)

### 1. Clone and Install
```bash
git clone https://github.com/devdash01/TariffIQ.git
cd TariffIQ
npm install --prefix frontend
pip install -r model/requirements.txt
```

### 2. Launch Local Environment
```bash
# Runs both Frontend (3000) and API (8000) concurrently
npm run dev
```

---

## 👤 Author
**Dakshh Goel**

## 📄 License
Proprietary. Built for the Trade-Tech Hackathon 2026.
