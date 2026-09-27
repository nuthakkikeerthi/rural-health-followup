import React from 'react';
import {
  FileText,
  Layers,
  BrainCircuit,
  PhoneCall,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  Terminal,
  Download
} from 'lucide-react';

export const DocumentationView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-teal-400">
          Standard Operating Procedures & In-App Guide
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide mt-1">
          METHODOLOGY, ARCHITECTURE & PROTOCOL DOCUMENTATION
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Official engineering specification for Rural Health Follow-Up Assurance (Ayushman Arogya Mandir Continuum Platform).
        </p>
      </div>

      {/* Core Principle Flow Banner */}
      <div className="bg-teal-950/40 border border-teal-800/80 rounded-xl p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-2">
          Platform Continuum Architecture
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-white">
          <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-teal-300">LINK</span>
          <span>→</span>
          <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-teal-300">UNDERSTAND</span>
          <span>→</span>
          <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-teal-300">PREDICT</span>
          <span>→</span>
          <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-teal-300">FIND CARE BREAKPOINT</span>
          <span>→</span>
          <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-teal-300">ACT</span>
          <span>→</span>
          <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-teal-300">CALL</span>
          <span>→</span>
          <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-rose-300">ESCALATE TO ASHA</span>
          <span>→</span>
          <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-teal-300">TRACK RESPONSE</span>
          <span>→</span>
          <span className="px-2.5 py-1 bg-emerald-950 border border-emerald-600 rounded text-emerald-300">VERIFY CARE RESTORED</span>
        </div>
      </div>

      {/* Section 1: Architecture & Backend */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          1. System Architecture & Ingestion Engine
        </h2>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            The system employs a full-stack Node.js + Express backend coupled with a responsive Tailwind CSS React frontend. Persistent storage is managed via a schema-enforced relational-style data layer (<code className="font-mono text-teal-300">/data/health_db.json</code>) that survives server restarts.
          </p>
          <p>
            <strong>ZIP Archive Ingestion:</strong> The ingestion endpoint (<code className="font-mono text-slate-200">POST /api/dataset/upload</code>) uses JSZip and PapaParse to extract and validate 19 expected competition files:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-[11px]">
            <li>patient_360_reference.csv (Canonical Patient Registry)</li>
            <li>teleconsultations.csv (eSanjeevani / HWC doctor consultations)</li>
            <li>ncd_screening.csv (Community screening records for BP & blood glucose)</li>
            <li>prescriptions.csv (Medical prescriptions issued)</li>
            <li>medicine_dispensing.csv (Sub-centre dispensing records)</li>
            <li>medicine_stock_status.csv (Facility pharmacy buffer levels)</li>
            <li>lab_tests.csv (Diagnostic lab test tracking)</li>
            <li>followup_visits.csv (Scheduled & actual adherence visits)</li>
            <li>visit_history.csv, outreach_actions.csv, episode_outcomes.csv</li>
            <li>facility_reference.csv, geography_reference.csv, data_dictionary.csv, dataset_inventory.csv</li>
            <li>submission_template_linkage.csv, submission_template_episode_prediction.csv, submission_template_action_queue.csv</li>
          </ul>
        </div>
      </div>

      {/* Section 2: Data Linkage */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          2. Patient Linkage Engine & Methodology
        </h2>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            Source records are linked using <code className="font-mono text-teal-300">patient_360_reference.csv</code> as the canonical entity ground truth. In strict adherence to competition specifications, <strong>patients are never linked by name alone</strong>.
          </p>
          <p>
            Linkage preserves the canonical patient ID, source patient ID, source system, confidence score, and provenance. Records sharing telephone numbers without individual identifiers are classified as <strong className="text-amber-300">AMBIGUOUS</strong> rather than falsely merged.
          </p>
        </div>
      </div>

      {/* Section 3: CCI-7 Continuity-of-Care Index */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-teal-400" />
          3. Continuity-of-Care Index (CCI-7) Formula
        </h2>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            The Continuity-of-Care Index (CCI-7) is a 100-point transparent metric comprising seven clinical care checkpoints:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-slate-300">
            <li><strong>Screening to Teleconsultation Linkage (15%):</strong> Was physician consultation booked within 14 days of abnormal screening?</li>
            <li><strong>Prescription Regimen Issuance (15%):</strong> Did teleconsultation generate active pharmacotherapy prescription?</li>
            <li><strong>Medicine Dispensing & Fulfillment (15%):</strong> Were prescribed medications fully dispensed without stockout?</li>
            <li><strong>Diagnostic Lab Test Adherence (15%):</strong> Were baseline tests (HbA1c/Creatinine) completed without overdue delay?</li>
            <li><strong>Scheduled Follow-Up Visit Adherence (20%):</strong> Did patient attend 30-day review?</li>
            <li><strong>Outreach Responsiveness & Engagement (10%):</strong> Did patient respond to outreach contacts?</li>
            <li><strong>Primary HWC & ASHA Catchment Continuity (10%):</strong> Was care delivered within assigned rural catchment?</li>
          </ol>
        </div>
      </div>

      {/* Section 4: Machine Learning & Temporal Leakage Prevention */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-teal-400" />
          4. Machine Learning Target: lfu_risk_tier_k7
        </h2>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            Target variable: <code className="font-mono text-teal-300">lfu_risk_tier_k7</code> (Low, Medium, High, Critical).
          </p>
          <p>
            <strong>Strict Temporal Leakage Safeguard:</strong> The classifier trains solely on baseline features known at the time of prediction (Age, Sex, Baseline BP, RBS, Multi-morbidity status, Distance km, ASHA empanelment). It never utilizes post-prediction follow-up outcomes, future phone calls, or episode resolutions.
          </p>
          <p>
            All displayed metrics (Accuracy, Macro Precision, Recall, F1, Multiclass ROC-AUC, and Confusion Matrix) are computed live on evaluation data. No metrics are fabricated.
          </p>
        </div>
      </div>

      {/* Section 5: Kestrel-7 Escalation Ladder */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-teal-400" />
          5. Kestrel-7 Ladder & ASHA Alert Escalation Protocol
        </h2>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            The 7-stage Kestrel ladder guides care teams through standardized steps:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-300 text-[11px]">
            <li><strong>Stage 1 (T-0):</strong> Automated pre-due appointment prompt</li>
            <li><strong>Stage 2 (T+1):</strong> Primary telephonic contact by ASHA Sunita Devi</li>
            <li><strong>Stage 3 (T+3):</strong> Secondary telephonic outreach at alternate time</li>
            <li><strong>Stage 4 (T+5):</strong> 🔴 ASHA Field Home Outreach & Alert (Triggered after 2 unanswered calls)</li>
            <li><strong>Stage 5 (T+7):</strong> Community Health Officer (CHO) facilitated intervention & buffer supply</li>
            <li><strong>Stage 6 (T+14):</strong> Medical Officer clinical outreach & consultation</li>
            <li><strong>Stage 7 (T+21):</strong> Gram Panchayat Village Health Committee (VHSNC) administrative protocol endpoint</li>
          </ul>
        </div>
      </div>

      {/* Section 6: Care Restored Verification Rule */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          6. Care Restored Verification Rules
        </h2>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            In strict compliance with evaluation rules, <strong>Care Restored is NEVER marked merely because a call was placed, an SMS was sent, or an IVR prompt was delivered</strong>.
          </p>
          <p>
            Care restored is only verified upon real evidence of the clinical care requirement being met (e.g. In-person follow-up clinic visit attended, buffer medicine supply delivered to doorstep, or diagnostic blood sample collected). Upon verification, the episode updates to <strong className="text-emerald-400">🟢 CARE RESTORED</strong> and updates the patient journey, CCI-7, and analytics.
          </p>
        </div>
      </div>

      {/* Section 7: Demo Accounts & Roles */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-teal-400" />
          7. Role-Based Portals & Safe Demo Credentials
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-3 bg-slate-850 rounded-lg border border-slate-800">
            <div className="font-bold text-teal-300">ASHA WORKER</div>
            <div className="text-slate-300">Sunita Devi · <span className="font-mono">asha@ruralhealth.gov.in</span></div>
            <div className="text-[11px] text-slate-400 mt-1">
              Assigned village catchment, high-priority queue, call simulation, field visit logging, alerts.
            </div>
          </div>
          <div className="p-3 bg-slate-850 rounded-lg border border-slate-800">
            <div className="font-bold text-teal-300">CHO / ANM</div>
            <div className="text-slate-300">Priya Sharma (CHO) · <span className="font-mono">cho@ruralhealth.gov.in</span></div>
            <div className="text-[11px] text-slate-400 mt-1">
              Facility patients, CCI-7 distribution, care gaps, ASHA activity supervision.
            </div>
          </div>
          <div className="p-3 bg-slate-850 rounded-lg border border-slate-800">
            <div className="font-bold text-teal-300">DOCTOR (MEDICAL OFFICER)</div>
            <div className="text-slate-300">Dr. Rajesh Varma · <span className="font-mono">doctor@ruralhealth.gov.in</span></div>
            <div className="text-[11px] text-slate-400 mt-1">
              Clinical journey, consultations, prescriptions, lab reports, high-risk review.
            </div>
          </div>
          <div className="p-3 bg-slate-850 rounded-lg border border-slate-800">
            <div className="font-bold text-teal-300">DISTRICT ADMIN</div>
            <div className="text-slate-300">Dr. Arvind Saxena · <span className="font-mono">admin@ruralhealth.gov.in</span></div>
            <div className="text-[11px] text-slate-400 mt-1">
              Aggregate analytics, facility comparisons, LTFU trends, submission exports.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
