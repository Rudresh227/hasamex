"""
Script to inspect Excel file structure before migration
"""
import pandas as pd
import sys
import os

excel_path = r"c:\Users\user\OneDrive\Desktop\Rudresh\hasamex\Documents\Test Hasamex Expert Database (HEB).xlsx"

def inspect_excel():
    print("=" * 80)
    print("INSPECTING EXCEL FILE STRUCTURE")
    print("=" * 80)
    
    # Read Excel file
    xl = pd.ExcelFile(excel_path)
    
    print(f"\nSheet names: {xl.sheet_names}")
    
    for sheet_name in xl.sheet_names:
        print(f"\n{'='*80}")
        print(f"SHEET: {sheet_name}")
        print("=" * 80)
        
        df = pd.read_excel(excel_path, sheet_name=sheet_name)
        
        print(f"\nShape: {df.shape}")
        print(f"\nColumns ({len(df.columns)}):")
        for i, col in enumerate(df.columns):
            print(f"  {i+1}. {col}")
        
        print(f"\nFirst 3 rows:")
        print(df.head(3).to_string())
        
        print(f"\nData types:")
        print(df.dtypes)

if __name__ == "__main__":
    inspect_excel()
