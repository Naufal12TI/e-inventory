# 📦 E-Inventory — Panduan Instalasi via ZIP / RAR

Panduan lengkap memindahkan project E-Inventory ke laptop lain menggunakan file ZIP atau RAR, **dari nol hingga bisa berjalan**.

---

## 🖥️ Tech Stack

| Layer        | Teknologi                                        |
|--------------|--------------------------------------------------|
| **Backend**  | PHP 8.3+ (Laragon), CodeIgniter 4, MySQL         |
| **Frontend** | Vue 3 (CDN), TailwindCSS, Axios, Chart.js        |
| **Database** | MySQL (via Laragon)                              |
| **Server**   | Laragon (MySQL), PHP Built-in CLI, npx serve     |

---

## 📋 LANGKAH 0 — Install Software yang Dibutuhkan di Laptop Baru

Lakukan ini **sebelum** menerima file ZIP dari teman.

### ✅ 1. Install Laragon (PHP + MySQL sekaligus)

Laragon adalah software yang menyertakan PHP, MySQL, dan Apache dalam satu paket. **Wajib diinstall.**

1. Buka browser, pergi ke: **https://laragon.org/download/**
2. Download versi **Laragon Full** (bukan Portable)
3. Install seperti biasa (next → next → finish)
4. Setelah selesai, **buka Laragon** dan klik **"Start All"**

> ✅ Setelah Laragon aktif, MySQL sudah berjalan di port **3306** dan PHP dari Laragon siap digunakan.

---

### ✅ 2. Install Composer

Composer adalah tool untuk menginstall library/package PHP.

1. Buka: **https://getcomposer.org/Composer-Setup.exe**
2. Download dan jalankan file installer tersebut
3. Saat instalasi, pastikan **path PHP dari Laragon** terdeteksi (biasanya otomatis)
4. Klik Next → Install → Finish

**Verifikasi:** Buka CMD (tekan `Win + R`, ketik `cmd`, Enter), lalu ketik:
```
composer --version
```
Jika muncul versi composer (contoh: `Composer version 2.x.x`), berarti berhasil ✅

---

### ✅ 3. Install Node.js (untuk menjalankan frontend server)

Frontend dijalankan menggunakan `npx serve` yang butuh Node.js.

1. Buka: **https://nodejs.org/**
2. Download versi **LTS** (Long Term Support)
3. Install seperti biasa → Finish

**Verifikasi:**
```
node --version
npm --version
```

---

## 📦 LANGKAH 1 — Terima & Extract File ZIP

### Di laptop pengirim (kamu):

1. Pergi ke folder `e-inventory`
2. Klik kanan folder tersebut → **Compress to ZIP** atau **Add to archive (RAR)**
3. **Pastikan folder `vendor/` ikut masuk** ke dalam ZIP (jangan exclude apapun).
4. > ⚠️ **PENTING:** Pastikan file **`.env`** di dalam folder `backend/` ikut terkompres. Di Windows, file dengan awalan titik (`.env`) terkadang dianggap sebagai file sistem tersembunyi. Pastikan file tersebut tidak tertinggal agar aplikasi tidak error di laptop baru.
5. Kirim file ZIP ke teman via USB / Google Drive / dll.

> 📏 Ukuran file ZIP akan sekitar **50–150 MB** karena menyertakan folder `vendor/`.

---

### Di laptop penerima (teman):

1. Terima file ZIP dari teman
2. Klik kanan file ZIP → **Extract Here** atau **Extract to folder**
3. Pilih lokasi yang mudah diingat, contoh:
   ```
   C:\e-inventory\
   ```
   atau
   ```
   D:\Projects\e-inventory\
   ```
4. Pastikan setelah di-extract, struktur foldernya seperti ini:
   ```
   e-inventory/
   ├── backend/
   │   ├── app/
   │   ├── vendor/           ← harus ada!
   │   ├── .env
   │   ├── spark.bat
   │   └── composer.json
   ├── frontend/
   │   ├── assets/
   │   └── index.html
   ├── database_backup.sql   ← data database asli
   ├── import_db.bat         ← script import database otomatis
   ├── run.bat               ← shortcut untuk jalankan semua sekaligus
   └── README.md
   ```

> ⚠️ Jika folder `vendor/` **tidak ada** setelah di-extract, jalankan `composer install` di dalam folder `backend/`. Lihat Langkah 2.

---

## ⚙️ LANGKAH 2 — Install Dependencies Backend (Composer)

Buka **CMD** (tekan `Win + R`, ketik `cmd`, Enter).

Masuk ke folder backend project:
```bash
cd C:\e-inventory\backend
```
> Sesuaikan path `C:\e-inventory\` dengan lokasi kamu meng-extract tadi.

Jalankan perintah berikut:
```bash
composer install
```

> ⏳ Proses ini memerlukan koneksi internet dan memakan waktu 1–3 menit.
>
> Jika folder `vendor/` sudah ada dari ZIP, perintah ini tetap disarankan dijalankan untuk memastikan semua library terpasang dengan benar di sistem kamu.

Jika berhasil, akan muncul tulisan seperti:
```
Generating optimized autoload files
Generated class preloader
```

---

## 🗄️ LANGKAH 3 — Import Data Database

> ℹ️ File `database_backup.sql` berisi **seluruh data asli** dari database pengirim (barang, supplier, kategori, stok, user, dll).

### ⭐ Cara Mudah — Double-klik `import_db.bat` (Direkomendasikan)

1. Pastikan **Laragon sudah berjalan** (klik Start All, MySQL lampu hijau)
2. Buka folder hasil extract (`e-inventory/`)
3. **Double-klik file `import_db.bat`**
4. Script akan otomatis:
   - Membuat database `e_inventory` (jika belum ada)
   - Mengimport semua data dari `database_backup.sql`
5. Tunggu sampai muncul pesan:
   ```
   Import SELESAI!
   Database e_inventory sudah berisi data.
   ```

> ✅ Setelah ini **SKIP Langkah 4 dan 5** (tidak perlu migrate & seed lagi karena data sudah lengkap).

---

### ⚙️ Cara Manual (Alternatif via HeidiSQL)

1. Buka Laragon → klik **Database** → HeidiSQL terbuka
2. Klik kanan di panel kiri → **Create New** → **Database**
3. Isi nama: `e_inventory`, encoding: `utf8mb4` → **OK**
4. Klik database `e_inventory` → menu **File** → **Run SQL file...**
5. Pilih file `database_backup.sql` dari folder project
6. Klik **Open** → tunggu sampai selesai

---

## 🛠️ LANGKAH 3b — Konfigurasi File `.env`

File `.env` ada di dalam folder `backend/`. Buka file ini dengan **VS Code**, **Notepad++**, atau **Notepad** biasa.

Cari bagian **DATABASE** dan sesuaikan dengan kondisi laptop kamu:

```env
database.default.hostname = localhost
database.default.database = e_inventory
database.default.username = root
database.default.password =
database.default.port     = 3306
```

| Setting    | Nilai Default Laragon   | Keterangan                          |
|------------|-------------------------|-------------------------------------|
| `hostname` | `localhost`             | Tidak perlu diubah                  |
| `database` | `e_inventory`           | Nama database yang akan dibuat      |
| `username` | `root`                  | Username MySQL default Laragon      |
| `password` | *(kosong)*              | Password MySQL default Laragon kosong |
| `port`     | `3306`                  | Tidak perlu diubah                  |

> 💾 Simpan file setelah diedit.

---

## 🗃️ LANGKAH 4 — Buat Database MySQL

Pastikan **Laragon sudah berjalan** (klik Start All).

### Cara 1 — Lewat Laragon (GUI, Paling Mudah)

1. Di jendela Laragon, klik tombol **Database**
2. Program **HeidiSQL** akan terbuka
3. Klik **"New"** di kiri bawah → pilih koneksi **MySQL** → klik **Open**
4. Klik kanan di panel kiri → **Create New** → **Database**
5. Isi nama: `e_inventory`
6. Set encoding ke: `utf8mb4`
7. Klik **OK**

### Cara 2 — Lewat CMD (Alternatif)

Buka CMD dan ketik:
```bash
mysql -u root -p
```
Tekan Enter saat diminta password (password kosong, langsung Enter saja).

Lalu jalankan:
```sql
CREATE DATABASE e_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

---

## 🏗️ LANGKAH 5 — Buat Tabel & Isi Data Awal

> ⚠️ **Catatan Penting:** Gunakan **`spark.bat`** (bukan `php spark` langsung) karena PHP Laragon menggunakan `ext-intl` yang perlu diakses via path Laragon.

Buka **CMD** (PowerShell) dan masuk ke folder backend:
```bash
cd C:\e-inventory\backend
```

### Sesuaikan `spark.bat` (jika path PHP berbeda)

Buka file `spark.bat` dengan Notepad, pastikan path PHP sesuai versi Laragon di laptopmu:
```bat
C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe spark %*
```

Untuk mengetahui path PHP Laragon di laptopmu:
```bash
where php
```
Ganti path di baris terakhir `spark.bat` sesuai output di atas.

### 5a — Buat semua tabel database (Migrasi):
```bash
.\spark.bat migrate
```

Jika berhasil, akan muncul pesan seperti:
```
Running: 2024-01-01-000001_CreateUsersTable
Running: 2024-01-01-000002_CreateCategoriesTable
Running: 2024-01-01-000003_CreateSuppliersTable
Running: 2024-01-01-000004_CreateItemsTable
Running: 2024-01-01-000005_CreateStockHistoriesTable
Migrations complete.
```

### 5b — Isi data awal / sample (Seeder):
```bash
.\spark.bat db:seed DatabaseSeeder
```

Jika berhasil, akan muncul:
```
✅ UserSeeder: Default users (2 admin, 1 staff) berhasil dibuat.
✅ CategorySeeder: ... kategori berhasil dibuat.
✅ SupplierSeeder: ... supplier berhasil dibuat.
✅ ItemSeeder: ... barang berhasil dibuat.
✅ StockHistorySeeder: ... riwayat stok berhasil dibuat.
✅ Seeding selesai! Database siap digunakan.
   Login: admin / admin123 atau staff / staff123
```

---

## 🔐 LANGKAH 6 — Akun Login Default

Setelah seeder selesai, 3 akun ini sudah tersedia untuk dicoba:

| Username     | Password   | Role          |
|--------------|------------|---------------|
| `admin`      | `admin123` | Administrator |
| `superadmin` | `super123` | Administrator |
| `staff`      | `staff123` | Staff         |

---

## 🚀 LANGKAH 7 — Jalankan Aplikasi

### ⭐ Cara Mudah — Klik `run.bat` (Direkomendasikan)

1. Buka folder hasil extract (`e-inventory/`)
2. **Double-klik file `run.bat`**
3. Dua jendela CMD akan terbuka otomatis (backend + frontend)
4. Browser akan terbuka sendiri ke **http://localhost:5500**

> ⚠️ **Jangan tutup kedua jendela CMD yang terbuka** selama aplikasi sedang digunakan.

---

### ⚙️ Cara Manual (Jika `run.bat` tidak bisa / alternatif)

Buka **2 jendela CMD / PowerShell terpisah**:

**Jendela ke-1 — Backend (CodeIgniter 4):**
```bash
cd C:\e-inventory\backend
.\spark.bat serve
```
Tunggu sampai muncul:
```
CodeIgniter development server started on http://localhost:8080
```

**Jendela ke-2 — Frontend:**
```bash
cd C:\e-inventory\frontend
npx -y serve -l 5500
```
Tunggu sampai muncul:
```
INFO  Accepting connections at http://localhost:5500
```

Buka browser dan akses: **http://localhost:5500**

---

## ✅ Checklist Lengkap

Centang satu per satu sebelum mencoba membuka aplikasi:

```
[ ] 1.  Laragon sudah diinstall dan dijalankan (Start All)
[ ] 2.  Node.js sudah diinstall
[ ] 3.  Composer sudah diinstall
[ ] 4.  File ZIP sudah di-extract
[ ] 5.  composer install sudah dijalankan di folder backend/
[ ] 6.  File backend/.env sudah dikonfigurasi (database, username, password)
[ ] 7.  Database diimport: double-klik import_db.bat (ATAU Langkah 4+5 jika tidak pakai backup)
[ ] 8.  Jalankan aplikasi: double-klik run.bat
[ ] 9.  Buka http://localhost:5500 di browser
[ ] 10. Login dengan akun yang sudah ada di data backup
```

---

## 🐛 Troubleshooting

### ❌ `composer: command not found`
→ Composer belum terinstall atau belum masuk ke PATH.
Download ulang di: https://getcomposer.org/Composer-Setup.exe

### ❌ Error `Unable to connect to the database` saat `.\spark.bat migrate`
→ Pastikan:
- Laragon sudah jalan dan MySQL aktif (lampu **hijau** di Laragon)
- Database `e_inventory` sudah dibuat via **HeidiSQL**
- Konfigurasi di `backend/.env` sudah benar (hostname, username, password)

### ❌ Error `ext-intl` saat menjalankan `php spark`
→ Gunakan **`.\spark.bat`** bukan `php spark`. File `spark.bat` menggunakan PHP dari Laragon yang sudah include `ext-intl`.

### ❌ `spark.bat` error — path PHP tidak ditemukan
→ Buka `spark.bat` dengan Notepad, sesuaikan path PHP:
```bash
where php
```
Ganti path di baris terakhir `spark.bat` sesuai output di atas.

### ❌ Browser buka `http://localhost:5500` tapi layar putih / kosong
→ Tekan `F12` di browser → tab **Console** → lihat pesan error merahnya.
→ Pastikan kedua server (backend & frontend) sudah berjalan.

### ❌ Login gagal / tidak bisa masuk
→ Pastikan seeder sudah dijalankan: `.\spark.bat db:seed DatabaseSeeder`
→ Coba login dengan `admin` / `admin123`

### ❌ Frontend tidak bisa ambil data dari backend (CORS error)
→ Pastikan backend sudah berjalan di `http://localhost:8080`
→ Jangan tutup jendela CMD backend

### ❌ `npx serve` tidak ditemukan
→ Pastikan Node.js sudah terinstall: `node --version`
→ Alternatif: `npm install -g serve` lalu jalankan `serve -l 5500`

---

# 📸 Tampilan Aplikasi

## 🔑 Pengujian API (JWT)

![Tes API Token](frontend/assets/img/tes%20API%20token.png)

---

## 🗂️ Relasi Database

![Relasi Database](frontend/assets/img/relasi%20table.png)

---

## 🏠 Dashboard

![Dashboard](frontend/assets/img/halaman%20dashboard.png)

---

# 📦 Manajemen Barang

### Halaman Barang

![Halaman Barang](frontend/assets/img/halaman%20barang.png)

### Tambah Barang

![Tambah Barang](frontend/assets/img/tambah%20barang.png)

### Edit Barang

![Edit Barang](frontend/assets/img/edit%20barang.png)

### Hapus Barang

![Hapus Barang](frontend/assets/img/hapus%20barang.png)

---

# 🏷️ Manajemen Kategori

### Halaman Kategori

![Halaman Kategori](frontend/assets/img/halaman%20kategori.png)

### Tambah Kategori

![Tambah Kategori](frontend/assets/img/tambah%20kategori.png)

### Edit Kategori

![Edit Kategori](frontend/assets/img/edit%20kategori.png)

---

# 🚚 Manajemen Supplier

### Halaman Supplier

![Halaman Supplier](frontend/assets/img/halaman%20supplier.png)

### Tambah Supplier

![Tambah Supplier](frontend/assets/img/tambah%20supplier.png)

### Edit Supplier

![Edit Supplier](frontend/assets/img/edit%20supplier.png)

---

# 📊 Riwayat Stok

![Riwayat Stok](frontend/assets/img/halaman%20riwayat%20stok.png)

---

# 📥 Stok Masuk

![Tambah Stok Masuk](frontend/assets/img/tambah%20stok%20masuk.png)

---

# 📤 Stok Keluar

![Tambah Stok Keluar](frontend/assets/img/tambah%20stok%20keluar.png)

---

# 👤 Manajemen Pengguna

### Halaman Pengguna

![Halaman Pengguna](frontend/assets/img/halaman%20pengguna.png)

### Edit Pengguna

![Edit Pengguna](frontend/assets/img/edit%20pengguna.png)

---

---

> 💡 **Tip:** Simpan README ini di HP atau cetak, supaya mudah diikuti step by step.

> Dibuat dengan ❤️ — E-Inventory Management System
