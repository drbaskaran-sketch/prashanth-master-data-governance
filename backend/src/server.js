/**
 * Express Backend API Server
 * Prashanth Hospital Master Data Governance & Sanitization Platform
 */

import express from 'express';
import cors from 'cors';
import { MASTER_REGISTRY, getAllRegisteredMasters, getMasterDefinition } from './registry/masterRegistry.js';
import { validateMasterDataset } from './engine/validationEngine.js';
import { executeDomainRulePack } from './engine/rulePacks/domainRulePacks.js';
import { validateCrossMasterRelationships } from './engine/relationshipEngine.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-Memory Data Store for Uploaded Datasets & Master Tables
const dataStore = {
  datasets: {},
  customMasters: {}
};

// Seed initial demo data for Pharmacy, Stores, Doctor, Lab, Radiology, and Billing
function seedDemoData() {
  dataStore.datasets['PHARMACY_MASTER'] = [
    { item_code: 'MED-001', item_name: 'Paracetamol 500mg Tab', generic_salt_name: 'Paracetamol', schedule_type: 'OTC', unit_of_measure: 'STRIP', manufacturer: 'GSK', hsn_code: '30049099', gst_pct: 12, is_lasa: false, mrp: 20, status: 'ACTIVE' },
    { item_code: 'MED-002', item_name: 'Amoxicillin 500mg Cap', generic_salt_name: 'Amoxicillin Trihydrate', schedule_type: 'SCHEDULE_H', unit_of_measure: 'STRIP', manufacturer: 'Cipla', hsn_code: '30041010', gst_pct: 12, is_lasa: true, mrp: 85, status: 'ACTIVE' },
    { item_code: 'MED-002', item_name: 'Amoxicillin 500mg Cap (DUPLICATE PK)', generic_salt_name: 'Amoxicillin', schedule_type: 'SCHEDULE_H', unit_of_measure: 'STRIP', manufacturer: 'Cipla', hsn_code: '30041010', gst_pct: 12, status: 'ACTIVE' },
    { item_code: 'MED-004', item_name: 'Tramadol 50mg Inj', generic_salt_name: 'Tramadol HCl', schedule_type: 'SCHEDULE_H1', unit_of_measure: 'AMPOULE', manufacturer: 'Sun Pharma', hsn_code: '30049099', gst_pct: 12, is_narcotic: true, mrp: 45, status: 'ACTIVE' }
  ];

  dataStore.datasets['DOCTOR_MASTER'] = [
    { doctor_code: 'DOC-101', doctor_name: 'Dr. A. R. Baskaran', specialty_code: 'CARDIOLOGY', department_code: 'CARD_DEPT', medical_registration_no: 'TNMC-48920', registration_council: 'Tamil Nadu Medical Council', qualification: 'MD, DM (Cardiology)', employment_status: 'FULL_TIME', consultation_fee: 800, status: 'ACTIVE' },
    { doctor_code: 'DOC-102', doctor_name: 'Dr. A R Baskaran', specialty_code: 'CARDIOLOGY', department_code: 'CARD_DEPT', medical_registration_no: 'TNMC-48921', registration_council: 'Tamil Nadu Medical Council', qualification: 'MD', employment_status: 'FULL_TIME', consultation_fee: 800, status: 'ACTIVE' },
    { doctor_code: '', doctor_name: 'Dr. S. Ramesh', specialty_code: 'ORTHO', department_code: 'SURGERY', medical_registration_no: '', registration_council: '', qualification: 'MS (Ortho)', status: 'ACTIVE' }
  ];

  dataStore.datasets['LAB_TEST_MASTER'] = [
    { test_code: 'LAB-001', test_name: 'Complete Blood Count (CBC)', section: 'HEMATOLOGY', specimen_type: 'EDTA Whole Blood', collection_container: 'Purple Top', reporting_unit: 'cells/cu.mm', billing_service_code: 'SRV-LAB-01', is_nabl_accredited: true, status: 'ACTIVE' },
    { test_code: 'LAB-002', test_name: 'Fasting Blood Sugar (FBS)', section: 'BIOCHEMISTRY', specimen_type: 'Fluoride Plasma', collection_container: 'Grey Top', reporting_unit: 'mg/dL', billing_service_code: 'SRV-LAB-02', critical_low: 100, critical_high: 50, fasting_required: true, status: 'ACTIVE' }
  ];
}

seedDemoData();

// 1. Get Master Registry Schemas
app.get('/api/registry/masters', (req, res) => {
  const allMasters = [...getAllRegisteredMasters(), ...Object.values(dataStore.customMasters)];
  res.json({ success: true, count: allMasters.length, masters: allMasters });
});

app.get('/api/registry/masters/:masterId', (req, res) => {
  const master = getMasterDefinition(req.params.masterId) || dataStore.customMasters[req.params.masterId];
  if (!master) return res.status(404).json({ success: false, error: 'Master not found' });
  res.json({ success: true, master });
});

// 2. Register New Custom Master Dynamically (No App Build Required)
app.post('/api/registry/masters', (req, res) => {
  const { masterId, masterName, domain, description, primaryKey, requiredFields, fieldTypes } = req.body;
  if (!masterId || !masterName || !primaryKey) {
    return res.status(400).json({ success: false, error: 'masterId, masterName, and primaryKey are required.' });
  }

  const customMaster = {
    masterId: masterId.toUpperCase().replace(/\s+/g, '_'),
    masterName,
    domain: domain || 'CUSTOM',
    description: description || 'User-registered custom hospital master',
    sourceSystem: 'Custom Integration',
    sourceVersion: 'v1.0',
    primaryKey,
    candidateBusinessKeys: [primaryKey],
    requiredFields: requiredFields || [primaryKey],
    optionalFields: [],
    fieldTypes: fieldTypes || { [primaryKey]: 'STRING' },
    fieldAliases: {},
    acceptedValues: {},
    referenceMasterRelationships: [],
    duplicateMatchingFields: [primaryKey],
    fuzzyMatchingFields: [],
    approvalWorkflow: ['DATA_ADMIN'],
    dataOwner: 'Master Data Lead',
    clinicalOwner: 'Domain Owner',
    financeOwner: 'Finance Desk',
    itOwner: 'IT Admin'
  };

  dataStore.customMasters[customMaster.masterId] = customMaster;
  res.json({ success: true, message: 'New Master successfully registered in Master Registry!', master: customMaster });
});

// 3. Upload & Validate Master Dataset
app.post('/api/governance/upload', (req, res) => {
  const { masterId, dataset, hospitalBranch, loadType } = req.body;
  const targetDataset = dataset || dataStore.datasets[masterId] || [];

  const masterDef = getMasterDefinition(masterId) || dataStore.customMasters[masterId];
  if (!masterDef) return res.status(404).json({ success: false, error: 'Master definition not found.' });

  // Run Base Validation Engine
  const validationOutput = validateMasterDataset(masterId, targetDataset);

  // Run Domain Rule Pack
  validationOutput.results.forEach(row => {
    const domainRules = executeDomainRulePack(masterDef.domain, row.recordData);
    row.domainErrors = domainRules.errors;
    row.domainWarnings = domainRules.warnings;
    row.approvalRole = domainRules.approvalRole;
    if (domainRules.errors.length > 0) {
      row.isValid = false;
    }
  });

  // Run Cross-Master Relationship Engine
  const crossMasterResults = validateCrossMasterRelationships(masterId, targetDataset, dataStore.datasets);

  dataStore.datasets[masterId] = targetDataset;

  res.json({
    success: true,
    masterId,
    masterName: masterDef.masterName,
    hospitalBranch: hospitalBranch || 'All Branches',
    loadType: loadType || 'FULL_LOAD',
    summary: validationOutput.summary,
    crossMasterResults,
    records: validationOutput.results
  });
});

// 4. Approval Routing Endpoint
app.post('/api/governance/approve', (req, res) => {
  const { masterId, rowIndex, action, approverRole } = req.body;
  res.json({
    success: true,
    message: `Record #${rowIndex} for master ${masterId} marked as '${action}' by ${approverRole || 'Authorised Administrator'}.`,
    timestamp: new Date().toISOString()
  });
});

// 5. Export Kranium-Compatible & Clean CSV
app.get('/api/governance/export/:masterId', (req, res) => {
  const { masterId } = req.params;
  const dataset = dataStore.datasets[masterId] || [];
  const format = req.query.format || 'KRANIUM_CSV';

  if (format === 'JSON') {
    return res.json({ success: true, masterId, count: dataset.length, data: dataset });
  }

  // Generate CSV string
  if (dataset.length === 0) {
    return res.send('ITEM_CODE,ITEM_NAME,STATUS\n');
  }

  const headers = Object.keys(dataset[0]);
  const csvRows = [headers.join(',')];
  dataset.forEach(row => {
    const values = headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`);
    csvRows.push(values.join(','));
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${masterId}_${format}.csv"`);
  res.send(csvRows.join('\n'));
});

const PORT = 5050;
app.listen(PORT, () => {
  console.log(`🏥 Prashanth Hospital Master Data Governance Backend running on port ${PORT}`);
});
