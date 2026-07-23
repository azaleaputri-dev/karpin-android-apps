# Karpin Posyandu Mobile App

React Native CLI app untuk Kartu Pintar Posyandu. App ini terhubung ke backend Laravel Karpin melalui endpoint mobile/API proxy, mendukung role `admin`, `petugas`, dan `orangtua`.

## Struktur Project

Project biasanya dipakai bersama backend Laravel di folder yang sejajar:

```text
C:\xampp\htdocs\
  karpin\                 # Backend Laravel + api-proxy.php
  karpin-posyandu-app\    # React Native mobile app
```

Mobile app ini membaca base URL dari `src/config/api.js`.

```js
const API_BASE_URL = 'https://karpin-posyandu.unaux.com/api-proxy.php';
```


## Prasyarat Laptop Baru

- Windows 10/11
- Node.js `>= 22.11.0`
- JDK 17
- Android Studio + Android SDK + emulator atau HP Android
- PHP `>= 8.0`
- Composer
- MySQL/MariaDB, bisa lewat XAMPP
- Git

Pastikan environment React Native Android sudah siap:

```powershell
node -v
npm -v
java -version
adb version
php -v
composer -V
```

Jika JDK terpasang di lokasi berbeda, sesuaikan `android/gradle.properties`:

```properties
org.gradle.java.home=C:\\Program Files\\Java\\jdk-17
```

## Setup Backend Laravel

Clone atau copy backend Laravel ke:

```powershell
cd C:\xampp\htdocs
git clone <repo-backend-url> karpin
cd karpin
```

Install dependency:

```powershell
composer install
copy .env.example .env
php artisan key:generate
```

Atur database di `.env`:

```env
APP_NAME=Karpin
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=karpin
DB_USERNAME=root
DB_PASSWORD=
```

Buat database `karpin` di MySQL, lalu jalankan migrasi:

```powershell
php artisan migrate
php artisan db:seed
```

Migration penting untuk role orangtua:

```text
database/migrations/2026_07_23_000001_create_child_user_table.php
```

Jalankan backend lokal:

```powershell
php artisan serve --host=0.0.0.0 --port=8000
```

Cek route mobile:

```powershell
php artisan route:list --path=api/mobile
```

## Setup Mobile App

Masuk ke repo mobile:

```powershell
cd C:\xampp\htdocs\karpin-posyandu-app
npm install
```

Atur API lokal di `src/config/api.js` jika tidak memakai server production:

```js
const API_BASE_URL = 'http://10.0.2.2:8000/api';
```

Jalankan Metro:

```powershell
npm start
```

Di terminal lain, jalankan Android debug:

```powershell
npm run android:debug
```

Untuk release APK:

```powershell
cd android
gradlew.bat assembleRelease
```

Output APK:

```text
android\app\build\outputs\apk\release\app-release.apk
```

Instalation Apk Release:
cd android\app\build\outputs\apk\release\
adb install -r app-release.apk

## Akun dan Role

Role yang dipakai:

- `admin`: monitoring lintas posyandu, manajemen user, posyandu, dan perangkat IoT.
- `petugas`: CRUD data anak dan pengukuran untuk posyandu sendiri.
- `orangtua`: read-only, hanya melihat anak yang ditautkan ke akunnya.

Seeder default biasanya menyediakan:

```text
admin@gmail.com / admin12345
petugas@gmail.com / petugas12345
```

Akun `orangtua` dibuat lewat Manajemen User oleh admin, lalu pilih satu atau beberapa anak pada bagian "Anak yang bisa dilihat".

## API Proxy Production

Production InfinityFree/unaux memakai:

```text
https://karpin-posyandu.unaux.com/api-proxy.php
```

File proxy sumber lokal:

```text
C:\xampp\htdocs\karpin\public\api-proxy.php
```

Lokasi upload server:

```text
/karpin-posyandu.unaux.com/htdocs/api-proxy.php
```

Catatan hosting unaux:

- Server bisa mengembalikan JS challenge `slowAES` dengan status `503`.
- `src/utils/api.js` sudah membaca body sekali, mendeteksi challenge di status apa pun, lalu mengirim cookie `__test`.
- Jika upload FTP bermasalah EPSV, gunakan script PHP FTP dengan IPv4 dan passive mode off seperti catatan di `AGENTS.md`.

## Perintah Harian

Mobile:

```powershell
npm start
npm run android:debug
npm run lint
npm test -- --runInBand
```

Backend:

```powershell
php artisan serve --host=0.0.0.0 --port=8000
php artisan migrate
php artisan route:list --path=api/mobile
```

Build release:

```powershell
cd C:\xampp\htdocs\karpin-posyandu-app\android
gradlew.bat assembleRelease
```

## Troubleshooting

Jika Android Emulator tidak bisa akses backend lokal:

- Pastikan Laravel jalan dengan `--host=0.0.0.0`.
- Pakai `http://10.0.2.2:8000/api` untuk emulator.
- Untuk HP fisik, pakai IP laptop, bukan `localhost`.
- Pastikan firewall Windows mengizinkan port `8000`.

Jika Gradle gagal menemukan Java:

- Install JDK 17.
- Sesuaikan `org.gradle.java.home` di `android/gradle.properties`.

Jika login production gagal dengan "Terjadi kesalahan pada server":

- Pastikan `api-proxy.php` terbaru sudah diupload.
- Pastikan challenge/cookie handling di `src/utils/api.js` tidak diubah balik.
- Cek apakah server unaux mengembalikan HTML challenge.

Jika akun orangtua bisa melihat semua anak:

- Pastikan migration `child_user` sudah jalan.
- Pastikan akun memiliki role `orangtua`.
- Pastikan anak sudah ditautkan lewat Manajemen User.
- Pastikan backend/proxy production memakai versi terbaru.
