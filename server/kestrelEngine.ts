import { storage } from './storage.ts';
import { detectCareBreakpoint } from './careBreakpointEngine.ts';
import type { KestrelStatus, KestrelStageNumber } from './types.ts';

export function getKestrelStatus(patientId: string): KestrelStatus {
  const patient = storage.getPatientById(patientId);
  const breakpoint = detectCareBreakpoint(patientId);
  const outreach = storage.getOutreachActions().filter(o => o.patient_id === patientId);
  const outcomes = storage.getEpisodeOutcomes().filter(e => e.patient_id === patientId);
  const alerts = storage.getAshaAlerts().filter(a => a.patient_id === patientId && a.status === 'OPEN');

  const restoredOutcome = outcomes.find(o => o.outcome_status === 'care_restored');
  if (restoredOutcome && !breakpoint) {
    return {
      patient_id: patientId,
      current_stage: 1,
      stage_name: 'Stage 1: Care Restored & Routine Maintenance',
      priority: 'Routine',
      recommended_action: 'Continue routine monthly NCD monitoring and medication adherence.',
      assigned_worker: patient?.assigned_asha_name || 'Assigned ASHA',
      outreach_attempts: outreach.length,
      next_action: 'Schedule next 30-day routine refill date',
      outcome: `Care Restored (${restoredOutcome.care_breakpoint_resolved})`,
      care_restored: true,
      stopped_reason: 'Care completed and verified.'
    };
  }

  const failedCalls = outreach.filter(o => o.contact_outcome === 'no_answer' || o.contact_outcome === 'failed');
  const answeredOutreach = outreach.filter(o => o.contact_outcome === 'answered');

  let currentStage: KestrelStageNumber = 1;
  let stageName = 'Stage 1: Pre-Due Adherence Prompt';
  let priority: 'Routine' | 'Medium' | 'High' | 'Urgent' = 'Routine';
  let recommendedAction = 'Dispatch pre-due advisory to patient/caregiver phone.';
  let nextAction = 'Verify clinic appointment attendance';
  let stoppedReason: string | undefined;

  // Determine stage based on actual care breakpoint and outreach history
  if (failedCalls.length >= 3) {
    currentStage = 5;
    stageName = 'Stage 5: CHO / ANM Facilitated Intervention';
    priority = 'Urgent';
    recommendedAction = 'Community Health Officer case review; coordinate doorstep delivery with ANM.';
    nextAction = 'CHO facility review & caregiver conference';
  } else if (failedCalls.length === 2 || alerts.length > 0) {
    currentStage = 4;
    stageName = 'Stage 4: ASHA Field Home Outreach & Alert';
    priority = 'Urgent';
    recommendedAction = 'Physical home visit by ASHA Sunita Devi with field BP cuff and buffer medicine supply.';
    nextAction = 'Conduct in-person home visit and record field outcome';
  } else if (failedCalls.length === 1) {
    currentStage = 3;
    stageName = 'Stage 3: Secondary Telephonic Outreach';
    priority = 'High';
    recommendedAction = 'Place second outreach call at alternate time; verify household caregiver contact.';
    nextAction = 'Retry outbound call during evening hours';
  } else if (breakpoint) {
    currentStage = 2;
    stageName = 'Stage 2: Primary Telephonic Outreach';
    priority = breakpoint.severity === 'Urgent' ? 'Urgent' : breakpoint.severity === 'High' ? 'High' : 'Medium';
    recommendedAction = `Call patient regarding care gap: ${breakpoint.stage}. ${breakpoint.next_required_action}`;
    nextAction = 'Initiate outbound call via Call Patient workflow';
  }

  // Check if patient successfully re-engaged
  if (answeredOutreach.length > 0 && !breakpoint) {
    stoppedReason = 'Patient successfully re-engaged; care continuum restored.';
  }

  return {
    patient_id: patientId,
    current_stage: currentStage,
    stage_name: stageName,
    priority,
    recommended_action: recommendedAction,
    assigned_worker: patient?.assigned_asha_name || 'Sunita Devi (ASHA)',
    outreach_attempts: outreach.length,
    next_action: nextAction,
    outcome: breakpoint ? `Action required on ${breakpoint.stage}` : 'Adherent',
    care_restored: false,
    stopped_reason: stoppedReason
  };
}
