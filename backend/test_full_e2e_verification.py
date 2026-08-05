import requests
import io
import openpyxl

print("==========================================================================")
print("🏥 RUNNING COMPLETE END-TO-END SYSTEM INTEGRATION TEST")
print("==========================================================================")

BASE_URL = "http://localhost:5050"
FRONTEND_URL = "http://localhost:3001"

# 1. Test Backend Health
print("\n1. Testing Backend API Health...")
r_health = requests.get(f"{BASE_URL}/api/health")
assert r_health.status_code == 200, f"Health check failed: {r_health.text}"
print("✅ Health Check Passed:", r_health.json())

# 2. Test Frontend Server Content
print("\n2. Testing Frontend Server Assets on Port 3001...")
r_html = requests.get(FRONTEND_URL)
assert r_html.status_code == 200, f"Frontend check failed: {r_html.status_code}"
html_text = r_html.text

assert "Prashanth Hospital" in html_text or "Master File Analyzer" in html_text
assert "Master Registry Schemas" not in html_text
assert "Multi-Role Approval Queues" not in html_text
print("✅ Frontend HTML Asset Verification Passed!")

# 3. Test End-to-End File Analysis (Stores Sample)
print("\n3. Testing End-to-End Stores Master Upload & Analysis...")
stores_csv = """store_code,item_name,category,hsn_code,status
STR-10001, Surgical Gloves 7.5 Powdered ,Surgical,30049099,ACTIVE
STR-10001, Surgical Gloves 7.5 Powdered ,Surgical,30049099,ACTIVE
STR-10002,  ,Surgical,30041010,ACTIVE
STR-10003,IV Cannula 20G,Surgical,INVALID_HSN_CODE,INVALID_STATUS_XYZ
"""

files = {'file': ('Stores_Master_Audit_Test.csv', stores_csv, 'text/csv')}
data = {'branch': 'Main Branch - Chetpet', 'department': 'Stores', 'master_type': 'Stores & Consumables Master'}

r_analyze = requests.post(f"{BASE_URL}/api/analyze", files=files, data=data)
assert r_analyze.status_code == 200, f"Analysis failed: {r_analyze.text}"

result = r_analyze.json()
assert result['success'] == True
summary = result['summary']

print("   Summary Results:")
print(f"   • Total Records:    {summary['total_records']}")
print(f"   • Unique Records:   {summary['unique_records']}")
print(f"   • Affected Records: {summary['affected_records']}")
print(f"   • Clean Records:    {summary['clean_records']}")
print(f"   • Total Issues:     {summary['total_issues']}")

assert summary['total_records'] == 4
assert summary['unique_records'] == 3
assert summary['affected_records'] == 4
assert summary['clean_records'] == 0
assert summary['total_issues'] == 7
print("✅ Stores Analysis Metrics Verification Passed!")

# 4. Test Excel Workbook Generation & Structure
print("\n4. Testing Excel Correction Workbook Download & Structure...")
excel_url = f"{BASE_URL}{result['excel_download_url']}"
r_excel = requests.get(excel_url)
assert r_excel.status_code == 200, f"Excel download failed: {r_excel.status_code}"

wb = openpyxl.load_workbook(io.BytesIO(r_excel.content))
expected_sheets = [
    'Executive Summary', 'All Issues', 'Affected Records', 'Duplicate Records',
    'Missing Fields', 'Invalid Values', 'Spelling and Standardisation',
    'Department-Specific Review', 'Correction Priorities', 'Sanitization Rules'
]

print("   Workbook Sheet Names:", wb.sheetnames)
assert wb.sheetnames == expected_sheets, f"Sheets mismatch: {wb.sheetnames}"

# Check Executive Summary cell values
ws_exec = wb['Executive Summary']
exec_title = ws_exec.cell(row=1, column=1).value
assert "Kranium HIS Master Sanitization — Executive Summary" in exec_title

# Check sheet hyperlink back link in All Issues sheet
ws_issues = wb['All Issues']
back_link = ws_issues.cell(row=1, column=1).value
assert "Executive Summary" in str(back_link)

print("✅ Excel Workbook Structure & Link Verification Passed!")

# 5. Test CSV Issues Download
print("\n5. Testing CSV Issues Export Download...")
csv_url = f"{BASE_URL}{result['csv_download_url']}"
r_csv = requests.get(csv_url)
assert r_csv.status_code == 200, f"CSV download failed: {r_csv.status_code}"
assert "Exact Duplicate Row" in r_csv.text or "Duplicate Record ID" in r_csv.text
print("✅ CSV Export Verification Passed!")

print("\n==========================================================================")
print("🎉 ALL END-TO-END SYSTEM INTEGRATION TESTS PASSED SUCCESSFULLY!")
print("==========================================================================")
