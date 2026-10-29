# Migrasi dari portal Sites

Migrasi data bukan deployment source. Men-deploy repo ini membuat database baru yang kosong; data contoh demo tidak pernah disimpan sebagai tiket asli. Portal lama dapat tetap digunakan sampai target berhasil diverifikasi.

## Pilihan A — mulai dari database kosong

Untuk portofolio, pilihan paling sederhana: jalankan panduan HOSTING, gunakan demo publik sintetis, dan buat tiket baru setelah login admin. Tidak ada data pribadi/klien yang masuk repo publik.

## Pilihan B — pindahkan tiket asli

1. Jadwalkan waktu penghentian perubahan pada portal lama. Tutup sesi lain supaya snapshot tiket, event dan lampiran konsisten.
2. Dalam Chrome yang sudah login dan mendapat akses portal lama, buka endpoint `/api/tickets` pada origin portal tersebut, lalu simpan respons JSON sebagai `migration-data/tickets.json`. Folder ini di-ignore Git. CSV dari dashboard bukan backup lengkap karena tidak menyertakan riwayat event atau metadata lampiran.
3. Siapkan backup di penyimpanan privat milik sendiri. Jangan mengunggah JSON/SQL atau file asli ke GitHub, screenshot portofolio, atau folder public.
4. Buat target D1 kosong dan terapkan migrasi struktur sesuai HOSTING.
5. Konversi snapshot ke SQL:

```sh
mkdir -p migration-data
node scripts/import-tickets.mjs migration-data/tickets.json > migration-data/import.sql
```

6. Periksa SQL secara privat, lalu import ke target kosong:

```sh
npx wrangler d1 execute DB --remote --config wrangler.local.jsonc --file migration-data/import.sql
```

Script mempertahankan ID, version, timestamp, attachment keys, dan seluruh event. Tidak memakai DELETE atau INSERT OR REPLACE. Jika ada benturan ID atau kegagalan sebagian, hentikan; periksa target sebelum mencoba lagi. Jangan menjalankan impor ulang secara buta. Untuk dataset besar gunakan ekspor/impor D1 yang dikelola langsung dan verifikasi batching.

## Lampiran R2

JSON/SQL tidak berisi bytes file. Setiap attachment harus ikut dipindahkan dengan **key yang sama**:

- Jika punya akses administratif bucket lama, gunakan mekanisme ekspor/copy R2 dengan kredensial yang disimpan privat.
- Jika akses hanya lewat portal, login ke portal lama dan unduh `/api/files/<key>` untuk setiap key dalam metadata JSON. Simpan dengan nama key aslinya, bukan nama unduhan default.
- Setelah R2 target diaktifkan, unggah setiap file ke key yang sama:

```sh
npx wrangler r2 object put ticket-portal-files/KEY --file migration-data/KEY --remote
```

Jangan membuka bucket ke publik. Jangan menghapus resource lama sebelum semua file berhasil diunduh dari portal target. Tanpa R2 target, tiket tetap dapat dipindahkan, tetapi lampiran belum bisa diakses.

## Validasi dan cutover

- Bandingkan jumlah tiket, event, dan lampiran dengan snapshot.
- Bandingkan ID, status, priority, created_at, changed_at, dan version.
- Pastikan CANCEL/Completed tetap berhenti, sementara status aktif melanjutkan perhitungan dari timestamp lama. Waktu selama perpindahan tetap terhitung untuk tiket aktif.
- Uji reopen, konflik version, download file, dan login/logout.
- Ganti link yang dibagikan setelah validasi. Pertahankan backup dan portal lama sampai migrasi diterima; penghapusan lama dilakukan terpisah.
