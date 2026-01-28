# Package the extension into a zip file

$distFolder = "dist"
$outputZip = "twitch-multichat-moderator.zip"

# Remove old zip if it exists
if (Test-Path $outputZip) {
    Remove-Item $outputZip -Force
    Write-Host "Removed existing $outputZip"
}

# Check if dist folder exists
if (-not (Test-Path $distFolder)) {
    Write-Host "Error: $distFolder folder not found. Run 'npm run build' first." -ForegroundColor Red
    exit 1
}

# Create the zip file
Write-Host "Packaging $distFolder into $outputZip..."
Compress-Archive -Path "$distFolder\*" -DestinationPath $outputZip -Force

Write-Host "Successfully created $outputZip" -ForegroundColor Green
