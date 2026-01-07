@echo off
chcp 65001 > nul
set PROJECT_PATH=C:\Users\benma\OneDrive\Bureau\healfit2.0\symfony-project
set PHP_PATH=C:\xampp\php\php.exe
set LOG_FILE=%PROJECT_PATH%\var\log\water_reminder.log

echo =========================================== >> "%LOG_FILE%"
echo [%date% %time%] Debut execution >> "%LOG_FILE%"

cd /d "%PROJECT_PATH%"
"%PHP_PATH%" bin\console app:water-reminder --no-debug >> "%LOG_FILE%" 2>&1

echo [%date% %time%] Fin execution >> "%LOG_FILE%"
echo =========================================== >> "%LOG_FILE%"
