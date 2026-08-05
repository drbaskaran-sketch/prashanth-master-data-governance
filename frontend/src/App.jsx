import React, { useState } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  Download,
  Building2,
  FolderKanban,
  FileCheck2,
  FileCode2,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Loader2
} from 'lucide-react';

import ExecutiveSummaryModal from './components/ExecutiveSummaryModal';

export default function App() {
  // Form State
  const [branch, setBranch] = useState('Main Branch - Chetpet');
  const [department, setDepartment] = useState('Pharmacy');
  const [masterType, setMasterType] = useState('Auto-detect');
  const [file, setFile] = useState(null);
  
  // UI Flow State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const branches = [
    'Main Branch - Chetpet',
    'Velachery Unit',
    'Chromepet Unit',
    'ECR Unit',
    'All Branches'
  ];

  const departments = [
    'Pharmacy',
    'Stores',
    'Doctors',
    'Laboratory',
    'Radiology',
    'Cardiology',
    'Other Diagnostics',
    'Procedures',
    'Billing Services',
    'Tariffs',
    'Packages',
    'Biomedical',
    'General/Other Masters'
  ];

  const masterTypes = [
    'Auto-detect',
    'Pharmacy Master',
    'Stores & Consumables Master',
    'Doctor Master',
    'Employee Master',
    'Laboratory Test Master',
    'Laboratory Profile Master',
    'Radiology Master',
    'Cardiology Master',
    'Procedure Master',
    'Billing Service Master',
    'Tariff Master',
    'Payer & TPA Master',
    'Bed & Ward Master',
    'Biomedical Equipment Master',
    'General Master'
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrorMsg('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleAnalyse = async () => {
    if (!file) {
      setErrorMsg('Please select or upload an Excel (.xlsx/.xls) or CSV file to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');
    setProgressStep(1);
    setProgressText('Uploading file & detecting format encodings...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('branch', branch);
      formData.append('department', department);
      formData.append('master_type', masterType);

      // Simulated step 2
      setTimeout(() => {
        setProgressStep(2);
        setProgressText('Evaluating universal quality & duplicate detection rules...');
      }, 600);

      // Simulated step 3
      setTimeout(() => {
        setProgressStep(3);
        setProgressText('Applying department-specific validation rule packs...');
      }, 1200);

      // Simulated step 4
      setTimeout(() => {
        setProgressStep(4);
        setProgressText('Generating linked Excel workbook with 10 formatted sheets...');
      }, 1800);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.detail || data.error || 'Failed to analyze file.');
      }

      setTimeout(() => {
        setAnalysisResult(data);
        setIsAnalyzing(false);
      }, 2400);

    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during file analysis.');
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysisResult(null);
    setErrorMsg('');
    setIsAnalyzing(false);
    setProgressStep(0);
  };

  const downloadFile = (url) => {
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 border border-teal-500/30 rounded-xl text-teal-400">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">
                Prashanth Hospital <span className="text-teal-400">Master File Analyzer</span>
              </h1>
              <p className="text-xs text-slate-400">Single Source of Truth Quality Sanitization Engine</p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700">
            <Building2 size={14} className="text-teal-400" />
            <span>{branch}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: LANDING PAGE & UPLOAD FORM (When no result)           */}
        {/* ------------------------------------------------------------- */}
        {!analysisResult && !isAnalyzing && (
          <div className="space-y-6">
            
            {/* Main Landing Banner */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10" />
              
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 mb-4">
                  <Sparkles size={14} />
                  Automated Master Data Inspection
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                  Analyse Hospital Master File
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Upload an Excel or CSV hospital master dataset to automatically identify duplicates, missing fields, formatting errors, and clinical/drug safety risks. Generates an executive summary and downloadable Excel correction workbook.
                </p>
              </div>

              {/* Form Controls */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Branch */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 size={14} className="text-teal-600" />
                    Hospital / Branch
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"
                  >
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FolderKanban size={14} className="text-teal-600" />
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"
                  >
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Master Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileCheck2 size={14} className="text-teal-600" />
                    Master Type
                  </label>
                  <select
                    value={masterType}
                    onChange={(e) => setMasterType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"
                  >
                    {masterTypes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

              </div>

              {/* Drag and Drop File Upload Area */}
              <div className="mt-6">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileCode2 size={14} className="text-teal-600" />
                  Select Excel or CSV Master File
                </label>
                
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    file
                      ? 'border-teal-500 bg-teal-50/40'
                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-400'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block w-full">
                    <UploadCloud className={`mx-auto mb-3 ${file ? 'text-teal-600' : 'text-slate-400'}`} size={44} />
                    
                    {file ? (
                      <div>
                        <p className="font-bold text-slate-900 text-base mb-1">{file.name}</p>
                        <p className="text-xs text-teal-700 font-medium">
                          {(file.size / 1024).toFixed(1)} KB — Ready for analysis
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-slate-800 text-sm mb-1">
                          Click to browse or drop file here
                        </p>
                        <p className="text-xs text-slate-500">
                          Supports .xlsx, .xls, .csv (UTF-8, UTF-8 BOM, Windows-1252 encodings)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Primary Action Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleAnalyse}
                  className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Analyse File</span>
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: ANALYSIS IN PROGRESS                                  */}
        {/* ------------------------------------------------------------- */}
        {isAnalyzing && (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center max-w-xl mx-auto my-12 space-y-6">
            <div className="w-16 h-16 bg-teal-50 border border-teal-200 rounded-full flex items-center justify-center mx-auto text-teal-600 animate-spin">
              <Loader2 size={32} />
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Analyzing Master Dataset</h3>
              <p className="text-xs text-slate-500">{progressText}</p>
            </div>

            {/* Step Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-teal-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${(progressStep / 4) * 100}%` }}
              />
            </div>

            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Step {progressStep} of 4 — Prashanth MDG Sanitization Engine
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: EXECUTIVE SUMMARY RESULTS VIEW                        */}
        {/* ------------------------------------------------------------- */}
        {analysisResult && !isAnalyzing && (
          <div className="space-y-6">
            
            {/* Header Summary Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Analysis Completed
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {analysisResult.filename}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {analysisResult.department} Master Analysis Report
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Branch: <strong className="text-slate-800">{analysisResult.branch}</strong> • Master Type: <strong className="text-slate-800">{analysisResult.master_type}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  Analyse Another File
                </button>
              </div>
            </div>

            {/* Core Explanatory Terminology Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
              <div className="flex items-start gap-3">
                <ShieldAlert className="text-teal-400 shrink-0 mt-0.5" size={20} />
                <div className="text-xs space-y-1 leading-relaxed">
                  <p>
                    <strong className="text-teal-300">“Affected Records”</strong> means unique source records containing one or more data quality issues.
                  </p>
                  <p>
                    <strong className="text-teal-300">“Total Issues”</strong> means all individual issue flags identified across the dataset. One record may contain multiple issues.
                  </p>
                </div>
              </div>
            </div>

            {/* 10 Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Source Records</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{analysisResult.summary.total_records.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Total rows uploaded</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Unique Records</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{analysisResult.summary.unique_records.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Distinct primary IDs</span>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-xs">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Affected Records</span>
                <span className="text-2xl font-black text-amber-900 mt-1 block">{analysisResult.summary.affected_records.toLocaleString()}</span>
                <span className="text-[10px] text-amber-700 font-semibold mt-1 block">Records with 1+ issues</span>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Clean Records</span>
                <span className="text-2xl font-black text-emerald-900 mt-1 block">{analysisResult.summary.clean_records.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Zero issues found</span>
              </div>

              <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 shadow-xs">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Total Issues</span>
                <span className="text-2xl font-black text-rose-900 mt-1 block">{analysisResult.summary.total_issues.toLocaleString()}</span>
                <span className="text-[10px] text-rose-700 font-semibold mt-1 block">Total issue flags</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Critical Issues</span>
                <span className="text-xl font-bold text-rose-600 mt-1 block">{analysisResult.summary.critical_issues.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Immediate action</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">High Priority</span>
                <span className="text-xl font-bold text-amber-600 mt-1 block">{analysisResult.summary.high_priority_issues.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Dept review needed</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Duplicate Records</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">{analysisResult.summary.duplicate_records.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Keys & repeated rows</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Missing Fields</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">{analysisResult.summary.missing_fields.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Mandatory blanks</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Invalid Values</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">{analysisResult.summary.invalid_values.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Format/type errors</span>
              </div>

            </div>

            {/* Action Buttons Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="px-5 py-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-2"
              >
                <Eye size={16} />
                Preview Executive Summary
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => downloadFile(analysisResult.csv_download_url)}
                  className="px-5 py-3 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2"
                >
                  <Download size={16} />
                  Download All Issues CSV
                </button>

                <button
                  onClick={() => downloadFile(analysisResult.excel_download_url)}
                  className="px-6 py-3 text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <FileSpreadsheet size={18} />
                  Download Correction Workbook (.xlsx)
                </button>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-center py-4 text-xs text-slate-500">
        © 2026 Prashanth Hospitals Group. All rights reserved. • Master Data Quality Sanitization Platform
      </footer>

      {/* Preview Modal */}
      <ExecutiveSummaryModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={analysisResult}
        onDownloadExcel={() => downloadFile(analysisResult.excel_download_url)}
        onDownloadCsv={() => downloadFile(analysisResult.csv_download_url)}
      />

    </div>
  );
}
