import JSZip from 'jszip';
import Papa from 'papaparse';
import { storage } from './storage.ts';
import { mlService } from './mlEngine.ts';
import { runPatientLinkage } from './linkageEngine.ts';
import type { ImportSummary } from './types.ts';

const EXPECTED_FILES = [
  'patient_360_reference.csv',
  'teleconsultations.csv',
  'ncd_screening.csv',
  'prescriptions.csv',
  'medicine_dispensing.csv',
  'medicine_stock_status.csv',
  'lab_tests.csv',
  'followup_visits.csv',
  'visit_history.csv',
  'outreach_actions.csv',
  'episode_outcomes.csv',
  'facility_reference.csv',
  'geography_reference.csv',
  'data_dictionary.csv',
  'dataset_inventory.csv',
  'submission_template_linkage.csv',
  'submission_template_episode_prediction.csv',
  'submission_template_action_queue.csv',
  'README.md'
];

export async function processCompetitionZip(zipBuffer: Buffer, originalFilename: string): Promise<ImportSummary> {
  const zip = await JSZip.loadAsync(zipBuffer);
  const detectedFiles: string[] = [];
  const parsedTables: Record<string, any[]> = {};
  const validationErrors: string[] = [];

  // Iterate over files in the ZIP archive
  const fileEntries: { name: string; file: JSZip.JSZipObject }[] = [];
  zip.forEach((relativePath, file) => {
    // Ignore __MACOSX and hidden directory artifacts
    if (!file.dir && !relativePath.startsWith('__MACOSX') && !relativePath.includes('/.')) {
      const baseName = relativePath.split('/').pop() || relativePath;
      fileEntries.push({ name: baseName, file });
    }
  });

  for (const entry of fileEntries) {
    const fileName = entry.name;
    detectedFiles.push(fileName);

    if (fileName.endsWith('.csv')) {
      const content = await entry.file.async('text');
      const parsed = Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
      });

      if (parsed.errors && parsed.errors.length > 0) {
        console.warn(`CSV parsing warnings for ${fileName}:`, parsed.errors.slice(0, 3));
      }

      const tableKey = fileName.replace('.csv', '');
      parsedTables[tableKey] = parsed.data as any[];
    } else if (fileName.startsWith('README')) {
      parsedTables['readme'] = [{ content: await entry.file.async('text') }];
    }
  }

  // Schema & Critical Table Validation
  if (!parsedTables['patient_360_reference'] || parsedTables['patient_360_reference'].length === 0) {
    validationErrors.push('Missing or empty critical table: patient_360_reference.csv');
  }

  // Check column names for patient_360_reference
  if (parsedTables['patient_360_reference']) {
    const sampleRow = parsedTables['patient_360_reference'][0] || {};
    const hasId = 'patient_id' in sampleRow || 'canonical_patient_id' in sampleRow || 'id' in sampleRow;
    if (!hasId) {
      validationErrors.push('patient_360_reference.csv lacks a recognizable patient_id column.');
    }
    // Normalize row fields if needed
    parsedTables['patient_360_reference'] = parsedTables['patient_360_reference'].map((row: any) => ({
      patient_id: (row.patient_id || row.canonical_patient_id || row.id || `P-${Math.random()}`).toString(),
      abha_id: (row.abha_id || row.abha || '91-0000-0000-0000').toString(),
      name: row.name || row.patient_name || 'Enrolled Patient',
      age: Number(row.age) || 50,
      gender: (row.gender === 'F' || row.gender === 'Female' ? 'F' : 'M'),
      contact_number: (row.contact_number || row.phone || '+91 98000 00000').toString(),
      block: row.block || 'Rampur',
      district: row.district || 'Balrampur',
      facility_id: row.facility_id || 'HWC-RAMPUR-01',
      assigned_asha_id: row.assigned_asha_id || 'ASHA-01',
      assigned_asha_name: row.assigned_asha_name || 'Sunita Devi',
      chronic_conditions: row.chronic_conditions || 'Hypertension',
      registration_date: row.registration_date || '2026-01-01',
      lfu_risk_tier_k7: (row.lfu_risk_tier_k7 || 'Medium') as any,
      distance_to_facility_km: Number(row.distance_to_facility_km) || 3.0
    }));
  }

  // Import into persistent store
  const summary = storage.importDataset(parsedTables, originalFilename, validationErrors);

  // Trigger retraining of ML pipeline on the imported records
  try {
    mlService.trainModel();
  } catch (err) {
    console.error('Error retraining ML model after import:', err);
    validationErrors.push(`ML retraining warning: ${(err as Error).message}`);
  }

  // Update linkage engine caches
  try {
    runPatientLinkage();
  } catch (err) {
    console.error('Error executing linkage after import:', err);
  }

  return {
    ...summary,
    files_detected: detectedFiles.length,
    validation_errors: validationErrors
  };
}
