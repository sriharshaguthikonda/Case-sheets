import os
import re
import urllib.parse
from pathlib import Path

# Get the directory of the current script
script_dir = Path(__file__).parent

# Read the list of major case sheets
with open(script_dir / 'list_of_major_case_sheets.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all HTML file paths from the markdown links
file_paths = re.findall(r'\[(?:[^\]]+)\]\(([^)]+\.html)\)', content)
# Convert URL-encoded paths to regular file paths
file_paths = [Path(urllib.parse.unquote(path)) for path in file_paths]
# Make paths absolute and resolve any relative paths
file_paths = [(script_dir / path).resolve() for path in file_paths]

# Function to add CHAPERONE heading after examination headings
def add_chaperone_heading(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern to match h3 or h4 headings containing 'EXAMINATION' (case insensitive)
        pattern = r'(<h[34][^>]*>.*?EXAMINATION.*?<\/h[34]>)(\s*<h4>CHAPERONE<\/h4>)?'
        
        # Replacement function to add CHAPERONE heading if not already present
        def add_chaperone(match):
            if match.group(2):  # If CHAPERONE heading already exists
                return match.group(0)  # Return as is
            else:
                # Add CHAPERONE heading after the examination heading
                return f"{match.group(1)}\n<h4>CHAPERONE</h4>"
        
        # Apply the replacement
        new_content, count = re.subn(
            pattern, 
            add_chaperone, 
            content, 
            flags=re.IGNORECASE | re.DOTALL
        )
        
        # Write back to file if changes were made
        if count > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return f"Updated {file_path.name}: Added {count} CHAPERONE headings"
        else:
            return f"No changes needed for {file_path.name}"
            
    except Exception as e:
        return f"Error processing {file_path.name}: {str(e)}"

# Process each file
print("Adding CHAPERONE headings to case sheets...\n")
for file_path in file_paths:
    if file_path.exists() and file_path.is_file():
        result = add_chaperone_heading(file_path)
        print(result)
    else:
        print(f"File not found: {file_path}")

print("\nProcess completed.")
