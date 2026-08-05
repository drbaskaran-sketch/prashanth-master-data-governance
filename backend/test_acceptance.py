import pandas as pd
import numpy as np
from analyzer import analyze_dataset

def run_stores_acceptance_test():
    print("\n--- Running Stores Acceptance Test ---")
    
    # 7249 total records
    # 6760 affected records, 489 clean records
    # 11848 total issues
    
    records = []
    
    for i in range(1, 7250):
        code = f"STR-{i:05d}"
        name = f" Medical Store Item {i}  " if i <= 6760 else f"Clean Item {i}"
        cat = "Surgical" if i % 2 == 0 else "" # Some missing mandatory fields
        hsn = "3004" if i % 3 != 0 else "INVALID_HSN_FORMAT_12345"
        
        # Add whitespace & invalid status for affected records
        status = "ACTIVE" if i > 6760 else ("INVALID_STATUS" if i % 5 == 0 else " ACTIVE ")
        
        records.append({
            "store_code": code,
            "item_name": name,
            "category": cat,
            "hsn_code": hsn,
            "status": status
        })
        
    df = pd.DataFrame(records)
    res = analyze_dataset(df, "Stores", "Main Branch", [])
    
    print(f"Total Records: {res['total_records']}")
    print(f"Affected Records: {res['affected_records']}")
    print(f"Clean Records: {res['clean_records']}")
    print(f"Total Issues: {res['total_issues']}")

def run_pharmacy_acceptance_test():
    print("\n--- Running Pharmacy Acceptance Test ---")
    
    # 37830 source rows, 19261 unique stock IDs, 18569 duplicate stock IDs, 18569 repeated rows
    unique_count = 19261
    duplicate_count = 18569
    
    records = []
    # 19261 unique records
    for i in range(1, unique_count + 1):
        code = f"MED-{i:06d}"
        records.append({
            "stock_id": code,
            "item_name": f"Paracetamol Drug {i}",
            "schedule_type": "OTC",
            "status": "ACTIVE"
        })
        
    # Duplicate 18569 rows from the first 18569
    for i in range(1, duplicate_count + 1):
        code = f"MED-{i:06d}"
        records.append({
            "stock_id": code,
            "item_name": f"Paracetamol Drug {i}",
            "schedule_type": "OTC",
            "status": "ACTIVE"
        })
        
    df = pd.DataFrame(records)
    res = analyze_dataset(df, "Pharmacy", "Velachery Unit", [])
    
    print(f"Source Rows: {res['total_records']}")
    print(f"Unique Stock IDs: {res['unique_records']}")
    print(f"Duplicate Stock IDs: {res['duplicate_ids']}")
    print(f"Repeated Rows: {res['repeated_rows']}")

if __name__ == "__main__":
    run_stores_acceptance_test()
    run_pharmacy_acceptance_test()
