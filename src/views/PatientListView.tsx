import React, { useState, useMemo } from 'react';
import { Search, Filter, Phone, UserCheck, ShieldAlert, Award, ArrowUpDown } from 'lucide-react';
import type { PatientSummary } from '../types';

interface PatientListViewProps {
  patients: PatientSummary[];
  onSelectPatient: (patientId: string) => void;
  onCallPatient: (patient: PatientSummary) => void;
  onRecordIntervention: (patient: PatientSummary) => void;
}

export const PatientListView: React.FC<PatientListViewProps> = ({
  patients,
  onSelectPatient,
  onCallPatient,
  onRecordIntervention
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [breakpointFilter, setBreakpointFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all, active, restored, alerted

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      // Search match
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        p.patient_id.toLowerCase().includes(query) ||
        p.abha_id.toLowerCase().includes(query) ||
        p.contact_number.includes(query) ||
        p.chronic_conditions.toLowerCase().includes(query);

      // Risk match
      const matchesRisk = riskFilter === 'all' || p.lfu_risk_tier_k7 === riskFilter;

      // Breakpoint match
      const matchesBreakpoint =
        breakpointFilter === 'all' ||
        (breakpointFilter === 'none' && !p.care_breakpoint) ||
        p.care_breakpoint?.stage === breakpointFilter;

      // Status match
      let matchesStatus = true;
      if (statusFilter === 'restored') matchesStatus = !!p.care_restored;
      else if (statusFilter === 'alerted') matchesStatus = !!p.has_open_alert;
      else if (statusFilter === 'active_gap') matchesStatus = !p.care_restored && !!p.care_breakpoint;

      return matchesSearch && matchesRisk && matchesBreakpoint && matchesStatus;
    });
  }, [patients, searchTerm, riskFilter, breakpointFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Continuum Patient Registry & Follow-Up Queue
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time patient adherence monitoring, care breakpoint triage, and outreach intervention queue.
            </p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            Total Matching: <strong className="text-white font-mono">{filteredPatients.length}</strong> / {patients.length}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, ABHA, phone..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-teal-500"
            />
          </div>

          {/* Risk Tier Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500"
            >
              <option value="all">All LTFU Risk Tiers</option>
              <option value="Critical">Critical Risk</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          {/* Breakpoint Filter */}
          <div>
            <select
              value={breakpointFilter}
              onChange={e => setBreakpointFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500"
            >
              <option value="all">All Care Breakpoints</option>
              <option value="Screening">Screening Gap</option>
              <option value="Teleconsultation">Teleconsultation Gap</option>
              <option value="Prescription">Prescription Gap</option>
              <option value="Medicine">Medicine Stockout</option>
              <option value="Test">Diagnostic Test Overdue</option>
              <option value="Follow-up">Missed Follow-up</option>
              <option value="Outreach">Unreachable Outreach</option>
              <option value="none">No Breakpoint (Adherent)</option>
            </select>
          </div>

          {/* Episode Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500"
            >
              <option value="all">All Episode Statuses</option>
              <option value="active_gap">Active Care Gaps Only</option>
              <option value="alerted">Has Open ASHA Alert 🔴</option>
              <option value="restored">Care Restored Verified 🟢</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Patient Profile</th>
                <th className="py-3 px-3">Conditions</th>
                <th className="py-3 px-3">LTFU Risk Tier</th>
                <th className="py-3 px-3">Care Breakpoint</th>
                <th className="py-3 px-3">CCI-7 Score</th>
                <th className="py-3 px-3">Kestrel Ladder</th>
                <th className="py-3 px-3">Assigned ASHA</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No patients match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map(pat => (
                  <tr
                    key={pat.patient_id}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => onSelectPatient(pat.patient_id)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white text-sm">
                        {pat.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {pat.patient_id} · ABHA: {pat.abha_id}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {pat.age} yrs · {pat.gender === 'F' ? 'Female' : 'Male'} · {pat.block}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-teal-300 font-medium text-xs block">
                        {pat.chronic_conditions}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Dist: {pat.distance_to_facility_km ?? 3} km to facility
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border inline-block ${
                          pat.lfu_risk_tier_k7 === 'Critical'
                            ? 'bg-rose-950/70 text-rose-300 border-rose-800'
                            : pat.lfu_risk_tier_k7 === 'High'
                            ? 'bg-orange-950/70 text-orange-300 border-orange-800'
                            : pat.lfu_risk_tier_k7 === 'Medium'
                            ? 'bg-amber-950/70 text-amber-300 border-amber-800'
                            : 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {pat.lfu_risk_tier_k7}
                      </span>
                      {pat.risk_confidence && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          conf: {Math.round(pat.risk_confidence * 100)}%
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      {pat.care_restored ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          🟢 Care Restored
                        </span>
                      ) : pat.care_breakpoint ? (
                        <div>
                          <span className="font-semibold text-amber-300">
                            {pat.care_breakpoint.stage}
                          </span>
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {pat.care_breakpoint.evidence}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">None (Adherent)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-mono font-medium">
                      <span
                        className={`${
                          (pat.cci_score || 0) >= 80
                            ? 'text-emerald-400'
                            : (pat.cci_score || 0) >= 60
                            ? 'text-teal-400'
                            : (pat.cci_score || 0) >= 40
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {pat.cci_score ?? 'N/A'}
                      </span>
                      <span className="text-slate-500 text-[10px]"> / 100</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-medium text-slate-200">
                        Stage {pat.kestrel_stage || 1}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {pat.kestrel_priority || 'Routine'}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-slate-300">{pat.assigned_asha_name}</div>
                      <div className="text-[10px] text-slate-500">{pat.facility_id}</div>
                    </td>

                    <td
                      className="py-3.5 px-4 text-right space-x-2"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onCallPatient(pat)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded text-teal-400 text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onRecordIntervention(pat)}
                        className="px-2.5 py-1 bg-teal-800 hover:bg-teal-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Field Visit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
