export type UserRole = 'ASHA' | 'CHO' | 'DOCTOR' | 'DISTRICT_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  facilityId: string;
  facilityName: string;
  block: string;
  district: string;
}

export type RiskTier = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Patient360 {
  patient_id: string;
  abha_id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  contact_number: string;
  block: string;
  district: string;
  facility_id: string;
  assigned_asha_id: string;
  assigned_asha_name: string;
  chronic_conditions: string;
  registration_date: string;
  lfu_risk_tier_k7: RiskTier;
  distance_to_facility_km?: number;
}

export interface Teleconsultation {
  consultation_id: string;
  patient_id: string;
  consultation_date: string;
  doctor_id: string;
  doctor_name: string;
  diagnosis: string;
  prescribed_followup_date: string;
  doctor_notes: string;
  status: 'completed' | 'scheduled' | 'cancelled' | 'pending';
}

export interface NcdScreening {
  screening_id: string;
  patient_id: string;
  screening_date: string;
  systolic_bp: number;
  diastolic_bp: number;
  random_blood_sugar: number;
  bmi: number;
  hypertension_suspected: boolean;
  diabetes_suspected: boolean;
  screening_location: string;
}

export interface Prescription {
  prescription_id: string;
  consultation_id: string;
  patient_id: string;
  prescription_date: string;
  medication_names: string;
  dosage_schedule: string;
  days_supply: number;
}

export interface MedicineDispense {
  dispense_id: string;
  prescription_id: string;
  patient_id: string;
  dispense_date: string;
  facility_id: string;
  items_dispensed: string;
  dispense_status: 'fully_dispensed' | 'partially_dispensed' | 'stockout';
}

export interface MedicineStockStatus {
  facility_id: string;
  medicine_name: string;
  stock_level: number;
  reorder_threshold: number;
  stock_status: 'adequate' | 'low' | 'stockout';
}

export interface LabTest {
  test_id: string;
  patient_id: string;
  consultation_id: string;
  test_type: string;
  ordered_date: string;
  sample_collected_date: string | null;
  result_date: string | null;
  result_value: string | null;
  test_status: 'ordered' | 'sample_collected' | 'completed' | 'overdue';
}

export interface FollowupVisit {
  visit_id: string;
  patient_id: string;
  scheduled_date: string;
  actual_date: string | null;
  facility_id: string;
  visit_type: string;
  visit_status: 'completed' | 'missed' | 'pending' | 'rescheduled';
}

export interface VisitHistory {
  history_id: string;
  patient_id: string;
  event_type: string;
  event_date: string;
  facility_id: string;
  notes: string;
}

export interface OutreachAction {
  action_id: string;
  patient_id: string;
  asha_id: string;
  action_date: string;
  action_type: 'call' | 'home_visit' | 'community_counseling' | 'medicine_delivery';
  contact_outcome: 'answered' | 'no_answer' | 'unavailable' | 'declined' | 'failed';
  kestrel_stage: number;
  notes: string;
}

export interface EpisodeOutcome {
  episode_id: string;
  patient_id: string;
  outcome_date: string;
  outcome_status: 'care_restored' | 'active_followup' | 'lost_to_followup' | 'transferred' | 'deceased';
  care_breakpoint_resolved: string;
  verified_by: string;
}

export interface FacilityReference {
  facility_id: string;
  facility_name: string;
  facility_type: 'HWC-SC' | 'PHC' | 'CHC' | 'DH';
  block: string;
  district: string;
  cho_name: string;
  contact_number: string;
}

export interface GeographyReference {
  block_id: string;
  block_name: string;
  district_name: string;
  state: string;
  population: number;
  hwc_count: number;
}

export interface DataDictionaryEntry {
  table_name: string;
  column_name: string;
  data_type: string;
  description: string;
}

export interface DatasetInventoryEntry {
  file_name: string;
  file_size_kb: number;
  row_count: number;
  primary_key: string;
  foreign_keys: string;
}

export interface LinkageRecord {
  source_table: string;
  source_record_id: string;
  source_patient_identifier: string;
  canonical_patient_id: string;
  linkage_status: 'LINKED' | 'UNRESOLVED' | 'AMBIGUOUS';
  confidence: number;
  provenance: string;
  matched_on: string;
}

export interface LinkageStats {
  total_source_records: number;
  linked_count: number;
  unresolved_count: number;
  ambiguous_count: number;
  confidence_distribution: {
    high: number; // >= 0.95
    medium: number; // 0.8 - 0.94
    low: number; // < 0.8
  };
}

export type JourneyStageType = 
  | 'Screening' 
  | 'Teleconsultation' 
  | 'Prescription' 
  | 'Medicine' 
  | 'Test' 
  | 'FollowUp' 
  | 'Outreach' 
  | 'Outcome';

export interface JourneyEvent {
  stage: JourneyStageType;
  status: 'completed' | 'pending' | 'not_recorded' | 'not_applicable';
  title: string;
  date?: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface PatientJourney {
  patient_id: string;
  events: JourneyEvent[];
}

export interface CCI7Component {
  id: string;
  name: string;
  weight: number;
  score: number; // 0 to 1
  status: 'Met' | 'Incomplete' | 'At Risk' | 'Not Applicable';
  evidence: string;
}

export interface CCI7Result {
  patient_id: string;
  total_score: number; // 0 to 100
  tier: 'Optimal' | 'Sub-Optimal' | 'Fragmented' | 'Broken';
  components: CCI7Component[];
  explanation: string;
}

export type BreakpointStage = 
  | 'Screening' 
  | 'Teleconsultation' 
  | 'Prescription' 
  | 'Medicine' 
  | 'Test' 
  | 'Follow-up' 
  | 'Outreach';

export interface CareBreakpoint {
  stage: BreakpointStage;
  evidence: string;
  date: string;
  next_required_action: string;
  severity: 'Routine' | 'Moderate' | 'High' | 'Urgent';
}

export type KestrelStageNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface KestrelStatus {
  patient_id: string;
  current_stage: KestrelStageNumber;
  stage_name: string;
  priority: 'Routine' | 'Medium' | 'High' | 'Urgent';
  recommended_action: string;
  assigned_worker: string;
  outreach_attempts: number;
  next_action: string;
  outcome: string;
  care_restored: boolean;
  stopped_reason?: string;
}

export interface AshaAlert {
  id: string;
  patient_id: string;
  patient_name: string;
  risk_tier: RiskTier;
  care_breakpoint: string;
  attempts: number;
  last_attempt_date: string;
  reason: string;
  recommended_action: string;
  status: 'OPEN' | 'RESOLVED' | 'ESCALATED';
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export interface MLMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  confusion_matrix: {
    labels: string[];
    matrix: number[][];
  };
  feature_importance: {
    feature: string;
    importance: number;
    description: string;
  }[];
  cohort_size: number;
  train_size: number;
  test_size: number;
  class_distribution: Record<string, number>;
  training_timestamp: string;
}

export interface RiskFactorExplanation {
  feature: string;
  impact: 'increases_risk' | 'decreases_risk';
  weight: number;
  explanation: string;
}

export interface PatientPrediction {
  patient_id: string;
  predicted_tier: RiskTier;
  confidence: number;
  risk_factors: RiskFactorExplanation[];
}

export interface ImportSummary {
  files_detected: number;
  files_valid: number;
  records_imported: number;
  table_counts: Record<string, number>;
  validation_errors: string[];
  imported_at: string;
  source_name: string;
}
