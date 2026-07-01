import React, { useState } from 'react';
import { Activity, AlertTriangle, Info, MapPin, Stethoscope, Pill, Search, MessageSquare, Calendar, Calculator, HeartHandshake } from 'lucide-react';
import { SymptomInput } from './components/SymptomInput';
import { ResultCard } from './components/ResultCard';
import { HealthTips } from './components/HealthTips';
import { MedicineInfo } from './components/MedicineInfo';
import { HealthAssistantChat } from './components/HealthAssistantChat';
import { MedicationTracker } from './components/MedicationTracker';
import { HealthCalculators } from './components/HealthCalculators';
import { FirstAidGuides } from './components/FirstAidGuides';
import { NearbyServices } from './components/NearbyServices';
import { Condition } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import clsx from 'clsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<'symptoms' | 'assistant' | 'medicine' | 'tracker' | 'calculators' | 'firstaid' | 'nearby'>('symptoms');
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckSymptoms = async (symptoms: string) => {
    setIsLoading(true);
    setError(null);
    setConditions([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const prompt = `
        Analyze the following symptoms: "${symptoms}".
        Provide a list of possible health conditions based on these symptoms.
        Focus on common diseases, including but not limited to: fever, cold, flu, migraine, food poisoning, dehydration, covid, allergy, dengue, malaria.
        If the symptoms are vague, provide the most likely common conditions.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                condition: {
                  type: Type.STRING,
                  description: "The name of the possible health condition.",
                },
                description: {
                  type: Type.STRING,
                  description: "A brief description of the condition.",
                },
                riskLevel: {
                  type: Type.STRING,
                  description: "The risk level: Low, Medium, or High.",
                },
                basicAdvice: {
                  type: Type.STRING,
                  description: "Basic advice for managing the symptoms or condition.",
                },
                whenToSeeDoctor: {
                  type: Type.STRING,
                  description: "Suggestions on when the user should see a doctor.",
                },
              },
              required: ["condition", "description", "riskLevel", "basicAdvice", "whenToSeeDoctor"],
            },
          },
        },
      });

      let jsonStr = response.text?.trim() || "[]";
      jsonStr = jsonStr.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      const data = JSON.parse(jsonStr);
      setConditions(data || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while checking your symptoms. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'symptoms',    label: 'Symptoms',   icon: <Stethoscope className="w-4 h-4 shrink-0" />,   activeClass: 'tab-active-indigo' },
    { id: 'assistant',   label: 'AI Chat',     icon: <MessageSquare className="w-4 h-4 shrink-0" />,  activeClass: 'tab-active-indigo' },
    { id: 'medicine',    label: 'Medicine',    icon: <Search className="w-4 h-4 shrink-0" />,         activeClass: 'tab-active-blue'   },
    { id: 'tracker',     label: 'Tracker',     icon: <Calendar className="w-4 h-4 shrink-0" />,       activeClass: 'tab-active-blue'   },
    { id: 'calculators', label: 'Calculators', icon: <Calculator className="w-4 h-4 shrink-0" />,     activeClass: 'tab-active-indigo' },
    { id: 'firstaid',    label: 'First Aid',   icon: <HeartHandshake className="w-4 h-4 shrink-0" />, activeClass: 'tab-active-rose'   },
    { id: 'nearby',      label: 'Nearby',      icon: <MapPin className="w-4 h-4 shrink-0" />,         activeClass: 'tab-active-teal'   },
  ] as const;

  return (
    <div className="min-h-screen page-bg text-slate-900 font-sans relative overflow-hidden">

      {/* ── Animated background blobs ──────────────────────────── */}
      <div className="fixed top-[-120px] left-[-80px]  w-[480px] h-[480px] bg-indigo-400/15 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="fixed top-[10%]  right-[-100px] w-[420px] h-[420px] bg-cyan-400/10   rounded-full blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
      <div className="fixed bottom-0   left-[30%]     w-[500px] h-[500px] bg-violet-400/10  rounded-full blur-3xl animate-blob animation-delay-4000 pointer-events-none" />
      <div className="fixed bottom-[10%] right-[5%]   w-[300px] h-[300px] bg-teal-400/10   rounded-full blur-3xl animate-blob animation-delay-6000 pointer-events-none" />

      {/* ── Sticky Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-30 glass-card border-b border-white/40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9">
              <span className="absolute inset-0 rounded-full bg-indigo-400/30 animate-pulse-ring" />
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 relative">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-bold text-gradient-health leading-none">Health Update</h1>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">AI-Powered Health Companion</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/70 text-amber-700 text-[10px] font-semibold shadow-sm">
            <AlertTriangle className="w-3 h-3" />
            For educational use only
          </div>
        </div>
      </header>

      {/* ── Hero Banner ────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

            {/* Left: text */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Powered by Google Gemini AI
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight text-slate-900">
                Your Personal<br />
                <span className="text-gradient-health">Health Assistant</span>
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                Check symptoms, explore medicines, track medications, calculate BMI, learn first aid, and find nearby healthcare providers — all in one beautiful app.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { icon: '🩺', label: 'Symptom AI' },
                  { icon: '💊', label: 'Medicine Info' },
                  { icon: '📍', label: 'Nearby Care' },
                  { icon: '🚑', label: 'First Aid' },
                ].map(({ icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-slate-700 text-xs font-medium shadow-sm border border-white/60">
                    <span>{icon}</span>{label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: SVG illustration */}
            <div className="flex items-center justify-center animate-float-slow">
              <svg viewBox="0 0 320 280" className="w-full max-w-xs md:max-w-sm drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Glow */}
                <circle cx="160" cy="140" r="120" fill="url(#outerGlow)" opacity="0.3" />
                {/* Card */}
                <rect x="36" y="46" width="248" height="188" rx="26" fill="white" fillOpacity="0.88" stroke="url(#cardBorder)" strokeWidth="1.5" />
                {/* ECG line */}
                <polyline points="58,140 84,140 97,108 112,172 126,98 140,166 154,140 262,140"
                  stroke="url(#heartLine)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                {/* Heart */}
                <path d="M154 83 C154 77 161 72 167 77 C173 72 180 77 180 83 C180 94 167 103 167 103 C167 103 154 94 154 83Z" fill="url(#heartGrad)" />
                {/* DNA dots */}
                <circle cx="70"  cy="78"  r="6.5" fill="#818cf8" opacity="0.75" />
                <circle cx="77"  cy="95"  r="4.5" fill="#a78bfa" opacity="0.65" />
                <circle cx="70"  cy="112" r="6.5" fill="#818cf8" opacity="0.75" />
                <circle cx="77"  cy="129" r="4.5" fill="#a78bfa" opacity="0.65" />
                <line x1="70" y1="78" x2="77" y2="95"  stroke="#c4b5fd" strokeWidth="1.5" />
                <line x1="77" y1="95" x2="70" y2="112" stroke="#c4b5fd" strokeWidth="1.5" />
                <line x1="70" y1="112" x2="77" y2="129" stroke="#c4b5fd" strokeWidth="1.5" />
                {/* Pill */}
                <rect x="56" y="178" width="38" height="17" rx="8.5" fill="url(#pillGrad)" transform="rotate(-15 75 186)" />
                <line x1="75" y1="177" x2="75" y2="195" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" transform="rotate(-15 75 186)" />
                {/* Stethoscope */}
                <path d="M212 72 Q234 72 234 94 Q234 116 216 116 Q198 116 198 100" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" fill="none" />
                <circle cx="198" cy="100" r="8" fill="white" stroke="#6366f1" strokeWidth="2.5" />
                <circle cx="198" cy="100" r="3.5" fill="#6366f1" />
                {/* Cross/Plus */}
                <rect x="196" y="158" width="32" height="7" rx="3.5" fill="#f43f5e" opacity="0.85" />
                <rect x="207" y="147" width="10" height="29" rx="5"   fill="#f43f5e" opacity="0.85" />
                {/* Accent dots */}
                <circle cx="102" cy="63"  r="4.5" fill="#34d399" opacity="0.65" />
                <circle cx="252" cy="147" r="3.5" fill="#fbbf24" opacity="0.75" />
                <circle cx="54"  cy="203" r="3.5" fill="#60a5fa" opacity="0.65" />
                <circle cx="267" cy="83"  r="3"   fill="#f472b6" opacity="0.75" />
                <defs>
                  <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="cardBorder" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%"   stopColor="#c7d2fe" />
                    <stop offset="100%" stopColor="#a5f3fc" />
                  </linearGradient>
                  <linearGradient id="heartLine" x1="58" y1="0" x2="262" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%"   stopColor="#6366f1" />
                    <stop offset="50%"  stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%"   stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#fb7185" />
                  </linearGradient>
                  <linearGradient id="pillGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ───────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6 relative z-10">

        {/* Mobile disclaimer */}
        <div className="sm:hidden bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl p-3.5 flex items-start gap-3 text-amber-800 shadow-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">For educational purposes only. Always consult a qualified healthcare provider.</p>
        </div>

        {/* ── Tab Navigation ─────────────────────────────────── */}
        <div className="flex flex-row overflow-x-auto gap-1.5 glass-card p-1.5 rounded-2xl shadow-md scrollbar-none select-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-[11px] font-semibold rounded-xl transition-all duration-200 shrink-0 cursor-pointer whitespace-nowrap',
                activeTab === tab.id
                  ? tab.activeClass
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {activeTab === 'symptoms' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Input section */}
                  <section className="glass-card rounded-3xl p-6 md:p-8 shadow-lg">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
                        <Stethoscope className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">What are your symptoms?</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Describe how you're feeling and let AI analyze it</p>
                      </div>
                    </div>
                    <SymptomInput onCheck={handleCheckSymptoms} isLoading={isLoading} />
                  </section>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-800 shadow-sm"
                      >
                        <Info className="w-5 h-5 shrink-0" />
                        <p className="text-sm">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Results */}
                  <AnimatePresence mode="wait">
                    {conditions.length > 0 && (
                      <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                          Possible Conditions
                        </h3>
                        <div className="space-y-4">
                          {conditions.map((condition, index) => (
                            <ResultCard key={index} condition={condition} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <HealthTips />

                  {/* Mini SVG teaser card */}
                  <div className="glass-card rounded-3xl p-5 shadow-md text-center space-y-3">
                    <svg viewBox="0 0 80 60" className="w-16 h-12 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="8" y="8" width="64" height="44" rx="10" fill="url(#teaserGrad)" fillOpacity="0.12" stroke="url(#teaserGrad)" strokeWidth="1.5" />
                      <path d="M18 36 L27 23 L36 31 L45 19 L54 30 L62 21" stroke="url(#teaserLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="62" cy="21" r="4" fill="#f43f5e" />
                      <defs>
                        <linearGradient id="teaserGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop stopColor="#6366f1" /><stop offset="1" stopColor="#06b6d4" />
                        </linearGradient>
                        <linearGradient id="teaserLine" x1="18" y1="0" x2="62" y2="0" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#6366f1" /><stop offset="1" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Track vitals, check medicines, and explore first aid using the tabs above.
                    </p>
                  </div>
                </div>
              </div>
            ) : activeTab === 'assistant' ? (
              <HealthAssistantChat />
            ) : activeTab === 'medicine' ? (
              <MedicineInfo />
            ) : activeTab === 'tracker' ? (
              <MedicationTracker />
            ) : activeTab === 'calculators' ? (
              <HealthCalculators />
            ) : activeTab === 'firstaid' ? (
              <FirstAidGuides />
            ) : (
              <NearbyServices />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="relative z-10 mt-4 border-t border-white/50 glass-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gradient-health">Health Update</span>
            </div>
            <div className="flex items-center gap-3">
              {['🩺', '💊', '📍', '🚑', '💧', '🧮'].map((icon, i) => (
                <span key={i} className="text-base opacity-50 hover:opacity-100 transition-opacity cursor-default" title="">{icon}</span>
              ))}
            </div>
            <div className="text-center md:text-right space-y-0.5">
              <p className="text-xs text-slate-400">© 2026 Health Update · MIT License</p>
              <p className="text-xs font-semibold text-gradient-health">Made with ❤️ by Yash Borle</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
