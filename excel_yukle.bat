@echo off
title Excel Yukleme - Karinca Dashboard
color 0A

echo.
echo ========================================
echo    EXCEL YUKLEME (Super Basit)
echo ========================================
echo.

REM Excel dosyasini sor
echo Excel dosyasini buraya surekle:
set /p EXCEL_FILE=

REM Tirnak isaretlerini kaldir
set EXCEL_FILE=%EXCEL_FILE:"=%

REM Dosya var mi kontrol et
if not exist "%EXCEL_FILE%" (
    echo.
    echo HATA: Dosya bulunamadi!
    pause
    exit
)

REM Bugunun tarihini al
for /f "tokens=1-3 delims=." %%a in ('echo %date:~0,10%') do (
    set DAY=%%a
    set MONTH=%%b
    set YEAR=%%c
)
set TODAY=%YEAR%-%MONTH%-%DAY%

REM Dosya uzantisini al
for %%F in ("%EXCEL_FILE%") do set EXT=%%~xF

REM Hedef dosya
set TARGET=excel\%TODAY%%EXT%

echo.
echo ----------------------------------------
echo Dosya: %TODAY%%EXT%
echo ----------------------------------------
echo.

REM excel klasoru yoksa olustur
if not exist excel mkdir excel

REM Kopyala
echo [1/4] Kopyalaniyor...
copy "%EXCEL_FILE%" "%TARGET%" >nul

REM Git GUI'yi ac
echo [2/4] Git GUI aciliyor...
start "" "C:\Program Files\Git\cmd\git-gui.exe"

echo.
echo ========================================
echo   SIMDI NE YAPACAKSIN?
echo ========================================
echo.
echo 1. Git GUI acildi
echo 2. "Rescan" butonuna bas
echo 3. Dosyayi gor: %TODAY%%EXT%
echo 4. "Stage Changed" butonuna bas
echo 5. Commit Message yaz: "Excel eklendi: %TODAY%"
echo 6. "Commit" butonuna bas
echo 7. "Push" butonuna bas
echo.
echo ========================================
echo   VEYA OTOMATIK YAPAYIM MI?
echo ========================================
echo.
set /p AUTO="Otomatik yapayim mi? (E/H): "

if /i "%AUTO%"=="E" (
    echo.
    echo [3/4] Git'e ekleniyor...
    git add "%TARGET%"
    
    echo [4/4] Commit ve Push yapiliyor...
    git commit -m "Excel eklendi: %TODAY%"
    git push origin main
    
    echo.
    echo ========================================
    echo   TAMAMLANDI!
    echo ========================================
    echo.
    echo Dosya GitHub'a yuklendi: %TODAY%%EXT%
    echo.
    echo Dashboard'da "GitHub Tarihleri" butonuna basin!
    echo.
) else (
    echo.
    echo Git GUI'de manuel yapabilirsin.
    echo.
)

pause
