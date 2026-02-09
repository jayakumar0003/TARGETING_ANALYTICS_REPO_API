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
import CampaignTable from "./components/tables/CampaignTable";
import { fetchCampaignApi } from "./api/campaign.api";
import {
  fetchMediaPlanApi,
  updateMediaPlanAndTargetingApi,
} from "./api/mediaplan.api";
import { fetchRadiaPlanApi } from "./api/radiaplan.api";
import RadiaplanTable from "./components/tables/RadiaplanTable";
import MediaplanTable from "./components/tables/MediaplanTable";
import Header from "./components/Header";

function App() {
  const [targetingdata, setTargetingData] = useState<CsvRow[]>([]);
  const [campaignData, setCampaignData] = useState<CsvRow[]>([]);
  const [mediaPlanData, setMediaPlanData] = useState<CsvRow[]>([]);
  const [radiaPlanData, setRadiaPlanData] = useState<CsvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    "radiaPlan" | "targeting" | "campaign" | "mediaPlan"
  >("radiaPlan");

  // -----------------------------
  // LOAD DATA
  // -----------------------------
  useEffect(() => {
    loadRadiaPlanData();
    loadTargetingData();
    loadCampaignData();
    loadMediaPlanData();
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
  // Update form in Media plan
  async function updateMediaPlanAndTargeting(payload: CsvRow) {
    try {
      await updateMediaPlanAndTargetingApi(payload);
      await loadTargetingData();
      await loadMediaPlanData();
    } catch (err) {
      alert("Failed to update package");
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
      {/* HEADER - Minimal & Elegant Design */}
      <Header />

      {/* MAIN CONTENT - Mobile Responsive */}
      <div className="max-w-8xl mx-auto mt-4 md:mt-6 px-3 md:px-4">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          className="w-full"
        >
          {/* TAB HEADER - Mobile Responsive */}
          <div className="flex items-center gap-3 border-b overflow-x-auto">
            <TabsList className="bg-transparent p-0 !shadow-none !border-none flex-nowrap whitespace-nowrap min-w-max md:overflow-hidden lg:overflow-hidden">
              <TabsTrigger
                value="radiaPlan"
                className="
            px-3 md:px-4 py-2
            font-bold text-xs md:text-sm
            rounded-none
            border-b-4
            !shadow-none
            min-w-max
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
                value="mediaPlan"
                className="
            px-3 md:px-4 py-2
            font-bold text-xs md:text-sm
            rounded-none
            border-b-4
            !shadow-none
            min-w-max
            data-[state=active]:border-slate-800
            data-[state=active]:text-slate-800
            data-[state=inactive]:border-transparent
            data-[state=inactive]:text-slate-500
          "
              >
                Media Plan
              </TabsTrigger>

              <TabsTrigger
                value="campaign"
                className="
            px-3 md:px-4 py-2
            font-bold text-xs md:text-sm
            rounded-none
            border-b-4
            !shadow-none
            min-w-max
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
                value="targeting"
                className="
            px-3 md:px-4 py-2
            font-bold text-xs md:text-sm
            rounded-none
            border-b-4
            !shadow-none
            min-w-max
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

          {/* TAB CONTENT */}
          <TabsContent value="radiaPlan" className="mt-4 md:mt-6">
            <RadiaplanTable data={radiaPlanData} />
          </TabsContent>
          <TabsContent value="mediaPlan" className="mt-4 md:mt-6">
            <MediaplanTable
              data={mediaPlanData}
              onSubmitMediaPlan={updateMediaPlanAndTargeting}
            />
          </TabsContent>
          <TabsContent value="campaign" className="mt-4 md:mt-6">
            <CampaignTable data={campaignData} />
          </TabsContent>
          <TabsContent value="targeting" className="mt-4 md:mt-6">
            <TargetingAndAnalyicsTable
              data={targetingdata}
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
