import { useEffect, useState } from "react";
import TargetingAndAnalyicsTable from "./components/tables/TargetingAndAnalyicsTable";
import "./index.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Loader2 } from "lucide-react";

import {
  fetchTargetingApi,
  updateByPackageApi,
  updateByPackageAndPlacementApi,
  type CsvRow,
} from "./api/targeting.api";
import CampaignTable from "./components/tables/campaignTable";
import { fetchCampaignApi } from "./api/campaign.api";
import { fetchMediaPlanApi } from "./api/mediaplan.api";
import { fetchRadiaPlanApi } from "./api/radiaplan.api";
import RadiaplanTable from "./components/tables/RadiaplanTable";
import MediaplanTable from "./components/tables/MediaplanTable";

function App() {
  const [targetingdata, setTargetingData] = useState<CsvRow[]>([]);
  const [campaignData, setCampaignData] = useState<CsvRow[]>([]);
  const [mediaPlanData, setMediaPlanData] = useState<CsvRow[]>([]);
  const [radiaPlanData, setRadiaPlanData] = useState<CsvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------
  // LOAD DATA
  // -----------------------------
  useEffect(() => {
    loadTargetingData();
    loadCampaignData()
    loadRadiaPlanData()
    loadMediaPlanData()
  }, []);

  async function loadTargetingData() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTargetingApi();
      setTargetingData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function loadCampaignData() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCampaignApi();
      setCampaignData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function loadRadiaPlanData() {
    try {
      setLoading(true);
      setError(null);
  
      const data = await fetchRadiaPlanApi();
      setRadiaPlanData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function loadMediaPlanData() {
    try {
      setLoading(true);
      setError(null);
  
      const data = await fetchMediaPlanApi();
      setMediaPlanData(data);
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
      await loadTargetingData();
    } catch (err) {
      alert("Failed to update package");
      throw err;
    }
  }

  async function updateByPackageAndPlacement(payload: CsvRow) {
    try {
      await updateByPackageAndPlacementApi(payload);
      await loadTargetingData();
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
      <div className="bg-slate-800 text-white py-5 text-center font-bold text-2xl">
        Single Source Of Truth
      </div>
      
      <div className="max-w-8xl mx-auto mt-6 px-4">
        <Tabs defaultValue="radiaPlan" className="w-full">
          {/* TAB HEADER */}
          <div className="flex items-center gap-3 border-b">
            <TabsList className="bg-transparent p-0 !shadow-none !border-none">
            <TabsTrigger
                value="radiaPlan"
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
                Radia Plan
              </TabsTrigger>
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
              <TabsTrigger
                value="campaign"
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
                Campaign Overview
              </TabsTrigger>
              
              <TabsTrigger
                value="mediaPlan"
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
                Media Plan
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB CONTENT */}
          
          <TabsContent value="radiaPlan" className="mt-6">
            <RadiaplanTable data={radiaPlanData}/>
          </TabsContent>
          <TabsContent value="targeting" className="mt-6">
            <TargetingAndAnalyicsTable
              data={targetingdata}
              onUpdateByPackage={updateByPackage}
              onUpdateByPackageAndPlacement={updateByPackageAndPlacement}
            />
          </TabsContent>
          <TabsContent value="campaign" className="mt-6">
            <CampaignTable data={campaignData}/>
          </TabsContent>
          <TabsContent value="mediaPlan" className="mt-6">
            <MediaplanTable data={mediaPlanData}/>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
