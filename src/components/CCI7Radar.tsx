import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, Info } from 'lucide-react';
import type { CCI7Result } from '../types';

interface CCI7RadarProps {
  cci: CCI7Result;
}

export const CCI7Radar: React.FC<CCI7RadarProps> = ({ cci }) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Optimal':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-700';
      case 'Sub-Optimal':
        return 'text-teal-400 bg-teal-950/60 border-teal-700';
      case 'Fragmented':
        return 'text-amber-400 bg-amber-950/60 border-amber-700';
      default:
        return 'text-rose-400 bg-rose-950/60 border-rose-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Met':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Met
          </span>
        );
      case 'At Risk':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
            <AlertTriangle className="w-3 h-3" /> At Risk
          </span>
        );
      case 'Incomplete':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
            <XCircle className="w-3 h-3" /> Incomplete
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <MinusCircle className="w-3 h-3" /> N/A
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Header & Score Gauge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-400">
            Continuity-of-Care Index (CCI-7)
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Index Score: <span className="font-mono text-xl text-teal-300">{cci.total_score}</span> / 100
          </h3>
        </div>
        <div className={`px-3 py-1 rounded-md border text-xs font-bold tracking-wide uppercase ${getTierColor(cci.tier)}`}>
          {cci.tier} Continuity
        </div>
      </div>

      {/* Score Progress Bar */}
      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            cci.total_score >= 80
              ? 'bg-emerald-500'
              : cci.total_score >= 60
              ? 'bg-teal-500'
              : cci.total_score >= 40
              ? 'bg-amber-500'
              : 'bg-rose-500'
          }`}
          style={{ width: `${Math.max(5, cci.total_score)}%` }}
        />
      </div>

      {/* Clinical Explanation */}
      <div className="p-3 bg-slate-850 border border-slate-800 rounded-lg text-xs flex items-start gap-2">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <span className="text-slate-300 leading-relaxed">
          {cci.explanation}
        </span>
      </div>

      {/* 7 Individual Component Breakdowns */}
      <div className="space-y-2.5 pt-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Seven Clinical Continuity Components
        </div>
        <div className="grid grid-cols-1 gap-2">
          {cci.components.map((comp, idx) => (
            <div
              key={comp.id}
              className="p-2.5 bg-slate-850 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-200">
                  {idx + 1}. {comp.name}
                  <span className="text-slate-400 font-mono text-[10px] ml-2">
                    (Weight: {comp.weight}%)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">{comp.evidence}</div>
              </div>
              <div className="shrink-0">{getStatusBadge(comp.status)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
