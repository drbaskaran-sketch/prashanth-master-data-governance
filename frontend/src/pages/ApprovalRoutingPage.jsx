import React from 'react';
import { useGovernance } from '../context/GovernanceContext';
import { UserCheck, ShieldCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function ApprovalRoutingPage() {
  const { activeRole, validationData } = useGovernance();

  const approvalQueues = [
    { role: 'MEDICAL_ADMIN', name: 'Medical Administration & Doctor Council Desk', pendingCount: 3, icon: '🩺' },
    { role: 'PATHOLOGIST', name: 'Laboratory Pathologist Signoff Desk', pendingCount: 2, icon: '🧪' },
    { role: 'RADIOLOGY_HEAD', name: 'Radiology Modality Protocol Desk', pendingCount: 1, icon: '🩻' },
    { role: 'FINANCE_CONTROLLER', name: 'Finance, HSN/SAC & Tariff Signoff Desk', pendingCount: 5, icon: '🧾' },
    { role: 'CHIEF_PHARMACIST', name: 'Chief Pharmacist LASA & Schedule Desk', pendingCount: 2, icon: '💊' },
    { role: 'HIS_IT_LEAD', name: 'HIS/IT Integration & Schema Desk', pendingCount: 0, icon: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full">
          Multi-Department Approval Engine
        </span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
          Field-Level &amp; Domain Approval Queue
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Enforces multi-department signoff when master records modify clinical, financial, or technical attributes
        </p>
      </div>

      {/* Queue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {approvalQueues.map(q => {
          const isCurrent = activeRole === q.role;
          return (
            <div
              key={q.role}
              className={`bg-slate-900 border rounded-3xl p-5 shadow-xl transition-all ${
                isCurrent ? 'border-amber-500 shadow-amber-500/10' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{q.icon}</span>
                {isCurrent && (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    Your Active Role Queue
                  </span>
                )}
              </div>
              <h3 className="text-sm font-extrabold text-white mt-3">{q.name}</h3>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400">Pending Signoffs:</span>
                <span className="text-sm font-extrabold num text-amber-300">{q.pendingCount} items</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
