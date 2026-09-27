import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import Papa from 'papaparse';
import type {
  Patient360,
  Teleconsultation,
  NcdScreening,
  Prescription,
  MedicineDispense,
  MedicineStockStatus,
  LabTest,
  FollowupVisit,
  VisitHistory,
  OutreachAction,
  EpisodeOutcome,
  FacilityReference,
  GeographyReference,
  DataDictionaryEntry,
  DatasetInventoryEntry,
  AshaAlert,
  ImportSummary
} from './types.ts';

import {
  SAMPLE_PATIENTS,
  SAMPLE_TELECONSULTATIONS,
  SAMPLE_NCD_SCREENING,
  SAMPLE_PRESCRIPTIONS,
  SAMPLE_MEDICINE_DISPENSING,
  SAMPLE_MEDICINE_STOCK,
  SAMPLE_LAB_TESTS,
  SAMPLE_FOLLOWUP_VISITS,
  SAMPLE_VISIT_HISTORY,
  SAMPLE_OUTREACH_ACTIONS,
  SAMPLE_EPISODE_OUTCOMES,
  SAMPLE_FACILITIES,
  SAMPLE_GEOGRAPHY,
  SAMPLE_DATA_DICTIONARY,
  SAMPLE_DATASET_INVENTORY
} from './sampleDataset.ts';

interface DatabaseSchema {
  patients: Patient360[];
  teleconsultations: Teleconsultation[];
  ncd_screening: NcdScreening[];
  prescriptions: Prescription[];
  medicine_dispensing: MedicineDispense[];
  medicine_stock_status: MedicineStockStatus[];
  lab_tests: LabTest[];
  followup_visits: FollowupVisit[];
  visit_history: VisitHistory[];
  outreach_actions: OutreachAction[];
  episode_outcomes: EpisodeOutcome[];
  facility_reference: FacilityReference[];
  geography_reference: GeographyReference[];
  data_dictionary: DataDictionaryEntry[];
  dataset_inventory: DatasetInventoryEntry[];
  asha_alerts: AshaAlert[];
  import_history: ImportSummary[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'health_db.json');
const SAMPLE_ZIP_PATH = path.join(DATA_DIR, 'competition_rural_health_dataset.zip');

class StorageService {
  private db: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.db = this.loadDatabase();
    this.generateStarterZipIfMissing();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse existing database file, reinitializing:', err);
      }
    }

    // Default initial seed
    const initialDb: DatabaseSchema = {
      patients: [...SAMPLE_PATIENTS],
      teleconsultations: [...SAMPLE_TELECONSULTATIONS],
      ncd_screening: [...SAMPLE_NCD_SCREENING],
      prescriptions: [...SAMPLE_PRESCRIPTIONS],
      medicine_dispensing: [...SAMPLE_MEDICINE_DISPENSING],
      medicine_stock_status: [...SAMPLE_MEDICINE_STOCK],
      lab_tests: [...SAMPLE_LAB_TESTS],
      followup_visits: [...SAMPLE_FOLLOWUP_VISITS],
      visit_history: [...SAMPLE_VISIT_HISTORY],
      outreach_actions: [...SAMPLE_OUTREACH_ACTIONS],
      episode_outcomes: [...SAMPLE_EPISODE_OUTCOMES],
      facility_reference: [...SAMPLE_FACILITIES],
      geography_reference: [...SAMPLE_GEOGRAPHY],
      data_dictionary: [...SAMPLE_DATA_DICTIONARY],
      dataset_inventory: [...SAMPLE_DATASET_INVENTORY],
      asha_alerts: [
        {
          id: 'ALERT-001',
          patient_id: 'P102',
          patient_name: 'Kamla Devi',
          risk_tier: 'High',
          care_breakpoint: 'Medicine Dispensing Stockout',
          attempts: 2,
          last_attempt_date: '2026-02-19',
          reason: 'Patient could not be reached after 2 telephone outreach attempts; Metformin stockout at Sub-Centre',
          recommended_action: 'Community/home follow-up with Metformin 500mg buffer supply',
          status: 'OPEN',
          created_at: '2026-02-19T17:00:00Z'
        },
        {
          id: 'ALERT-002',
          patient_id: 'P103',
          patient_name: 'Suresh Chandra',
          risk_tier: 'Critical',
          care_breakpoint: 'Missed Glycemic Follow-Up & Severe Glucose (286 mg/dL)',
          attempts: 2,
          last_attempt_date: '2026-02-24',
          reason: 'Unreachable after 2 calls; missed diabetic monitoring visit',
          recommended_action: 'Direct home visit by ASHA Sunita Devi to re-engage patient',
          status: 'OPEN',
          created_at: '2026-02-24T18:00:00Z'
        }
      ],
      import_history: [
        {
          files_detected: 19,
          files_valid: 19,
          records_imported: 124,
          table_counts: {
            patient_360_reference: SAMPLE_PATIENTS.length,
            teleconsultations: SAMPLE_TELECONSULTATIONS.length,
            ncd_screening: SAMPLE_NCD_SCREENING.length,
            prescriptions: SAMPLE_PRESCRIPTIONS.length,
            medicine_dispensing: SAMPLE_MEDICINE_DISPENSING.length,
            medicine_stock_status: SAMPLE_MEDICINE_STOCK.length,
            lab_tests: SAMPLE_LAB_TESTS.length,
            followup_visits: SAMPLE_FOLLOWUP_VISITS.length,
            visit_history: SAMPLE_VISIT_HISTORY.length,
            outreach_actions: SAMPLE_OUTREACH_ACTIONS.length,
            episode_outcomes: SAMPLE_EPISODE_OUTCOMES.length,
            facility_reference: SAMPLE_FACILITIES.length,
            geography_reference: SAMPLE_GEOGRAPHY.length
          },
          validation_errors: [],
          imported_at: new Date().toISOString(),
          source_name: 'Competition Baseline Package (19 CSV files)'
        }
      ]
    };

    this.saveDatabase(initialDb);
    return initialDb;
  }

  public saveDatabase(dbToSave: DatabaseSchema = this.db) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dbToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving database file:', err);
    }
  }

  public async generateStarterZipIfMissing(): Promise<Buffer> {
    const zip = new JSZip();

    zip.file('patient_360_reference.csv', Papa.unparse(this.db.patients));
    zip.file('teleconsultations.csv', Papa.unparse(this.db.teleconsultations));
    zip.file('ncd_screening.csv', Papa.unparse(this.db.ncd_screening));
    zip.file('prescriptions.csv', Papa.unparse(this.db.prescriptions));
    zip.file('medicine_dispensing.csv', Papa.unparse(this.db.medicine_dispensing));
    zip.file('medicine_stock_status.csv', Papa.unparse(this.db.medicine_stock_status));
    zip.file('lab_tests.csv', Papa.unparse(this.db.lab_tests));
    zip.file('followup_visits.csv', Papa.unparse(this.db.followup_visits));
    zip.file('visit_history.csv', Papa.unparse(this.db.visit_history));
    zip.file('outreach_actions.csv', Papa.unparse(this.db.outreach_actions));
    zip.file('episode_outcomes.csv', Papa.unparse(this.db.episode_outcomes));
    zip.file('facility_reference.csv', Papa.unparse(this.db.facility_reference));
    zip.file('geography_reference.csv', Papa.unparse(this.db.geography_reference));
    zip.file('data_dictionary.csv', Papa.unparse(this.db.data_dictionary));
    zip.file('dataset_inventory.csv', Papa.unparse(this.db.dataset_inventory));
    
    // Submission templates
    const linkageTemplate = this.db.patients.map((p, idx) => ({
      source_table: 'ncd_screening',
      source_record_id: `SCR-2026-00${idx + 1}`,
      source_patient_identifier: p.contact_number,
      canonical_patient_id: p.patient_id,
      linkage_status: 'LINKED',
      confidence: 0.98,
      provenance: 'deterministic_abha_phone_match'
    }));
    zip.file('submission_template_linkage.csv', Papa.unparse(linkageTemplate));

    const predictionTemplate = this.db.patients.map(p => ({
      patient_id: p.patient_id,
      lfu_risk_tier_k7: p.lfu_risk_tier_k7,
      predicted_probability_ltfu: p.lfu_risk_tier_k7 === 'Critical' ? 0.88 : p.lfu_risk_tier_k7 === 'High' ? 0.72 : p.lfu_risk_tier_k7 === 'Medium' ? 0.44 : 0.12,
      top_risk_feature: p.chronic_conditions.includes('&') ? 'multi_morbidity' : 'distance_km'
    }));
    zip.file('submission_template_episode_prediction.csv', Papa.unparse(predictionTemplate));

    const actionQueueTemplate = this.db.patients.map(p => ({
      patient_id: p.patient_id,
      kestrel_stage: p.lfu_risk_tier_k7 === 'Critical' ? 4 : p.lfu_risk_tier_k7 === 'High' ? 3 : 1,
      priority: p.lfu_risk_tier_k7 === 'Critical' ? 'Urgent' : p.lfu_risk_tier_k7 === 'High' ? 'High' : 'Routine',
      assigned_worker: p.assigned_asha_name,
      recommended_action: p.lfu_risk_tier_k7 === 'Critical' ? 'Physical Home Visit' : 'Telephonic Outreach'
    }));
    zip.file('submission_template_action_queue.csv', Papa.unparse(actionQueueTemplate));

    zip.file('README.md', `# Rural Health Follow-up Assurance Dataset
Competition Dataset for Non-Communicable Diseases (Hypertension & Diabetes) in Primary Care Catchments.
Contains 19 authoritative files including patient 360 reference, screening, teleconsultations, dispensing, lab tests, outreach history, and submission templates.
`);

    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    fs.writeFileSync(SAMPLE_ZIP_PATH, buffer);
    return buffer;
  }

  public getStarterZipPath(): string {
    if (!fs.existsSync(SAMPLE_ZIP_PATH)) {
      this.generateStarterZipIfMissing();
    }
    return SAMPLE_ZIP_PATH;
  }

  // Getters
  public getPatients(): Patient360[] { return this.db.patients; }
  public getTeleconsultations(): Teleconsultation[] { return this.db.teleconsultations; }
  public getNcdScreenings(): NcdScreening[] { return this.db.ncd_screening; }
  public getPrescriptions(): Prescription[] { return this.db.prescriptions; }
  public getMedicineDispensing(): MedicineDispense[] { return this.db.medicine_dispensing; }
  public getMedicineStock(): MedicineStockStatus[] { return this.db.medicine_stock_status; }
  public getLabTests(): LabTest[] { return this.db.lab_tests; }
  public getFollowupVisits(): FollowupVisit[] { return this.db.followup_visits; }
  public getVisitHistory(): VisitHistory[] { return this.db.visit_history; }
  public getOutreachActions(): OutreachAction[] { return this.db.outreach_actions; }
  public getEpisodeOutcomes(): EpisodeOutcome[] { return this.db.episode_outcomes; }
  public getFacilities(): FacilityReference[] { return this.db.facility_reference; }
  public getGeography(): GeographyReference[] { return this.db.geography_reference; }
  public getDataDictionary(): DataDictionaryEntry[] { return this.db.data_dictionary; }
  public getDatasetInventory(): DatasetInventoryEntry[] { return this.db.dataset_inventory; }
  public getAshaAlerts(): AshaAlert[] { return this.db.asha_alerts; }
  public getImportHistory(): ImportSummary[] { return this.db.import_history; }

  public getPatientById(id: string): Patient360 | undefined {
    return this.db.patients.find(p => p.patient_id === id);
  }

  // State Updates
  public addOutreachAction(action: OutreachAction) {
    this.db.outreach_actions.unshift(action);
    this.saveDatabase();
  }

  public addAshaAlert(alert: AshaAlert) {
    const existing = this.db.asha_alerts.find(a => a.id === alert.id || (a.patient_id === alert.patient_id && a.status === 'OPEN'));
    if (!existing) {
      this.db.asha_alerts.unshift(alert);
      this.saveDatabase();
    }
  }

  public resolveAshaAlert(alertId: string, notes: string): boolean {
    const alert = this.db.asha_alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'RESOLVED';
      alert.resolved_at = new Date().toISOString();
      alert.resolution_notes = notes;
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public recordFollowupAttendance(visitId: string, actualDate: string): boolean {
    const visit = this.db.followup_visits.find(v => v.visit_id === visitId);
    if (visit) {
      visit.actual_date = actualDate;
      visit.visit_status = 'completed';
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public recordMedicineDispensation(patientId: string, items: string): boolean {
    const existing = this.db.medicine_dispensing.find(m => m.patient_id === patientId);
    if (existing) {
      existing.dispense_status = 'fully_dispensed';
      existing.items_dispensed = items;
      existing.dispense_date = new Date().toISOString().split('T')[0];
    } else {
      this.db.medicine_dispensing.push({
        dispense_id: `DSP-RESTORED-${Date.now()}`,
        prescription_id: `RX-RESTORED-${Date.now()}`,
        patient_id: patientId,
        dispense_date: new Date().toISOString().split('T')[0],
        facility_id: 'HWC-RAMPUR-01',
        items_dispensed: items,
        dispense_status: 'fully_dispensed'
      });
    }
    this.saveDatabase();
    return true;
  }

  public verifyCareRestored(patientId: string, resolvedReason: string, verifiedBy: string): EpisodeOutcome {
    // 1. Mark or update outcome
    const outcomeDate = new Date().toISOString().split('T')[0];
    let outcome = this.db.episode_outcomes.find(o => o.patient_id === patientId);
    if (outcome) {
      outcome.outcome_status = 'care_restored';
      outcome.outcome_date = outcomeDate;
      outcome.care_breakpoint_resolved = resolvedReason;
      outcome.verified_by = verifiedBy;
    } else {
      outcome = {
        episode_id: `EP-${Date.now()}`,
        patient_id: patientId,
        outcome_date: outcomeDate,
        outcome_status: 'care_restored',
        care_breakpoint_resolved: resolvedReason,
        verified_by: verifiedBy
      };
      this.db.episode_outcomes.unshift(outcome);
    }

    // 2. Resolve any open ASHA alert for this patient
    this.db.asha_alerts.forEach(alert => {
      if (alert.patient_id === patientId && alert.status === 'OPEN') {
        alert.status = 'RESOLVED';
        alert.resolved_at = new Date().toISOString();
        alert.resolution_notes = `Care Restored verified: ${resolvedReason} by ${verifiedBy}`;
      }
    });

    // 3. Mark missed follow-up as completed if applicable
    const missedVisit = this.db.followup_visits.find(v => v.patient_id === patientId && v.visit_status === 'missed');
    if (missedVisit) {
      missedVisit.visit_status = 'completed';
      missedVisit.actual_date = outcomeDate;
    }

    this.saveDatabase();
    return outcome;
  }

  public importDataset(tables: Record<string, any[]>, sourceName: string, validationErrors: string[] = []): ImportSummary {
    // Replace source tables if provided
    if (tables['patient_360_reference'] && tables['patient_360_reference'].length > 0) {
      this.db.patients = tables['patient_360_reference'];
    }
    if (tables['teleconsultations']) this.db.teleconsultations = tables['teleconsultations'];
    if (tables['ncd_screening']) this.db.ncd_screening = tables['ncd_screening'];
    if (tables['prescriptions']) this.db.prescriptions = tables['prescriptions'];
    if (tables['medicine_dispensing']) this.db.medicine_dispensing = tables['medicine_dispensing'];
    if (tables['medicine_stock_status']) this.db.medicine_stock_status = tables['medicine_stock_status'];
    if (tables['lab_tests']) this.db.lab_tests = tables['lab_tests'];
    if (tables['followup_visits']) this.db.followup_visits = tables['followup_visits'];
    if (tables['visit_history']) this.db.visit_history = tables['visit_history'];
    if (tables['outreach_actions']) this.db.outreach_actions = tables['outreach_actions'];
    if (tables['episode_outcomes']) this.db.episode_outcomes = tables['episode_outcomes'];
    if (tables['facility_reference']) this.db.facility_reference = tables['facility_reference'];
    if (tables['geography_reference']) this.db.geography_reference = tables['geography_reference'];
    if (tables['data_dictionary']) this.db.data_dictionary = tables['data_dictionary'];
    if (tables['dataset_inventory']) this.db.dataset_inventory = tables['dataset_inventory'];

    const summary: ImportSummary = {
      files_detected: Object.keys(tables).length,
      files_valid: Object.keys(tables).length - validationErrors.length,
      records_imported: Object.values(tables).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0),
      table_counts: Object.fromEntries(
        Object.entries(tables).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0])
      ),
      validation_errors: validationErrors,
      imported_at: new Date().toISOString(),
      source_name: sourceName
    };

    this.db.import_history.unshift(summary);
    this.saveDatabase();
    return summary;
  }
}

export const storage = new StorageService();
