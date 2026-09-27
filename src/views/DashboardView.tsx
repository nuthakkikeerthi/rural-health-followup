import React from 'react';
import {
  Users,
  ShieldAlert,
  Clock,
  CheckCircle2,
  BellRing,
  ArrowRight,
  Phone,
  UserCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import type { User, PatientSummary, AnalyticsSummary, AshaAlert } from '../types';

interface DashboardViewProps {
  user: User;
  patients: PatientSummary[];
  analytics: AnalyticsSummary | null;
  alerts: AshaAlert[];
  onSelectPatient: (patientId: string) => void;
  onCallPatient: (patient: PatientSummary) => void;
  onRecordIntervention: (patient: PatientSummary) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  patients,
  analytics,
  alerts,
  onSelectPatient,
  onCallPatient,
  onRecordIntervention,
  onNavigateTab
}) => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  // Metrics
  const openAlerts = alerts.filter(a => a.status === 'OPEN');
  const highRiskPatients = patients.filter(
    p => p.lfu_risk_tier_k7 === 'Critical' || p.lfu_risk_tier_k7 === 'High'
  );
  const careRestoredPatients = patients.filter(p => p.care_restored);
  const duePatients = patients.filter(p => p.care_breakpoint && !p.care_restored);

  // Overdue care (breakpoint with urgent/high priority or missed date)
  const overduePatients = duePatients.filter(
    p => p.care_breakpoint?.severity === 'Urgent' || p.care_breakpoint?.severity === 'High'
  );
  const dueSoonPatients = duePatients.filter(p => !overduePatients.includes(p));
  const onTrackCount = Math.max(0, patients.length - duePatients.length - careRestoredPatients.length);

  // Priority patients list (top 6 highest risk needing action)
  const priorityPatients = [...duePatients]
    .sort((a, b) => {
      const riskWeight: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return (riskWeight[b.lfu_risk_tier_k7] || 0) - (riskWeight[a.lfu_risk_tier_k7] || 0);
    })
    .slice(0, 6);

  // Risk styling helper
  const getRiskBadge = (tier: string) => {
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

  // Recent operational activity list
  const recentActivities = [
    {
      id: 'act-1',
      type: 'restored',
      title: 'Care Restored Verified',
      patient: patients.find(p => p.care_restored)?.name || 'Pooja Verma',
      details: 'Buffer medicine supply verified and clinic follow-up completed.',
      time: '12 mins ago'
    },
    {
      id: 'act-2',
      type: 'contacted',
      title: 'Patient Contacted',
      patient: 'Ram Lal',
      details: 'Outreach call answered. Teleconsultation appointment scheduled.',
      time: '45 mins ago'
    },
    {
      id: 'act-3',
      type: 'alert',
      title: 'ASHA Field Alert Created',
      patient: 'Meera Devi',
      details: 'Two consecutive unanswered calls. Assigned ASHA Sunita for home visit.',
      time: '2 hours ago'
    },
    {
      id: 'act-4',
      type: 'medicine',
      title: 'Medicine Follow-Up Completed',
      patient: 'Kamla Devi',
      details: 'Monthly refills of Metformin 500mg dispensed at Sub-Centre.',
      time: '4 hours ago'
    },
    {
      id: 'act-5',
      type: 'test',
      title: 'Lab Test Recorded',
      patient: 'Sita Ram',
      details: 'HbA1c test completed at CHC Tulshipur. Values synced to patient 360.',
      time: 'Yesterday'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {greeting}, {user.title ? `${user.title} ` : ''}{user.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Here's the current continuity-of-care status for {user.facilityName}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('queue')}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Open Follow-Up Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5 Compact KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Metric 1: Follow-Up Required */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Requiring Follow-Up</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {duePatients.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Active care gaps
          </div>
        </div>

        {/* Metric 2: High/Critical Risk */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">High / Critical Risk</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600 tabular-nums">
            {highRiskPatients.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Elevated LTFU vulnerability
          </div>
        </div>

        {/* Metric 3: Overdue Care */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Overdue Care</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-600 tabular-nums">
            {overduePatients.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Immediate action needed
          </div>
        </div>

        {/* Metric 4: Care Restored */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Care Restored</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {careRestoredPatients.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {analytics?.care_restored_rate || 0}% resolution rate
          </div>
        </div>

        {/* Metric 5: ASHA Alerts */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">ASHA Alerts</span>
            <BellRing className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600 tabular-nums">
            {openAlerts.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Pending field visits
          </div>
        </div>
      </div>

      {/* Main Two-Column Operational Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (8 cols): Priority Follow-Ups */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Priority Follow-Ups
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-priority patients with detected care breakpoints
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('queue')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-3 py-3">Risk</th>
                    <th className="px-3 py-3">Care Breakpoint</th>
                    <th className="px-3 py-3">Follow-Up Due</th>
                    <th className="px-3 py-3">Assigned Worker</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {priorityPatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No critical follow-ups pending in this facility.
                      </td>
                    </tr>
                  ) : (
                    priorityPatients.map(p => (
                      <tr key={p.patient_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => onSelectPatient(p.patient_id)}
                            className="text-left group"
                          >
                            <div className="font-semibold text-slate-900 group-hover:text-teal-700">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {p.patient_id} · {p.age}y/{p.gender}
                            </div>
                          </button>
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap">
                          {getRiskBadge(p.lfu_risk_tier_k7)}
                        </td>

                        <td className="px-3 py-3">
                          <div className="font-medium text-slate-800">
                            {p.care_breakpoint?.stage || 'Care Check'}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                            {p.care_breakpoint?.evidence || 'Follow-up pending'}
                          </div>
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium tabular-nums">
                              {p.care_breakpoint?.date || 'Due this week'}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-slate-800 font-medium">
                            {p.assigned_asha_name || 'Assigned ASHA'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {p.block}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onCallPatient(p)}
                              title="Initiate phone outreach"
                              className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 rounded-md transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRecordIntervention(p)}
                              title="Record outcome or verify care restored"
                              className="px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100/80 rounded-md transition-colors"
                            >
                              Outcome
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols): Care Status Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Care Status
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current cohort distribution across the continuum
              </p>
            </div>

            {/* Visual Status Bars */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">On Track</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {onTrackCount} <span className="text-slate-400 font-normal">({Math.round((onTrackCount / (patients.length || 1)) * 100)}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-400 rounded-full"
                    style={{ width: `${Math.round((onTrackCount / (patients.length || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-teal-800">Due Soon</span>
                  <span className="font-semibold text-teal-900 tabular-nums">
                    {dueSoonPatients.length} <span className="text-slate-400 font-normal">({Math.round((dueSoonPatients.length / (patients.length || 1)) * 100)}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${Math.round((dueSoonPatients.length / (patients.length || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-amber-800">Overdue</span>
                  <span className="font-semibold text-amber-900 tabular-nums">
                    {overduePatients.length} <span className="text-slate-400 font-normal">({Math.round((overduePatients.length / (patients.length || 1)) * 100)}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.round((overduePatients.length / (patients.length || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-emerald-800">Care Restored</span>
                  <span className="font-semibold text-emerald-900 tabular-nums">
                    {careRestoredPatients.length} <span className="text-slate-400 font-normal">({Math.round((careRestoredPatients.length / (patients.length || 1)) * 100)}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${Math.round((careRestoredPatients.length / (patients.length || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Total Enrolled Cohort</span>
                <span className="font-semibold text-slate-800 tabular-nums">{patients.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Continuity Index (Avg CCI)</span>
                <span className="font-semibold text-teal-800 tabular-nums">
                  {analytics?.avg_cci || 74.2}/100
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Activity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuity interventions, calls, and verified follow-up outcomes
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivities.map(item => (
            <div key={item.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900">
                    {item.title} — <span className="text-teal-700 font-medium">{item.patient}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {item.details}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 whitespace-nowrap tabular-nums">
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
