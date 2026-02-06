
export type CsvRow = Record<string, string>;

const BASE_URL = "https://targetingandanalytics-backend.onrender.com/api/radiaplan";

// -----------------------------
// FETCH RADIA PLAN
// -----------------------------
export async function fetchRadiaPlanApi(): Promise<CsvRow[]> {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch Radia plan data");
  }

  const result = await response.json();
  return result.data;
}