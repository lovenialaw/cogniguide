import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { usePatientData } from "@/context/PatientDataContext";
import { askAssistant } from "@/lib/chatAssistant";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { ChatMessageContent } from "./ChatMessageContent";

const SUGGESTIONS = [
  "How is Eleanor doing right now?",
  "Summarize her vitals",
  "What's the fall trend?",
  "Any active alerts?",
];

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: `${role}-${Date.now()}`, role, content, timestamp: new Date() };
}

export function ChatAssistant() {
  const patientData = usePatientData();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createMessage(
      "assistant",
      "Hello! I'm your **COGNIGUIDE Assistant**. Ask me about Eleanor's vitals, location, fall trends, or alerts — I use live dashboard data to help you care for her."
    ),
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasUrgent = patientData.fallDetected || !!patientData.wanderingAlert;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || typing) return;

      setInput("");
      const userMsg = createMessage("user", trimmed);
      setMessages((prev) => [...prev, userMsg]);
      setTyping(true);

      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content.replace(/\*\*/g, ""),
      }));

      try {
        const reply = await askAssistant(trimmed, history, patientData);
        // brief delay so typing indicator feels natural for local responses
        await new Promise((r) => setTimeout(r, 400));
        setMessages((prev) => [...prev, createMessage("assistant", reply)]);
      } catch {
        setMessages((prev) => [
          ...prev,
          createMessage("assistant", "Sorry, I couldn't process that. Please try again."),
        ]);
      } finally {
        setTyping(false);
      }
    },
    [messages, patientData, typing]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden glass-card shadow-glass-lg border border-white/60",
              "bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px]",
              "h-[min(560px,calc(100vh-7rem))] rounded-3xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-ink-100/80 px-4 py-3.5 bg-gradient-to-r from-brand-500/8 to-mint-500/8">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-mint-500 text-white shadow-glow-brand">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-ink-900 text-sm flex items-center gap-1.5">
                  COGNIGUIDE Assistant
                  <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                </p>
                <p className="text-[11px] text-ink-400 truncate">
                  {import.meta.env.VITE_OPENAI_API_KEY ? "Powered by GPT-4o mini" : "Context-aware care assistant"}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink-100/80 text-ink-500 hover:text-ink-700 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5",
                      msg.role === "user"
                        ? "bg-brand-500 text-white rounded-br-md"
                        : "bg-ink-50 border border-ink-100 rounded-bl-md"
                    )}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <ChatMessageContent content={msg.content} />
                    )}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-ink-50 border border-ink-100 px-4 py-3 flex gap-1 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-300 animate-bounce [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-300 animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-300 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && !typing && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-full bg-brand-500/8 border border-brand-500/15 px-3 py-1.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-500/15 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-ink-100/80 p-3 flex gap-2 items-end bg-white/50">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about vitals, falls, location..."
                rows={1}
                className="flex-1 resize-none rounded-2xl bg-ink-50 border border-ink-100 px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-300 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 max-h-24"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-glow-brand hover:bg-brand-600 disabled:opacity-40 disabled:shadow-none transition-all"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed z-50 bottom-6 right-4 sm:right-6 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-glass-lg transition-colors",
          open ? "bg-ink-700" : "bg-gradient-to-br from-brand-500 to-mint-500 shadow-glow-brand",
          hasUrgent && !open && "animate-pulse-slow ring-4 ring-danger/30"
        )}
        aria-label={open ? "Close assistant" : "Open AI assistant"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {hasUrgent && !open && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold ring-2 ring-white">
            !
          </span>
        )}
      </motion.button>
    </>
  );
}
