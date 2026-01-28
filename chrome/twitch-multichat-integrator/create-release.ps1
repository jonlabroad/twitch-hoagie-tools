# Create a GitHub release with auto-incremented patch version

# Check if gh CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "Error: GitHub CLI (gh) is not installed. Install from https://cli.github.com/" -ForegroundColor Red
    exit 1
}

# Read current version from package.json
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$currentVersion = $packageJson.version

Write-Host "Current version: $currentVersion"

# Parse and increment patch version
$versionParts = $currentVersion -split '\.'
$major = [int]$versionParts[0]
$minor = [int]$versionParts[1]
$patch = [int]$versionParts[2]
$patch++
$newVersion = "$major.$minor.$patch"

Write-Host "New version: $newVersion" -ForegroundColor Green

# Update package.json with new version
$packageJson.version = $newVersion
$packageJson | ConvertTo-Json -Depth 100 | Set-Content "package.json"
Write-Host "Updated package.json"

# Build the extension
Write-Host "`nBuilding extension..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Package the extension
Write-Host "`nPackaging extension..."
& .\package-extension.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Packaging failed!" -ForegroundColor Red
    exit 1
}

# Commit version change
git add package.json
git commit -m "Bump version to $newVersion"
git push

# Create GitHub release
Write-Host "`nCreating GitHub release v$newVersion..."
gh release create "v$newVersion" `
    --title "Release v$newVersion" `
    --notes "Release version $newVersion" `
    twitch-multichat-moderator.zip

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccessfully created release v$newVersion!" -ForegroundColor Green
} else {
    Write-Host "`nFailed to create release!" -ForegroundColor Red
    exit 1
}
