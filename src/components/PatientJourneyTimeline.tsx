import React from 'react';
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  MinusCircle,
  FileSpreadsheet,
  Stethoscope,
  Pill,
  PackageCheck,
  FlaskConical,
  CalendarCheck,
  PhoneCall,
  Award
} from 'lucide-react';
import type { JourneyEvent } from '../types';

interface PatientJourneyTimelineProps {
  events: JourneyEvent[];
}

export const PatientJourneyTimeline: React.FC<PatientJourneyTimelineProps> = ({ events }) => {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'Screening':
        return FileSpreadsheet;
      case 'Teleconsultation':
        return Stethoscope;
      case 'Prescription':
        return Pill;
      case 'Medicine':
        return PackageCheck;
      case 'Test':
        return FlaskConical;
      case 'FollowUp':
        return CalendarCheck;
      case 'Outreach':
        return PhoneCall;
      case 'Outcome':
        return Award;
      default:
        return CheckCircle2;
    }
  };

  const getStatusBadge = (status: JourneyEvent['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'not_recorded':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <HelpCircle className="w-3.5 h-3.5" /> Not recorded
          </span>
        );
      case 'not_applicable':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
            <MinusCircle className="w-3.5 h-3.5" /> Not applicable
          </span>
        );
    }
  };

  const getNodeColor = (status: JourneyEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-950 border-emerald-500 text-emerald-300';
      case 'pending':
        return 'bg-amber-950 border-amber-500 text-amber-300 animate-pulse';
      case 'not_recorded':
        return 'bg-slate-800 border-slate-700 text-slate-500';
      case 'not_applicable':
        return 'bg-slate-900 border-slate-800 text-slate-600';
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
      {events.map((evt, idx) => {
        const Icon = getStageIcon(evt.stage);
        return (
          <div key={idx} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${getNodeColor(
                evt.status
              )}`}
            >
              <Icon className="w-3 h-3" />
            </div>

            {/* Event Content Card */}
            <div className="bg-slate-850 border border-slate-800 rounded-lg p-3.5 hover:border-slate-700 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white tracking-wide">
                    {idx + 1}. {evt.title}
                  </h4>
                  {evt.date && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      · {evt.date}
                    </span>
                  )}
                </div>
                <div>{getStatusBadge(evt.status)}</div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{evt.details}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
