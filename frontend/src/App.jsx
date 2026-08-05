import React, { useState } from 'react';
import { GovernanceProvider, useGovernance } from './context/GovernanceContext';
import NavigationHeader from './components/NavigationHeader';
import UploadFlowModal from './components/UploadFlowModal';
import RegisterMasterModal from './components/RegisterMasterModal';

import CorrectionDashboardPage from './pages/CorrectionDashboardPage';
import MasterRegistryPage from './pages/MasterRegistryPage';
import DomainWorkspacesPage from './pages/DomainWorkspacesPage';
import ApprovalRoutingPage from './pages/ApprovalRoutingPage';
import ExportIntegrationPage from './pages/ExportIntegrationPage';

import { Table, Database, Stethoscope, UserCheck, Download } from 'lucide-react';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('CORRECTION_GRID');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const tabs = [
    { id: 'CORRECTION_GRID', label: 'Correction & Sanitization Grid', icon: Table },
    { id: 'MASTER_REGISTRY', label: 'Master Registry Schemas', icon: Database },
    { id: 'DOMAIN_WORKSPACES', label: 'Domain Review Workspaces', icon: Stethoscope },
    { id: 'APPROVAL_ROUTING', label: 'Multi-Role Approval Queues', icon: UserCheck },
    { id: 'EXPORT_INTEGRATION', label: 'Exports & HIS Adapters', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <NavigationHeader
        onOpenUploadModal={() => setIsUploadOpen(true)}
        onOpenRegisterModal={() => setIsRegisterOpen(true)}
      />

      {/* Navigation Sub-Tab Bar */}
      <div className="bg-white/90 border-b border-slate-200 px-6 pt-2 sticky top-[57px] z-30 backdrop-blur-md shadow-xs">
        <div className="max-w-[1720px] mx-auto flex gap-2 overflow-x-auto">
          {tabs.map(t => {
            const IconComp = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                  isSelected
                    ? 'border-teal-600 text-teal-700 bg-teal-50/80 rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <IconComp size={15} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-[1720px] w-full mx-auto px-6 py-6 flex-1">
        {activeTab === 'CORRECTION_GRID' && <CorrectionDashboardPage onOpenUploadModal={() => setIsUploadOpen(true)} />}
        {activeTab === 'MASTER_REGISTRY' && <MasterRegistryPage onOpenRegisterModal={() => setIsRegisterOpen(true)} />}
        {activeTab === 'DOMAIN_WORKSPACES' && <DomainWorkspacesPage />}
        {activeTab === 'APPROVAL_ROUTING' && <ApprovalRoutingPage />}
        {activeTab === 'EXPORT_INTEGRATION' && <ExportIntegrationPage />}
      </main>

      {/* Modals */}
      <UploadFlowModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <RegisterMasterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <GovernanceProvider>
      <DashboardContent />
    </GovernanceProvider>
  );
}
