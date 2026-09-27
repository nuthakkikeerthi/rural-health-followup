import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Pill,
  Stethoscope,
  FlaskConical,
  Calendar,
  UserCheck,
  FileText,
  Activity
} from 'lucide-react';
import { api } from '../api';
import type {
  PatientSummary,
  JourneyEvent,
  CCI7Result,
  CareBreakpoint,
  KestrelStatus,
  PatientPrediction,
  AshaAlert
} from '../types';

interface PatientDetailViewProps {
  patientId: string;
  onBack: () => void;
  onCallPatient: (patient: PatientSummary) => void;
  onRecordIntervention: (patient: PatientSummary) => void;
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patientId,
  onBack,
  onCallPatient,
  onRecordIntervention
}) => {
  const [loading, setLoading] = useState(true);
  const [activeDetailTab, setActiveDetailTab] = useState<'clinical' | 'cci' | 'kestrel' | 'history'>('clinical');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const [data, setData] = useState<{
    patient: PatientSummary;
    journey: { events: JourneyEvent[] };
    cci7: CCI7Result;
    care_breakpoint: CareBreakpoint | null;
    kestrel: KestrelStatus;
    ml_prediction: PatientPrediction;
    outreach_history: any[];
    alerts: AshaAlert[];
    clinical_data: any;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.fetchPatientDetail(patientId);
        if (mounted) setData(res);
      } catch (err: any) {
        console.error('Error loading patient:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDetails();
    return () => {
      mounted = false;
    };
  }, [patientId]);

  if (loading || !data) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 mx-auto border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Loading patient continuity profile...</p>
      </div>
    );
  }

  const { patient, journey, cci7, care_breakpoint, kestrel, ml_prediction, outreach_history, clinical_data } = data;
  const isRestored = patient.care_restored || kestrel.care_restored;

  // Standard 7-stage pathway definitions
  const continuumStages = [
    { key: 'Screening', label: 'Screening', short: 'Screening' },
    { key: 'Teleconsultation', label: 'Teleconsultation', short: 'Consult' },
    { key: 'Prescription', label: 'Prescription', short: 'Rx' },
    { key: 'Medicine', label: 'Medicine', short: 'Medicine' },
    { key: 'Test', label: 'Lab / Test', short: 'Lab' },
    { key: 'FollowUp', label: 'Follow-Up', short: 'Follow-Up' },
    { key: 'Outcome', label: 'Care Restored', short: 'Restored' }
  ];

  // Helper to determine status of each stage
  const getStageStatus = (stageKey: string) => {
    if (stageKey === 'Outcome') {
      return isRestored ? 'completed' : 'pending';
    }

    const event = journey.events.find(
      e => e.stage.toLowerCase() === stageKey.toLowerCase()
    );

    if (event?.status === 'completed') return 'completed';

    // If current breakpoint matches this stage
    if (care_breakpoint && care_breakpoint.stage.toLowerCase().includes(stageKey.toLowerCase().slice(0, 4))) {
      return 'breakpoint';
    }

    return event?.status || 'pending';
  };

  const getRiskBadge = (tier: string) => {
    switch (tier) {
      case 'Critical':
        return <span className="font-semibold text-rose-700">Risk: Critical</span>;
      case 'High':
        return <span className="font-semibold text-amber-700">Risk: High</span>;
      case 'Medium':
        return <span className="font-medium text-slate-700">Risk: Moderate</span>;
      default:
        return <span className="text-slate-500">Risk: Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Follow-Up Queue</span>
        </button>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {patient.name}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                ({patient.patient_id})
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-600 font-medium">
                {patient.age} years, {patient.gender === 'F' ? 'Female' : 'Male'}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-600 font-medium">
                ABHA: <span className="font-mono text-slate-700">{patient.abha_id}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">LTFU Tier:</span>
                {getRiskBadge(patient.lfu_risk_tier_k7)}
              </div>
              <span className="text-slate-200">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Condition:</span>
                <span className="font-medium text-slate-800">{patient.chronic_conditions}</span>
              </div>
              <span className="text-slate-200">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Assigned ASHA:</span>
                <span className="font-medium text-slate-800">{patient.assigned_asha_name}</span>
              </div>
              <span className="text-slate-200">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Care Status:</span>
                {isRestored ? (
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Care Restored
                  </span>
                ) : (
                  <span className="font-semibold text-amber-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Action Required
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCallPatient(patient)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>Call Patient</span>
            </button>
            <button
              type="button"
              onClick={() => onRecordIntervention(patient)}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Record Outcome</span>
            </button>
          </div>
        </div>
      </div>

      {/* Continuum Journey Timeline */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Continuity of Care Pathway
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential progression across the 7-stage rural chronic care continuum
          </p>
        </div>

        {/* Timeline Steps Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
          {continuumStages.map((stage, idx) => {
            const status = getStageStatus(stage.key);
            const isCompleted = status === 'completed';
            const isBreakpoint = status === 'breakpoint';

            return (
              <div
                key={stage.key}
                className={`p-3 rounded-lg border text-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : isBreakpoint
                    ? 'bg-amber-50/80 border-amber-300 text-amber-900 ring-2 ring-amber-400/20'
                    : 'bg-slate-50/70 border-slate-200 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-mono font-medium mb-1">
                  0{idx + 1}
                </div>
                <div className="font-semibold text-xs leading-tight">
                  {stage.label}
                </div>
                <div className="mt-1.5">
                  {isCompleted && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  )}
                  {isBreakpoint && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700">
                      <AlertTriangle className="w-3 h-3" /> Breakpoint
                    </span>
                  )}
                  {!isCompleted && !isBreakpoint && (
                    <span className="text-[10px] text-slate-400">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Care Breakpoint Highlight Box */}
      {care_breakpoint && !isRestored && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Identified Care Breakpoint: {care_breakpoint.stage}
              </div>
              <p className="text-xs font-medium text-amber-800">
                Recommended Action: {care_breakpoint.next_required_action}
              </p>
              <p className="text-xs text-amber-700/90 pt-1 leading-relaxed">
                Evidence: {care_breakpoint.evidence}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Care Restored Verification Banner */}
      {isRestored && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                Care Restored Verified
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                The identified continuity gap has been addressed and verified in the clinical health record.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expandable "View Details" Section for In-Depth Data */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Detailed Clinical & Continuity Records
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Access comprehensive records, CCI-7 breakdown, and audit logs
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <span>{showTechnicalDetails ? 'Collapse Details' : 'View Details'}</span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {showTechnicalDetails && (
          <div className="p-5 space-y-4 bg-slate-50/50">
            {/* Detail Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveDetailTab('clinical')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeDetailTab === 'clinical'
                    ? 'bg-white text-teal-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Clinical Profile & Prescriptions
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailTab('cci')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeDetailTab === 'cci'
                    ? 'bg-white text-teal-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Continuity Score (CCI-7: {cci7.total_score}%)
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailTab('kestrel')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeDetailTab === 'kestrel'
                    ? 'bg-white text-teal-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Escalation Stage & Risk Factors
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailTab('history')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeDetailTab === 'history'
                    ? 'bg-white text-teal-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Outreach History ({outreach_history.length})
              </button>
            </div>

            {/* Tab 1: Clinical Data */}
            {activeDetailTab === 'clinical' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Primary Diagnosis:</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {clinical_data?.diagnosis || patient.chronic_conditions}
                    </span>
                  </div>
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Recent Vitals / BP:</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {clinical_data?.vitals || '138/88 mmHg · RBS: 154 mg/dL'}
                    </span>
                  </div>
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Distance to Health Sub-Centre:</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {patient.distance_to_facility_km || 4.2} km
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-800 mb-2">Prescription Regimen:</div>
                  <div className="text-slate-600 leading-relaxed">
                    {clinical_data?.prescription_text || 'Tab Metformin 500mg (1-0-1) + Tab Telmisartan 40mg (1-0-0) after meals. Refill monthly.'}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: CCI-7 Components */}
            {activeDetailTab === 'cci' && (
              <div className="space-y-3 text-xs">
                <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">
                      Continuity of Care Index: <span className="text-teal-700">{cci7.total_score}/100</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">{cci7.explanation}</p>
                  </div>
                  <div className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded text-slate-700">
                    Tier: {cci7.tier}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
                  {cci7.components.map(comp => (
                    <div key={comp.id} className="p-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-slate-800">{comp.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{comp.evidence}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`font-semibold ${comp.status === 'Met' ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {comp.score}/{comp.weight} pts
                        </span>
                        <div className="text-[10px] text-slate-400">{comp.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Escalation & Risk Factors */}
            {activeDetailTab === 'kestrel' && (
              <div className="space-y-3 text-xs">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">
                    Kestrel Protocol Stage: {kestrel.current_stage} — {kestrel.stage_name}
                  </div>
                  <div className="text-slate-600 text-xs">
                    Next Required Protocol Step: {kestrel.recommended_action}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
                  <div className="font-semibold text-slate-800 mb-2">Key Risk Drivers:</div>
                  {ml_prediction.risk_factors.map(rf => (
                    <div key={rf.feature} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-b-0">
                      <span className="text-slate-700">{rf.explanation}</span>
                      <span className={`font-semibold ${rf.impact === 'increases_risk' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {rf.impact === 'increases_risk' ? '+ High Risk Driver' : '- Protective Factor'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Outreach History */}
            {activeDetailTab === 'history' && (
              <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 text-xs">
                {outreach_history.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    No outreach contact logged for this patient yet.
                  </div>
                ) : (
                  outreach_history.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-slate-800">
                          {item.channel || 'Telephonic Call'} — Outcome: <span className="text-teal-700">{item.outcome}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.notes}</div>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono shrink-0">
                        {item.date}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
