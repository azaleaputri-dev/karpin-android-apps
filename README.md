# Karpin Posyandu Mobile App

React Native CLI app untuk Kartu Pintar Posyandu. README ini fokus untuk setup environment mobile di laptop lain tanpa Android Studio dan tanpa setup backend lokal.

## Prasyarat

Install tools berikut:

- Node.js `>= 22.11.0`
- JDK 17
- Git
- Android SDK Command-line Tools
- Android Platform Tools, terutama `adb`

Backend tidak disiapkan di repo ini. App memakai API dari `src/config/api.js`.

```js
const API_BASE_URL = 'https://karpin-posyandu.unaux.com/api-proxy.php';
```

## Setup Android SDK Tanpa Android Studio

Download Android command-line tools dari halaman resmi Android:

```text
https://developer.android.com/studio#command-line-tools-only
```

Contoh struktur folder di Windows:

```text
C:\Android\cmdline-tools\latest\
C:\Android\platform-tools\
C:\Android\platforms\
C:\Android\build-tools\
```

Tambahkan environment variable:

```powershell
setx ANDROID_HOME "C:\Android"
setx ANDROID_SDK_ROOT "C:\Android"
setx JAVA_HOME "C:\Program Files\Java\jdk-17"
```

Tambahkan ke `Path` Windows:

```text
C:\Android\cmdline-tools\latest\bin
C:\Android\platform-tools
%JAVA_HOME%\bin
```

Tutup lalu buka terminal baru, kemudian cek:

```powershell
node -v
npm -v
java -version
adb version
sdkmanager --version
```

Install paket SDK yang dibutuhkan:

```powershell
sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006"
sdkmanager --licenses
```

Jika lokasi JDK berbeda, sesuaikan file `android/gradle.properties`:

```properties
org.gradle.java.home=C:\\Program Files\\Java\\jdk-17
```

## Setup Project

Clone project:

```powershell
cd C:\xampp\htdocs
git clone <repo-mobile-url> karpin-posyandu-app
cd karpin-posyandu-app
```

Install dependency:

```powershell
npm install
```

Pastikan API sudah sesuai di:

```text
src/config/api.js
```

Default production:

```js
const API_BASE_URL = 'https://karpin-posyandu.unaux.com/api-proxy.php';
```

Jika memakai backend lokal dari laptop lain atau server lokal, ubah URL itu sesuai alamat API yang bisa diakses HP.

## Menjalankan di HP Android

Aktifkan Developer Options dan USB Debugging di HP, lalu sambungkan USB.

Cek device:

```powershell
adb devices
```

Jalankan Metro:

```powershell
npm start
```

Di terminal lain:

```powershell
npm run android:debug
```

Jika Metro tidak terhubung dari HP:

```powershell
adb reverse tcp:8081 tcp:8081
```

Lalu reload app.

## Build APK Release

Release APK memakai Gradle wrapper bawaan project:

```powershell
cd android
gradlew.bat assembleRelease
```

Output:

```text
android\app\build\outputs\apk\release\app-release.apk
```

Catatan: konfigurasi release saat ini masih memakai debug signing config. Untuk publikasi resmi, buat keystore release sendiri.

## Script

```powershell
npm start
npm run android:debug
npm run android:release
npm run lint
npm test -- --runInBand
npm run build:android:release
```

## Role Login

Role yang didukung app:

- `admin`: dashboard dan manajemen.
- `petugas`: input data anak dan pengukuran.
- `orangtua`: read-only, hanya melihat anak tertaut.

Contoh akun jika backend production menyediakan seed:

```text
admin@gmail.com / admin12345
petugas@gmail.com / petugas12345
```

## Troubleshooting

Jika `adb` tidak terbaca:

- Pastikan `C:\Android\platform-tools` masuk ke `Path`.
- Cabut-pasang USB dan pilih mode File Transfer.
- Jalankan `adb kill-server` lalu `adb start-server`.

Jika Gradle gagal menemukan Java:

- Pastikan JDK 17 terinstall.
- Cek `JAVA_HOME`.
- Sesuaikan `org.gradle.java.home` di `android/gradle.properties`.

Jika build gagal karena SDK belum lengkap:

```powershell
sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006"
sdkmanager --licenses
```

Jika login production gagal:

- Pastikan koneksi internet aktif.
- Pastikan `src/config/api.js` mengarah ke API yang benar.
- Jika server unaux sedang mengirim challenge HTML, handling ada di `src/utils/api.js`; jangan diubah balik.
