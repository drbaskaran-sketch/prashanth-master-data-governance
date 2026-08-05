import React, { useState } from 'react';
import { useGovernance } from '../context/GovernanceContext';
import { X, Upload, CheckCircle2, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';

export default function UploadFlowModal({ isOpen, onClose }) {
  const { registeredMasters, runValidation, setActiveMasterId } = useGovernance();

  const [form, setForm] = useState({
    hospitalGroup: 'Prashanth Hospitals Group',
    hospital: 'Prashanth Super Specialty Hospitals',
    branch: 'Velachery Main Hospital',
    sourceSystem: 'Kranium HIS',
    masterId: 'PHARMACY_MASTER',
    fileVersion: 'v4.2',
    effectiveDate: new Date().toISOString().split('T')[0],
    loadType: 'FULL_LOAD'
  });

  const [fileInfo, setFileInfo] = useState(null); // { name, rowCount, headers, parsedData }
  const [parseError, setParseError] = useState(null);

  if (!isOpen) return null;

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const parsedData = parseCSV(text);

        if (!parsedData || parsedData.length === 0) {
          setParseError('Failed to parse CSV or file contains no data rows.');
          setFileInfo(null);
          return;
        }

        const headers = Object.keys(parsedData[0] || {});

        // Auto-detect master schema if possible
        let detectedMasterId = form.masterId;
        if (headers.includes('doctor_code') || headers.includes('doctor_name')) {
          detectedMasterId = 'DOCTOR_MASTER';
        } else if (headers.includes('item_code') || headers.includes('item_name')) {
          detectedMasterId = 'PHARMACY_MASTER';
        } else if (headers.includes('test_code') || headers.includes('test_name')) {
          detectedMasterId = 'LAB_TEST_MASTER';
        }

        setForm(prev => ({ ...prev, masterId: detectedMasterId }));
        setFileInfo({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          rowCount: parsedData.length,
          headers,
          parsedData
        });
      } catch (err) {
        console.error(err);
        setParseError('Error reading CSV file: ' + err.message);
      }
    };

    reader.readAsText(file);
  }

  function handleExecuteUpload() {
    setActiveMasterId(form.masterId);
    runValidation(form.masterId, fileInfo?.parsedData || null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
              CSV Dataset Upload Wizard
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-1">
              Select &amp; Ingest Master File (Audit Control)
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                1. Hospital Group
              </label>
              <input
                type="text"
                value={form.hospitalGroup}
                onChange={e => setForm({ ...form, hospitalGroup: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                2. Hospital Unit
              </label>
              <input
                type="text"
                value={form.hospital}
                onChange={e => setForm({ ...form, hospital: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                3. Branch / Location
              </label>
              <select
                value={form.branch}
                onChange={e => setForm({ ...form, branch: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-teal-600"
              >
                <option value="Velachery Main Hospital">Velachery Main Hospital</option>
                <option value="Kolathur Hospital">Kolathur Hospital</option>
                <option value="Chetpet Specialty Center">Chetpet Specialty Center</option>
                <option value="Gummidipoondi Medical Center">Gummidipoondi Medical Center</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                4. Source System
              </label>
              <select
                value={form.sourceSystem}
                onChange={e => setForm({ ...form, sourceSystem: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-teal-600"
              >
                <option value="Kranium HIS">Kranium HIS</option>
                <option value="Kranium LIS">Kranium LIS</option>
                <option value="Kranium RIS/PACS">Kranium RIS/PACS</option>
                <option value="Kranium Pharmacy">Kranium Pharmacy</option>
                <option value="Kranium Materials">Kranium Materials / Stores</option>
                <option value="Kranium Billing">Kranium Billing &amp; Tariff</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                5 &amp; 6. Target Master Schema
              </label>
              <select
                value={form.masterId}
                onChange={e => setForm({ ...form, masterId: e.target.value })}
                className="w-full bg-slate-50 border border-teal-300 rounded-xl px-3.5 py-2 text-xs text-teal-800 font-bold focus:outline-none focus:border-teal-600"
              >
                {registeredMasters.map(m => (
                  <option key={m.masterId} value={m.masterId}>
                    {m.masterName} ({m.domain})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                7. Effective Date
              </label>
              <input
                type="date"
                value={form.effectiveDate}
                onChange={e => setForm({ ...form, effectiveDate: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                8. Ingestion Mode
              </label>
              <select
                value={form.loadType}
                onChange={e => setForm({ ...form, loadType: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-amber-800 font-bold focus:outline-none focus:border-teal-600"
              >
                <option value="FULL_LOAD">Full Load (Replace Baseline)</option>
                <option value="INCREMENTAL">Incremental Load (Delta Append)</option>
              </select>
            </div>
          </div>

          {/* Interactive CSV Upload Area */}
          <div className="relative border-2 border-dashed border-teal-300 bg-teal-50/40 hover:bg-teal-50/80 transition-all rounded-2xl p-6 text-center cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
            />
            <Upload className="mx-auto text-teal-600 mb-2" size={32} />
            <p className="text-xs font-bold text-slate-900">
              Click to select or Drag &amp; Drop CSV File
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports standard UTF-8 CSV exports from Kranium HIS, Excel, or legacy systems
            </p>
          </div>

          {/* Parse Error Message */}
          {parseError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-700">
              <AlertCircle size={16} />
              <span>{parseError}</span>
            </div>
          )}

          {/* Uploaded File Details & Preview */}
          {fileInfo && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="text-teal-600" size={18} />
                  <span className="text-xs font-extrabold text-slate-900">{fileInfo.name}</span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                    {fileInfo.size}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {fileInfo.rowCount} records parsed
                </span>
              </div>

              <div className="text-[11px] text-slate-600">
                <b>Detected Headers:</b> {fileInfo.headers.join(', ')}
              </div>

              {/* Sample Preview Table */}
              <div className="mt-2 border border-slate-200 rounded-xl overflow-x-auto bg-white">
                <table className="w-full text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      {fileInfo.headers.slice(0, 5).map(h => (
                        <th key={h} className="p-2 text-left font-mono font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fileInfo.parsedData.slice(0, 3).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 text-slate-800">
                        {fileInfo.headers.slice(0, 5).map(h => (
                          <td key={h} className="p-2 font-mono">{String(row[h] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {fileInfo ? `Ready to validate ${fileInfo.rowCount} records` : 'Select a CSV file to validate'}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900">
              Cancel
            </button>
            <button
              onClick={handleExecuteUpload}
              className="px-5 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl shadow-md hover:from-teal-700 hover:to-emerald-700 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 size={16} />
              <span>Validate &amp; Ingest Master</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
