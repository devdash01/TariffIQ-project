// Force production-mode for Vercel deployment
const API_BASE_URL = "/v2-ai-handshake";

if (typeof window !== 'undefined') {
  console.log("🛡️ TariffIQ: Forced V2 Handshake");
}

export const API_ENDPOINTS = {
  CLASSIFY: `${API_BASE_URL}/classify`,
  LANDED_COST: `${API_BASE_URL}/landed-cost`,
  COMPLIANCE: `${API_BASE_URL}/compliance`,
  VENDORS: `${API_BASE_URL}/vendors`,
  NEWS: `${API_BASE_URL}/news`,
  PARSE_DOCUMENT: `${API_BASE_URL}/parse-document`,
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;
