import { useEffect, useState } from "react";
import TargetingAndAnalyicsTable from "./components/TargetingAndAnalyicsTable";
import "./index.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Loader2 } from "lucide-react";

import {
  fetchUsersApi,
  updateByPackageApi,
  updateByPackageAndPlacementApi,
  type CsvRow,
} from "./api/users.api";

function App() {
  const [data, setData] = useState<CsvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------
  // LOAD DATA
  // -----------------------------
  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const users = await fetchUsersApi();
      setData(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------
  // UPDATE HANDLERS
  // -----------------------------
  async function updateByPackage(payload: CsvRow) {
    try {
      await updateByPackageApi(payload);
      await loadUsers();
    } catch (err) {
      alert("Failed to update package");
      throw err;
    }
  }

  async function updateByPackageAndPlacement(payload: CsvRow) {
    try {
      await updateByPackageAndPlacementApi(payload);
      await loadUsers();
    } catch (err) {
      alert("Failed to update record");
      throw err;
    }
  }

  // -----------------------------
  // UI STATES
  // -----------------------------
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
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
      <div className="bg-slate-800 text-white py-5 text-center font-bold text-xl">
        TARGETING & ANALYTICS
      </div>

      <div className="max-w-8xl mx-auto mt-6 px-4">
        <Tabs defaultValue="targeting">
          <TabsList>
            <TabsTrigger value="targeting">
              Targeting & Analytics
            </TabsTrigger>
          </TabsList>

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
