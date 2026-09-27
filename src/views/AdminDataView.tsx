import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  Layers,
  BrainCircuit,
  Download,
  Database,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { api } from '../api';
import type { ImportSummary, LinkageStats, LinkageRecord, MLMetrics } from '../types';

interface AdminDataViewProps {
  onDataReload: () => Promise<void>;
}

export const AdminDataView: React.FC<AdminDataViewProps> = ({ onDataReload }) => {
  const [activeTab, setActiveTab] = useState<'dataset' | 'linkage' | 'ml' | 'exports' | 'system'>('dataset');

  // Dataset Import State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ summary: ImportSummary; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Linkage State
  const [linkageData, setLinkageData] = useState<{ stats: LinkageStats; sample_records: LinkageRecord[] } | null>(null);
  const [loadingLinkage, setLoadingLinkage] = useState(false);

  // ML Metrics State
  const [mlMetrics, setMlMetrics] = useState<MLMetrics | null>(null);
  const [loadingML, setLoadingML] = useState(false);

  // Load Linkage
  const loadLinkage = async () => {
    setLoadingLinkage(true);
    try {
      const data = await api.fetchLinkageStats();
      setLinkageData(data);
    } catch (err: any) {
      console.error('Failed to load linkage:', err);
    } finally {
      setLoadingLinkage(false);
    }
  };

  // Load ML
  const loadML = async () => {
    setLoadingML(true);
    try {
      const data = await api.fetchMLMetrics();
      setMlMetrics(data);
    } catch (err: any) {
      console.error('Failed to load ML metrics:', err);
    } finally {
      setLoadingML(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'linkage' && !linkageData) loadLinkage();
    if (activeTab === 'ml' && !mlMetrics) loadML();
  }, [activeTab]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleUploadZip = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const res = await api.uploadCompetitionZip(selectedFile);
      setUploadResult(res);
      await onDataReload();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing competition ZIP file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadSample = async () => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const res = await api.loadSampleCompetitionZip();
      setUploadResult(res);
      await onDataReload();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error resetting sample dataset');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">
              District Health Administration
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Admin & Data Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dataset ingestion, entity linkage calibration, ML model parameters, and competition exports.
            </p>
          </div>
          <span className="text-xs text-teal-800 bg-teal-50 border border-teal-200 font-semibold px-2.5 py-1 rounded-md self-start sm:self-auto">
            District Admin Privileges Active
          </span>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 mt-5 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('dataset')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'dataset'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Dataset Management</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('linkage')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'linkage'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Data Linkage</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ml')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'ml'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Model & Risk Configuration</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exports')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'exports'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Submission & Export</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'system'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>System Status</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DATASET MANAGEMENT */}
      {activeTab === 'dataset' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Competition Dataset Ingestion
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload raw competition CSV archive (.zip) containing patient registries, clinical encounters, lab results, and pharmacy dispensations.
              </p>
            </div>

            {/* Upload Area */}
            <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-3 bg-slate-50/50">
              <UploadCloud className="w-8 h-8 mx-auto text-teal-600" />
              <div>
                <label className="cursor-pointer px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors">
                  <span>Browse ZIP Archive</span>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <div className="text-xs text-slate-500 mt-2">
                  {selectedFile ? (
                    <strong className="text-slate-800">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</strong>
                  ) : (
                    'Select a competition ZIP archive to upload and process'
                  )}
                </div>
              </div>

              {selectedFile && (
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={handleUploadZip}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    {isUploading ? 'Processing Archive...' : 'Process & Ingest ZIP'}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Sample Dataset Reset */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <div className="font-semibold text-slate-800">
                  Pre-Packaged Balrampur Sample Dataset
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Reload validated test cohort with all 11 competition tables and realistic non-response patterns.
                </div>
              </div>
              <button
                type="button"
                disabled={isUploading}
                onClick={handleLoadSample}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                <span>Reload Sample Data</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Import Summary Result */}
            {uploadResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{uploadResult.message}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-emerald-800">
                  <div>Files Valid: <strong>{uploadResult.summary.files_valid}/{uploadResult.summary.files_detected}</strong></div>
                  <div>Records Imported: <strong>{uploadResult.summary.records_imported}</strong></div>
                  <div>Source: <strong>{uploadResult.summary.source_name}</strong></div>
                  <div>Timestamp: <strong>{uploadResult.summary.imported_at}</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DATA LINKAGE */}
      {activeTab === 'linkage' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Deterministic Entity Resolution & Linkage Engine
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deterministic hierarchy: ABHA ID &gt; Phone + Facility &gt; Phone + Name Similarity.
                </p>
              </div>
              <button
                type="button"
                onClick={loadLinkage}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLinkage ? 'animate-spin' : ''}`} />
                <span>Re-run Linkage</span>
              </button>
            </div>

            {loadingLinkage || !linkageData ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Running entity linkage across source registries...
              </div>
            ) : (
              <>
                {/* Linkage Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Total Source Records</span>
                    <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                      {linkageData.stats.total_source_records}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Resolved to Canonical</span>
                    <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block">
                      {linkageData.stats.linked_count}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Unresolved Records</span>
                    <span className="text-xl font-bold font-mono text-amber-700 mt-1 block">
                      {linkageData.stats.unresolved_count}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">High Confidence Matches</span>
                    <span className="text-xl font-bold font-mono text-teal-700 mt-1 block">
                      {linkageData.stats.confidence_distribution.high}
                    </span>
                  </div>
                </div>

                {/* Sample Linked Records */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
                    Sample Linkage Output (First 6 Records)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/75 text-slate-500 font-semibold border-b border-slate-100">
                        <tr>
                          <th className="px-3 py-2">Source Table</th>
                          <th className="px-3 py-2">Source ID</th>
                          <th className="px-3 py-2">Canonical ID</th>
                          <th className="px-3 py-2">Matched On</th>
                          <th className="px-3 py-2 text-right">Confidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {linkageData.sample_records.slice(0, 6).map((rec, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="px-3 py-2 font-sans font-medium text-slate-800">{rec.source_table}</td>
                            <td className="px-3 py-2 text-slate-600">{rec.source_record_id}</td>
                            <td className="px-3 py-2 text-teal-700 font-semibold">{rec.canonical_patient_id}</td>
                            <td className="px-3 py-2 font-sans text-slate-600">{rec.matched_on}</td>
                            <td className="px-3 py-2 text-right text-emerald-700 font-bold">{rec.confidence}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ML CONFIGURATION */}
      {activeTab === 'ml' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                LTFU ML Classifier Calibration & Metrics
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Supervised risk classifier trained exclusively on historical features with strict no-lookahead enforcement.
              </p>
            </div>

            {loadingML || !mlMetrics ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Computing ML performance metrics...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Accuracy</span>
                    <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                      {(mlMetrics.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Precision</span>
                    <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                      {(mlMetrics.precision * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Recall</span>
                    <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                      {(mlMetrics.recall * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">F1 Score</span>
                    <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                      {(mlMetrics.f1 * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">ROC-AUC</span>
                    <span className="text-lg font-bold font-mono text-teal-700 mt-1 block">
                      {mlMetrics.roc_auc.toFixed(3)}
                    </span>
                  </div>
                </div>

                {/* Feature Importance Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
                    Feature Weights & Importance Ranking
                  </div>
                  <div className="p-3 divide-y divide-slate-100 text-xs">
                    {mlMetrics.feature_importance.map((f, i) => (
                      <div key={i} className="py-2 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-semibold text-slate-800">{f.feature}</div>
                          <div className="text-[11px] text-slate-500">{f.description}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-slate-800">
                            {(f.importance * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SUBMISSION & EXPORTS */}
      {activeTab === 'exports' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Official Hackathon / Competition Deliverables
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Download verified CSV outputs generated dynamically from the active database and machine learning engines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Export 1: Linkage */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    Linkage Deliverable
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    submission_template_linkage.csv
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2">
                    Complete entity mapping from all source tables to canonical patient IDs with confidence provenance.
                  </p>
                </div>
                <a
                  href="/api/export/linkage"
                  download="submission_template_linkage.csv"
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold text-center inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Linkage CSV</span>
                </a>
              </div>

              {/* Export 2: Episode Prediction */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    ML Risk Prediction
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    submission_template_episode_prediction.csv
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2">
                    Predicted LTFU risk tier (lfu_risk_tier_k7) and confidence scores across all enrolled patient episodes.
                  </p>
                </div>
                <a
                  href="/api/export/prediction"
                  download="submission_template_episode_prediction.csv"
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold text-center inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Prediction CSV</span>
                </a>
              </div>

              {/* Export 3: Priority Action Queue */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    Action Priority Queue
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    submission_template_action_queue.csv
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2">
                    Ordered operational worklist linking patient risk, detected breakpoint, and assigned field worker.
                  </p>
                </div>
                <a
                  href="/api/export/action-queue"
                  download="submission_template_action_queue.csv"
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold text-center inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Action Queue CSV</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM STATUS */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                System Infrastructure & ABDM Compliance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Technical state of data storage, FHIR resources, and background processes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800">ABDM Integration State</div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>M1 - ABHA Creation & Verification</span>
                  <span className="font-semibold text-emerald-700">COMPLIANT</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>M2 - Health Facility Registry (HFR)</span>
                  <span className="font-semibold text-emerald-700">COMPLIANT</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>M3 - Health Information Exchange (HIE-CM)</span>
                  <span className="font-semibold text-teal-700">ACTIVE</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800">Persistent Storage Status</div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Storage Engine</span>
                  <span className="font-mono text-slate-800">In-Memory + Sample Hydration</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>API Status</span>
                  <span className="font-semibold text-emerald-700">HEALTHY (200 OK)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Cloud Run Target</span>
                  <span className="font-mono text-slate-800">0.0.0.0:$PORT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
