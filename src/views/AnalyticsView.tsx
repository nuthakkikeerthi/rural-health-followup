import React from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Users,
  Building2,
  PhoneCall,
  Activity
} from 'lucide-react';
import type { AnalyticsSummary, User } from '../types';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary | null;
  user: User;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, user }) => {
  if (!analytics) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 mx-auto border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs mt-3">Compiling continuity analytics...</p>
      </div>
    );
  }

  const isDistrictAdmin = user.role === 'DISTRICT_ADMIN';

  // Risk distribution
  const riskEntries = Object.entries(analytics.risk_distribution || {});
  const totalRiskPatients = riskEntries.reduce((acc, [, val]) => acc + val, 0) || 1;

  // Care breakpoint distribution
  const breakpointEntries = Object.entries(analytics.care_breakpoints || {});
  const totalBreakpoints = breakpointEntries.reduce((acc, [, val]) => acc + val, 0) || 1;

  // Outreach outcomes
  const outreachEntries = Object.entries(analytics.outreach_outcomes || {});
  const totalOutreach = outreachEntries.reduce((acc, [, val]) => acc + val, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Continuity Analytics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isDistrictAdmin
                ? 'Aggregate performance across all facilities in District Balrampur.'
                : `Operational indicators for ${user.facilityName} (${user.block}).`}
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Active Cohort: <strong className="text-slate-900 font-mono tabular-nums">{analytics.total_patients}</strong>
          </div>
        </div>
      </div>

      {/* Top Level Operational KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>Continuity Index (CCI)</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {analytics.avg_cci}/100
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            District average score
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>Care Restored Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {analytics.care_restored_rate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {analytics.care_restored_count} verified resolutions
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>Follow-Up Completion</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-teal-700 tabular-nums">
            {analytics.followup_completion_rate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Target: &gt; 80% monthly
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>Active Alerts</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600 tabular-nums">
            {analytics.open_alerts}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Pending ASHA field visits
          </div>
        </div>
      </div>

      {/* 2 Key Visual Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: LTFU Risk Distribution */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              LTFU Risk Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Patients categorized by loss-to-follow-up probability
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {riskEntries.map(([tier, count]) => {
              const pct = Math.round((count / totalRiskPatients) * 100);
              const colorClass =
                tier === 'Critical'
                  ? 'bg-rose-500'
                  : tier === 'High'
                  ? 'bg-amber-500'
                  : tier === 'Medium'
                  ? 'bg-teal-500'
                  : 'bg-slate-400';

              return (
                <div key={tier} className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-slate-700">Risk: {tier}</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorClass}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Care Breakpoint Distribution */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Care Breakpoint Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detected stage at which patients experienced continuity disruption
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {breakpointEntries.map(([stage, count]) => {
              const pct = Math.round((count / totalBreakpoints) * 100);

              return (
                <div key={stage} className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-slate-700">{stage}</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Facility Level Performance Trends (District Admin / Aggregate View) */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Facility Performance Comparison
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuity metrics and restoration rates across health centres
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Facility</th>
                <th className="px-3 py-3">Block</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Enrolled</th>
                <th className="px-3 py-3">Care Restored</th>
                <th className="px-3 py-3">Restoration Rate</th>
                <th className="px-4 py-3 text-right">Avg CCI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {analytics.facility_comparisons?.map(fac => (
                <tr key={fac.facility_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {fac.facility_name}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {fac.block}
                  </td>
                  <td className="px-3 py-3 text-slate-500">
                    {fac.facility_type}
                  </td>
                  <td className="px-3 py-3 font-mono tabular-nums text-slate-800">
                    {fac.patient_count}
                  </td>
                  <td className="px-3 py-3 font-mono tabular-nums text-emerald-700 font-semibold">
                    {fac.care_restored_count}
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-900 tabular-nums">
                    {fac.restored_rate}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-teal-700 tabular-nums">
                    {fac.avg_cci}/100
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
