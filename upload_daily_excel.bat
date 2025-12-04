@echo off
echo ========================================
echo   Gunluk Excel Yukleme (Tarih Bazli)
echo ========================================
echo.

REM Bugunun tarihini al (YYYY-MM-DD formatinda)
for /f "tokens=1-3 delims=." %%a in ('echo %date:~0,10%') do (
    set DAY=%%a
    set MONTH=%%b
    set YEAR=%%c
)

set TODAY=%YEAR%-%MONTH%-%DAY%

echo Bugun: %TODAY%
echo.

REM Excel dosyasinin yolunu sor
set /p EXCEL_PATH="Excel dosyasinin tam yolunu girin (veya surekleyin): "

REM Tirnak isaretlerini kaldir
set EXCEL_PATH=%EXCEL_PATH:"=%

REM Dosya uzantisini al
for %%F in ("%EXCEL_PATH%") do set EXT=%%~xF

REM Hedef dosya adi
set TARGET_FILE=excel\%TODAY%%EXT%

echo.
echo Hedef: %TARGET_FILE%
echo Kopyalaniyor...

REM excel klasoru yoksa olustur
if not exist excel mkdir excel

REM Kopyala
copy "%EXCEL_PATH%" "%TARGET_FILE%"

echo.
echo Git'e ekleniyor...
git add "%TARGET_FILE%"

echo.
echo Commit yapiliyor...
git commit -m "Excel eklendi: %TODAY%"

echo.
echo GitHub'a yukleniyor...
git push origin main

echo.
echo ========================================
echo   TAMAMLANDI!
echo ========================================
echo.
echo Dosya: %TARGET_FILE%
echo.
echo Dashboard'da "GitHub Tarihleri" butonuna basin
echo %TODAY% tarihini secin ve yukleyin!
echo.
pause
