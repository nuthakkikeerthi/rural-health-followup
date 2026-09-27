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
  DatasetInventoryEntry
} from './types.ts';

export const SAMPLE_FACILITIES: FacilityReference[] = [
  {
    facility_id: 'HWC-RAMPUR-01',
    facility_name: 'Ayushman Arogya Mandir Rampur',
    facility_type: 'HWC-SC',
    block: 'Rampur',
    district: 'Balrampur',
    cho_name: 'Priya Sharma (CHO)',
    contact_number: '+91 94501 22341'
  },
  {
    facility_id: 'HWC-KALYANPUR-02',
    facility_name: 'Ayushman Arogya Mandir Kalyanpur',
    facility_type: 'HWC-SC',
    block: 'Rampur',
    district: 'Balrampur',
    cho_name: 'Anita Verma (CHO)',
    contact_number: '+91 94501 22342'
  },
  {
    facility_id: 'PHC-SHIVGARH-01',
    facility_name: 'Primary Health Centre Shivgarh',
    facility_type: 'PHC',
    block: 'Shivgarh',
    district: 'Balrampur',
    cho_name: 'Dr. Vivek Singh (MO)',
    contact_number: '+91 94501 88123'
  },
  {
    facility_id: 'CHC-BALRAMPUR-HQ',
    facility_name: 'Community Health Centre Balrampur',
    facility_type: 'CHC',
    block: 'Balrampur Sadar',
    district: 'Balrampur',
    cho_name: 'Dr. Rajesh Varma (Consultant)',
    contact_number: '+91 94501 99001'
  }
];

export const SAMPLE_GEOGRAPHY: GeographyReference[] = [
  {
    block_id: 'BLK-RAMPUR',
    block_name: 'Rampur',
    district_name: 'Balrampur',
    state: 'Uttar Pradesh',
    population: 184500,
    hwc_count: 24
  },
  {
    block_id: 'BLK-SHIVGARH',
    block_name: 'Shivgarh',
    district_name: 'Balrampur',
    state: 'Uttar Pradesh',
    population: 162000,
    hwc_count: 20
  },
  {
    block_id: 'BLK-SADAR',
    block_name: 'Balrampur Sadar',
    district_name: 'Balrampur',
    state: 'Uttar Pradesh',
    population: 240000,
    hwc_count: 32
  }
];

export const SAMPLE_PATIENTS: Patient360[] = [
  {
    patient_id: 'P101',
    abha_id: '91-4421-9981-1001',
    name: 'Ram Charan Yadav',
    age: 58,
    gender: 'M',
    contact_number: '+91 98391 10001',
    block: 'Rampur',
    district: 'Balrampur',
    facility_id: 'HWC-RAMPUR-01',
    assigned_asha_id: 'ASHA-01',
    assigned_asha_name: 'Sunita Devi',
    chronic_conditions: 'Hypertension',
    registration_date: '2026-01-10',
    lfu_risk_tier_k7: 'Low',
    distance_to_facility_km: 2.1
  },
  {
    patient_id: 'P102',
    abha_id: '91-4421-9981-1002',
    name: 'Kamla Devi',
    age: 62,
    gender: 'F',
    contact_number: '+91 98391 10002',
    block: 'Rampur',
    district: 'Balrampur',
    facility_id: 'HWC-RAMPUR-01',
    assigned_asha_id: 'ASHA-01',
    assigned_asha_name: 'Sunita Devi',
    chronic_conditions: 'Hypertension & Type 2 Diabetes',
    registration_date: '2026-01-14',
    lfu_risk_tier_k7: 'High',
    distance_to_facility_km: 7.8
  },
  {
    patient_id: 'P103',
    abha_id: '91-4421-9981-1003',
    name: 'Suresh Chandra',
    age: 51,
    gender: 'M',
    contact_number: '+91 98391 10003',
    block: 'Rampur',
    district: 'Balrampur',
    facility_id: 'HWC-RAMPUR-01',
    assigned_asha_id: 'ASHA-01',
    assigned_asha_name: 'Sunita Devi',
    chronic_conditions: 'Type 2 Diabetes',
    registration_date: '2026-01-18',
    lfu_risk_tier_k7: 'Critical',
    distance_to_facility_km: 11.4
  },
  {
    patient_id: 'P104',
    abha_id: '91-4421-9981-1004',
    name: 'Shanti Devi',
    age: 47,
    gender: 'F',
    contact_number: '+91 98391 10004',
    block: 'Rampur',
    district: 'Balrampur',
    facility_id: 'HWC-RAMPUR-01',
    assigned_asha_id: 'ASHA-01',
    assigned_asha_name: 'Sunita Devi',
    chronic_conditions: 'Hypertension',
    registration_date: '2026-01-22',
    lfu_risk_tier_k7: 'Medium',
    distance_to_facility_km: 4.5
  },
  {
    patient_id: 'P105',
    abha_id: '91-4421-9981-1005',
    name: 'Mahesh Prasad',
    age: 65,
    gender: 'M',
    contact_number: '+91 98391 10005',
    block: 'Rampur',
    district: 'Balrampur',
    facility_id: 'HWC-RAMPUR-01',
    assigned_asha_id: 'ASHA-01',
    assigned_asha_name: 'Sunita Devi',
    chronic_conditions: 'Hypertension & Type 2 Diabetes',
    registration_date: '2026-02-01',
    lfu_risk_tier_k7: 'High',
    distance_to_facility_km: 6.2
  },
  {
    patient_id: 'P106',
    abha_id: '91-4421-9981-1006',
    name: 'Geeta Maurya',
    age: 42,
    gender: 'F',
    contact_number: '+91 98391 10006',
    block: 'Rampur',
    district: 'Balrampur',
    facility_id: 'HWC-RAMPUR-01',
    assigned_asha_id: 'ASHA-01',
    assigned_asha_name: 'Sunita Devi',
    chronic_conditions: 'Hypertension',
    registration_date: '2026-02-05',
    lfu_risk_tier_k7: 'Low',
    distance_to_facility_km: 1.8
  },
  {
    patient_id: 'P107',
    abha_id: '91-4421-9981-1007',
    name: 'Balram Tiwari',
    age: 70,
    gender: 'M',
    contact_number: '+91 98391 10007',
    block: 'Rampur',
    district: 'Balrampur',
    facility_id: 'HWC-KALYANPUR-02',
    assigned_asha_id: 'ASHA-02',
    assigned_asha_name: 'Kanti Devi',
    chronic_conditions: 'Hypertension & CKD Stage 2',
    registration_date: '2026-02-08',
    lfu_risk_tier_k7: 'Critical',
    distance_to_facility_km: 9.3
  },
  {
    patient_id: 'P108',
    abha_id: '91-4421-9981-1008',
    name: 'Phoolmati Rawat',
    age: 54,
    gender: 'F',
    contact_number: '+91 98391 10008',
    block: 'Rampur',
    district: 'Balrampur',
    facility_id: 'HWC-KALYANPUR-02',
    assigned_asha_id: 'ASHA-02',
    assigned_asha_name: 'Kanti Devi',
    chronic_conditions: 'Type 2 Diabetes',
    registration_date: '2026-02-12',
    lfu_risk_tier_k7: 'Medium',
    distance_to_facility_km: 3.8
  },
  {
    patient_id: 'P109',
    abha_id: '91-4421-9981-1009',
    name: 'Radhe Shyam',
    age: 60,
    gender: 'M',
    contact_number: '+91 98391 10009',
    block: 'Shivgarh',
    district: 'Balrampur',
    facility_id: 'PHC-SHIVGARH-01',
    assigned_asha_id: 'ASHA-03',
    assigned_asha_name: 'Meena Kumari',
    chronic_conditions: 'Hypertension',
    registration_date: '2026-02-15',
    lfu_risk_tier_k7: 'High',
    distance_to_facility_km: 8.5
  },
  {
    patient_id: 'P110',
    abha_id: '91-4421-9981-1010',
    name: 'Urmila Nishad',
    age: 49,
    gender: 'F',
    contact_number: '+91 98391 10010',
    block: 'Shivgarh',
    district: 'Balrampur',
    facility_id: 'PHC-SHIVGARH-01',
    assigned_asha_id: 'ASHA-03',
    assigned_asha_name: 'Meena Kumari',
    chronic_conditions: 'Type 2 Diabetes',
    registration_date: '2026-02-18',
    lfu_risk_tier_k7: 'Low',
    distance_to_facility_km: 2.4
  },
  {
    patient_id: 'P111',
    abha_id: '91-4421-9981-1011',
    name: 'Devi Dayal',
    age: 63,
    gender: 'M',
    contact_number: '+91 98391 10011',
    block: 'Balrampur Sadar',
    district: 'Balrampur',
    facility_id: 'CHC-BALRAMPUR-HQ',
    assigned_asha_id: 'ASHA-04',
    assigned_asha_name: 'Rekha Gupta',
    chronic_conditions: 'Hypertension & Dyslipidemia',
    registration_date: '2026-02-20',
    lfu_risk_tier_k7: 'Medium',
    distance_to_facility_km: 3.1
  },
  {
    patient_id: 'P112',
    abha_id: '91-4421-9981-1012',
    name: 'Kusuma Devi',
    age: 56,
    gender: 'F',
    contact_number: '+91 98391 10012',
    block: 'Balrampur Sadar',
    district: 'Balrampur',
    facility_id: 'CHC-BALRAMPUR-HQ',
    assigned_asha_id: 'ASHA-04',
    assigned_asha_name: 'Rekha Gupta',
    chronic_conditions: 'Hypertension & Type 2 Diabetes',
    registration_date: '2026-02-22',
    lfu_risk_tier_k7: 'Critical',
    distance_to_facility_km: 12.0
  }
];

export const SAMPLE_NCD_SCREENING: NcdScreening[] = [
  {
    screening_id: 'SCR-2026-001',
    patient_id: 'P101',
    screening_date: '2026-01-10',
    systolic_bp: 146,
    diastolic_bp: 92,
    random_blood_sugar: 138,
    bmi: 24.2,
    hypertension_suspected: true,
    diabetes_suspected: false,
    screening_location: 'HWC Rampur'
  },
  {
    screening_id: 'SCR-2026-002',
    patient_id: 'P102',
    screening_date: '2026-01-14',
    systolic_bp: 168,
    diastolic_bp: 102,
    random_blood_sugar: 242,
    bmi: 27.8,
    hypertension_suspected: true,
    diabetes_suspected: true,
    screening_location: 'Village Anganwadi Centre 1'
  },
  {
    screening_id: 'SCR-2026-003',
    patient_id: 'P103',
    screening_date: '2026-01-18',
    systolic_bp: 138,
    diastolic_bp: 88,
    random_blood_sugar: 286,
    bmi: 28.5,
    hypertension_suspected: false,
    diabetes_suspected: true,
    screening_location: 'Village Chaupal Rampur'
  },
  {
    screening_id: 'SCR-2026-004',
    patient_id: 'P104',
    screening_date: '2026-01-22',
    systolic_bp: 152,
    diastolic_bp: 96,
    random_blood_sugar: 144,
    bmi: 25.1,
    hypertension_suspected: true,
    diabetes_suspected: false,
    screening_location: 'HWC Rampur'
  },
  {
    screening_id: 'SCR-2026-005',
    patient_id: 'P105',
    screening_date: '2026-02-01',
    systolic_bp: 164,
    diastolic_bp: 98,
    random_blood_sugar: 210,
    bmi: 26.4,
    hypertension_suspected: true,
    diabetes_suspected: true,
    screening_location: 'HWC Rampur'
  },
  {
    screening_id: 'SCR-2026-006',
    patient_id: 'P106',
    screening_date: '2026-02-05',
    systolic_bp: 142,
    diastolic_bp: 88,
    random_blood_sugar: 122,
    bmi: 23.0,
    hypertension_suspected: true,
    diabetes_suspected: false,
    screening_location: 'HWC Rampur'
  },
  {
    screening_id: 'SCR-2026-007',
    patient_id: 'P107',
    screening_date: '2026-02-08',
    systolic_bp: 174,
    diastolic_bp: 108,
    random_blood_sugar: 194,
    bmi: 29.1,
    hypertension_suspected: true,
    diabetes_suspected: true,
    screening_location: 'HWC Kalyanpur'
  },
  {
    screening_id: 'SCR-2026-008',
    patient_id: 'P108',
    screening_date: '2026-02-12',
    systolic_bp: 134,
    diastolic_bp: 84,
    random_blood_sugar: 230,
    bmi: 26.0,
    hypertension_suspected: false,
    diabetes_suspected: true,
    screening_location: 'HWC Kalyanpur'
  },
  {
    screening_id: 'SCR-2026-009',
    patient_id: 'P109',
    screening_date: '2026-02-15',
    systolic_bp: 158,
    diastolic_bp: 98,
    random_blood_sugar: 150,
    bmi: 27.2,
    hypertension_suspected: true,
    diabetes_suspected: false,
    screening_location: 'PHC Shivgarh'
  },
  {
    screening_id: 'SCR-2026-010',
    patient_id: 'P110',
    screening_date: '2026-02-18',
    systolic_bp: 126,
    diastolic_bp: 82,
    random_blood_sugar: 215,
    bmi: 24.8,
    hypertension_suspected: false,
    diabetes_suspected: true,
    screening_location: 'PHC Shivgarh'
  },
  {
    screening_id: 'SCR-2026-011',
    patient_id: 'P111',
    screening_date: '2026-02-20',
    systolic_bp: 148,
    diastolic_bp: 94,
    random_blood_sugar: 165,
    bmi: 25.9,
    hypertension_suspected: true,
    diabetes_suspected: false,
    screening_location: 'CHC Balrampur'
  },
  {
    screening_id: 'SCR-2026-012',
    patient_id: 'P112',
    screening_date: '2026-02-22',
    systolic_bp: 182,
    diastolic_bp: 112,
    random_blood_sugar: 270,
    bmi: 30.2,
    hypertension_suspected: true,
    diabetes_suspected: true,
    screening_location: 'CHC Balrampur'
  }
];

export const SAMPLE_TELECONSULTATIONS: Teleconsultation[] = [
  {
    consultation_id: 'TC-2026-101',
    patient_id: 'P101',
    consultation_date: '2026-01-12',
    doctor_id: 'DOC-01',
    doctor_name: 'Dr. Rajesh Varma',
    diagnosis: 'Stage 1 Essential Hypertension',
    prescribed_followup_date: '2026-02-12',
    doctor_notes: 'Initiated Tab Amlodipine 5mg OD. Advised low sodium diet. Follow up in 30 days.',
    status: 'completed'
  },
  {
    consultation_id: 'TC-2026-102',
    patient_id: 'P102',
    consultation_date: '2026-01-16',
    doctor_id: 'DOC-01',
    doctor_name: 'Dr. Rajesh Varma',
    diagnosis: 'Stage 2 Hypertension with Uncontrolled T2DM',
    prescribed_followup_date: '2026-02-16',
    doctor_notes: 'Prescribed Telmisartan 40mg + Metformin 500mg BD. Urgent HbA1c required.',
    status: 'completed'
  },
  {
    consultation_id: 'TC-2026-103',
    patient_id: 'P103',
    consultation_date: '2026-01-20',
    doctor_id: 'DOC-02',
    doctor_name: 'Dr. Vivek Singh',
    diagnosis: 'Type 2 Diabetes Mellitus with Poor Glycemic Control',
    prescribed_followup_date: '2026-02-20',
    doctor_notes: 'Prescribed Metformin 1000mg + Glimepiride 1mg. Fasting & PP blood sugar monitoring ordered.',
    status: 'completed'
  },
  {
    consultation_id: 'TC-2026-104',
    patient_id: 'P104',
    consultation_date: '2026-01-24',
    doctor_id: 'DOC-01',
    doctor_name: 'Dr. Rajesh Varma',
    diagnosis: 'Stage 1 Hypertension',
    prescribed_followup_date: '2026-02-24',
    doctor_notes: 'Prescribed Amlodipine 5mg. Dietary sodium restriction advised.',
    status: 'completed'
  },
  {
    consultation_id: 'TC-2026-105',
    patient_id: 'P105',
    consultation_date: '2026-02-03',
    doctor_id: 'DOC-02',
    doctor_name: 'Dr. Vivek Singh',
    diagnosis: 'Uncontrolled Hypertension with Diabetes',
    prescribed_followup_date: '2026-03-03',
    doctor_notes: 'Dual therapy initiated. Ordered serum creatinine and HbA1c.',
    status: 'completed'
  },
  {
    consultation_id: 'TC-2026-106',
    patient_id: 'P106',
    consultation_date: '2026-02-07',
    doctor_id: 'DOC-01',
    doctor_name: 'Dr. Rajesh Varma',
    diagnosis: 'Mild Hypertension',
    prescribed_followup_date: '2026-03-07',
    doctor_notes: 'Lifestyle modification trial with follow-up in 30 days.',
    status: 'completed'
  },
  {
    consultation_id: 'TC-2026-107',
    patient_id: 'P107',
    consultation_date: '2026-02-10',
    doctor_id: 'DOC-01',
    doctor_name: 'Dr. Rajesh Varma',
    diagnosis: 'Severe Hypertension with Renal Involvement Risk',
    prescribed_followup_date: '2026-03-10',
    doctor_notes: 'Telmisartan 40mg + Amlodipine 5mg. Urgent KFT and Urine Albumin.',
    status: 'completed'
  },
  {
    consultation_id: 'TC-2026-108',
    patient_id: 'P108',
    consultation_date: '2026-02-14',
    doctor_id: 'DOC-02',
    doctor_name: 'Dr. Vivek Singh',
    diagnosis: 'Type 2 Diabetes Mellitus',
    prescribed_followup_date: '2026-03-14',
    doctor_notes: 'Metformin 500mg BD initiated. Diet counseling given.',
    status: 'completed'
  },
  {
    consultation_id: 'TC-2026-109',
    patient_id: 'P109',
    consultation_date: '2026-02-17',
    doctor_id: 'DOC-02',
    doctor_name: 'Dr. Vivek Singh',
    diagnosis: 'Hypertension Stage 2',
    prescribed_followup_date: '2026-03-17',
    doctor_notes: 'Amlodipine 10mg prescribed. Scheduled for review.',
    status: 'completed'
  },
  {
    consultation_id: 'TC-2026-110',
    patient_id: 'P110',
    consultation_date: '2026-02-20',
    doctor_id: 'DOC-02',
    doctor_name: 'Dr. Vivek Singh',
    diagnosis: 'Type 2 Diabetes',
    prescribed_followup_date: '2026-03-20',
    doctor_notes: 'Metformin 500mg OD. Routine monthly review.',
    status: 'completed'
  },
  {
    consultation_id: 'TC-2026-111',
    patient_id: 'P111',
    consultation_date: '2026-02-22',
    doctor_id: 'DOC-01',
    doctor_name: 'Dr. Rajesh Varma',
    diagnosis: 'Hypertension with Hyperlipidemia',
    prescribed_followup_date: '2026-03-22',
    doctor_notes: 'Telmisartan 40mg + Atorvastatin 10mg. Lipid profile review next visit.',
    status: 'completed'
  }
  // P112 intentionally has NO teleconsultation record (Care Breakpoint: Teleconsultation!)
];

export const SAMPLE_PRESCRIPTIONS: Prescription[] = [
  {
    prescription_id: 'RX-2026-001',
    consultation_id: 'TC-2026-101',
    patient_id: 'P101',
    prescription_date: '2026-01-12',
    medication_names: 'Tab Amlodipine 5mg',
    dosage_schedule: '1 tablet once daily in the morning',
    days_supply: 30
  },
  {
    prescription_id: 'RX-2026-002',
    consultation_id: 'TC-2026-102',
    patient_id: 'P102',
    prescription_date: '2026-01-16',
    medication_names: 'Tab Telmisartan 40mg, Tab Metformin 500mg',
    dosage_schedule: 'Telmisartan 1 OD morning, Metformin 1 BD after meals',
    days_supply: 30
  },
  {
    prescription_id: 'RX-2026-003',
    consultation_id: 'TC-2026-103',
    patient_id: 'P103',
    prescription_date: '2026-01-20',
    medication_names: 'Tab Metformin 1000mg, Tab Glimepiride 1mg',
    dosage_schedule: 'Metformin 1 BD, Glimepiride 1 OD before breakfast',
    days_supply: 30
  },
  {
    prescription_id: 'RX-2026-004',
    consultation_id: 'TC-2026-104',
    patient_id: 'P104',
    prescription_date: '2026-01-24',
    medication_names: 'Tab Amlodipine 5mg',
    dosage_schedule: '1 tablet once daily morning',
    days_supply: 30
  },
  {
    prescription_id: 'RX-2026-005',
    consultation_id: 'TC-2026-105',
    patient_id: 'P105',
    prescription_date: '2026-02-03',
    medication_names: 'Tab Telmisartan 40mg, Tab Metformin 500mg',
    dosage_schedule: 'Telmisartan 1 OD, Metformin 1 BD',
    days_supply: 30
  },
  {
    prescription_id: 'RX-2026-007',
    consultation_id: 'TC-2026-107',
    patient_id: 'P107',
    prescription_date: '2026-02-10',
    medication_names: 'Tab Telmisartan 40mg, Tab Amlodipine 5mg',
    dosage_schedule: 'Telmisartan 1 OD, Amlodipine 1 OD',
    days_supply: 30
  },
  {
    prescription_id: 'RX-2026-008',
    consultation_id: 'TC-2026-108',
    patient_id: 'P108',
    prescription_date: '2026-02-14',
    medication_names: 'Tab Metformin 500mg',
    dosage_schedule: '1 tablet twice daily after meals',
    days_supply: 30
  },
  {
    prescription_id: 'RX-2026-009',
    consultation_id: 'TC-2026-109',
    patient_id: 'P109',
    prescription_date: '2026-02-17',
    medication_names: 'Tab Amlodipine 10mg',
    dosage_schedule: '1 tablet once daily morning',
    days_supply: 30
  },
  {
    prescription_id: 'RX-2026-010',
    consultation_id: 'TC-2026-110',
    patient_id: 'P110',
    prescription_date: '2026-02-20',
    medication_names: 'Tab Metformin 500mg',
    dosage_schedule: '1 tablet once daily after meals',
    days_supply: 30
  },
  {
    prescription_id: 'RX-2026-011',
    consultation_id: 'TC-2026-111',
    patient_id: 'P111',
    prescription_date: '2026-02-22',
    medication_names: 'Tab Telmisartan 40mg, Tab Atorvastatin 10mg',
    dosage_schedule: 'Telmisartan 1 OD, Atorvastatin 1 HS',
    days_supply: 30
  }
];

export const SAMPLE_MEDICINE_DISPENSING: MedicineDispense[] = [
  {
    dispense_id: 'DSP-2026-001',
    prescription_id: 'RX-2026-001',
    patient_id: 'P101',
    dispense_date: '2026-01-12',
    facility_id: 'HWC-RAMPUR-01',
    items_dispensed: 'Amlodipine 5mg (30 tabs)',
    dispense_status: 'fully_dispensed'
  },
  {
    dispense_id: 'DSP-2026-002',
    prescription_id: 'RX-2026-002',
    patient_id: 'P102',
    dispense_date: '2026-01-17',
    facility_id: 'HWC-RAMPUR-01',
    items_dispensed: 'Telmisartan 40mg (14 tabs) - Metformin STOCKOUT',
    dispense_status: 'partially_dispensed' // Care Breakpoint: Medicine!
  },
  {
    dispense_id: 'DSP-2026-003',
    prescription_id: 'RX-2026-003',
    patient_id: 'P103',
    dispense_date: '2026-01-20',
    facility_id: 'HWC-RAMPUR-01',
    items_dispensed: 'Metformin 1000mg (60 tabs), Glimepiride 1mg (30 tabs)',
    dispense_status: 'fully_dispensed'
  },
  {
    dispense_id: 'DSP-2026-004',
    prescription_id: 'RX-2026-004',
    patient_id: 'P104',
    dispense_date: '2026-01-25',
    facility_id: 'HWC-RAMPUR-01',
    items_dispensed: 'Amlodipine 5mg (30 tabs)',
    dispense_status: 'fully_dispensed'
  },
  {
    dispense_id: 'DSP-2026-005',
    prescription_id: 'RX-2026-005',
    patient_id: 'P105',
    dispense_date: '2026-02-03',
    facility_id: 'HWC-RAMPUR-01',
    items_dispensed: 'Stockout reported at Sub-Centre counter',
    dispense_status: 'stockout'
  },
  {
    dispense_id: 'DSP-2026-007',
    prescription_id: 'RX-2026-007',
    patient_id: 'P107',
    dispense_date: '2026-02-11',
    facility_id: 'HWC-KALYANPUR-02',
    items_dispensed: 'Telmisartan 40mg (30 tabs), Amlodipine 5mg (30 tabs)',
    dispense_status: 'fully_dispensed'
  },
  {
    dispense_id: 'DSP-2026-008',
    prescription_id: 'RX-2026-008',
    patient_id: 'P108',
    dispense_date: '2026-02-14',
    facility_id: 'HWC-KALYANPUR-02',
    items_dispensed: 'Metformin 500mg (60 tabs)',
    dispense_status: 'fully_dispensed'
  },
  {
    dispense_id: 'DSP-2026-009',
    prescription_id: 'RX-2026-009',
    patient_id: 'P109',
    dispense_date: '2026-02-18',
    facility_id: 'PHC-SHIVGARH-01',
    items_dispensed: 'Amlodipine 10mg (30 tabs)',
    dispense_status: 'fully_dispensed'
  },
  {
    dispense_id: 'DSP-2026-010',
    prescription_id: 'RX-2026-010',
    patient_id: 'P110',
    dispense_date: '2026-02-21',
    facility_id: 'PHC-SHIVGARH-01',
    items_dispensed: 'Metformin 500mg (30 tabs)',
    dispense_status: 'fully_dispensed'
  },
  {
    dispense_id: 'DSP-2026-011',
    prescription_id: 'RX-2026-011',
    patient_id: 'P111',
    dispense_date: '2026-02-23',
    facility_id: 'CHC-BALRAMPUR-HQ',
    items_dispensed: 'Telmisartan 40mg (30 tabs), Atorvastatin 10mg (30 tabs)',
    dispense_status: 'fully_dispensed'
  }
];

export const SAMPLE_MEDICINE_STOCK: MedicineStockStatus[] = [
  {
    facility_id: 'HWC-RAMPUR-01',
    medicine_name: 'Tab Amlodipine 5mg',
    stock_level: 450,
    reorder_threshold: 200,
    stock_status: 'adequate'
  },
  {
    facility_id: 'HWC-RAMPUR-01',
    medicine_name: 'Tab Telmisartan 40mg',
    stock_level: 60,
    reorder_threshold: 150,
    stock_status: 'low'
  },
  {
    facility_id: 'HWC-RAMPUR-01',
    medicine_name: 'Tab Metformin 500mg',
    stock_level: 0,
    reorder_threshold: 300,
    stock_status: 'stockout'
  },
  {
    facility_id: 'HWC-RAMPUR-01',
    medicine_name: 'Tab Glimepiride 1mg',
    stock_level: 180,
    reorder_threshold: 100,
    stock_status: 'adequate'
  },
  {
    facility_id: 'HWC-KALYANPUR-02',
    medicine_name: 'Tab Amlodipine 5mg',
    stock_level: 320,
    reorder_threshold: 150,
    stock_status: 'adequate'
  },
  {
    facility_id: 'HWC-KALYANPUR-02',
    medicine_name: 'Tab Metformin 500mg',
    stock_level: 520,
    reorder_threshold: 200,
    stock_status: 'adequate'
  },
  {
    facility_id: 'PHC-SHIVGARH-01',
    medicine_name: 'Tab Telmisartan 40mg',
    stock_level: 800,
    reorder_threshold: 400,
    stock_status: 'adequate'
  },
  {
    facility_id: 'CHC-BALRAMPUR-HQ',
    medicine_name: 'Tab Atorvastatin 10mg',
    stock_level: 1200,
    reorder_threshold: 500,
    stock_status: 'adequate'
  }
];

export const SAMPLE_LAB_TESTS: LabTest[] = [
  {
    test_id: 'LAB-2026-001',
    patient_id: 'P101',
    consultation_id: 'TC-2026-101',
    test_type: 'Serum Creatinine',
    ordered_date: '2026-01-12',
    sample_collected_date: '2026-01-14',
    result_date: '2026-01-16',
    result_value: '0.9 mg/dL (Normal)',
    test_status: 'completed'
  },
  {
    test_id: 'LAB-2026-002',
    patient_id: 'P102',
    consultation_id: 'TC-2026-102',
    test_type: 'HbA1c',
    ordered_date: '2026-01-16',
    sample_collected_date: null,
    result_date: null,
    result_value: null,
    test_status: 'overdue' // Lab test overdue!
  },
  {
    test_id: 'LAB-2026-003',
    patient_id: 'P103',
    consultation_id: 'TC-2026-103',
    test_type: 'Fasting Blood Glucose',
    ordered_date: '2026-01-20',
    sample_collected_date: '2026-01-22',
    result_date: '2026-01-23',
    result_value: '198 mg/dL (Elevated)',
    test_status: 'completed'
  },
  {
    test_id: 'LAB-2026-004',
    patient_id: 'P104',
    consultation_id: 'TC-2026-104',
    test_type: 'Lipid Profile',
    ordered_date: '2026-01-24',
    sample_collected_date: '2026-01-26',
    result_date: '2026-01-28',
    result_value: 'Total Cholesterol 185 mg/dL (Desirable)',
    test_status: 'completed'
  },
  {
    test_id: 'LAB-2026-005',
    patient_id: 'P105',
    consultation_id: 'TC-2026-105',
    test_type: 'HbA1c',
    ordered_date: '2026-02-03',
    sample_collected_date: null,
    result_date: null,
    result_value: null,
    test_status: 'overdue'
  },
  {
    test_id: 'LAB-2026-007',
    patient_id: 'P107',
    consultation_id: 'TC-2026-107',
    test_type: 'Urine Albumin Creatinine Ratio (uACR)',
    ordered_date: '2026-02-10',
    sample_collected_date: '2026-02-13',
    result_date: '2026-02-16',
    result_value: '84 mg/g (Microalbuminuria)',
    test_status: 'completed'
  },
  {
    test_id: 'LAB-2026-008',
    patient_id: 'P108',
    consultation_id: 'TC-2026-108',
    test_type: 'Fasting Blood Glucose',
    ordered_date: '2026-02-14',
    sample_collected_date: '2026-02-16',
    result_date: '2026-02-17',
    result_value: '154 mg/dL',
    test_status: 'completed'
  },
  {
    test_id: 'LAB-2026-011',
    patient_id: 'P111',
    consultation_id: 'TC-2026-111',
    test_type: 'Lipid Profile',
    ordered_date: '2026-02-22',
    sample_collected_date: '2026-02-24',
    result_date: '2026-02-26',
    result_value: 'LDL 142 mg/dL',
    test_status: 'completed'
  }
];

export const SAMPLE_FOLLOWUP_VISITS: FollowupVisit[] = [
  {
    visit_id: 'VIS-2026-001',
    patient_id: 'P101',
    scheduled_date: '2026-02-12',
    actual_date: '2026-02-12',
    facility_id: 'HWC-RAMPUR-01',
    visit_type: 'Monthly NCD Refill & BP Review',
    visit_status: 'completed'
  },
  {
    visit_id: 'VIS-2026-002',
    patient_id: 'P102',
    scheduled_date: '2026-02-16',
    actual_date: null,
    facility_id: 'HWC-RAMPUR-01',
    visit_type: 'Monthly NCD Follow-Up',
    visit_status: 'missed' // Missed follow-up!
  },
  {
    visit_id: 'VIS-2026-003',
    patient_id: 'P103',
    scheduled_date: '2026-02-20',
    actual_date: null,
    facility_id: 'HWC-RAMPUR-01',
    visit_type: 'Diabetic Glycemic Monitoring',
    visit_status: 'missed' // Missed follow-up!
  },
  {
    visit_id: 'VIS-2026-004',
    patient_id: 'P104',
    scheduled_date: '2026-02-24',
    actual_date: '2026-02-25',
    facility_id: 'HWC-RAMPUR-01',
    visit_type: 'Hypertension Follow-Up',
    visit_status: 'completed'
  },
  {
    visit_id: 'VIS-2026-005',
    patient_id: 'P105',
    scheduled_date: '2026-03-03',
    actual_date: null,
    facility_id: 'HWC-RAMPUR-01',
    visit_type: 'Dual NCD Review',
    visit_status: 'pending'
  },
  {
    visit_id: 'VIS-2026-006',
    patient_id: 'P106',
    scheduled_date: '2026-03-07',
    actual_date: '2026-03-06',
    facility_id: 'HWC-RAMPUR-01',
    visit_type: 'Lifestyle Review',
    visit_status: 'completed'
  },
  {
    visit_id: 'VIS-2026-007',
    patient_id: 'P107',
    scheduled_date: '2026-03-10',
    actual_date: null,
    facility_id: 'HWC-KALYANPUR-02',
    visit_type: 'Renal Protection Review',
    visit_status: 'missed'
  },
  {
    visit_id: 'VIS-2026-008',
    patient_id: 'P108',
    scheduled_date: '2026-03-14',
    actual_date: '2026-03-14',
    facility_id: 'HWC-KALYANPUR-02',
    visit_type: 'Diabetic Follow-up',
    visit_status: 'completed'
  },
  {
    visit_id: 'VIS-2026-009',
    patient_id: 'P109',
    scheduled_date: '2026-03-17',
    actual_date: null,
    facility_id: 'PHC-SHIVGARH-01',
    visit_type: 'BP Assessment',
    visit_status: 'missed'
  },
  {
    visit_id: 'VIS-2026-010',
    patient_id: 'P110',
    scheduled_date: '2026-03-20',
    actual_date: '2026-03-20',
    facility_id: 'PHC-SHIVGARH-01',
    visit_type: 'Metformin Refill',
    visit_status: 'completed'
  },
  {
    visit_id: 'VIS-2026-011',
    patient_id: 'P111',
    scheduled_date: '2026-03-22',
    actual_date: '2026-03-23',
    facility_id: 'CHC-BALRAMPUR-HQ',
    visit_type: 'Cardio Follow-up',
    visit_status: 'completed'
  }
];

export const SAMPLE_VISIT_HISTORY: VisitHistory[] = [
  {
    history_id: 'HIS-001',
    patient_id: 'P101',
    event_type: 'Screening Registration',
    event_date: '2026-01-10',
    facility_id: 'HWC-RAMPUR-01',
    notes: 'Enrolled in Comprehensive Primary Health Care NCD cohort.'
  },
  {
    history_id: 'HIS-002',
    patient_id: 'P101',
    event_type: 'Teleconsultation Completed',
    event_date: '2026-01-12',
    facility_id: 'HWC-RAMPUR-01',
    notes: 'Prescribed Amlodipine 5mg OD.'
  },
  {
    history_id: 'HIS-003',
    patient_id: 'P101',
    event_type: 'Follow-Up Attended',
    event_date: '2026-02-12',
    facility_id: 'HWC-RAMPUR-01',
    notes: 'BP controlled at 128/82. Prescription refilled for 30 days.'
  },
  {
    history_id: 'HIS-004',
    patient_id: 'P102',
    event_type: 'Screening Registration',
    event_date: '2026-01-14',
    facility_id: 'HWC-RAMPUR-01',
    notes: 'Severe elevated blood pressure & random blood sugar.'
  },
  {
    history_id: 'HIS-005',
    patient_id: 'P102',
    event_type: 'Stockout Event',
    event_date: '2026-01-17',
    facility_id: 'HWC-RAMPUR-01',
    notes: 'Metformin out of stock; patient dispensed only Telmisartan.'
  },
  {
    history_id: 'HIS-006',
    patient_id: 'P102',
    event_type: 'Missed Follow-Up',
    event_date: '2026-02-16',
    facility_id: 'HWC-RAMPUR-01',
    notes: 'Scheduled follow-up date elapsed without attendance.'
  },
  {
    history_id: 'HIS-007',
    patient_id: 'P103',
    event_type: 'Screening Registration',
    event_date: '2026-01-18',
    facility_id: 'HWC-RAMPUR-01',
    notes: 'Symptomatic hyperglycemia detected.'
  },
  {
    history_id: 'HIS-008',
    patient_id: 'P103',
    event_type: 'Missed Follow-Up',
    event_date: '2026-02-20',
    facility_id: 'HWC-RAMPUR-01',
    notes: 'Failed to report for scheduled 30-day glycemic check.'
  }
];

export const SAMPLE_OUTREACH_ACTIONS: OutreachAction[] = [
  {
    action_id: 'ACT-2026-001',
    patient_id: 'P101',
    asha_id: 'ASHA-01',
    action_date: '2026-02-10',
    action_type: 'call',
    contact_outcome: 'answered',
    kestrel_stage: 1,
    notes: 'Pre-due follow-up reminder delivered. Patient confirmed attendance for 12 Feb.'
  },
  {
    action_id: 'ACT-2026-002',
    patient_id: 'P102',
    asha_id: 'ASHA-01',
    action_date: '2026-02-17',
    action_type: 'call',
    contact_outcome: 'no_answer',
    kestrel_stage: 2,
    notes: 'Call attempted at 10:30 AM. Rang until timeout without answer.'
  },
  {
    action_id: 'ACT-2026-003',
    patient_id: 'P102',
    asha_id: 'ASHA-01',
    action_date: '2026-02-19',
    action_type: 'call',
    contact_outcome: 'no_answer',
    kestrel_stage: 3,
    notes: 'Second call attempted at 4:45 PM. Phone switched off / no response.'
  },
  {
    action_id: 'ACT-2026-004',
    patient_id: 'P103',
    asha_id: 'ASHA-01',
    action_date: '2026-02-22',
    action_type: 'call',
    contact_outcome: 'no_answer',
    kestrel_stage: 2,
    notes: 'First call attempt after missed appointment. No answer.'
  },
  {
    action_id: 'ACT-2026-005',
    patient_id: 'P103',
    asha_id: 'ASHA-01',
    action_date: '2026-02-24',
    action_type: 'call',
    contact_outcome: 'no_answer',
    kestrel_stage: 3,
    notes: 'Second call attempt. Continuous no answer. Escalated to ASHA Alert.'
  },
  {
    action_id: 'ACT-2026-006',
    patient_id: 'P107',
    asha_id: 'ASHA-02',
    action_date: '2026-03-12',
    action_type: 'call',
    contact_outcome: 'unavailable',
    kestrel_stage: 2,
    notes: 'Spoke with son; patient in fields. Requested callback.'
  },
  {
    action_id: 'ACT-2026-007',
    patient_id: 'P107',
    asha_id: 'ASHA-02',
    action_date: '2026-03-15',
    action_type: 'call',
    contact_outcome: 'no_answer',
    kestrel_stage: 3,
    notes: 'No response to second outreach call.'
  }
];

export const SAMPLE_EPISODE_OUTCOMES: EpisodeOutcome[] = [
  {
    episode_id: 'EP-2026-001',
    patient_id: 'P101',
    outcome_date: '2026-02-12',
    outcome_status: 'care_restored',
    care_breakpoint_resolved: 'Scheduled Follow-Up Completed & Medication Refilled',
    verified_by: 'CHO Priya Sharma'
  },
  {
    episode_id: 'EP-2026-004',
    patient_id: 'P104',
    outcome_date: '2026-02-25',
    outcome_status: 'care_restored',
    care_breakpoint_resolved: 'Attended Follow-up Visit and Monitored BP',
    verified_by: 'CHO Priya Sharma'
  },
  {
    episode_id: 'EP-2026-006',
    patient_id: 'P106',
    outcome_date: '2026-03-06',
    outcome_status: 'care_restored',
    care_breakpoint_resolved: 'Follow-Up Attended & BP Normalized',
    verified_by: 'CHO Priya Sharma'
  },
  {
    episode_id: 'EP-2026-010',
    patient_id: 'P110',
    outcome_date: '2026-03-20',
    outcome_status: 'care_restored',
    care_breakpoint_resolved: 'Metformin Dispensed & Follow-up Verified',
    verified_by: 'Dr. Vivek Singh'
  },
  {
    episode_id: 'EP-2026-011',
    patient_id: 'P111',
    outcome_date: '2026-03-23',
    outcome_status: 'care_restored',
    care_breakpoint_resolved: 'Follow-up Attended & Lipid Targets Reviewed',
    verified_by: 'Dr. Rajesh Varma'
  }
];

export const SAMPLE_DATA_DICTIONARY: DataDictionaryEntry[] = [
  { table_name: 'patient_360_reference', column_name: 'patient_id', data_type: 'VARCHAR(32)', description: 'Canonical patient identifier unique across health blocks' },
  { table_name: 'patient_360_reference', column_name: 'abha_id', data_type: 'VARCHAR(20)', description: 'Ayushman Bharat Health Account (ABHA) 14-digit identifier' },
  { table_name: 'patient_360_reference', column_name: 'name', data_type: 'VARCHAR(100)', description: 'Full name of enrolled patient' },
  { table_name: 'patient_360_reference', column_name: 'age', data_type: 'INTEGER', description: 'Patient chronological age in years' },
  { table_name: 'patient_360_reference', column_name: 'gender', data_type: 'VARCHAR(10)', description: 'Biological sex: M, F, or Other' },
  { table_name: 'patient_360_reference', column_name: 'lfu_risk_tier_k7', data_type: 'VARCHAR(20)', description: 'Competition target risk tier: Low, Medium, High, Critical' },
  { table_name: 'teleconsultations', column_name: 'consultation_id', data_type: 'VARCHAR(32)', description: 'eSanjeevani / HWC teleconsultation unique session identifier' },
  { table_name: 'ncd_screening', column_name: 'systolic_bp', data_type: 'INTEGER', description: 'Systolic blood pressure measured in mm Hg' },
  { table_name: 'ncd_screening', column_name: 'random_blood_sugar', data_type: 'INTEGER', description: 'Point-of-care glucometer blood glucose in mg/dL' },
  { table_name: 'prescriptions', column_name: 'medication_names', data_type: 'TEXT', description: 'Prescribed pharmacological agents with strengths' },
  { table_name: 'medicine_dispensing', column_name: 'dispense_status', data_type: 'VARCHAR(20)', description: 'Dispensation status: fully_dispensed, partially_dispensed, stockout' },
  { table_name: 'lab_tests', column_name: 'test_status', data_type: 'VARCHAR(20)', description: 'Diagnostic workflow status: ordered, sample_collected, completed, overdue' },
  { table_name: 'followup_visits', column_name: 'visit_status', data_type: 'VARCHAR(20)', description: 'Care adherence status: completed, missed, pending, rescheduled' },
  { table_name: 'outreach_actions', column_name: 'contact_outcome', data_type: 'VARCHAR(20)', description: 'Contact outcome: answered, no_answer, unavailable, declined, failed' },
  { table_name: 'episode_outcomes', column_name: 'outcome_status', data_type: 'VARCHAR(20)', description: 'Episode resolution: care_restored, active_followup, lost_to_followup' }
];

export const SAMPLE_DATASET_INVENTORY: DatasetInventoryEntry[] = [
  { file_name: 'patient_360_reference.csv', file_size_kb: 48, row_count: 12, primary_key: 'patient_id', foreign_keys: 'facility_id, assigned_asha_id' },
  { file_name: 'teleconsultations.csv', file_size_kb: 32, row_count: 11, primary_key: 'consultation_id', foreign_keys: 'patient_id, doctor_id' },
  { file_name: 'ncd_screening.csv', file_size_kb: 36, row_count: 12, primary_key: 'screening_id', foreign_keys: 'patient_id' },
  { file_name: 'prescriptions.csv', file_size_kb: 28, row_count: 10, primary_key: 'prescription_id', foreign_keys: 'consultation_id, patient_id' },
  { file_name: 'medicine_dispensing.csv', file_size_kb: 24, row_count: 10, primary_key: 'dispense_id', foreign_keys: 'prescription_id, patient_id' },
  { file_name: 'medicine_stock_status.csv', file_size_kb: 16, row_count: 8, primary_key: 'facility_id, medicine_name', foreign_keys: 'facility_id' },
  { file_name: 'lab_tests.csv', file_size_kb: 22, row_count: 8, primary_key: 'test_id', foreign_keys: 'patient_id, consultation_id' },
  { file_name: 'followup_visits.csv', file_size_kb: 26, row_count: 11, primary_key: 'visit_id', foreign_keys: 'patient_id, facility_id' },
  { file_name: 'visit_history.csv', file_size_kb: 20, row_count: 8, primary_key: 'history_id', foreign_keys: 'patient_id, facility_id' },
  { file_name: 'outreach_actions.csv', file_size_kb: 18, row_count: 7, primary_key: 'action_id', foreign_keys: 'patient_id, asha_id' },
  { file_name: 'episode_outcomes.csv', file_size_kb: 14, row_count: 5, primary_key: 'episode_id', foreign_keys: 'patient_id' },
  { file_name: 'facility_reference.csv', file_size_kb: 12, row_count: 4, primary_key: 'facility_id', foreign_keys: 'block' },
  { file_name: 'geography_reference.csv', file_size_kb: 8, row_count: 3, primary_key: 'block_id', foreign_keys: 'district_name' },
  { file_name: 'data_dictionary.csv', file_size_kb: 15, row_count: 15, primary_key: 'table_name, column_name', foreign_keys: 'none' },
  { file_name: 'dataset_inventory.csv', file_size_kb: 10, row_count: 15, primary_key: 'file_name', foreign_keys: 'none' },
  { file_name: 'submission_template_linkage.csv', file_size_kb: 14, row_count: 12, primary_key: 'source_record_id', foreign_keys: 'canonical_patient_id' },
  { file_name: 'submission_template_episode_prediction.csv', file_size_kb: 12, row_count: 12, primary_key: 'patient_id', foreign_keys: 'lfu_risk_tier_k7' },
  { file_name: 'submission_template_action_queue.csv', file_size_kb: 14, row_count: 12, primary_key: 'patient_id', foreign_keys: 'kestrel_stage, priority' },
  { file_name: 'README.md', file_size_kb: 6, row_count: 95, primary_key: 'none', foreign_keys: 'none' }
];

export const DEMO_USERS = [
  {
    id: 'USER-ASHA-01',
    name: 'Sunita Devi',
    email: 'asha@ruralhealth.gov.in',
    role: 'ASHA' as const,
    title: 'Accredited Social Health Activist (ASHA)',
    facilityId: 'HWC-RAMPUR-01',
    facilityName: 'Ayushman Arogya Mandir Rampur',
    block: 'Rampur',
    district: 'Balrampur'
  },
  {
    id: 'USER-CHO-01',
    name: 'Priya Sharma',
    email: 'cho@ruralhealth.gov.in',
    role: 'CHO' as const,
    title: 'Community Health Officer (CHO)',
    facilityId: 'HWC-RAMPUR-01',
    facilityName: 'Ayushman Arogya Mandir Rampur',
    block: 'Rampur',
    district: 'Balrampur'
  },
  {
    id: 'USER-DOC-01',
    name: 'Dr. Rajesh Varma',
    email: 'doctor@ruralhealth.gov.in',
    role: 'DOCTOR' as const,
    title: 'Medical Officer / Teleconsultant',
    facilityId: 'CHC-BALRAMPUR-HQ',
    facilityName: 'Community Health Centre Balrampur',
    block: 'Balrampur Sadar',
    district: 'Balrampur'
  },
  {
    id: 'USER-ADMIN-01',
    name: 'Dr. Arvind Saxena',
    email: 'admin@ruralhealth.gov.in',
    role: 'DISTRICT_ADMIN' as const,
    title: 'Chief Medical Officer / District Health Lead',
    facilityId: 'DISTRICT-HQ-BALRAMPUR',
    facilityName: 'Balrampur District Health Society',
    block: 'All Blocks',
    district: 'Balrampur'
  }
];
