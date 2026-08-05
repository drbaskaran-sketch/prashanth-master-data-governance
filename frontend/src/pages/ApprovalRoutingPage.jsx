import React from 'react';
import { useGovernance } from '../context/GovernanceContext';

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
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 border border-teal-600 rounded-3xl p-6 shadow-md text-white">
        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/15 border border-white/30 text-teal-100 px-2.5 py-0.5 rounded-full">
          Multi-Department Approval Engine
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight mt-1">
          Field-Level &amp; Domain Approval Queue
        </h2>
        <p className="text-xs text-teal-100 font-medium mt-1">
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
              className={`bg-white border rounded-3xl p-5 shadow-sm transition-all ${
                isCurrent ? 'border-amber-500 bg-amber-50/20 ring-2 ring-amber-400/30' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{q.icon}</span>
                {isCurrent && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                    Your Active Role Queue
                  </span>
                )}
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mt-3">{q.name}</h3>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
                <span className="text-xs text-slate-500">Pending Signoffs:</span>
                <span className="text-sm font-extrabold num text-amber-700">{q.pendingCount} items</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
