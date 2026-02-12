#!/usr/bin/env python3
"""
Script to analyze systems classes in case sheet HTML files
"""

import os
import re
from collections import defaultdict
from pathlib import Path

# Define the systems classes to look for
SYSTEMS_CLASSES = [
    'General', 'cvs', 'rheumatic', 'psychiatric', 'git',
    'Respiratory', 'respiratory', 'derma', 'hematology',
    'Endocrine', 'endocrine', 'infectious', 'gynob',
    'surgery', 'cns', 'ent', 'Ent', 'emergency',
    'Nephro', 'nephro', 'obstetric', 'gynaecology',
    'ortho-specific', 'ophthalmology', 'Sexual_history_section'
]

def count_systems_classes(file_path):
    """Count systems classes in an HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        class_counts = defaultdict(int)
        total_count = 0
        
        # Look for class attributes containing systems classes
        class_pattern = r'class=["\']([^"\']*)["\']'
        matches = re.findall(class_pattern, content)
        
        for class_attr in matches:
            classes = class_attr.split()
            for cls in classes:
                if cls in SYSTEMS_CLASSES:
                    class_counts[cls] += 1
                    total_count += 1
        
        return total_count, dict(class_counts)
    
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return 0, {}

def main():
    # Find all case sheet part files
    case_sheets_dir = Path("c:\\Users\\deletable\\OneDrive\\Documents\\Case sheets")
    case_sheet_files = list(case_sheets_dir.glob("*_case_sheet_part.html"))
    
    results = []
    
    print("Analyzing case sheet files for systems classes...")
    print("=" * 80)
    
    for file_path in case_sheet_files:
        total_count, class_counts = count_systems_classes(file_path)
        results.append((file_path.name, total_count, class_counts))
    
    # Sort by total count (ascending)
    results.sort(key=lambda x: x[1])
    
    print(f"{'File Name':<60} {'Total Classes':<15} {'Classes Found'}")
    print("-" * 80)
    
    for file_name, total_count, class_counts in results:
        classes_str = ", ".join(f"{k}({v})" for k, v in class_counts.items())
        print(f"{file_name:<60} {total_count:<15} {classes_str}")
    
    print("\n" + "=" * 80)
    print("FILES WITH LEAST SYSTEMS CLASSES:")
    print("-" * 40)
    
    # Show top 10 files with least systems classes
    for i, (file_name, total_count, class_counts) in enumerate(results[:10]):
        print(f"{i+1}. {file_name} - {total_count} classes")
        if class_counts:
            for cls, count in class_counts.items():
                print(f"   - {cls}: {count}")
        print()

if __name__ == "__main__":
    main()
