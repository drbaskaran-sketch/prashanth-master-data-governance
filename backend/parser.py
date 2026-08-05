import io
import hashlib
import pandas as pd
import polars as pl

def compute_checksum(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()[:16]

def parse_file(file_bytes: bytes, filename: str) -> tuple[pd.DataFrame, list[str], str]:
    """
    Parses CSV, XLSX, or XLS files into a Pandas DataFrame using Polars/Pandas.
    Returns (dataframe, warning_messages, file_checksum).
    """
    checksum = compute_checksum(file_bytes)
    warnings = []
    fname_lower = filename.lower()
    
    df = None
    
    if fname_lower.endswith('.xlsx') or fname_lower.endswith('.xls'):
        try:
            # Try openpyxl or xlrd
            df = pd.read_excel(io.BytesIO(file_bytes), engine='openpyxl' if fname_lower.endswith('.xlsx') else None)
        except Exception as e:
            try:
                # Fallback to Polars read_excel if available
                df_pl = pl.read_excel(io.BytesIO(file_bytes))
                df = df_pl.to_pandas()
            except Exception as e2:
                raise ValueError(f"Unable to parse Excel file '{filename}': {str(e)}")
    else:
        # CSV handling with multiple encodings
        encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252', 'iso-8859-1']
        parsed = False
        
        for enc in encodings:
            try:
                # Try Polars first for speed and robustness
                df_pl = pl.read_csv(
                    io.BytesIO(file_bytes),
                    encoding=enc,
                    ignore_errors=True,
                    truncate_ragged_lines=True,
                    infer_schema_length=1000
                )
                df = df_pl.to_pandas()
                parsed = True
                break
            except Exception:
                try:
                    df = pd.read_csv(
                        io.BytesIO(file_bytes),
                        encoding=enc,
                        on_bad_lines='skip',
                        engine='python'
                    )
                    parsed = True
                    break
                except Exception:
                    continue
        
        if not parsed or df is None:
            raise ValueError(f"Could not parse CSV file '{filename}'. Please verify file encoding and structure.")

    # Clean up column names and structure
    orig_cols = list(df.columns)
    clean_cols = []
    unnamed_count = 0
    
    for i, col in enumerate(orig_cols):
        col_str = str(col).strip()
        if not col_str or col_str.startswith('Unnamed:') or col_str.lower() == 'none' or col_str.lower() == 'nan':
            unnamed_count += 1
            clean_name = f"Unnamed_Column_{unnamed_count}"
            warnings.append(f"Empty or unnamed header found at position {i+1}, renamed to '{clean_name}'.")
        else:
            clean_name = col_str
        clean_cols.append(clean_name)
    
    df.columns = clean_cols
    
    # Fill NaN strings cleanly
    df = df.fillna("")
    
    return df, warnings, checksum
