// Automatic Environment Detection
const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const PROXY_PATH = isLocal ? "http://localhost:8000/api" : "/v2-ai-handshake";

export const API_ENDPOINTS = {
  // Direct Vercel-Native AI Bridge (Triple-Fail-Safe)
  // On localhost, we prefer the local Bridge for speed and reliability.
  CLASSIFY: "/api/classify",
  
  // Render Proxy Paths (Advanced Services)
  LANDED_COST: `${PROXY_PATH}/landed-cost`,
  COMPLIANCE: `${PROXY_PATH}/compliance`,
  VENDORS: `${PROXY_PATH}/vendors`,
  NEWS: `${PROXY_PATH}/news`,
  PARSE_DOCUMENT: `${PROXY_PATH}/parse-document`,
  HEALTH: `${PROXY_PATH}/health`,
};

const API_BASE_URL = PROXY_PATH;
export default API_BASE_URL;
