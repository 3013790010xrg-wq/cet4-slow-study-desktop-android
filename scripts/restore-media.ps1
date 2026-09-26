param([string]$ArchivePath)
$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$expectedHash = 'f0b99765ed75528e15f201c301b6c93b7beb4ef22dfd9b9f98b7c4498a755f0f'
if (-not $ArchivePath) {
    $cacheDir = Join-Path $projectRoot '.media-cache'
    New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null
    $ArchivePath = Join-Path $cacheDir 'cet4-slow-study-desktop-v1.1.0.zip'
    if (-not (Test-Path -LiteralPath $ArchivePath)) {
        Invoke-WebRequest -UseBasicParsing -Uri 'https://github.com/3013790010xrg-wq/cet4-slow-study-desktop-android/releases/download/v1.1.0/cet4-slow-study-desktop-v1.1.0.zip' -OutFile $ArchivePath
    }
}
$ArchivePath = (Resolve-Path -LiteralPath $ArchivePath).Path
if ((Get-FileHash -LiteralPath $ArchivePath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expectedHash) {
    throw 'Archive checksum mismatch. Download the original v1.1.0 desktop ZIP again.'
}
Add-Type -AssemblyName System.IO.Compression.FileSystem
$mediaRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot 'source-app/历年试卷'))
$prefix = '四级学习包/历年试卷/'
$zip = [System.IO.Compression.ZipFile]::OpenRead($ArchivePath)
$count = 0
try {
    foreach ($entry in $zip.Entries) {
        $entryPath = $entry.FullName.Replace('\', '/')
        if (-not $entryPath.StartsWith($prefix, [System.StringComparison]::Ordinal) -or $entryPath.EndsWith('/')) { continue }
        $relative = $entryPath.Substring($prefix.Length)
        $destination = [System.IO.Path]::GetFullPath((Join-Path $mediaRoot $relative))
        if (-not $destination.StartsWith($mediaRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw 'Unexpected archive path'
        }
        New-Item -ItemType Directory -Path ([System.IO.Path]::GetDirectoryName($destination)) -Force | Out-Null
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $destination, $true)
        $count++
    }
} finally { $zip.Dispose() }
if ($count -eq 0) { throw 'No study media found in archive' }
Write-Output "Restored $count media and source-description files."
