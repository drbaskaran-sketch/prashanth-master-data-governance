import React, { useState } from 'react';
import { useGovernance } from '../context/GovernanceContext';
import { CheckCircle2, AlertTriangle, RefreshCw, UploadCloud, Search, FileSpreadsheet, Info } from 'lucide-react';
import axios from 'axios';
import { parseCSV } from '../utils/csvParser';

export default function CorrectionDashboardPage({ onOpenUploadModal }) {
  const { validationData, registeredMasters, activeMasterId, setActiveMasterId, runValidation, activeRole } = useGovernance();
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, INVALID, FUZZY, VALID
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadNotice, setUploadNotice] = useState(null);

  // Local inline CSV drag & drop state
  function handleInlineCSV(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = parseCSV(event.target.result);
        if (!parsed || parsed.length === 0) {
          setUploadNotice({ type: 'error', message: `File '${file.name}' is empty or contains invalid CSV format.` });
          return;
        }

        // Auto-detect matching master schema from CSV headers if applicable
        const sampleHeaders = Object.keys(parsed[0] || {});
        let targetMasterId = activeMasterId;

        if (sampleHeaders.includes('doctor_code') || sampleHeaders.includes('doctor_name') || sampleHeaders.includes('medical_registration_no')) {
          targetMasterId = 'DOCTOR_MASTER';
        } else if (sampleHeaders.includes('item_code') || sampleHeaders.includes('item_name') || sampleHeaders.includes('generic_salt_name')) {
          targetMasterId = 'PHARMACY_MASTER';
        } else if (sampleHeaders.includes('test_code') || sampleHeaders.includes('test_name')) {
          targetMasterId = 'LAB_TEST_MASTER';
        } else if (sampleHeaders.includes('investigation_code') || sampleHeaders.includes('study_name')) {
          targetMasterId = 'RADIOLOGY_MASTER';
        } else if (sampleHeaders.includes('store_item_code') || sampleHeaders.includes('item_description')) {
          targetMasterId = 'STORES_MASTER';
        } else if (sampleHeaders.includes('service_code') || sampleHeaders.includes('service_name')) {
          targetMasterId = 'BILLING_SERVICE_MASTER';
        }

        if (targetMasterId !== activeMasterId) {
          setActiveMasterId(targetMasterId);
        }

        runValidation(targetMasterId, parsed);
        const targetDef = registeredMasters.find(m => m.masterId === targetMasterId);

        setUploadNotice({
          type: 'success',
          message: `Successfully uploaded '${file.name}' (${parsed.length} records) to ${targetDef?.masterName || targetMasterId}!`
        });

      } catch (err) {
        console.error('Error parsing inline CSV:', err);
        setUploadNotice({ type: 'error', message: 'Failed to process CSV file: ' + err.message });
      } finally {
        e.target.value = ''; // Reset input to allow re-uploading same file if desired
      }
    };

    reader.readAsText(file);
  }

  if (!validationData || !validationData.records) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
        <RefreshCw className="animate-spin text-teal-600 mx-auto mb-3" size={32} />
        <p className="text-sm font-bold text-slate-800">Running Master Data Validation Engine...</p>
      </div>
    );
  }

  const activeMaster = registeredMasters.find(m => m.masterId === activeMasterId);
  const records = validationData.records || [];

  // Filter Records
  const filteredRecords = records.filter(r => {
    if (filterTab === 'INVALID' && r.isValid) return false;
    if (filterTab === 'VALID' && !r.isValid) return false;
    if (filterTab === 'FUZZY' && r.warnings.length === 0) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return JSON.stringify(r.recordData).toLowerCase().includes(q);
    }
    return true;
  });

  async function handleApprove(rowIndex, action) {
    try {
      await axios.post('/api/governance/approve', {
        masterId: activeMasterId,
        rowIndex,
        action,
        approverRole: activeRole
      });
      runValidation(activeMasterId);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Upload Notification Banner */}
      {uploadNotice && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-xs ${
          uploadNotice.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className={uploadNotice.type === 'success' ? 'text-emerald-600' : 'text-rose-600'} />
            <span>{uploadNotice.message}</span>
          </div>
          <button onClick={() => setUploadNotice(null)} className="text-slate-400 hover:text-slate-700">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Summary Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-teal-50 border border-teal-200 text-teal-700 px-2.5 py-0.5 rounded-full">
                Metadata-Driven Correction Grid
              </span>
              <span className="text-xs font-mono text-slate-500">{validationData.hospitalBranch}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {validationData.masterName} Governance &amp; Sanitization
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick CSV File Upload Input */}
            <label className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-xs font-extrabold text-white rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-2">
              <UploadCloud size={16} />
              <span>Upload Master CSV</span>
              <input type="file" accept=".csv" onChange={handleInlineCSV} className="hidden" />
            </label>

            <button
              onClick={() => runValidation(activeMasterId)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-300 rounded-xl transition-all flex items-center gap-2 shadow-xs"
            >
              <RefreshCw size={14} />
              <span>Re-run Validation</span>
            </button>
          </div>
        </div>

        {/* Validation KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-xs">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Records</span>
            <p className="text-xl font-extrabold text-slate-900 num mt-1">{validationData.summary.totalRecords}</p>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 shadow-xs">
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">Clean Records</span>
            <p className="text-xl font-extrabold text-emerald-800 num mt-1">{validationData.summary.validCount}</p>
          </div>

          <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-3.5 shadow-xs">
            <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider">Validation Errors</span>
            <p className="text-xl font-extrabold text-rose-800 num mt-1">{validationData.summary.invalidCount}</p>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5 shadow-xs">
            <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">Exact Duplicates</span>
            <p className="text-xl font-extrabold text-amber-800 num mt-1">{validationData.summary.exactDuplicates}</p>
          </div>

          <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-3.5 shadow-xs">
            <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider">Fuzzy Matches</span>
            <p className="text-xl font-extrabold text-purple-800 num mt-1">{validationData.summary.fuzzyDuplicates}</p>
          </div>

          <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-3.5 shadow-xs">
            <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider">Orphans Detected</span>
            <p className="text-xl font-extrabold text-teal-800 num mt-1">{validationData.crossMasterResults?.orphanRecordsCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-2xl shadow-sm">
        <div className="flex gap-1">
          {[
            { id: 'ALL', label: 'All Records', count: records.length },
            { id: 'INVALID', label: 'Requires Correction', count: validationData.summary.invalidCount },
            { id: 'FUZZY', label: 'Fuzzy Duplicates', count: validationData.summary.fuzzyDuplicates },
            { id: 'VALID', label: 'Ready for Release', count: validationData.summary.validCount },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterTab(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === t.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search records or codes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 font-medium"
          />
        </div>
      </div>

      {/* Dynamic Metadata Correction Grid Table */}
      {(() => {
        // Extract all data keys present in actual records so no fields are blank or missing
        const allRecordKeys = Array.from(new Set(records.flatMap(r => Object.keys(r.recordData || {}))));
        const displayKeys = allRecordKeys.length > 0 
          ? allRecordKeys.slice(0, 8) 
          : [...(activeMaster?.requiredFields || []), ...(activeMaster?.optionalFields || [])].slice(0, 8);

        return (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-h-[580px]">
              <table className="w-full text-xs">
                <thead className="sticky top-0 z-10 bg-slate-100/90 backdrop-blur-xs border-b border-slate-200">
                  <tr className="text-slate-600 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 text-left font-bold w-12">#</th>
                    <th className="py-2.5 px-3 text-left font-bold w-24">Status</th>
                    {displayKeys.map(k => (
                      <th key={k} className="py-2.5 px-3 text-left font-bold font-mono text-teal-800 whitespace-nowrap">
                        {k}{activeMaster?.requiredFields?.includes(k) ? '*' : ''}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-left font-bold min-w-[220px]">Validation &amp; Rule Warnings</th>
                    <th className="py-2.5 px-3 text-right font-bold w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRecords.map(r => {
                    const allIssues = [
                      ...(r.errors || []).map(e => ({ type: 'error', icon: '❌', msg: e.message })),
                      ...(r.domainErrors || []).map(e => ({ type: 'error', icon: '🩺', msg: e.message })),
                      ...(r.warnings || []).map(w => ({ type: 'warning', icon: '⚠️', msg: w.message })),
                      ...(r.domainWarnings || []).map(w => ({ type: 'warning', icon: '⚕️', msg: w.message })),
                    ];
                    const firstIssue = allIssues[0];

                    return (
                      <tr key={r.rowIndex} className="hover:bg-slate-50/80 transition-colors h-9 align-middle">
                        <td className="py-1 px-3 font-mono text-slate-400 font-bold whitespace-nowrap text-[11px]">{r.rowIndex}</td>
                        
                        <td className="py-1 px-3 whitespace-nowrap">
                          {r.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={11} /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              <AlertTriangle size={11} /> Invalid
                            </span>
                          )}
                        </td>

                        {/* Dynamic Field Values from actual recordData */}
                        {displayKeys.map(k => {
                          const val = r.recordData[k];
                          const hasVal = val !== undefined && val !== null && String(val).trim() !== '';
                          return (
                            <td key={k} className="py-1 px-3 font-mono text-slate-800 whitespace-nowrap max-w-[180px] truncate text-[11.5px]" title={String(val ?? '')}>
                              {hasVal ? String(val) : <span className="text-slate-300 font-normal">—</span>}
                            </td>
                          );
                        })}

                        {/* Single-line compact error / warning badge */}
                        <td className="py-1 px-3 whitespace-nowrap">
                          {firstIssue ? (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md truncate max-w-[240px] border ${
                                firstIssue.type === 'error'
                                  ? 'text-rose-700 bg-rose-50 border-rose-200'
                                  : 'text-amber-800 bg-amber-50 border-amber-200'
                              }`}
                              title={allIssues.map(i => `${i.icon} ${i.msg}`).join('\n')}
                            >
                              <span>{firstIssue.icon} {firstIssue.msg}</span>
                              {allIssues.length > 1 && (
                                <span className="ml-1 text-[9px] bg-white/60 px-1 rounded font-extrabold">
                                  +{allIssues.length - 1}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-[10.5px] text-slate-400 font-medium">—</span>
                          )}
                        </td>

                        {/* Action Approvals */}
                        <td className="py-1 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleApprove(r.rowIndex, 'APPROVED')}
                              className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApprove(r.rowIndex, 'REJECTED')}
                              className="px-2 py-0.5 text-[10px] font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
