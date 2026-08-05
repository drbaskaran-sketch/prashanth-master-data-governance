import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const GovernanceContext = createContext();

export function GovernanceProvider({ children }) {
  const [registeredMasters, setRegisteredMasters] = useState([]);
  const [activeMasterId, setActiveMasterId] = useState('PHARMACY_MASTER');
  const [activeBranch, setActiveBranch] = useState('Velachery Main Hospital');
  const [activeRole, setActiveRole] = useState('MASTER_DATA_ADMIN');
  const [validationData, setValidationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Registered Masters from Backend
  async function loadMasterRegistry() {
    try {
      const res = await axios.get('/api/registry/masters');
      if (res.data?.success) {
        setRegisteredMasters(res.data.masters);
      }
    } catch (err) {
      console.error('Failed to load Master Registry:', err);
    }
  }

  // Trigger Validation Engine for Selected Master
  async function runValidation(masterId = activeMasterId, dataset = null) {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/governance/upload', {
        masterId,
        dataset,
        hospitalBranch: activeBranch,
        loadType: 'FULL_LOAD'
      });
      if (res.data?.success) {
        setValidationData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Validation execution failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMasterRegistry();
    runValidation('PHARMACY_MASTER');
  }, []);

  useEffect(() => {
    runValidation(activeMasterId);
  }, [activeMasterId]);

  return (
    <GovernanceContext.Provider
      value={{
        registeredMasters,
        activeMasterId,
        setActiveMasterId,
        activeBranch,
        setActiveBranch,
        activeRole,
        setActiveRole,
        validationData,
        loading,
        error,
        runValidation,
        loadMasterRegistry
      }}
    >
      {children}
    </GovernanceContext.Provider>
  );
}

export function useGovernance() {
  return useContext(GovernanceContext);
}
