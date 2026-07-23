# AGENTS.md — Build & Context Log

## Build APK
```powershell
cd android; gradlew.bat assembleRelease
```
APK output: `android\app\build\outputs\apk\release\app-release.apk`

## Key Fixes in src/utils/api.js
1. JS challenge detection now works on ANY status code (not just 200)
2. Response body read once with `.text()`, then parsed as JSON (fixed double-read bug)
3. Error message extraction checks `data?.error` too (api-proxy.php format)

## Architecture
- React Native CLI (not Expo)
- Backend: api-proxy.php deployed to unaux.com
- JS challenge: unaux.com server-level slowAES AES-128-CBC + NoPadding
- Cookie `__test` sent via custom `Cookie` header in fetch

## Auth Flow
LoginScreen → AuthContext.login → auth.js.login → authorizedPost → request() → ensureCookie() → fetch with Cookie header → api-proxy.php/mobile/login

## DB Schema Fix
- Laravel migration uses `child_name` not `name` + extra columns (mother_name, father_name, blood_type, etc.)
- api-proxy.php INSERT/SELECT/UPDATE now matches app form fields
- api-proxy.php detail response returns `{child, summary, nutrition_status, measurements}`
- api-proxy.php measurements list returns `{data: [{..., child: {id, child_name, posyandu_name}}]}`

## Build Issue: error "Terjadi kesalahan pada server"
Cause: unaux.com JS challenge returns 503 with HTML; old code only checked for challenge on status 200. Fixed by reading body text first, checking for slowAES/toNumbers pattern regardless of status code.

## FTP Upload Workaround
PowerShell/GnuWin32 curl EPSV issue → use PHP `ftp_connect` + `gethostbyname` (force IPv4) + `ftp_pasv($ftp, false)`.

## Server Directory Structure (InfinityFree)
- Web root: `/karpin-posyandu.unaux.com/htdocs/`
- Laravel app deployed there by default
- api-proxy.php and migrate scripts go in that htdocs dir
