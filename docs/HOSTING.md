# Hosting di akun Cloudflare sendiri

Target: Cloudflare **Workers Free + D1 Free**, dengan subdomain `workers.dev`. Domain berbayar dan R2 tidak diperlukan untuk menjalankan tiket/SLA. Lampiran dinonaktifkan sampai binding R2 tersedia.

## 1. Buat akun

- Cloudflare: https://dash.cloudflare.com/sign-up
- GitHub: https://github.com/signup

Pendaftaran, verifikasi email, persetujuan ketentuan, dan autentikasi dilakukan sendiri oleh pemilik akun. Jangan kirim password, API token, atau kode OTP ke chat/repository.

## 2. Instal dan coba lokal

Gunakan Node.js 24 LTS dan terminal di root repository portofolio:

```sh
npm ci
cp wrangler.example.jsonc wrangler.local.jsonc
npm run build
npm run db:local
npm run dev
```

Buka URL localhost yang dicetak Wrangler. Placeholder database ID hanya untuk lokal; tidak dapat dipakai untuk deployment remote. Data lokal ada di `.wrangler/standalone` dan tidak masuk Git.

Default `PUBLIC_DEMO=true` menampilkan **data contoh sintetis**, bukan database asli. Tanpa secret, login admin belum aktif dan perubahan data ditolak. Untuk lokal, buat `.dev.vars` berisi password uji minimal 16 karakter dan secret sesi acak minimal 32 karakter:

```dotenv
ADMIN_PASSWORD="replace-with-a-long-local-test-password"
SESSION_SECRET="replace-with-a-random-at-least-32-character-secret"
```

Nilai di atas placeholder; buat nilai sendiri. `.dev.vars` sudah di-ignore Git. Login dibatasi 10 percobaan per IP per jendela 15 menit; gunakan password panjang yang unik. Auth admin memakai satu akun pemilik, bukan sistem login multiuser.

## 3. Hubungkan Cloudflare dan buat D1

```sh
npx wrangler login
npx wrangler whoami
npx wrangler d1 create ticket-portal-db
```

Pilih akun Cloudflare yang benar. Salin UUID database dari hasil perintah ke `d1_databases[0].database_id` dalam `wrangler.local.jsonc`. Sesuaikan `database_name` dan `name` Worker jika nama sudah dipakai. Config ini tidak di-commit.

Tetap gunakan Workers **Free**, jangan upgrade ke Workers Paid. Tidak ada domain berbayar, paket Pro, atau layanan berbayar yang dibutuhkan untuk konfigurasi dasar.

## 4. Terapkan migrasi dan secret

```sh
npm run db:remote
npx wrangler secret put ADMIN_PASSWORD --config wrangler.local.jsonc
npx wrangler secret put SESSION_SECRET --config wrangler.local.jsonc
```

Wrangler meminta nilai secret lewat prompt; jangan masukkan ke argumen shell, file source, atau GitHub. Password minimal 16 karakter; SESSION_SECRET minimal 32 karakter dan harus acak. Secret put dapat membuat draft Worker sebelum deployment pertama. Jika Wrangler meminta konfirmasi, periksa akun dan resource yang dituju.

## 5. Deploy

```sh
npm test
npm run typecheck
npm run deploy
```

Buka URL HTTPS `workers.dev` dari hasil deployment di Chrome. Demo publik hanya memperlihatkan data sintetis. Klik **Login admin** untuk melihat dan mengelola database asli. API dan file asli selalu memerlukan sesi admin.

Untuk portal yang seluruh datanya privat, ubah `PUBLIC_DEMO` menjadi `"false"` dan deploy ulang; halaman login tetap dapat dibuka tanpa akun ChatGPT.

## 6. R2 opsional: lampiran

R2 bukan syarat untuk membuat tiket atau menjalankan SLA. Untuk mengaktifkan upload:

1. Aktifkan R2 di Dashboard dan periksa checkout serta ketentuan billing sendiri. R2 memiliki kuota gratis, tetapi pemakaian di atasnya berbayar.
2. Buat bucket:

```sh
npx wrangler r2 bucket create ticket-portal-files
```

3. Tambahkan ke `wrangler.local.jsonc`:

```json
"r2_buckets": [{ "binding": "BUCKET", "bucket_name": "ticket-portal-files" }]
```

4. Deploy ulang. Form upload otomatis aktif ketika binding tersedia. Bucket tidak perlu dibuka publik.

## Kuota dan biaya

Diperiksa 29 Oktober 2026:

- Workers Free: 100.000 request Worker/hari; CPU 10 ms/request. Aset statis dilayani terpisah; frontend tidak di-render di Worker.
- D1 Free: 5 GB total akun, 5 juta baris dibaca/hari, 100.000 baris ditulis/hari. Free memiliki batas ukuran per database; cek Limits sebelum memindahkan dataset besar.
- R2 Standard opsional: 10 GB-month, 1 juta operasi A dan 10 juta operasi B/bulan. Ada biaya jika melewati kuota.

Rp0 berlaku selama memakai paket gratis dan pemakaian dalam kuota. Konfigurasi ini tidak berlangganan Workers Paid atau mengaktifkan R2 otomatis. Jangan menganggap budget alert sebagai hard spending cap untuk R2. Jangan aktifkan R2 jika ingin menghindari layanan dengan kemungkinan biaya overage.

App polling data setiap 15 detik per browser aktif. GET saat ini membaca seluruh tiket dan event; untuk dataset besar perlu pagination/query server-side, bukan mengandalkan kuota gratis tanpa batas. Free tier tidak menjamin uptime/SLA infrastruktur dan belum ada pengukuran CPU produksi pada akunmu.

## Verifikasi setelah deploy

- Di incognito, demo hanya berisi data fiktif dan update ditolak.
- Login admin, buat tiket, ubah status sampai CANCEL, dan buka kembali; pastikan riwayat serta akumulasi SLA benar.
- Refresh halaman dan periksa data masih tersimpan.
- Logout; file dan tiket asli tidak dapat diakses anonim.
- Jika R2 aktif, uji satu upload/download kecil. Pantau D1, Worker, dan R2 usage di Dashboard.

## Referensi resmi

- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/workers/wrangler/commands/d1/
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/r2/get-started/
