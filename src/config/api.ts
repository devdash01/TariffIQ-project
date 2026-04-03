const isProd = typeof window !== 'undefined' && 
  (window.location.hostname.includes('vercel.app') || !window.location.hostname.includes('localhost'));

// Use local proxy in production (Vercel) to bypass CORS blocks
const API_BASE_URL = isProd ? "/v2-ai-handshake" : "http://localhost:8000";

if (typeof window !== 'undefined' && isProd) {
  console.log("🛡️ TariffIQ: V2 Handshake Handled");
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
