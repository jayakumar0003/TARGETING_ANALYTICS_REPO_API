import { useEffect, useState } from "react";
import TargetingAndAnalyicsTable from "./components/TargetingAndAnalyicsTable";
import "./index.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Loader2 } from "lucide-react";

type CsvRow = Record<string, string>;

function App() {
  const [data, setData] = useState<CsvRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // LOAD DATA FROM BACKEND API ON PAGE LOAD
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:3000/api/users");

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();

      setData(result.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function updateByPackage(payload: CsvRow) {
    try {
      const response = await fetch(
        "http://localhost:3000/api/users/by-package",
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
        throw new Error(errorText || "Failed to update package");
      }

      const result = await response.json();

      if (result.success) {
        await fetchUsers(); // ✅ re-fetch after update
      }
    } catch (error) {
      console.error("Package update failed:", error);
      alert("Failed to update package. Please try again.");
      throw error; // important → lets table know it failed
    }
  }

  async function updateByPackageAndPlacement(payload: CsvRow) {
    try {
      const response = await fetch(
        "http://localhost:3000/api/users/by-package-and-placement",
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
        throw new Error(errorText || "Failed to update record");
      }

      const result = await response.json();

      if (result.success) {
        // ✅ exactly like your old working code
        await fetchUsers();
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to save changes. Please try again.");
      throw error;
    }
  }

  // -----------------------------
  // UI STATES
  // -----------------------------
  if (loading) {
    return (
      <div className="flex h-[100vh] items-center justify-center">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg">Loading data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
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
              onUpdateByPackage={updateByPackage}
              onUpdateByPackageAndPlacement={updateByPackageAndPlacement}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
