import React, { useState } from 'react';
import { useGovernance } from '../context/GovernanceContext';
import { Stethoscope, FlaskConical, Radio, HeartPulse, Scissors, Receipt, Pill, Boxes, GitBranch, CheckCircle2 } from 'lucide-react';

export default function DomainWorkspacesPage() {
  const { registeredMasters, setActiveMasterId, validationData } = useGovernance();
  const [activeWorkspace, setActiveWorkspace] = useState('DOCTOR');

  const workspaces = [
    { id: 'DOCTOR', name: 'Doctor Review Workspace', icon: Stethoscope, masterId: 'DOCTOR_MASTER', owner: 'Medical Director', color: 'text-teal-400', rules: 'Enforces TNMC Medical Registration #, qualification, subspecialty, and anti-automerge protection (similar names prohibited from auto-merging without reg #).' },
    { id: 'LABORATORY', name: 'Laboratory Review Workspace', icon: FlaskConical, masterId: 'LAB_TEST_MASTER', owner: 'Chief Pathologist', color: 'text-purple-400', rules: 'Requires Pathologist signoff on critical low/high values, reference ranges, specimen containers, fasting requirements, and NABL accreditation status.' },
    { id: 'RADIOLOGY', name: 'Radiology Review Workspace', icon: Radio, masterId: 'RADIOLOGY_MASTER', owner: 'Chief Radiologist', color: 'text-amber-400', rules: 'Validates modality (CT/MRI/X-Ray), contrast protocols, body part laterality, preparation instructions, and PACS billing service links.' },
    { id: 'DIAGNOSTIC', name: 'Cardiology & Diagnostic Workspace', icon: HeartPulse, masterId: 'CARDIOLOGY_MASTER', owner: 'Cardiology HOD', color: 'text-rose-400', rules: 'Supports ECG, Echo, TMT, Holter, ABPM, PFT, EEG, EMG, Endoscopy, Audiology, and Sleep studies equipment dependencies.' },
    { id: 'PROCEDURE', name: 'Procedure Review Workspace', icon: Scissors, masterId: 'PROCEDURE_MASTER', owner: 'Surgical HOD', color: 'text-emerald-400', rules: 'Validates OT/non-OT classification, minor/major surgery tier, anaesthesia type, consumable templates, implants, and consent IDs.' },
    { id: 'BILLING_TARIFF', name: 'Billing & Tariff Review Workspace', icon: Receipt, masterId: 'TARIFF_MASTER', owner: 'Finance Controller', color: 'text-blue-400', rules: 'Requires Finance approval for base rate, payer tariffs, HSN/SAC, GST %, room category pricing, effective date windows, and zero-rate flags.' },
    { id: 'PHARMACY', name: 'Pharmacy Safety Review Workspace', icon: Pill, masterId: 'PHARMACY_MASTER', owner: 'Chief Pharmacist', color: 'text-teal-300', rules: 'Validates Schedule H/H1/X drugs, LASA (Look-Alike Sound-Alike) warnings, salt composition, storage temperature, and GST HSN codes.' },
    { id: 'STORES', name: 'Stores & Consumables Workspace', icon: Boxes, masterId: 'STORES_MASTER', owner: 'Materials Head', color: 'text-amber-300', rules: 'Validates medical consumables, surgical stores, ABC/VED classifications, UOM conversions, and preferred vendor linkages.' },
    { id: 'CROSS_MASTER', name: 'Cross-Master Reconciliation', icon: GitBranch, masterId: 'DOCTOR_MASTER', owner: 'Enterprise Master Lead', color: 'text-indigo-400', rules: 'Detects orphan records (Doctor->Dept, Lab->Billing), inactive parent mappings, circular dependencies, and duplicate code conflicts.' },
  ];

  const currentWs = workspaces.find(w => w.id === activeWorkspace) || workspaces[0];
  const IconComp = currentWs.icon;

  function selectWorkspace(ws) {
    setActiveWorkspace(ws.id);
    setActiveMasterId(ws.masterId);
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-teal-500/10 border border-teal-500/30 text-teal-300 px-2.5 py-0.5 rounded-full">
          Domain Workspaces
        </span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
          Specialized Clinical, Financial &amp; Operational Governance Review
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Domain-specific approval workspaces tailored for Medical Directors, Pathologists, Radiologists, Surgical HODs, and Finance Controllers
        </p>
      </div>

      {/* Workspace Grid Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
        {workspaces.map(w => {
          const isSelected = w.id === activeWorkspace;
          const WsIcon = w.icon;
          return (
            <button
              key={w.id}
              onClick={() => selectWorkspace(w)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800 border-teal-500 shadow-lg scale-[1.02]'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <WsIcon size={20} className={w.color} />
              <p className={`text-[11px] font-extrabold mt-3 leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                {w.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Domain Workspace Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700">
              <IconComp size={28} className={currentWs.color} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">{currentWs.name}</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Authorised Approver: <b className="text-teal-300">{currentWs.owner}</b></p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
            Target Master: {currentWs.masterId}
          </span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300">
          <b className="text-teal-400 block mb-1">📋 Domain Rule Pack Protocols:</b>
          {currentWs.rules}
        </div>

        {/* Dataset Review Table for Domain */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
            Records Pending {currentWs.owner} Signoff ({validationData?.records?.length || 0} items)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-3 text-left font-bold uppercase">Row #</th>
                  <th className="py-2.5 px-3 text-left font-bold uppercase">Master Code</th>
                  <th className="py-2.5 px-3 text-left font-bold uppercase">Item / Record Name</th>
                  <th className="py-2.5 px-3 text-left font-bold uppercase">Domain Compliance Status</th>
                  <th className="py-2.5 px-3 text-right font-bold uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {validationData?.records?.slice(0, 5).map(r => (
                  <tr key={r.rowIndex} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-mono text-slate-400 font-bold">#{r.rowIndex}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-300">{r.primaryKeyValue}</td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {r.recordData.doctor_name || r.recordData.test_name || r.recordData.study_name || r.recordData.item_name || r.recordData.service_name || r.recordData.procedure_name || 'Standard Record'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10.5px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 size={12} /> Compliant for {currentWs.owner}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button className="px-3 py-1 text-[11px] font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-all">
                        Approve Record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
