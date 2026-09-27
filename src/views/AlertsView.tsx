import React, { useState } from 'react';
import {
  BellRing,
  Phone,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Clock,
  Check
} from 'lucide-react';
import type { AshaAlert, PatientSummary } from '../types';

interface AlertsViewProps {
  alerts: AshaAlert[];
  patients: PatientSummary[];
  onCallAgain: (patientId: string) => void;
  onRecordOutcome: (patientId: string) => void;
  onResolveAlert: (alertId: string, notes: string) => Promise<void>;
  onSelectPatient: (patientId: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  patients,
  onCallAgain,
  onRecordOutcome,
  onResolveAlert,
  onSelectPatient
}) => {
  const [filter, setFilter] = useState<'OPEN' | 'RESOLVED' | 'ALL'>('OPEN');
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [assignedSuccess, setAssignedSuccess] = useState<string | null>(null);

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'ALL') return true;
    return a.status === filter;
  });

  const handleConfirmResolve = async (alertId: string) => {
    await onResolveAlert(alertId, resolveNotes || 'Resolved through verified field contact.');
    setResolvingAlertId(null);
    setResolveNotes('');
  };

  const handleAssignAsha = (alertId: string) => {
    setAssignedSuccess(alertId);
    setTimeout(() => {
      setAssignedSuccess(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Actionable Alerts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Escalated non-response and high-vulnerability care breakpoints requiring physical outreach.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setFilter('OPEN')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filter === 'OPEN'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Open Alerts ({alerts.filter(a => a.status === 'OPEN').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('RESOLVED')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filter === 'RESOLVED'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved ({alerts.filter(a => a.status === 'RESOLVED').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-xl p-12 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <div className="font-semibold text-slate-800 text-sm">No Active Alerts</div>
            <p className="text-xs text-slate-500 mt-1">
              All flagged follow-up issues are currently resolved or assigned.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isCritical = alert.risk_tier === 'Critical';
            const isResolved = alert.status === 'RESOLVED';

            return (
              <div
                key={alert.id}
                className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
                  isResolved
                    ? 'border-slate-200 opacity-75'
                    : isCritical
                    ? 'border-rose-200 ring-1 ring-rose-500/10'
                    : 'border-amber-200 ring-1 ring-amber-500/10'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Column: Alert Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isResolved
                            ? 'bg-slate-100 text-slate-600'
                            : isCritical
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {isResolved ? 'RESOLVED' : isCritical ? 'HIGH PRIORITY' : 'ACTION REQUIRED'}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-semibold text-slate-700">
                        Risk: {alert.risk_tier}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">
                        Attempts: <strong className="text-slate-800 tabular-nums">{alert.attempts}</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectPatient(alert.patient_id)}
                        className="text-base font-bold text-slate-900 hover:text-teal-700 transition-colors"
                      >
                        {alert.patient_name}
                      </button>
                      <span className="text-xs text-slate-400 font-mono">
                        ({alert.patient_id})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Care Breakpoint:</span>
                        <span className="font-medium text-slate-800">{alert.care_breakpoint}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Last Contact:</span>
                        <span className="font-medium text-slate-800">{alert.reason} ({alert.last_attempt_date})</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-700 border border-slate-100">
                      <span className="font-semibold text-slate-900">Recommended Action: </span>
                      <span>{alert.recommended_action}</span>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  {!isResolved && (
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => onCallAgain(alert.patient_id)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-teal-600" />
                          <span>CALL AGAIN</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAssignAsha(alert.id)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-1"
                        >
                          {assignedSuccess === alert.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>ASSIGNED</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3 text-teal-600" />
                              <span>ASSIGN ASHA</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onRecordOutcome(alert.patient_id)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>RECORD OUTCOME</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setResolvingAlertId(alert.id)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>MARK RESOLVED</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Inline Resolve Note Box */}
                {resolvingAlertId === alert.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Resolution Notes / Verification Summary:
                    </label>
                    <input
                      type="text"
                      value={resolveNotes}
                      onChange={e => setResolveNotes(e.target.value)}
                      placeholder="e.g., ASHA visited patient home. Medicine refill completed."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setResolvingAlertId(null)}
                        className="px-2.5 py-1 text-xs text-slate-600 bg-slate-100 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmResolve(alert.id)}
                        className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs"
                      >
                        Confirm Resolution
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
