import React, { useState, useMemo } from 'react';
import { Search, Users, Phone, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import type { PatientSummary } from '../types';

interface PatientsDirectoryViewProps {
  patients: PatientSummary[];
  onSelectPatient: (patientId: string) => void;
  onCallPatient: (patient: PatientSummary) => void;
  onRecordIntervention: (patient: PatientSummary) => void;
}

export const PatientsDirectoryView: React.FC<PatientsDirectoryViewProps> = ({
  patients,
  onSelectPatient,
  onCallPatient,
  onRecordIntervention
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');

  const filtered = useMemo(() => {
    return patients.filter(p => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.patient_id.toLowerCase().includes(q) ||
        p.abha_id.toLowerCase().includes(q) ||
        p.contact_number.includes(q) ||
        p.block.toLowerCase().includes(q);

      const matchCondition =
        conditionFilter === 'all' ||
        p.chronic_conditions.toLowerCase().includes(conditionFilter.toLowerCase());

      return matchSearch && matchCondition;
    });
  }, [patients, searchTerm, conditionFilter]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Patient Directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive registry of enrolled NCD patients across the catchment area.
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Total Enrolled: <strong className="text-slate-900 font-mono tabular-nums">{patients.length}</strong>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by patient name, ID, ABHA number, or village..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-teal-600 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <select
              value={conditionFilter}
              onChange={e => setConditionFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:border-teal-600 focus:bg-white"
            >
              <option value="all">All Chronic Conditions</option>
              <option value="hypertension">Hypertension</option>
              <option value="diabetes">Diabetes Mellitus</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Patient Name / Demographic</th>
                <th className="px-3 py-3">ABHA & Identification</th>
                <th className="px-3 py-3">Chronic Condition</th>
                <th className="px-3 py-3">Assigned Staff</th>
                <th className="px-3 py-3">Care Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(p => (
                <tr key={p.patient_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => onSelectPatient(p.patient_id)}
                      className="text-left group"
                    >
                      <div className="font-semibold text-slate-900 group-hover:text-teal-700">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.age} yrs · {p.gender === 'F' ? 'Female' : 'Male'} · {p.block}
                      </div>
                    </button>
                  </td>

                  <td className="px-3 py-3.5">
                    <div className="font-mono text-xs text-slate-800">
                      {p.patient_id}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {p.abha_id}
                    </div>
                  </td>

                  <td className="px-3 py-3.5">
                    <span className="font-medium text-slate-800">
                      {p.chronic_conditions}
                    </span>
                  </td>

                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <div className="font-medium text-slate-800">
                      {p.assigned_asha_name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {p.facility_id}
                    </div>
                  </td>

                  <td className="px-3 py-3.5 whitespace-nowrap">
                    {p.care_restored ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Care Restored</span>
                      </span>
                    ) : p.has_open_alert ? (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>ASHA Alert</span>
                      </span>
                    ) : (
                      <span className="text-slate-600 font-medium">
                        {p.care_breakpoint ? `${p.care_breakpoint.stage} Gap` : 'On Track'}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectPatient(p.patient_id)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-md transition-colors"
                      >
                        View Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => onCallPatient(p)}
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 rounded-md transition-colors"
                        title="Call patient"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
