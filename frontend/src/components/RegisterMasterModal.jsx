import React, { useState } from 'react';
import { useGovernance } from '../context/GovernanceContext';
import { X, Plus, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function RegisterMasterModal({ isOpen, onClose }) {
  const { loadMasterRegistry } = useGovernance();

  const [form, setForm] = useState({
    masterId: '',
    masterName: '',
    domain: 'CLINICAL_OPERATIONS',
    description: '',
    primaryKey: 'code',
    requiredFieldsStr: 'code, name',
    fieldTypesStr: 'code:STRING, name:STRING, status:STATUS'
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const requiredFields = form.requiredFieldsStr.split(',').map(s => s.trim()).filter(Boolean);
    const fieldTypes = {};
    form.fieldTypesStr.split(',').forEach(pair => {
      const [k, v] = pair.split(':').map(s => s.trim());
      if (k && v) fieldTypes[k] = v.toUpperCase();
    });

    try {
      const res = await axios.post('/api/registry/masters', {
        masterId: form.masterId,
        masterName: form.masterName,
        domain: form.domain,
        description: form.description,
        primaryKey: form.primaryKey,
        requiredFields,
        fieldTypes
      });

      if (res.data?.success) {
        setMessage('Master successfully registered in Master Registry!');
        await loadMasterRegistry();
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-slate-800/80 border-b border-slate-700/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-teal-400" size={20} />
            <h2 className="text-base font-bold text-white tracking-tight">
              Register New Hospital Master (Zero-Code Metadata Configuration)
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs rounded-xl font-medium">
              {message}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Master Identifier (ID)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NURSING_CARE_MASTER"
              value={form.masterId}
              onChange={e => setForm({ ...form, masterId: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Master Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Nursing Care & Clinical Service Master"
              value={form.masterName}
              onChange={e => setForm({ ...form, masterName: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Domain
              </label>
              <select
                value={form.domain}
                onChange={e => setForm({ ...form, domain: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-teal-500"
              >
                <option value="CLINICAL_STAFF">Clinical Staff</option>
                <option value="CLINICAL_OPERATIONS">Clinical Operations</option>
                <option value="LABORATORY">Laboratory</option>
                <option value="RADIOLOGY">Radiology</option>
                <option value="DIAGNOSTICS">Cardiology / Diagnostics</option>
                <option value="FINANCE_BILLING">Finance &amp; Billing</option>
                <option value="FINANCE_TARIFFS">Tariffs</option>
                <option value="PHARMACY">Pharmacy</option>
                <option value="SUPPLY_CHAIN">Supply Chain &amp; Stores</option>
                <option value="EQUIPMENT">Biomedical Equipment</option>
                <option value="CUSTOM">Custom Domain</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Primary Key Field
              </label>
              <input
                type="text"
                required
                placeholder="e.g. care_code"
                value={form.primaryKey}
                onChange={e => setForm({ ...form, primaryKey: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Required Fields (comma separated)
            </label>
            <input
              type="text"
              value={form.requiredFieldsStr}
              onChange={e => setForm({ ...form, requiredFieldsStr: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Field Types Definition (field:TYPE, field:TYPE)
            </label>
            <input
              type="text"
              value={form.fieldTypesStr}
              onChange={e => setForm({ ...form, fieldTypesStr: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            💡 This will instantly register the master in the <b>Master Registry Engine</b>. You will be able to upload, sanitize, validate, and export data for this master without writing code.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>Register Master Definition</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
