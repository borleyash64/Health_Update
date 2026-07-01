import React, { FC } from 'react';
import { Condition } from '../types';
import { ShieldAlert, ShieldCheck, Shield, Stethoscope, Info } from 'lucide-react';
import clsx from 'clsx';

interface ResultCardProps {
  condition: Condition;
}

export const ResultCard: FC<ResultCardProps> = ({ condition }) => {
  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return <ShieldAlert className="w-4 h-4" />;
      case 'medium':
        return <Shield className="w-4 h-4" />;
      case 'low':
        return <ShieldCheck className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white overflow-hidden transition-all hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 duration-300">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h4 className="text-lg font-semibold text-slate-900">{condition.condition}</h4>
            <p className="text-sm text-slate-600 mt-1">{condition.description}</p>
          </div>
          <div className={clsx(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0',
            getRiskColor(condition.riskLevel)
          )}>
            {getRiskIcon(condition.riskLevel)}
            {condition.riskLevel} Risk
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <div className="flex gap-3">
            <div className="mt-0.5 bg-indigo-50 p-1.5 rounded-lg text-indigo-600 shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-sm font-medium text-slate-900">Basic Advice</h5>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{condition.basicAdvice}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 bg-rose-50 p-1.5 rounded-lg text-rose-600 shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-sm font-medium text-slate-900">When to see a doctor</h5>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{condition.whenToSeeDoctor}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
