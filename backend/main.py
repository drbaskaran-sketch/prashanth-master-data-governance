import os
import uuid
import pandas as pd
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from database import init_db, save_analysis_record, get_analysis_record
from parser import parse_file
from analyzer import analyze_dataset
from excel_generator import generate_excel_workbook

app = FastAPI(
    title="Prashanth Hospital Master File Analyzer API",
    description="Hospital Master File Data Quality Analysis and Linked Correction Workbook Generation",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WORKBOOK_DIR = "/tmp/workbooks"
os.makedirs(WORKBOOK_DIR, exist_ok=True)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Prashanth Hospital Master File Analyzer API",
        "version": "2.0.0"
    }

@app.post("/api/analyze")
async def analyze_file(
    file: UploadFile = File(...),
    branch: str = Form("Main Branch - Chetpet"),
    department: str = Form("Pharmacy"),
    master_type: str = Form("Auto-detect")
):
    try:
        file_bytes = await file.read()
        filename = file.filename
        
        # 1. Parse File
        df, file_warnings, checksum = parse_file(file_bytes, filename)
        
        if df.empty:
            raise HTTPException(status_code=400, detail="The uploaded file contains no data rows.")
            
        effective_master_type = master_type if master_type and master_type != "Auto-detect" else department
        
        # 2. Analyze Dataset
        analysis_results = analyze_dataset(df, effective_master_type, branch, file_warnings)
        
        # 3. Generate Linked Excel Workbook
        record_id = str(uuid.uuid4())
        excel_filename = f"{record_id}_Master_Sanitization_Workbook.xlsx"
        excel_path = os.path.join(WORKBOOK_DIR, excel_filename)
        
        generate_excel_workbook(
            df=df,
            analysis_results=analysis_results,
            filename=filename,
            branch=branch,
            master_type=effective_master_type,
            checksum=checksum,
            output_filepath=excel_path
        )
        
        # 4. Generate All Issues CSV
        csv_filename = f"{record_id}_All_Issues.csv"
        csv_path = os.path.join(WORKBOOK_DIR, csv_filename)
        df_issues = pd.DataFrame(analysis_results['all_issues'])
        if not df_issues.empty:
            df_issues.to_csv(csv_path, index=False)
        else:
            pd.DataFrame([{"Message": "No issues found in dataset"}]).to_csv(csv_path, index=False)

        # 5. Save Record to SQLite
        record_data = {
            'id': record_id,
            'filename': filename,
            'branch': branch,
            'department': department,
            'master_type': effective_master_type,
            'analysis_time': pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S"),
            'file_checksum': checksum,
            'total_records': analysis_results['total_records'],
            'unique_records': analysis_results['unique_records'],
            'affected_records': analysis_results['affected_records'],
            'clean_records': analysis_results['clean_records'],
            'total_issues': analysis_results['total_issues'],
            'critical_issues': analysis_results['critical_issues'],
            'high_priority_issues': analysis_results['high_priority_issues'],
            'medium_priority_issues': analysis_results['medium_priority_issues'],
            'duplicate_records': analysis_results['duplicate_records'],
            'missing_fields': analysis_results['missing_fields'],
            'invalid_values': analysis_results['invalid_values'],
            'summary_json': analysis_results,
            'excel_path': excel_path,
            'csv_path': csv_path
        }
        
        save_analysis_record(record_data)
        
        return {
            "success": True,
            "id": record_id,
            "filename": filename,
            "branch": branch,
            "department": department,
            "master_type": effective_master_type,
            "checksum": checksum,
            "summary": {
                "total_records": analysis_results['total_records'],
                "unique_records": analysis_results['unique_records'],
                "affected_records": analysis_results['affected_records'],
                "clean_records": analysis_results['clean_records'],
                "total_issues": analysis_results['total_issues'],
                "critical_issues": analysis_results['critical_issues'],
                "high_priority_issues": analysis_results['high_priority_issues'],
                "medium_priority_issues": analysis_results['medium_priority_issues'],
                "duplicate_records": analysis_results['duplicate_records'],
                "missing_fields": analysis_results['missing_fields'],
                "invalid_values": analysis_results['invalid_values'],
                "spelling_issues": analysis_results['spelling_issues'],
                "casing_issues": analysis_results.get('casing_issues', 0),
                "duplicate_ids": analysis_results['duplicate_ids'],
                "repeated_rows": analysis_results['repeated_rows'],
                "dept_findings": analysis_results['dept_findings'],
                "priorities_list": analysis_results['priorities_list']
            },
            "excel_download_url": f"/api/download/excel/{record_id}",
            "csv_download_url": f"/api/download/csv/{record_id}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download/excel/{record_id}")
def download_excel(record_id: str):
    record = get_analysis_record(record_id)
    if not record or not os.path.exists(record['excel_path']):
        raise HTTPException(status_code=404, detail="Excel correction workbook not found.")
        
    download_name = f"{record['department']}_Sanitization_Workbook_{record['branch'].replace(' ', '_')}.xlsx"
    return FileResponse(
        path=record['excel_path'],
        filename=download_name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@app.get("/api/download/csv/{record_id}")
def download_csv(record_id: str):
    record = get_analysis_record(record_id)
    if not record or not os.path.exists(record['csv_path']):
        raise HTTPException(status_code=404, detail="CSV issues file not found.")
        
    download_name = f"{record['department']}_All_Issues_{record['branch'].replace(' ', '_')}.csv"
    return FileResponse(
        path=record['csv_path'],
        filename=download_name,
        media_type="text/csv"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5050, reload=True)
