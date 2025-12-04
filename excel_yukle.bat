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

REM Dosya adini ve uzantisini al
for %%F in ("%EXCEL_FILE%") do (
    set FILENAME=%%~nxF
    set EXT=%%~xF
)

REM Hedef dosya (orijinal ismiyle)
set TARGET=excel\%FILENAME%

echo.
echo ----------------------------------------
echo Dosya: %FILENAME%
echo ----------------------------------------
echo.

REM excel klasoru yoksa olustur
if not exist excel mkdir excel

REM Kopyala
echo [1/4] Kopyalaniyor...
copy "%EXCEL_FILE%" "%TARGET%" >nul

REM Git GUI'yi ac (opsiyonel)
echo [2/4] Dosya hazir...

echo.
echo ========================================
echo   SIMDI NE YAPACAKSIN?
echo ========================================
echo.
echo 1. Git GUI acildi
echo 2. "Rescan" butonuna bas
echo 3. Dosyayi gor: %FILENAME%
echo 4. "Stage Changed" butonuna bas
echo 5. Commit Message yaz: "Excel eklendi: %FILENAME%"
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
    git commit -m "Excel eklendi: %FILENAME%"
    git push origin main
    
    echo.
    echo ========================================
    echo   TAMAMLANDI!
    echo ========================================
    echo.
    echo Dosya GitHub'a yuklendi: %FILENAME%
    echo.
    echo Dashboard'da "GitHub Tarihleri" butonuna basin!
    echo.
) else (
    echo.
    echo Git GUI'de manuel yapabilirsin.
    echo.
)

pause
