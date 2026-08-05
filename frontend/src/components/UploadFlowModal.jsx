import React, { useState } from 'react';
import { useGovernance } from '../context/GovernanceContext';
import { X, Upload, CheckCircle2, Layers, Calendar, Server } from 'lucide-react';

export default function UploadFlowModal({ isOpen, onClose }) {
  const { registeredMasters, runValidation, setActiveMasterId } = useGovernance();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    hospitalGroup: 'Prashanth Hospitals Group',
    hospital: 'Prashanth Super Specialty Hospitals',
    branch: 'Velachery Main Hospital',
    sourceSystem: 'Kranium HIS',
    masterDomain: 'CLINICAL_STAFF',
    masterId: 'DOCTOR_MASTER',
    fileVersion: 'v4.2',
    effectiveDate: '2026-08-01',
    loadType: 'FULL_LOAD'
  });

  if (!isOpen) return null;

  function handleExecuteUpload() {
    setActiveMasterId(form.masterId);
    runValidation(form.masterId);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-slate-800/80 border-b border-slate-700/80 px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
              Metadata Upload Wizard
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight mt-1">
              Select Dataset Parameters (9 Step Audit Control)
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                1. Hospital Group
              </label>
              <input
                type="text"
                value={form.hospitalGroup}
                onChange={e => setForm({ ...form, hospitalGroup: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                2. Hospital Unit
              </label>
              <input
                type="text"
                value={form.hospital}
                onChange={e => setForm({ ...form, hospital: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                3. Branch / Location
              </label>
              <select
                value={form.branch}
                onChange={e => setForm({ ...form, branch: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-teal-500"
              >
                <option value="Velachery Main Hospital">Velachery Main Hospital</option>
                <option value="Kolathur Hospital">Kolathur Hospital</option>
                <option value="Chetpet Specialty Center">Chetpet Specialty Center</option>
                <option value="Gummidipoondi Medical Center">Gummidipoondi Medical Center</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                4. Source System
              </label>
              <select
                value={form.sourceSystem}
                onChange={e => setForm({ ...form, sourceSystem: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-teal-500"
              >
                <option value="Kranium HIS">Kranium HIS</option>
                <option value="Kranium LIS">Kranium LIS</option>
                <option value="Kranium RIS/PACS">Kranium RIS/PACS</option>
                <option value="Kranium Pharmacy">Kranium Pharmacy</option>
                <option value="Kranium Materials">Kranium Materials / Stores</option>
                <option value="Kranium Billing">Kranium Billing & Tariff</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                5 &amp; 6. Master Type &amp; Domain
              </label>
              <select
                value={form.masterId}
                onChange={e => setForm({ ...form, masterId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-teal-300 font-bold focus:outline-none focus:border-teal-500"
              >
                {registeredMasters.map(m => (
                  <option key={m.masterId} value={m.masterId}>
                    {m.masterName} ({m.domain})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                7. File Version
              </label>
              <input
                type="text"
                value={form.fileVersion}
                onChange={e => setForm({ ...form, fileVersion: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                8. Effective Date
              </label>
              <input
                type="date"
                value={form.effectiveDate}
                onChange={e => setForm({ ...form, effectiveDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                9. Load Mode
              </label>
              <select
                value={form.loadType}
                onChange={e => setForm({ ...form, loadType: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-teal-500"
              >
                <option value="FULL_LOAD">Full Load (Replace Baseline)</option>
                <option value="INCREMENTAL">Incremental Load (Delta Append)</option>
              </select>
            </div>
          </div>

          <div className="border border-dashed border-slate-700 bg-slate-800/40 rounded-2xl p-6 text-center mt-2">
            <Upload className="mx-auto text-teal-400 mb-2" size={32} />
            <p className="text-xs font-bold text-white">Drag &amp; drop master CSV or select demo dataset</p>
            <p className="text-[11px] text-slate-400 mt-1">Supports UTF-8 CSV, Excel (.xlsx), and JSON source feeds</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-800/80 border-t border-slate-700/80 px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">9 of 9 Scope Parameters Set</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              onClick={handleExecuteUpload}
              className="px-5 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl shadow-md hover:from-teal-500 hover:to-emerald-500 transition-all flex items-center gap-1.5"
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
