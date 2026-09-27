import { Router } from 'express';
import multer from 'multer';
import { storage } from './storage.ts';
import { authMiddleware, requireRole, type AuthenticatedRequest } from './auth.ts';
import { DEMO_USERS } from './sampleDataset.ts';
import { processCompetitionZip } from './datasetEngine.ts';
import { runPatientLinkage } from './linkageEngine.ts';
import { getPatientJourney } from './journeyEngine.ts';
import { calculateCCI7 } from './cciEngine.ts';
import { detectCareBreakpoint } from './careBreakpointEngine.ts';
import { getKestrelStatus } from './kestrelEngine.ts';
import { mlService } from './mlEngine.ts';
import {
  generateLinkageSubmissionCsv,
  generateEpisodePredictionCsv,
  generateActionQueueCsv
} from './exportEngine.ts';
import type { OutreachAction } from './types.ts';

const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

export const apiRouter = Router();

// Apply auth middleware to all API routes
apiRouter.use(authMiddleware);

// --- Auth Routes ---
apiRouter.get('/auth/me', (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

apiRouter.get('/auth/demo-users', (_req, res) => {
  res.json({ users: DEMO_USERS });
});

apiRouter.post('/auth/login', (req: AuthenticatedRequest, res) => {
  const { email, role } = req.body;
  const user = DEMO_USERS.find(u => u.email === email || u.role === role);
  if (!user) {
    return res.status(404).json({ error: 'User credential not recognized in demo registry.' });
  }
  res.json({ user });
});

// --- Dataset Ingestion Routes ---
apiRouter.get('/dataset/summary', (_req, res) => {
  const patients = storage.getPatients();
  const tele = storage.getTeleconsultations();
  const screenings = storage.getNcdScreenings();
  const prescriptions = storage.getPrescriptions();
  const disp = storage.getMedicineDispensing();
  const labs = storage.getLabTests();
  const followups = storage.getFollowupVisits();
  const outreach = storage.getOutreachActions();
  const outcomes = storage.getEpisodeOutcomes();
  const inventory = storage.getDatasetInventory();
  const history = storage.getImportHistory();

  res.json({
    table_counts: {
      patient_360_reference: patients.length,
      teleconsultations: tele.length,
      ncd_screening: screenings.length,
      prescriptions: prescriptions.length,
      medicine_dispensing: disp.length,
      lab_tests: labs.length,
      followup_visits: followups.length,
      outreach_actions: outreach.length,
      episode_outcomes: outcomes.length,
      dataset_inventory: inventory.length
    },
    latest_import: history[0] || null,
    total_records: patients.length + tele.length + screenings.length + prescriptions.length + disp.length + labs.length + followups.length + outreach.length + outcomes.length
  });
});

apiRouter.post('/dataset/upload', upload.single('zipFile'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No ZIP file received in upload payload.' });
    }

    const originalName = req.file.originalname || 'competition_dataset.zip';
    const summary = await processCompetitionZip(req.file.buffer, originalName);

    res.json({
      success: true,
      message: `Successfully processed competition dataset archive: ${originalName}`,
      summary
    });
  } catch (err: any) {
    console.error('Error processing uploaded ZIP archive:', err);
    res.status(500).json({
      error: `Failed to extract or validate dataset ZIP: ${err.message || 'Unknown error'}`
    });
  }
});

apiRouter.post('/dataset/load-sample', async (_req, res) => {
  try {
    const buffer = await storage.generateStarterZipIfMissing();
    const summary = await processCompetitionZip(buffer, 'competition_rural_health_dataset.zip');
    res.json({
      success: true,
      message: 'Loaded sample competition dataset successfully.',
      summary
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/dataset/download-starter-zip', async (_req, res) => {
  try {
    const buffer = await storage.generateStarterZipIfMissing();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="competition_rural_health_dataset.zip"');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Patient Queue & Details ---
apiRouter.get('/patients', (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  let allPatients = storage.getPatients();

  // Role-based filtering
  if (user.role === 'ASHA') {
    // Filter to patients assigned to this ASHA
    const ashaPatients = allPatients.filter(p => p.assigned_asha_id === user.id || p.assigned_asha_name === user.name);
    allPatients = ashaPatients.length > 0 ? ashaPatients : allPatients;
  } else if (user.role === 'CHO') {
    // Filter to facility patients
    const choPatients = allPatients.filter(p => p.facility_id === user.facilityId || p.block === user.block);
    allPatients = choPatients.length > 0 ? choPatients : allPatients;
  }

  const openAlerts = storage.getAshaAlerts().filter(a => a.status === 'OPEN');
  const alertPatientIds = new Set(openAlerts.map(a => a.patient_id));

  // Augment patient objects with real-time computed states
  const enriched = allPatients.map(p => {
    const breakpoint = detectCareBreakpoint(p.patient_id);
    const cci = calculateCCI7(p.patient_id);
    const kestrel = getKestrelStatus(p.patient_id);
    const pred = mlService.predictPatientRisk(p.patient_id);

    return {
      ...p,
      lfu_risk_tier_k7: pred.predicted_tier || p.lfu_risk_tier_k7,
      risk_confidence: pred.confidence,
      care_breakpoint: breakpoint,
      cci_score: cci.total_score,
      cci_tier: cci.tier,
      kestrel_stage: kestrel.current_stage,
      kestrel_priority: kestrel.priority,
      kestrel_next_action: kestrel.next_action,
      has_open_alert: alertPatientIds.has(p.patient_id),
      care_restored: kestrel.care_restored
    };
  });

  res.json({ patients: enriched });
});

apiRouter.get('/patients/:id', (req: AuthenticatedRequest, res) => {
  const patientId = req.params.id;
  const patient = storage.getPatientById(patientId);

  if (!patient) {
    return res.status(404).json({ error: `Patient with ID ${patientId} not found.` });
  }

  const journey = getPatientJourney(patientId);
  const cci = calculateCCI7(patientId);
  const breakpoint = detectCareBreakpoint(patientId);
  const kestrel = getKestrelStatus(patientId);
  const pred = mlService.predictPatientRisk(patientId);
  const outreachHistory = storage.getOutreachActions().filter(o => o.patient_id === patientId);
  const alerts = storage.getAshaAlerts().filter(a => a.patient_id === patientId);
  const followups = storage.getFollowupVisits().filter(f => f.patient_id === patientId);
  const prescriptions = storage.getPrescriptions().filter(p => p.patient_id === patientId);
  const dispensing = storage.getMedicineDispensing().filter(d => d.patient_id === patientId);
  const labTests = storage.getLabTests().filter(l => l.patient_id === patientId);

  // Privacy rule: District admin sees aggregate/sanitized clinical notes
  if (req.user?.role === 'DISTRICT_ADMIN') {
    journey.events.forEach(e => {
      if (e.stage === 'Teleconsultation' && e.metadata?.doctor_notes) {
        e.metadata.doctor_notes = '[RESTRICTED CLINICAL RECORD - ABDM PRIVACY PROTOCOL]';
      }
    });
  }

  res.json({
    patient,
    journey,
    cci7: cci,
    care_breakpoint: breakpoint,
    kestrel,
    ml_prediction: pred,
    outreach_history: outreachHistory,
    alerts,
    clinical_data: {
      followups,
      prescriptions,
      dispensing,
      labTests
    }
  });
});

// --- Call Patient Simulation ---
apiRouter.post('/patients/:id/call', (req: AuthenticatedRequest, res) => {
  const patientId = req.params.id;
  const patient = storage.getPatientById(patientId);

  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const { outcome, notes } = req.body;
  const validOutcomes = ['answered', 'no_answer', 'unavailable', 'declined', 'failed'];
  if (!validOutcomes.includes(outcome)) {
    return res.status(400).json({ error: `Invalid outcome. Must be one of: ${validOutcomes.join(', ')}` });
  }

  const kestrel = getKestrelStatus(patientId);
  const actionDate = new Date().toISOString().split('T')[0];

  const action: OutreachAction = {
    action_id: `ACT-${Date.now()}`,
    patient_id: patientId,
    asha_id: req.user?.id || 'ASHA-01',
    action_date: actionDate,
    action_type: 'call',
    contact_outcome: outcome as any,
    kestrel_stage: kestrel.current_stage,
    notes: notes || `Call simulation logged: ${outcome.toUpperCase()}`
  };

  storage.addOutreachAction(action);

  // Check if consecutive no_answer / failed calls requires triggering ASHA alert
  const patientOutreach = storage.getOutreachActions().filter(o => o.patient_id === patientId);
  const failedCalls = patientOutreach.filter(o => o.contact_outcome === 'no_answer' || o.contact_outcome === 'failed');

  let alertCreated = false;
  if (failedCalls.length >= 2) {
    const breakpoint = detectCareBreakpoint(patientId);
    storage.addAshaAlert({
      id: `ALERT-${Date.now()}`,
      patient_id: patientId,
      patient_name: patient.name,
      risk_tier: patient.lfu_risk_tier_k7,
      care_breakpoint: breakpoint?.stage || 'Outreach Unreachable',
      attempts: failedCalls.length,
      last_attempt_date: actionDate,
      reason: `Patient could not be reached after ${failedCalls.length} calls (${outcome}).`,
      recommended_action: 'Community/home follow-up with diagnostic BP kit and medicine verification.',
      status: 'OPEN',
      created_at: new Date().toISOString()
    });
    alertCreated = true;
  }

  res.json({
    success: true,
    action,
    alert_created: alertCreated,
    message: alertCreated ? '🔴 Patient reached outreach threshold: ASHA Alert generated!' : 'Outreach contact logged successfully.'
  });
});

// --- ASHA Alerts ---
apiRouter.get('/alerts', (_req, res) => {
  const alerts = storage.getAshaAlerts();
  res.json({ alerts });
});

apiRouter.post('/alerts/:id/resolve', (req: AuthenticatedRequest, res) => {
  const { notes } = req.body;
  const success = storage.resolveAshaAlert(req.params.id, notes || 'Resolved via community action.');
  if (!success) {
    return res.status(404).json({ error: 'Alert not found.' });
  }
  res.json({ success: true, message: 'ASHA Alert resolved.' });
});

// --- Care Restored Verification ---
apiRouter.post('/interventions/restore-care', (req: AuthenticatedRequest, res) => {
  const { patient_id, resolution_reason, verified_by } = req.body;

  if (!patient_id || !resolution_reason) {
    return res.status(400).json({ error: 'Missing required parameters: patient_id and resolution_reason' });
  }

  const verifier = verified_by || req.user?.name || 'Authorized Health Official';
  const outcome = storage.verifyCareRestored(patient_id, resolution_reason, verifier);

  res.json({
    success: true,
    message: '🟢 CARE RESTORED verified and recorded in continuity registry.',
    outcome
  });
});

// --- In-Field Medicine Dispensation ---
apiRouter.post('/interventions/record-dispense', (req: AuthenticatedRequest, res) => {
  const { patient_id, items } = req.body;
  if (!patient_id || !items) {
    return res.status(400).json({ error: 'Missing patient_id or items' });
  }

  storage.recordMedicineDispensation(patient_id, items);
  res.json({ success: true, message: 'Medicine dispensation updated.' });
});

// --- Analytics & Insights ---
apiRouter.get('/analytics', (_req, res) => {
  const patients = storage.getPatients();
  const outcomes = storage.getEpisodeOutcomes();
  const alerts = storage.getAshaAlerts();
  const outreach = storage.getOutreachActions();
  const followups = storage.getFollowupVisits();
  const facilities = storage.getFacilities();

  // Risk Distribution
  const riskDist: Record<string, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  patients.forEach(p => {
    const pred = mlService.predictPatientRisk(p.patient_id);
    const tier = pred.predicted_tier || p.lfu_risk_tier_k7 || 'Medium';
    riskDist[tier] = (riskDist[tier] || 0) + 1;
  });

  // CCI-7 Distribution
  const cciDist: Record<string, number> = { Optimal: 0, 'Sub-Optimal': 0, Fragmented: 0, Broken: 0 };
  let totalCci = 0;
  patients.forEach(p => {
    const c = calculateCCI7(p.patient_id);
    cciDist[c.tier] = (cciDist[c.tier] || 0) + 1;
    totalCci += c.total_score;
  });
  const avgCci = patients.length > 0 ? Math.round(totalCci / patients.length) : 0;

  // Care Breakpoints breakdown
  const breakpoints: Record<string, number> = {
    Screening: 0,
    Teleconsultation: 0,
    Prescription: 0,
    Medicine: 0,
    Test: 0,
    'Follow-up': 0,
    Outreach: 0
  };
  patients.forEach(p => {
    const bp = detectCareBreakpoint(p.patient_id);
    if (bp) {
      breakpoints[bp.stage] = (breakpoints[bp.stage] || 0) + 1;
    }
  });

  // Outreach Outcomes
  const outreachOutcomes: Record<string, number> = {
    answered: 0,
    no_answer: 0,
    unavailable: 0,
    declined: 0,
    failed: 0
  };
  outreach.forEach(o => {
    outreachOutcomes[o.contact_outcome] = (outreachOutcomes[o.contact_outcome] || 0) + 1;
  });

  // Care Restored Rate
  const restoredCount = outcomes.filter(o => o.outcome_status === 'care_restored').length;
  const restoredRate = patients.length > 0 ? Math.round((restoredCount / patients.length) * 100) : 0;

  // Follow-Up Completion Rate
  const completedVisits = followups.filter(f => f.visit_status === 'completed').length;
  const followupRate = followups.length > 0 ? Math.round((completedVisits / followups.length) * 100) : 0;

  // Facility Comparisons
  const facilityStats = facilities.map(f => {
    const fPatients = patients.filter(p => p.facility_id === f.facility_id);
    const fRestored = outcomes.filter(o => {
      const p = patients.find(pat => pat.patient_id === o.patient_id);
      return p?.facility_id === f.facility_id && o.outcome_status === 'care_restored';
    }).length;

    let fCciTotal = 0;
    fPatients.forEach(p => (fCciTotal += calculateCCI7(p.patient_id).total_score));

    return {
      facility_id: f.facility_id,
      facility_name: f.facility_name,
      facility_type: f.facility_type,
      block: f.block,
      patient_count: fPatients.length,
      care_restored_count: fRestored,
      restored_rate: fPatients.length > 0 ? Math.round((fRestored / fPatients.length) * 100) : 0,
      avg_cci: fPatients.length > 0 ? Math.round(fCciTotal / fPatients.length) : 0
    };
  });

  res.json({
    total_patients: patients.length,
    risk_distribution: riskDist,
    cci_distribution: cciDist,
    avg_cci: avgCci,
    care_breakpoints: breakpoints,
    outreach_outcomes: outreachOutcomes,
    total_alerts: alerts.length,
    open_alerts: alerts.filter(a => a.status === 'OPEN').length,
    care_restored_count: restoredCount,
    care_restored_rate: restoredRate,
    followup_completion_rate: followupRate,
    facility_comparisons: facilityStats
  });
});

// --- ML Model Metrics & Feature Importance ---
apiRouter.get('/ml/metrics', (_req, res) => {
  const metrics = mlService.getMetrics();
  res.json({ metrics });
});

// --- Linkage Engine Stats & Records ---
apiRouter.get('/linkage/stats', (_req, res) => {
  const { records, stats } = runPatientLinkage();
  res.json({ stats, sample_records: records.slice(0, 15) });
});

// --- Submission Exports ---
apiRouter.get('/export/linkage', (_req, res) => {
  const csv = generateLinkageSubmissionCsv();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="submission_template_linkage.csv"');
  res.send(csv);
});

apiRouter.get('/export/prediction', (_req, res) => {
  const csv = generateEpisodePredictionCsv();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="submission_template_episode_prediction.csv"');
  res.send(csv);
});

apiRouter.get('/export/action-queue', (_req, res) => {
  const csv = generateActionQueueCsv();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="submission_template_action_queue.csv"');
  res.send(csv);
});
