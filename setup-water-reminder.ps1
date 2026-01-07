# ===============================================
# HealFit - Configuration automatique du rappel d'eau
# A EXECUTER EN TANT QU'ADMINISTRATEUR
# ===============================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== Configuration du rappel d'eau HealFit ===" -ForegroundColor Cyan
Write-Host ""

# -------------------------------
# 1. Verifier les droits admin
# -------------------------------
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principalCheck = New-Object Security.Principal.WindowsPrincipal($currentUser)

if (-not $principalCheck.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERREUR : Lancez PowerShell en tant qu'administrateur." -ForegroundColor Red
    exit
}

# -------------------------------
# 2. Chemins du projet
# -------------------------------
$projectPath = "C:\Users\benma\OneDrive\Bureau\healfit2.0\symfony-project"
$phpPath = ""

$possiblePhpPaths = @(
    "C:\wamp64\bin\php\php8.2.10\php.exe",
    "C:\xampp\php\php.exe",
    "C:\php\php.exe"
)

foreach ($path in $possiblePhpPaths) {
    if (Test-Path $path) {
        $phpPath = $path
        break
    }
}

if ([string]::IsNullOrEmpty($phpPath)) {
    Write-Host "PHP non trouve. Entrez le chemin vers php.exe :" -ForegroundColor Yellow
    $phpPath = Read-Host
    if (-not (Test-Path $phpPath)) {
        Write-Host "Chemin PHP invalide." -ForegroundColor Red
        exit
    }
}

Write-Host "PHP utilise : $phpPath" -ForegroundColor Green

# -------------------------------
# 3. Creer le dossier de logs
# -------------------------------
$logDir = Join-Path $projectPath "var\log"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

# -------------------------------
# 4. Creer le fichier batch
# -------------------------------
$batchFile = Join-Path $projectPath "water_reminder.bat"

$batchContent = @"
@echo off
chcp 65001 > nul
set PROJECT_PATH=$projectPath
set PHP_PATH=$phpPath
set LOG_FILE=%PROJECT_PATH%\var\log\water_reminder.log

echo =========================================== >> "%LOG_FILE%"
echo [%date% %time%] Debut execution >> "%LOG_FILE%"

cd /d "%PROJECT_PATH%"
"%PHP_PATH%" bin\console app:water-reminder --no-debug >> "%LOG_FILE%" 2>&1

echo [%date% %time%] Fin execution >> "%LOG_FILE%"
echo =========================================== >> "%LOG_FILE%"
"@

$batchContent | Out-File -FilePath $batchFile -Encoding ASCII
Write-Host "Fichier batch cree : $batchFile" -ForegroundColor Green

# -------------------------------
# 5. Test du batch
# -------------------------------
Write-Host "Test du batch..." -ForegroundColor Cyan
& $batchFile
Start-Sleep -Seconds 2

# -------------------------------
# 6. Creation de la tache planifiee
# -------------------------------
$taskName = "HealFit Water Reminder"

Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

$action = New-ScheduledTaskAction -Execute $batchFile -WorkingDirectory $projectPath

$trigger = New-ScheduledTaskTrigger `
    -Once `
    -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Minutes 15) `
    -RepetitionDuration (New-TimeSpan -Days 365)

$principal = New-ScheduledTaskPrincipal `
    -UserId "SYSTEM" `
    -LogonType ServiceAccount `
    -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -MultipleInstances IgnoreNew

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description "Rappel d'eau HealFit toutes les 15 minutes"

Write-Host "Tache planifiee creee avec succes." -ForegroundColor Green

# -------------------------------
# 7. Test de la tache
# -------------------------------
Start-ScheduledTask -TaskName $taskName
Write-Host "Tache lancee manuellement." -ForegroundColor Cyan

Write-Host ""
Write-Host "Configuration terminee avec succes !" -ForegroundColor Green
Write-Host "Les rappels d'eau sont maintenant automatises."
