import os
import re

# Define the diagnostic history section to be added
diagnostic_history_section = '''    <details>
      <summary class="h3"><a href="Diagnostic_history.html">DIAGNOSTIC H/O:</a></summary>
      <iframe src="Diagnostic_history_case_sheet_part.html" frameborder="0"></iframe> 
    </details>
'''

def process_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Check if diagnostic history already exists
        if 'DIAGNOSTIC H/O' in content:
            print(f"Skipping {file_path} - Diagnostic history already exists")
            return
            
        # Find the position to insert the diagnostic history section
        # Look for the end of HPI section and before Past Medical History
        hpi_pattern = r'(?s)(<h3>HISTORY OF PRESENT ILLNESS.*?)(?=<h3>PAST MEDICAL HISTORY|<h3>HISTORY OF PAST ILLNESS|</div>)'
        
        match = re.search(hpi_pattern, content, re.IGNORECASE | re.DOTALL)
        
        if match:
            # Insert diagnostic history after HPI section
            modified_content = content[:match.end(1)] + '\n' + diagnostic_history_section + '\n' + content[match.end(1):]
            
            # Write the modified content back to the file
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(modified_content)
            print(f"Updated {file_path}")
        else:
            print(f"Could not find HPI section in {file_path}")
            
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")

def main():
    # Get all HTML files in the current directory
    case_sheets = [
        'CASE SHEET.html',
        'CASE SHEET SWELLING breast.html',
        'CVS MEDICINE CASE SHEET.html',
        'Dermatology skin CASE SHEET  lymph node SWELLING.html',
        'Diabetic Lower limb CASE SHEET.html',
        'ENDOCRINOLOGY CASE SHEET SWELLING thyroid.html',
        'ENT Ear nose throat CASE SHEET.html',
        'Cerebellar ataxia CASE SHEET.html',
        'DNACPR DNR DNAR Case sheet.html',
        'Bulimia_full_case_sheet.html',
        'Asthma_case_sheet_FINAL.html'
    ]
    
    # Process each case sheet
    for case_sheet in case_sheets:
        if os.path.exists(case_sheet):
            process_file(case_sheet)
        else:
            print(f"File not found: {case_sheet}")
    
    print("\nProcessing complete. Please review the changes to ensure the diagnostic history section was added correctly.")

if __name__ == "__main__":
    main()
