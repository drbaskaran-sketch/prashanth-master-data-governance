/**
 * Master Registry Database & Metadata Configuration Engine
 * Configurable schema registry supporting 24+ Hospital Masters.
 * Allows Administrators to register new masters purely through configuration.
 */

export const MASTER_REGISTRY = {
  // 1. DOCTOR MASTER
  'DOCTOR_MASTER': {
    masterId: 'DOCTOR_MASTER',
    masterName: 'Doctor Master',
    domain: 'CLINICAL_STAFF',
    description: 'Central registry of consultants, visiting specialists, and medical officers',
    sourceSystem: 'Kranium HIS',
    sourceVersion: 'v4.2',
    primaryKey: 'doctor_code',
    candidateBusinessKeys: ['medical_registration_no', 'doctor_code'],
    requiredFields: ['doctor_code', 'doctor_name', 'specialty_code', 'department_code', 'medical_registration_no', 'registration_council'],
    optionalFields: ['salutation', 'subspecialty', 'qualification', 'employment_status', 'branch_availability', 'consultation_type', 'consultation_fee', 'revenue_share_pct', 'status'],
    fieldTypes: {
      doctor_code: 'STRING', doctor_name: 'STRING', salutation: 'STRING',
      specialty_code: 'STRING', subspecialty: 'STRING', department_code: 'STRING',
      medical_registration_no: 'STRING', registration_council: 'STRING',
      qualification: 'STRING', employment_status: 'ENUM', branch_availability: 'ARRAY',
      consultation_type: 'ENUM', consultation_fee: 'NUMBER', revenue_share_pct: 'NUMBER',
      status: 'STATUS'
    },
    fieldAliases: {
      'doctor_code': ['doc_id', 'doctor_id', 'code', 'emp_doc_code'],
      'doctor_name': ['name', 'doc_name', 'doctor', 'full_name'],
      'medical_registration_no': ['reg_no', 'mcn_no', 'council_reg_no', 'medical_reg_num']
    },
    acceptedValues: {
      employment_status: ['FULL_TIME', 'PART_TIME', 'VISITING', 'HONORARY', 'RESIDENT'],
      consultation_type: ['GENERAL', 'SPECIALIST', 'SUPER_SPECIALIST', 'TELE_CONSULT'],
      status: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ON_LEAVE']
    },
    referenceMasterRelationships: [
      { field: 'specialty_code', targetMaster: 'SPECIALTY_MASTER', targetField: 'specialty_code' },
      { field: 'department_code', targetMaster: 'DEPARTMENT_MASTER', targetField: 'dept_code' }
    ],
    duplicateMatchingFields: ['medical_registration_no'],
    fuzzyMatchingFields: ['doctor_name'],
    approvalWorkflow: ['CLINICAL_HEAD', 'MEDICAL_ADMIN'],
    dataOwner: 'Medical Administration',
    clinicalOwner: 'Medical Director',
    financeOwner: 'Doctor Accounts Team',
    itOwner: 'HIS Team'
  },

  // 2. PHARMACY MASTER (Template 1)
  'PHARMACY_MASTER': {
    masterId: 'PHARMACY_MASTER',
    masterName: 'Pharmacy Item Master',
    domain: 'PHARMACY',
    description: 'Drug formulary, salt compositions, schedule, and LASA safety classifications',
    sourceSystem: 'Kranium Pharmacy',
    sourceVersion: 'v3.1',
    primaryKey: 'item_code',
    candidateBusinessKeys: ['barcode', 'item_code'],
    requiredFields: ['item_code', 'item_name', 'generic_salt_name', 'schedule_type', 'unit_of_measure', 'manufacturer', 'hsn_code', 'gst_pct'],
    optionalFields: ['brand_name', 'strength', 'dosage_form', 'is_lasa', 'is_narcotic', 'is_high_alert', 'storage_temp', 'mrp', 'purchase_rate', 'status'],
    fieldTypes: {
      item_code: 'STRING', item_name: 'STRING', generic_salt_name: 'STRING',
      schedule_type: 'ENUM', unit_of_measure: 'STRING', manufacturer: 'STRING',
      hsn_code: 'STRING', gst_pct: 'NUMBER', is_lasa: 'BOOLEAN', is_narcotic: 'BOOLEAN',
      is_high_alert: 'BOOLEAN', mrp: 'NUMBER', purchase_rate: 'NUMBER', status: 'STATUS'
    },
    fieldAliases: {
      'item_code': ['drug_code', 'pharma_code', 'sku', 'material_code'],
      'item_name': ['drug_name', 'medicine_name', 'trade_name'],
      'generic_salt_name': ['generic_name', 'salt', 'composition']
    },
    acceptedValues: {
      schedule_type: ['SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X', 'SCHEDULE_G', 'OTC'],
      status: ['ACTIVE', 'INACTIVE', 'BANNED', 'DISCONTINUED']
    },
    referenceMasterRelationships: [
      { field: 'hsn_code', targetMaster: 'TAX_HSN_MASTER', targetField: 'hsn_code' }
    ],
    duplicateMatchingFields: ['item_name', 'generic_salt_name', 'strength'],
    fuzzyMatchingFields: ['item_name'],
    approvalWorkflow: ['CHIEF_PHARMACIST', 'FINANCE'],
    dataOwner: 'Pharmacy Department',
    clinicalOwner: 'Chief Pharmacist',
    financeOwner: 'Finance Controller',
    itOwner: 'Pharmacy Systems Lead'
  },

  // 3. STORES & CONSUMABLES MASTER (Template 2)
  'STORES_MASTER': {
    masterId: 'STORES_MASTER',
    masterName: 'Stores & Consumables Master',
    domain: 'SUPPLY_CHAIN',
    description: 'Medical and non-medical consumables, surgical items, and general store inventory',
    sourceSystem: 'Kranium Materials',
    sourceVersion: 'v2.0',
    primaryKey: 'store_item_code',
    candidateBusinessKeys: ['store_item_code', 'part_number'],
    requiredFields: ['store_item_code', 'item_description', 'category', 'sub_category', 'uom', 'hsn_code', 'gst_rate'],
    optionalFields: ['reorder_level', 'min_stock', 'max_stock', 'preferred_vendor_code', 'unit_cost', 'is_asset_linked', 'status'],
    fieldTypes: {
      store_item_code: 'STRING', item_description: 'STRING', category: 'ENUM',
      sub_category: 'STRING', uom: 'STRING', hsn_code: 'STRING', gst_rate: 'NUMBER',
      reorder_level: 'NUMBER', min_stock: 'NUMBER', max_stock: 'NUMBER', unit_cost: 'NUMBER', status: 'STATUS'
    },
    fieldAliases: {
      'store_item_code': ['item_code', 'mat_code', 'consumable_code'],
      'item_description': ['item_name', 'description', 'material_description']
    },
    acceptedValues: {
      category: ['SURGICAL_CONSUMABLE', 'GENERAL_STORE', 'BIOMEDICAL_CONSUMABLE', 'LAB_REAGENT', 'LINEN_LAUNDRY', 'PRINTING_STATIONERY'],
      status: ['ACTIVE', 'INACTIVE', 'OBSOLETE']
    },
    referenceMasterRelationships: [
      { field: 'preferred_vendor_code', targetMaster: 'VENDOR_MASTER', targetField: 'vendor_code' }
    ],
    duplicateMatchingFields: ['item_description', 'category'],
    fuzzyMatchingFields: ['item_description'],
    approvalWorkflow: ['STORES_HEAD', 'FINANCE'],
    dataOwner: 'Materials Management',
    clinicalOwner: 'Nursing Operations Lead',
    financeOwner: 'Supply Chain Audit',
    itOwner: 'ERP Admin'
  },

  // 4. LABORATORY TEST MASTER
  'LAB_TEST_MASTER': {
    masterId: 'LAB_TEST_MASTER',
    masterName: 'Laboratory Test Master',
    domain: 'LABORATORY',
    description: 'Diagnostic pathology tests, methodologies, reference ranges, and critical limits',
    sourceSystem: 'Kranium LIS',
    sourceVersion: 'v4.0',
    primaryKey: 'test_code',
    candidateBusinessKeys: ['test_code', 'loinc_code'],
    requiredFields: ['test_code', 'test_name', 'section', 'specimen_type', 'collection_container', 'reporting_unit', 'billing_service_code'],
    optionalFields: ['methodology', 'reference_range_male', 'reference_range_female', 'critical_low', 'critical_high', 'fasting_required', 'tat_hours', 'is_nabl_accredited', 'is_outsourced', 'status'],
    fieldTypes: {
      test_code: 'STRING', test_name: 'STRING', section: 'ENUM', specimen_type: 'STRING',
      collection_container: 'STRING', reporting_unit: 'STRING', billing_service_code: 'STRING',
      fasting_required: 'BOOLEAN', tat_hours: 'NUMBER', is_nabl_accredited: 'BOOLEAN', is_outsourced: 'BOOLEAN', status: 'STATUS'
    },
    fieldAliases: {
      'test_code': ['lab_code', 'investigation_code', 'param_code'],
      'test_name': ['lab_test_name', 'investigation_name']
    },
    acceptedValues: {
      section: ['BIOCHEMISTRY', 'HEMATOLOGY', 'MICROBIOLOGY', 'HISTOPATHOLOGY', 'CYTOLOGY', 'CLINICAL_PATHOLOGY', 'MOLECULAR_DIAGNOSTICS'],
      status: ['ACTIVE', 'INACTIVE', 'DISCONTINUED']
    },
    referenceMasterRelationships: [
      { field: 'billing_service_code', targetMaster: 'BILLING_SERVICE_MASTER', targetField: 'service_code' }
    ],
    duplicateMatchingFields: ['test_name', 'section'],
    fuzzyMatchingFields: ['test_name'],
    approvalWorkflow: ['LAB_HEAD', 'PATHOLOGIST'],
    dataOwner: 'Central Laboratory',
    clinicalOwner: 'Chief Pathologist',
    financeOwner: 'Billing Admin',
    itOwner: 'LIS Admin'
  },

  // 5. RADIOLOGY INVESTIGATION MASTER
  'RADIOLOGY_MASTER': {
    masterId: 'RADIOLOGY_MASTER',
    masterName: 'Radiology Investigation Master',
    domain: 'RADIOLOGY',
    description: 'X-Ray, CT, MRI, Ultrasound, and PET-CT imaging investigations and protocols',
    sourceSystem: 'Kranium RIS/PACS',
    sourceVersion: 'v3.0',
    primaryKey: 'investigation_code',
    candidateBusinessKeys: ['investigation_code', 'cpt_code'],
    requiredFields: ['investigation_code', 'study_name', 'modality', 'body_part', 'billing_service_code'],
    optionalFields: ['laterality', 'is_contrast', 'protocol_notes', 'prep_instructions', 'tat_hours', 'radiologist_required', 'status'],
    fieldTypes: {
      investigation_code: 'STRING', study_name: 'STRING', modality: 'ENUM', body_part: 'STRING',
      laterality: 'ENUM', is_contrast: 'BOOLEAN', tat_hours: 'NUMBER', radiologist_required: 'BOOLEAN', status: 'STATUS'
    },
    fieldAliases: {
      'investigation_code': ['rad_code', 'scan_code'],
      'study_name': ['procedure_name', 'radiology_name']
    },
    acceptedValues: {
      modality: ['XRAY', 'CT', 'MRI', 'ULTRASOUND', 'MAMMOGRAPHY', 'DEXA', 'PET_CT', 'FLOUROSCOPY'],
      laterality: ['LEFT', 'RIGHT', 'BILATERAL', 'NOT_APPLICABLE'],
      status: ['ACTIVE', 'INACTIVE']
    },
    referenceMasterRelationships: [
      { field: 'billing_service_code', targetMaster: 'BILLING_SERVICE_MASTER', targetField: 'service_code' }
    ],
    duplicateMatchingFields: ['study_name', 'modality'],
    fuzzyMatchingFields: ['study_name'],
    approvalWorkflow: ['RADIOLOGY_HEAD', 'CHIEF_RADIOLOGIST'],
    dataOwner: 'Radiology Department',
    clinicalOwner: 'Chief Radiologist',
    financeOwner: 'Billing Lead',
    itOwner: 'RIS/PACS Lead'
  },

  // 6. PROCEDURE MASTER
  'PROCEDURE_MASTER': {
    masterId: 'PROCEDURE_MASTER',
    masterName: 'Procedure Master',
    domain: 'CLINICAL_OPERATIONS',
    description: 'Surgical, interventional, and non-surgical procedures with OT requirements',
    sourceSystem: 'Kranium OT',
    sourceVersion: 'v2.5',
    primaryKey: 'procedure_code',
    candidateBusinessKeys: ['procedure_code', 'icd_procedure_code'],
    requiredFields: ['procedure_code', 'procedure_name', 'specialty_code', 'classification', 'anaesthesia_type', 'billing_service_code'],
    optionalFields: ['ot_required', 'laterality_required', 'expected_duration_mins', 'standard_consumables_template', 'implant_required', 'consent_template_id', 'status'],
    fieldTypes: {
      procedure_code: 'STRING', procedure_name: 'STRING', specialty_code: 'STRING',
      classification: 'ENUM', anaesthesia_type: 'ENUM', ot_required: 'BOOLEAN',
      expected_duration_mins: 'NUMBER', implant_required: 'BOOLEAN', status: 'STATUS'
    },
    fieldAliases: {
      'procedure_code': ['surg_code', 'op_code'],
      'procedure_name': ['surgery_name', 'operation_name']
    },
    acceptedValues: {
      classification: ['MINOR', 'MAJOR', 'COMPLEX_MAJOR', 'ULTRA_MAJOR', 'DAY_CARE'],
      anaesthesia_type: ['LOCAL', 'REGIONAL', 'SPINAL', 'GENERAL', 'SEDATION', 'NONE'],
      status: ['ACTIVE', 'INACTIVE']
    },
    referenceMasterRelationships: [
      { field: 'specialty_code', targetMaster: 'SPECIALTY_MASTER', targetField: 'specialty_code' },
      { field: 'billing_service_code', targetMaster: 'BILLING_SERVICE_MASTER', targetField: 'service_code' }
    ],
    duplicateMatchingFields: ['procedure_name', 'specialty_code'],
    fuzzyMatchingFields: ['procedure_name'],
    approvalWorkflow: ['CLINICAL_HOD', 'SURGICAL_COMMITTEE'],
    dataOwner: 'Operation Theatre Dept',
    clinicalOwner: 'Surgical HOD',
    financeOwner: 'Revenue Integrity Lead',
    itOwner: 'HIS Admin'
  },

  // 7. BILLING SERVICE MASTER
  'BILLING_SERVICE_MASTER': {
    masterId: 'BILLING_SERVICE_MASTER',
    masterName: 'Billing Service Master',
    domain: 'FINANCE_BILLING',
    description: 'Central hospital billing catalog for all billable services and procedures',
    sourceSystem: 'Kranium Billing',
    sourceVersion: 'v5.0',
    primaryKey: 'service_code',
    candidateBusinessKeys: ['service_code'],
    requiredFields: ['service_code', 'service_name', 'service_group', 'department_code', 'hsn_sac_code', 'gst_rate'],
    optionalFields: ['revenue_center', 'cost_center', 'is_discountable', 'is_package_includable', 'status'],
    fieldTypes: {
      service_code: 'STRING', service_name: 'STRING', service_group: 'ENUM',
      department_code: 'STRING', hsn_sac_code: 'STRING', gst_rate: 'NUMBER',
      is_discountable: 'BOOLEAN', is_package_includable: 'BOOLEAN', status: 'STATUS'
    },
    fieldAliases: {
      'service_code': ['bill_code', 'charge_code'],
      'service_name': ['service_description', 'charge_name']
    },
    acceptedValues: {
      service_group: ['CONSULTATION', 'LABORATORY', 'RADIOLOGY', 'CARDIOLOGY', 'SURGERY', 'ROOM_RENT', 'NURSING', 'EQUIPMENT', 'MISC'],
      status: ['ACTIVE', 'INACTIVE']
    },
    referenceMasterRelationships: [
      { field: 'department_code', targetMaster: 'DEPARTMENT_MASTER', targetField: 'dept_code' }
    ],
    duplicateMatchingFields: ['service_name', 'service_group'],
    fuzzyMatchingFields: ['service_name'],
    approvalWorkflow: ['FINANCE_CONTROLLER', 'BILLING_HEAD'],
    dataOwner: 'Billing Department',
    clinicalOwner: 'Operations Director',
    financeOwner: 'Finance Controller',
    itOwner: 'Billing Systems Manager'
  },

  // 8. TARIFF MASTER
  'TARIFF_MASTER': {
    masterId: 'TARIFF_MASTER',
    masterName: 'Tariff Master',
    domain: 'FINANCE_TARIFFS',
    description: 'Base rates, branch tariffs, corporate rates, and insurance payer pricing matrix',
    sourceSystem: 'Kranium Tariff',
    sourceVersion: 'v4.5',
    primaryKey: 'tariff_id',
    candidateBusinessKeys: ['service_code', 'payer_code', 'branch_code', 'room_category'],
    requiredFields: ['tariff_id', 'service_code', 'branch_code', 'payer_code', 'room_category', 'rate', 'effective_from'],
    optionalFields: ['effective_to', 'copay_pct', 'approval_limit', 'status'],
    fieldTypes: {
      tariff_id: 'STRING', service_code: 'STRING', branch_code: 'STRING',
      payer_code: 'STRING', room_category: 'STRING', rate: 'NUMBER',
      effective_from: 'DATE', effective_to: 'DATE', copay_pct: 'NUMBER', status: 'STATUS'
    },
    fieldAliases: {
      'rate': ['amount', 'price', 'tariff_rate', 'gross_rate'],
      'payer_code': ['company_code', 'tpa_code', 'insurance_id']
    },
    acceptedValues: {
      status: ['ACTIVE', 'EXPIRED', 'PENDING_APPROVAL']
    },
    referenceMasterRelationships: [
      { field: 'service_code', targetMaster: 'BILLING_SERVICE_MASTER', targetField: 'service_code' },
      { field: 'payer_code', targetMaster: 'PAYER_MASTER', targetField: 'payer_code' },
      { field: 'branch_code', targetMaster: 'BRANCH_MASTER', targetField: 'branch_code' }
    ],
    duplicateMatchingFields: ['service_code', 'payer_code', 'branch_code', 'room_category', 'effective_from'],
    fuzzyMatchingFields: [],
    approvalWorkflow: ['FINANCE_HEAD', 'INSURANCE_HEAD'],
    dataOwner: 'Tariff & Pricing Desk',
    clinicalOwner: 'Medical Director',
    financeOwner: 'Chief Financial Officer',
    itOwner: 'Tariff Engine Lead'
  },

  // 9. CARDIOLOGY DIAGNOSTIC MASTER
  'CARDIOLOGY_MASTER': {
    masterId: 'CARDIOLOGY_MASTER',
    masterName: 'Cardiology Diagnostic Master',
    domain: 'DIAGNOSTICS',
    description: 'ECG, Echo, TMT, Holter, and Invasive/Non-invasive Cardiac diagnostic tests',
    sourceSystem: 'Kranium Cardiology',
    sourceVersion: 'v1.5',
    primaryKey: 'cardio_code',
    candidateBusinessKeys: ['cardio_code'],
    requiredFields: ['cardio_code', 'test_name', 'category', 'billing_service_code'],
    optionalFields: ['equipment_dependency', 'reporting_cardiologist_req', 'tat_mins', 'status'],
    fieldTypes: {
      cardio_code: 'STRING', test_name: 'STRING', category: 'ENUM', billing_service_code: 'STRING',
      equipment_dependency: 'STRING', reporting_cardiologist_req: 'BOOLEAN', tat_mins: 'NUMBER', status: 'STATUS'
    },
    fieldAliases: { 'cardio_code': ['test_code', 'cardio_id'] },
    acceptedValues: {
      category: ['ECG', 'ECHO_DOPPLER', 'TMT', 'HOLTER_MONITORING', 'ABPM', 'CATH_LAB_PROCEDURE'],
      status: ['ACTIVE', 'INACTIVE']
    },
    referenceMasterRelationships: [
      { field: 'billing_service_code', targetMaster: 'BILLING_SERVICE_MASTER', targetField: 'service_code' }
    ],
    duplicateMatchingFields: ['test_name', 'category'],
    fuzzyMatchingFields: ['test_name'],
    approvalWorkflow: ['CARDIOLOGY_HOD', 'MEDICAL_ADMIN'],
    dataOwner: 'Cardiology Dept',
    clinicalOwner: 'Chief Cardiologist',
    financeOwner: 'Billing Manager',
    itOwner: 'HIS Admin'
  },

  // 10. PAYER, TPA & CORPORATE MASTER
  'PAYER_MASTER': {
    masterId: 'PAYER_MASTER',
    masterName: 'Payer, TPA & Corporate Master',
    domain: 'INSURANCE_CORPORATE',
    description: 'Insurance companies, Third Party Administrators (TPAs), and corporate tie-ups',
    sourceSystem: 'Kranium Insurance Desk',
    sourceVersion: 'v3.2',
    primaryKey: 'payer_code',
    candidateBusinessKeys: ['payer_code', 'pan_number', 'gstin'],
    requiredFields: ['payer_code', 'payer_name', 'payer_type', 'payment_terms_days', 'tds_pct'],
    optionalFields: ['tpa_associated', 'discount_contract_pct', 'credit_limit', 'status'],
    fieldTypes: {
      payer_code: 'STRING', payer_name: 'STRING', payer_type: 'ENUM',
      payment_terms_days: 'NUMBER', tds_pct: 'NUMBER', status: 'STATUS'
    },
    fieldAliases: { 'payer_code': ['company_id', 'tpa_id', 'payer_id'] },
    acceptedValues: {
      payer_type: ['INSURANCE_GIPSA', 'INSURANCE_PRIVATE', 'TPA', 'CORPORATE_DIRECT', 'GOVT_SCHEME', 'INTERNATIONAL'],
      status: ['ACTIVE', 'SUSPENDED', 'TERMINATED']
    },
    referenceMasterRelationships: [],
    duplicateMatchingFields: ['payer_name', 'payer_type'],
    fuzzyMatchingFields: ['payer_name'],
    approvalWorkflow: ['INSURANCE_HEAD', 'FINANCE'],
    dataOwner: 'Insurance & TPA Cell',
    clinicalOwner: 'Medical Director',
    financeOwner: 'Credit Control Head',
    itOwner: 'HIS Insurance Lead'
  },

  // 11. DEPARTMENT MASTER
  'DEPARTMENT_MASTER': {
    masterId: 'DEPARTMENT_MASTER',
    masterName: 'Department Master',
    domain: 'ORGANIZATION',
    description: 'Clinical, diagnostic, administrative, and support departments',
    sourceSystem: 'Kranium Core',
    sourceVersion: 'v1.0',
    primaryKey: 'dept_code',
    candidateBusinessKeys: ['dept_code'],
    requiredFields: ['dept_code', 'dept_name', 'dept_type'],
    optionalFields: ['hod_employee_code', 'cost_center_code', 'status'],
    fieldTypes: { dept_code: 'STRING', dept_name: 'STRING', dept_type: 'ENUM', status: 'STATUS' },
    fieldAliases: { 'dept_code': ['department_id', 'dept_id'] },
    acceptedValues: {
      dept_type: ['CLINICAL', 'DIAGNOSTIC', 'PARAMEDICAL', 'ADMINISTRATIVE', 'SUPPORT_SERVICE', 'PHARMACY_STORES'],
      status: ['ACTIVE', 'INACTIVE']
    },
    referenceMasterRelationships: [],
    duplicateMatchingFields: ['dept_name'],
    fuzzyMatchingFields: ['dept_name'],
    approvalWorkflow: ['OPERATIONS_DIRECTOR', 'HR_HEAD'],
    dataOwner: 'HR & Operations',
    clinicalOwner: 'Medical Director',
    financeOwner: 'Finance Controller',
    itOwner: 'Core HIS Admin'
  },

  // 12. SPECIALTY MASTER
  'SPECIALTY_MASTER': {
    masterId: 'SPECIALTY_MASTER',
    masterName: 'Specialty Master',
    domain: 'CLINICAL_SPECIALTY',
    description: 'Medical and surgical specialties and sub-specialties catalog',
    sourceSystem: 'Kranium Core',
    sourceVersion: 'v1.0',
    primaryKey: 'specialty_code',
    candidateBusinessKeys: ['specialty_code'],
    requiredFields: ['specialty_code', 'specialty_name', 'classification'],
    optionalFields: ['parent_specialty_code', 'description', 'status'],
    fieldTypes: { specialty_code: 'STRING', specialty_name: 'STRING', classification: 'ENUM', status: 'STATUS' },
    fieldAliases: { 'specialty_code': ['spec_code', 'spec_id'] },
    acceptedValues: {
      classification: ['BROAD_SPECIALTY', 'SUPER_SPECIALTY', 'ALLIED_HEALTH', 'DENTISTRY'],
      status: ['ACTIVE', 'INACTIVE']
    },
    referenceMasterRelationships: [],
    duplicateMatchingFields: ['specialty_name'],
    fuzzyMatchingFields: ['specialty_name'],
    approvalWorkflow: ['MEDICAL_DIRECTOR'],
    dataOwner: 'Medical Administration',
    clinicalOwner: 'Medical Board Chairman',
    financeOwner: 'Revenue Manager',
    itOwner: 'HIS Admin'
  },

  // 13. BRANCH & LOCATION MASTER
  'BRANCH_MASTER': {
    masterId: 'BRANCH_MASTER',
    masterName: 'Branch & Location Master',
    domain: 'ORGANIZATION',
    description: 'Hospital units, satellite centers, and branch locations',
    sourceSystem: 'Kranium Corporate',
    sourceVersion: 'v1.0',
    primaryKey: 'branch_code',
    candidateBusinessKeys: ['branch_code', 'gstin'],
    requiredFields: ['branch_code', 'branch_name', 'city', 'state', 'pincode', 'gstin'],
    optionalFields: ['address', 'license_no', 'bed_capacity', 'status'],
    fieldTypes: { branch_code: 'STRING', branch_name: 'STRING', city: 'STRING', state: 'STRING', gstin: 'STRING', bed_capacity: 'NUMBER', status: 'STATUS' },
    fieldAliases: { 'branch_code': ['unit_code', 'location_id', 'hospital_id'] },
    acceptedValues: { status: ['ACTIVE', 'UPCOMING', 'CLOSED'] },
    referenceMasterRelationships: [],
    duplicateMatchingFields: ['branch_name'],
    fuzzyMatchingFields: ['branch_name'],
    approvalWorkflow: ['BOARD_OF_DIRECTORS'],
    dataOwner: 'Corporate Operations',
    clinicalOwner: 'Group Medical Director',
    financeOwner: 'CFO',
    itOwner: 'Enterprise Architect'
  },

  // 14. ROOM, WARD & BED MASTER
  'BED_MASTER': {
    masterId: 'BED_MASTER',
    masterName: 'Room, Ward & Bed Master',
    domain: 'INPATIENT_OPERATIONS',
    description: 'Bed inventory, wards, rooms, and bed category classifications',
    sourceSystem: 'Kranium IPD',
    sourceVersion: 'v3.0',
    primaryKey: 'bed_code',
    candidateBusinessKeys: ['bed_code'],
    requiredFields: ['bed_code', 'room_number', 'ward_name', 'bed_category', 'branch_code'],
    optionalFields: ['floor', 'extension_number', 'is_oxygen_equipped', 'is_ventilator_equipped', 'status'],
    fieldTypes: { bed_code: 'STRING', room_number: 'STRING', ward_name: 'STRING', bed_category: 'ENUM', branch_code: 'STRING', status: 'STATUS' },
    fieldAliases: { 'bed_code': ['bed_id', 'bed_no'] },
    acceptedValues: {
      bed_category: ['GENERAL_WARD', 'SEMI_PRIVATE', 'SINGLE_PRIVATE', 'DELUXE_SUITE', 'SUITE', 'ICU', 'CCU', 'NICU', 'PICU', 'EMERGENCY'],
      status: ['OCCUPIED', 'VACANT', 'MAINTENANCE', 'BLOCKED', 'INACTIVE']
    },
    referenceMasterRelationships: [
      { field: 'branch_code', targetMaster: 'BRANCH_MASTER', targetField: 'branch_code' }
    ],
    duplicateMatchingFields: ['bed_code', 'branch_code'],
    fuzzyMatchingFields: [],
    approvalWorkflow: ['NURSING_SUPERINTENDENT', 'FACILITY_HEAD'],
    dataOwner: 'Inpatient Operations',
    clinicalOwner: 'Nursing Director',
    financeOwner: 'Billing Controller',
    itOwner: 'IPD Systems Lead'
  }
};

export function getMasterDefinition(masterId) {
  return MASTER_REGISTRY[masterId] || null;
}

export function getAllRegisteredMasters() {
  return Object.values(MASTER_REGISTRY);
}
