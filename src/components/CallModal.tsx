import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Calendar,
  AlertCircle
} from 'lucide-react';
import type { PatientSummary } from '../types';

interface CallModalProps {
  patient: PatientSummary;
  onClose: () => void;
  onSubmitOutcome: (outcome: string, notes: string) => Promise<void>;
}

type CallState = 'calling' | 'connected' | 'no_answer' | 'unavailable' | 'failed' | 'completed';

export const CallModal: React.FC<CallModalProps> = ({ patient, onClose, onSubmitOutcome }) => {
  const [callState, setCallState] = useState<CallState>('calling');
  const [callDuration, setCallDuration] = useState(0);
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Call duration timer
  useEffect(() => {
    let timer: any;
    if (callState === 'calling' || callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStateSelect = (nextState: CallState) => {
    setCallState(nextState);
  };

  const handleSaveOutcome = async (outcomeType: string, customNotes?: string) => {
    setIsSubmitting(true);
    try {
      await onSubmitOutcome(
        outcomeType,
        customNotes || notes || `Outreach call result: ${outcomeType}`
      );
      setCallState('completed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const possibleOutcomes = [
    { id: 'appointment_confirmed', label: 'Appointment confirmed' },
    { id: 'medicine_pickup_confirmed', label: 'Medicine pickup confirmed' },
    { id: 'test_completed', label: 'Test completed' },
    { id: 'followup_completed', label: 'Follow-up completed' },
    { id: 'patient_unavailable', label: 'Patient unavailable' },
    { id: 'needs_asha_visit', label: 'Needs ASHA visit' },
    { id: 'other', label: 'Other' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-lg w-full overflow-hidden text-slate-900">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Patient Telephonic Outreach
              </h3>
              <p className="text-xs text-slate-500">
                {patient.name} ({patient.patient_id})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Call Context Summary */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 block text-[11px]">Contact Number:</span>
              <span className="font-mono font-medium text-slate-800">{patient.contact_number}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Care Breakpoint:</span>
              <span className="font-medium text-amber-700">
                {patient.care_breakpoint?.stage || 'Routine Follow-Up'}
              </span>
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-slate-400 block text-[11px]">Required Care Action:</span>
            <p className="text-slate-700 text-xs">
              {patient.care_breakpoint?.next_required_action || 'Routine check for blood pressure and medication replenishment.'}
            </p>
          </div>
        </div>

        {/* Modal Body Based on State */}
        <div className="p-5">
          {/* STATE 1: Calling... */}
          {callState === 'calling' && (
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-teal-50 border-2 border-teal-500/30 flex items-center justify-center animate-pulse">
                <PhoneCall className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <div className="text-base font-bold font-mono text-slate-900">
                  Calling... <span className="tabular-nums">{formatSeconds(callDuration)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ringing mobile subscriber in village catchment ({patient.block})...
                </p>
              </div>

              {/* Call State Buttons */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-500 text-left mb-1">
                  Select Call Telephony State:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStateSelect('connected')}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Connected</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStateSelect('no_answer')}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>No Answer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStateSelect('unavailable')}
                    className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Patient Unavailable</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStateSelect('failed')}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Call Failed</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: Connected */}
          {callState === 'connected' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                    Connected · Telephonic Counseling
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {formatSeconds(callDuration)}
                </span>
              </div>

              {/* Connected Clinical Verification Guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
                <div className="font-semibold text-slate-900">
                  Call Checklist & Key Points:
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <div>
                    <strong>Reason for Call:</strong> Follow-up regarding {patient.chronic_conditions} management.
                  </div>
                  <div>
                    <strong>Next Care Action:</strong> {patient.care_breakpoint?.next_required_action || 'Routine clinic check-up.'}
                  </div>
                  <div>
                    <strong>Follow-Up Due Date:</strong> {patient.care_breakpoint?.date || 'Due this week'} at {patient.facility_id}.
                  </div>
                </div>
              </div>

              {/* Record Outcome Options */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Record Outcome:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {possibleOutcomes.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedOutcome(item.label)}
                      className={`px-2.5 py-1.5 text-xs text-left rounded-md border transition-colors ${
                        selectedOutcome === item.label
                          ? 'bg-teal-50 border-teal-500 text-teal-800 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Outreach Notes:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Patient confirmed attendance; caregiver informed about medicine pickup."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Clinical Assurance Protocol:</strong> Calling registers an outreach attempt. Care Restored is recorded only when the physical care action is verified.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedOutcome || isSubmitting}
                  onClick={() => handleSaveOutcome(selectedOutcome)}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Record Outcome'}
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: No Answer */}
          {callState === 'no_answer' && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                  <PhoneOff className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2">No Answer</h4>
                <p className="text-xs text-slate-500">
                  The patient did not answer the phone call.
                </p>
              </div>

              <div className="text-[11px] text-slate-500 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                Protocol: Consecutive unanswered calls automatically escalate to an ASHA field visit alert.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCallState('calling')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSaveOutcome('no_answer', 'Patient did not answer phone call.')}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
                >
                  {isSubmitting ? 'Saving...' : 'Log No Answer'}
                </button>
              </div>
            </div>
          )}

          {/* STATE 4: Unavailable */}
          {callState === 'unavailable' && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2">Patient Unavailable</h4>
                <p className="text-xs text-slate-500">
                  Caregiver or family member answered, or patient is away from home.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Callback Notes:
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. In field until 5 PM; requested callback in evening."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCallState('calling')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSaveOutcome('unavailable', notes || 'Patient temporarily unavailable.')}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
                >
                  {isSubmitting ? 'Saving...' : 'Log Unavailable'}
                </button>
              </div>
            </div>
          )}

          {/* STATE 5: Call Failed */}
          {callState === 'failed' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Network or Device Error</h4>
              <p className="text-xs text-slate-500">
                Number switched off, out of coverage area, or network congestion.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCallState('calling')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                >
                  Retry
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSaveOutcome('failed', 'Mobile network unreachable or switched off.')}
                  className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                >
                  Log Failed Attempt
                </button>
              </div>
            </div>
          )}

          {/* STATE 6: Completed */}
          {callState === 'completed' && (
            <div className="text-center py-5 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Outreach Attempt Logged
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  The event has been recorded in the patient continuity history.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
