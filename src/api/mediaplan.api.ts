export type CsvRow = Record<string, string>;

const BASE_URL = "http://localhost:3000/api/mediaplan";

// -----------------------------
// FETCH MEDIA PLAN
// -----------------------------
export async function fetchMediaPlanApi(): Promise<CsvRow[]> {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch Media plan data");
  }

  const result = await response.json();
  return result.data;
}
