import { useEffect, useState } from "react";
import Papa from "papaparse";
import TargetingAndAnalyicsTable from "./components/TargetingAndAnalyicsTable";
import "./index.css";

/**
 * Each CSV row = object
 * key   -> column header
 * value -> cell value
 */
type CsvRow = Record<string, string>;

function App() {
  const [data, setData] = useState<CsvRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTable, setActiveTable] =
    useState<"targeting">("targeting");

  // -----------------------------
  // LOAD CSV ON PAGE LOAD
  // -----------------------------
  useEffect(() => {
    fetch("/data/TARGETING&ANALYTICS.csv")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load CSV file");
        }
        return response.text();
      })
      .then((csvText) => {
        Papa.parse<CsvRow>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data);
            setLoading(false);
          },
        });
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
        setLoading(false);
      });
  }, []);

  // -----------------------------
  // EXPORT UPDATED CSV
  // -----------------------------
  function exportCsv(updatedData: CsvRow[]) {
    const csv = Papa.unparse(updatedData);
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "updated_targeting_analytics.csv";
    link.click();
  }

  // -----------------------------
  // UPDATE SINGLE ROW
  // -----------------------------
  function updateRow(updated: CsvRow, original: CsvRow) {
    setData((prev) =>
      prev.map((row) =>
        row === original ? updated : row
      )
    );
  }

  // -----------------------------
  // UI STATES
  // -----------------------------
  if (loading) {
    return (
      <div className="p-6">
        Loading TARGETING & ANALYTICS data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );
  }

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <div className="bg-slate-800">
        <div className="max-w-7xl mx-auto text-white py-5 text-center font-bold text-xl">
          TARGETING & ANALYTICS
        </div>
      </div>

      {/* TABLE SELECTOR */}
      <div className="max-w-8xl mx-auto mt-6 px-4">
        <div className="flex items-center gap-3 border-b">
          <button
            onClick={() => setActiveTable("targeting")}
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-all ${
              activeTable === "targeting"
                ? "border-slate-800 text-slate-800"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Targeting & Analytics
          </button>
        </div>

        {/* TABLE CONTENT */}
        <div className="mt-6">
          {activeTable === "targeting" && (
            <TargetingAndAnalyicsTable
              data={data}
              onUpdateRow={updateRow}
              onExport={() => exportCsv(data)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
