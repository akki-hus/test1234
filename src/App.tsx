import React, { useState, useEffect } from "react";
import UploadForm from "./components/UploadForm";
import ProgressBar from "./components/ProgressBar";
import ReelPlayer from "./components/ReelPlayer";
import Onboarding from "./components/Onboarding";
import Pricing from "./components/Pricing";
import { Slide, UserProfile } from "./types";
import { Sparkles, Brain, GraduationCap, AlertCircle, RefreshCw, User, LogOut, Check, Layers, ArrowLeft, Sun, Moon, CreditCard } from "lucide-react";

export default function App() {
  const [activeView, setActiveView] = useState<"upload" | "generating" | "player" | "pricing">("upload");
  const [prePricingView, setPrePricingView] = useState<"upload" | "generating" | "player">("upload");
  const [currentStage, setCurrentStage] = useState(0);
  const [topic, setTopic] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [parsedNotes, setParsedNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [initialTab, setInitialTab] = useState<"reel" | "flashcards" | "qa">("reel");
  
  // Bright Mode & Dark Mode State (default to bright/light mode)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("revize_theme");
      return (saved as "light" | "dark") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
    localStorage.setItem("revize_theme", theme);
  }, [theme]);

  // Student profile state persistence
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("revize_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Progressive simulation of generations phases
  useEffect(() => {
    let timer: number | null = null;
    if (activeView === "generating") {
      setCurrentStage(0);
      
      const stagesTimeline = [
        { stage: 1, delay: 6000 },  // visual designing starts
        { stage: 2, delay: 15000 }, // TTS script voice starts
        { stage: 3, delay: 28000 }  // slideshow movie compilation starts
      ];

      stagesTimeline.forEach(({ stage, delay }) => {
        setTimeout(() => {
          setCurrentStage((prev) => Math.max(prev, stage));
        }, delay);
      });
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [activeView]);

  const handleGenerate = async (
    data: { file: File | null; textNotes: string; topic: string },
    mode: "reel" | "flashcards" | "qa" = "reel"
  ) => {
    try {
      setError(null);
      setInitialTab(mode);

      // Instantly handle notes without PDF upload if mode is flashcards or Q&A
      if (mode !== "reel" && !data.file) {
        setTopic(data.topic || "Study Topic");
        setSlides([]);
        setParsedNotes(data.textNotes || "");
        setActiveView("player");
        return;
      }

      setActiveView("generating");
      setCurrentStage(0);

      // Choose endpoint: /api/generate for full reel synthesis, /api/parse-document for rapid text extract
      const endpoint = mode === "reel" ? "/api/generate" : "/api/parse-document";

      // Construct standard form data for transmission
      const formData = new FormData();
      if (data.file) {
        formData.append("pdfFile", data.file);
      }
      formData.append("textNotes", data.textNotes);
      formData.append("topic", data.topic);
      if (profile) {
        formData.append("standard", profile.standard || "");
        formData.append("board", profile.board || "");
      }

      console.log(`Triggering study processing with endpoint: ${endpoint}...`);
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData
      });

      let result: any = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      }

      if (!response.ok) {
        const errorMsg = result?.error || `Server returned error (${response.status}): ${response.statusText || "Please wait a moment and try again."}`;
        throw new Error(errorMsg);
      }

      if (!result || !result.success) {
        throw new Error(result?.error || "Generation pipeline failed. Please check your text notes content or file size.");
      }

      // Generation successful! Update states
      setTopic(result.topic || data.topic || "Study Revision Review");
      setSlides(result.slides || []);
      setParsedNotes(result.parsedNotes || data.textNotes || "");
      setActiveView("player");
      
    } catch (err: any) {
      console.error("Pipeline failure:", err);
      let userFriendlyError = err.message || "An unexpected error occurred during synthesis.";
      if (userFriendlyError.includes("Failed to fetch") || userFriendlyError.includes("failed to fetch")) {
        userFriendlyError = "Network error: The connection was interrupted or timed out. This typically occurs when uploading very large files or due to a temporary network blip. We have optimized text extraction to the first 15 pages—please try uploading again, or copy and paste the core text notes directly into the text editor!";
      }
      setError(userFriendlyError);
      setActiveView("upload");
    }
  };

  const handleReset = () => {
    setActiveView("upload");
    setSlides([]);
    setTopic("");
    setParsedNotes("");
    setError(null);
  };

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem("revize_profile", JSON.stringify(newProfile));
  };

  const handleModifyProfile = () => {
    // Reset onboarding state in order to select options or choose another board
    if (profile) {
      const resetOnboard = { ...profile, onboarded: false };
      setProfile(resetOnboard);
    } else {
      setProfile(null);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem("revize_profile");
    setProfile(null);
    handleReset();
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden font-sans border-t-2 border-slate-200/50 dark:border-white/10 text-neutral-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Premium Apple Liquid Chrome ambient lighting effects */}
      <div className="absolute top-[-30%] left-[10%] w-[70%] aspect-square rounded-full bg-slate-500/[0.04] dark:bg-slate-500/[0.04] blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[10%] w-[60%] aspect-square rounded-full bg-slate-400/[0.03] dark:bg-slate-400/[0.03] blur-[150px] pointer-events-none" />

      {/* Primary Apple-style Frosted Navbar header */}
      <header className="relative z-10 border-b border-black/[0.06] dark:border-white/5 bg-white/70 dark:bg-[#0a0b10]/60 backdrop-blur-2xl transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-black/10 to-black/5 dark:from-white/20 dark:via-white/5 dark:to-white/10 p-[1px] shadow-sm group-hover:scale-105 duration-300">
              <div className="w-full h-full bg-[#f8f9fc] dark:bg-[#111219] rounded-xl flex items-center justify-center text-slate-800 dark:text-slate-200">
                <GraduationCap className="w-5 h-5 text-neutral-700 dark:text-neutral-300 duration-300 group-hover:rotate-12" />
              </div>
            </div>
            <div>
              <span className="font-display font-black text-lg tracking-widest bg-gradient-to-r from-neutral-900 via-neutral-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">REVIZE</span>
              <span className="text-[8px] font-mono tracking-widest text-neutral-500 dark:text-slate-400 block uppercase font-bold">STUDY ENGINE & REELS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {profile && profile.onboarded && (
              <div className="flex items-center gap-2.5 bg-white/50 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10 px-3.5 py-1.5 rounded-xl text-xs shadow-inner" id="header-student-badge">
                <div className="w-2 h-2 rounded-full bg-neutral-800 dark:bg-white status-pulsar shrink-0" />
                <div className="text-left leading-none font-mono">
                  <span className="text-neutral-900 dark:text-slate-100 text-[10px] font-bold block truncate max-w-[120px]">
                    {profile.name}
                  </span>
                  <span className="text-neutral-500 dark:text-slate-400 text-[8px] font-extrabold tracking-wider uppercase block mt-0.5">
                    Grade {profile.standard} • {profile.board}
                  </span>
                </div>
                <button
                  onClick={handleModifyProfile}
                  title="Switch Academic Cohort/Standard"
                  className="ml-2 px-2 py-1 text-[9px] font-mono font-bold text-neutral-600 dark:text-slate-400 hover:text-black dark:hover:text-white bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-black/15 dark:border-white/5 rounded-lg duration-150 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={handleLogOut}
                  title="Log Out Student"
                  className="text-neutral-500 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 p-1 duration-150 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Premium Theme Switcher Button */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              className="p-2 rounded-xl bg-white/80 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-neutral-600 dark:text-slate-400 hover:text-black dark:hover:text-white duration-200 cursor-pointer flex items-center justify-center shadow-sm"
              id="theme-toggle-button"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-slate-500 hover:text-indigo-600 duration-150" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 duration-150" />
              )}
            </button>

            {/* Premium Pricing Plan Switcher */}
            <button
              onClick={() => {
                if (activeView !== "pricing") {
                  setPrePricingView(activeView === "pricing" ? "upload" : activeView);
                  setActiveView("pricing");
                } else {
                  setActiveView(prePricingView);
                }
              }}
              title="View Premium Pricing Passes"
              className={`p-2 px-3 rounded-xl border flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider duration-200 cursor-pointer shadow-sm ${
                activeView === "pricing"
                  ? "bg-amber-500 border-amber-500 hover:bg-amber-600 text-white"
                  : "bg-white/80 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-neutral-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
              }`}
              id="pricing-nav-toggle"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pricing</span>
            </button>
            
            <a 
              href="https://ai.studio/build" 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] text-neutral-600 dark:text-slate-400 hover:text-black dark:hover:text-white font-mono bg-black/[0.03] hover:bg-black/[0.08] dark:bg-white/[0.03] dark:hover:bg-white/[0.08] border border-black/10 dark:border-white/10 px-3.5 py-2 rounded-xl transition-all duration-300 font-bold uppercase tracking-wider shadow-sm"
            >
              STUDIO BUILD
            </a>
          </div>
        </div>
      </header>

      {/* Main Container screen elements */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-10 md:py-16 relative z-10 flex flex-col justify-center">
        
        {/* Render Onboarding Flow if not yet onboarded */}
        {!profile || !profile.onboarded ? (
          <Onboarding onComplete={handleOnboardingComplete} />
        ) : (
          <>
            {/* Top visual slogan headers (Only show in Upload View) */}
            {activeView === "upload" && (
              <div className="text-center space-y-4 mb-12 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 text-neutral-700 dark:text-slate-300 text-xs font-mono font-bold shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-600 dark:text-slate-200 animate-pulse" />
                  Grade {profile.standard} ({profile.board}) Curriculum Adaptive
                </div>
                
                <h1 className="font-display font-extrabold text-3xl md:text-5xl text-neutral-900 dark:text-white tracking-tight leading-tight">
                  Accelerate comprehension with <span className="bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-500 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">AI Study Reels</span>
                </h1>
                
                <p className="text-neutral-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-sans max-w-xl mx-auto">
                  Welcome back, <span className="text-neutral-900 dark:text-white font-semibold">{profile.name}</span>. Upload a study PDF or paste notes below. Our Gemini pipeline extracts core concepts into cinematic widescreen whiteboard slideshows, interactive flashcard decks, or on-demand chat tutoring.
                </p>
              </div>
            )}

            {/* Dynamic Display Error Block */}
            {error && (
              <div className="w-full max-w-xl mx-auto mb-8 bg-rose-950/20 hover:bg-rose-950/30 transition-all border border-rose-500/20 p-5 rounded-2xl flex items-start gap-4 shadow-lg">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-display font-bold text-sm text-rose-300">Synthesis Pipeline Interrupted</span>
                  <p className="text-xs text-slate-300 leading-normal font-sans">{error}</p>
                  <div className="pt-2">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 text-xs text-rose-400 font-mono font-semibold underline hover:text-rose-300"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Sub-Views Rendering router */}
            <div className="w-full">
              {activeView === "upload" && (
                <UploadForm onGenerate={handleGenerate} isLoading={activeView === "generating"} />
              )}

              {activeView === "generating" && (
                <ProgressBar currentStage={currentStage} />
              )}

              {activeView === "player" && (
                <ReelPlayer 
                  topic={topic} 
                  slides={slides} 
                  parsedNotes={parsedNotes} 
                  onReset={handleReset} 
                  profile={profile || undefined} 
                  initialTab={initialTab}
                  onCompileReel={(topicName, notes) => {
                    handleGenerate({ file: null, textNotes: notes, topic: topicName }, "reel");
                  }}
                />
              )}

              {activeView === "pricing" && (
                <Pricing
                  profile={profile}
                  onClose={() => setActiveView(prePricingView)}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer Branding elements */}
      <footer className="relative z-10 py-6 border-t border-black/[0.06] dark:border-white/5 bg-black/[0.01] dark:bg-slate-950/20 mt-12 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 dark:text-slate-500 text-xs text-center sm:text-left font-mono">
          <div className="space-y-1">
            <p>© 2026 REVIZE AI Inc. • Powered by Google Gemini-3.5 and @google/genai.</p>
            <p className="text-[10px] text-neutral-400 dark:text-slate-600 shrink-0">Bespoke neural infographics synced frame-by-frame instantly.</p>
          </div>
          <div className="flex gap-4">
            <span className="text-neutral-500 dark:text-slate-500 hover:text-neutral-700 dark:hover:text-slate-400">Security Encrypted</span>
            <span>•</span>
            <span className="text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-300">Standard Sandbox mode</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
