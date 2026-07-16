$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$fontDirectory = Join-Path $repoRoot 'public\assets\fonts'
$licenseDirectory = Join-Path $repoRoot 'docs\licenses\fonts'

New-Item -ItemType Directory -Force -Path $fontDirectory | Out-Null
New-Item -ItemType Directory -Force -Path $licenseDirectory | Out-Null

$downloads = @(
  @{
    Uri = 'https://fonts.gstatic.com/s/manrope/v20/xn7gYHE41ni1AdIRggexSg.woff2'
    Path = Join-Path $fontDirectory 'manrope-latin-variable.woff2'
  },
  @{
    Uri = 'https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff2'
    Path = Join-Path $fontDirectory 'space-grotesk-latin-variable.woff2'
  },
  @{
    Uri = 'https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/OFL.txt'
    Path = Join-Path $licenseDirectory 'Manrope-OFL.txt'
  },
  @{
    Uri = 'https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/OFL.txt'
    Path = Join-Path $licenseDirectory 'Space-Grotesk-OFL.txt'
  }
)

foreach ($download in $downloads) {
  Invoke-WebRequest -Uri $download.Uri -OutFile $download.Path
}

Write-Host "Fetched $($downloads.Count) self-hosted font artifacts."
