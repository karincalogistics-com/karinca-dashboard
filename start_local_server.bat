@echo off
echo ========================================
echo   Karinca Dashboard - Yerel Sunucu
echo ========================================
echo.
echo Sunucu baslatiliyor...
echo.
echo Dashboard: http://localhost:8000
echo Excel klasoru: http://localhost:8000/data/
echo.
echo Durdurmak icin Ctrl+C basin
echo.
python -m http.server 8000
pause
