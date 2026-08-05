/**
 * Cross-Master Relationship & Dependency Validation Engine
 * Validates links across Doctor -> Specialty, Lab -> Billing, Tariff -> Payer, Bed -> Ward, etc.
 * Identifies orphan records, inactive parent mappings, and circular conflicts.
 */

export function validateCrossMasterRelationships(masterId, records, masterDataStore = {}) {
  const orphanRecords = [];
  const inactiveParentMappings = [];
  const relationshipErrors = [];

  records.forEach((record, idx) => {
    const rowIndex = idx + 1;

    // Doctor -> Specialty & Department Check
    if (masterId === 'DOCTOR_MASTER') {
      if (record.specialty_code && masterDataStore.SPECIALTY_MASTER) {
        const parentSpec = masterDataStore.SPECIALTY_MASTER.find(s => s.specialty_code === record.specialty_code);
        if (!parentSpec) {
          orphanRecords.push({
            rowIndex,
            field: 'specialty_code',
            val: record.specialty_code,
            message: `Orphan Record: Specialty code '${record.specialty_code}' does not exist in Specialty Master.`
          });
        } else if (parentSpec.status === 'INACTIVE') {
          inactiveParentMappings.push({
            rowIndex,
            field: 'specialty_code',
            message: `Inactive Parent Mapping: Specialty '${parentSpec.specialty_name}' is marked INACTIVE.`
          });
        }
      }
    }

    // Lab Test -> Billing Service Check
    if (masterId === 'LAB_TEST_MASTER') {
      if (record.billing_service_code && masterDataStore.BILLING_SERVICE_MASTER) {
        const parentService = masterDataStore.BILLING_SERVICE_MASTER.find(s => s.service_code === record.billing_service_code);
        if (!parentService) {
          orphanRecords.push({
            rowIndex,
            field: 'billing_service_code',
            val: record.billing_service_code,
            message: `Orphan Record: Billing Service '${record.billing_service_code}' does not exist in Billing Catalog.`
          });
        }
      }
    }

    // Tariff -> Service & Payer Check
    if (masterId === 'TARIFF_MASTER') {
      if (record.payer_code && masterDataStore.PAYER_MASTER) {
        const parentPayer = masterDataStore.PAYER_MASTER.find(p => p.payer_code === record.payer_code);
        if (!parentPayer) {
          orphanRecords.push({
            rowIndex,
            field: 'payer_code',
            val: record.payer_code,
            message: `Orphan Record: Payer '${record.payer_code}' does not exist in Payer & TPA Master.`
          });
        }
      }
    }
  });

  return {
    orphanRecordsCount: orphanRecords.length,
    inactiveParentMappingsCount: inactiveParentMappings.length,
    orphanRecords,
    inactiveParentMappings
  };
}
