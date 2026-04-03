// Force production-mode for Vercel deployment
const PROXY_PATH = "/v2-ai-handshake";

export const API_ENDPOINTS = {
  // Direct Vercel-Native AI Bridge (No-Fail Path)
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
