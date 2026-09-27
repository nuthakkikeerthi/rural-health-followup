import React from 'react';
import { Download, FileCheck, Layers, BrainCircuit, ListOrdered, CheckCircle2 } from 'lucide-react';

export const SubmissionExportsView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-teal-400">
          Official Competition Deliverables
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide mt-1">
          SUBMISSION TEMPLATE EXPORTS
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Download formatted submission files generated directly from the live linkage engine, the trained ML LTFU risk classifier, and the Kestrel-7 escalation action queue.
        </p>
      </div>

      {/* 3 Main Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Template 1: Linkage */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                submission_template_linkage.csv
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Contains entity resolution mappings from all fragmented source records to canonical patient IDs, including confidence scores and provenance.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-850 p-2.5 rounded border border-slate-800">
              Columns: source_table, source_record_id, source_patient_identifier, canonical_patient_id, linkage_status, confidence, provenance
            </div>
          </div>

          <a
            href="/api/export/linkage"
            download="submission_template_linkage.csv"
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold text-center inline-flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Linkage CSV</span>
          </a>
        </div>

        {/* Template 2: Episode Prediction */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                submission_template_episode_prediction.csv
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Contains patient-level predictions for target <code className="font-mono text-teal-300">lfu_risk_tier_k7</code>, model confidence, and top explainable risk factor.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-850 p-2.5 rounded border border-slate-800">
              Columns: patient_id, lfu_risk_tier_k7, confidence, top_risk_feature, chronic_conditions
            </div>
          </div>

          <a
            href="/api/export/prediction"
            download="submission_template_episode_prediction.csv"
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold text-center inline-flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Prediction CSV</span>
          </a>
        </div>

        {/* Template 3: Action Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                submission_template_action_queue.csv
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Contains the operational Kestrel-7 follow-up escalation queue, assigned frontline workers, prioritized actions, and care-restored status.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-850 p-2.5 rounded border border-slate-800">
              Columns: patient_id, kestrel_stage, stage_name, priority, assigned_worker, recommended_action, outreach_attempts, care_restored
            </div>
          </div>

          <a
            href="/api/export/action-queue"
            download="submission_template_action_queue.csv"
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold text-center inline-flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Action Queue CSV</span>
          </a>
        </div>
      </div>

      {/* Verification Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <h4 className="font-bold text-white uppercase tracking-wide">
            Automated Generation from Live Application Engine
          </h4>
          <p className="text-slate-400 leading-relaxed">
            All three submission CSVs are generated on-the-fly using the active dataset loaded in the application data layer. Re-importing a new competition ZIP file will dynamically update the exported records across linkage, predictions, and action queues.
          </p>
        </div>
      </div>
    </div>
  );
};
