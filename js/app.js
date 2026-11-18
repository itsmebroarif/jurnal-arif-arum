/* ============================================================
   JURNAL ARIF & ARUM — app.js
   ============================================================ */
'use strict';

/* ---------- helpers ---------- */
const $  = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => [...(c || document).querySelectorAll(s)];
const LS = {
  get(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set(k, v)  { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.warn('localStorage penuh?', e); } }
};
const escapeHTML = (s) => String(s).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- custom cursor: klik = 💞 ---------- */
window.addEventListener('mousedown', () => document.body.classList.add('cursor-down'));
window.addEventListener('mouseup', () => document.body.classList.remove('cursor-down'));
window.addEventListener('blur', () => document.body.classList.remove('cursor-down'));

function heartBurst(x, y, n = 7) {
  if (reducedMotion) return;
  const hearts = ['💕', '💗', '💖', '💞', '✨'];
  for (let i = 0; i < n; i++) {
    const h = document.createElement('span');
    h.className = 'heart-burst';
    h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    h.style.left = (x + (Math.random() - 0.5) * 70) + 'px';
    h.style.top  = (y + (Math.random() - 0.5) * 30) + 'px';
    h.style.animationDelay = (Math.random() * 0.25) + 's';
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1200);
  }
}

const swalCute = (opts) => Swal.fire(Object.assign({
  customClass: { popup: 'swal-cute', title: 'swal-cute-title', confirmButton: 'swal-cute-confirm', cancelButton: 'swal-cute-cancel' },
  buttonsStyling: false
}, opts));

/* ============================================================
   1) SPLASH SCREEN + OST PLAYER (local ost.mp3)
   ============================================================ */
const splash = $('#splash');
const ostAudio = $('#ostAudio');
let ostPlaying = false;

function setOstState(playing) {
  ostPlaying = playing;
  const vinyl = $('#vinyl');
  if (vinyl) vinyl.classList.toggle('playing', playing);
  $('#equalizer').classList.toggle('on', playing);
  const btn = $('#btnToggleOst');
  if (btn) btn.textContent = playing ? '❚❚ PAUSE' : '▶ PLAY';
  $('#fabMusic').textContent = playing ? '⏸️' : '🎵';
}
function toggleOst() {
  if (!ostAudio) return;
  if (ostAudio.paused) {
    ostAudio.play().catch(() => {
      swalCute({
        icon: 'info',
        title: 'OST-nya belum bunyi 🎧',
        html: 'File <code>data/ost.mp3</code> tidak ditemukan di server (memang <b>tidak ikut di-deploy</b>).<br/>Mau dengarkan di YouTube saja?',
        showCancelButton: true,
        confirmButtonText: 'Buka di YouTube ↗',
        cancelButtonText: 'Nanti dulu'
      }).then(({ isConfirmed }) => { if (isConfirmed) window.open('https://www.youtube.com/watch?v=sntdWiWv8ZI', '_blank', 'noopener'); });
    });
  } else {
    ostAudio.pause();
  }
}
if (ostAudio) {
  ostAudio.addEventListener('play', () => setOstState(true));
  ostAudio.addEventListener('pause', () => setOstState(false));
  ostAudio.addEventListener('error', () => setOstState(false), true);
}

$('#btnEnter').addEventListener('click', (e) => {
  splash.classList.add('hide');
  document.body.style.overflow = 'auto';
  if (ostAudio) ostAudio.play().catch(() => { /* browser menahan autoplay — user bisa pencet ▶ PLAY */ });
  heartBurst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, 14);
});
document.body.style.overflow = 'hidden'; // lock scroll while splash is up

$('#btnToggleOst').addEventListener('click', toggleOst);
$('#fabMusic').addEventListener('click', toggleOst);

/* klik vinyl juga play/pause */
const vinylEl = $('#vinyl');
if (vinylEl) vinylEl.addEventListener('click', toggleOst);

/* ============================================================
   2) GALLERY — data, render, filter, lightbox
   ============================================================ */
const SEED_MOMENTS = [
  { id: 'm-date-02', img: 'img/date-02.jpeg', title: 'Arum senyum lebar di restoran', date: '2026-11-18', cat: 'kencan', tag: 'Kencan', story: 'Senyum kamu itu… obat paling manjur. Makasih udah nemenin makan malam ini, cantik. 💕', likes: 18, tilt: '-1.6deg' },
  { id: 'm-night-01', img: 'img/night-01.jpeg', title: 'Jalan malam berdua', date: '2026-11-18', cat: 'malem', tag: 'Malam Berdua', story: 'Dengan kamu, jalanan biasa pun jadi tempat paling istimewa. 🌙', likes: 15, tilt: '1.8deg' },
  { id: 'm-date-01', img: 'img/date-01.jpeg', title: 'Makan berdua di restorannya', date: '2026-11-18', cat: 'kencan', tag: 'Kencan', story: 'Demen banget liat kamu ngobrol sambil makan — cantiknya gak ada yang ngalahin. 🥰', likes: 14, tilt: '-2.2deg' },
  { id: 'm-call-01', img: 'img/call-01.jpeg', title: 'Video call manis kita', date: '2026-11-18', cat: 'call', tag: 'Video Call', story: 'Walaupun beda layar, hati kita sebelahan. Bangga banget sama kamu.', likes: 12, tilt: '1.4deg' },
  { id: 'm-date-03', img: 'img/date-03.jpeg', title: 'Serenade restoran kita', date: '2026-11-18', cat: 'kencan', tag: 'Kencan', story: 'Duduk berdua, ketawa kecil — tanpa banyak kata, udah cukup. 💞', likes: 13, tilt: '-1.2deg' },
  { id: 'm-call-02', img: 'img/call-02.jpeg', title: 'Arum cemberut lucu 😤', date: '2026-11-18', cat: 'call', tag: 'Video Call', story: 'Mukanya serius tapi gemesin — 10/10, would video call again. 🥺👉👈', likes: 20, tilt: '2.1deg' },
  { id: 'm-night-02', img: 'img/night-02.jpeg', title: 'Peace ✌️ di pinggir jalan', date: '2026-11-18', cat: 'malem', tag: 'Malam Berdua', story: 'Pose favoritku. Kamu selalu bisa bikin aku ketawa lepas. 🤭', likes: 17, tilt: '-1.8deg' },
  { id: 'm-date-04', img: 'img/date-04.jpeg', title: 'Arif lagi salting', date: '2026-11-18', cat: 'kencan', tag: 'Kencan', story: 'Nervous boy in love — tapi di samping kamu, aku merasa paling aman. 🫶', likes: 16, tilt: '1.6deg' },
  { id: 'm-call-03', img: 'img/call-03.jpeg', title: 'Tatapan dari layar', date: '2026-11-18', cat: 'call', tag: 'Video Call', story: 'Mata kamu adalah bintangnya aplikasi video call. ✨', likes: 11, tilt: '-1.5deg' }
];

const likedIds = LS.get('aa_likes', []);
const customMoments = LS.get('aa_moments', []);
let activeFilter = 'all';

function fmtDateID(iso) {
  try {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

function momentCard(m) {
  const liked = likedIds.includes(m.id);
  const likeCount = (m.likes || 8) + (liked ? 1 : 0);
  const safe = { title: escapeHTML(m.title), story: escapeHTML(m.story), tag: escapeHTML(m.tag), img: escapeHTML(m.img), cat: escapeHTML(m.cat), id: escapeHTML(m.id) };
  return `
  <div class="col-6 col-md-4 gallery-item" data-cat="${safe.cat}" data-id="${safe.id}">
        <figure class="polaroid-card" style="--tilt:${escapeHTML(m.tilt || '-1.5deg')}" data-full="${safe.img}" data-caption="${safe.title} — ${escapeHTML(fmtDateID(m.date))}" tabindex="0" role="button" aria-label="Perbesar foto: ${safe.title}">
      <span class="polaroid-date">${escapeHTML(fmtDateID(m.date))}</span>
      <div class="photo-frame"><img src="${safe.img}" alt="${safe.title}" loading="lazy" onerror="this.onerror=null;this.src='img/night-01.jpeg'" /></div>
      <figcaption class="polaroid-caption">${safe.title}</figcaption>
      <div class="polaroid-actions">
        <span class="tag-mini">${safe.tag}</span>
        <button class="like-btn ${liked ? 'liked' : ''}" data-like="${safe.id}" aria-pressed="${liked}" aria-label="Sukai foto ini">${liked ? '💖' : '🤍'} ${likeCount}</button>
      </div>
    </figure>
  </div>`;
}

function renderGallery() {
  const grid = $('#galleryGrid');
  const all = [...customMoments, ...SEED_MOMENTS];
  const visible = all.filter(m => activeFilter === 'all' || m.cat === activeFilter);
  grid.innerHTML = visible.map(momentCard).join('') + `
    <div class="col-6 col-md-4">
      <button class="add-moment-card w-100 h-100" id="btnAddMoment" data-bs-toggle="modal" data-bs-target="#modalTambahMomen" aria-label="Tambah momen baru">
        <span style="font-size:2.6rem">📸</span>
        <span style="font-family:var(--font-display);color:var(--pink-deep)">Tambah Momen Baru</span>
        <span style="font-size:.78rem;color:var(--ink-soft);font-weight:600">Setiap pertemuan kita layak diabadikan ✨</span>
      </button>
    </div>`;
  $('#statMoments').textContent = all.length + 1; // +1 video
}

$('#galleryGrid').addEventListener('click', (e) => {
  const likeBtn = e.target.closest('[data-like]');
  if (likeBtn) {
    e.stopPropagation();
    const id = likeBtn.dataset.like;
    const i = likedIds.indexOf(id);
    if (i > -1) likedIds.splice(i, 1); else likedIds.push(id);
    LS.set('aa_likes', likedIds);
    const m = [...customMoments, ...SEED_MOMENTS].find(x => x.id === id);
    const liked = likedIds.includes(id);
    likeBtn.classList.toggle('liked', liked);
    likeBtn.setAttribute('aria-pressed', liked);
    likeBtn.innerHTML = `${liked ? '💖' : '🤍'} ${(m?.likes || 8) + (liked ? 1 : 0)}`;
    if (liked) heartBurst(e.clientX, e.clientY, 6);
    return;
  }
  const card = e.target.closest('.polaroid-card');
  if (card) openLightbox(card);
});
$('#galleryGrid').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    const card = e.target.closest('.polaroid-card');
    if (card) { e.preventDefault(); openLightbox(card); }
  }
});
$$('.filter-chip').forEach(chip => chip.addEventListener('click', () => {
  activeFilter = chip.dataset.filter;
  $$('.filter-chip').forEach(c => c.classList.toggle('active', c === chip));
  renderGallery();
}));

/* ---------- lightbox ---------- */
const lightbox = $('#lightbox');
let lbItems = [];
let lbIndex = 0;

function openLightbox(card) {
  lbItems = $$('.polaroid-card', $('#galleryGrid'));
  lbIndex = Math.max(0, lbItems.indexOf(card));
  showLightboxAt(lbIndex);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function showLightboxAt(i) {
  const item = lbItems[i];
  if (!item) return;
  $('#lbImg').src = item.dataset.full;
  $('#lbImg').alt = item.dataset.caption || '';
  $('#lbCaption').textContent = item.dataset.caption || '';
}
function closeLightbox() { lightbox.classList.remove('open'); document.body.style.overflow = 'auto'; }
$('#lbClose').addEventListener('click', closeLightbox);
$('#lbPrev').addEventListener('click', () => { lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length; showLightboxAt(lbIndex); });
$('#lbNext').addEventListener('click', () => { lbIndex = (lbIndex + 1) % lbItems.length; showLightboxAt(lbIndex); });
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') $('#lbPrev').click();
  if (e.key === 'ArrowRight') $('#lbNext').click();
});

/* ---------- tambah momen (upload / url) ---------- */
let pendingMomentImg = null;
const fileInput = $('#momentFile');
const urlInput  = $('#momentUrl');
const preview   = $('#momentPreview');

function compressImage(file, maxSide = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };
    reader.onerror = reject;
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}
fileInput.addEventListener('change', async () => {
  const f = fileInput.files && fileInput.files[0];
  if (!f) return;
  if (!f.type.startsWith('image/')) { swalCute({ icon: 'warning', title: 'Bukan gambar 🙈', text: 'Pilih file foto ya…' }); return; }
  try {
    pendingMomentImg = await compressImage(f);
    preview.src = pendingMomentImg;
    preview.classList.remove('d-none');
    urlInput.value = '';
  } catch {
    swalCute({ icon: 'error', title: 'Gagal membaca foto', text: 'Coba foto lain ya.' });
  }
});
urlInput.addEventListener('input', () => {
  if (urlInput.value.trim()) { pendingMomentImg = null; fileInput.value = ''; preview.src = urlInput.value.trim(); preview.classList.remove('d-none'); }
  else preview.classList.add('d-none');
});

$('#btnSaveMoment').addEventListener('click', () => {
  const title = $('#momentTitle').value.trim();
  if (title.length < 3) { swalCute({ icon: 'warning', title: 'Judulnya kurang…', text: 'Tulis judul minimal 3 huruf ya 🥺' }); return; }
  const img = pendingMomentImg || urlInput.value.trim();
  if (!img) { swalCute({ icon: 'warning', title: 'Fotonya mana?', text: 'Upload foto atau tempel link foto dulu ya 📸' }); return; }
  if (img.length > 1_900_000) { swalCute({ icon: 'warning', title: 'Fotonya kegedean 😅', text: 'Kompresi otomatis belum cukup — coba foto ukuran lebih kecil.' }); return; }

  const moment = {
    id: 'u-' + Date.now(),
    img,
    title,
    date: $('#momentDate').value || new Date().toISOString().slice(0, 10),
    cat: $('#momentCat').value,
    tag: { kencan: 'Kencan', call: 'Video Call', malem: 'Malam Berdua' }[$('#momentCat').value] || 'Momen',
    story: $('#momentStory').value.trim() || 'Momen manis yang tidak bisa diungkapkan dengan kata-kata. 💕',
    likes: 0,
    tilt: (Math.random() * 4 - 2).toFixed(1) + 'deg'
  };
  customMoments.unshift(moment);
  LS.set('aa_moments', customMoments);
  renderGallery();

  // reset form & tutup modal
  ['#momentTitle', '#momentStory', '#momentUrl'].forEach(s => $(s).value = '');
  $('#momentDate').valueAsDate = new Date();
  fileInput.value = ''; pendingMomentImg = null; preview.classList.add('d-none');
  const modalEl = $('#modalTambahMomen');
  bootstrap.Modal.getOrCreateInstance(modalEl).hide();

  swalCute({ icon: 'success', title: 'Momen tersimpan! 💖', text: 'Keabadian dimulai hari ini.', timer: 2000, showConfirmButton: false });
});
$('#momentDate').valueAsDate = new Date();
$('#diaryDate').valueAsDate = new Date();

/* ============================================================
   3) COUNTERS — hari bersama
   ============================================================ */
const DEFAULT_ANNIVERSARY = '2026-09-19'; // Bersama sejak 19 September 2026 💞
const getAnniversary = () => LS.get('aa_anniversary', DEFAULT_ANNIVERSARY);

function renderAnniversary() {
  const iso = getAnniversary();
  const start = new Date(iso + 'T00:00:00');
  const now = new Date();
  const days = Math.max(0, Math.floor((now - start) / 86_400_000));
  $('#statDays').textContent = days;
  $('#anniversaryLabel').textContent = fmtDateID(iso);
}
$('#btnEditDate').addEventListener('click', async () => {
  const { value } = await swalCute({
    title: 'Hari Jadi Kita 💑',
    input: 'date',
    inputValue: getAnniversary(),
    showCancelButton: true,
    confirmButtonText: 'Simpan 💖',
    cancelButtonText: 'Batal',
    inputValidator: (v) => v ? null : 'Pilih tanggalnya dulu ya 🥺'
  });
  if (value) { LS.set('aa_anniversary', value); renderAnniversary(); }
});

/* ============================================================
   4) RANDOM QUOTE MACHINE
   ============================================================ */
const QUOTES = [
  'Cinta yang lahir dari doa tidak butuh bukti — ia sudah jelas tujuannya: Allah di antara kita.',
  'Arum, kamu bukan pelarian; kamu adalah tujuan yang selalu ingin aku tuju setiap hari.',
  'Semangatmu hari ini, Arif, adalah investasi cinta kita hari esok.',
  'Kamu itu rumah; dan pulang selalu terasa seperti jawaban dari doa yang lama.',
  'Tidak ada hal seindah melihat kamu tersenyum — bahkan matahari pun iri.',
  'Aku bersyukur tiap detik, karena Allah menitipkan kamu padaku.',
  'Arif, kerja kerasmu tidak pernah diam-diam — Arum selalu melihatnya, dan selalu bangga.',
  'Cinta bukan soal sempurna, tapi soal tetap memilih meski tahu kekurangannya. Aku memilih kamu.',
  'Sehat selalu ya, sayang. Tawamu itu doa yang terkabul.',
  'Dalam setiap sujudku, namamu selalu ikut kusebut, Arum.',
  'Satu hal yang tidak berubah seumur hidupku: aku cinta kamu.',
  'Kamu bukan sekadar pasangan — kamu partner ibadah, partner mimpi, partner surga.',
  'Hari-hari berat terasa ringan karena ada tangan kamu yang menggenggam.',
  'Aku tidak takut masa depan, selama kita jalaninya berdua.',
  'Arum, kamu bukti bahwa doa yang tulus selalu menemukan jalannya.',
  'Arif, jangan pernah berhenti jadi laki-laki yang membanggakan — kamu sudah di jalur yang benar.',
  'Kalau cinta adalah lautan, aku rela berenang selamanya asalkan sampai padamu.',
  'Kita bukan manusia sempurna; kita dua hati yang belajar mencintai dengan benar.',
  'Rumah tangga impian kita dimulai dari hal-hal kecil yang kita jaga hari ini.',
  'Semoga setiap perjalanan kita disaksikan Allah.',
  'Kamu adalah bacaan favoritku yang tidak pernah aku tamatkan.',
  'Yang kuinginkan cuma satu: sehat, dan terus mencintaimu sampai akhir hayat.',
  'Arum, senyummu lebih manis daripada hari Minggu pagi tanpa alarm.',
  'Cinta sejati itu bukan menggebu di awal — ia setia di akhir. Dan aku mau sampai akhir itu.'
];
let quoteIndex = Math.floor(Math.random() * QUOTES.length);
$('#btnRandomQuote').addEventListener('click', (e) => {
  const machine = $('#quoteMachine');
  machine.classList.add('fade');
  setTimeout(() => {
    quoteIndex = (quoteIndex + 1 + Math.floor(Math.random() * (QUOTES.length - 1))) % QUOTES.length;
    $('#quoteText').textContent = QUOTES[quoteIndex];
    machine.classList.remove('fade');
  }, 280);
  heartBurst(e.clientX, e.clientY, 5);
});

/* ============================================================
   5) CATATAN HARIAN (diary)
   ============================================================ */
const SEED_DIARY = [
  { date: '2026-11-18', author: 'Arum', text: 'Aku tau Arif nervous banget tadi di restoran. Tapi justru di situ aku ngerasa paling dicintai. Jalan malam setelahnya, selfie di pinggir jalan sambil peace ✌ — aku berharap hari ini gak pernah selesai. Bismillah, semoga jalan kita selalu diridhoi. Aamiin.' },
  { date: '2026-11-18', author: 'Arif', text: 'Hari ini aku dan Arum makan malam berdua di restorannya. Hijab hitam, senyum yang bikin aku salah tingkah terus. Aku gak banyak ngomong, tapi semoga hatinya bisa baca dari mataku: “kamu cantik banget.”' },
  { date: '2026-11-18', author: 'Berdua', text: 'Momen pertama yang tercatat di jurnal ini: makan malam berdua, video call absurd, jalan malam penuh tawa — tanpa rekayasa. Ya Allah, terima kasih atas pertemuan ini. Jagalah kami, satukan kami sampai akhir hayat, dan pertemukan kami kembali di Surga. 🤍' }
];
const customDiary = LS.get('aa_diary', []);

function renderDiary() {
  const box = $('#diaryEntries');
  const all = [...customDiary, ...SEED_DIARY].sort((a, b) => b.date.localeCompare(a.date));
  box.innerHTML = all.map(e => `
    <article class="diary-entry">
      <span class="diary-date">${escapeHTML(fmtDateID(e.date))}</span>
      <span class="diary-author">${escapeHTML(e.author)}</span><br/>
      ${escapeHTML(e.text)}
    </article>`).join('');
}
$('#diaryText').addEventListener('input', () => { $('#diaryCharCount').textContent = $('#diaryText').value.length; });
$('#btnAddDiary').addEventListener('click', () => {
  const text = $('#diaryText').value.trim();
  if (text.length < 5) { swalCute({ icon: 'warning', title: 'Kurang panjang nih…', text: 'Tulis minimal 5 huruf ya, sayang 🥺' }); return; }
  customDiary.unshift({ date: $('#diaryDate').value || new Date().toISOString().slice(0, 10), author: $('#diaryAuthor').value, text });
  LS.set('aa_diary', customDiary);
  $('#diaryText').value = ''; $('#diaryCharCount').textContent = '0';
  renderDiary();
  swalCute({ icon: 'success', title: 'Tercatat! 📖', text: 'Setiap kata darimu adalah sejarah cinta kita.', timer: 1900, showConfirmButton: false });
});

/* ============================================================
   6) KOMENTAR / BUKU TAMU — PHP backend + fallback localStorage
   ============================================================ */
const API = 'api/comments.php';
const AVATAR_COLORS = ['#f25f97', '#3f9ecd', '#c86dd7', '#4caf7d', '#f5a623', '#8e6cf0'];
const SEED_COMMENTS = [
  { id: 'seed-1', name: 'Arif', message: 'Untuk Arum: makasih sudah jadi rumah terhangat buat aku. Setiap hari sama kamu adalah alasan terbesar buat semangat. Aku sayang kamu, selalu. 💕', time: '2026-11-18T19:40:00+07:00', likes: 12 },
  { id: 'seed-2', name: 'Arum', message: 'Untuk Arif: kamu laki-laki paling hebat yang pernah Tuhan titipkan ke aku. Jangan pernah nyerah ya — aku selalu bangga sama kamu, di mana pun dan kapan pun. 🥰', time: '2026-11-18T20:05:00+07:00', likes: 9 }
];
let myCommentIds = LS.get('aa_my_comments', []);
let localComments = LS.get('aa_comments_local', [...SEED_COMMENTS]);
let backendDown = false;

const timeAgo = (iso) => {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  if (Number.isNaN(diff)) return '';
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'baru saja';
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  return `${d} hari lalu`;
};
const avatarColor = (name) => AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

function renderComments(list) {
  const box = $('#commentList');
  if (!list.length) { box.innerHTML = '<div class="comment-item"><div class="avatar-cute" style="background:var(--blue)">🕊️</div><div><div class="comment-text">Belum ada yang nulis… jadilah yang pertama! ✨</div></div></div>'; return; }
  box.innerHTML = list.map(c => `
    <div class="comment-item" data-id="${escapeHTML(c.id)}">
      <div class="avatar-cute" style="background:${avatarColor(c.name)}">${escapeHTML((c.name || '?').trim().charAt(0).toUpperCase())}</div>
      <div class="flex-grow-1">
        <div class="d-flex justify-content-between align-items-baseline gap-2">
          <span class="comment-name">${escapeHTML(c.name)}</span>
          <span class="comment-time">${escapeHTML(timeAgo(c.time))}</span>
        </div>
        <p class="comment-text">${escapeHTML(c.message)}</p>
        <div class="d-flex gap-2">
          <button class="comment-heart" data-like-comment="${escapeHTML(c.id)}">💖 ${Number(c.likes) || 0}</button>
          ${myCommentIds.includes(String(c.id)) ? `<button class="comment-del" data-del-comment="${escapeHTML(c.id)}">🗑️ hapus</button>` : ''}
        </div>
      </div>
    </div>`).join('');
}
async function fetchComments() {
  try {
    const res = await fetch(API, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('backend ' + res.status);
    const data = await res.json();
    backendDown = false;
    renderComments(data.comments || []);
  } catch (err) {
    backendDown = true;
    console.info('Mode lokal (PHP/API tidak tersedia):', err.message);
    renderComments([...localComments].sort((a, b) => String(b.time).localeCompare(String(a.time))));
  }
}
async function submitComment(name, message) {
  if (!backendDown) {
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ action: 'add', name, message }) });
      if (!res.ok) throw new Error('backend ' + res.status);
      const data = await res.json();
      if (data && data.comment) { myCommentIds.push(String(data.comment.id)); LS.set('aa_my_comments', myCommentIds); }
      await fetchComments();
      return true;
    } catch { backendDown = true; }
  }
  const c = { id: 'local-' + Date.now(), name, message, time: new Date().toISOString(), likes: 0 };
  localComments.unshift(c);
  LS.set('aa_comments_local', localComments);
  myCommentIds.push(String(c.id)); LS.set('aa_my_comments', myCommentIds);
  renderComments([...localComments].sort((a, b) => String(b.time).localeCompare(String(a.time))));
  return true;
}
$('#commentText').addEventListener('input', () => { $('#commentCharCount').textContent = $('#commentText').value.length; });
$$('.emoji-pick').forEach(btn => btn.addEventListener('click', () => {
  const ta = $('#commentText');
  const pos = ta.selectionStart ?? ta.value.length;
  ta.setRangeText(btn.dataset.emoji, pos, pos, 'end');
  ta.dispatchEvent(new Event('input'));
  ta.focus();
}));
$('#commentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $('#commentName').value.trim();
  const message = $('#commentText').value.trim();
  if (name.length < 2) { swalCute({ icon: 'warning', title: 'Nama siapa ini?', text: 'Isi namamu dulu minimal 2 huruf ya 😊' }); return; }
  if (message.length < 4) { swalCute({ icon: 'warning', title: 'Pesan kamu terlalu pendek…', text: 'Tulis minimal 4 huruf — dari hati, ya. 💌' }); return; }

  const btn = $('#btnSubmitComment');
  btn.disabled = true; btn.textContent = 'Mengirim… 💌';
  await submitComment(name, message);
  $('#commentText').value = ''; $('#commentCharCount').textContent = '0';
  btn.disabled = false; btn.textContent = 'Kirim Komentar 💌';
  swalCute({ icon: 'success', title: 'Terkirim! 💌', text: 'Makasih udah ikut menghangatkan diary kita.', timer: 2100, showConfirmButton: false });
  fetchComments();
});
$('#commentList').addEventListener('click', async (e) => {
  const likeBtn = e.target.closest('[data-like-comment]');
  if (likeBtn) {
    const id = likeBtn.dataset.likeComment;
    likeBtn.innerHTML = likeBtn.innerHTML.replace(/\d+/, n => Number(n) + 1);
    heartBurst(e.clientX, e.clientY, 5);
    if (!backendDown) fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'like', id }) }).catch(() => {});
    else { const c = localComments.find(x => String(x.id) === String(id)); if (c) { c.likes = (Number(c.likes) || 0) + 1; LS.set('aa_comments_local', localComments); } }
    return;
  }
  const delBtn = e.target.closest('[data-del-comment]');
  if (delBtn) {
    const id = delBtn.dataset.delComment;
    const { isConfirmed } = await swalCute({ icon: 'question', title: 'Hapus komentar?', text: 'Sekali dihapus, hilang selamanya… seperti cinta kita? (enggak lah 😄)', showCancelButton: true, confirmButtonText: 'Hapus', cancelButtonText: 'Biarkan' });
    if (!isConfirmed) return;
    if (!backendDown) {
      try { await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) }); } catch { backendDown = true; }
    }
    localComments = localComments.filter(c => String(c.id) !== String(id));
    LS.set('aa_comments_local', localComments);
    myCommentIds = myCommentIds.filter(x => String(x) !== String(id)); LS.set('aa_my_comments', myCommentIds);
    fetchComments();
    swalCute({ icon: 'success', title: 'Terhapus 🗑️', timer: 1500, showConfirmButton: false });
  }
});

/* ============================================================
   7) SHARE DIARY KE ARUM (WhatsApp)
   ============================================================ */
$('#btnShareWa').addEventListener('click', async (e) => {
  const url = window.location.href;
  const text = `Hai Arum 💕 Aku baru aja bikin diary buat kita — foto-foto kita, surat cintaku, doa, dan lagu "Our New World". Lihat ya, cantik… 🌙`;
  heartBurst(e.clientX, e.clientY, 8);
  if (navigator.share) {
    try { await navigator.share({ title: 'Diary Arif & Arum 💕', text, url }); return; }
    catch { /* dibatalkan user — lanjut ke wa.me */ }
  }
  window.open('https://wa.me/?text=' + encodeURIComponent(`${text}\n${url}`), '_blank', 'noopener');
});

/* ============================================================
   8) FLOATING ICONS & FAB
   ============================================================ */
const FLOAT_EMOJIS = ['⭐', '💗', '🌸', '✨', '🍓', '💛', '🍒', '🌟', '🌼', '🍀'];
(function spawnFloats() {
  if (reducedMotion) return;
  const layer = $('#floatLayer');
  for (let i = 0; i < 12; i++) {
    const s = document.createElement('span');
    s.className = 'float-emoji';
    s.textContent = FLOAT_EMOJIS[i % FLOAT_EMOJIS.length];
    s.style.setProperty('--size', (1.2 + Math.random() * 1.2).toFixed(2) + 'rem');
    s.style.setProperty('--dur', (11 + Math.random() * 12).toFixed(1) + 's');
    s.style.setProperty('--delay', (-Math.random() * 14).toFixed(1) + 's');
    s.style.left = (Math.random() * 96) + 'vw';
    layer.appendChild(s);
  }
  for (let i = 0; i < 4; i++) {
    const p = document.createElement('span');
    p.className = 'float-pokeball';
    p.style.setProperty('--dur', (15 + Math.random() * 10).toFixed(1) + 's');
    p.style.setProperty('--delay', (-Math.random() * 16).toFixed(1) + 's');
    p.style.left = (8 + Math.random() * 84) + 'vw';
    layer.appendChild(p);
  }
})();
$('#fabTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));
$('#fabComment').addEventListener('click', () => $('#tamu').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }));

const HUG_MESSAGES = [
  '🐻 Pelukan virtual terkirim ke Arum — hangat, erat, gak mau lepas.',
  '🤗 Dari Arif, dengan cinta: kamu cantik, kamu hebat, kamu dicintai sepenuhnya.',
  '🧸 Ini boneka beruangnya — tapi pelukan aslinya nunggu kamu pulang.',
  '💕 Arum, kamu adalah rumah terbaik yang pernah aku temukan.',
  '🌙 Selamat malam, sayang. Tidur yang manis — mimpikan aku ya.'
];
$('#hugBtn').addEventListener('click', (e) => {
  heartBurst(e.clientX, e.clientY, 12);
  swalCute({ icon: 'success', title: 'Pelukan Terkirim! 🐻💕', text: HUG_MESSAGES[Math.floor(Math.random() * HUG_MESSAGES.length)], timer: 3200, showConfirmButton: false });
});

/* ============================================================
   9) INIT
   ============================================================ */
renderGallery();
renderAnniversary();
renderDiary();
fetchComments();
