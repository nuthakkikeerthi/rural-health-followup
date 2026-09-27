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

export interface PatientSummary {
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
  risk_confidence?: number;
  distance_to_facility_km?: number;
  care_breakpoint?: CareBreakpoint | null;
  cci_score?: number;
  cci_tier?: 'Optimal' | 'Sub-Optimal' | 'Fragmented' | 'Broken';
  kestrel_stage?: number;
  kestrel_priority?: 'Routine' | 'Medium' | 'High' | 'Urgent';
  kestrel_next_action?: string;
  has_open_alert?: boolean;
  care_restored?: boolean;
}

export interface CareBreakpoint {
  stage: 'Screening' | 'Teleconsultation' | 'Prescription' | 'Medicine' | 'Test' | 'Follow-up' | 'Outreach';
  evidence: string;
  date: string;
  next_required_action: string;
  severity: 'Routine' | 'Moderate' | 'High' | 'Urgent';
}

export interface JourneyEvent {
  stage: 'Screening' | 'Teleconsultation' | 'Prescription' | 'Medicine' | 'Test' | 'FollowUp' | 'Outreach' | 'Outcome';
  status: 'completed' | 'pending' | 'not_recorded' | 'not_applicable';
  title: string;
  date?: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface CCI7Component {
  id: string;
  name: string;
  weight: number;
  score: number;
  status: 'Met' | 'Incomplete' | 'At Risk' | 'Not Applicable';
  evidence: string;
}

export interface CCI7Result {
  patient_id: string;
  total_score: number;
  tier: 'Optimal' | 'Sub-Optimal' | 'Fragmented' | 'Broken';
  components: CCI7Component[];
  explanation: string;
}

export interface KestrelStatus {
  patient_id: string;
  current_stage: 1 | 2 | 3 | 4 | 5 | 6 | 7;
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

export interface LinkageStats {
  total_source_records: number;
  linked_count: number;
  unresolved_count: number;
  ambiguous_count: number;
  confidence_distribution: {
    high: number;
    medium: number;
    low: number;
  };
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

export interface ImportSummary {
  files_detected: number;
  files_valid: number;
  records_imported: number;
  table_counts: Record<string, number>;
  validation_errors: string[];
  imported_at: string;
  source_name: string;
}

export interface AnalyticsSummary {
  total_patients: number;
  risk_distribution: Record<string, number>;
  cci_distribution: Record<string, number>;
  avg_cci: number;
  care_breakpoints: Record<string, number>;
  outreach_outcomes: Record<string, number>;
  total_alerts: number;
  open_alerts: number;
  care_restored_count: number;
  care_restored_rate: number;
  followup_completion_rate: number;
  facility_comparisons: {
    facility_id: string;
    facility_name: string;
    facility_type: string;
    block: string;
    patient_count: number;
    care_restored_count: number;
    restored_rate: number;
    avg_cci: number;
  }[];
}
