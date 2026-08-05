import React from 'react';
import { useGovernance } from '../context/GovernanceContext';
import { Download, FileSpreadsheet, Code, Server, CheckCircle2 } from 'lucide-react';

export default function ExportIntegrationPage() {
  const { activeMasterId, validationData } = useGovernance();

  function triggerExport(format) {
    window.open(`/api/governance/export/${activeMasterId}?format=${format}`, '_blank');
  }

  const adapters = [
    { name: 'Kranium HIS Core Adapter', type: 'HIS', status: 'ACTIVE', desc: 'Re-indexes headers, pads codes, and formats satellite branch IDs for Kranium HIS.' },
    { name: 'Laboratory LIS System Adapter', type: 'LIS', status: 'ACTIVE', desc: 'Syncs test codes, specimen containers, and LOINC parameters to PathNet.' },
    { name: 'RIS / PACS Imaging Adapter', type: 'RIS/PACS', status: 'ACTIVE', desc: 'Syncs study names, DICOM modality tags, and radiologist routing flags.' },
    { name: 'Pharmacy & Drug Formulary Adapter', type: 'PHARMACY', status: 'ACTIVE', desc: 'Syncs Schedule H/H1, LASA warnings, and GST HSN codes to Pharmacy POS.' },
    { name: 'Biomedical Asset & Stores Adapter', type: 'ERP', status: 'ACTIVE', desc: 'Syncs consumable UOMs and equipment codes to SAP/Oracle ERP.' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-full">
          Export &amp; Integration Hub
        </span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
          Kranium HIS &amp; Multi-System Export Adapters
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Metadata-driven export configurations for Kranium HIS, LIS, RIS/PACS, Pharmacy, and ERP systems
        </p>
      </div>

      {/* Export Formats Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Download size={16} className="text-teal-400" /> Export Options for {activeMasterId}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => triggerExport('KRANIUM_CSV')}
            className="p-5 bg-slate-950 border border-teal-500/30 hover:border-teal-500 rounded-2xl text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <FileSpreadsheet className="text-teal-400" size={24} />
              <span className="text-[10px] font-bold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded">HIS Ready</span>
            </div>
            <h4 className="text-sm font-extrabold text-white mt-3 group-hover:text-teal-300 transition-colors">
              Kranium-Compatible CSV
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Formatted with mandatory Kranium headers and branch satellite mapping.
            </p>
          </button>

          <button
            onClick={() => triggerExport('SOURCE_CSV')}
            className="p-5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <FileSpreadsheet className="text-slate-400" size={24} />
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Standard</span>
            </div>
            <h4 className="text-sm font-extrabold text-white mt-3 group-hover:text-slate-200 transition-colors">
              Clean Source CSV Export
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Sanitized records matching the original import field layout.
            </p>
          </button>

          <button
            onClick={() => triggerExport('JSON')}
            className="p-5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <Code className="text-amber-400" size={24} />
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">REST API</span>
            </div>
            <h4 className="text-sm font-extrabold text-white mt-3 group-hover:text-amber-300 transition-colors">
              API-Ready JSON Payload
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Structured JSON object feed for automated webhooks and integrations.
            </p>
          </button>
        </div>
      </div>

      {/* HIS Adapters List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Server size={16} className="text-emerald-400" /> Enterprise HIS System Adapters
        </h3>

        <div className="divide-y divide-slate-800">
          {adapters.map((a, i) => (
            <div key={i} className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">{a.name}</h4>
                  <span className="text-[9.5px] font-bold font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {a.type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{a.desc}</p>
              </div>

              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 size={12} /> Ready
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
