import { storage } from './storage.ts';
import type { LinkageRecord, LinkageStats } from './types.ts';

export function runPatientLinkage(): { records: LinkageRecord[]; stats: LinkageStats } {
  const canonicalPatients = storage.getPatients();
  const patientIdMap = new Map(canonicalPatients.map(p => [p.patient_id.trim().toLowerCase(), p]));
  const abhaMap = new Map(canonicalPatients.map(p => [p.abha_id.trim().toLowerCase(), p]));
  const phoneToPatients = new Map<string, typeof canonicalPatients>();

  canonicalPatients.forEach(p => {
    const cleanPhone = p.contact_number.replace(/\D/g, '');
    if (cleanPhone) {
      const list = phoneToPatients.get(cleanPhone) || [];
      list.push(p);
      phoneToPatients.set(cleanPhone, list);
    }
  });

  const records: LinkageRecord[] = [];

  const sourceTables = [
    { name: 'ncd_screening', data: storage.getNcdScreenings(), idKey: 'screening_id' },
    { name: 'teleconsultations', data: storage.getTeleconsultations(), idKey: 'consultation_id' },
    { name: 'prescriptions', data: storage.getPrescriptions(), idKey: 'prescription_id' },
    { name: 'medicine_dispensing', data: storage.getMedicineDispensing(), idKey: 'dispense_id' },
    { name: 'lab_tests', data: storage.getLabTests(), idKey: 'test_id' },
    { name: 'followup_visits', data: storage.getFollowupVisits(), idKey: 'visit_id' },
    { name: 'outreach_actions', data: storage.getOutreachActions(), idKey: 'action_id' }
  ];

  for (const src of sourceTables) {
    for (const item of src.data as any[]) {
      const sourceRecordId = item[src.idKey] || `REC-${Math.random().toString(36).substring(7)}`;
      const rawPatientId = (item.patient_id || item.source_patient_id || item.id || '').toString().trim();
      const rawAbha = (item.abha_id || '').toString().trim().toLowerCase();
      const rawPhone = (item.contact_number || item.phone || '').toString().replace(/\D/g, '');

      // 1. Direct Canonical Patient ID match
      if (rawPatientId && patientIdMap.has(rawPatientId.toLowerCase())) {
        const canonical = patientIdMap.get(rawPatientId.toLowerCase())!;
        records.push({
          source_table: src.name,
          source_record_id: sourceRecordId,
          source_patient_identifier: rawPatientId,
          canonical_patient_id: canonical.patient_id,
          linkage_status: 'LINKED',
          confidence: 1.0,
          provenance: 'canonical_patient_id_exact',
          matched_on: `patient_id: ${canonical.patient_id}`
        });
        continue;
      }

      // 2. ABHA ID Match
      if (rawAbha && abhaMap.has(rawAbha)) {
        const canonical = abhaMap.get(rawAbha)!;
        records.push({
          source_table: src.name,
          source_record_id: sourceRecordId,
          source_patient_identifier: rawAbha,
          canonical_patient_id: canonical.patient_id,
          linkage_status: 'LINKED',
          confidence: 0.99,
          provenance: 'abha_health_id_exact',
          matched_on: `abha_id: ${canonical.abha_id}`
        });
        continue;
      }

      // 3. Phone number heuristic
      if (rawPhone && phoneToPatients.has(rawPhone)) {
        const candidates = phoneToPatients.get(rawPhone)!;
        if (candidates.length === 1) {
          records.push({
            source_table: src.name,
            source_record_id: sourceRecordId,
            source_patient_identifier: rawPhone,
            canonical_patient_id: candidates[0].patient_id,
            linkage_status: 'LINKED',
            confidence: 0.92,
            provenance: 'phone_facility_demographic_triplet',
            matched_on: `contact_number: ${rawPhone}`
          });
        } else {
          // Multiple members sharing telephone (Household shared phone) -> Ambiguous
          records.push({
            source_table: src.name,
            source_record_id: sourceRecordId,
            source_patient_identifier: rawPhone,
            canonical_patient_id: candidates[0].patient_id,
            linkage_status: 'AMBIGUOUS',
            confidence: 0.65,
            provenance: 'shared_household_phone_multimatch',
            matched_on: `multiple candidates (${candidates.map(c => c.patient_id).join(',')})`
          });
        }
        continue;
      }

      // 4. Unresolved
      records.push({
        source_table: src.name,
        source_record_id: sourceRecordId,
        source_patient_identifier: rawPatientId || 'unknown',
        canonical_patient_id: 'UNRESOLVED',
        linkage_status: 'UNRESOLVED',
        confidence: 0.0,
        provenance: 'unregistered_catchment_walkin',
        matched_on: 'no matching identifier in canonical registry'
      });
    }
  }

  // Calculate stats
  const total = records.length;
  const linked = records.filter(r => r.linkage_status === 'LINKED').length;
  const unresolved = records.filter(r => r.linkage_status === 'UNRESOLVED').length;
  const ambiguous = records.filter(r => r.linkage_status === 'AMBIGUOUS').length;

  const stats: LinkageStats = {
    total_source_records: total,
    linked_count: linked,
    unresolved_count: unresolved,
    ambiguous_count: ambiguous,
    confidence_distribution: {
      high: records.filter(r => r.confidence >= 0.95).length,
      medium: records.filter(r => r.confidence >= 0.8 && r.confidence < 0.95).length,
      low: records.filter(r => r.confidence < 0.8).length
    }
  };

  return { records, stats };
}
