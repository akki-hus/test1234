import React, { useState, useEffect } from "react";
import { Brain, Layers, ChevronLeft, ChevronRight, CheckCircle, HelpCircle, Loader2, RefreshCw } from "lucide-react";
import { Flashcard } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface StudentFlashcardsProps {
  parsedNotes: string;
  topic: string;
  profile?: any;
}

export default function StudentFlashcards({ parsedNotes, topic, profile }: StudentFlashcardsProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Track master states
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [reviewIds, setReviewIds] = useState<string[]>([]);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);
      setFlashcards([]);
      setCurrentIndex(0);
      setIsFlipped(false);
      setMasteredIds([]);
      setReviewIds([]);

      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textNotes: parsedNotes,
          topic,
          standard: profile?.standard || "",
          board: profile?.board || ""
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to structure flashcards.");
      }

      setFlashcards(data.flashcards || []);
    } catch (err: any) {
      console.error("Flashcards issue:", err);
      setError(err.message || "Something went wrong creating study cards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parsedNotes) {
      fetchFlashcards();
    }
  }, [parsedNotes]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
      }, 150);
    }
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const markMastered = (id: string) => {
    if (!masteredIds.includes(id)) {
      setMasteredIds((prev) => [...prev, id]);
      setReviewIds((prev) => prev.filter((i) => i !== id));
    }
    handleNext();
  };

  const markReview = (id: string) => {
    if (!reviewIds.includes(id)) {
      setReviewIds((prev) => [...prev, id]);
      setMasteredIds((prev) => prev.filter((i) => i !== id));
    }
    handleNext();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <div className="space-y-1">
          <p className="font-display font-semibold text-lg text-neutral-900 dark:text-slate-100">Extracting Interactive Flashcards...</p>
          <p className="text-xs text-neutral-500 dark:text-slate-400 max-w-sm">Our Gemini cognitive engine is drafting spaced repetition card prompts directly tailored to standard {profile?.standard || "your class"}.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-neutral-800 dark:text-slate-200">Interactive study cards unavailable</p>
          <p className="text-xs text-neutral-450 dark:text-slate-400">{error}</p>
        </div>
        <button
          onClick={fetchFlashcards}
          className="px-4 py-2 text-xs font-mono font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl duration-150 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-attempt Generation
        </button>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <p className="text-xs text-neutral-500 dark:text-slate-400 font-mono">No study text detected to generate flashcards.</p>
        <button
          onClick={fetchFlashcards}
          className="px-4 py-2 text-xs font-mono font-bold bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 rounded-xl duration-150 cursor-pointer"
        >
          Generate Concept Flashcards
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="space-y-8 max-w-3xl mx-auto px-2" id="flashcards-section">
      <div className="text-center space-y-1.5">
        <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-stone-100 flex items-center justify-center gap-2">
          <Layers className="w-5 h-5 text-blue-500 dark:text-blue-400" /> SPACED REPETITION STUDY DECK
        </h3>
        <p className="text-xs text-neutral-500 dark:text-slate-400 font-sans max-w-lg mx-auto">
          Practice mental retrieval to secure textbook concepts in long-term memory. Flip cards for quick insights.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-center" id="flashcard-stats-row">
        <div className="bg-neutral-50 dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-2.5 rounded-xl">
          <span className="text-[10px] font-mono block text-neutral-450 dark:text-slate-500 uppercase tracking-wider">Remaining</span>
          <span className="font-mono text-base font-bold text-neutral-700 dark:text-slate-300">
            {flashcards.length - currentIdxStateMatches(currentIndex)} / {flashcards.length}
          </span>
        </div>
        <div className="bg-emerald-500/[0.04] dark:bg-emerald-500/10 border border-emerald-500/10 p-2.5 rounded-xl">
          <span className="text-[10px] font-mono block text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Mastered</span>
          <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-300">{masteredIds.length}</span>
        </div>
        <div className="bg-yellow-500/[0.04] dark:bg-yellow-500/10 border border-yellow-500/10 p-2.5 rounded-xl">
          <span className="text-[10px] font-mono block text-yellow-600 dark:text-yellow-500 uppercase tracking-wider">Need review</span>
          <span className="font-mono text-base font-bold text-yellow-650 dark:text-yellow-300">{reviewIds.length}</span>
        </div>
      </div>

      {/* Main Flashcard view */}
      <div className="max-w-xl mx-auto block">
        <div 
          onClick={toggleFlip}
          className="w-full relative h-[260px] cursor-pointer group"
          style={{ perspective: "1500px" }}
          id={`flashcard-item-${currentIndex}`}
        >
          <motion.div 
            className="w-full h-full relative"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {/* FRONT SIDE */}
            <div 
              className="absolute inset-0 w-full h-full p-6 md:p-8 rounded-2xl border bg-white dark:bg-slate-950/80 border-black/10 dark:border-white/10 flex flex-col justify-between shadow-md"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-blue-500/[0.04] text-blue-600 border border-blue-500/10 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
                  {currentCard.category || "CONCEPT"}
                </span>
                <span className="text-[10px] font-mono text-neutral-450 dark:text-slate-500 uppercase shrink-0">
                  Card {currentIndex + 1} of {flashcards.length}
                </span>
              </div>
              
              <div className="my-auto text-center py-4">
                <span className="text-sm text-neutral-400 dark:text-slate-400 font-mono block mb-2 font-semibold">QUESTION:</span>
                <h4 className="font-display font-medium text-lg leading-relaxed text-neutral-850 dark:text-slate-100 px-2 select-none">
                  {currentCard.front}
                </h4>
              </div>

              <div className="text-center font-mono text-[10px] text-neutral-450 dark:text-slate-500 uppercase group-hover:text-blue-500 transition-colors">
                ✦ Tap to show answer ✦
              </div>
            </div>

            {/* BACK SIDE */}
            <div 
              className="absolute inset-0 w-full h-full p-6 md:p-8 rounded-2xl border bg-neutral-50/95 dark:bg-slate-900/90 border-blue-500/15 dark:border-blue-500/20 flex flex-col justify-between shadow-lg"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ANSWER REVEALED
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-slate-400 font-mono">
                  {currentCard.category || "CONCEPT"}
                </span>
              </div>
              
              <div className="my-auto overflow-y-auto pr-1 py-4 text-center max-h-[140px]">
                <p 
                  className="text-neutral-800 dark:text-slate-200 text-sm md:text-base leading-relaxed select-none"
                  dangerouslySetInnerHTML={{ __html: currentCard.back.replace(/\*\*(.*?)\*\*/g, "<strong class='text-blue-600 dark:text-blue-400 font-bold'>$1</strong>") }}
                />
              </div>

              <div className="text-center font-mono text-[10px] text-neutral-450 dark:text-slate-500 uppercase">
                ✦ Tap to show question ✦
              </div>
            </div>
          </motion.div>
        </div>

        {/* Evaluation tools */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-3 bg-neutral-50 border border-black/5 hover:bg-neutral-100 dark:bg-slate-900 dark:border-white/5 dark:hover:bg-slate-800 disabled:opacity-35 disabled:hover:bg-[#f3f4f6] dark:disabled:hover:bg-slate-900 rounded-xl transition duration-150 cursor-pointer"
              title="Previous card"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-700 dark:text-slate-300" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              className="p-3 bg-neutral-50 border border-black/5 hover:bg-neutral-100 dark:bg-slate-900 dark:border-white/5 dark:hover:bg-slate-800 disabled:opacity-35 disabled:hover:bg-[#f3f4f6] dark:disabled:hover:bg-slate-900 rounded-xl transition duration-150 cursor-pointer"
              title="Next card"
            >
              <ChevronRight className="w-5 h-5 text-neutral-700 dark:text-slate-300" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => markReview(currentCard.id)}
              className="px-4 py-2.5 border border-yellow-500/20 bg-yellow-500/[0.03] dark:bg-yellow-500/5 hover:bg-yellow-500/[0.08] dark:hover:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 duration-150 shrink-0 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" /> Hard, review later
            </button>
            <button
              onClick={() => markMastered(currentCard.id)}
              className="px-4 py-2.5 border border-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-500/5 hover:bg-emerald-500/[0.08] dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 duration-150 shrink-0 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" /> Got it! Mastered
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline helper to prevent ts-ignore
function currentIdxStateMatches(currentIdx: number) {
  return currentIdx;
}
