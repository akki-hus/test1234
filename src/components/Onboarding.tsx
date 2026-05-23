import React, { useState } from "react";
import { GraduationCap, ArrowRight, User, Mail, Lock, Sparkles, Check, Globe, HelpCircle } from "lucide-react";
import { UserProfile } from "../types";

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<"welcome" | "auth" | "academics">("welcome");
  const [mode, setMode] = useState<"login" | "signup" | "guest">("signup");
  
  // Profile Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [standard, setStandard] = useState("10"); // Default 10th
  const [board, setBoard] = useState("CBSE"); // Default CBSE
  const [errorMsg, setErrorMsg] = useState("");

  const BOARDS = [
    { id: "CBSE", name: "CBSE", label: "Central Board of Secondary Education", region: "National (India)" },
    { id: "ICSE", name: "ICSE / ISC", label: "Council for Indian School Certificate Examinations", region: "National (India)" },
    { id: "State Board", name: "State Board", label: "State-specific Official Curriculum syllabus", region: "Regional" },
    { id: "IB", name: "IB Board", label: "International Baccalaureate Organisation", region: "International" },
    { id: "IGCSE", name: "IGCSE / CIE", label: "Cambridge Assessment International Education", region: "International" },
    { id: "Other", name: "Other Syllabus", label: "Custom or alternative academic system", region: "Other" }
  ];

  const STANDARDS = Array.from({ length: 12 }, (_, i) => String(i + 1));

  const handleNextFromWelcome = () => {
    setStep("auth");
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Simple client-side validation
    if (mode === "signup") {
      if (!name.trim()) {
        setErrorMsg("Please enter your name");
        return;
      }
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setErrorMsg("Please enter a valid email address");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters");
        return;
      }
    } else if (mode === "login") {
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setErrorMsg("Please enter your registered email");
        return;
      }
      if (!password) {
        setErrorMsg("Please enter your account password");
        return;
      }
    }
    
    // Go to Academic selection
    setStep("academics");
  };

  const handleGuestContinue = () => {
    setMode("guest");
    setName("Guest Student");
    setEmail("guest@revize.ai");
    setStep("academics");
  };

  const handleFinishOnboarding = () => {
    // Construct final UserProfile structure
    const profile: UserProfile = {
      name: mode === "guest" ? "Guest Student" : name,
      email: mode === "guest" ? "guest@revize.ai" : email,
      standard,
      board,
      onboarded: true,
      isGuest: mode === "guest",
      savedReelsCount: 0
    };
    
    // Trigger callbacks & save
    onComplete(profile);
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[580px] bg-white/90 dark:bg-[#0c0d12]/50 border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-3xl flex flex-col justify-between relative overflow-hidden" id="onboarding-flow-container font-sans">
      
      {/* Dynamic silver chrome overlays */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-slate-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-400/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Top branding indicator */}
      <div className="relative z-10 flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-gradient-to-tr dark:from-white/10 dark:to-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center text-neutral-700 dark:text-slate-200">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-xs tracking-widest text-neutral-600 dark:text-slate-300">REVIZE WORKSPACE SETUP</span>
        </div>
        <div className="flex gap-2">
          <div className={`w-6 h-1 rounded-full transition-all duration-300 ${step === "welcome" ? "bg-neutral-800 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-850"}`} />
          <div className={`w-6 h-1 rounded-full transition-all duration-300 ${step === "auth" ? "bg-neutral-800 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-850"}`} />
          <div className={`w-6 h-1 rounded-full transition-all duration-300 ${step === "academics" ? "bg-neutral-800 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-850"}`} />
        </div>
      </div>

      {/* Step 1: Immersive Welcome Presentation */}
      {step === "welcome" && (
        <div className="my-auto space-y-8 py-4 text-center max-w-2xl mx-auto relative z-10" id="step-welcome">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 text-neutral-600 dark:text-slate-300 text-[10px] font-mono font-bold tracking-wider">
            <Sparkles className="w-3 h-3 text-neutral-500 dark:text-slate-400 animate-pulse" /> ADAPTIVE SYLLABUS DISCOVERY
          </div>
          
          <div className="space-y-4">
            <h1 className="font-display font-extrabold text-3xl md:text-5xl text-neutral-900 dark:text-white tracking-tight leading-tight">
              A smarter way to review. Standardized for <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-850 to-neutral-500 dark:from-white dark:via-slate-100 dark:to-slate-400">active recall.</span>
            </h1>
            <p className="text-neutral-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
              Revize synthesizes educational syllabus materials, chapters, and summary documents into highly immersive whiteboard revision slides, question cards, and guided audio scripts. 
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-4">
            <div className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-950/45 border border-black/10 dark:border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-neutral-500 dark:text-slate-400 font-extrabold block">01   PDF PARSING & NOTES</span>
              <p className="text-xs text-neutral-600 dark:text-slate-400 leading-relaxed font-sans">Upload textbook handouts to target definitions immediately.</p>
            </div>
            <div className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-950/45 border border-black/10 dark:border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-neutral-500 dark:text-slate-400 font-extrabold block">02   CINEMATIC SLIDES</span>
              <p className="text-xs text-neutral-600 dark:text-slate-400 leading-relaxed font-sans">16:9 high-contrast widescreen visuals with detailed concept notes.</p>
            </div>
            <div className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-950/45 border border-black/10 dark:border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-neutral-500 dark:text-slate-400 font-extrabold block">03   ACTIVE RECALL</span>
              <p className="text-xs text-neutral-600 dark:text-slate-400 leading-relaxed font-sans">Test knowledge instantly with on-demand flashcards and chat.</p>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleNextFromWelcome}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-mono font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-neutral-950/10 dark:hover:shadow-white/5 active:translate-y-px cursor-pointer"
              id="onboarding-welcome-next"
            >
              Configure Student Workspace <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Adaptive Credentials Gateway */}
      {step === "auth" && (
        <div className="my-auto py-4 space-y-6 relative z-10" id="step-auth">
          <div className="text-center space-y-1.5">
            <h2 className="font-display font-black text-2xl md:text-3xl text-neutral-900 dark:text-white">Choose how you wish to access</h2>
            <p className="text-neutral-550 dark:text-slate-400 text-xs">Create a quick study account to track statistics, or evaluate instantly in guest mode.</p>
          </div>

          <div className="max-w-md mx-auto bg-white/70 dark:bg-black/40 border border-black/10 dark:border-white/5 p-6 rounded-2xl shadow-xl space-y-6">
            {/* Quick Login / Signup Toggle Tabs */}
            <div className="flex p-0.5 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={() => { setMode("signup"); setErrorMsg(""); }}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-bold transition-all cursor-pointer ${
                  mode === "signup" ? "bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm border border-black/10 dark:border-white/10" : "text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
                id="tab-signup"
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setMode("login"); setErrorMsg(""); }}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-bold transition-all cursor-pointer ${
                  mode === "login" ? "bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm border border-black/10 dark:border-white/10" : "text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
                id="tab-login"
              >
                Log In
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 text-xs text-rose-500 dark:text-rose-400 text-center font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 font-sans">
              {mode === "signup" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider font-bold uppercase text-neutral-500 dark:text-slate-400 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-slate-500" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900/40 border border-black/10 dark:border-white/10 rounded-xl focus:border-neutral-400 dark:focus:border-white/20 text-sm text-neutral-900 dark:text-white focus:outline-none placeholder-neutral-400 dark:placeholder-slate-600 transition-all font-sans"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      id="input-name"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-bold uppercase text-neutral-500 dark:text-slate-400 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-slate-500" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900/40 border border-black/10 dark:border-white/10 rounded-xl focus:border-neutral-400 dark:focus:border-white/20 text-sm text-neutral-900 dark:text-white focus:outline-none placeholder-neutral-400 dark:placeholder-slate-600 transition-all font-sans"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="input-email"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-bold uppercase text-neutral-500 dark:text-slate-400 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-slate-500" />
                  <input
                    type="password"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900/40 border border-black/10 dark:border-white/10 rounded-xl focus:border-neutral-400 dark:focus:border-white/20 text-sm text-neutral-900 dark:text-white focus:outline-none placeholder-neutral-400 dark:placeholder-slate-600 transition-all font-sans"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="input-password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-neutral-950/10 dark:hover:shadow-white/5 active:translate-y-px cursor-pointer"
                >
                  {mode === "signup" ? "Create Account & Continue" : "Sign In & Continue"}
                </button>
              </div>
            </form>

            <div className="relative flex items-center justify-center my-3">
              <div className="absolute inset-0 border-t border-black/5 dark:border-white/5" />
              <span className="relative z-10 px-3 text-[9px] font-mono text-neutral-400 dark:text-slate-500 bg-white dark:bg-[#0d0f14] uppercase">Or</span>
            </div>

            <button
              type="button"
              onClick={handleGuestContinue}
              className="w-full py-2.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl border border-black/5 dark:border-white/5 transition-all text-center cursor-pointer"
              id="btn-guest-onboarding"
            >
              Evaluate instantly as Guest Student
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Grade Standard and Board Syllabus Survey Questionnaire */}
      {step === "academics" && (
        <div className="my-auto py-2 space-y-6 relative z-10" id="step-academics">
          <div className="text-center space-y-1">
            <h2 className="font-display font-black text-2xl md:text-3xl text-neutral-905 dark:text-white">Personalise Educational Focus</h2>
            <p className="text-neutral-550 dark:text-slate-400 text-xs">Let the neural generator tailor presentation vocabulary, grade difficulty, and curriculum style to your specific system.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2 items-start">
            {/* Standard Options (1st to 12th) */}
            <div className="lg:col-span-5 space-y-3">
              <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-neutral-500 dark:text-slate-400 block">
                1) TARGET STANDARD / GRADE
              </label>
              
              <div className="grid grid-cols-4 gap-2">
                {STANDARDS.map((stdNum) => {
                  const isSelected = standard === stdNum;
                  return (
                    <button
                      type="button"
                      key={stdNum}
                      onClick={() => setStandard(stdNum)}
                      className={`h-11 rounded-xl font-mono text-sm font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-neutral-900 dark:bg-white/10 text-white dark:text-white scale-[1.03] shadow-inner border border-black/10 dark:border-white/20" 
                          : "bg-neutral-50 dark:bg-[#0b0c11]/45 border border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/10 text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                      id={`std-btn-${stdNum}`}
                    >
                      <span className="text-xs font-bold">{stdNum}th</span>
                      <span className="text-[7px] text-neutral-400 dark:text-slate-505 font-mono tracking-widest uppercase truncate block">
                        {parseInt(stdNum) <= 5 ? "Primary" : parseInt(stdNum) <= 8 ? "Middle" : parseInt(stdNum) <= 10 ? "Secondary" : "Senior"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 bg-neutral-50/70 dark:bg-neutral-900/30 rounded-xl border border-black/5 dark:border-white/5 text-[11px] text-neutral-550 dark:text-slate-400 leading-relaxed font-sans mt-3">
                <span className="text-neutral-900 dark:text-white font-semibold">Standard {standard}</span> configures our core generative agents to adapt sentence structure, grading benchmarks, context details, and terminology directly for your cognitive cohort level.
              </div>
            </div>

            {/* Board Selector */}
            <div className="lg:col-span-7 space-y-3">
              <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-neutral-500 dark:text-slate-400 block">
                2) ACCREDITED BOARD SYLLABUS
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BOARDS.map((opt) => {
                  const isSelected = board === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setBoard(opt.id)}
                      className={`text-left p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "bg-neutral-100/90 dark:bg-white/[0.04] border-black/25 dark:border-white/20 shadow-inner scale-[1.01]"
                          : "bg-neutral-50 hover:bg-neutral-100/60 dark:bg-[#0b0c11]/45 border-black/10 dark:border-white/5 hover:border-black/20 dark:hover:border-white/10 hover:bg-neutral-100/30 dark:hover:bg-[#13151f]/50"
                      }`}
                      id={`board-btn-${opt.id}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-bold ${isSelected ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-slate-300"}`}>
                          {opt.name}
                        </span>
                        {isSelected && (
                          <div className="w-3.5 h-3.5 rounded-full bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-black">
                            <Check className="w-2.5 h-2.5 stroke-[4]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-500 dark:text-slate-400 mt-1 sm:line-clamp-1">{opt.label}</p>
                      <span className="text-[8px] font-mono tracking-widest text-neutral-450 dark:text-slate-500 mt-2 block uppercase font-bold">{opt.region}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-black/5 dark:border-white/5 text-center sm:text-right">
            <button
              onClick={handleFinishOnboarding}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-mono font-extrabold rounded-xl text-xs tracking-widest uppercase transition-all duration-300 shadow-md active:translate-y-px cursor-pointer"
              id="onboarding-finish"
            >
              Enter Workspace <ArrowRight className="w-4.5 h-4.5 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* Footer support labels */}
      <div className="relative z-10 pt-4 mt-6 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[10px] text-neutral-450 dark:text-slate-500 font-mono">
        <div>Registered with Secure Sandbox session keys</div>
        <div className="flex gap-3">
          <span>Board Syllabuses compliant</span>
          <span>•</span>
          <span>Full widescreen responsive standard</span>
        </div>
      </div>
    </div>
  );
}
