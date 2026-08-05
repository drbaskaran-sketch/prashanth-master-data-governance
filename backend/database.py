import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "master_analyzer.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analysis_history (
            id TEXT PRIMARY KEY,
            filename TEXT,
            branch TEXT,
            department TEXT,
            master_type TEXT,
            analysis_time TEXT,
            file_checksum TEXT,
            total_records INTEGER,
            unique_records INTEGER,
            affected_records INTEGER,
            clean_records INTEGER,
            total_issues INTEGER,
            critical_issues INTEGER,
            high_priority_issues INTEGER,
            medium_priority_issues INTEGER,
            duplicate_records INTEGER,
            missing_fields INTEGER,
            invalid_values INTEGER,
            summary_json TEXT,
            excel_path TEXT,
            csv_path TEXT
        )
    """)
    conn.commit()
    conn.close()

def save_analysis_record(record_dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO analysis_history (
            id, filename, branch, department, master_type, analysis_time, file_checksum,
            total_records, unique_records, affected_records, clean_records, total_issues,
            critical_issues, high_priority_issues, medium_priority_issues, duplicate_records,
            missing_fields, invalid_values, summary_json, excel_path, csv_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record_dict['id'],
        record_dict['filename'],
        record_dict['branch'],
        record_dict['department'],
        record_dict['master_type'],
        record_dict['analysis_time'],
        record_dict['file_checksum'],
        record_dict['total_records'],
        record_dict['unique_records'],
        record_dict['affected_records'],
        record_dict['clean_records'],
        record_dict['total_issues'],
        record_dict['critical_issues'],
        record_dict['high_priority_issues'],
        record_dict['medium_priority_issues'],
        record_dict['duplicate_records'],
        record_dict['missing_fields'],
        record_dict['invalid_values'],
        json.dumps(record_dict.get('summary_json', {})),
        record_dict.get('excel_path', ''),
        record_dict.get('csv_path', '')
    ))
    conn.commit()
    conn.close()

def get_analysis_record(record_id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analysis_history WHERE id = ?", (record_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        res = dict(row)
        res['summary_json'] = json.loads(res['summary_json']) if res['summary_json'] else {}
        return res
    return None
