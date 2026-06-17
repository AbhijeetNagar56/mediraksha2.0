// pages/Chat.tsx
import React, { useState, useRef, type ChangeEvent } from "react";
import { Bot, ArrowLeft, Sparkles, ChevronRight, ChevronLeft, RefreshCw, AlertCircle, CheckCircle2, Activity } from "lucide-react";
import { useNavigate } from "react-router";
import api from '../api/Api';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import MicButton from '../components/MicButton';

/* ---------------- TYPES ---------------- */
interface StepField {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
  unit?: string;
}

interface Highlight {
  label: string;
  value: string;
}

interface DiagnosticResult {
  paragraph: string;
  highlights: Highlight[];
}

/* ---------------- STEP DEFINITIONS ---------------- */
const STEPS: StepField[] = [
  { key: "age", label: "How old are you?", placeholder: "e.g. 34", type: "number", unit: "years" },
  { key: "height", label: "What is your height?", placeholder: "e.g. 170", type: "number", unit: "cm" },
  { key: "weight", label: "What is your weight?", placeholder: "e.g. 72", type: "number", unit: "kg" },
  { key: "symptoms", label: "What symptoms are you currently experiencing?", placeholder: "e.g. headache, fatigue, mild fever since 2 days" },
  { key: "previousDiseases", label: "Any previous or existing medical conditions?", placeholder: "e.g. diabetes, hypertension, asthma — or type 'None'" },
  { key: "currentMedications", label: "Are you on any medications or drug doses currently?", placeholder: "e.g. Metformin 500mg twice daily — or type 'None'" },
];

type FormData = Record<string, string>;

/* ---------------- COMPONENT ---------------- */
export default function Chat() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  /* ── Speech recognition ── */
  const {
    transcript,
    isListening,
    isSupported: isMicSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const currentField = STEPS[currentStep];
  const currentValue = formData[currentField?.key] ?? "";

  /* Sync transcript into current field */
  React.useEffect(() => {
    if (transcript) {
      setFormData(prev => ({ ...prev, [currentField.key]: transcript }));
    }
  }, [transcript]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [currentField.key]: e.target.value }));
  };

  const handleNext = () => {
    if (!currentValue.trim()) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
      resetTranscript();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
      resetTranscript();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (currentStep < STEPS.length - 1) handleNext();
      else handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!currentValue.trim()) return;
    setIsLoading(true);
    setError(null);

    const summary = `
Patient Details:
- Age: ${formData.age} years
- Height: ${formData.height} cm
- Weight: ${formData.weight} kg
- Current Symptoms: ${formData.symptoms}
- Previous/Existing Conditions: ${formData.previousDiseases}
- Current Medications: ${formData.currentMedications}

Based on the above patient profile, provide:
1. A diagnostic paragraph (3–5 sentences) assessing likely health concerns, possible causes, and general advice.
2. Then on a new line write "HIGHLIGHTS:" followed by 3–5 key points each on its own line in format "Label: Value" (e.g. "BMI: 24.9 — Normal range", "Risk Level: Moderate").
Keep language clear, non-alarming, and remind the user to consult a doctor.
    `.trim();

    try {
      const response = await api.post("/chat", { message: summary });
      const raw: string = response.data?.response ?? "";

      // Parse paragraph + highlights
      const [paragraphPart, highlightsPart] = raw.split(/HIGHLIGHTS:/i);
      const paragraph = paragraphPart.trim();
      const highlights: Highlight[] = (highlightsPart ?? "")
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.includes(":"))
        .map(line => {
          const colonIdx = line.indexOf(":");
          return {
            label: line.slice(0, colonIdx).trim().replace(/^[-•*]\s*/, ""),
            value: line.slice(colonIdx + 1).trim(),
          };
        });

      setResult({ paragraph, highlights });
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err: any) {
      setError("Failed to reach the diagnostics server. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setFormData({});
    setResult(null);
    setError(null);
    resetTranscript();
  };

  const isLastStep = currentStep === STEPS.length - 1;
  const progress = ((currentStep) / STEPS.length) * 100;
  const isTextArea = currentField?.key === "symptoms" || currentField?.key === "previousDiseases" || currentField?.key === "currentMedications";

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">

      {/* ── Top Bar ── */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-800 tracking-tight leading-none mb-0.5">
                HealthAI Diagnostic
              </h1>
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Virtual Medical Assistant
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="p-2 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <RefreshCw size={14} /> Reset
        </button>
      </nav>

      {/* ── Main Content ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">

          {/* ── Result View ── */}
          {result ? (
            <div ref={resultRef} className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-200">
                  <Activity size={22} className="text-white" />
                </div>
                <h2 className="text-xl font-black text-slate-800">Diagnostic Summary</h2>
                <p className="text-slate-400 text-sm mt-1">Based on the information you provided</p>
              </div>

              {/* Paragraph */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
                <p className="text-slate-700 leading-relaxed text-sm">{result.paragraph}</p>
              </div>

              {/* Highlights */}
              {result.highlights.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Key Highlights</p>
                  {result.highlights.map((h, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-100 px-4 py-3 flex items-start gap-3 shadow-xs">
                      <CheckCircle2 size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{h.label}</span>
                        <p className="text-sm text-slate-800 font-medium mt-0.5">{h.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex gap-2.5 items-start">
                <AlertCircle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  This is an AI-generated screening, not a medical diagnosis. Please consult a qualified doctor for clinical evaluation.
                </p>
              </div>

              <button
                onClick={handleReset}
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} /> Start New Assessment
              </button>
            </div>

          ) : isLoading ? (
            /* ── Loading State ── */
            <div className="text-center space-y-4 py-16">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-indigo-200 animate-pulse">
                <Bot size={26} className="text-white" />
              </div>
              <p className="text-slate-700 font-semibold">Analyzing your health profile…</p>
              <p className="text-slate-400 text-sm">This usually takes a few seconds</p>
              <div className="flex justify-center gap-1.5 pt-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
              </div>
            </div>

          ) : (
            /* ── Step Form ── */
            <div className="space-y-6 animate-in fade-in duration-200">

              {/* Progress Header */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                    Step {currentStep + 1} of {STEPS.length}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{Math.round(progress)}% complete</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {/* Step dots */}
                <div className="flex justify-between px-0.5">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i < currentStep
                          ? "bg-indigo-600"
                          : i === currentStep
                          ? "bg-indigo-400 scale-125"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-slate-800 font-semibold text-base leading-snug">{currentField.label}</p>
                    {currentField.unit && (
                      <span className="text-xs text-slate-400 mt-0.5 inline-block">Enter in {currentField.unit}</span>
                    )}
                  </div>
                </div>

                {/* Input */}
                <div className="relative">
                  {isTextArea ? (
                    <textarea
                      autoFocus
                      rows={3}
                      value={currentValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder={currentField.placeholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none placeholder-slate-400 pr-12"
                    />
                  ) : (
                    <input
                      autoFocus
                      type={currentField.type ?? "text"}
                      value={currentValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder={currentField.placeholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder-slate-400 pr-12"
                    />
                  )}

                  {/* Mic */}
                  {isMicSupported && (
                    <div className="absolute right-2.5 top-2.5">
                      <MicButton
                        onClick={handleMicClick}
                        isListening={isListening}
                        disabled={false}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 flex gap-2.5 items-start">
                  <AlertCircle size={15} className="text-rose-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-rose-700">{error}</p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                )}

                {isLastStep ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!currentValue.trim()}
                    className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles size={15} /> Analyse My Health
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!currentValue.trim()}
                    className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {/* Footer note */}
              <div className="flex items-center gap-1 justify-center text-slate-400">
                <Sparkles size={12} className="text-indigo-500" />
                <p className="text-[10px] font-medium tracking-tight">
                  AI insights are for educational purposes. Always consult a medical professional.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}