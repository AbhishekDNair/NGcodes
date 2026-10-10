Get-ChildItem -Path 'src' -Recurse -Include '*.js','*.json','*.sql','*.html' | ForEach-Object {
  $path = $_.FullName
  $content = Get-Content $path -Raw -Encoding UTF8
  $updated = $content -replace 'KrishiVaani', 'Karshaka Care' -replace 'krishivaani', 'karshaka-care'
  if ($content -ne $updated) {
    Set-Content $path $updated -Encoding UTF8 -NoNewline
    Write-Host "Updated: $($_.Name)"
  }
}
