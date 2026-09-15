/**
 * Centralized API Client for Smart Wafer Demand Prediction System
 * Communicates with Python API (api.py)
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  return res.json();
}

export async function searchCompanies(query: string) {
  const res = await fetch(`${API_BASE_URL}/api/company/search?query=${encodeURIComponent(query)}`);
  return res.json();
}

export async function getCompanyData(name: string) {
  const res = await fetch(`${API_BASE_URL}/api/company/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company: name }),
  });
  return res.json();
}

export async function predictCompany(companyData: any) {
  const res = await fetch(`${API_BASE_URL}/api/company/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company: companyData }),
  });
  return res.json();
}

export async function saveCompanyPrediction(payload: any) {
  const res = await fetch(`${API_BASE_URL}/api/company/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function searchStartup(name: string) {
  const res = await fetch(`${API_BASE_URL}/api/startups/search?name=${encodeURIComponent(name)}`);
  return res.json();
}

export async function createStartup(startupData: any) {
  const res = await fetch(`${API_BASE_URL}/api/startup/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(startupData),
  });
  return res.json();
}

export async function predictStartup(startupData: any) {
  const res = await fetch(`${API_BASE_URL}/api/startup/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(startupData),
  });
  return res.json();
}

export async function saveStartupPrediction(payload: any) {
  const res = await fetch(`${API_BASE_URL}/api/startup/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getPredictionHistory() {
  const res = await fetch(`${API_BASE_URL}/api/predictions/history`, {
    cache: "no-store",
  });
  return res.json();
}

export async function deletePrediction(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/predictions/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function comparePredictions(ids: number[]) {
  const res = await fetch(`${API_BASE_URL}/api/predictions/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prediction_ids: ids }),
  });
  return res.json();
}

export async function getDashboardData(companyId: string) {
  const res = await fetch(`${API_BASE_URL}/api/dashboard/company/${companyId}`);
  return res.json();
}

export async function getFinancialData(companyName: string) {
  const res = await fetch(`${API_BASE_URL}/api/financial/${encodeURIComponent(companyName)}`);
  return res.json();
}

export async function getMarketIntelligence() {
  const res = await fetch(`${API_BASE_URL}/api/market-intelligence`);
  return res.json();
}

export async function getDatasetScatter() {
  const res = await fetch(`${API_BASE_URL}/api/dataset/scatter`);
  return res.json();
}

export async function generatePdfReport(payload: any) {

  const res = await fetch(`${API_BASE_URL}/api/reports/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("PDF report generation failed");
  }
  return res.blob();
}
