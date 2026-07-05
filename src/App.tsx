import { HashRouter, Route, Routes } from "react-router-dom";
import { PatientDataProvider } from "@/context/PatientDataContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardHome from "@/pages/DashboardHome";
import LiveMonitoring from "@/pages/LiveMonitoring";
import LocationMonitoring from "@/pages/LocationMonitoring";
import AIAnalytics from "@/pages/AIAnalytics";
import VitalSigns from "@/pages/VitalSigns";
import AlertHistory from "@/pages/AlertHistory";
import Emergency from "@/pages/Emergency";
import Settings from "@/pages/Settings";

function App() {
  return (
    <PatientDataProvider>
      <HashRouter>
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
      </HashRouter>
    </PatientDataProvider>
  );
}

export default App;
