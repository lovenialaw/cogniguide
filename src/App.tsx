import { Suspense, lazy } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { PatientDataProvider } from "@/context/PatientDataContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const DashboardHome = lazy(() => import("@/pages/DashboardHome"));
const LiveMonitoring = lazy(() => import("@/pages/LiveMonitoring"));
const LocationMonitoring = lazy(() => import("@/pages/LocationMonitoring"));
const AIAnalytics = lazy(() => import("@/pages/AIAnalytics"));
const VitalSigns = lazy(() => import("@/pages/VitalSigns"));
const AlertHistory = lazy(() => import("@/pages/AlertHistory"));
const Emergency = lazy(() => import("@/pages/Emergency"));
const Settings = lazy(() => import("@/pages/Settings"));

function PageFallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-10 w-10 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
    </div>
  );
}

function App() {
  return (
    <PatientDataProvider>
      <HashRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/live" element={<LiveMonitoring />} />
              <Route path="/location" element={<LocationMonitoring />} />
              <Route path="/analytics" element={<AIAnalytics />} />
              <Route path="/vitals" element={<VitalSigns />} />
              <Route path="/alerts" element={<AlertHistory />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </PatientDataProvider>
  );
}

export default App;
