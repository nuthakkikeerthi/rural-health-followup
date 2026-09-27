import React, { useState } from 'react';
import { Home, Pill, CheckCircle2, X, Calendar, AlertCircle } from 'lucide-react';
import type { PatientSummary } from '../types';

interface FieldInterventionModalProps {
  patient: PatientSummary;
  onClose: () => void;
  onRestoreCare: (patientId: string, reason: string) => Promise<void>;
  onRecordDispense?: (patientId: string, items: string) => Promise<void>;
}

export const FieldInterventionModal: React.FC<FieldInterventionModalProps> = ({
  patient,
  onClose,
  onRestoreCare,
  onRecordDispense
}) => {
  const [interventionType, setInterventionType] = useState<'home_visit' | 'medicine_delivery' | 'followup_verified'>('home_visit');
  const [notes, setNotes] = useState('');
  const [dispenseItems, setDispenseItems] = useState('Tab Metformin 500mg (30 tabs) + Tab Telmisartan 40mg (30 tabs)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (interventionType === 'medicine_delivery' && onRecordDispense) {
        await onRecordDispense(patient.patient_id, dispenseItems);
      }

      let resolutionReason = '';
      if (interventionType === 'home_visit') {
        resolutionReason = `ASHA Field Home Visit completed. Vitals checked: ${notes || 'BP stable'}. Follow-up confirmed.`;
      } else if (interventionType === 'medicine_delivery') {
        resolutionReason = `Doorstep medicine supply delivered to patient (${dispenseItems}). Stockout resolved.`;
      } else {
        resolutionReason = `Verified clinic attendance at ${patient.facility_id}: ${notes || 'Consultation completed and vitals logged.'}`;
      }

      await onRestoreCare(patient.patient_id, resolutionReason);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      alert(`Error recording intervention: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-lg w-full overflow-hidden text-slate-900">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Record Field Outcome & Verify Care Restored
              </h3>
              <p className="text-xs text-slate-500">
                Patient: {patient.name} ({patient.patient_id})
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

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-emerald-800">
              Care Restored Verified
            </h4>
            <p className="text-xs text-slate-500">
              The continuity gap has been resolved and recorded in the patient 360 record.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Breakpoint Context */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
              <span className="text-slate-400 block text-[11px]">Identified Gap:</span>
              <span className="font-semibold text-slate-800">
                {patient.care_breakpoint?.stage || 'Adherence Gap'} — {patient.care_breakpoint?.evidence || 'Follow-up verification needed.'}
              </span>
            </div>

            {/* Select Intervention Performed */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Physical Verification Performed:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setInterventionType('home_visit')}
                  className={`p-2.5 rounded-lg border text-xs text-center transition-colors ${
                    interventionType === 'home_visit'
                      ? 'bg-teal-50 border-teal-500 text-teal-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Home className="w-4 h-4 mx-auto mb-1 text-teal-600" />
                  <span>Home Visit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInterventionType('medicine_delivery')}
                  className={`p-2.5 rounded-lg border text-xs text-center transition-colors ${
                    interventionType === 'medicine_delivery'
                      ? 'bg-teal-50 border-teal-500 text-teal-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Pill className="w-4 h-4 mx-auto mb-1 text-teal-600" />
                  <span>Medicine Refill</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInterventionType('followup_verified')}
                  className={`p-2.5 rounded-lg border text-xs text-center transition-colors ${
                    interventionType === 'followup_verified'
                      ? 'bg-teal-50 border-teal-500 text-teal-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-4 h-4 mx-auto mb-1 text-teal-600" />
                  <span>Clinic Attended</span>
                </button>
              </div>
            </div>

            {/* Medicine Refill Details if selected */}
            {interventionType === 'medicine_delivery' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Buffer Medicines Dispensed:
                </label>
                <input
                  type="text"
                  value={dispenseItems}
                  onChange={e => setDispenseItems(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  required
                />
              </div>
            )}

            {/* Verification Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verification Findings & Notes:
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. In-person visit conducted. Measured BP 132/84 mmHg. Refilled medication and counseled family."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:border-teal-600 focus:bg-white"
                required
              />
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Submitting this action verifies that the clinical barrier has been resolved. The patient will be marked <strong>Care Restored</strong> and the continuity index will update.
              </span>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                {isSubmitting ? 'Verifying...' : 'Verify & Mark Care Restored'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
