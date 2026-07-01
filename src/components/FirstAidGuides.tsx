import React, { useState } from 'react';
import { Search, Heart, Plus, ShieldAlert, Phone, ChevronDown, HeartHandshake, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Guide {
  id: string;
  title: string;
  category: 'cardiac' | 'trauma' | 'environmental' | 'general';
  summary: string;
  steps: string[];
  whatToDo: string[];
  whatNotToDo: string[];
}

const FIRST_AID_GUIDES: Guide[] = [
  {
    id: 'cpr',
    title: 'Cardiopulmonary Resuscitation (CPR)',
    category: 'cardiac',
    summary: 'Performed when someone has stopped breathing or their heart has stopped beating.',
    steps: [
      'Call emergency services immediately (911 / 112 / 102).',
      'Place the person on their back on a firm, flat surface.',
      'Place the heel of one hand in the center of the chest, place your other hand on top, and interlock fingers.',
      'Push hard and fast: compress the chest at least 2 inches at a rate of 100 to 120 compressions per minute.',
      'If trained, deliver 2 rescue breaths after every 30 compressions.',
      'Continue until emergency responders arrive or an AED becomes available.'
    ],
    whatToDo: [
      'Keep arms straight and push using your body weight.',
      'Allow the chest to rise completely between compressions.'
    ],
    whatNotToDo: [
      'Do not stop compressions for more than 10 seconds.',
      'Do not press on the ribs or the lower end of the breastbone.'
    ]
  },
  {
    id: 'choking',
    title: 'Choking Relief (Heimlich Maneuver)',
    category: 'cardiac',
    summary: 'Emergency procedure to clear a blocked airway in a conscious person.',
    steps: [
      'Stand behind the choking person, wrap your arms around their waist.',
      'Make a fist with one hand, placing the thumb side against the person\'s abdomen, slightly above the navel.',
      'Grasp your fist with your other hand.',
      'Press into the abdomen with quick, upward thrusts.',
      'Repeat until the object is expelled or the person becomes unconscious.',
      'If the person loses consciousness, lower them to the ground and start CPR.'
    ],
    whatToDo: [
      'Ask "Are you choking?" before performing the maneuver.',
      'For infants, use alternate back blows and chest thrusts.'
    ],
    whatNotToDo: [
      'Do not perform abdominal thrusts on pregnant women or infants (use chest thrusts instead).',
      'Do not slap a choking person on the back if they are coughing strongly.'
    ]
  },
  {
    id: 'bleeding',
    title: 'Severe Bleeding Control',
    category: 'trauma',
    summary: 'Steps to stop blood loss from deep cuts or physical trauma.',
    steps: [
      'Put on medical gloves if available to prevent infection.',
      'Expose the wound by removing or cutting away clothing.',
      'Apply direct pressure to the wound with a clean sterile bandage or cloth.',
      'Maintain continuous pressure for at least 5-10 minutes without checking.',
      'If bleeding does not stop, apply additional bandages on top (do not remove the original ones).',
      'Elevate the injured limb above heart level if possible.'
    ],
    whatToDo: [
      'Keep firm, continuous pressure on the wound.',
      'Apply a tourniquet if bleeding is life-threatening on limbs and direct pressure fails.'
    ],
    whatNotToDo: [
      'Do not remove the initial bandage if blood seeps through, just add more layers.',
      'Do not wash deep, heavily bleeding wounds.'
    ]
  },
  {
    id: 'burns',
    title: 'Burns Treatment',
    category: 'trauma',
    summary: 'First aid for thermal, electrical, or chemical burns.',
    steps: [
      'Ensure the source of the burn is removed or turned off.',
      'Cool the burn immediately using cool (not cold) running water for 10 to 20 minutes.',
      'Remove jewelry or tight clothing near the burned area before it starts to swell.',
      'Cover the burn loosely with a sterile, non-adhesive bandage or clean plastic wrap.',
      'Administer over-the-counter pain relievers if necessary.'
    ],
    whatToDo: [
      'Keep the burn clean and dry after cooling.',
      'Seek emergency assistance for large burns (greater than 3 inches in diameter) or burns on the face/hands.'
    ],
    whatNotToDo: [
      'Do not apply ice, butter, toothpaste, or ointments to a fresh burn.',
      'Do not pop blisters as it increases the risk of infection.'
    ]
  },
  {
    id: 'snakebites',
    title: 'Venomous Snakebites',
    category: 'environmental',
    summary: 'Immediate actions to take after a bite from a venomous snake.',
    steps: [
      'Keep the victim calm and still; movement causes venom to spread faster.',
      'Call emergency services immediately.',
      'Gently wash the bite area with soap and water.',
      'Remove tight rings, watches, or clothing from the bitten limb before swelling starts.',
      'Keep the bite site positioned at or below heart level.'
    ],
    whatToDo: [
      'Try to safely remember or photograph the snake\'s appearance for identification.',
      'Keep the patient as immobile as possible.'
    ],
    whatNotToDo: [
      'Do not use a tourniquet or slash the wound.',
      'Do not try to suck out the venom by mouth.',
      'Do not apply ice or immerse the wound in water.'
    ]
  },
  {
    id: 'heatstroke',
    title: 'Heat Stroke Relief',
    category: 'environmental',
    summary: 'Life-threatening condition when body temperature rises above 104°F (40°C).',
    steps: [
      'Move the person immediately to a cool, shaded, or air-conditioned area.',
      'Call emergency medical services right away.',
      'Cool the person rapidly: spray with cool water, fan them, or place ice packs on the neck, groin, and armpits.',
      'If conscious, offer cool water to sip slowly.'
    ],
    whatToDo: [
      'Keep monitoring their breathing and consciousness level.',
      'Loosen or remove excess heavy clothing.'
    ],
    whatNotToDo: [
      'Do not give alcoholic or caffeinated drinks.',
      'Do not give aspirin or acetaminophen to reduce the temperature.'
    ]
  }
];

export function FirstAidGuides() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'cardiac' | 'trauma' | 'environmental'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredGuides = FIRST_AID_GUIDES.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(search.toLowerCase()) ||
                          guide.summary.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter === 'all' || guide.category === filter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg shadow-slate-200/40 border border-white space-y-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-4">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm border border-rose-100">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Emergency First Aid Guides</h2>
            <p className="text-slate-600 mt-2 max-w-md mx-auto">
              Quick access to step-by-step instructions for life-saving procedures and emergencies.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search first aid topics (e.g. CPR, bleeding)..."
            className="w-full px-4 py-3 pl-12 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-sm text-slate-900 placeholder:text-slate-400 shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2">
          {['all', 'cardiac', 'trauma', 'environmental'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilter(cat as any);
                setExpandedId(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                filter === cat
                  ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Guides List */}
      <div className="space-y-4">
        {filteredGuides.length === 0 ? (
          <div className="bg-white/80 border border-slate-200 rounded-3xl p-8 text-center text-slate-500 text-sm shadow-sm">
            No guides matches your search query. Try another term.
          </div>
        ) : (
          filteredGuides.map((guide) => {
            const isExpanded = expandedId === guide.id;
            return (
              <div
                key={guide.id}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white overflow-hidden transition-all duration-300"
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => toggleExpand(guide.id)}
                  className="w-full px-6 py-5 text-left flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        guide.category === 'cardiac' ? 'bg-rose-500' :
                        guide.category === 'trauma' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base">{guide.title}</h3>
                    </div>
                    <p className="text-xs text-slate-500">{guide.summary}</p>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-1 rounded-lg bg-slate-100/80 text-slate-500 shrink-0 mt-1"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                {/* Expanded Details */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 border-t border-slate-100 pt-5 space-y-6">
                        {/* Step By Step Checklist */}
                        <div>
                          <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-3">
                            Step-By-Step Actions
                          </h4>
                          <ol className="space-y-3.5">
                            {guide.steps.map((step, idx) => (
                              <li key={idx} className="flex gap-3 text-xs leading-relaxed text-slate-700">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-800 font-bold shrink-0 text-[10px]">
                                  {idx + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Warnings & Advice */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* What TO Do */}
                          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-2">
                            <h5 className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Plus className="w-3.5 h-3.5 bg-emerald-500 text-white rounded-full p-0.5" />
                              Dos / Best Practices
                            </h5>
                            <ul className="space-y-2">
                              {guide.whatToDo.map((doItem, idx) => (
                                <li key={idx} className="text-xs text-emerald-800 flex gap-2">
                                  <span className="shrink-0 mt-1">✓</span>
                                  <span>{doItem}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* What NOT To Do */}
                          <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 space-y-2">
                            <h5 className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                              Don'ts / Warnings
                            </h5>
                            <ul className="space-y-2">
                              {guide.whatNotToDo.map((notDoItem, idx) => (
                                <li key={idx} className="text-xs text-rose-800 flex gap-2">
                                  <span className="shrink-0 mt-1">✗</span>
                                  <span>{notDoItem}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Emergency Contacts Panel */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 w-44 h-44 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center border border-rose-500/30">
            <Phone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Need Urgent Assistance?</h3>
            <p className="text-slate-400 text-xs mt-1">
              Contact local emergency medical services instantly.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <a
            href="tel:911"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            Dial 911 (US)
          </a>
          <a
            href="tel:112"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            Dial 112 (EU/Global)
          </a>
        </div>
      </div>
    </div>
  );
}
