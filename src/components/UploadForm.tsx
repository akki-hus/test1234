import React, { useState, useRef } from "react";
import { FileDown, Upload, FileText, Sparkles, BookOpen, Clock, AlertTriangle, Layers, MessageSquare } from "lucide-react";

interface UploadFormProps {
  onGenerate: (data: { file: File | null; textNotes: string; topic: string }, mode: "reel" | "flashcards" | "qa") => void;
  isLoading: boolean;
}

const SAMPLE_STUDY_MATERIAL = [
  {
    topic: "Photosynthesis",
    description: "Biology Standard Chapter summary describing chloroplasts and light-dependent systems.",
    content: `Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy stored in glucose.
It occurs primarily inside chloroplasts, specialized plant cell organelles containing chlorophyll pigment.
Structure of Chloroplast: It has double membrane, stroma (fluid substance containing enzymes), and thylakoids (membranous sacs assembled into grana).
There are two major stages:
1. Light-Dependent Reactions: Take place in the thylakoid membranes. Solar energy splits H2O molecules (photolysis), releasing oxygen as waste, and synthesizing ATP and NADPH molecules.
2. Light-Independent Reactions (Calvin Cycle): Take place in the stroma. CO2 enters, and using the chemical energy from ATP and NADPH, synthesizes glucose (C6H12O6) through carbon fixation.
Overall Chemical Equation: 6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2.`
  },
  {
    topic: "Quantum Superposition",
    description: "Physics exam notes covering Bohr's theory, Schrodinger's Cat, and qubit states.",
    content: `Quantum Superposition is a fundamental principle of quantum mechanics where any two (or more) quantum states can be added together ('superposed') to yield another valid quantum state.
Conversely, every quantum state can be represented as a sum of two or more distinct states.
Classically, a system must be in one definite state or another (e.g. a coin is either heads or tails). Quantumly, until a measurement is made, a system like an electron or qubit exists simultaneously in all possible configurations.
Schrödinger's Cat Paradox: A thought experiment proposed by Erwin Schrödinger to illustrate the Copenhagen interpretation. A cat in a sealed box exists in an entangled superposition of being alive and dead simultaneously, until the box is opened and the state collapses.
Qubits in Quantum Computing: Unlike binary classical bits (0 or 1), a quantum qubit exists as a vector combination: |ψ⟩ = α|0⟩ + β|1⟩, enabling exponentially parallel operations until measurement.`
  },
  {
    topic: "Electric Charges",
    description: "Physics overview of electrostatics, charge properties, positive & negative charge polarity, and Coulomb's law.",
    content: `Chapter One: ELECTRIC CHARGES AND FIELDS
All of us have the experience of seeing a spark or hearing a crackle when we take off synthetic clothes or a sweater in dry weather. Another common example of electric discharge is lightning during a thunderstorm.
Electrostatics deals with the study of forces, fields, and potentials arising from static charges.
1. Electric Charge: Two kinds of charges exist: positive and negative (polarity named by Benjamin Franklin). Like charges repel and unlike charges attract.
2. Quantisation of Charge: All free charges are integral multiples of a basic unit (e.g., e = 1.602192 x 10^-19 C). Formulated as q = ne.
3. Coulomb's Law: The electrostatic force between two point charges q1, q2 is given by F = k * |q1 * q2| / r^2, where k is approx 9 x 10^9 N m^2 C^-2.`
  }
];

export default function UploadForm({ onGenerate, isLoading }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [textNotes, setTextNotes] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [tab, setTab] = useState<"file" | "text">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".pdf")) {
        setFile(droppedFile);
        if (!topic) {
          setTopic(droppedFile.name.replace(/\.[^/.]+$/, ""));
        }
      } else {
        alert("Please upload a valid PDF study document.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!topic) {
        setTopic(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const selectSample = (sample: typeof SAMPLE_STUDY_MATERIAL[0]) => {
    setTab("text");
    setTopic(sample.topic);
    setTextNotes(sample.content);
    setFile(null);
  };

  const handleActionSubmit = (mode: "reel" | "flashcards" | "qa") => {
    if (tab === "file" && !file) {
      alert("Please upload a study PDF file first.");
      return;
    }
    if (tab === "text" && textNotes.trim().length < 20) {
      alert("Please enter more detailed study notes (min 20 characters) to process.");
      return;
    }
    
    onGenerate({
      file: tab === "file" ? file : null,
      textNotes: tab === "text" ? textNotes : "",
      topic: topic || "Study Topic"
    }, mode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleActionSubmit("reel");
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-10" id="upload-form-container">
      {/* Premium Sliding Segmented Control Tab */}
      <div className="flex p-1 bg-neutral-200/50 dark:bg-neutral-900/85 rounded-xl border border-black/5 dark:border-white/5 max-w-xs mx-auto shadow-inner transition-colors duration-300">
        <button
          type="button"
          onClick={() => { setTab("file"); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg font-mono font-bold text-xs transition-all duration-300 cursor-pointer ${
            tab === "file"
              ? "bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm border border-black/5 dark:border-white/10"
              : "text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
          id="tab-pdf"
        >
          <Upload className="w-3.5 h-3.5" />
          PDF Document
        </button>
        <button
          type="button"
          onClick={() => { setTab("text"); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg font-mono font-bold text-xs transition-all duration-300 cursor-pointer ${
            tab === "text"
              ? "bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm border border-black/5 dark:border-white/10"
              : "text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
          id="tab-text"
        >
          <FileText className="w-3.5 h-3.5" />
          Text Notes
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dynamic Fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-500 dark:text-slate-400 mb-2 font-bold transition-colors">
              TOPIC DESIGNATION
            </label>
            <input
              type="text"
              className="w-full glass-input px-4 py-3.5 rounded-xl font-sans placeholder-neutral-400 dark:placeholder-slate-600 text-sm focus:border-neutral-400 dark:focus:border-white/20 focus:ring-0"
              placeholder="e.g. Photosynthesis Chapter, Calculus Midterm, Roman History..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              id="topic-input"
            />
          </div>

          {tab === "file" ? (
            /* PDF drag and drop */
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`relative cursor-pointer transition-all duration-300 border border-dashed rounded-2xl flex flex-col items-center justify-center p-12 min-h-[220px] ${
                dragActive
                  ? "border-neutral-900 dark:border-white bg-[#000000]/[0.02] dark:bg-[#ffffff]/[0.03] shadow-[0_0_30px_rgba(0,0,0,0.02)] dark:shadow-[0_0_30px_rgba(255,255,255,0.04)]"
                  : file
                  ? "border-neutral-400 dark:border-slate-550 bg-neutral-100 dark:bg-slate-900/30"
                  : "border-black/10 hover:border-black/20 dark:border-white/10 bg-black/[0.01] dark:bg-[#0d0f14]/45 hover:bg-black/[0.03] dark:hover:bg-[#0c0d12]/60"
              }`}
              id="drop-zone"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={handleFileChange}
              />

              {file ? (
                <div className="text-center space-y-4 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center mx-auto text-neutral-850 dark:text-slate-200">
                    <FileDown className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-neutral-900 dark:text-white font-medium text-sm break-all">{file.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to process</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-xs text-neutral-400 hover:text-rose-450 dark:text-slate-500 dark:hover:text-rose-400 underline transition-all cursor-pointer"
                  >
                    Remove and upload other
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-center justify-center mx-auto text-neutral-500 dark:text-slate-400 group-hover:scale-105 duration-300">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-slate-300">
                      Drag & drop study PDF here, or <span className="text-neutral-900 dark:text-white underline hover:text-neutral-700 dark:hover:text-slate-200 transition-all">browse workspace</span>
                    </p>
                    <p className="text-[11px] text-neutral-450 dark:text-slate-500 max-w-sm mx-auto">
                      Upload chapters, class slides, notes, or essays up to 15MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Custom notes text area */
            <div>
              <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-500 dark:text-slate-400 mb-2 font-bold transition-colors">
                PASTED INPUT NOTES
              </label>
              <textarea
                className="w-full glass-input p-4.5 rounded-2xl font-sans text-sm min-h-[220px] placeholder-slate-450 dark:placeholder-slate-600 resize-none focus:border-neutral-400 dark:focus:border-white/20"
                placeholder="Paste paragraph notes, study guidelines, textbook transcript, or class syllabus details..."
                value={textNotes}
                onChange={(e) => setTextNotes(e.target.value)}
                id="text-notes-area"
              />
              <p className="text-right text-[10px] font-mono text-neutral-400 dark:text-slate-600 mt-1.5">
                {textNotes.length} CHARS (MINIMUM RECOMMENDED 20)
              </p>
            </div>
          )}
        </div>

        {/* Choose Your Study Journey */}
        <div className="space-y-6 pt-8 border-t border-black/5 dark:border-white/5 animate-fade-in" id="study-actions-container">
          <div className="text-center sm:text-left">
            <h3 className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-2 font-bold transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-neutral-800 dark:text-white animate-pulse" />
              SELECT INTERACTIVE WORKSPACE
            </h3>
            <p className="text-xs text-neutral-500 dark:text-slate-500 mt-1">Select your study path to execute customized AI generation instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* OPTION 1: Revision Reel */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleActionSubmit("reel")}
              className={`text-left p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between group h-full relative ${
                isLoading 
                  ? "opacity-40 cursor-not-allowed border-black/5 dark:border-white/5 bg-neutral-100 dark:bg-slate-900/5" 
                  : "bg-white/80 dark:bg-[#0b0c11]/45 hover:bg-neutral-50/90 dark:hover:bg-[#13151f]/60 border-black/10 dark:border-white/5 hover:border-black/20 dark:hover:border-white/10 hover:shadow-lg dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] active:scale-[0.99] cursor-pointer"
              }`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 text-neutral-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300 shadow-sm">
                  <Sparkles className="w-4.5 h-4.5 group-hover:-rotate-12 duration-300" />
                </div>
                <h4 className="font-display font-black text-xs text-neutral-800 dark:text-slate-300 tracking-wider uppercase group-hover:text-neutral-950 dark:group-hover:text-white mt-1">
                  🎬 COMPILE REVISION REEL
                </h4>
                <p className="text-xs text-neutral-600 dark:text-slate-400 leading-relaxed group-hover:text-neutral-700 dark:group-hover:text-slate-300 font-sans">
                  Produces magnificent 16:9 cinematic whiteboard slides, visual study grids, and synchronized subtitles for quick audio-visual revisions.
                </p>
              </div>
              <div className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-slate-400 font-mono font-bold mt-6 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between w-full group-hover:text-neutral-900 dark:group-hover:text-white">
                <span>Start Synthesis</span>
                <span className="group-hover:translate-x-1 duration-150">→</span>
              </div>
            </button>

            {/* OPTION 2: Concept Flashcards */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleActionSubmit("flashcards")}
              className={`text-left p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between group h-full relative ${
                isLoading 
                  ? "opacity-40 cursor-not-allowed border-black/5 dark:border-white/5 bg-neutral-100 dark:bg-slate-900/5" 
                  : "bg-white/80 dark:bg-[#0b0c11]/45 hover:bg-neutral-50/90 dark:hover:bg-[#13151f]/60 border-black/10 dark:border-white/5 hover:border-black/20 dark:hover:border-white/10 hover:shadow-lg dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] active:scale-[0.99] cursor-pointer"
              }`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 text-neutral-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300 shadow-sm">
                  <Layers className="w-4.5 h-4.5 group-hover:scale-110 duration-300" />
                </div>
                <h4 className="font-display font-black text-xs text-neutral-800 dark:text-slate-300 tracking-wider uppercase group-hover:text-neutral-950 dark:group-hover:text-white mt-1">
                  🎴 SPACED FLASHCARDS
                </h4>
                <p className="text-xs text-neutral-600 dark:text-slate-400 leading-relaxed group-hover:text-neutral-700 dark:group-hover:text-slate-300 font-sans">
                  Extracts a micro-deck of 8-12 interactive cognitive flashcards instantly to drill facts, core equations, definitions and self-test.
                </p>
              </div>
              <div className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-slate-400 font-mono font-bold mt-6 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between w-full group-hover:text-neutral-900 dark:group-hover:text-white">
                <span>Generate Decks</span>
                <span className="group-hover:translate-x-1 duration-150">→</span>
              </div>
            </button>

            {/* OPTION 3: AI Q&A Companion */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleActionSubmit("qa")}
              className={`text-left p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between group h-full relative ${
                isLoading 
                  ? "opacity-40 cursor-not-allowed border-black/5 dark:border-white/5 bg-neutral-100 dark:bg-slate-900/5" 
                  : "bg-white/80 dark:bg-[#0b0c11]/45 hover:bg-neutral-50/90 dark:hover:bg-[#13151f]/60 border-black/10 dark:border-white/5 hover:border-black/20 dark:hover:border-white/10 hover:shadow-lg dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] active:scale-[0.99] cursor-pointer"
              }`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 text-neutral-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300 shadow-sm">
                  <BookOpen className="w-4.5 h-4.5 group-hover:rotate-6 duration-300" />
                </div>
                <h4 className="font-display font-black text-xs text-neutral-800 dark:text-slate-300 tracking-wider uppercase group-hover:text-neutral-950 dark:group-hover:text-white mt-1">
                  💬 GUEST AI TUTOR
                </h4>
                <p className="text-xs text-neutral-600 dark:text-slate-400 leading-relaxed group-hover:text-neutral-700 dark:group-hover:text-slate-300 font-sans">
                  Bridges an interactive grounded conversational dialogue with an AI specialist to query explanations and resolve textbook questions.
                </p>
              </div>
              <div className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-slate-400 font-mono font-bold mt-6 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between w-full group-hover:text-neutral-900 dark:group-hover:text-white">
                <span>Engage Dialogue</span>
                <span className="group-hover:translate-x-1 duration-150">→</span>
              </div>
            </button>
          </div>
        </div>
      </form>

      {/* Demo sample modules */}
      <div className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
        <div className="text-center sm:text-left">
          <h3 className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 dark:text-slate-505 flex items-center gap-1.5 justify-center sm:justify-start font-bold">
            <BookOpen className="w-3.5 h-3.5 text-neutral-550 dark:text-slate-500" />
            EVALUATE HIGH-DENSITY TEMPLATE EXAMPLES
          </h3>
          <p className="text-xs text-neutral-450 dark:text-slate-600 mt-0.5">Click any standard topic to preload context instantly and evaluate without local files.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_STUDY_MATERIAL.map((sample) => (
            <button
              key={sample.topic}
              type="button"
              onClick={() => selectSample(sample)}
              className="text-left apple-card p-5 rounded-xl hover:scale-[1.01] flex flex-col justify-between group active:scale-[0.99] cursor-pointer"
            >
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-neutral-800 dark:text-slate-200 group-hover:text-neutral-950 dark:group-hover:text-white block tracking-wider uppercase">{sample.topic}</span>
                <p className="text-xs text-neutral-500 dark:text-slate-400 leading-relaxed line-clamp-2">{sample.description}</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-neutral-450 dark:text-slate-500 font-mono mt-4 pt-3.5 border-t border-black/5 dark:border-white/5">
                <span className="flex items-center gap-1 font-bold text-neutral-500 dark:text-slate-400"><Clock className="w-3 h-3 text-neutral-400 dark:text-slate-500" /> 5 SLIDES</span>
                <span className="text-neutral-505 dark:text-slate-400 font-bold group-hover:text-neutral-950 dark:group-hover:text-white ml-auto duration-200">Load Template →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
