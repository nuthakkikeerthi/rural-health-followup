import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Activity,
  ShieldCheck,
  HeartPulse,
  PhoneCall,
  Clock,
  Layers
} from 'lucide-react';

export const HelpMethodologyView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">
            Operational Knowledge Base
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Clinical Methodology & Operational Protocols
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard operating guidelines for non-communicable disease continuity of care in rural primary healthcare.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: The 7-Stage Continuum */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              1. The 7-Stage Care Continuum
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every enrolled chronic patient (Hypertension & Diabetes) follows a standard 7-step longitudinal pathway to prevent loss to follow-up:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <strong className="text-slate-800">Stage 1: Community Screening</strong> — ASHA administers CBAC (Community Based Assessment Checklist) in village.
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <strong className="text-slate-800">Stage 2: Teleconsultation / CHO Review</strong> — eSanjeevani teleconsultation with Medical Officer.
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <strong className="text-slate-800">Stage 3: Prescription Generation</strong> — Valid clinical prescription generated with dosage and refill schedule.
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <strong className="text-slate-800">Stage 4: Medication Dispensation</strong> — 30-day medicine dispensed from Sub-Centre or delivered via ASHA.
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <strong className="text-slate-800">Stage 5: Diagnostic & Lab Verification</strong> — Blood pressure & blood sugar monitored according to schedule.
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <strong className="text-slate-800">Stage 6: Proactive Follow-Up</strong> — Scheduled check-in before medication depletion.
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <strong className="text-slate-800">Stage 7: Care Restored Verification</strong> — Verification of continuous adherence and blood pressure stability.
            </div>
          </div>
        </div>

        {/* Section 2: Continuity of Care Index (CCI-7) */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              2. Continuity of Care Index (CCI-7)
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Continuity of Care Index is a weighted metric (0–100%) measuring adherence across 7 distinct care dimensions:
          </p>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Screening Adherence</span>
              <strong className="text-slate-800 font-mono">15%</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Physician Teleconsultation Timeliness</span>
              <strong className="text-slate-800 font-mono">15%</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Prescription Active & Current</span>
              <strong className="text-slate-800 font-mono">15%</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Medication Dispensation & Refill Continuity</span>
              <strong className="text-slate-800 font-mono">20%</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Diagnostic Test Completion</span>
              <strong className="text-slate-800 font-mono">10%</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Follow-Up Appointment Attendance</span>
              <strong className="text-slate-800 font-mono">15%</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Outreach Responsiveness</span>
              <strong className="text-slate-800 font-mono">10%</strong>
            </div>
          </div>
          <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-lg text-xs text-teal-900 mt-2">
            <strong>Tier Thresholds:</strong> Optimal (&ge;80%), Sub-Optimal (60–79%), Fragmented (40–59%), Broken (&lt;40%).
          </div>
        </div>

        {/* Section 3: Kestrel-7 Escalation Protocol */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              3. Kestrel-7 Escalation Protocol
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            When a patient misses a scheduled care action, the system executes an automated staged protocol:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-slate-50 rounded border border-slate-100">
              <span className="font-semibold text-slate-800">Stage 1: Automated SMS / IVR Call</span> — 3 days before follow-up due.
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100">
              <span className="font-semibold text-slate-800">Stage 2: Telephonic Outreach by Staff</span> — On due date if unconfirmed.
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100">
              <span className="font-semibold text-slate-800">Stage 3: Escalated ASHA Alert</span> — Triggered after 2 unanswered calls.
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100">
              <span className="font-semibold text-slate-800">Stage 4: In-Person Field Home Visit</span> — Physical verification and vitals check.
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100">
              <span className="font-semibold text-slate-800">Stage 5: Buffer Medication Delivery</span> — Overcomes transportation stockout barrier.
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100">
              <span className="font-semibold text-slate-800">Stage 6: Clinical Re-engagement</span> — Follow-up consultation conducted.
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-100">
              <span className="font-semibold text-slate-800">Stage 7: Care Restored Formal Sign-Off</span> — Verification logged in health record.
            </div>
          </div>
        </div>

        {/* Section 4: Operational Role SOPs */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              4. Operational Staff Roles & Responsibilities
            </h3>
          </div>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <div className="font-bold text-slate-900">ASHA Worker</div>
              <p>Primary frontline presence in village. Conducts field home visits, delivers buffer medications, reports patient status, and resolves field alerts.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <div className="font-bold text-slate-900">CHO / ANM (Ayushman Arogya Mandir)</div>
              <p>Clinical triage at Health & Wellness Centre. Monitors facility follow-up queue, initiates teleconsultations, dispenses 30-day refills, and tracks care gaps.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <div className="font-bold text-slate-900">Medical Officer (Doctor)</div>
              <p>Clinical authority for treatment plans, dose titrations, lab investigations, and formal verification of care restoration.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <div className="font-bold text-slate-900">District Health Admin</div>
              <p>District-level health society command. Oversees facility comparisons, cohort-wide risk metrics, dataset ingestion, and official ABDM compliance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
