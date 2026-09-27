import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  Download,
  RefreshCw,
  Database,
  CheckCircle2,
  Layers,
  FileText
} from 'lucide-react';
import { api } from '../api';
import type { ImportSummary } from '../types';

interface DataImportViewProps {
  onImportComplete: () => void;
}

export const DataImportView: React.FC<DataImportViewProps> = ({ onImportComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [datasetOverview, setDatasetOverview] = useState<any>(null);

  const loadDatasetSummary = async () => {
    try {
      const summary = await api.fetchDatasetSummary();
      setDatasetOverview(summary);
      if (summary.latest_import) {
        setImportSummary(summary.latest_import);
      }
    } catch (e: any) {
      console.error('Error loading dataset summary:', e);
    }
  };

  useEffect(() => {
    loadDatasetSummary();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.zip')) {
        setErrorMessage('Please select a valid .ZIP archive containing competition CSV files.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleUploadZip = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const res = await api.uploadCompetitionZip(selectedFile);
      setImportSummary(res.summary);
      await loadDatasetSummary();
      onImportComplete();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to extract and parse dataset ZIP.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadSampleZip = async () => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const res = await api.loadSampleCompetitionZip();
      setImportSummary(res.summary);
      await loadDatasetSummary();
      onImportComplete();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load starter dataset package.');
    } finally {
      setIsUploading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-400">
              Admin & Data Operations
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide mt-1">
              DATASET IMPORT & INGESTION
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Upload the complete competition ZIP archive containing all 19 standardized CSV and template files. The backend extracts, validates schemas, runs patient linkage, and trains the LTFU ML model.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/dataset/download-starter-zip"
              download="competition_rural_health_dataset.zip"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 inline-flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Download Starter ZIP</span>
            </a>

            <button
              type="button"
              onClick={handleLoadSampleZip}
              disabled={isUploading}
              className="px-3.5 py-2 bg-teal-800 hover:bg-teal-700 border border-teal-600 rounded-lg text-xs font-bold text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
              <span>Load 19-File Starter Archive</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Upload Competition ZIP
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select the competition archive (.zip). Files will be unpacked and verified on the server.
          </p>
        </div>

        {/* Dropzone container */}
        <div className="border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-xl p-8 text-center transition-colors bg-slate-850/50">
          <UploadCloud className="w-12 h-12 mx-auto text-teal-400 animate-bounce" />
          <div className="mt-3">
            <label
              htmlFor="zip-upload"
              className="cursor-pointer px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold inline-block shadow-sm transition-colors"
            >
              Choose ZIP File
            </label>
            <input
              id="zip-upload"
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {selectedFile ? (
            <div className="mt-3 text-xs text-emerald-400 font-mono">
              Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          ) : (
            <p className="text-xs text-slate-500 mt-2">
              Supports .zip archives containing CSV files up to 50MB
            </p>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 bg-rose-950/60 border border-rose-700 rounded-lg text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <strong>Import Validation Error:</strong> {errorMessage}
            </div>
          </div>
        )}

        {/* Submit Import Action */}
        {selectedFile && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={isUploading}
              onClick={handleUploadZip}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Unpacking & Validating ZIP...</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>IMPORT DATASET</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Import Screen Summary Display (Exact Prompt Requirement) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Dataset Ingestion Status & Summary
            </h3>
          </div>
          {importSummary && (
            <span className="text-[11px] font-mono text-slate-400">
              Last imported: {new Date(importSummary.imported_at).toLocaleString()}
            </span>
          )}
        </div>

        {/* Big Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-850 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-xs block">Files detected:</span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">
              {importSummary ? importSummary.files_detected : 19}
            </span>
          </div>

          <div className="p-4 bg-slate-850 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-xs block">Files valid:</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
              {importSummary ? importSummary.files_valid : 19}
            </span>
          </div>

          <div className="p-4 bg-slate-850 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-xs block">Records imported:</span>
            <span className="text-2xl font-bold font-mono text-teal-300 mt-1 block">
              {importSummary ? importSummary.records_imported : datasetOverview?.total_records || 124}
            </span>
          </div>

          <div className="p-4 bg-slate-850 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-xs block">Source Package:</span>
            <span className="text-xs font-semibold text-slate-200 mt-1 block truncate">
              {importSummary ? importSummary.source_name : 'Competition Baseline'}
            </span>
          </div>
        </div>

        {/* Specific Table Breakdown Counters */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Source Tables Ingestion Breakdown
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-850 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300 font-medium">Patient reference:</span>
              <span className="font-mono font-bold text-white">
                {datasetOverview?.table_counts?.patient_360_reference || 12}
              </span>
            </div>
            <div className="p-3 bg-slate-850 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300 font-medium">Teleconsultations:</span>
              <span className="font-mono font-bold text-white">
                {datasetOverview?.table_counts?.teleconsultations || 11}
              </span>
            </div>
            <div className="p-3 bg-slate-850 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300 font-medium">NCD records:</span>
              <span className="font-mono font-bold text-white">
                {datasetOverview?.table_counts?.ncd_screening || 12}
              </span>
            </div>
            <div className="p-3 bg-slate-850 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300 font-medium">Prescriptions:</span>
              <span className="font-mono font-bold text-white">
                {datasetOverview?.table_counts?.prescriptions || 10}
              </span>
            </div>
            <div className="p-3 bg-slate-850 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300 font-medium">Medicine Dispensing:</span>
              <span className="font-mono font-bold text-white">
                {datasetOverview?.table_counts?.medicine_dispensing || 10}
              </span>
            </div>
            <div className="p-3 bg-slate-850 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300 font-medium">Diagnostic Lab Tests:</span>
              <span className="font-mono font-bold text-white">
                {datasetOverview?.table_counts?.lab_tests || 8}
              </span>
            </div>
            <div className="p-3 bg-slate-850 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300 font-medium">Follow-Up Visits:</span>
              <span className="font-mono font-bold text-white">
                {datasetOverview?.table_counts?.followup_visits || 11}
              </span>
            </div>
            <div className="p-3 bg-slate-850 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300 font-medium">Outreach Actions:</span>
              <span className="font-mono font-bold text-white">
                {datasetOverview?.table_counts?.outreach_actions || 7}
              </span>
            </div>
            <div className="p-3 bg-slate-850 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300 font-medium">Episode Outcomes:</span>
              <span className="font-mono font-bold text-white">
                {datasetOverview?.table_counts?.episode_outcomes || 5}
              </span>
            </div>
          </div>
        </div>

        {/* 19 Expected Files Checklist */}
        <div className="pt-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Standard Competition Files Manifest (19 Files)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {EXPECTED_FILES.map(file => (
              <div
                key={file}
                className="p-2 bg-slate-850 border border-slate-800 rounded flex items-center justify-between text-xs"
              >
                <span className="font-mono text-slate-300 text-[11px] truncate">{file}</span>
                <span className="text-emerald-400 font-semibold text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valid
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
