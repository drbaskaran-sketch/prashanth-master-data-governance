import urllib.request
import re
import requests

def test_frontend_bundle():
    print("=== 1. TESTING FRONTEND BUNDLE SERVED ON HTTP://LOCALHOST:3001 ===")
    base_url = "http://localhost:3001"
    html = urllib.request.urlopen(base_url).read().decode("utf-8")
    print("Fetched index.html successfully.")
    
    scripts = re.findall(r'src=["\'](.*?)["\']', html)
    print(f"Found scripts in HTML: {scripts}")
    
    for script in scripts:
        url = base_url + script if script.startswith("/") else base_url + "/" + script
        print(f"Fetching script bundle: {url}")
        content = urllib.request.urlopen(url).read().decode("utf-8")
        
        has_new = "Analyse Hospital Master File" in content or "Master File Analyzer" in content
        has_old = "Master Registry Schemas" in content or "Multi-Role Approval Queues" in content
        
        print(f"Contains NEW app strings: {has_new}")
        print(f"Contains OLD app strings: {has_old}")

def test_end_to_end_analysis():
    print("\n=== 2. TESTING END-TO-END FILE ANALYSIS & EXCEL WORKBOOK GENERATION ===")
    
    # Generate test Stores CSV
    csv_content = """store_code,item_name,category,hsn_code,status
STR-001, Surgical Gloves Sterile ,Surgical,3004,ACTIVE
STR-001, Surgical Gloves Sterile ,Surgical,3004,ACTIVE
STR-002,  ,Surgical,INVALID_HSN,ACTIVE
STR-003,Syringe 5ml,,3004,UNKNOWN_STATUS
"""
    files = {'file': ('Stores_Master_Sample.csv', csv_content, 'text/csv')}
    data = {'branch': 'Main Branch - Chetpet', 'department': 'Stores', 'master_type': 'Auto-detect'}

    r = requests.post('http://localhost:5050/api/analyze', files=files, data=data)
    print("Analyze API Status Code:", r.status_code)
    
    res = r.json()
    print("Analyze API Response:", res)
    
    if r.status_code == 200 and res.get('success'):
        excel_url = f"http://localhost:5050{res['excel_download_url']}"
        csv_url = f"http://localhost:5050{res['csv_download_url']}"
        
        r_excel = requests.get(excel_url)
        r_csv = requests.get(csv_url)
        
        print(f"Excel Download Status: {r_excel.status_code}, Bytes: {len(r_excel.content)}")
        print(f"CSV Download Status: {r_csv.status_code}, Bytes: {len(r_csv.content)}")
        print("E2E API Test Passed!")

if __name__ == "__main__":
    test_frontend_bundle()
    test_end_to_end_analysis()
