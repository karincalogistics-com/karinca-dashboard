@echo off
title Excel Yukleme - Karinca Dashboard
color 0A

echo.
echo ========================================
echo    EXCEL YUKLEME
echo ========================================
echo.

REM Excel dosyasini sor
echo Excel dosyasini buraya surekle ve Enter'a bas:
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

REM Dosya adini al
for %%F in ("%EXCEL_FILE%") do set FILENAME=%%~nxF

REM Hedef dosya
set TARGET=excel\%FILENAME%

echo.
echo ========================================
echo   Dosya: %FILENAME%
echo ========================================
echo.

REM excel klasoru yoksa olustur
if not exist excel mkdir excel

REM Kopyala
echo [1/3] Kopyalaniyor...
copy "%EXCEL_FILE%" "%TARGET%" >nul
echo      Tamam!

REM Git'e ekle
echo.
echo [2/3] Git'e ekleniyor...
git add "%TARGET%"
echo      Tamam!

REM Commit ve Push
echo.
echo [3/3] GitHub'a yukleniyor...
git commit -m "Excel eklendi: %FILENAME%"
git push origin main
echo      Tamam!

echo.
echo ========================================
echo   TAMAMLANDI!
echo ========================================
echo.
echo Dosya yuklendi: %FILENAME%
echo.
echo Simdi Dashboard'da "GitHub Tarihleri" butonuna basin!
echo.
pause
