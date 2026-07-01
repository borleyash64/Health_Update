import React, { useState, useEffect } from 'react';
import { Pill, Plus, Trash2, Check, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: 'daily' | 'weekly' | 'as_needed';
  times: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
}

interface IntakeLog {
  [date: string]: {
    [doseKey: string]: boolean; // key format: medId-time
  };
}

export function MedicationTracker() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<IntakeLog>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFreq, setNewMedFreq] = useState<'daily' | 'weekly' | 'as_needed'>('daily');
  const [newTimes, setNewTimes] = useState({
    morning: true,
    afternoon: false,
    evening: false,
    night: false,
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Load from localStorage
  useEffect(() => {
    const savedMeds = localStorage.getItem('health_tracker_meds');
    const savedLogs = localStorage.getItem('health_tracker_med_logs');
    if (savedMeds) setMedications(JSON.parse(savedMeds));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  // Save to localStorage
  const saveMedications = (newMeds: Medication[]) => {
    setMedications(newMeds);
    localStorage.setItem('health_tracker_meds', JSON.stringify(newMeds));
  };

  const saveLogs = (newLogs: IntakeLog) => {
    setLogs(newLogs);
    localStorage.setItem('health_tracker_med_logs', JSON.stringify(newLogs));
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDosage.trim()) return;

    const newMed: Medication = {
      id: Math.random().toString(36).substring(7),
      name: newMedName.trim(),
      dosage: newMedDosage.trim(),
      frequency: newMedFreq,
      times: { ...newTimes },
    };

    const updatedMeds = [...medications, newMed];
    saveMedications(updatedMeds);

    // Reset Form
    setNewMedName('');
    setNewMedDosage('');
    setNewMedFreq('daily');
    setNewTimes({
      morning: true,
      afternoon: false,
      evening: false,
      night: false,
    });
    setShowAddForm(false);
  };

  const handleDeleteMedication = (id: string) => {
    const updatedMeds = medications.filter(m => m.id !== id);
    saveMedications(updatedMeds);

    // Clean up logs for this med
    const updatedLogs = { ...logs };
    Object.keys(updatedLogs).forEach(date => {
      Object.keys(updatedLogs[date]).forEach(key => {
        if (key.startsWith(id)) {
          delete updatedLogs[date][key];
        }
      });
    });
    saveLogs(updatedLogs);
  };

  const toggleDose = (medId: string, time: string) => {
    const doseKey = `${medId}-${time}`;
    const dateLogs = logs[todayStr] || {};
    const isCompleted = !!dateLogs[doseKey];

    const updatedLogs = {
      ...logs,
      [todayStr]: {
        ...dateLogs,
        [doseKey]: !isCompleted,
      },
    };
    saveLogs(updatedLogs);
  };

  // Generate today's individual doses
  const getTodayDoses = () => {
    const doses: { med: Medication; time: 'morning' | 'afternoon' | 'evening' | 'night' }[] = [];
    medications.forEach(med => {
      if (med.times.morning) doses.push({ med, time: 'morning' });
      if (med.times.afternoon) doses.push({ med, time: 'afternoon' });
      if (med.times.evening) doses.push({ med, time: 'evening' });
      if (med.times.night) doses.push({ med, time: 'night' });
    });
    return doses;
  };

  const todayDoses = getTodayDoses();
  const completedDoses = todayDoses.filter(d => {
    const key = `${d.med.id}-${d.time}`;
    return logs[todayStr]?.[key];
  });

  const completionPercent = todayDoses.length > 0 
    ? Math.round((completedDoses.length / todayDoses.length) * 100) 
    : 0;

  // SVG parameters for the progress circle
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg shadow-slate-200/40 border border-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Today's Schedule</h2>
            <p className="text-slate-600 text-xs mt-1">
              Track and log your daily medication intakes.
            </p>
          </div>
        </div>

        {/* Progress Circle & Text */}
        {todayDoses.length > 0 && (
          <div className="flex items-center gap-4 bg-slate-50/50 py-3 px-5 rounded-2xl border border-slate-100 shadow-inner">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  className="stroke-slate-200 fill-transparent"
                  strokeWidth="6"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  className="stroke-blue-600 fill-transparent transition-all duration-500 ease-out"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-semibold text-slate-800">{completionPercent}%</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {completedDoses.length} of {todayDoses.length} Doses
              </p>
              <p className="text-[11px] text-slate-500">Intake Progress</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Medication
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddMedication}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg border border-white space-y-6 overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-slate-900">Add New Medication</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Medication Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol, Lipitor"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Dosage</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1 pill, 5ml, 500mg"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Intake Schedule (Times of Day)</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(newTimes).map((time) => (
                    <label
                      key={time}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                        newTimes[time as keyof typeof newTimes]
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={newTimes[time as keyof typeof newTimes]}
                        onChange={(e) =>
                          setNewTimes({ ...newTimes, [time]: e.target.checked })
                        }
                        className="sr-only"
                      />
                      <Clock className="w-4 h-4 shrink-0" />
                      <span className="text-xs capitalize">{time}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex gap-3 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-5 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    Save Schedule
                  </button>
                </div>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Daily Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            Today's Checklist
            <span className="text-xs font-normal text-slate-500 bg-slate-100 py-0.5 px-2 rounded-full">
              {todayStr}
            </span>
          </h3>

          {todayDoses.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-10 text-center shadow-sm">
              <Pill className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-700 font-medium">No doses scheduled for today</p>
              <p className="text-slate-500 text-xs mt-1">
                Log medications using the "Add Medication" button to populate this list.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {todayDoses.map(({ med, time }, index) => {
                  const isTaken = !!logs[todayStr]?.[`${med.id}-${time}`];
                  return (
                    <motion.div
                      key={`${med.id}-${time}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => toggleDose(med.id, time)}
                      className={`flex items-center justify-between p-4 bg-white/85 backdrop-blur-sm border rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 ${
                        isTaken 
                          ? 'border-emerald-200 bg-emerald-50/20' 
                          : 'border-slate-100 hover:border-blue-100'
                      }`}
                    >
                      <div className="flex items-center gap-4.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                            isTaken
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-400 group-hover:text-slate-600'
                          }`}
                        >
                          <Check className={`w-5 h-5 transition-transform duration-300 ${isTaken ? 'scale-100' : 'scale-0'}`} />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${isTaken ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                            {med.name}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">{med.dosage}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase border ${
                        isTaken
                          ? 'bg-emerald-100/60 text-emerald-800 border-emerald-200/50'
                          : 'bg-blue-50 text-blue-700 border-blue-100/50'
                      }`}>
                        {time}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right Side: Active Med List & Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Manage Medications</h3>
          {medications.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 text-center shadow-sm text-slate-500 text-xs">
              Configure your medicine schedule to display cards here.
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {medications.map((med) => (
                  <motion.div
                    key={med.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 shadow-sm relative group hover:border-red-100 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100/50">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{med.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{med.dosage}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMedication(med.id)}
                        className="p-1.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete schedule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {Object.entries(med.times)
                        .filter(([_, active]) => active)
                        .map(([time]) => (
                          <span
                            key={time}
                            className="text-[9px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 capitalize border border-slate-200/30"
                          >
                            {time}
                          </span>
                        ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
