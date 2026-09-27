import { storage } from './storage.ts';
import type { CareBreakpoint } from './types.ts';

export function detectCareBreakpoint(patientId: string): CareBreakpoint | null {
  const patient = storage.getPatientById(patientId);
  const screenings = storage.getNcdScreenings().filter(s => s.patient_id === patientId);
  const teleconsults = storage.getTeleconsultations().filter(t => t.patient_id === patientId);
  const prescriptions = storage.getPrescriptions().filter(p => p.patient_id === patientId);
  const dispensings = storage.getMedicineDispensing().filter(d => d.patient_id === patientId);
  const labTests = storage.getLabTests().filter(l => l.patient_id === patientId);
  const followups = storage.getFollowupVisits().filter(f => f.patient_id === patientId);
  const outreach = storage.getOutreachActions().filter(o => o.patient_id === patientId);
  const outcomes = storage.getEpisodeOutcomes().filter(e => e.patient_id === patientId);

  // If already verified as Care Restored without any open issues
  const restoredOutcome = outcomes.find(o => o.outcome_status === 'care_restored');
  if (restoredOutcome) {
    const hasNewMissedVisit = followups.some(f => f.visit_status === 'missed' && f.actual_date === null);
    if (!hasNewMissedVisit) {
      return null; // Care is actively restored!
    }
  }

  // 1. Check Outreach breakpoint (Failed contacts escalate past phone outreach)
  const failedCalls = outreach.filter(o => o.contact_outcome === 'no_answer' || o.contact_outcome === 'failed');
  if (failedCalls.length >= 2) {
    const lastAttempt = failedCalls[0];
    return {
      stage: 'Outreach',
      evidence: `${failedCalls.length} consecutive phone calls unanswered. Last call attempted on ${lastAttempt.action_date}. Patient unreachable by phone.`,
      date: lastAttempt.action_date,
      next_required_action: 'Escalate to ASHA Physical Home Visit & Community Sachet Delivery.',
      severity: 'Urgent'
    };
  }

  // 2. Check Follow-Up breakpoint
  const missedVisit = followups.find(f => f.visit_status === 'missed' && !f.actual_date);
  if (missedVisit) {
    return {
      stage: 'Follow-up',
      evidence: `Scheduled 30-day NCD adherence review on ${missedVisit.scheduled_date} elapsed without clinic attendance.`,
      date: missedVisit.scheduled_date,
      next_required_action: 'Place Kestrel-7 Step 1 Telephonic Outreach Call to patient or designated family member.',
      severity: 'High'
    };
  }

  // 3. Check Medicine Dispensing breakpoint
  const problematicDispense = dispensings.find(d => d.dispense_status === 'stockout' || d.dispense_status === 'partially_dispensed');
  if (problematicDispense) {
    return {
      stage: 'Medicine',
      evidence: `Dispensing barrier on ${problematicDispense.dispense_date}: ${problematicDispense.items_dispensed} (${problematicDispense.dispense_status}).`,
      date: problematicDispense.dispense_date,
      next_required_action: 'Procure buffer stock from Block PHC / Arrange ASHA doorstep drug delivery.',
      severity: 'High'
    };
  }

  if (prescriptions.length > 0 && dispensings.length === 0) {
    return {
      stage: 'Medicine',
      evidence: `Prescription issued on ${prescriptions[0].prescription_date} (${prescriptions[0].medication_names}) has no dispensing record logged.`,
      date: prescriptions[0].prescription_date,
      next_required_action: 'Verify pharmacy collection or assist patient with transportation/sub-centre refill.',
      severity: 'Moderate'
    };
  }

  // 4. Check Lab Test breakpoint
  const overdueTest = labTests.find(l => l.test_status === 'overdue');
  if (overdueTest) {
    return {
      stage: 'Test',
      evidence: `Diagnostic laboratory test (${overdueTest.test_type}) ordered on ${overdueTest.ordered_date} is overdue.`,
      date: overdueTest.ordered_date,
      next_required_action: 'Mobilize ANM / ASHA for village point-of-care sample collection.',
      severity: 'Moderate'
    };
  }

  // 5. Check Prescription breakpoint
  if (teleconsults.length > 0 && prescriptions.length === 0) {
    return {
      stage: 'Prescription',
      evidence: `Teleconsultation completed on ${teleconsults[0].consultation_date} by ${teleconsults[0].doctor_name} without issued prescription.`,
      date: teleconsults[0].consultation_date,
      next_required_action: 'Medical Officer case review to issue standard NCD treatment regimen.',
      severity: 'Moderate'
    };
  }

  // 6. Check Teleconsultation breakpoint
  if (screenings.length > 0 && (screenings[0].hypertension_suspected || screenings[0].diabetes_suspected) && teleconsults.length === 0) {
    const s = screenings[0];
    return {
      stage: 'Teleconsultation',
      evidence: `Abnormal screening on ${s.screening_date} (BP: ${s.systolic_bp}/${s.diastolic_bp} mmHg, RBS: ${s.random_blood_sugar} mg/dL) with no physician teleconsultation.`,
      date: s.screening_date,
      next_required_action: 'Schedule priority eSanjeevani teleconsultation with Block Medical Officer.',
      severity: 'High'
    };
  }

  // 7. Check Screening breakpoint
  if (screenings.length === 0 && patient) {
    return {
      stage: 'Screening',
      evidence: `Enrolled on ${patient.registration_date} but no baseline NCD screening recorded.`,
      date: patient.registration_date,
      next_required_action: 'Complete Community-Based Assessment Checklist (CBAC) & Blood Pressure / Sugar screening.',
      severity: 'Routine'
    };
  }

  return null;
}
