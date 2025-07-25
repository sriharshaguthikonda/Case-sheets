import os
import re

# Define the drug history HTML to be inserted
drug_history_html = '''
    <details>
      <summary class="h3">DRUG H/O : </summary>
      <iframe src="DRUG_HISTORY.html" frameborder="0"></iframe>
    </details>
'''

# Get all HTML files in the current directory
html_files = [f for f in os.listdir() if f.endswith('.html') and f != 'DRUG_HISTORY.html']

# Files to exclude (partials and other non-case-sheet files)
exclude_files = [
    'Case_sheet_styles.html',
    'Case_sheet_styles_dark.html',
    'Iframe_height.js',
    'Iframe_height_mothership.js',
    'theme-toggle.js',
    'harsha_iframe_youtube_player.js'
]

# Process each HTML file
for filename in html_files:
    # Skip excluded files
    if any(exclude in filename for exclude in exclude_files) or 'case_sheet_part' in filename.lower():
        continue
        
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            content = file.read()
            
        # Check if drug history already exists
        if 'DRUG_HISTORY.html' in content:
            print(f"Skipping {filename} - already has drug history")
            continue
            
        # Find the treatment history section to insert after it
        treatment_pattern = r'(<details>\s*<summary[^>]*>\s*TREATMENT HISTORY\s*</summary>\s*<iframe[^>]*TREATMENT_HISTORY_case_sheet_part\.html[^>]*>\s*</iframe>\s*</details>)'
        
        if re.search(treatment_pattern, content, re.IGNORECASE):
            # Insert drug history after treatment history
            new_content = re.sub(treatment_pattern, f'\\1\n{drug_history_html}', content, flags=re.IGNORECASE)
            
            # Write the updated content back to the file
            with open(filename, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Updated {filename} - added drug history after treatment history")
        else:
            print(f"Skipping {filename} - no treatment history section found")
            
    except Exception as e:
        print(f"Error processing {filename}: {str(e)}")

print("\nProcessing complete!")
