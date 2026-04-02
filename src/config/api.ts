/**
 * API Configuration
 * -----------------
 * During local development, the frontend talks to localhost:8000.
 * In production (Vercel), we set the NEXT_PUBLIC_API_URL environment 
 * variable to point to our Render backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
