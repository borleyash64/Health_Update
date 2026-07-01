import React, { useState } from 'react';
import { Search, Loader2, AlertTriangle, Pill, Info } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

export function MedicineInfo() {
  const [medicineName, setMedicineName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMarkdown, setInfoMarkdown] = useState<string>('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim()) return;

    setIsLoading(true);
    setError(null);
    setInfoMarkdown('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const prompt = `
        Provide comprehensive information about the medicine: "${medicineName.trim()}".
        Include the following sections:
        - **Overview**: What is it and what is it commonly used for?
        - **Common Side Effects**: What are the typical side effects?
        - **Precautions & Warnings**: Who should avoid it? Are there any major warnings?
        - **Interactions**: Common drug or food interactions.
        - **General Dosage Information**: General guidelines (include a strong disclaimer that this is not medical advice and a doctor should be consulted).

        Format the response in clean Markdown.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInfoMarkdown(response.text || 'No information found.');
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching medicine information.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-slate-200/40 border border-white p-6 md:p-8">
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <Pill className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Medicine Information</h2>
            <p className="text-slate-600 mt-2 max-w-md mx-auto">
              Look up details about medications, including uses, side effects, and precautions.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="Enter medicine name (e.g., Amoxicillin, Ibuprofen)..."
              className="w-full px-4 py-4 pl-12 pr-32 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 shadow-sm"
              disabled={isLoading}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <button
              type="submit"
              disabled={isLoading || !medicineName.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching
                </>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {infoMarkdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-slate-200/40 border border-white p-6 md:p-8"
        >
          <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3 text-amber-800 mb-8 shadow-sm">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Important Medical Disclaimer</p>
              <p className="mt-1 text-amber-700">
                This information is generated by AI and is for educational purposes only. It may not be fully accurate or complete. Do not use this information to make medical decisions. Always consult a qualified healthcare professional or pharmacist before starting, stopping, or changing any medication.
              </p>
            </div>
          </div>

          <div className="prose prose-slate prose-blue max-w-none">
            <Markdown>{infoMarkdown}</Markdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}
