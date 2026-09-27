import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Phone,
  UserCheck,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle2
} from 'lucide-react';
import type { PatientSummary } from '../types';

interface FollowUpQueueViewProps {
  patients: PatientSummary[];
  onSelectPatient: (patientId: string) => void;
  onCallPatient: (patient: PatientSummary) => void;
  onRecordIntervention: (patient: PatientSummary) => void;
}

export const FollowUpQueueView: React.FC<FollowUpQueueViewProps> = ({
  patients,
  onSelectPatient,
  onCallPatient,
  onRecordIntervention
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [breakpointFilter, setBreakpointFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workerFilter, setWorkerFilter] = useState<string>('all');

  // Unique list of assigned workers for filter
  const workers = useMemo(() => {
    const list = Array.from(new Set(patients.map(p => p.assigned_asha_name).filter(Boolean)));
    return list.sort();
  }, [patients]);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      // Search
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.patient_id.toLowerCase().includes(q) ||
        p.contact_number.includes(q) ||
        p.chronic_conditions.toLowerCase().includes(q);

      // Risk Filter
      let matchesRisk = true;
      if (riskFilter !== 'all') {
        matchesRisk = p.lfu_risk_tier_k7 === riskFilter;
      }

      // Breakpoint Filter
      let matchesBreakpoint = true;
      if (breakpointFilter !== 'all') {
        if (breakpointFilter === 'none') {
          matchesBreakpoint = !p.care_breakpoint;
        } else {
          matchesBreakpoint = p.care_breakpoint?.stage === breakpointFilter;
        }
      }

      // Status Filter
      let matchesStatus = true;
      if (statusFilter === 'overdue') {
        matchesStatus = !p.care_restored && (p.care_breakpoint?.severity === 'Urgent' || p.care_breakpoint?.severity === 'High');
      } else if (statusFilter === 'due_soon') {
        matchesStatus = !p.care_restored && !!p.care_breakpoint && p.care_breakpoint?.severity !== 'Urgent' && p.care_breakpoint?.severity !== 'High';
      } else if (statusFilter === 'restored') {
        matchesStatus = !!p.care_restored;
      } else if (statusFilter === 'alerted') {
        matchesStatus = !!p.has_open_alert;
      }

      // Worker Filter
      let matchesWorker = true;
      if (workerFilter !== 'all') {
        matchesWorker = p.assigned_asha_name === workerFilter;
      }

      return matchesSearch && matchesRisk && matchesBreakpoint && matchesStatus && matchesWorker;
    });
  }, [patients, searchTerm, riskFilter, breakpointFilter, statusFilter, workerFilter]);

  const getRiskDisplay = (tier: string) => {
    switch (tier) {
      case 'Critical':
        return <span className="font-semibold text-rose-700">Risk: Critical</span>;
      case 'High':
        return <span className="font-semibold text-amber-700">Risk: High</span>;
      case 'Medium':
        return <span className="font-medium text-slate-700">Risk: Moderate</span>;
      default:
        return <span className="text-slate-500">Risk: Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Follow-Up Queue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Patients requiring the next care action.
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Showing <strong className="text-slate-900 font-mono tabular-nums">{filteredPatients.length}</strong> of {patients.length} patients
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, phone..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-teal-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Risk */}
          <div>
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:border-teal-600 focus:bg-white"
            >
              <option value="all">All Risk Levels</option>
              <option value="Critical">Risk: Critical</option>
              <option value="High">Risk: High</option>
              <option value="Medium">Risk: Moderate</option>
              <option value="Low">Risk: Low</option>
            </select>
          </div>

          {/* Care Breakpoint */}
          <div>
            <select
              value={breakpointFilter}
              onChange={e => setBreakpointFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:border-teal-600 focus:bg-white"
            >
              <option value="all">All Care Breakpoints</option>
              <option value="Screening">Screening Gap</option>
              <option value="Teleconsultation">Teleconsultation Gap</option>
              <option value="Prescription">Prescription Gap</option>
              <option value="Medicine">Medicine Stockout</option>
              <option value="Test">Lab Test Overdue</option>
              <option value="Follow-up">Missed Follow-Up</option>
              <option value="none">No Breakpoint (Adherent)</option>
            </select>
          </div>

          {/* Due Status */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:border-teal-600 focus:bg-white"
            >
              <option value="all">All Due Statuses</option>
              <option value="overdue">Overdue Care</option>
              <option value="due_soon">Due Soon</option>
              <option value="alerted">Active ASHA Alert</option>
              <option value="restored">Care Restored Verified</option>
            </select>
          </div>

          {/* Assigned Worker */}
          <div>
            <select
              value={workerFilter}
              onChange={e => setWorkerFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:border-teal-600 focus:bg-white"
            >
              <option value="all">All Assigned Workers</option>
              {workers.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Patient ID / Name</th>
                <th className="px-3 py-3">Risk Tier</th>
                <th className="px-3 py-3">Care Breakpoint</th>
                <th className="px-3 py-3">Next Action</th>
                <th className="px-3 py-3">Due Date</th>
                <th className="px-3 py-3">Assigned ASHA/CHO</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No patients match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map(p => {
                  const isRestored = !!p.care_restored;
                  const isOverdue = !isRestored && (p.care_breakpoint?.severity === 'Urgent' || p.care_breakpoint?.severity === 'High');

                  return (
                    <tr
                      key={p.patient_id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Patient Name / ID */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => onSelectPatient(p.patient_id)}
                          className="text-left group block"
                        >
                          <div className="font-semibold text-slate-900 group-hover:text-teal-700">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {p.patient_id} · {p.age}y/{p.gender} · {p.chronic_conditions}
                          </div>
                        </button>
                      </td>

                      {/* Risk Tier */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {getRiskDisplay(p.lfu_risk_tier_k7)}
                        {p.has_open_alert && (
                          <div className="text-[10px] text-rose-600 font-medium flex items-center gap-1 mt-0.5">
                            <AlertCircle className="w-3 h-3" />
                            <span>Open Alert</span>
                          </div>
                        )}
                      </td>

                      {/* Care Breakpoint */}
                      <td className="px-3 py-3.5">
                        {isRestored ? (
                          <div className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Care Restored</span>
                          </div>
                        ) : p.care_breakpoint ? (
                          <div>
                            <div className="font-medium text-slate-800">
                              {p.care_breakpoint.stage}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[170px]" title={p.care_breakpoint.evidence}>
                              {p.care_breakpoint.evidence}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">None (Adherent)</span>
                        )}
                      </td>

                      {/* Next Action */}
                      <td className="px-3 py-3.5">
                        <div className="text-slate-700 text-xs truncate max-w-[200px]" title={p.care_breakpoint?.next_required_action || 'Routine monthly continuity review'}>
                          {p.care_breakpoint?.next_required_action || 'Routine monthly continuity review'}
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600 font-medium'}`}>
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="tabular-nums">
                            {p.care_breakpoint?.date || 'Monthly check'}
                          </span>
                        </div>
                      </td>

                      {/* Assigned ASHA/CHO */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {p.assigned_asha_name || 'Unassigned'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {p.block}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectPatient(p.patient_id)}
                            title="View patient profile"
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onCallPatient(p)}
                            title="Call patient"
                            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-md transition-colors flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-teal-600" />
                            <span>Call</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onRecordIntervention(p)}
                            title="Record outcome or field verification"
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors shadow-xs"
                          >
                            Record Outcome
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
