import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info } from "lucide-react";

type ToastType = "info" | "success";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-4 sm:right-6 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="pointer-events-auto flex items-start gap-3 rounded-2xl bg-ink-900/95 text-white px-4 py-3 shadow-xl backdrop-blur border border-white/10"
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-mint-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
              )}
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
