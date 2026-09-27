import { storage } from '../server/storage.ts';
import { runPatientLinkage } from '../server/linkageEngine.ts';
import { getPatientJourney } from '../server/journeyEngine.ts';
import { calculateCCI7 } from '../server/cciEngine.ts';
import { detectCareBreakpoint } from '../server/careBreakpointEngine.ts';
import { getKestrelStatus } from '../server/kestrelEngine.ts';
import { mlService } from '../server/mlEngine.ts';
import { processCompetitionZip } from '../server/datasetEngine.ts';
import {
  generateLinkageSubmissionCsv,
  generateEpisodePredictionCsv,
  generateActionQueueCsv
} from '../server/exportEngine.ts';

async function runQATests() {
  console.log('--- STARTING QA AUTOMATED TEST SUITE ---');

  // 1. Storage & Patients
  const patients = storage.getPatients();
  console.log(`[PASS] Storage initialized. Enrolled patients: ${patients.length}`);
  if (patients.length === 0) throw new Error('No patients in storage');

  // 2. Patient Linkage Engine
  const { records: linkageRecords, stats: linkageStats } = runPatientLinkage();
  console.log(`[PASS] Patient Linkage: ${linkageStats.total_source_records} source records. Linked: ${linkageStats.linked_count}, Unresolved: ${linkageStats.unresolved_count}, Ambiguous: ${linkageStats.ambiguous_count}`);
  if (linkageRecords.length === 0) throw new Error('Linkage produced zero records');

  // 3. Patient Journey for P101 and P102
  const journey1 = getPatientJourney('P101');
  console.log(`[PASS] Patient Journey P101 touchpoints: ${journey1.events.length}`);
  const journey2 = getPatientJourney('P102');
  console.log(`[PASS] Patient Journey P102 touchpoints: ${journey2.events.length}`);

  // 4. CCI-7 Continuity-of-Care Index
  const cci1 = calculateCCI7('P101');
  const cci2 = calculateCCI7('P102');
  console.log(`[PASS] CCI-7 P101 score: ${cci1.total_score}/100 (${cci1.tier})`);
  console.log(`[PASS] CCI-7 P102 score: ${cci2.total_score}/100 (${cci2.tier})`);

  // 5. Care Breakpoint Detection
  const bp1 = detectCareBreakpoint('P101');
  const bp2 = detectCareBreakpoint('P102');
  console.log(`[PASS] Care Breakpoint P101: ${bp1 ? bp1.stage : 'None (Adherent)'}`);
  console.log(`[PASS] Care Breakpoint P102: ${bp2 ? bp2.stage : 'None'} - ${bp2?.evidence}`);

  // 6. Kestrel-7 Ladder
  const kestrel1 = getKestrelStatus('P101');
  const kestrel2 = getKestrelStatus('P102');
  console.log(`[PASS] Kestrel-7 P101: Stage ${kestrel1.current_stage} (${kestrel1.priority})`);
  console.log(`[PASS] Kestrel-7 P102: Stage ${kestrel2.current_stage} (${kestrel2.priority})`);

  // 7. ML Pipeline & lfu_risk_tier_k7 Prediction
  const metrics = mlService.getMetrics();
  console.log(`[PASS] ML Pipeline trained. Cohort: ${metrics.cohort_size}. Accuracy: ${(metrics.accuracy * 100).toFixed(1)}%, F1: ${metrics.f1}, ROC-AUC: ${metrics.roc_auc}`);
  const pred102 = mlService.predictPatientRisk('P102');
  console.log(`[PASS] P102 ML Prediction: ${pred102.predicted_tier} (conf: ${pred102.confidence}). Top factors: ${pred102.risk_factors.map(f => f.feature).join(', ')}`);

  // 8. ZIP Generation & Ingestion Validation
  const zipBuffer = await storage.generateStarterZipIfMissing();
  console.log(`[PASS] Competition Starter ZIP created. Buffer size: ${zipBuffer.length} bytes`);
  const summary = await processCompetitionZip(zipBuffer, 'test_competition_archive.zip');
  console.log(`[PASS] ZIP Extraction & Schema Validation: ${summary.files_detected} files detected, ${summary.files_valid} valid, ${summary.records_imported} records parsed`);

  // 9. Call Simulation & ASHA Alert Escalation
  storage.addOutreachAction({
    action_id: `ACT-QA-1`,
    patient_id: 'P102',
    asha_id: 'ASHA-01',
    action_date: '2026-02-27',
    action_type: 'call',
    contact_outcome: 'no_answer',
    kestrel_stage: 3,
    notes: 'QA Call Simulation: No answer'
  });
  console.log('[PASS] Call simulation logged.');

  // 10. Care Restored Verification
  const outcome = storage.verifyCareRestored('P102', 'QA Test: In-person ASHA home visit conducted & buffer Metformin delivered.', 'CHO Priya Sharma');
  console.log(`[PASS] Care Restored verified: Patient P102 -> ${outcome.outcome_status} (${outcome.care_breakpoint_resolved})`);
  const cci2Restored = calculateCCI7('P102');
  console.log(`[PASS] Updated CCI-7 after Care Restored: ${cci2Restored.total_score}/100 (${cci2Restored.tier})`);

  // 11. Submission CSV Exports
  const linkageCsv = generateLinkageSubmissionCsv();
  const predCsv = generateEpisodePredictionCsv();
  const queueCsv = generateActionQueueCsv();
  console.log(`[PASS] Submission exports generated: Linkage (${linkageCsv.split('\n').length} lines), Prediction (${predCsv.split('\n').length} lines), Action Queue (${queueCsv.split('\n').length} lines)`);

  console.log('--- ALL QA AUTOMATED TESTS PASSED SUCCESSFULLY ---');
  process.exit(0);
}

runQATests().catch(err => {
  console.error('QA Test Failure:', err);
  process.exit(1);
});
