import re
import pandas as pd
from rapidfuzz import fuzz, process

def detect_id_column(columns: list[str], master_type: str) -> str:
    m_lower = master_type.lower()
    
    for col in columns:
        c_lower = col.lower()
        if c_lower in ['stock_id', 'item_code', 'code', 'doctor_code', 'test_code', 'service_code', 'bed_code', 'store_code', 'payer_code', 'user_id', 'login_id', 'id']:
            return col
    
    keywords = ['code', 'id', 'no', 'number']
    for kw in keywords:
        for col in columns:
            if kw in col.lower():
                return col
                
    return columns[0] if columns else ""

def detect_description_column(columns: list[str]) -> str:
    for col in columns:
        c_lower = col.lower()
        if any(term in c_lower for term in ['name', 'description', 'desc', 'item', 'title', 'test', 'drug', 'label']):
            return col
    return columns[1] if len(columns) > 1 else (columns[0] if columns else "")

def analyze_dataset(df: pd.DataFrame, master_type: str, branch: str, file_warnings: list[str]) -> dict:
    total_records = len(df)
    columns = list(df.columns)
    
    id_col = detect_id_column(columns, master_type)
    desc_col = detect_description_column(columns)
    
    all_issues = []
    affected_rows_set = set()
    
    # Issue Counters
    count_critical = 0
    count_high = 0
    count_medium = 0
    count_duplicate_records = 0
    count_missing_fields = 0
    count_invalid_values = 0
    count_spelling_issues = 0
    count_casing_issues = 0
    count_dept_specific = 0
    
    # Track Duplicate IDs and Exact Repeated Rows
    id_tracker = {}
    exact_row_tracker = {}
    
    records = df.to_dict(orient='records')
    
    # 1. Exact Duplicate Rows Check
    for idx, row in enumerate(records):
        row_tuple = tuple(str(v).strip() for v in row.values())
        if row_tuple in exact_row_tracker:
            exact_row_tracker[row_tuple].append(idx)
        else:
            exact_row_tracker[row_tuple] = [idx]
            
    repeated_rows_count = 0
    for row_tuple, indices in exact_row_tracker.items():
        if len(indices) > 1:
            repeated_rows_count += (len(indices) - 1)
            for idx in indices[1:]:
                affected_rows_set.add(idx)
                count_duplicate_records += 1
                count_high += 1
                all_issues.append({
                    'row_index': idx + 1,
                    'issue_type': 'Exact Duplicate Row',
                    'field_name': 'ALL_FIELDS',
                    'original_value': str(records[idx]),
                    'suggested_correction': 'Remove identical duplicate row',
                    'priority': 'High',
                    'responsible_dept': master_type,
                    'category': 'Duplicate Records'
                })

    # 2. Duplicate IDs and Conflicting Duplicate IDs
    if id_col:
        for idx, row in enumerate(records):
            val = str(row.get(id_col, '')).strip()
            if val:
                if val in id_tracker:
                    id_tracker[val].append(idx)
                else:
                    id_tracker[val] = [idx]
        
        duplicate_id_count = 0
        for val, indices in id_tracker.items():
            if len(indices) > 1:
                duplicate_id_count += (len(indices) - 1)
                first_row = records[indices[0]]
                for idx in indices[1:]:
                    curr_row = records[idx]
                    is_conflict = any(str(curr_row.get(c, '')).strip() != str(first_row.get(c, '')).strip() for c in columns if c != id_col)
                    
                    affected_rows_set.add(idx)
                    count_duplicate_records += 1
                    
                    issue_title = 'Conflicting Duplicate ID' if is_conflict else 'Duplicate Record ID'
                    prio = 'Critical' if is_conflict else 'High'
                    if is_conflict:
                        count_critical += 1
                    else:
                        count_high += 1
                        
                    all_issues.append({
                        'row_index': idx + 1,
                        'issue_type': issue_title,
                        'field_name': id_col,
                        'original_value': val,
                        'suggested_correction': f'Resolve duplicate key conflict for ID {val}',
                        'priority': prio,
                        'responsible_dept': master_type,
                        'category': 'Duplicate Records'
                    })

    unique_ids_count = len(id_tracker) if id_col else total_records
    status_col = next((c for c in columns if 'status' in c.lower()), None)
    
    # 3. Row by Row Rules
    for idx, row in enumerate(records):
        row_num = idx + 1
        
        # Missing ID
        if id_col and not str(row.get(id_col, '')).strip():
            affected_rows_set.add(idx)
            count_missing_fields += 1
            count_critical += 1
            all_issues.append({
                'row_index': row_num,
                'issue_type': 'Missing Mandatory Identifier',
                'field_name': id_col,
                'original_value': '',
                'suggested_correction': 'Assign unique primary key/code',
                'priority': 'Critical',
                'responsible_dept': master_type,
                'category': 'Missing Fields'
            })
            
        # Missing Description
        if desc_col and not str(row.get(desc_col, '')).strip():
            affected_rows_set.add(idx)
            count_missing_fields += 1
            count_high += 1
            all_issues.append({
                'row_index': row_num,
                'issue_type': 'Missing Description',
                'field_name': desc_col,
                'original_value': '',
                'suggested_correction': 'Enter item/service description',
                'priority': 'High',
                'responsible_dept': master_type,
                'category': 'Missing Fields'
            })

        # Whitespace / Casing / Alphanumeric Formatting Checks
        for c in columns:
            val_str = str(row.get(c, ''))
            val_strip = val_str.strip()
            c_lower = c.lower()
            
            if not val_strip:
                continue

            # A. Whitespace Checks
            if val_str.startswith(' ') or val_str.endswith(' '):
                affected_rows_set.add(idx)
                count_spelling_issues += 1
                count_medium += 1
                all_issues.append({
                    'row_index': row_num,
                    'issue_type': 'Leading/Trailing Whitespace',
                    'field_name': c,
                    'original_value': val_str,
                    'suggested_correction': val_strip,
                    'priority': 'Medium',
                    'responsible_dept': master_type,
                    'category': 'Spelling and Standardisation'
                })
            elif '  ' in val_str:
                affected_rows_set.add(idx)
                count_spelling_issues += 1
                count_medium += 1
                all_issues.append({
                    'row_index': row_num,
                    'issue_type': 'Multiple Internal Spaces',
                    'field_name': c,
                    'original_value': val_str,
                    'suggested_correction': re.sub(r'\s+', ' ', val_str),
                    'priority': 'Medium',
                    'responsible_dept': master_type,
                    'category': 'Spelling and Standardisation'
                })

            # B. Casing & Alphanumeric Rules for Name Fields
            if any(k in c_lower for k in ['name', 'person', 'doctor', 'employee', 'user', 'staff', 'hod', 'manager']):
                # 1. Alphanumeric / Digits in Person Name
                if re.search(r'\d', val_strip):
                    affected_rows_set.add(idx)
                    count_casing_issues += 1
                    count_high += 1
                    cleaned_name = re.sub(r'\d+', '', val_strip).strip().title()
                    all_issues.append({
                        'row_index': row_num,
                        'issue_type': 'Numeric Digits in Name Field',
                        'field_name': c,
                        'original_value': val_strip,
                        'suggested_correction': cleaned_name if cleaned_name else 'Department Validation Required (Remove Digits)',
                        'priority': 'High',
                        'responsible_dept': master_type,
                        'category': 'Casing and Formatting'
                    })
                # 2. ALL CAPS Name
                elif val_strip.isupper() and len(val_strip) > 3 and any(char.isalpha() for char in val_strip):
                    affected_rows_set.add(idx)
                    count_casing_issues += 1
                    count_medium += 1
                    all_issues.append({
                        'row_index': row_num,
                        'issue_type': 'ALL CAPS Name Casing',
                        'field_name': c,
                        'original_value': val_strip,
                        'suggested_correction': val_strip.title(),
                        'priority': 'Medium',
                        'responsible_dept': master_type,
                        'category': 'Casing and Formatting'
                    })
                # 3. Lowercase Name
                elif val_strip.islower() and any(char.isalpha() for char in val_strip):
                    affected_rows_set.add(idx)
                    count_casing_issues += 1
                    count_medium += 1
                    all_issues.append({
                        'row_index': row_num,
                        'issue_type': 'Lowercase Name Casing',
                        'field_name': c,
                        'original_value': val_strip,
                        'suggested_correction': val_strip.title(),
                        'priority': 'Medium',
                        'responsible_dept': master_type,
                        'category': 'Casing and Formatting'
                    })

            # C. Rules for Login ID / User Identifier Fields
            if any(k in c_lower for k in ['login', 'username', 'user_id', 'login_id', 'emp_code', 'emp_id']):
                # 1. Whitespace in Login Identifier
                if ' ' in val_strip:
                    affected_rows_set.add(idx)
                    count_casing_issues += 1
                    count_high += 1
                    all_issues.append({
                        'row_index': row_num,
                        'issue_type': 'Whitespace Space in Login Identifier',
                        'field_name': c,
                        'original_value': val_strip,
                        'suggested_correction': re.sub(r'\s+', '', val_strip).lower(),
                        'priority': 'High',
                        'responsible_dept': master_type,
                        'category': 'Casing and Formatting'
                    })
                # 2. Uppercase Letters in Login Identifier
                elif any(char.isupper() for char in val_strip):
                    affected_rows_set.add(idx)
                    count_casing_issues += 1
                    count_medium += 1
                    all_issues.append({
                        'row_index': row_num,
                        'issue_type': 'Uppercase Letters in Login Identifier',
                        'field_name': c,
                        'original_value': val_strip,
                        'suggested_correction': val_strip.lower(),
                        'priority': 'Medium',
                        'responsible_dept': master_type,
                        'category': 'Casing and Formatting'
                    })
                # 3. Special Characters in Login Identifier
                elif re.search(r'[^a-zA-Z0-9._-]', val_strip):
                    affected_rows_set.add(idx)
                    count_casing_issues += 1
                    count_high += 1
                    all_issues.append({
                        'row_index': row_num,
                        'issue_type': 'Special Characters in Login Identifier',
                        'field_name': c,
                        'original_value': val_strip,
                        'suggested_correction': re.sub(r'[^a-zA-Z0-9._-]', '', val_strip).lower(),
                        'priority': 'High',
                        'responsible_dept': master_type,
                        'category': 'Casing and Formatting'
                    })

        # Invalid Status Check
        if status_col:
            st_val = str(row.get(status_col, '')).strip().upper()
            if st_val and st_val not in ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED', 'EXPIRED', 'PENDING']:
                affected_rows_set.add(idx)
                count_invalid_values += 1
                count_medium += 1
                all_issues.append({
                    'row_index': row_num,
                    'issue_type': 'Invalid Status Value',
                    'field_name': status_col,
                    'original_value': row.get(status_col, ''),
                    'suggested_correction': 'Set to ACTIVE or INACTIVE',
                    'priority': 'Medium',
                    'responsible_dept': master_type,
                    'category': 'Invalid Values'
                })

        # Department Specific Validation Rules
        m_type_upper = master_type.upper()
        
        # Pharmacy Rules
        if 'PHARMACY' in m_type_upper:
            sched_col = next((c for c in columns if 'schedule' in c.lower()), None)
            if sched_col:
                sch_val = str(row.get(sched_col, '')).strip().upper()
                if sch_val and sch_val not in ['OTC', 'SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X', 'NARCOTIC']:
                    affected_rows_set.add(idx)
                    count_dept_specific += 1
                    count_high += 1
                    all_issues.append({
                        'row_index': row_num,
                        'issue_type': 'Non-Standard Drug Schedule',
                        'field_name': sched_col,
                        'original_value': sch_val,
                        'suggested_correction': 'Department Validation Required (Schedule H/H1/X/OTC)',
                        'priority': 'High',
                        'responsible_dept': 'Pharmacy / Drug Controller',
                        'category': 'Department-Specific Review'
                    })
            name_val = str(row.get(desc_col, '')).lower() if desc_col else ''
            if any(term in name_val for term in ['mg', 'ml', 'tab', 'cap', 'inj']):
                if 'generic' in ''.join(columns).lower():
                    gen_col = next((c for c in columns if 'generic' in c.lower()), None)
                    if gen_col and not str(row.get(gen_col, '')).strip():
                        affected_rows_set.add(idx)
                        count_dept_specific += 1
                        count_medium += 1
                        all_issues.append({
                            'row_index': row_num,
                            'issue_type': 'Missing Generic Salt Mapping',
                            'field_name': gen_col,
                            'original_value': '',
                            'suggested_correction': 'Department Validation Required (Assign Salt Name)',
                            'priority': 'Medium',
                            'responsible_dept': 'Chief Pharmacist',
                            'category': 'Department-Specific Review'
                        })

        # Doctor Rules
        elif 'DOCTOR' in m_type_upper:
            reg_col = next((c for c in columns if any(t in c.lower() for t in ['reg', 'council', 'medical_no'])), None)
            if reg_col and not str(row.get(reg_col, '')).strip():
                affected_rows_set.add(idx)
                count_dept_specific += 1
                count_high += 1
                all_issues.append({
                    'row_index': row_num,
                    'issue_type': 'Missing Medical Council Reg No',
                    'field_name': reg_col,
                    'original_value': '',
                    'suggested_correction': 'Department Validation Required (Enter TNMC Reg No)',
                    'priority': 'High',
                    'responsible_dept': 'Medical Director Office',
                    'category': 'Department-Specific Review'
                })

        # Lab Rules
        elif 'LAB' in m_type_upper or 'LABORATORY' in m_type_upper:
            unit_col = next((c for c in columns if 'unit' in c.lower() or 'specimen' in c.lower()), None)
            if unit_col and not str(row.get(unit_col, '')).strip():
                affected_rows_set.add(idx)
                count_dept_specific += 1
                count_medium += 1
                all_issues.append({
                    'row_index': row_num,
                    'issue_type': 'Missing Specimen / Reference Range Unit',
                    'field_name': unit_col,
                    'original_value': '',
                    'suggested_correction': 'Department Validation Required (Specify Specimen/Unit)',
                    'priority': 'Medium',
                    'responsible_dept': 'Chief Pathologist',
                    'category': 'Department-Specific Review'
                })

    # Calculated Metrics
    affected_records_count = len(affected_rows_set)
    clean_records_count = total_records - affected_records_count
    total_issues_count = len(all_issues)

    # Department-Specific Findings Summary List
    dept_findings = []
    if duplicate_id_count > 0:
        dept_findings.append(f"Found {duplicate_id_count} duplicate primary key entries requiring resolution.")
    if repeated_rows_count > 0:
        dept_findings.append(f"Found {repeated_rows_count} exact redundant duplicate rows.")
    if count_missing_fields > 0:
        dept_findings.append(f"Identified {count_missing_fields} missing mandatory values in core columns.")
    if count_casing_issues > 0:
        dept_findings.append(f"Found {count_casing_issues} name casing, alphanumeric mix, or login ID formatting inconsistencies.")
    if count_spelling_issues > 0:
        dept_findings.append(f"Found {count_spelling_issues} whitespace/formatting inconsistencies.")

    # Correction Priorities List
    priorities_list = [
        {
            "order": 1,
            "workstream": "Primary Key & Duplicate Resolution",
            "evidence": f"{duplicate_id_count} Duplicate IDs, {repeated_rows_count} Repeated Rows",
            "priority": "Critical" if count_critical > 0 else "High",
            "required_action": "Deduplicate master records and align candidate business keys.",
            "responsible_dept": f"{master_type} / HIS Admin"
        },
        {
            "order": 2,
            "workstream": "Mandatory Fields Population",
            "evidence": f"{count_missing_fields} Missing Mandatory Cell Values",
            "priority": "High",
            "required_action": "Populate mandatory identifiers, descriptions, and clinical codes.",
            "responsible_dept": f"{master_type} Lead"
        },
        {
            "order": 3,
            "workstream": "Casing & Formatting Standardisation",
            "evidence": f"{count_casing_issues} Name Casing & Login ID Format Flags",
            "priority": "Medium",
            "required_action": "Standardize names to Title Case, remove digits from person names, and convert login IDs to lowercase without spaces.",
            "responsible_dept": "User & Master Data Team"
        },
        {
            "order": 4,
            "workstream": "Value & Standardisation Corrections",
            "evidence": f"{count_invalid_values + count_spelling_issues} Invalid Values & Space Inconsistencies",
            "priority": "Medium",
            "required_action": "Trim leading/trailing spaces and correct status flags to ACTIVE/INACTIVE.",
            "responsible_dept": "Master Data Team"
        },
        {
            "order": 5,
            "workstream": "Clinical & Departmental Signoff",
            "evidence": f"{count_dept_specific} Department Specific Validation Warnings",
            "priority": "High",
            "required_action": "Clinical/Department head review for safety-critical fields.",
            "responsible_dept": f"Chief of {master_type}"
        }
    ]

    return {
        "total_records": total_records,
        "unique_records": unique_ids_count,
        "affected_records": affected_records_count,
        "clean_records": clean_records_count,
        "total_issues": total_issues_count,
        "critical_issues": count_critical,
        "high_priority_issues": count_high,
        "medium_priority_issues": count_medium,
        "duplicate_records": count_duplicate_records,
        "missing_fields": count_missing_fields,
        "invalid_values": count_invalid_values,
        "spelling_issues": count_spelling_issues,
        "casing_issues": count_casing_issues,
        "duplicate_ids": duplicate_id_count,
        "repeated_rows": repeated_rows_count,
        "dept_findings": dept_findings,
        "priorities_list": priorities_list,
        "all_issues": all_issues,
        "id_column": id_col,
        "desc_column": desc_col
    }
