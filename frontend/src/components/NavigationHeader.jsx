import React from 'react';
import { useGovernance } from '../context/GovernanceContext';
import { ShieldCheck, Database, Layers, UserCheck, UploadCloud, PlusCircle } from 'lucide-react';

export default function NavigationHeader({ onOpenUploadModal, onOpenRegisterModal }) {
  const {
    registeredMasters,
    activeMasterId,
    setActiveMasterId,
    activeBranch,
    setActiveBranch,
    activeRole,
    setActiveRole
  } = useGovernance();

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 sticky top-0 z-40 shadow-xl">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4 flex-wrap">
        
        {/* Brand Logo & Platform Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold tracking-widest uppercase bg-teal-500/15 border border-teal-500/30 text-teal-300 px-2.5 py-0.5 rounded-full">
                Enterprise Governance
              </span>
              <span className="text-[10px] font-bold tracking-wider text-slate-400">v4.0 Single Source of Truth</span>
            </div>
            <h1 className="text-base font-extrabold text-white tracking-tight leading-tight mt-0.5">
              Prashanth Hospital Master Data Platform
            </h1>
          </div>
        </div>

        {/* Global Controls: Active Master, Branch, Role */}
        <div className="flex items-center gap-3">
          {/* Master Selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5">
            <Database size={15} className="text-teal-400" />
            <select
              value={activeMasterId}
              onChange={e => setActiveMasterId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-100 focus:outline-none cursor-pointer max-w-[220px]"
            >
              {registeredMasters.map(m => (
                <option key={m.masterId} value={m.masterId} className="bg-slate-900 text-white">
                  {m.masterName} ({m.domain})
                </option>
              ))}
            </select>
          </div>

          {/* Branch Selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5">
            <Layers size={15} className="text-emerald-400" />
            <select
              value={activeBranch}
              onChange={e => setActiveBranch(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="Velachery Main Hospital" className="bg-slate-900">Velachery Unit</option>
              <option value="Kolathur Hospital" className="bg-slate-900">Kolathur Unit</option>
              <option value="Chetpet Specialty Center" className="bg-slate-900">Chetpet Unit</option>
              <option value="Gummidipoondi Medical Center" className="bg-slate-900">Gummidipoondi Unit</option>
            </select>
          </div>

          {/* Multi-Role Switcher */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5">
            <UserCheck size={15} className="text-amber-400" />
            <select
              value={activeRole}
              onChange={e => setActiveRole(e.target.value)}
              className="bg-transparent text-xs font-bold text-amber-300 focus:outline-none cursor-pointer"
            >
              <option value="MASTER_DATA_ADMIN" className="bg-slate-900">Role: Master Data Admin</option>
              <option value="MEDICAL_ADMIN" className="bg-slate-900">Role: Medical Director</option>
              <option value="PATHOLOGIST" className="bg-slate-900">Role: Chief Pathologist</option>
              <option value="RADIOLOGY_HEAD" className="bg-slate-900">Role: Chief Radiologist</option>
              <option value="FINANCE_CONTROLLER" className="bg-slate-900">Role: Finance Controller</option>
              <option value="CHIEF_PHARMACIST" className="bg-slate-900">Role: Chief Pharmacist</option>
              <option value="HIS_IT_LEAD" className="bg-slate-900">Role: HIS/IT Admin</option>
            </select>
          </div>

          {/* Action Buttons */}
          <button
            onClick={onOpenRegisterModal}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl transition-all"
          >
            <PlusCircle size={15} />
            <span>Register New Master</span>
          </button>

          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 px-4 py-2 rounded-xl shadow-md transition-all"
          >
            <UploadCloud size={16} />
            <span>Upload Dataset</span>
          </button>
        </div>

      </div>
    </header>
  );
}
