import React from 'react';
import { X, Download, ShieldCheck, AlertTriangle, FileSpreadsheet } from 'lucide-react';

export default function ExecutiveSummaryModal({ isOpen, onClose, data, onDownloadExcel, onDownloadCsv }) {
  if (!isOpen || !data) return null;

  const summary = data.summary || {};
  const priorities = summary.priorities_list || [];
  const findings = summary.dept_findings || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="text-teal-400" size={24} />
            <div>
              <h2 className="font-bold text-lg leading-tight">Executive Summary Preview</h2>
              <p className="text-xs text-slate-300">Kranium HIS Master Sanitization Audit — {data.filename}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          
          {/* Metadata Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Branch</span>
              <span className="font-bold text-slate-900">{data.branch}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Department</span>
              <span className="font-bold text-slate-900">{data.department}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Master Type</span>
              <span className="font-bold text-slate-900">{data.master_type}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">File Checksum</span>
              <span className="font-mono font-semibold text-slate-700">{data.checksum}</span>
            </div>
          </div>

          {/* Core Metrics Table */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <ShieldCheck className="text-teal-600" size={18} />
              Key Data Quality Metrics
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3 border-b border-slate-200">Category</th>
                    <th className="p-3 border-b border-slate-200 text-center">Count</th>
                    <th className="p-3 border-b border-slate-200">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Source Records</td>
                    <td className="p-3 text-center font-bold text-slate-900">{summary.total_records}</td>
                    <td className="p-3 text-slate-600">Total raw rows uploaded from file</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Unique Record IDs</td>
                    <td className="p-3 text-center font-bold text-slate-900">{summary.unique_records}</td>
                    <td className="p-3 text-slate-600">Distinct primary key identifiers</td>
                  </tr>
                  <tr className="bg-amber-50/60">
                    <td className="p-3 font-bold text-amber-900">Affected Records</td>
                    <td className="p-3 text-center font-bold text-amber-900">{summary.affected_records}</td>
                    <td className="p-3 text-amber-800 font-medium">Unique source records containing 1+ issues</td>
                  </tr>
                  <tr className="bg-emerald-50/60">
                    <td className="p-3 font-bold text-emerald-900">Clean Records</td>
                    <td className="p-3 text-center font-bold text-emerald-900">{summary.clean_records}</td>
                    <td className="p-3 text-emerald-800 font-medium">Records free of identified errors</td>
                  </tr>
                  <tr className="bg-rose-50/60">
                    <td className="p-3 font-bold text-rose-900">Total Issue Flags</td>
                    <td className="p-3 text-center font-bold text-rose-900">{summary.total_issues}</td>
                    <td className="p-3 text-rose-800 font-medium">Total error/warning flags across all records</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Specific Findings */}
          {findings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs">
              <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="text-amber-600" size={16} />
                Department Findings & Risk Warnings
              </h4>
              <ul className="list-disc list-inside space-y-1 text-amber-800">
                {findings.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Correction Priorities Roadmap */}
          {priorities.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-3">Correction Priorities Roadmap</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3 border-b border-slate-200 text-center">#</th>
                      <th className="p-3 border-b border-slate-200">Workstream</th>
                      <th className="p-3 border-b border-slate-200">Priority</th>
                      <th className="p-3 border-b border-slate-200">Required Action</th>
                      <th className="p-3 border-b border-slate-200">Department</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {priorities.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 text-center font-bold text-slate-500">{item.order}</td>
                        <td className="p-3 font-semibold text-slate-900">{item.workstream}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.priority === 'Critical' ? 'bg-rose-100 text-rose-700' :
                            item.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{item.required_action}</td>
                        <td className="p-3 font-medium text-slate-800">{item.responsible_dept}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-all"
          >
            Close Preview
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onDownloadCsv}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-1.5"
            >
              <Download size={14} />
              CSV Issues
            </button>
            <button
              onClick={onDownloadExcel}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet size={14} />
              Download Correction Workbook (.xlsx)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
