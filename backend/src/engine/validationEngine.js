/**
 * Universal Master Data Validation Engine
 * Executes Schema, Data Type, Uniqueness, Exact/Fuzzy Duplicate, and Structural Checks.
 */

import { getMasterDefinition } from '../registry/masterRegistry.js';

// Levenshtein Distance for Fuzzy Match Detection
function levenshteinDistance(a, b) {
  if (!a || !b) return (a || b).length;
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

function stringSimilarity(s1, s2) {
  const str1 = String(s1 || '').toLowerCase().trim();
  const str2 = String(s2 || '').toLowerCase().trim();
  if (str1 === str2) return 1.0;
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(str1, str2);
  return 1.0 - dist / maxLen;
}

export function validateMasterDataset(masterId, dataset = []) {
  const masterDef = getMasterDefinition(masterId);
  if (!masterDef) {
    return {
      success: false,
      error: `Unknown Master ID: ${masterId}`
    };
  }

  const results = [];
  const primaryKeySeen = new Map();
  const normalisedNamesSeen = new Map();
  const errorsSummary = {
    totalRecords: dataset.length,
    validCount: 0,
    invalidCount: 0,
    exactDuplicates: 0,
    fuzzyDuplicates: 0,
    missingRequired: 0,
    invalidTypes: 0,
    invalidEnums: 0
  };

  dataset.forEach((rawRow, index) => {
    const rowIndex = index + 1;
    const rowErrors = [];
    const rowWarnings = [];
    const normalizedRow = { ...rawRow };

    // 1. Column Alias Mapping
    Object.entries(masterDef.fieldAliases || {}).forEach(([canonicalField, aliases]) => {
      if (!normalizedRow[canonicalField]) {
        const foundAlias = aliases.find(alias => normalizedRow[alias] !== undefined);
        if (foundAlias) {
          normalizedRow[canonicalField] = normalizedRow[foundAlias];
        }
      }
    });

    // 2. Required Fields Validation
    masterDef.requiredFields.forEach(reqField => {
      const val = normalizedRow[reqField];
      if (val === undefined || val === null || String(val).trim() === '') {
        rowErrors.push({
          type: 'MISSING_REQUIRED_FIELD',
          field: reqField,
          message: `Field '${reqField}' is required.`
        });
        errorsSummary.missingRequired++;
      }
    });

    // 3. Field Type Validation
    Object.entries(masterDef.fieldTypes || {}).forEach(([field, expectedType]) => {
      const val = normalizedRow[field];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        if (expectedType === 'NUMBER') {
          if (isNaN(Number(val))) {
            rowErrors.push({
              type: 'INVALID_DATA_TYPE',
              field,
              message: `Field '${field}' must be a valid number. Got '${val}'.`
            });
            errorsSummary.invalidTypes++;
          }
        } else if (expectedType === 'BOOLEAN') {
          const lower = String(val).toLowerCase();
          if (!['true', 'false', '1', '0', 'yes', 'no'].includes(lower)) {
            rowErrors.push({
              type: 'INVALID_BOOLEAN',
              field,
              message: `Field '${field}' must be boolean (true/false, 1/0). Got '${val}'.`
            });
            errorsSummary.invalidTypes++;
          }
        } else if (expectedType === 'DATE') {
          if (isNaN(Date.parse(val))) {
            rowErrors.push({
              type: 'INVALID_DATE',
              field,
              message: `Field '${field}' must be a valid date string. Got '${val}'.`
            });
            errorsSummary.invalidTypes++;
          }
        }
      }
    });

    // 4. Accepted Enum Values Validation
    Object.entries(masterDef.acceptedValues || {}).forEach(([field, allowedList]) => {
      const val = normalizedRow[field];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        const strVal = String(val).toUpperCase().trim();
        if (!allowedList.includes(strVal)) {
          rowErrors.push({
            type: 'INVALID_ENUM_VALUE',
            field,
            message: `Field '${field}' value '${val}' is not in allowed list [${allowedList.join(', ')}].`
          });
          errorsSummary.invalidEnums++;
        }
      }
    });

    // 5. Primary Key Uniqueness & Exact Duplicate Check
    const pkVal = normalizedRow[masterDef.primaryKey];
    if (pkVal) {
      const pkString = String(pkVal).trim();
      if (primaryKeySeen.has(pkString)) {
        const prevRowIndex = primaryKeySeen.get(pkString);
        rowErrors.push({
          type: 'EXACT_DUPLICATE_PRIMARY_KEY',
          field: masterDef.primaryKey,
          message: `Duplicate Primary Key '${pkString}' already exists at Row #${prevRowIndex}.`
        });
        errorsSummary.exactDuplicates++;
      } else {
        primaryKeySeen.set(pkString, rowIndex);
      }
    }

    // 6. Normalised & Fuzzy Name Duplicates Check
    const nameField = masterDef.fuzzyMatchingFields?.[0];
    if (nameField && normalizedRow[nameField]) {
      const normName = String(normalizedRow[nameField]).toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normName.length > 3) {
        if (normalisedNamesSeen.has(normName)) {
          const matchPrevIndex = normalisedNamesSeen.get(normName);
          rowWarnings.push({
            type: 'NORMALISED_EXACT_DUPLICATE',
            field: nameField,
            message: `Name '${normalizedRow[nameField]}' matches Row #${matchPrevIndex} after normalization.`
          });
        } else {
          // Check fuzzy similarity against existing entries
          for (const [existingNorm, existingIndex] of normalisedNamesSeen.entries()) {
            const similarity = stringSimilarity(normName, existingNorm);
            if (similarity >= 0.85 && similarity < 1.0) {
              rowWarnings.push({
                type: 'FUZZY_DUPLICATE_SUSPECT',
                field: nameField,
                similarityPct: Math.round(similarity * 100),
                message: `Potential duplicate of Row #${existingIndex} (${Math.round(similarity * 100)}% match).`
              });
              errorsSummary.fuzzyDuplicates++;
              break;
            }
          }
          normalisedNamesSeen.set(normName, rowIndex);
        }
      }
    }

    const isValid = rowErrors.length === 0;
    if (isValid) errorsSummary.validCount++;
    else errorsSummary.invalidCount++;

    results.push({
      rowIndex,
      primaryKeyValue: pkVal || `ROW-${rowIndex}`,
      recordData: normalizedRow,
      isValid,
      errors: rowErrors,
      warnings: rowWarnings,
      approvalStatus: isValid ? 'PENDING_APPROVAL' : 'REQUIRES_CORRECTION'
    });
  });

  return {
    success: true,
    masterId,
    masterName: masterDef.masterName,
    summary: errorsSummary,
    results
  };
}
