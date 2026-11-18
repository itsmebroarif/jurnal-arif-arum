# 📖 Diary Arif & Arum 💕

> **“Setiap pertemuan, tercatat selamanya.”**

Jurnal romantis **Arif & Arum** — foto kenangan, surat cinta, doa, dan buku tamu. Mobile-first, aksen pink × biru (tone The Amazing Digital Circus), font retro gemas (Shrikhand + Gochi Hand + Quicksand + Press Start 2P), dibangun dengan **Bootstrap 5** dan **SweetAlert2**.

💞 **Bersama sejak 19 September 2026.**

## ✨ Fitur

- 🎬 **Splash screen — glitch studio intro** (ala The Amazing Digital Circus): teks “DIARY ARIF & ARUM <3” dengan efek GILITCH/RGB-split, CRT scanlines, flicker, tombol **▶ PRESS START**
- 💿 **OST "Your New Home (Finale Ver.)"** — AVIAND & Watchme iD · EP 9 OST — diputar sebagai **vinyl 16-bit gemas yang berputar**, dengan siluet anime gemas Arif & Arum berpelukan (SVG digambar manual: Arum hijab rim-light pink × Arif rambut acak rim-light cyan, bintang pixel & pixel heart), label “16-BIT GEMAS EDITION”, equalizer pixel + tombol PLAY/PAUSE chunky
- 📸 **Galeri Momen** — polaroid aesthetic, filter (Kencan / Video Call / Malam Berdua), lightbox, 💖, dan **tambah momen baru** (upload foto dari HP — otomatis dikompresi — atau tempel link)
- 💌 **Surat Cinta** — pujian untuk Arum 🌹, semangat untuk Arif 🔥, penguat hubungan 💗 + *random quote machine* ✨
- 📖 **Catatan Harian** — scrapbook dengan garis kertas & margin merah ala buku tulis
- 🤲 **Doa Untuk Kita Berdua** — kesehatan, cinta abadi, sakinah mawaddah, dipertemukan di Surga
- 💬 **Buku Tamu / Komentar** — SweetAlert2 + backend PHP (`api/comments.php` → `data/comments.json`), **fallback otomatis ke localStorage** saat API tidak tersedia (termasuk di Vercel)
- 🐻 **Floating icons gemes** (beruang, hati, bintang, bunga) + tombol pelukan virtual 🤗
- 💌 **“Kirim Diary Ini ke Arum”** — tombol share: membuka WhatsApp (wa.me / Web Share API) dengan teks otomatis; tinggal pilih Arum & kirim
- ⏳ **Penghitung hari bersama** — default **19 Sep 2026**, bisa diubah lewat tombol ✏️

## 🚀 Push ke GitHub

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/itsmebroarif/jurnal-arif-arum.git
git push -u origin main
```

> ⚠️ `data/ost.mp3` sengaja **tidak di-push** (hak cipta). Website tetap 100% jalan tanpanya — tombol OST akan menawarkan membuka YouTube sebagai gantinya.

## ▲ Deploy ke Vercel

Website ini **static** — tanpa build step, langsung jalan.

**Cara termudah (via GitHub):**
1. Push ke GitHub dulu (lihat di atas).
2. Buka https://vercel.com → **Add New → Project** → import repo `itsmebroarif/jurnal-arif-arum`.
3. Framework Preset: **Other** (kosongkan Build Command & Output Directory). Klik **Deploy**. Selesai — URL `https://jurnal-arif-arum.vercel.app` (atau nama unikmu).

**Atau via CLI:**
```bash
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

`vercel.json` sudah disiapkan (cleanUrls + header keamanan).

> 📌 **Catatan komentar di Vercel:** Vercel tidak menjalankan PHP di static hosting, jadi `api/comments.php` tidak aktif — komentar otomatis tersimpan di **localStorage browser** (tetap berfungsi penuh). Untuk komentar persisten lintas-perangkat, upgrade opsional: [Vercel KV](https://vercel.com/docs/storage/vercel-kv) atau [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) — beri tahu saya kalau mau di-wire.

## 🎵 Tentang OST & `ost.mp3`

`Your New Home (Finale Ver.)` bukan konten bebas lisensi, jadi file `ost.mp3` **tidak di-commit ke repo publik maupun di-deploy**. Untuk mendengar OST di perangkatmu: pastikan `data/ost.mp3` ada (lokal di Laragon) — tombol ▶ PLAY di kartu 16-bit akan memutarnya. Tanpa file itu, tombol PLAY menawarkan membuka OST-nya di YouTube.

## 💌 Mengirim ke Arum

Tombol hijau **“💌 Kirim Diary Ini ke Arum”** di footer:
- Di **HP** (Android/iPhone): membuka sheet **WhatsApp** dengan teks & link otomatis terisi — pilih Arum → Kirim. (Kalau tersedia *Web Share API*, dipakai dulu — sama hasilnya.)
- Bot/otomasi pengiriman pesan **tidak** dilakukan — kamu yang menekan tombol kirim dari akunmu sendiri, seperti seharusnya.

## 📁 Struktur

```
jurnal_arif_arum/
├── index.html          # Splash glitch → hero → OST 16-bit → galeri → surat → diary → doa → buku tamu → share WA
├── css/style.css       # Design system cute-retro pink × biru + tema TADC (splash glitch & kartu 16-bit)
├── js/app.js           # Galeri, lightbox, diary, komentar, OST player, share WA, floating icons
├── api/comments.php    # Backend komentar (PHP, untuk Laragon/hosting PHP)
├── data/comments.json  # Penyimpanan komentar (Laragon)
├── data/ost.mp3        # (TIDAK di-push — hak cipta) OST lokal
├── vercel.json         # Konfigurasi deploy Vercel
└── img/                # Foto & video kenangan
```

## 🛠️ Teknologi

Bootstrap 5.3 · SweetAlert2 · Google Fonts (Shrikhand, Gochi Hand, Quicksand, Press Start 2P) · Vanilla JS · PHP (opsional)

---

*Dibuat dengan cinta, kopi, dan doa — oleh Arif, untuk Arum. Sampai akhir hayat, dan semoga sampai Surga. 🕌✨*
