import React, { useState } from 'react';
import { useGovernance } from '../context/GovernanceContext';
import { ShieldAlert, CheckCircle2, AlertTriangle, UserCheck, RefreshCw, Sparkles, Filter } from 'lucide-react';
import axios from 'axios';

export default function CorrectionDashboardPage() {
  const { validationData, registeredMasters, activeMasterId, runValidation, activeRole } = useGovernance();
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, INVALID, FUZZY, VALID
  const [searchQuery, setSearchQuery] = useState('');

  if (!validationData || !validationData.records) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
        <RefreshCw className="animate-spin text-teal-400 mx-auto mb-3" size={32} />
        <p className="text-sm font-bold text-white">Running Master Data Validation Engine...</p>
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
      
      {/* Header Summary Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-teal-500/10 border border-teal-500/30 text-teal-300 px-2.5 py-0.5 rounded-full">
                Metadata-Driven Correction Grid
              </span>
              <span className="text-xs font-mono text-slate-400">{validationData.hospitalBranch}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              {validationData.masterName} Governance &amp; Sanitization
            </h2>
          </div>

          <button
            onClick={() => runValidation(activeMasterId)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 rounded-xl transition-all flex items-center gap-2"
          >
            <RefreshCw size={14} />
            <span>Re-run Validation</span>
          </button>
        </div>

        {/* Validation KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Records</span>
            <p className="text-xl font-extrabold text-white num mt-1">{validationData.summary.totalRecords}</p>
          </div>

          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-3.5">
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Clean Records</span>
            <p className="text-xl font-extrabold text-emerald-300 num mt-1">{validationData.summary.validCount}</p>
          </div>

          <div className="bg-slate-950/80 border border-rose-500/30 rounded-2xl p-3.5">
            <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider">Validation Errors</span>
            <p className="text-xl font-extrabold text-rose-400 num mt-1">{validationData.summary.invalidCount}</p>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5">
            <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">Exact Duplicates</span>
            <p className="text-xl font-extrabold text-amber-300 num mt-1">{validationData.summary.exactDuplicates}</p>
          </div>

          <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-3.5">
            <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">Fuzzy Matches</span>
            <p className="text-xl font-extrabold text-purple-300 num mt-1">{validationData.summary.fuzzyDuplicates}</p>
          </div>

          <div className="bg-slate-950/80 border border-teal-500/30 rounded-2xl p-3.5">
            <span className="text-[10px] font-extrabold text-teal-400 uppercase tracking-wider">Orphans Detected</span>
            <p className="text-xl font-extrabold text-teal-300 num mt-1">{validationData.crossMasterResults?.orphanRecordsCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
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
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search records or codes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-medium"
          />
        </div>
      </div>

      {/* Dynamic Metadata Correction Grid Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 text-left font-bold uppercase tracking-wider">#</th>
                <th className="py-3 px-4 text-left font-bold uppercase tracking-wider">Status</th>
                {activeMaster?.requiredFields?.map(f => (
                  <th key={f} className="py-3 px-4 text-left font-bold uppercase tracking-wider text-teal-400 font-mono">
                    {f}*
                  </th>
                ))}
                {activeMaster?.optionalFields?.slice(0, 3).map(f => (
                  <th key={f} className="py-3 px-4 text-left font-bold uppercase tracking-wider text-slate-300 font-mono">
                    {f}
                  </th>
                ))}
                <th className="py-3 px-4 text-left font-bold uppercase tracking-wider">Validation &amp; Rule Warnings</th>
                <th className="py-3 px-4 text-right font-bold uppercase tracking-wider">Approval Routing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRecords.map(r => (
                <tr key={r.rowIndex} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 font-bold">{r.rowIndex}</td>
                  
                  <td className="py-3 px-4">
                    {r.isValid ? (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 size={12} /> Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                        <AlertTriangle size={12} /> Invalid
                      </span>
                    )}
                  </td>

                  {/* Dynamic Required Fields */}
                  {activeMaster?.requiredFields?.map(f => (
                    <td key={f} className="py-3 px-4 font-mono font-bold text-slate-200 whitespace-nowrap">
                      {r.recordData[f] || <span className="text-rose-400 italic">EMPTY</span>}
                    </td>
                  ))}

                  {/* Dynamic Optional Fields */}
                  {activeMaster?.optionalFields?.slice(0, 3).map(f => (
                    <td key={f} className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {String(r.recordData[f] ?? '—')}
                    </td>
                  ))}

                  {/* Errors & Warnings */}
                  <td className="py-3 px-4 max-w-[320px]">
                    <div className="space-y-1">
                      {r.errors?.map((err, i) => (
                        <div key={i} className="text-[10.5px] text-rose-300 bg-rose-500/10 border border-rose-500/20 p-1.5 rounded-lg font-medium">
                          ❌ {err.message}
                        </div>
                      ))}
                      {r.domainErrors?.map((err, i) => (
                        <div key={i} className="text-[10.5px] text-rose-300 bg-rose-500/10 border border-rose-500/20 p-1.5 rounded-lg font-medium">
                          🩺 {err.message}
                        </div>
                      ))}
                      {r.warnings?.map((warn, i) => (
                        <div key={i} className="text-[10.5px] text-amber-300 bg-amber-500/10 border border-amber-500/20 p-1.5 rounded-lg font-medium">
                          ⚠️ {warn.message}
                        </div>
                      ))}
                      {r.domainWarnings?.map((warn, i) => (
                        <div key={i} className="text-[10.5px] text-purple-300 bg-purple-500/10 border border-purple-500/20 p-1.5 rounded-lg font-medium">
                          ⚕️ {warn.message}
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Action Approvals */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleApprove(r.rowIndex, 'APPROVED')}
                        className="px-2.5 py-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-all"
                      >
                        Approve ({r.approvalRole || 'ADMIN'})
                      </button>
                      <button
                        onClick={() => handleApprove(r.rowIndex, 'REJECTED')}
                        className="px-2.5 py-1 text-[11px] font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-all"
                      >
                        Reject
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
}
