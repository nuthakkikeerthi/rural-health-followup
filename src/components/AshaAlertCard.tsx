import React, { useState } from 'react';
import { AlertCircle, Phone, CheckCircle2, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import type { AshaAlert } from '../types';

interface AshaAlertCardProps {
  alert: AshaAlert;
  onCallAgain: (patientId: string) => void;
  onRecordOutcome: (patientId: string) => void;
  onResolve: (alertId: string, notes: string) => Promise<void>;
  onViewPatient?: (patientId: string) => void;
}

export const AshaAlertCard: React.FC<AshaAlertCardProps> = ({
  alert,
  onCallAgain,
  onRecordOutcome,
  onResolve,
  onViewPatient
}) => {
  const [isResolving, setIsResolving] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');

  const handleConfirmResolve = async () => {
    setIsResolving(true);
    try {
      await onResolve(
        alert.id,
        resolveNotes || 'In-person field contact established by ASHA. Follow-up plan restored.'
      );
      setShowResolveModal(false);
    } finally {
      setIsResolving(false);
    }
  };

  const getRiskColor = (tier: string) => {
    switch (tier) {
      case 'Critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'High':
        return 'bg-orange-950/80 text-orange-300 border-orange-800';
      case 'Medium':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-rose-950/30 border-2 border-rose-700/80 rounded-xl p-5 shadow-lg relative overflow-hidden text-white transition-all hover:border-rose-600">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between pb-3 border-b border-rose-800/40">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            🔴 FOLLOW-UP ATTENTION REQUIRED
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold px-2 py-0.5 border rounded ${getRiskColor(alert.risk_tier)}`}>
            {alert.risk_tier.toUpperCase()} RISK
          </span>
          <span className="text-[11px] text-slate-400">
            Attempts: <strong className="text-white">{alert.attempts}</strong>
          </span>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-slate-400 text-[11px]">Patient:</div>
          <div className="font-semibold text-white text-sm">
            {alert.patient_name} <span className="text-slate-400 font-mono text-xs">({alert.patient_id})</span>
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-[11px]">Care Breakpoint:</div>
          <div className="font-medium text-amber-300">
            {alert.care_breakpoint}
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-[11px]">Last Contact Attempt:</div>
          <div className="text-slate-200">
            {alert.last_attempt_date}
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-[11px]">Reason for Alert:</div>
          <div className="text-rose-200 font-medium">
            {alert.reason}
          </div>
        </div>
      </div>

      {/* Recommended Action Notice */}
      <div className="mt-1 p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
        <div className="text-[11px] font-semibold text-teal-400 uppercase tracking-wide">
          Recommended Action:
        </div>
        <p className="text-slate-200 mt-0.5">
          {alert.recommended_action}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-rose-800/40 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCallAgain(alert.patient_id)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-teal-400" />
            CALL AGAIN
          </button>

          <button
            type="button"
            onClick={() => onRecordOutcome(alert.patient_id)}
            className="px-3 py-1.5 bg-teal-800 hover:bg-teal-700 border border-teal-600 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            RECORD OUTCOME
          </button>

          <button
            type="button"
            onClick={() => setShowResolveModal(true)}
            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            MARK RESOLVED
          </button>
        </div>

        {onViewPatient && (
          <button
            type="button"
            onClick={() => onViewPatient(alert.patient_id)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            View 360 Record <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="text-sm font-semibold text-white">Resolve Follow-up Attention Alert</h4>
            <p className="text-xs text-slate-400">
              Provide evidence notes regarding how the patient was re-engaged or how the care gap was resolved.
            </p>
            <textarea
              rows={3}
              value={resolveNotes}
              onChange={e => setResolveNotes(e.target.value)}
              placeholder="e.g. Conducted home visit; delivered Metformin buffer sachet; patient attended Rampur Sub-Centre on 26 Feb."
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white focus:outline-hidden focus:border-teal-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResolving}
                onClick={handleConfirmResolve}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
              >
                {isResolving ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
