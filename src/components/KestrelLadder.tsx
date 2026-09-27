import React from 'react';
import { ShieldAlert, ArrowUpRight, CheckCircle2, User, PhoneForwarded } from 'lucide-react';
import type { KestrelStatus } from '../types';

interface KestrelLadderProps {
  kestrel: KestrelStatus;
}

const STAGES = [
  { stage: 1, name: 'T-0 Pre-Due Adherence Prompt', desc: 'Pre-due SMS & routine adherence reminder' },
  { stage: 2, name: 'T+1 Primary Telephonic Outreach', desc: 'First telephone contact attempt by assigned ASHA' },
  { stage: 3, name: 'T+3 Secondary Telephonic Outreach', desc: 'Second telephone contact at alternate time/caregiver' },
  { stage: 4, name: 'T+5 ASHA Field Home Outreach & Alert', desc: 'Physical home visit & community diagnostic check' },
  { stage: 5, name: 'T+7 CHO / ANM Facilitated Intervention', desc: 'Facility nurse review & doorstep medication delivery' },
  { stage: 6, name: 'T+14 Clinical Outreach & Doctor Review', desc: 'Medical Officer clinical review & special triage' },
  { stage: 7, name: 'T+21 Administrative & Village Resolution', desc: 'Gram Panchayat VHSNC community protocol endpoint' }
];

export const KestrelLadder: React.FC<KestrelLadderProps> = ({ kestrel }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'text-rose-400 bg-rose-950/60 border-rose-700';
      case 'High':
        return 'text-orange-400 bg-orange-950/60 border-orange-700';
      case 'Medium':
        return 'text-amber-400 bg-amber-950/60 border-amber-700';
      default:
        return 'text-teal-400 bg-teal-950/60 border-teal-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-400">
            Escalation Protocol
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Kestrel-7 Ladder: <span className="text-teal-300">Stage {kestrel.current_stage}</span>
          </h3>
        </div>
        <div className={`px-2.5 py-1 rounded text-xs font-bold uppercase border ${getPriorityColor(kestrel.priority)}`}>
          Priority: {kestrel.priority}
        </div>
      </div>

      {/* Active Stage Banner */}
      <div className="p-3.5 bg-slate-850 border border-teal-900/60 rounded-lg space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-teal-300 flex items-center gap-1.5">
            <PhoneForwarded className="w-3.5 h-3.5" />
            {kestrel.stage_name}
          </span>
          <span className="text-slate-400">
            Assigned: <strong className="text-slate-200">{kestrel.assigned_worker}</strong>
          </span>
        </div>
        <p className="text-xs text-slate-300">
          <strong>Recommended Action:</strong> {kestrel.recommended_action}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
          <span>Outreach Attempts: <strong className="text-white">{kestrel.outreach_attempts}</strong></span>
          <span>Next Action: <strong className="text-teal-400">{kestrel.next_action}</strong></span>
          {kestrel.stopped_reason && (
            <span className="text-emerald-400 font-medium">· {kestrel.stopped_reason}</span>
          )}
        </div>
      </div>

      {/* 7-Stage Visual Step Progress */}
      <div className="pt-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Kestrel-7 Escalation Rung
        </div>
        <div className="space-y-1.5">
          {STAGES.map(s => {
            const isCurrent = s.stage === kestrel.current_stage;
            const isPassed = s.stage < kestrel.current_stage;

            return (
              <div
                key={s.stage}
                className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                  isCurrent
                    ? 'bg-teal-950/80 border-teal-500 text-teal-200 font-semibold shadow-xs'
                    : isPassed
                    ? 'bg-slate-850/60 border-slate-800 text-slate-400'
                    : 'bg-slate-900/40 border-slate-850 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-teal-500 text-slate-950'
                        : isPassed
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    {s.stage}
                  </span>
                  <span>{s.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 hidden sm:block">
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
