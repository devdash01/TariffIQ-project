const isProd = typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || !window.location.hostname.includes('localhost'));

const API_BASE_URL = isProd 
  ? "https://tariffiq-api.onrender.com" 
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

if (typeof window !== 'undefined') {
  console.log("🚀 TariffIQ API Link:", API_BASE_URL);
}

export const API_ENDPOINTS = {
  CLASSIFY: `${API_BASE_URL}/api/classify`,
  LANDED_COST: `${API_BASE_URL}/api/landed-cost`,
  COMPLIANCE: `${API_BASE_URL}/api/compliance`,
  VENDORS: `${API_BASE_URL}/api/vendors`,
  NEWS: `${API_BASE_URL}/api/news`,
  PARSE_DOCUMENT: `${API_BASE_URL}/api/parse-document`,
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default API_BASE_URL;
