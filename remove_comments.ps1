$files = Get-ChildItem -Path . -Filter "*.html" -File -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    # Remove HTML comments (<!-- ... -->) including multi-line comments
    $newContent = $content -replace '<!--.*?-->', '' -replace '(?s)<!--.*?-->', ''
    # Remove empty lines that might be left after comment removal
    $newContent = $newContent -replace '(?m)^\s*\r?\n', [String]::Empty
    # Save the file only if changes were made
    if ($newContent -ne $content) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Processed: $($file.Name)"
    } else {
        Write-Host "No comments found in: $($file.Name)"
    }
}

Write-Host "\nComment removal process completed."
