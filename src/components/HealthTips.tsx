import React from 'react';
import { HeartPulse, Droplets, Moon, Apple } from 'lucide-react';

export function HealthTips() {
  const tips = [
    {
      icon: <Droplets className="w-5 h-5 text-blue-500" />,
      title: 'Stay Hydrated',
      description: 'Drink at least 8 glasses of water a day to keep your body functioning properly.'
    },
    {
      icon: <Moon className="w-5 h-5 text-indigo-500" />,
      title: 'Get Enough Sleep',
      description: 'Aim for 7-9 hours of quality sleep each night to support immune function.'
    },
    {
      icon: <Apple className="w-5 h-5 text-emerald-500" />,
      title: 'Eat Nutritious Foods',
      description: 'Incorporate plenty of fruits, vegetables, and whole grains into your diet.'
    },
    {
      icon: <HeartPulse className="w-5 h-5 text-rose-500" />,
      title: 'Stay Active',
      description: 'Engage in at least 30 minutes of moderate exercise most days of the week.'
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white p-6 md:p-8">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 tracking-tight">
        <HeartPulse className="w-5 h-5 text-rose-500" />
        Daily Health Tips
      </h3>
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex gap-3 group">
            <div className="shrink-0 mt-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all">
              {tip.icon}
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-900">{tip.title}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
