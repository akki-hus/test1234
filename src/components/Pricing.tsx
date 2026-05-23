import React, { useState } from "react";
import { Check, X, Sparkles, GraduationCap, TrendingUp, HelpCircle, ArrowLeft, CreditCard, Flame, Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import { UserProfile } from "../types";

interface PricingProps {
  onClose: () => void;
  profile: UserProfile | null;
}

export default function Pricing({ onClose, profile }: PricingProps) {
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"idle" | "processing" | "success">("idle");

  const plans = [
    {
      id: "basic",
      name: "Basic Study Pass",
      tagline: "Perfect for secondary school active testers.",
      price: { INR: 99, USD: 1.49 },
      icon: GraduationCap,
      color: "from-blue-500/10 to-transparent",
      borderColor: "border-black/10 dark:border-white/10",
      buttonStyle: "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-200 border border-neutral-200 dark:border-white/5",
      features: [
        { text: "Standard Text-to-Slide Synth", included: true },
        { text: "10 study cards per active session", included: true },
        { text: "Up to 5 Pages PDF Document upload", included: true },
        { text: "Standard Definition (480p) Exports", included: true },
        { text: "Board aligned syllabus terms", included: false },
        { text: "Ultra-low voice narration tracks", included: false },
        { text: "Unlimited OCR text recognition", included: false },
        { text: "Dedicated GPU prioritised synthesis", included: false },
      ],
      badge: null
    },
    {
      id: "genius",
      name: "Genius Academic Pro",
      tagline: "Accelerated recall for competitive syllabuses.",
      price: { INR: 199, USD: 2.99 },
      icon: Flame,
      color: "from-amber-500/10 to-transparent",
      borderColor: "border-amber-500/20 dark:border-amber-500/30",
      buttonStyle: "bg-neutral-950 dark:bg-white text-white dark:text-black hover:bg-neutral-850 dark:hover:bg-slate-200 shadow-md",
      features: [
        { text: "Interactive Widescreen Whiteboards", included: true },
        { text: "50 study cards & fully tracked spaced-rep", included: true },
        { text: "Up to 50 Pages PDF Document upload", included: true },
        { text: "High Definition (720p) Cinematic Exports", included: true },
        { text: "Board aligned syllabus terms (CBSE, ICSE etc.)", included: true },
        { text: "Ultra-low voice narration tracks", included: true },
        { text: "Unlimited OCR text recognition", included: false },
        { text: "Dedicated GPU prioritised synthesis", included: false },
      ],
      badge: "MOST POPULAR"
    },
    {
      id: "master",
      name: "Master Class Ultimate",
      tagline: "The total curriculum mastery suite.",
      price: { INR: 299, USD: 4.49 },
      icon: Award,
      color: "from-indigo-500/10 to-transparent",
      borderColor: "border-indigo-550/20 dark:border-indigo-500/30",
      buttonStyle: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/10",
      features: [
        { text: "All Cinematic Whiteboard features", included: true },
        { text: "Unlimited flashcards with neural spacing metrics", included: true },
        { text: "Unlimited pages PDF ingestion (OCR, formulas, charts)", included: true },
        { text: "Ultra High Definition (1080p) Video Exports", included: true },
        { text: "Board aligned syllabus terms (All standard variants)", included: true },
        { text: "Ultra-low voice narration tracks (Real-time AI TTS)", included: true },
        { text: "Unlimited custom Q&A chat tokens", included: true },
        { text: "Dedicated GPU prioritized synthesis (Under 15s)", included: true },
      ],
      badge: "BEST VALUE"
    }
  ];

  const handleCheckoutMock = (planId: string) => {
    setSelectedPlan(planId);
    setCheckoutStep("processing");
    setTimeout(() => {
      setCheckoutStep("success");
    }, 1500);
  };

  const getActivePlanName = () => {
    return plans.find(p => p.id === selectedPlan)?.name || "Plan";
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 animate-fade-in" id="pricing-workspace">
      
      {/* Top action block with back navigations */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-6">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer group"
          id="btn-pricing-back"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> RETURN TO STUDY WORKSPACE
        </button>

        {/* Currency Switcher */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-450 dark:text-slate-400">
            Payment Currency:
          </span>
          <div className="inline-flex p-0.5 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-black/5 dark:border-white/5">
            <button
              onClick={() => setCurrency("INR")}
              className={`px-3 py-1 rounded text-[10px] font-mono font-extrabold transition-all cursor-pointer ${
                currency === "INR"
                  ? "bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm border border-black/10 dark:border-white/10"
                  : "text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              INR (₹)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1 rounded text-[10px] font-mono font-extrabold transition-all cursor-pointer ${
                currency === "USD"
                  ? "bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm border border-black/10 dark:border-white/10"
                  : "text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>
      </div>

      {/* Main Headline */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/[0.04] dark:bg-blue-500/10 border border-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Unlock Advanced Study recall
        </div>
        <h2 className="font-display font-black text-2xl md:text-4xl text-neutral-905 dark:text-white tracking-tight">
          Flexible Passes for Intelligent Revize.
        </h2>
        <p className="text-neutral-550 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
          Choose a program engineered precisely for your curriculum. Academic standard benchmarks, kinetic processing limits, and active Q&A tutors scale progressively.
        </p>
      </div>

      {/* Pricing Mock Success Modal Overlays */}
      {checkoutStep !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" id="pricing-checkout-overlay">
          <div className="w-full max-w-md bg-white dark:bg-[#0c0d12] border border-black/10 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-center">
            {checkoutStep === "processing" ? (
              <div className="space-y-6 py-6 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                <div className="space-y-2">
                  <h4 className="font-display font-bold text-lg text-neutral-900 dark:text-white">Connecting Revize Vault...</h4>
                  <p className="text-xs text-neutral-500 dark:text-slate-400 max-w-xs">
                    Synthesizing mock credentials for <strong className="text-blue-500">{getActivePlanName()}</strong> sandbox token subscription.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-4 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-8 h-8 stroke-[3]" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-display font-extrabold text-xl text-neutral-900 dark:text-white">Workspace Upgraded!</h4>
                  <p className="text-xs text-neutral-500 dark:text-slate-400 max-w-sm">
                    Success! {profile?.name || "Student"}, your study cohort has been provisioned status permissions for <strong className="text-neutral-800 dark:text-slate-100">{getActivePlanName()}</strong> on CBSE/ICSE servers.
                  </p>
                </div>
                
                {/* Simulated billing detail panel */}
                <div className="w-full bg-neutral-50 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-2xl p-4 text-left font-mono text-[10px] space-y-1.5 text-neutral-650 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Subscriber Profile:</span>
                    <span className="font-bold text-neutral-800 dark:text-white">{profile?.name || "Student Profile"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Standard Grade:</span>
                    <span className="text-neutral-800 dark:text-white">Grade {profile?.standard || "General"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction status:</span>
                    <span className="text-emerald-650 dark:text-emerald-400 font-bold">APPROVED (SANDBOX DEMO)</span>
                  </div>
                  <div className="border-t border-black/5 dark:border-white/5 pt-1.5 mt-1 text-[9px] text-neutral-450 dark:text-slate-500 italic text-center">
                    No actual funding or credit card values were transferred.
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCheckoutStep("idle");
                    setSelectedPlan(null);
                    onClose();
                  }}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300"
                >
                  Return to Study Space
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pricing cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch" id="pricing-tiers-grid">
        {plans.map((p) => {
          const PlanIcon = p.icon;
          const displayPrice = currency === "INR" ? `₹${p.price.INR}` : `$${p.price.USD}`;
          const isPro = p.id === "genius";
          const isMaster = p.id === "master";

          return (
            <div
              key={p.id}
              className={`relative rounded-3xl border p-6 md:p-8 flex flex-col justify-between transition-all duration-300 bg-white/50 dark:bg-black/25 backdrop-blur-xl group hover:shadow-2xl ${p.borderColor} ${
                isPro ? "scale-105 shadow-xl border-amber-500/40 relative z-10" : ""
              }`}
              id={`plan-card-${p.id}`}
            >
              {/* Special gradient overlay on top-left of the card */}
              <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${p.color} rounded-t-3xl pointer-events-none`} />

              {/* Badging for Most Popular or Best Value */}
              {p.badge && (
                <span className={`absolute top-4 right-4 text-[8px] font-mono font-black tracking-widest px-2.5 py-1 rounded bg-gradient-to-tr ${
                  isPro ? "from-amber-600 to-yellow-500" : "from-indigo-600 to-violet-500"
                } text-white`}>
                  {p.badge}
                </span>
              )}

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isPro 
                      ? "bg-amber-500/10 border-amber-500/25 text-amber-550 dark:text-amber-400" 
                      : isMaster 
                      ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-550 dark:text-indigo-400" 
                      : "bg-blue-500/10 border-blue-500/25 text-blue-550 dark:text-blue-400"
                  }`}>
                    <PlanIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-base text-neutral-900 dark:text-white uppercase tracking-tight">
                      {p.name}
                    </h3>
                    <p className="text-[10px] text-neutral-450 dark:text-slate-500 font-mono">
                      Adaptive Active Recall
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-black text-3xl md:text-4xl text-neutral-900 dark:text-white tracking-tight">
                      {displayPrice}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono uppercase font-bold tracking-widest">
                      / month
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1 italic leading-snug">
                    {p.tagline}
                  </p>
                </div>

                {/* Progressive features listing checklist */}
                <div className="border-t border-black/5 dark:border-white/5 pt-5 space-y-3.5 text-left">
                  <span className="text-[9px] font-mono text-neutral-400 dark:text-slate-500 font-black tracking-widest uppercase block">
                    Features Included:
                  </span>
                  <ul className="space-y-2.5">
                    {p.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs">
                        {f.included ? (
                          <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                            isPro ? "text-amber-550 dark:text-amber-400" : isMaster ? "text-indigo-550 dark:text-indigo-400" : "text-blue-550 dark:text-blue-400"
                          }`} />
                        ) : (
                          <X className="w-3.5 h-3.5 shrink-0 mt-0.5 text-neutral-300 dark:text-slate-700" />
                        )}
                        <span className={`leading-normal ${f.included ? "text-neutral-700 dark:text-slate-300 font-medium" : "text-neutral-400 dark:text-slate-600 font-light line-through"}`}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action buttons with progressive weights */}
              <div className="relative z-10 pt-6 mt-6 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => handleCheckoutMock(p.id)}
                  className={`w-full py-3 rounded-xl font-mono text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all duration-200 active:translate-y-px flex items-center justify-center gap-1.5 ${p.buttonStyle}`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> SELECT THIS PASS
                </button>
                <span className="text-[8px] font-mono text-neutral-400 dark:text-slate-600 mt-2 block text-center uppercase tracking-widest">
                  Cancel anytime • Secure sandbox credentials
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom reassuring security trust and FAQ panels */}
      <div className="p-6 bg-neutral-50 dark:bg-neutral-905 bg-neutral-100/60 dark:bg-[#0c0d12]/50 border border-black/5 dark:border-white/5 rounded-3xl" id="pricing-safeguard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-mono font-bold uppercase text-neutral-900 dark:text-white">Active recall SLA guarantee</span>
            </div>
            <p className="text-[10px] text-neutral-500 dark:text-slate-400 leading-normal">
              Test scores demonstrate active space repetition retains up to 88% better than passive highlights on board tests.
            </p>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-xs font-mono font-bold uppercase text-neutral-900 dark:text-white">Can standard grade levels change?</span>
            </div>
            <p className="text-[10px] text-neutral-500 dark:text-slate-400 leading-normal">
              Yes, you can configure standard grade thresholds anytime. Your selected tier adapts to secondary or senior term benchmarks instantly.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-605 dark:text-indigo-400 shrink-0" />
              <span className="text-xs font-mono font-bold uppercase text-neutral-900 dark:text-white">Is mock subscription billing live?</span>
            </div>
            <p className="text-[10px] text-neutral-500 dark:text-slate-400 leading-normal">
              No. Billing is operated entirely in active sandbox mode. Experience premium pipelines without registering real personal cards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
