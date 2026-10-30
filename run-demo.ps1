$ErrorActionPreference = "Stop"

$mavenPath = $null
$mavenCommand = Get-Command mvn.cmd -ErrorAction SilentlyContinue
if ($mavenCommand) {
    $mavenPath = $mavenCommand.Source
} else {
    $mavenHome = Join-Path $HOME ".maven"
    if (Test-Path -LiteralPath $mavenHome) {
        $mavenPath = Get-ChildItem -LiteralPath $mavenHome -Directory |
            Sort-Object LastWriteTime -Descending |
            ForEach-Object { Join-Path $_.FullName "bin\mvn.cmd" } |
            Where-Object { Test-Path -LiteralPath $_ } |
            Select-Object -First 1
    }
}

if (-not $mavenPath) {
    throw "Maven was not found. Install Maven or add mvn.cmd to PATH."
}

$projectRoot = $PSScriptRoot
$safeProjectPath = Join-Path $env:TEMP ("rentify-demo-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Junction -Path $safeProjectPath -Target $projectRoot | Out-Null

$exitCode = 1
try {
    Push-Location $safeProjectPath
    & $mavenPath spring-boot:run "-Dspring-boot.run.profiles=demo"
    $exitCode = $LASTEXITCODE
} finally {
    Pop-Location
    Remove-Item -LiteralPath $safeProjectPath
}

exit $exitCode
