# Script to add Herbal Remedies Interactions section after Drug History in all case sheets

# Define the section to add
$herbalRemediesSection = @'

    <details>
      <summary>HERBAL REMEDIES INTERACTIONS</summary>
      <iframe src="HERBAL_REMEDIES_INTERACTIONS.html"></iframe>
    </details>
'@

# Get all HTML files from the current directory
$caseSheets = Get-ChildItem -Path "." -Filter "*.html" -File | Where-Object { $_.Name -ne "HERBAL_REMEDIES_INTERACTIONS.html" }

# Patterns to identify drug history section (case insensitive)
$drugHistoryPatterns = @(
    '<h3>DRUG H/O',
    '<h3>DRUG HISTORY',
    '<h3>MEDICATION HISTORY',
    '<h3>DRUGS',
    '<h3>MEDICATIONS',
    '<h3>PRESCRIPTION HISTORY',
    '<h3>DRUG USE',
    '<h3>MEDICATION USE',
    '<h3>DRUG THERAPY',
    '<h3>MEDICATION THERAPY'
)

# Process each case sheet
foreach ($file in $caseSheets) {
    Write-Host "Processing $($file.Name)..."
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if herbal remedies section already exists
    if ($content -match 'HERBAL REMEDIES INTERACTIONS') {
        Write-Host "  - Herbal remedies section already exists in $($file.Name), skipping..."
        continue
    }
    
    $modified = $false
    
    # Try to find drug history section using different patterns
    foreach ($pattern in $drugHistoryPatterns) {
        # Look for the drug history section and capture up to the end of the list or next section
        if ($content -match "($pattern[\s\S]*?<\/h3>[\s\S]*?)(?=<\/ol>|<\/ul>|<\/div>|<\/details>|<\/section>|<h[1-6]>|$)") {
            $drugHistorySection = $matches[1]
            
            # Find the end of the current section (closing tag)
            $endPattern = '(<\/ol>|<\/ul>|<\/div>|<\/details>|<\/section>|<h[1-6]>)'
            
            if ($content -match "($pattern[\s\S]*?<\/h3>[\s\S]*?$endPattern)") {
                $fullSection = $matches[1]
                
                # Insert the herbal remedies section after the full section
                $newContent = $content -replace [regex]::Escape($fullSection), "$($fullSection.TrimEnd())`n$herbalRemediesSection"
                
                # Write the modified content back to the file
                $newContent | Set-Content -Path $file.FullName -NoNewline
                Write-Host "  - Added herbal remedies section after drug history in $($file.Name)"
                $modified = $true
                break
            }
        }
    }
    
    if (-not $modified) {
        Write-Host "  - Could not find a suitable drug history section in $($file.Name)"
    }
}

Write-Host "Processing complete. Please review the changes to ensure the herbal remedies section was added correctly."
