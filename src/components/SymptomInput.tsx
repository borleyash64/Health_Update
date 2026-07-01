import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SymptomInputProps {
  onCheck: (symptoms: string) => void;
  isLoading: boolean;
}

const COMMON_SYMPTOMS = [
  'fever', 'headache', 'cough', 'sore throat', 'runny nose',
  'fatigue', 'muscle aches', 'nausea', 'vomiting', 'diarrhea',
  'stomach pain', 'shortness of breath', 'loss of taste', 'loss of smell',
  'chills', 'sweating', 'dizziness', 'chest pain', 'rash', 'joint pain'
];

export function SymptomInput({ onCheck, isLoading }: SymptomInputProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input.trim() === '') {
      setSuggestions([]);
      return;
    }

    const lastWord = input.split(',').pop()?.trim().toLowerCase() || '';
    if (lastWord.length > 1) {
      const filtered = COMMON_SYMPTOMS.filter(s => 
        s.toLowerCase().includes(lastWord) && 
        !input.toLowerCase().includes(s.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [input]);

  const handleSuggestionClick = (suggestion: string) => {
    const parts = input.split(',');
    parts.pop(); // Remove the partial word
    const newParts = [...parts, suggestion].map(p => p.trim()).filter(Boolean);
    setInput(newParts.join(', ') + ', ');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onCheck(input.trim());
      setShowSuggestions(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="block w-full pl-10 pr-4 py-4 border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm text-slate-900 shadow-sm placeholder:text-slate-400"
          placeholder="e.g., fever, headache, cough..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute inset-y-2 right-2 px-5 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking...</span>
            </>
          ) : (
            'Check Symptoms'
          )}
        </button>
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
          >
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 flex items-center gap-2"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Search className="w-3 h-3 text-slate-400" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-2 text-xs text-slate-500">
        Separate multiple symptoms with commas.
      </p>
    </form>
  );
}
