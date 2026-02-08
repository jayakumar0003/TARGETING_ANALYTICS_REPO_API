export type CsvRow = Record<string, string>;

const BASE_URL = "https://targetingandanalytics-backend.onrender.com/api/mediaplan";

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

export async function updateMediaPlanAndTargetingApi(
  payload: CsvRow
): Promise<void> {
  console.log(payload);
  const response = await fetch(
    `${BASE_URL}/update-mediaplan-and-targeting-analytics`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || "Failed to update media plan and targeting data"
    );
  }
}
