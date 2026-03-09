$ErrorActionPreference = "Continue"
$env:GIT_TRACE = 1

Write-Host "Current directory: $((Get-Location).Path)"
Write-Host "---"
Write-Host "Git remotes:"
git remote -v
Write-Host "---"
Write-Host "Git branch:"
git branch -a
Write-Host "---"
Write-Host "Git status:"
git status
Write-Host "---"
Write-Host "Attempting push..."
git push origin main -v
