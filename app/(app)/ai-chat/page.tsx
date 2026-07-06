"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

type Persona = "hitesh" | "piyush";
type Message = { role: "user" | "assistant"; content: string };

const PERSONAS: Record<
  Persona,
  { name: string; tagline: string; avatar: string }
> = {
  hitesh: {
    name: "Hitesh Choudhary",
    tagline: "Chai aur Code",
    avatar: "/personas/hitesh.jpg",
  },
  piyush: {
    name: "Piyush Garg",
    tagline: "Full-stack & systems",
    avatar: "/personas/piyush.jpg",
  },
};

const glassStyle: React.CSSProperties = {
  background: "var(--glass-bg)",
  backdropFilter: "blur(var(--glass-blur))",
  WebkitBackdropFilter: "blur(var(--glass-blur))",
};

async function sendMessage(persona: Persona, history: Message[]) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ persona, messages: history }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
  const data = await res.json();
  return { reply: data.reply as string, remaining: data.remaining as number };
}

export default function AIChatPage() {
  const { state: sidebarState } = useSidebar(); // "expanded" | "collapsed"
  const [persona, setPersona] = useState<Persona>("hitesh");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    fetch(`/api/history?persona=${persona}`)
      .then((res) => res.json())
      .then((data) => setMessages(data.history ?? []))
      .catch(() => setMessages([]));
  }, [persona]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    const next = [...messages, { role: "user" as const, content: input }];
    setMessages(next);
    setInput("");
    setIsLoading(true);
    try {
      const { reply, remaining } = await sendMessage(persona, next);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply?.trim() ? reply : "Something went wrong. Try again.",
        },
      ]);
      setRemaining(remaining);
    } catch (err) {
      console.error("Chat error:", err);
      const message =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full min-w-0 flex-col overflow-x-hidden bg-(--bg-page) text-(--text-primary)">
      {/* Single scroll container — top bar and composer are sticky children of this,
          so message content actually scrolls underneath them (required for glass to read as glass) */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Top bar — sticky + glass */}
        <div
          className="sticky top-0 z-10 flex min-w-0 items-center justify-between gap-2 border-b border-(--glass-border) px-3 py-2 md:px-5"
          style={glassStyle}
        >
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="h-8 w-8 shrink-0 rounded-lg text-(--text-secondary) hover:bg-(--bg-surface-hover) hover:text-(--text-primary)" />
            {sidebarState === "collapsed" && (
              <span className="font-heading hidden truncate text-sm font-semibold tracking-tight sm:inline">
                e Persona
              </span>
            )}
          </div>
          {remaining !== null && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {remaining} left
            </span>
          )}
          <div className="flex shrink-0 gap-1 rounded-full border border-(--border) p-1">
            {(Object.keys(PERSONAS) as Persona[]).map((key) => (
              <button
                key={key}
                onClick={() => setPersona(key)}
                className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
                  persona === key
                    ? "bg-(--accent) text-white"
                    : "text-muted-foreground hover:text-(--text-primary)"
                }`}
              >
                {PERSONAS[key].name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Content — grows to fill the space between the sticky bars */}
        <div className="flex min-w-0 flex-1 flex-col">
          <AnimatePresence mode="wait">
            {isEmpty ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center sm:px-6"
              >
                <img
                  src={PERSONAS[persona].avatar}
                  alt={PERSONAS[persona].name}
                  className="h-16 w-16 rounded-full border-2 border-(--accent) object-cover"
                />
                <h1 className="font-heading text-xl font-semibold sm:text-2xl">
                  Ask {PERSONAS[persona].name.split(" ")[0]} anything
                </h1>
                <p className="text-sm text-muted-foreground">
                  {PERSONAS[persona].tagline}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-w-0 flex-1 space-y-4 px-3 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6 md:px-8"
              >
                <div className="mx-auto flex min-w-0 max-w-3xl flex-col gap-4">
                  {messages.map((m, i) => (
                    <motion.div
                      key={i}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex min-w-0 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex min-w-0 max-w-[90%] gap-2 sm:max-w-[80%] sm:gap-3">
                        {m.role === "assistant" && (
                          <img
                            src={PERSONAS[persona].avatar}
                            alt={PERSONAS[persona].name}
                            className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-(--border) object-cover"
                          />
                        )}
                        <div
                          className={`min-w-0 break-words rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed sm:py-3 sm:text-base [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:break-words ${
                            m.role === "user"
                              ? "bg-(--user-bubble) text-(--user-bubble-text)"
                              : "border border-(--border) bg-(--bg-surface)"
                          }`}
                        >
                          <ReactMarkdown
                            components={{
                              a: function Anchor(props) {
                                return (
                                  <a
                                    {...props}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: "#3b82f6",
                                      textDecoration: "underline",
                                    }}
                                  />
                                );
                              },
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start gap-2 sm:gap-3">
                      <img
                        src={PERSONAS[persona].avatar}
                        alt={PERSONAS[persona].name}
                        className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-(--border) object-cover"
                      />
                      <div className="flex items-center gap-1 rounded-2xl border border-(--border) bg-(--bg-surface) px-4 py-3">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.15,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Composer — sticky + glass */}
        <div
          className="sticky bottom-0 z-10 min-w-0 border-t border-(--glass-border) px-3 py-2.5 sm:px-6 sm:py-3"
          style={glassStyle}
        >
          <div className="mx-auto flex min-w-0 max-w-3xl items-end gap-2 rounded-2xl border border-(--border) bg-(--bg-surface) p-2 focus-within:ring-1 focus-within:ring-(--accent)">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask anything..."
              className="max-h-40 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--accent) text-white transition-opacity hover:bg-(--accent-strong) disabled:opacity-30"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
