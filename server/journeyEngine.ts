import { storage } from './storage.ts';
import type { PatientJourney, JourneyEvent } from './types.ts';

export function getPatientJourney(patientId: string): PatientJourney {
  const screenings = storage.getNcdScreenings().filter(s => s.patient_id === patientId);
  const teleconsults = storage.getTeleconsultations().filter(t => t.patient_id === patientId);
  const prescriptions = storage.getPrescriptions().filter(p => p.patient_id === patientId);
  const dispensings = storage.getMedicineDispensing().filter(d => d.patient_id === patientId);
  const labTests = storage.getLabTests().filter(l => l.patient_id === patientId);
  const followups = storage.getFollowupVisits().filter(f => f.patient_id === patientId);
  const outreach = storage.getOutreachActions().filter(o => o.patient_id === patientId);
  const outcomes = storage.getEpisodeOutcomes().filter(e => e.patient_id === patientId);

  const events: JourneyEvent[] = [];

  // 1. NCD Screening
  if (screenings.length > 0) {
    const s = screenings[0];
    events.push({
      stage: 'Screening',
      status: 'completed',
      title: 'NCD Community Screening',
      date: s.screening_date,
      details: `BP: ${s.systolic_bp}/${s.diastolic_bp} mmHg, RBS: ${s.random_blood_sugar} mg/dL, BMI: ${s.bmi}. ${s.hypertension_suspected ? 'Hypertension suspected. ' : ''}${s.diabetes_suspected ? 'Diabetes suspected. ' : ''}Location: ${s.screening_location}`,
      metadata: s
    });
  } else {
    events.push({
      stage: 'Screening',
      status: 'not_recorded',
      title: 'NCD Screening',
      details: 'No screening record logged in dataset.'
    });
  }

  // 2. Teleconsultation
  if (teleconsults.length > 0) {
    const tc = teleconsults[0];
    events.push({
      stage: 'Teleconsultation',
      status: 'completed',
      title: 'Physician Teleconsultation',
      date: tc.consultation_date,
      details: `${tc.doctor_name} diagnosed: ${tc.diagnosis}. Clinical note: ${tc.doctor_notes}`,
      metadata: tc
    });
  } else if (screenings.length > 0 && (screenings[0].hypertension_suspected || screenings[0].diabetes_suspected)) {
    events.push({
      stage: 'Teleconsultation',
      status: 'pending',
      title: 'Physician Teleconsultation',
      details: 'Awaiting scheduled eSanjeevani / HWC teleconsultation following abnormal screening.'
    });
  } else {
    events.push({
      stage: 'Teleconsultation',
      status: 'not_recorded',
      title: 'Physician Teleconsultation',
      details: 'No teleconsultation recorded in source data.'
    });
  }

  // 3. Prescription
  if (prescriptions.length > 0) {
    const rx = prescriptions[0];
    events.push({
      stage: 'Prescription',
      status: 'completed',
      title: 'Medical Prescription',
      date: rx.prescription_date,
      details: `Prescribed: ${rx.medication_names} (${rx.dosage_schedule}) for ${rx.days_supply} days.`,
      metadata: rx
    });
  } else if (teleconsults.length > 0) {
    events.push({
      stage: 'Prescription',
      status: 'pending',
      title: 'Medical Prescription',
      details: 'Teleconsultation completed but prescription regimen not yet recorded.'
    });
  } else {
    events.push({
      stage: 'Prescription',
      status: 'not_recorded',
      title: 'Medical Prescription',
      details: 'No prescription records logged.'
    });
  }

  // 4. Medicine Dispensing
  if (dispensings.length > 0) {
    const md = dispensings[0];
    if (md.dispense_status === 'fully_dispensed') {
      events.push({
        stage: 'Medicine',
        status: 'completed',
        title: 'Medicine Dispensing',
        date: md.dispense_date,
        details: `Dispensed: ${md.items_dispensed} at primary health facility.`,
        metadata: md
      });
    } else {
      events.push({
        stage: 'Medicine',
        status: 'pending',
        title: 'Medicine Dispensing',
        date: md.dispense_date,
        details: `Dispensation incomplete (${md.dispense_status}): ${md.items_dispensed}`,
        metadata: md
      });
    }
  } else if (prescriptions.length > 0) {
    events.push({
      stage: 'Medicine',
      status: 'pending',
      title: 'Medicine Dispensing',
      details: 'Medications prescribed but uncollected or stockout at pharmacy counter.'
    });
  } else {
    events.push({
      stage: 'Medicine',
      status: 'not_recorded',
      title: 'Medicine Dispensing',
      details: 'No dispensing events recorded.'
    });
  }

  // 5. Lab/Test
  if (labTests.length > 0) {
    const completedTest = labTests.find(t => t.test_status === 'completed');
    const overdueTest = labTests.find(t => t.test_status === 'overdue');
    const pendingTest = labTests.find(t => t.test_status === 'ordered' || t.test_status === 'sample_collected');

    if (completedTest) {
      events.push({
        stage: 'Test',
        status: 'completed',
        title: `Diagnostic Lab: ${completedTest.test_type}`,
        date: completedTest.result_date || completedTest.sample_collected_date || completedTest.ordered_date,
        details: `Result: ${completedTest.result_value || 'Completed'} (Sample collected: ${completedTest.sample_collected_date || 'N/A'})`,
        metadata: completedTest
      });
    } else if (overdueTest) {
      events.push({
        stage: 'Test',
        status: 'pending',
        title: `Diagnostic Lab: ${overdueTest.test_type}`,
        date: overdueTest.ordered_date,
        details: `Ordered on ${overdueTest.ordered_date} - Overdue for field collection or processing.`,
        metadata: overdueTest
      });
    } else if (pendingTest) {
      events.push({
        stage: 'Test',
        status: 'pending',
        title: `Diagnostic Lab: ${pendingTest.test_type}`,
        date: pendingTest.ordered_date,
        details: `Test ${pendingTest.test_status} on ${pendingTest.ordered_date}. Awaiting lab report.`,
        metadata: pendingTest
      });
    }
  } else {
    events.push({
      stage: 'Test',
      status: 'not_applicable',
      title: 'Diagnostic Lab',
      details: 'No baseline lab investigations ordered for this episode.'
    });
  }

  // 6. Follow-up
  if (followups.length > 0) {
    const fu = followups[0];
    if (fu.visit_status === 'completed') {
      events.push({
        stage: 'FollowUp',
        status: 'completed',
        title: 'Adherence Follow-up Visit',
        date: fu.actual_date || fu.scheduled_date,
        details: `Follow-up visit completed on ${fu.actual_date || fu.scheduled_date} at facility.`,
        metadata: fu
      });
    } else {
      events.push({
        stage: 'FollowUp',
        status: 'pending',
        title: 'Adherence Follow-up Visit',
        date: fu.scheduled_date,
        details: `Follow-up ${fu.visit_status}: Scheduled for ${fu.scheduled_date} (${fu.visit_type}).`,
        metadata: fu
      });
    }
  } else {
    events.push({
      stage: 'FollowUp',
      status: 'not_recorded',
      title: 'Adherence Follow-up Visit',
      details: 'No scheduled follow-up visits recorded.'
    });
  }

  // 7. Outreach
  if (outreach.length > 0) {
    const latest = outreach[0];
    events.push({
      stage: 'Outreach',
      status: latest.contact_outcome === 'answered' ? 'completed' : 'pending',
      title: `Outreach Action (Stage ${latest.kestrel_stage})`,
      date: latest.action_date,
      details: `${latest.action_type.toUpperCase()} conducted: ${latest.contact_outcome.toUpperCase()}. Note: ${latest.notes} (Total logs: ${outreach.length})`,
      metadata: latest
    });
  } else {
    events.push({
      stage: 'Outreach',
      status: 'not_recorded',
      title: 'Outreach Action',
      details: 'No proactive outreach attempts recorded.'
    });
  }

  // 8. Outcome
  if (outcomes.length > 0) {
    const out = outcomes[0];
    events.push({
      stage: 'Outcome',
      status: out.outcome_status === 'care_restored' ? 'completed' : 'pending',
      title: out.outcome_status === 'care_restored' ? 'Care Restored Verified' : `Episode Outcome: ${out.outcome_status}`,
      date: out.outcome_date,
      details: `${out.outcome_status === 'care_restored' ? '🟢 CARE RESTORED: ' : ''}${out.care_breakpoint_resolved} (Verified by: ${out.verified_by})`,
      metadata: out
    });
  } else {
    events.push({
      stage: 'Outcome',
      status: 'pending',
      title: 'Episode Resolution',
      details: 'Active episode ongoing under continuum monitoring.'
    });
  }

  return {
    patient_id: patientId,
    events
  };
}
