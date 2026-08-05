import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter
import pandas as pd
from datetime import datetime

def generate_excel_workbook(
    df: pd.DataFrame,
    analysis_results: dict,
    filename: str,
    branch: str,
    master_type: str,
    checksum: str,
    output_filepath: str
):
    wb = openpyxl.Workbook()
    # Remove default sheet
    wb.remove(wb.active)
    
    # -------------------------------------------------------------
    # STYLES & PALETTE
    # -------------------------------------------------------------
    font_family = "Segoe UI"
    
    title_font = Font(name=font_family, size=16, bold=True, color="1F4E79")
    subtitle_font = Font(name=font_family, size=11, italic=True, color="595959")
    section_font = Font(name=font_family, size=12, bold=True, color="1F4E79")
    header_font = Font(name=font_family, size=10, bold=True, color="FFFFFF")
    bold_font = Font(name=font_family, size=10, bold=True)
    regular_font = Font(name=font_family, size=10)
    link_font = Font(name=font_family, size=10, underline="single", color="0563C1")
    
    # Fills
    navy_header_fill = PatternFill(start_color="1F4E79", end_color="1F4E79", fill_type="solid")
    teal_header_fill = PatternFill(start_color="008080", end_color="008080", fill_type="solid")
    slate_fill = PatternFill(start_color="F2F4F7", end_color="F2F4F7", fill_type="solid")
    
    # Priority & Status Fills
    red_fill = PatternFill(start_color="FFC7CE", end_color="FFC7CE", fill_type="solid")
    red_font = Font(name=font_family, size=10, color="9C0006", bold=True)
    
    amber_fill = PatternFill(start_color="FFEB9C", end_color="FFEB9C", fill_type="solid")
    amber_font = Font(name=font_family, size=10, color="9C6500", bold=True)
    
    yellow_fill = PatternFill(start_color="FFF2CC", end_color="FFF2CC", fill_type="solid")
    yellow_font = Font(name=font_family, size=10, color="B25900")
    
    green_fill = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")
    green_font = Font(name=font_family, size=10, color="006100")
    
    grey_fill = PatternFill(start_color="F2F2F2", end_color="F2F2F2", fill_type="solid")
    grey_font = Font(name=font_family, size=10, color="595959")
    
    # Borders
    thin_border = Border(
        left=Side(style='thin', color='D9D9D9'),
        right=Side(style='thin', color='D9D9D9'),
        top=Side(style='thin', color='D9D9D9'),
        bottom=Side(style='thin', color='D9D9D9')
    )

    # -------------------------------------------------------------
    # SHEET 1: EXECUTIVE SUMMARY
    # -------------------------------------------------------------
    ws_exec = wb.create_sheet(title="Executive Summary")
    ws_exec.views.sheetView[0].showGridLines = True
    
    # Title
    ws_exec.cell(row=1, column=1, value="Kranium HIS Master Sanitization — Executive Summary").font = title_font
    ws_exec.cell(row=2, column=1, value="Prashanth Hospital Master File Quality Audit & Sanitization Report").font = subtitle_font
    
    # File Metadata Table
    ws_exec.cell(row=4, column=1, value="File Analysis Metadata").font = section_font
    meta_items = [
        ("Source Filename:", filename),
        ("Analysis Date & Time:", datetime.now().strftime("%d-%b-%Y %H:%M:%S")),
        ("Hospital Branch:", branch),
        ("Master Type:", master_type),
        ("File SHA-256 Checksum:", checksum),
        ("Integrity Notice:", "Original uploaded source file was NOT modified.")
    ]
    for r_idx, (k, v) in enumerate(meta_items, start=5):
        cell_k = ws_exec.cell(row=r_idx, column=1, value=k)
        cell_k.font = bold_font
        cell_v = ws_exec.cell(row=r_idx, column=2, value=v)
        cell_v.font = regular_font
        if k.startswith("Integrity"):
            cell_v.font = Font(name=font_family, size=10, bold=True, color="008000")
            
    # Metrics Table
    ws_exec.cell(row=12, column=1, value="Executive Metrics Breakdown").font = section_font
    metrics_headers = ["Metric Category", "Count", "Description & Interpretation"]
    for c_idx, h in enumerate(metrics_headers, start=1):
        cell = ws_exec.cell(row=13, column=c_idx, value=h)
        cell.font = header_font
        cell.fill = navy_header_fill
        cell.alignment = Alignment(horizontal="center" if c_idx==2 else "left")
        
    metrics_rows = [
        ("Source Records", analysis_results['total_records'], "Total raw rows uploaded from source file"),
        ("Unique Record IDs", analysis_results['unique_records'], "Distinct primary key identifiers present"),
        ("Affected Records", analysis_results['affected_records'], "Unique source records containing 1 or more data issues"),
        ("Clean Records", analysis_results['clean_records'], "Records completely free of identified data errors"),
        ("Total Issue Flags", analysis_results['total_issues'], "Total individual error/warning flags across all records"),
        ("Critical Priority Issues", analysis_results['critical_issues'], "Severe issues requiring immediate correction before HIS load"),
        ("High Priority Issues", analysis_results['high_priority_issues'], "High risk issues requiring department signoff"),
        ("Duplicate Record IDs", analysis_results['duplicate_ids'], "Records sharing identical key identifiers"),
        ("Repeated Rows", analysis_results['repeated_rows'], "100% identical redundant rows"),
        ("Missing Mandatory Fields", analysis_results['missing_fields'], "Empty cells in mandatory primary/attribute columns"),
        ("Invalid Field Values", analysis_results['invalid_values'], "Values failing data-type or controlled list validation")
    ]
    
    for r_idx, (cat, val, desc) in enumerate(metrics_rows, start=14):
        c1 = ws_exec.cell(row=r_idx, column=1, value=cat)
        c2 = ws_exec.cell(row=r_idx, column=2, value=val)
        c3 = ws_exec.cell(row=r_idx, column=3, value=desc)
        
        c1.font = bold_font
        c2.font = bold_font
        c3.font = regular_font
        
        c1.border = thin_border
        c2.border = thin_border
        c3.border = thin_border
        c2.alignment = Alignment(horizontal="center")
        
        if cat in ["Affected Records", "Total Issue Flags", "Critical Priority Issues"]:
            c1.fill = amber_fill if cat != "Critical Priority Issues" else red_fill
            c2.fill = amber_fill if cat != "Critical Priority Issues" else red_fill

    # Quick Jump Sheet Links
    ws_exec.cell(row=27, column=1, value="Quick Sheet Navigation Links").font = section_font
    nav_links = [
        ("View Affected Records", "'Affected Records'!A1", "Go to 100% list of unique records requiring sanitization"),
        ("View Duplicate Records", "'Duplicate Records'!A1", "Go to duplicate key and repeated row findings"),
        ("View Missing Fields", "'Missing Fields'!A1", "Go to missing mandatory values sheet"),
        ("View Invalid Values", "'Invalid Values'!A1", "Go to invalid status and formatting errors"),
        ("View Critical Issues", "'All Issues'!A1", "Go to master issues log containing all flags"),
        ("View Department-Specific Review", "'Department-Specific Review'!A1", "Go to clinical / drug / tariff safety warnings")
    ]
    
    for c_idx, h in enumerate(["Target Sheet", "Hyperlink Action", "Sheet Purpose"], start=1):
        c = ws_exec.cell(row=28, column=c_idx, value=h)
        c.font = header_font
        c.fill = teal_header_fill
        
    for r_idx, (label, target, purp) in enumerate(nav_links, start=29):
        c1 = ws_exec.cell(row=r_idx, column=1, value=label)
        c2 = ws_exec.cell(row=r_idx, column=2, value=f"=HYPERLINK(\"#{target}\", \"Open Sheet ->\")")
        c3 = ws_exec.cell(row=r_idx, column=3, value=purp)
        
        c1.font = bold_font
        c2.font = link_font
        c3.font = regular_font
        
        c1.border = thin_border
        c2.border = thin_border
        c3.border = thin_border

    # Correction Priorities Table
    ws_exec.cell(row=37, column=1, value="Correction Priorities & Workstream Roadmap").font = section_font
    prio_headers = ["Order", "Workstream", "Evidence", "Priority", "Required Action", "Responsible Department"]
    for c_idx, h in enumerate(prio_headers, start=1):
        c = ws_exec.cell(row=38, column=c_idx, value=h)
        c.font = header_font
        c.fill = navy_header_fill
        
    for r_idx, item in enumerate(analysis_results['priorities_list'], start=39):
        c1 = ws_exec.cell(row=r_idx, column=1, value=item['order'])
        c2 = ws_exec.cell(row=r_idx, column=2, value=item['workstream'])
        c3 = ws_exec.cell(row=r_idx, column=3, value=item['evidence'])
        c4 = ws_exec.cell(row=r_idx, column=4, value=item['priority'])
        c5 = ws_exec.cell(row=r_idx, column=5, value=item['required_action'])
        c6 = ws_exec.cell(row=r_idx, column=6, value=item['responsible_dept'])
        
        for c in [c1, c2, c3, c4, c5, c6]:
            c.font = regular_font
            c.border = thin_border
        c1.alignment = Alignment(horizontal="center")
        c4.font = bold_font
        if item['priority'] == 'Critical':
            c4.fill = red_fill
            c4.font = red_font
        elif item['priority'] == 'High':
            c4.fill = amber_fill
            c4.font = amber_font

    # -------------------------------------------------------------
    # CORRECTION SHEETS (2 TO 10)
    # -------------------------------------------------------------
    governance_headers = [
        "Issue Type", "Field Name", "Original Value", "Suggested Correction/Action",
        "Corrected Value", "Priority", "Responsible Department", "Correction Status",
        "Corrected By", "Correction Reason", "Remarks"
    ]
    
    orig_cols = list(df.columns)
    all_headers = orig_cols + governance_headers
    
    # Data Validation Dropdown for Correction Status
    dv_status = DataValidation(type="list", formula1='"Pending,Corrected,No Change Required,Needs Clarification"', allow_blank=True)
    
    sheet_definitions = [
        ("All Issues", analysis_results['all_issues']),
        ("Affected Records", [i for i in analysis_results['all_issues'] if i['category'] in ['Duplicate Records', 'Missing Fields', 'Invalid Values']]),
        ("Duplicate Records", [i for i in analysis_results['all_issues'] if i['category'] == 'Duplicate Records']),
        ("Missing Fields", [i for i in analysis_results['all_issues'] if i['category'] == 'Missing Fields']),
        ("Invalid Values", [i for i in analysis_results['all_issues'] if i['category'] == 'Invalid Values']),
        ("Spelling and Standardisation", [i for i in analysis_results['all_issues'] if i['category'] == 'Spelling and Standardisation']),
        ("Department-Specific Review", [i for i in analysis_results['all_issues'] if i['category'] == 'Department-Specific Review']),
    ]

    for sheet_name, issues_subset in sheet_definitions:
        ws = wb.create_sheet(title=sheet_name)
        ws.views.sheetView[0].showGridLines = True
        ws.add_data_validation(dv_status)
        
        # Link Back to Executive Summary
        link_cell = ws.cell(row=1, column=1, value='=HYPERLINK("#\'Executive Summary\'!A1", "<- Back to Executive Summary")')
        link_cell.font = link_font
        
        # Headers at Row 3
        for col_idx, h in enumerate(all_headers, start=1):
            c = ws.cell(row=3, column=col_idx, value=h)
            c.font = header_font
            # Highlight original columns in Navy, Governance in Teal
            c.fill = navy_header_fill if col_idx <= len(orig_cols) else teal_header_fill
            c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            
        ws.row_dimensions[3].height = 28
        
        # Build Rows
        row_counter = 4
        for issue in issues_subset:
            orig_row_idx = issue['row_index'] - 1
            row_data = df.iloc[orig_row_idx] if orig_row_idx < len(df) else {}
            
            # 1. Fill Original Source Columns
            for col_idx, c_name in enumerate(orig_cols, start=1):
                val = row_data.get(c_name, "") if isinstance(row_data, pd.Series) else ""
                c = ws.cell(row=row_counter, column=col_idx, value=str(val))
                c.font = regular_font
                c.border = thin_border
                
            # 2. Fill Governance Added Columns
            gov_vals = [
                issue['issue_type'],
                issue['field_name'],
                issue['original_value'],
                issue['suggested_correction'],
                "", # Corrected Value
                issue['priority'],
                issue['responsible_dept'],
                "Pending", # Default Correction Status
                "", # Corrected By
                "", # Correction Reason
                ""  # Remarks
            ]
            
            for g_offset, g_val in enumerate(gov_vals):
                c_col = len(orig_cols) + 1 + g_offset
                c = ws.cell(row=row_counter, column=c_col, value=g_val)
                c.font = regular_font
                c.border = thin_border
                
                # Format Priority
                if g_offset == 5: # Priority column
                    if g_val == 'Critical':
                        c.fill = red_fill
                        c.font = red_font
                    elif g_val == 'High':
                        c.fill = amber_fill
                        c.font = amber_font
                    elif g_val == 'Medium':
                        c.fill = yellow_fill
                        c.font = yellow_font
                        
                # Format Correction Status
                if g_offset == 7: # Correction Status column
                    c.fill = grey_fill
                    c.font = grey_font
                    dv_status.add(c)
                    
            row_counter += 1
            
        # Freeze panes below headers
        ws.freeze_panes = 'A4'
        if row_counter > 4:
            ws.auto_filter.ref = f"A3:{get_column_letter(len(all_headers))}{row_counter-1}"

    # -------------------------------------------------------------
    # SHEET 9: CORRECTION PRIORITIES
    # -------------------------------------------------------------
    ws_cp = wb.create_sheet(title="Correction Priorities")
    ws_cp.views.sheetView[0].showGridLines = True
    ws_cp.cell(row=1, column=1, value='=HYPERLINK("#\'Executive Summary\'!A1", "<- Back to Executive Summary")').font = link_font
    
    cp_headers = ["Priority Rank", "Sanitization Workstream", "Found Evidence", "Assigned Priority", "Action Required", "Responsible Team"]
    for c_idx, h in enumerate(cp_headers, start=1):
        c = ws_cp.cell(row=3, column=c_idx, value=h)
        c.font = header_font
        c.fill = navy_header_fill
        
    for r_idx, item in enumerate(analysis_results['priorities_list'], start=4):
        ws_cp.cell(row=r_idx, column=1, value=item['order']).alignment = Alignment(horizontal="center")
        ws_cp.cell(row=r_idx, column=2, value=item['workstream'])
        ws_cp.cell(row=r_idx, column=3, value=item['evidence'])
        c_p = ws_cp.cell(row=r_idx, column=4, value=item['priority'])
        ws_cp.cell(row=r_idx, column=5, value=item['required_action'])
        ws_cp.cell(row=r_idx, column=6, value=item['responsible_dept'])
        
        for c_i in range(1, 7):
            c_cell = ws_cp.cell(row=r_idx, column=c_i)
            c_cell.border = thin_border
            c_cell.font = regular_font
            
        if item['priority'] == 'Critical':
            c_p.fill = red_fill
            c_p.font = red_font
        elif item['priority'] == 'High':
            c_p.fill = amber_fill
            c_p.font = amber_font
            
    ws_cp.freeze_panes = 'A4'

    # -------------------------------------------------------------
    # SHEET 10: SANITIZATION RULES
    # -------------------------------------------------------------
    ws_rules = wb.create_sheet(title="Sanitization Rules")
    ws_rules.views.sheetView[0].showGridLines = True
    ws_rules.cell(row=1, column=1, value='=HYPERLINK("#\'Executive Summary\'!A1", "<- Back to Executive Summary")').font = link_font
    
    rule_headers = ["Rule ID", "Category", "Validation Check Name", "Target Columns", "Threshold / Logic", "Safety Protocol"]
    for c_idx, h in enumerate(rule_headers, start=1):
        c = ws_rules.cell(row=3, column=c_idx, value=h)
        c.font = header_font
        c.fill = teal_header_fill
        
    rule_rows = [
        ("RULE-01", "Universal", "Primary Key Uniqueness", "Primary Code / ID", "100% Unique Required", "Must not automerge without ID verification"),
        ("RULE-02", "Universal", "Exact Duplicate Row Check", "All Record Columns", "Identical Tuple Check", "Flag identical redundant rows for deletion"),
        ("RULE-03", "Universal", "Whitespace Cleaning", "All String Fields", "Trim leading/trailing/multiple spaces", "Auto-trim formatting whitespace"),
        ("RULE-04", "Pharmacy", "Generic Salt Mapping", "Drug Name, Generic Code", "Must link to valid generic salt", "Department Validation Required"),
        ("RULE-05", "Pharmacy", "Drug Schedule Validation", "Schedule Type", "OTC, Schedule H, H1, X, Narcotic", "Department Validation Required"),
        ("RULE-06", "Doctors", "Medical Registration Audit", "Registration No, Council", "Valid Council No & Name match", "Department Validation Required"),
        ("RULE-07", "Laboratory", "Specimen & Reference Range", "Specimen, Unit, TAT", "NABL Accredited specimen mapping", "Department Validation Required"),
        ("RULE-08", "Tariffs", "Payer Package Mapping", "Service Code, Tariff Price", "Non-zero price & active billing code", "Department Validation Required")
    ]
    
    for r_idx, r_data in enumerate(rule_rows, start=4):
        for c_idx, val in enumerate(r_data, start=1):
            c = ws_rules.cell(row=r_idx, column=c_idx, value=val)
            c.font = regular_font
            c.border = thin_border
            if c_idx == 1:
                c.alignment = Alignment(horizontal="center")
                c.font = bold_font
                
    ws_rules.freeze_panes = 'A4'

    # Auto-adjust Column Widths Across All Sheets
    for sheet in wb.worksheets:
        for col in sheet.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                val_str = str(cell.value or '')
                if not val_str.startswith("=HYPERLINK") and len(val_str) < 80:
                    max_len = max(max_len, len(val_str))
            sheet.column_dimensions[col_letter].width = max(max_len + 4, 12)

    wb.save(output_filepath)
