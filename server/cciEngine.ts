import { storage } from './storage.ts';
import type { CCI7Result, CCI7Component } from './types.ts';

export function calculateCCI7(patientId: string): CCI7Result {
  const patient = storage.getPatientById(patientId);
  const screenings = storage.getNcdScreenings().filter(s => s.patient_id === patientId);
  const teleconsults = storage.getTeleconsultations().filter(t => t.patient_id === patientId);
  const prescriptions = storage.getPrescriptions().filter(p => p.patient_id === patientId);
  const dispensings = storage.getMedicineDispensing().filter(d => d.patient_id === patientId);
  const labTests = storage.getLabTests().filter(l => l.patient_id === patientId);
  const followups = storage.getFollowupVisits().filter(f => f.patient_id === patientId);
  const outreach = storage.getOutreachActions().filter(o => o.patient_id === patientId);

  const components: CCI7Component[] = [];

  // Component 1: Screening to Teleconsultation Linkage (15%)
  if (screenings.length > 0 && teleconsults.length > 0) {
    const sDate = new Date(screenings[0].screening_date).getTime();
    const tDate = new Date(teleconsults[0].consultation_date).getTime();
    const diffDays = Math.round(Math.abs(tDate - sDate) / (1000 * 60 * 60 * 24));
    if (diffDays <= 14) {
      components.push({
        id: 'c1_screening_teleconsultation',
        name: 'Screening to Physician Teleconsultation',
        weight: 15,
        score: 1.0,
        status: 'Met',
        evidence: `Consultation completed within ${diffDays} days of screening.`
      });
    } else {
      components.push({
        id: 'c1_screening_teleconsultation',
        name: 'Screening to Physician Teleconsultation',
        weight: 15,
        score: 0.6,
        status: 'At Risk',
        evidence: `Delayed teleconsultation completed after ${diffDays} days.`
      });
    }
  } else if (screenings.length > 0 && (screenings[0].hypertension_suspected || screenings[0].diabetes_suspected)) {
    components.push({
      id: 'c1_screening_teleconsultation',
      name: 'Screening to Physician Teleconsultation',
      weight: 15,
      score: 0.0,
      status: 'Incomplete',
      evidence: 'High-risk screening findings recorded without subsequent physician teleconsultation.'
    });
  } else {
    components.push({
      id: 'c1_screening_teleconsultation',
      name: 'Screening to Physician Teleconsultation',
      weight: 15,
      score: 1.0,
      status: 'Met',
      evidence: 'Routine baseline screening documented without pending teleconsult.'
    });
  }

  // Component 2: Teleconsultation to Pharmacotherapy Prescription (15%)
  if (teleconsults.length > 0 && prescriptions.length > 0) {
    components.push({
      id: 'c2_teleconsultation_prescription',
      name: 'Prescription Regimen Issuance',
      weight: 15,
      score: 1.0,
      status: 'Met',
      evidence: `Active prescription issued: ${prescriptions[0].medication_names}.`
    });
  } else if (teleconsults.length > 0 && prescriptions.length === 0) {
    components.push({
      id: 'c2_teleconsultation_prescription',
      name: 'Prescription Regimen Issuance',
      weight: 15,
      score: 0.0,
      status: 'Incomplete',
      evidence: 'Clinical diagnosis made but no pharmacotherapy prescription logged.'
    });
  } else {
    components.push({
      id: 'c2_teleconsultation_prescription',
      name: 'Prescription Regimen Issuance',
      weight: 15,
      score: 0.8,
      status: 'Met',
      evidence: 'Standard non-pharmacological care pathway maintained.'
    });
  }

  // Component 3: Medicine Dispensing & Fulfillment (15%)
  if (dispensings.length > 0) {
    const md = dispensings[0];
    if (md.dispense_status === 'fully_dispensed') {
      components.push({
        id: 'c3_dispensing_fulfillment',
        name: 'Medicine Dispensing & Fulfillment',
        weight: 15,
        score: 1.0,
        status: 'Met',
        evidence: 'Complete prescription dispensed at health facility pharmacy.'
      });
    } else if (md.dispense_status === 'partially_dispensed') {
      components.push({
        id: 'c3_dispensing_fulfillment',
        name: 'Medicine Dispensing & Fulfillment',
        weight: 15,
        score: 0.4,
        status: 'At Risk',
        evidence: `Partial dispensation due to facility stockout: ${md.items_dispensed}.`
      });
    } else {
      components.push({
        id: 'c3_dispensing_fulfillment',
        name: 'Medicine Dispensing & Fulfillment',
        weight: 15,
        score: 0.0,
        status: 'Incomplete',
        evidence: 'Complete stockout reported at primary health centre dispensing counter.'
      });
    }
  } else if (prescriptions.length > 0) {
    components.push({
      id: 'c3_dispensing_fulfillment',
      name: 'Medicine Dispensing & Fulfillment',
      weight: 15,
      score: 0.0,
      status: 'Incomplete',
      evidence: 'Prescription issued but medicine uncollected.'
    });
  } else {
    components.push({
      id: 'c3_dispensing_fulfillment',
      name: 'Medicine Dispensing & Fulfillment',
      weight: 15,
      score: 1.0,
      status: 'Not Applicable',
      evidence: 'No active pharmaceutical prescription requiring dispensing.'
    });
  }

  // Component 4: Baseline Diagnostic Lab Testing (15%)
  if (labTests.length > 0) {
    const completed = labTests.filter(t => t.test_status === 'completed');
    const overdue = labTests.filter(t => t.test_status === 'overdue');
    if (overdue.length > 0) {
      components.push({
        id: 'c4_diagnostic_completion',
        name: 'Diagnostic Lab Test Adherence',
        weight: 15,
        score: 0.0,
        status: 'Incomplete',
        evidence: `Ordered diagnostic tests overdue: ${overdue.map(t => t.test_type).join(', ')}.`
      });
    } else if (completed.length > 0) {
      components.push({
        id: 'c4_diagnostic_completion',
        name: 'Diagnostic Lab Test Adherence',
        weight: 15,
        score: 1.0,
        status: 'Met',
        evidence: `Lab investigation verified: ${completed[0].test_type} (${completed[0].result_value}).`
      });
    } else {
      components.push({
        id: 'c4_diagnostic_completion',
        name: 'Diagnostic Lab Test Adherence',
        weight: 15,
        score: 0.7,
        status: 'At Risk',
        evidence: 'Lab samples collected; pending laboratory turnaround.'
      });
    }
  } else {
    components.push({
      id: 'c4_diagnostic_completion',
      name: 'Diagnostic Lab Test Adherence',
      weight: 15,
      score: 1.0,
      status: 'Not Applicable',
      evidence: 'No auxiliary diagnostic lab tests mandated for current condition protocol.'
    });
  }

  // Component 5: Follow-Up Visit Adherence (20%)
  if (followups.length > 0) {
    const fu = followups[0];
    if (fu.visit_status === 'completed') {
      components.push({
        id: 'c5_followup_adherence',
        name: 'Scheduled Follow-Up Visit Adherence',
        weight: 20,
        score: 1.0,
        status: 'Met',
        evidence: `Attended follow-up appointment on ${fu.actual_date || fu.scheduled_date}.`
      });
    } else if (fu.visit_status === 'missed') {
      components.push({
        id: 'c5_followup_adherence',
        name: 'Scheduled Follow-Up Visit Adherence',
        weight: 20,
        score: 0.0,
        status: 'Incomplete',
        evidence: `Missed scheduled 30-day review date (${fu.scheduled_date}).`
      });
    } else {
      components.push({
        id: 'c5_followup_adherence',
        name: 'Scheduled Follow-Up Visit Adherence',
        weight: 20,
        score: 0.8,
        status: 'Met',
        evidence: `Upcoming appointment scheduled for ${fu.scheduled_date}.`
      });
    }
  } else {
    components.push({
      id: 'c5_followup_adherence',
      name: 'Scheduled Follow-Up Visit Adherence',
      weight: 20,
      score: 0.5,
      status: 'At Risk',
      evidence: 'No regular follow-up appointment scheduled in system.'
    });
  }

  // Component 6: Proactive Outreach Responsiveness (10%)
  if (outreach.length > 0) {
    const answeredCount = outreach.filter(o => o.contact_outcome === 'answered').length;
    const noAnswerCount = outreach.filter(o => o.contact_outcome === 'no_answer' || o.contact_outcome === 'failed').length;
    if (answeredCount > 0) {
      components.push({
        id: 'c6_outreach_responsiveness',
        name: 'Outreach Responsiveness & Engagement',
        weight: 10,
        score: 1.0,
        status: 'Met',
        evidence: 'Patient or designated family caregiver actively responded to health outreach.'
      });
    } else if (noAnswerCount >= 2) {
      components.push({
        id: 'c6_outreach_responsiveness',
        name: 'Outreach Responsiveness & Engagement',
        weight: 10,
        score: 0.0,
        status: 'Incomplete',
        evidence: `${noAnswerCount} consecutive outreach calls unanswered.`
      });
    } else {
      components.push({
        id: 'c6_outreach_responsiveness',
        name: 'Outreach Responsiveness & Engagement',
        weight: 10,
        score: 0.5,
        status: 'At Risk',
        evidence: 'Recent outreach attempt unanswered; follow-up call pending.'
      });
    }
  } else {
    components.push({
      id: 'c6_outreach_responsiveness',
      name: 'Outreach Responsiveness & Engagement',
      weight: 10,
      score: 1.0,
      status: 'Met',
      evidence: 'Patient adhering without requiring proactive telephonic escalation.'
    });
  }

  // Component 7: Health & Wellness Centre Catchment Continuity (10%)
  const hasFacility = !!(patient?.facility_id);
  const hasAsha = !!(patient?.assigned_asha_id);
  if (hasFacility && hasAsha) {
    components.push({
      id: 'c7_hwc_care_coordination',
      name: 'Primary HWC & ASHA Catchment Continuity',
      weight: 10,
      score: 1.0,
      status: 'Met',
      evidence: `Empaneled at ${patient?.facility_id} with assigned ASHA ${patient?.assigned_asha_name}.`
    });
  } else {
    components.push({
      id: 'c7_hwc_care_coordination',
      name: 'Primary HWC & ASHA Catchment Continuity',
      weight: 10,
      score: 0.5,
      status: 'At Risk',
      evidence: 'Incomplete empanelment or missing primary ASHA worker linkage.'
    });
  }

  // Compute weighted sum out of 100
  const totalScore = Math.round(
    components.reduce((sum, c) => sum + c.weight * c.score, 0)
  );

  let tier: 'Optimal' | 'Sub-Optimal' | 'Fragmented' | 'Broken';
  let explanation: string;

  if (totalScore >= 80) {
    tier = 'Optimal';
    explanation = 'Continuity of Care is well-maintained across screening, teleconsultation, medication supply, and scheduled follow-ups.';
  } else if (totalScore >= 60) {
    tier = 'Sub-Optimal';
    explanation = 'Continuity of Care shows minor friction points (such as pending lab turnaround or impending follow-up window).';
  } else if (totalScore >= 40) {
    tier = 'Fragmented';
    explanation = 'Continuity of Care is fragmented due to missed adherence checkpoints or partial medicine dispensation.';
  } else {
    tier = 'Broken';
    explanation = 'Continuity of Care is severely disrupted. Requires immediate ASHA physical outreach or care coordinator intervention.';
  }

  return {
    patient_id: patientId,
    total_score: totalScore,
    tier,
    components,
    explanation
  };
}
