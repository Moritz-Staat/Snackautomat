@echo off
rem ===========================================================================
rem  Startet den Automaten so, wie er auf der Messe laeuft:
rem  statischer Server mit Docroot auf dem Repo-Root + Chrome im Kiosk-Modus.
rem
rem    scripts\kiosk.cmd            Startseite im Vollbild
rem    scripts\kiosk.cmd 9000       auf Port 9000
rem
rem  Beenden: Alt+F4 im Chrome-Fenster, danach schliesst sich der Server mit.
rem ===========================================================================
setlocal

set PORT=%1
if "%PORT%"=="" set PORT=8080

set ROOT=%~dp0..
set URL=http://127.0.0.1:%PORT%/dist/Automat.html

rem --- Chrome suchen ---------------------------------------------------------
set CHROME=
for %%P in (
  "%ProgramFiles%\Google\Chrome\Application\chrome.exe"
  "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
  "%LocalAppData%\Google\Chrome\Application\chrome.exe"
) do if not defined CHROME if exist %%P set CHROME=%%P

if not defined CHROME (
  echo [FEHLER] Chrome nicht gefunden. Pfad in scripts\kiosk.cmd eintragen.
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo [FEHLER] node nicht im PATH. Node.js installieren oder den Server
  echo          anderweitig starten ^(nginx, Apache^) und Chrome von Hand oeffnen.
  exit /b 1
)

rem --- Server im Hintergrund -------------------------------------------------
echo Starte Server auf Port %PORT% ...
start "Snackautomat-Server" /min cmd /c "node "%ROOT%\scripts\serve.mjs" --port %PORT%"

rem kurz warten, bis der Port offen ist
timeout /t 2 /nobreak >nul

rem --- Chrome im Kiosk-Modus -------------------------------------------------
rem  --kiosk                          Vollbild ohne jede Browser-UI
rem  --autoplay-policy=...            Screensaver-Video startet ohne Nutzergeste
rem  --overscroll-history-navigation=0  kein Zurueck-Wischen per Touch
rem  --disable-pinch                  Besucher koennen die Seite nicht zoomen
rem  --user-data-dir                  eigenes Profil, damit localStorage-
rem                                   Zaehlerstaende getrennt vom Alltagsbrowser
rem                                   liegen und keine Sitzung wiederhergestellt wird
echo Starte Chrome im Kiosk-Modus ...
"%CHROME%" ^
  --kiosk ^
  --start-fullscreen ^
  --autoplay-policy=no-user-gesture-required ^
  --overscroll-history-navigation=0 ^
  --disable-pinch ^
  --noerrdialogs ^
  --disable-infobars ^
  --disable-session-crashed-bubble ^
  --disable-features=Translate,TranslateUI ^
  --check-for-update-interval=31536000 ^
  --user-data-dir="%LocalAppData%\SnackautomatKiosk" ^
  "%URL%"

rem --- Chrome ist zu: Server mit beenden -------------------------------------
echo Chrome beendet, stoppe Server ...
taskkill /FI "WINDOWTITLE eq Snackautomat-Server*" /T /F >nul 2>&1

endlocal
