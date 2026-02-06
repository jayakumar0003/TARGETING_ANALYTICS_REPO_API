
export type CsvRow = Record<string, string>;

const BASE_URL = "https://targetingandanalytics-backend.onrender.com/api/campaign";

// -----------------------------
// FETCH CAMPAIGN
// -----------------------------
export async function fetchCampaignApi(): Promise<CsvRow[]> {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const result = await response.json();
  return result.data;
}