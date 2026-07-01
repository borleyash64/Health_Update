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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-lg border-b border-white/50 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Activity className="w-6 h-6" />
            <h1 className="text-xl font-semibold tracking-tight">Health Symptom Checker</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Disclaimer */}
        <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3 text-amber-800 shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Disclaimer: This tool is not a medical diagnosis.</p>
            <p className="mt-1 text-amber-700">
              The information provided is for educational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult a healthcare provider for medical concerns.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-row overflow-x-auto gap-1 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl w-full max-w-5xl mx-auto shadow-sm border border-white/50 scrollbar-none select-none">
          <button
            onClick={() => setActiveTab('symptoms')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl transition-all shrink-0 cursor-pointer',
              activeTab === 'symptoms'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/30'
            )}
          >
            <Stethoscope className="w-4 h-4 shrink-0" />
            <span>Symptom Checker</span>
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl transition-all shrink-0 cursor-pointer',
              activeTab === 'assistant'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/30'
            )}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>AI Assistant</span>
          </button>
          <button
            onClick={() => setActiveTab('medicine')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl transition-all shrink-0 cursor-pointer',
              activeTab === 'medicine'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/30'
            )}
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>Medicine Info</span>
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl transition-all shrink-0 cursor-pointer',
              activeTab === 'tracker'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/30'
            )}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Med Tracker</span>
          </button>
          <button
            onClick={() => setActiveTab('calculators')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl transition-all shrink-0 cursor-pointer',
              activeTab === 'calculators'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/30'
            )}
          >
            <Calculator className="w-4 h-4 shrink-0" />
            <span>Calculators</span>
          </button>
          <button
            onClick={() => setActiveTab('firstaid')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl transition-all shrink-0 cursor-pointer',
              activeTab === 'firstaid'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/30'
            )}
          >
            <HeartHandshake className="w-4 h-4 shrink-0" />
            <span>First Aid</span>
          </button>
          <button
            onClick={() => setActiveTab('nearby')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl transition-all shrink-0 cursor-pointer',
              activeTab === 'nearby'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/30'
            )}
          >
            <MapPin className="w-4 h-4 shrink-0" />
            <span>Nearby Services</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'symptoms' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Input Section */}
                  <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-slate-200/40 border border-white p-6 md:p-8">
                    <h2 className="text-lg font-medium mb-4">What are your symptoms?</h2>
                    <SymptomInput onCheck={handleCheckSymptoms} isLoading={isLoading} />
                  </section>

                  {/* Error Message */}
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

                  {/* Results Section */}
                  <AnimatePresence mode="wait">
                    {conditions.length > 0 && (
                      <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                      >
                        <h3 className="text-xl font-semibold tracking-tight">Possible Conditions</h3>
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
                <div className="space-y-8">
                  <HealthTips />
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

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200/40 text-center text-slate-500 text-xs relative z-10">
        <p>© 2026 Health Update. Released under the MIT License.</p>
        <p className="mt-1 text-slate-400 font-medium">Made by Yash Borle</p>
      </footer>
    </div>
  );
}
