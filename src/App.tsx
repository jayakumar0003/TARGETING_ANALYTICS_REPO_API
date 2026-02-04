import { useEffect, useState } from "react";
import Papa from "papaparse";
import TargetingAndAnalyicsTable from "./components/TargetingAndAnalyicsTable";
import "./index.css";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";

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

  // LOAD CSV ON PAGE LOAD
  useEffect(() => {
    const storedData = localStorage.getItem("targeting-data");
  
    if (storedData) {
      // ✅ Load from localStorage
      setData(JSON.parse(storedData));
      setLoading(false);
      return;
    }
  
    // ❗ First time only: load CSV
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
  
            // ✅ Save as JSON
            localStorage.setItem(
              "targeting-data",
              JSON.stringify(results.data)
            );
  
            setLoading(false);
          },
        });
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Something went wrong");
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
    setData((prev) => {
      const updatedData = prev.map((row) =>
        row === original ? updated : row
      );
  
      // ✅ Persist changes
      localStorage.setItem(
        "targeting-data",
        JSON.stringify(updatedData)
      );
  
      return updatedData;
    });
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
    <Tabs defaultValue="targeting" className="w-full">
      {/* TAB HEADER (same look as before) */}
      <div className="flex items-center gap-3 border-b">
      <TabsList className="bg-transparent p-0 !shadow-none !border-none">
  <TabsTrigger
    value="targeting"
    className="
      px-4 py-2
      font-bold text-sm
      rounded-none
      border-b-2
      !shadow-none

      data-[state=active]:border-slate-800
      data-[state=active]:text-slate-800
      data-[state=inactive]:border-transparent
      data-[state=inactive]:text-slate-500
      hover:text-slate-700
    "
  >
    Targeting & Analytics
  </TabsTrigger>
</TabsList>

      </div>

      {/* TABLE CONTENT */}
      <TabsContent value="targeting" className="mt-6">
        <TargetingAndAnalyicsTable
          data={data}
          onUpdateRow={updateRow}
          onExport={() => exportCsv(data)}
        />
      </TabsContent>
    </Tabs>
  </div>
</div>
  );
}

export default App;
