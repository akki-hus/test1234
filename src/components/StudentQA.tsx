import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare, Loader2, ArrowRight, User, Compass, HelpCircle } from "lucide-react";
import { ChatMessage } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface StudentQAProps {
  parsedNotes: string;
  topic: string;
  profile?: any;
}

export default function StudentQA({ parsedNotes, topic, profile }: StudentQAProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Suggested questions based on topic context
  const suggestions = [
    `Summarize the 3 most critical formulas or takeaways from this textbook.`,
    `Explain the foundational concepts here in simple terms for standard ${profile?.standard || "my grade"}.`,
    `Give me a 3-question mini-quiz to test my active recall on this material.`,
    `Identify which scientific or historical terms in this document I need to memorize.`
  ];

  // Auto scroll to latest response
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Build previous messages list to preserve memory
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("/api/chat-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textNotes: parsedNotes,
          question: textToSend,
          history: historyPayload,
          standard: profile?.standard || "",
          board: profile?.board || ""
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to receive answer from Gemini tutor.");
      }

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chat question issue:", err);
      setError(err.message || "An error occurred with the AI tutor session.");
    } finally {
      setLoading(false);
    }
  };

  const cleanAnswer = (markdown: string) => {
    // Simple robust translation to clean paragraph markup inline
    return markdown
      .replace(/\*\*(.*?)\*\*/g, "<strong class='text-blue-400 font-bold'>$1</strong>")
      .replace(/\n\s*-\s+(.*?)/g, "<li class='ml-4 list-disc text-slate-300 my-1'>$1</li>")
      .replace(/\n\n/g, "<br/><br/>");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-1" id="student-qa-section">
      
      {/* Visual Header Slogan */}
      <div className="text-center space-y-1">
        <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-slate-100 flex items-center justify-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> AI STUDY COMPANION & TUTOR
        </h3>
        <p className="text-xs text-neutral-500 dark:text-slate-400 font-sans max-w-lg mx-auto font-medium">
          Ask unlimited follow-up questions from your parsed textbook PDF. Graded and board syllabus-aligned.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Helper suggestions panel */}
        <div className="md:col-span-4 bg-neutral-50 dark:bg-slate-950/50 hover:bg-neutral-100/60 dark:hover:bg-slate-950/70 border border-black/5 dark:border-white/5 p-4 rounded-2xl transition duration-150 space-y-4">
          <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-wider block font-black border-b border-black/5 dark:border-white/5 pb-2">
            Suggested Queries
          </span>
          <div className="flex flex-col gap-2.5">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(s)}
                disabled={loading}
                className="text-left py-2 px-3 text-neutral-600 dark:text-slate-300 text-xs rounded-xl bg-white dark:bg-white/5 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 hover:text-indigo-650 dark:hover:text-white border border-black/10 dark:border-white/5 hover:border-indigo-500/20 dark:hover:border-indigo-500/20 duration-150 inline-flex items-start gap-2 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{s}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-black/5 dark:border-white/5 pt-3 mt-2 text-[10px] text-neutral-450 dark:text-slate-500 font-mono leading-relaxed">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400 dark:text-slate-500 inline mr-1 -mt-0.5" />
            Your Study companion checks facts against the uploaded textbook first, then supplements with age-appropriate curriculum details.
          </div>
        </div>

        {/* Dynamic chat thread area */}
        <div className="md:col-span-8 flex flex-col h-[520px] bg-white dark:bg-[#0b0f19] border border-black/10 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Thread header */}
          <div className="bg-neutral-50 dark:bg-slate-950/50 px-4 py-3 flex items-center justify-between border-b border-black/5 dark:border-white/5">
            <span className="text-xs font-mono font-bold text-neutral-700 dark:text-slate-300">
              Active Session: {topic || "General revision context"}
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Tutor Connected
            </span>
          </div>

          {/* Messages block */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-800 dark:text-slate-200">Start your dialogue</p>
                  <p className="text-xs text-neutral-450 dark:text-slate-500 max-w-xs">Ask something specific, or pick a suggested helper question above to begin revision.</p>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div 
                  key={m.id}
                  className={`flex items-start gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    m.role === "user" ? "bg-blue-600 border border-blue-500/20" : "bg-indigo-600/30 border border-indigo-500/20"
                  }`}>
                    {m.role === "user" ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-indigo-450 dark:text-indigo-400" />}
                  </div>

                  <div className={`space-y-1 p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.role === "user" 
                      ? "bg-blue-500/10 dark:bg-blue-600/25 border border-blue-500/10 text-neutral-800 dark:text-slate-200" 
                      : "bg-neutral-50 dark:bg-slate-950/60 border border-black/5 dark:border-white/5 text-neutral-750 dark:text-slate-300"
                  }`}>
                    <div 
                      className="whitespace-pre-wrap select-text markdown-body"
                      dangerouslySetInnerHTML={{ __html: cleanAnswer(m.content) }}
                    />
                    <div className="text-[9px] text-neutral-400 dark:text-slate-500 font-mono text-right mt-1 shrink-0 block">
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400 animate-spin" />
                </div>
                <div className="bg-neutral-50 dark:bg-slate-950/40 border border-black/5 dark:border-white/5 p-3 rounded-2xl flex items-center gap-2">
                  <span className="text-xs text-neutral-450 dark:text-slate-500 font-mono">Tutor is compiling response</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/5 hover:bg-rose-100/30 dark:hover:bg-rose-500/10 transition-colors border border-rose-500/15 text-rose-600 dark:text-rose-300 text-xs font-mono leading-relaxed">
                {error}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Action Input form bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-3 bg-neutral-50 dark:bg-slate-950/70 border-t border-black/5 dark:border-white/5 flex gap-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask anything about photosynthesis, variables, milestones..."
              className="flex-1 bg-white dark:bg-slate-900 border border-black/10 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-slate-550 focus:outline-none focus:border-indigo-500/45 dark:focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/40 transition-colors"
            />
            <button
              type="submit"
              disabled={!input || !input.trim() || loading}
              className="px-4 py-2.5 bg-indigo-605 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white disabled:opacity-30 disabled:hover:bg-indigo-600 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 duration-150 shadow-md shrink-0 cursor-pointer"
            >
              Send <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
