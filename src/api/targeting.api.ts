
export type CsvRow = Record<string, string>;

const BASE_URL = "https://targetingandanalytics-backend.onrender.com/api/targeting";

// -----------------------------
// FETCH TARGETING DATA
// -----------------------------
export async function fetchTargetingApi(): Promise<CsvRow[]> {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const result = await response.json();
  return result.data;
}

// -----------------------------
// UPDATE BY PACKAGE
// -----------------------------
export async function updateByPackageApi(payload: CsvRow): Promise<void> {
  const response = await fetch(`${BASE_URL}/by-package`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update package");
  }
}

// -----------------------------
// UPDATE BY PACKAGE + PLACEMENT
// -----------------------------
export async function updateByPackageAndPlacementApi(
  payload: CsvRow
): Promise<void> {
  const response = await fetch(`${BASE_URL}/by-package-and-placement`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update record");
  }
}
