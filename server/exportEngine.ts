import Papa from 'papaparse';
import { storage } from './storage.ts';
import { runPatientLinkage } from './linkageEngine.ts';
import { mlService } from './mlEngine.ts';
import { getKestrelStatus } from './kestrelEngine.ts';

export function generateLinkageSubmissionCsv(): string {
  const { records } = runPatientLinkage();
  return Papa.unparse(records.map(r => ({
    source_table: r.source_table,
    source_record_id: r.source_record_id,
    source_patient_identifier: r.source_patient_identifier,
    canonical_patient_id: r.canonical_patient_id,
    linkage_status: r.linkage_status,
    confidence: r.confidence,
    provenance: r.provenance
  })));
}

export function generateEpisodePredictionCsv(): string {
  const patients = storage.getPatients();
  const rows = patients.map(p => {
    const pred = mlService.predictPatientRisk(p.patient_id);
    const topFactor = pred.risk_factors.length > 0 ? pred.risk_factors[0].feature : 'baseline_demographics';
    return {
      patient_id: p.patient_id,
      lfu_risk_tier_k7: pred.predicted_tier,
      confidence: pred.confidence,
      top_risk_feature: topFactor,
      chronic_conditions: p.chronic_conditions
    };
  });
  return Papa.unparse(rows);
}

export function generateActionQueueCsv(): string {
  const patients = storage.getPatients();
  const rows = patients.map(p => {
    const status = getKestrelStatus(p.patient_id);
    return {
      patient_id: p.patient_id,
      kestrel_stage: status.current_stage,
      stage_name: status.stage_name,
      priority: status.priority,
      assigned_worker: status.assigned_worker,
      recommended_action: status.recommended_action,
      outreach_attempts: status.outreach_attempts,
      care_restored: status.care_restored ? 'YES' : 'NO'
    };
  });
  return Papa.unparse(rows);
}
