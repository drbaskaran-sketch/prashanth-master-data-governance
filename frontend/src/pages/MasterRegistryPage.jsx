import React, { useState } from 'react';
import { useGovernance } from '../context/GovernanceContext';
import { Database, ShieldAlert, GitBranch, ArrowRight, Info, CheckCircle } from 'lucide-react';

export default function MasterRegistryPage({ onOpenRegisterModal }) {
  const { registeredMasters, activeMasterId, setActiveMasterId } = useGovernance();
  const activeMaster = registeredMasters.find(m => m.masterId === activeMasterId) || registeredMasters[0];

  if (!activeMaster) return null;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-teal-500/10 border border-teal-500/30 text-teal-300 px-2.5 py-0.5 rounded-full">
              Metadata Configuration Engine
            </span>
            <span className="text-xs font-mono text-slate-400">Total Registered Masters: {registeredMasters.length}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Master Registry Specifications
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Dynamic, zero-code master schema configuration for enterprise-wide hospital data governance
          </p>
        </div>

        <button
          onClick={onOpenRegisterModal}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <span>+ Register New Master</span>
        </button>
      </div>

      {/* Master Grid Picker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {registeredMasters.map(m => {
          const isSelected = m.masterId === activeMaster.masterId;
          return (
            <button
              key={m.masterId}
              onClick={() => setActiveMasterId(m.masterId)}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-teal-900/60 to-slate-900 border-teal-500 shadow-lg shadow-teal-500/10 scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isSelected ? 'bg-teal-500/20 text-teal-300 border-teal-400/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {m.domain}
                </span>
                <p className={`text-xs font-extrabold mt-2 leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {m.masterName}
                </p>
              </div>
              <p className="text-[10px] font-mono text-slate-400 mt-2">PK: {m.primaryKey}</p>
            </button>
          );
        })}
      </div>

      {/* Active Master Specification Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white tracking-tight">{activeMaster.masterName}</h3>
              <span className="text-xs font-mono bg-slate-800 text-teal-300 px-2.5 py-0.5 rounded-lg border border-slate-700">
                {activeMaster.masterId}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">{activeMaster.description}</p>
          </div>

          <div className="flex gap-4 text-xs font-medium text-slate-300 bg-slate-800/60 p-3 rounded-2xl border border-slate-800">
            <div><span className="text-slate-400">Data Owner:</span> <b className="text-white">{activeMaster.dataOwner}</b></div>
            <div><span className="text-slate-400">Clinical Owner:</span> <b className="text-white">{activeMaster.clinicalOwner}</b></div>
            <div><span className="text-slate-400">Finance Owner:</span> <b className="text-white">{activeMaster.financeOwner}</b></div>
          </div>
        </div>

        {/* Master Schema Grid Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Primary Key & Required Fields */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4.5 space-y-3">
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database size={15} /> Primary &amp; Required Keys
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Key:</span>
                <span className="font-mono text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  {activeMaster.primaryKey}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Candidate Keys:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeMaster.candidateBusinessKeys?.map(k => (
                    <span key={k} className="font-mono text-slate-200 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Required Mandatory Fields:</span>
                <div className="flex flex-wrap gap-1">
                  {activeMaster.requiredFields?.map(f => (
                    <span key={f} className="text-[10.5px] font-bold text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Accepted Enums & Types */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4.5 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle size={15} /> Accepted Enum Policies
            </h4>
            <div className="space-y-2 text-xs">
              {Object.entries(activeMaster.acceptedValues || {}).map(([field, values]) => (
                <div key={field}>
                  <span className="text-slate-300 font-bold block text-[11px]">{field}:</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {values.map(v => (
                      <span key={v} className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(activeMaster.acceptedValues || {}).length === 0 && (
                <p className="text-slate-500 italic text-[11px]">No strict enum constraints defined</p>
              )}
            </div>
          </div>

          {/* Cross-Master Relationships & Approvals */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4.5 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <GitBranch size={15} /> Cross-Master Dependencies
            </h4>
            <div className="space-y-2 text-xs">
              {activeMaster.referenceMasterRelationships?.map((rel, idx) => (
                <div key={idx} className="bg-slate-800/80 p-2 rounded-xl border border-slate-700 text-[11px] flex items-center justify-between">
                  <span className="font-mono text-slate-300 font-bold">{rel.field}</span>
                  <ArrowRight size={13} className="text-slate-500" />
                  <span className="font-bold text-amber-300">{rel.targetMaster}</span>
                </div>
              ))}
              {(!activeMaster.referenceMasterRelationships || activeMaster.referenceMasterRelationships.length === 0) && (
                <p className="text-slate-500 italic text-[11px]">No cross-master relationships defined</p>
              )}
              
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-1">Approval Workflow:</span>
                <div className="flex flex-wrap gap-1">
                  {activeMaster.approvalWorkflow?.map(role => (
                    <span key={role} className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
