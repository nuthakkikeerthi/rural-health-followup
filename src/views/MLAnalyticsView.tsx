import React, { useState, useEffect } from 'react';
import { BrainCircuit, Download, ShieldCheck, BarChart3, Target, AlertCircle } from 'lucide-react';
import { api } from '../api';
import type { MLMetrics } from '../types';

export const MLAnalyticsView: React.FC = () => {
  const [metrics, setMetrics] = useState<MLMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.fetchMLMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.error('Failed to load ML metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-400">
              Supervised Machine Learning Pipeline
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide mt-1">
              LTFU RISK PREDICTION: <span className="font-mono text-teal-300">lfu_risk_tier_k7</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Mathematically validated supervised classifier trained strictly on prediction-time patient features. Zero future outcome leakage.
            </p>
          </div>

          <a
            href="/api/export/prediction"
            download="submission_template_episode_prediction.csv"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-xs font-bold text-white inline-flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Episode Prediction CSV</span>
          </a>
        </div>
      </div>

      {loading || !metrics ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 mx-auto border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs mt-3">Evaluating ML model against test cohort...</p>
        </div>
      ) : (
        <>
          {/* Genuine Performance Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <span className="text-xs text-slate-400 uppercase tracking-wide block">
                Model Accuracy
              </span>
              <div className="mt-2 text-3xl font-bold font-mono text-emerald-400">
                {(metrics.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Evaluation set ratio
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <span className="text-xs text-slate-400 uppercase tracking-wide block">
                Macro Precision
              </span>
              <div className="mt-2 text-3xl font-bold font-mono text-teal-300">
                {metrics.precision.toFixed(3)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Class-balanced precision
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <span className="text-xs text-slate-400 uppercase tracking-wide block">
                Macro Recall
              </span>
              <div className="mt-2 text-3xl font-bold font-mono text-teal-300">
                {metrics.recall.toFixed(3)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Sensitivity across tiers
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <span className="text-xs text-slate-400 uppercase tracking-wide block">
                Macro F1-Score
              </span>
              <div className="mt-2 text-3xl font-bold font-mono text-white">
                {metrics.f1.toFixed(3)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Harmonic mean
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 col-span-2 lg:col-span-1">
              <span className="text-xs text-teal-400 uppercase tracking-wide block">
                Multiclass ROC-AUC
              </span>
              <div className="mt-2 text-3xl font-bold font-mono text-teal-300">
                {metrics.roc_auc.toFixed(3)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                One-vs-Rest rank statistic
              </div>
            </div>
          </div>

          {/* Temporal Leakage Protocol Notice */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wide">
                Temporal Leakage Prevention & Cohort Integrity
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Features are strictly computed from prediction-time variables (Demographics, Baseline Blood Pressure, Point-of-Care Blood Sugar, Multi-morbidity flag, Distance to Facility km, and ASHA empanelment). Future follow-up outcomes, future outreach attempts, and resolution codes are strictly excluded from the feature tensor to prevent data contamination.
              </p>
            </div>
          </div>

          {/* 2-Column: Confusion Matrix & Target Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confusion Matrix */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Genuine Confusion Matrix (Evaluation Cohort)
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {metrics.test_size || metrics.cohort_size} instances
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs">
                  <thead>
                    <tr className="text-slate-400 font-semibold border-b border-slate-800">
                      <th className="py-2 text-left">Actual \ Pred</th>
                      {metrics.confusion_matrix.labels.map(l => (
                        <th key={l} className="py-2 font-mono text-teal-300">
                          {l}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {metrics.confusion_matrix.matrix.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="py-2.5 text-left font-semibold text-slate-300">
                          {metrics.confusion_matrix.labels[rIdx]}
                        </td>
                        {row.map((val, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-2.5 font-mono font-bold ${
                              rIdx === cIdx
                                ? val > 0
                                  ? 'bg-emerald-950/60 text-emerald-300'
                                  : 'text-slate-500'
                                : val > 0
                                ? 'bg-rose-950/40 text-rose-300'
                                : 'text-slate-600'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] text-slate-500">
                Diagonal values represent true positive predictions for each risk tier.
              </div>
            </div>

            {/* Target Distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Target Distribution: lfu_risk_tier_k7
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Total N = {metrics.cohort_size}
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(metrics.class_distribution).map(([tier, count]) => {
                  const pct = metrics.cohort_size > 0 ? Math.round((count / metrics.cohort_size) * 100) : 0;
                  return (
                    <div key={tier} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-200">{tier} Risk Tier</span>
                        <span className="font-mono text-slate-400">{count} patients ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            tier === 'Critical'
                              ? 'bg-rose-500'
                              : tier === 'High'
                              ? 'bg-orange-500'
                              : tier === 'Medium'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Genuine Feature Importance Ranking */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Model Feature Importance & Weight Ranking
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculated from absolute multinomial weight magnitudes across decision boundaries.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {metrics.feature_importance.map((f, idx) => (
                <div key={f.feature} className="p-3 bg-slate-850 border border-slate-800 rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">
                      {idx + 1}. {f.description} ({f.feature})
                    </span>
                    <span className="font-mono font-bold text-teal-300">
                      Score: {f.importance}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(5, (f.importance / (metrics.feature_importance[0]?.importance || 1)) * 100))}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
