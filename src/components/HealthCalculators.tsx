import React, { useState, useEffect } from 'react';
import { Activity, Plus, RotateCcw, Droplets, User, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function HealthCalculators() {
  const [activeCalc, setActiveCalc] = useState<'bmi' | 'water'>('bmi');

  // --- BMI State ---
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weightKg, setWeightKg] = useState('70');
  const [heightCm, setHeightCm] = useState('175');
  const [weightLbs, setWeightLbs] = useState('154');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('9');
  const [bmi, setBmi] = useState<number | null>(null);

  // --- Water State ---
  const [waterTarget, setWaterTarget] = useState(2500);
  const [waterTotal, setWaterTotal] = useState(0);
  const [waterLogs, setWaterLogs] = useState<{ id: string; amount: number; time: string }[]>([]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Load water data on mount
  useEffect(() => {
    const savedWaterTotal = localStorage.getItem(`water_total_${todayStr}`);
    const savedWaterLogs = localStorage.getItem(`water_logs_${todayStr}`);
    if (savedWaterTotal) setWaterTotal(parseInt(savedWaterTotal));
    if (savedWaterLogs) setWaterLogs(JSON.parse(savedWaterLogs));
  }, [todayStr]);

  // BMI Calculation
  useEffect(() => {
    if (unit === 'metric') {
      const w = parseFloat(weightKg);
      const h = parseFloat(heightCm) / 100;
      if (w > 0 && h > 0) {
        setBmi(parseFloat((w / (h * h)).toFixed(1)));
      } else {
        setBmi(null);
      }
    } else {
      const w = parseFloat(weightLbs);
      const ft = parseFloat(heightFt) || 0;
      const inch = parseFloat(heightIn) || 0;
      const totalInches = ft * 12 + inch;
      if (w > 0 && totalInches > 0) {
        setBmi(parseFloat(((w / (totalInches * totalInches)) * 703).toFixed(1)));
      } else {
        setBmi(null);
      }
    }
  }, [unit, weightKg, heightCm, weightLbs, heightFt, heightIn]);

  // Water Actions
  const addWater = (amount: number) => {
    const newTotal = Math.min(waterTotal + amount, 10000);
    setWaterTotal(newTotal);
    localStorage.setItem(`water_total_${todayStr}`, newTotal.toString());

    const newLog = {
      id: Math.random().toString(36).substring(7),
      amount,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const newLogs = [newLog, ...waterLogs];
    setWaterLogs(newLogs);
    localStorage.setItem(`water_logs_${todayStr}`, JSON.stringify(newLogs));
  };

  const resetWater = () => {
    setWaterTotal(0);
    setWaterLogs([]);
    localStorage.removeItem(`water_total_${todayStr}`);
    localStorage.removeItem(`water_logs_${todayStr}`);
  };

  // BMI helper calculations
  const getBmiCategory = (score: number) => {
    if (score < 18.5) return { label: 'Underweight', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', pct: Math.min(score / 40 * 100, 30) };
    if (score < 25) return { label: 'Normal Weight', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', pct: 30 + ((score - 18.5) / 6.5) * 30 };
    if (score < 30) return { label: 'Overweight', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', pct: 60 + ((score - 25) / 5) * 20 };
    return { label: 'Obese', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', pct: 80 + Math.min(((score - 30) / 10) * 20, 20) };
  };

  const getBmiAdvice = (score: number) => {
    if (score < 18.5) {
      return "Focus on nutrient-dense meals. Incorporate lean proteins, healthy fats, and whole grains into your diet. Consider strength training to build muscle mass safely.";
    }
    if (score < 25) {
      return "Excellent! You are in the healthy range. Maintain your active lifestyle, eat a balanced diet rich in vegetables and fiber, and keep up regular physical workouts.";
    }
    if (score < 30) {
      return "Incorporate moderate aerobic exercises (like brisk walking or swimming) for at least 150 minutes per week. Practice portion control and reduce refined sugars.";
    }
    return "We recommend consulting a healthcare provider or a dietitian to design a structured plan. Prioritize consistent cardio exercise, fiber intake, and sleep hygiene.";
  };

  const waterProgressPct = Math.min((waterTotal / waterTarget) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Sub-tab Selection */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit mx-auto border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveCalc('bmi')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeCalc === 'bmi'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          BMI Calculator
        </button>
        <button
          onClick={() => setActiveCalc('water')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeCalc === 'water'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          Water Intake Tracker
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeCalc === 'bmi' ? (
          <motion.div
            key="bmi"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Input Form Column */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg shadow-slate-200/40 border border-white space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-semibold text-slate-900">Calculate Your BMI</h3>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
                  <button
                    onClick={() => setUnit('metric')}
                    className={`px-3 py-1.5 font-semibold rounded ${
                      unit === 'metric' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Metric (cm/kg)
                  </button>
                  <button
                    onClick={() => setUnit('imperial')}
                    className={`px-3 py-1.5 font-semibold rounded ${
                      unit === 'imperial' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Imperial (ft/lbs)
                  </button>
                </div>
              </div>

              {unit === 'metric' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600">Height (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600">Weight (kg)</label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600">Height</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <input
                            type="number"
                            value={heightFt}
                            onChange={(e) => setHeightFt(e.target.value)}
                            className="w-full pl-4 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">ft</span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={heightIn}
                            onChange={(e) => setHeightIn(e.target.value)}
                            className="w-full pl-4 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">in</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600">Weight (lbs)</label>
                      <input
                        type="number"
                        value={weightLbs}
                        onChange={(e) => setWeightLbs(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Informative Note */}
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex gap-3 text-slate-600 text-xs">
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  BMI (Body Mass Index) is a measurement of a person's leanness or corpulence based on their height and weight. It does not measure body fat directly and doesn't account for muscle mass, bone density, or age.
                </p>
              </div>
            </div>

            {/* Results Sidebar Column */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg shadow-slate-200/40 border border-white space-y-6 flex flex-col justify-between">
              {bmi ? (
                <>
                  <div className="space-y-5 text-center">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Your BMI Score</h4>
                    <p className="text-5xl font-extrabold text-slate-900 tracking-tight">{bmi}</p>

                    {/* Badge */}
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                      getBmiCategory(bmi).bg
                    } ${getBmiCategory(bmi).color} ${getBmiCategory(bmi).border}`}>
                      {getBmiCategory(bmi).label}
                    </div>

                    {/* Custom sliding indicator bar */}
                    <div className="space-y-1 pt-4 text-left">
                      <div className="relative w-full h-3.5 bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 to-rose-400 rounded-full">
                        <motion.div
                          className="absolute -top-1 w-5 h-5 bg-white border-2 border-slate-800 rounded-full shadow-md"
                          animate={{ left: `${getBmiCategory(bmi).pct}%` }}
                          transition={{ type: 'spring', stiffness: 80 }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 px-1 font-semibold">
                        <span>15</span>
                        <span>18.5</span>
                        <span>25</span>
                        <span>30</span>
                        <span>40</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Card */}
                  <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-2xl p-4 mt-4 text-left">
                    <h5 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mb-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      Health Guidance
                    </h5>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {getBmiAdvice(bmi)}
                    </p>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <Activity className="w-10 h-10 stroke-1" />
                  <p className="text-xs font-medium">Enter your details to calculate BMI</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="water"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Animated Water Cup Cup Column */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg shadow-slate-200/40 border border-white flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
              
              {/* Dynamic SVG filling animation */}
              <div className="relative w-44 h-60 border-4 border-slate-300 rounded-b-[40px] rounded-t-[10px] overflow-hidden shadow-inner flex items-end justify-center">
                
                {/* SVG clipping water wave */}
                <motion.div 
                  className="w-full bg-blue-500/80 absolute bottom-0 left-0"
                  animate={{ height: `${waterProgressPct}%` }}
                  transition={{ type: 'tween', duration: 0.6 }}
                >
                  {/* Wave Effect via SVG */}
                  <svg className="absolute -top-3 left-0 w-[200%] h-4 fill-blue-500/80 animate-wave" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 25 10, 50 5 T 100 5 L 100 10 L 0 10 Z" />
                  </svg>
                </motion.div>

                {/* Progress Text Centered */}
                <span className="relative z-10 text-2xl font-extrabold mix-blend-difference text-white mb-20 select-none">
                  {waterProgressPct.toFixed(0)}%
                </span>
              </div>

              <div className="text-center mt-6 z-10">
                <p className="text-lg font-semibold text-slate-800">
                  {waterTotal} <span className="text-sm font-medium text-slate-500">/ {waterTarget} ml</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Daily Target Hydration</p>
              </div>
            </div>

            {/* Quick Add and Settings Column */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg shadow-slate-200/40 border border-white space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-4">Log Hydration</h3>
              
              {/* Quick intake selection */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => addWater(250)}
                  className="flex flex-col items-center justify-center p-4 border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 rounded-2xl transition-all shadow-sm hover:shadow group cursor-pointer"
                >
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🥛</span>
                  <span className="text-xs font-semibold text-slate-800">Cup</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">+250 ml</span>
                </button>
                <button
                  onClick={() => addWater(500)}
                  className="flex flex-col items-center justify-center p-4 border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 rounded-2xl transition-all shadow-sm hover:shadow group cursor-pointer"
                >
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🧴</span>
                  <span className="text-xs font-semibold text-slate-800">Small Bottle</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">+500 ml</span>
                </button>
                <button
                  onClick={() => addWater(750)}
                  className="flex flex-col items-center justify-center p-4 border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 rounded-2xl transition-all shadow-sm hover:shadow group cursor-pointer"
                >
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🍶</span>
                  <span className="text-xs font-semibold text-slate-800">Large Bottle</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">+750 ml</span>
                </button>
                <button
                  onClick={() => addWater(1000)}
                  className="flex flex-col items-center justify-center p-4 border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 rounded-2xl transition-all shadow-sm hover:shadow group cursor-pointer"
                >
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">💧</span>
                  <span className="text-xs font-semibold text-slate-800">Big Flask</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">+1000 ml</span>
                </button>
              </div>

              {/* Set target form */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-slate-600">Adjust Daily Target (ml)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={waterTarget}
                    onChange={(e) => setWaterTarget(Math.max(500, parseInt(e.target.value) || 0))}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                  />
                  <button
                    onClick={resetWater}
                    className="p-2 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                    title="Reset Logs"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* History Logs Column */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg shadow-slate-200/40 border border-white space-y-4 flex flex-col h-[400px]">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Intake Logs</span>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">Today</span>
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {waterLogs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-6 text-slate-400 text-xs">
                    No hydration logged yet. Stay hydrated!
                  </div>
                ) : (
                  <AnimatePresence>
                    {waterLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="font-semibold text-slate-800">+{log.amount} ml</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{log.time}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
