/**
 * Domain-Specific Rule Packs
 * Specialized validation rules for Doctor, Laboratory, Radiology, Cardiology, Procedure, Billing/Tariff, and Pharmacy/Stores.
 */

export function executeDoctorRulePack(record) {
  const errors = [];
  const warnings = [];

  // Rule 1: Registration number mandatory for medical consultants
  if (!record.medical_registration_no || String(record.medical_registration_no).trim() === '') {
    errors.push({
      type: 'DOCTOR_REGISTRATION_MISSING',
      message: 'Medical Registration Number is mandatory for Doctor master.'
    });
  }

  // Rule 2: Registration Council verification
  if (!record.registration_council) {
    warnings.push({
      type: 'REGISTRATION_COUNCIL_WARNING',
      message: 'Medical Council state/national authority is missing.'
    });
  }

  // Rule 3: Do not merge based only on similar names - enforce registration number check
  if (record.is_fuzzy_name_match && !record.medical_registration_no_matched) {
    warnings.push({
      type: 'NO_AUTO_MERGE_NAME_SIMILARITY',
      message: 'Doctor names are similar, but registration numbers differ. Auto-merging prohibited — requires authorised manual review.'
    });
  }

  // Rule 4: Consultation fee sanity check
  if (record.consultation_fee !== undefined && Number(record.consultation_fee) < 0) {
    errors.push({
      type: 'INVALID_CONSULTATION_FEE',
      message: 'Consultation fee cannot be negative.'
    });
  }

  return { errors, warnings, approvalRole: 'MEDICAL_ADMIN' };
}

export function executeLaboratoryRulePack(record) {
  const errors = [];
  const warnings = [];

  // Rule 1: Clinical reference range or reporting unit check
  if (!record.reporting_unit) {
    warnings.push({
      type: 'MISSING_REPORTING_UNIT',
      message: 'Laboratory test reporting unit is not specified.'
    });
  }

  // Rule 2: Critical Value configuration check
  if (record.critical_high && record.critical_low && Number(record.critical_low) >= Number(record.critical_high)) {
    errors.push({
      type: 'INVALID_CRITICAL_RANGE',
      message: 'Critical Low value must be strictly less than Critical High value.'
    });
  }

  // Rule 3: NABL accreditation flag check
  if (record.is_nabl_accredited === undefined) {
    warnings.push({
      type: 'NABL_STATUS_UNSPECIFIED',
      message: 'NABL scope accreditation status not specified.'
    });
  }

  return { errors, warnings, approvalRole: 'PATHOLOGIST' };
}

export function executeRadiologyRulePack(record) {
  const errors = [];
  const warnings = [];

  // Rule 1: Modality & Body Part pairing
  if (!record.modality || !record.body_part) {
    errors.push({
      type: 'MISSING_MODALITY_BODYPART',
      message: 'Both Modality (CT/MRI/X-Ray) and Body Part are required for Radiology.'
    });
  }

  // Rule 2: Contrast protocol definition
  if (record.is_contrast && !record.protocol_notes) {
    warnings.push({
      type: 'CONTRAST_PROTOCOL_MISSING',
      message: 'Contrast study indicated without detailed preparation protocol notes.'
    });
  }

  return { errors, warnings, approvalRole: 'RADIOLOGY_HEAD' };
}

export function executeProcedureRulePack(record) {
  const errors = [];
  const warnings = [];

  // Rule 1: OT requirement vs Anaesthesia type
  if (record.classification === 'MAJOR' || record.classification === 'ULTRA_MAJOR') {
    if (!record.ot_required) {
      warnings.push({
        type: 'MAJOR_PROCEDURE_OT_WARNING',
        message: 'Major procedure defined without Operation Theatre requirement.'
      });
    }
  }

  return { errors, warnings, approvalRole: 'CLINICAL_HOD' };
}

export function executeBillingTariffRulePack(record) {
  const errors = [];
  const warnings = [];

  // Rule 1: Tariff rate non-negative check
  if (record.rate !== undefined && Number(record.rate) <= 0) {
    errors.push({
      type: 'INVALID_TARIFF_RATE',
      message: 'Tariff rate must be greater than zero.'
    });
  }

  // Rule 2: Effective date order check
  if (record.effective_from && record.effective_to) {
    if (new Date(record.effective_from) > new Date(record.effective_to)) {
      errors.push({
        type: 'INVALID_EFFECTIVE_DATE_RANGE',
        message: 'Effective From date cannot be after Effective To date.'
      });
    }
  }

  return { errors, warnings, approvalRole: 'FINANCE_CONTROLLER' };
}

export function executeDomainRulePack(domain, record) {
  switch (domain) {
    case 'CLINICAL_STAFF':
      return executeDoctorRulePack(record);
    case 'LABORATORY':
      return executeLaboratoryRulePack(record);
    case 'RADIOLOGY':
      return executeRadiologyRulePack(record);
    case 'CLINICAL_OPERATIONS':
      return executeProcedureRulePack(record);
    case 'FINANCE_TARIFFS':
    case 'FINANCE_BILLING':
      return executeBillingTariffRulePack(record);
    default:
      return { errors: [], warnings: [], approvalRole: 'DATA_ADMIN' };
  }
}
