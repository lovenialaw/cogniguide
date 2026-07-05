import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ChatAssistant } from "@/components/chat/ChatAssistant";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Real-time overview of patient wellbeing" },
  "/live": { title: "Live Monitoring", subtitle: "Real-time motion, fall detection & sensor feed" },
  "/location": { title: "Location Monitoring", subtitle: "Home safe zone & Wi-Fi based positioning" },
  "/analytics": { title: "AI Analytics", subtitle: "Trends, patterns & model confidence" },
  "/vitals": { title: "Vital Signs", subtitle: "Heart rate, oxygen, temperature & stress" },
  "/alerts": { title: "Alert History", subtitle: "Complete timeline of triggered events" },
  "/emergency": { title: "Emergency", subtitle: "Immediate response center" },
  "/settings": { title: "Settings", subtitle: "Preferences & device configuration" },
};

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const meta = PAGE_META[location.pathname] ?? { title: "COGNIGUIDE", subtitle: "" };

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:block w-[264px] shrink-0 border-r border-ink-100/70">
        <div className="fixed w-[264px] h-screen glass-panel border-r border-ink-100/70">
          <Sidebar />
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-[264px] bg-white/95 backdrop-blur-xl lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-5 right-4 flex h-8 w-8 items-center justify-center rounded-xl bg-ink-100 text-ink-500"
              >
                <X className="h-4 w-4" />
              </button>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0">
        <TopBar title={meta.title} subtitle={meta.subtitle} onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <ChatAssistant />
      </div>
    </div>
  );
}
