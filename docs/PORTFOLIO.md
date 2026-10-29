# Menyiapkan portofolio GitHub

Repository ini adalah full-stack ticketing portal: React/TypeScript, Cloudflare Workers, D1, R2 opsional. Fokus engineering: akumulasi SLA lintas status, transaksi perubahan status, optimistic concurrency, audit trail, dan pemisahan demo sintetis dari data admin.

## Upload pertama

Setelah membuat akun GitHub, buat repository kosong bernama `digital-ticket-portal`. Jika ingin portofolio publik, pastikan seluruh file yang di-stage hanya source dan data sintetis.

```sh
git init -b main
git add .
git diff --cached --stat
git diff --cached
# Periksa tidak ada .dev.vars, wrangler.local.jsonc, migration-data, token atau data klien.
git commit -m "Build ticket portal with status-based SLA and Cloudflare deployment"
git remote add origin https://github.com/USERNAME/digital-ticket-portal.git
git push -u origin main
```

Ganti USERNAME dengan username GitHub sendiri. Login melalui alur resmi GitHub; jangan menaruh token di URL remote. CI GitHub Actions menjalankan unit tests, TypeScript dan frontend build. CI tidak deploy dan tidak membutuhkan secret Cloudflare.

## Deskripsi repo

> Full-stack ticketing portal with a four-status workboard, cumulative SLA tracking, atomic status transitions, audit history, and optional file uploads. Built with React, TypeScript, Cloudflare Workers, D1, and R2.

Topics: `react`, `typescript`, `cloudflare-workers`, `cloudflare-d1`, `ticketing-system`, `sla`, `portfolio`.

## Materi yang layak ditampilkan

- Screenshot dashboard, workboard empat status, dan detail riwayat memakai data sintetis.
- Link demo `workers.dev` setelah deployment berhasil.
- Jelaskan bahwa penghitungan SLA menggunakan timestamp server dan tetap benar setelah browser ditutup.
- Jelaskan transaksi DB dan version check untuk menghindari dua update menimpa satu sama lain.
- Sebutkan batasan secara jujur: admin tunggal, perhitungan 24/7, belum ada email/assignment, belum pagination, dan belum ada pengujian kapasitas produksi.

## Lisensi

Source aplikasi tersedia dengan MIT License. Dependency mengikuti lisensinya masing-masing. Screenshot/data referensi bukan otomatis milik proyek; gunakan screenshot UI hasil proyek dan contoh data sendiri untuk portofolio.
