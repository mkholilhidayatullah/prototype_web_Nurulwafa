(function () {
  /* ---------- Menu ---------- */
  var btn = document.getElementById('menuBtn');
  var links = document.getElementById('navLinks');
  btn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') links.classList.remove('open');
  });

  /* ---------- Reveal (fade + rise, staggered per group) ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    /* Stagger: elements revealed together rise one after another */
    var seenParents = [];
    document.querySelectorAll('.rv').forEach(function (el) {
      var p = el.parentElement, idx = seenParents.indexOf(p);
      if (idx === -1) { seenParents.push(p); idx = seenParents.length - 1; seenParents['n' + idx] = 0; }
      var n = seenParents['n' + idx]++;
      el.style.transitionDelay = Math.min(n, 3) * 90 + 'ms';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in'); io.unobserve(en.target);
          setTimeout(function () { en.target.style.transitionDelay = ''; }, 1200);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Facility numbers count up when visible ---------- */
  var facNums = document.querySelectorAll('.fac-strip b');
  if (facNums.length && 'IntersectionObserver' in window && !reduceMotion) {
    var counted = false;
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || counted) return;
        counted = true; cio.disconnect();
        facNums.forEach(function (b) {
          var target = parseInt(b.textContent, 10);
          if (isNaN(target)) return;
          var t0 = null;
          function tick(ts) {
            if (!t0) t0 = ts;
            var p = Math.min((ts - t0) / 900, 1);
            b.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      });
    }, { threshold: 0.35 });
    cio.observe(facNums[0].closest('.fac-strip'));
  }

  /* ---------- Hero photo: gentle parallax drift (desktop saja;
     di HP foto tampil proporsional penuh, posisi dibiarkan tengah) ---------- */
  var heroImg = document.querySelector('.hero-photo img');
  if (heroImg && !reduceMotion && window.matchMedia('(min-width: 921px)').matches) {
    var ticking = false;
    function drift() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      var hero = heroImg.parentElement;
      if (y < hero.offsetTop + hero.offsetHeight + 80) {
        heroImg.style.objectPosition = '50% ' + Math.max(18, 50 - y * 0.045) + '%';
      }
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(drift); }
    }, { passive: true });
  }

  /* ---------- Accessibility: font size ---------- */
  var zoomLevels = [0.9, 1, 1.1, 1.2], zoomIdx = 1;
  function applyZoom() { document.body.style.zoom = zoomLevels[zoomIdx]; }
  document.getElementById('fontUp').addEventListener('click', function () { if (zoomIdx < zoomLevels.length - 1) { zoomIdx++; applyZoom(); } });
  document.getElementById('fontDown').addEventListener('click', function () { if (zoomIdx > 0) { zoomIdx--; applyZoom(); } });
  document.getElementById('fontReset').addEventListener('click', function () { zoomIdx = 1; applyZoom(); });

  /* ---------- Accessibility: dark mode ---------- */
  var themeBtn = document.getElementById('themeBtn');
  function isDark() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function syncThemeBtn() {
    themeBtn.setAttribute('aria-pressed', isDark() ? 'true' : 'false');
    themeBtn.textContent = isDark() ? T('theme_light') : T('theme_dark');
  }
  themeBtn.addEventListener('click', function () {
    document.documentElement.setAttribute('data-theme', isDark() ? 'light' : 'dark');
    syncThemeBtn();
  });

  /* ---------- Multi-step PPDB form ---------- */
  var fNama = document.getElementById('fNama'), fAsal = document.getElementById('fAsal'),
      fWali = document.getElementById('fWali'), fPesan = document.getElementById('fPesan'),
      fJenjang = document.getElementById('fJenjang');
  function goStep(n) {
    document.querySelectorAll('.fstep').forEach(function (fs) {
      var s = parseInt(fs.getAttribute('data-step'), 10);
      var active = s === n;
      fs.classList.toggle('active', active);
      fs.hidden = !active;
    });
    document.querySelectorAll('#stepper div').forEach(function (d, i) {
      d.classList.toggle('on', i + 1 === n);
      d.classList.toggle('done', i + 1 < n);
    });
    var first = document.querySelector('.fstep[data-step="' + n + '"] input, .fstep[data-step="' + n + '"] select, .fstep[data-step="' + n + '"] textarea');
    if (first) first.focus({ preventScroll: true });
  }
  function markInvalid(fieldWrap, bad) { fieldWrap.classList.toggle('invalid', bad); return !bad; }
  function fillReview() {
    document.getElementById('rvNama').textContent = fNama.value.trim() || '—';
    document.getElementById('rvAsal').textContent = fAsal.value.trim() || '—';
    document.getElementById('rvWali').textContent = fWali.value.trim() || '—';
    document.getElementById('rvJenjang').textContent = fJenjang.value || '—';
  }
  document.getElementById('next1').addEventListener('click', function () {
    if (markInvalid(document.getElementById('fldNama'), !fNama.value.trim())) goStep(2);
    else fNama.focus();
  });
  document.getElementById('back2').addEventListener('click', function () { goStep(1); });
  document.getElementById('next2').addEventListener('click', function () {
    if (markInvalid(document.getElementById('fldWali'), !fWali.value.trim())) { fillReview(); goStep(3); }
    else fWali.focus();
  });
  document.getElementById('back3').addEventListener('click', function () { goStep(2); });
  fJenjang.addEventListener('change', fillReview);
  [fNama, fWali].forEach(function (inp) {
    inp.addEventListener('input', function () { inp.closest('.field').classList.remove('invalid'); });
  });
  fJenjang.addEventListener('change', function () { document.getElementById('fldJenjang').classList.remove('invalid'); });

  document.getElementById('ppdbForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!markInvalid(document.getElementById('fldJenjang'), !fJenjang.value)) { fJenjang.focus(); return; }
    var lines = [
      "Assalamu'alaikum warahmatullahi wabarakatuh.",
      'Saya ingin mendaftarkan calon santri baru di Pondok Pesantren Nurul Wafa.',
      '',
      'Nama calon santri: ' + fNama.value.trim(),
      'Jenjang tujuan: ' + fJenjang.value,
      'Nama orang tua/wali: ' + fWali.value.trim()
    ];
    if (fAsal.value.trim()) lines.push('Asal daerah: ' + fAsal.value.trim());
    if (fPesan.value.trim()) lines.push('Pesan: ' + fPesan.value.trim());
    lines.push('', 'Mohon informasi syarat dan langkah pendaftarannya. Terima kasih.');
    window.open('https://wa.me/6281336999909?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });

  /* ---------- Language ID / EN ---------- */
  var ORIG = {}, ORIG_PH = {}, ORIG_ARIA = {};
  document.querySelectorAll('[data-i18n]').forEach(function (el) { ORIG[el.getAttribute('data-i18n')] = el.innerHTML; });
  document.querySelectorAll('[data-i18n-ph]').forEach(function (el) { ORIG_PH[el.getAttribute('data-i18n-ph')] = el.getAttribute('placeholder') || ''; });
  document.querySelectorAll('[data-i18n-aria]').forEach(function (el) { ORIG_ARIA[el.getAttribute('data-i18n-aria')] = el.getAttribute('aria-label') || ''; });

  var EN = {
    addr_short: 'Watu Ketu Hamlet, Jl. PG. Demaas, Demung Village, Besuki District, Situbondo Regency 68356',
    theme_dark: 'Dark Mode', theme_light: 'Light Mode',
    brand_sub: 'Nurul Wafa Foundation · Demung, Besuki, Situbondo — East Java',
    ms_label: 'Information & Registration', ms_note: 'Boarding school phone / WhatsApp',
    nav_home: 'Home', nav_profil: 'Profile', nav_unit: 'Education Units', nav_program: 'Programs', nav_berita: 'News', nav_galeri: 'Gallery', nav_kontak: 'Contact',
    nav_psb: 'New Student Registration (PSB) →',
    hero_cap: 'Haflatul Imtihan & the 46th Haul of Ponpes Nurul Wafa, Demung — the main stage filled with santri and guardians.',
    hl_date: '8 March 2023', hl_cat: 'School News',
    hl_title: 'Nurul Wafa Boarding School in Demung Holds Haflatul Imtihan and Its 46th Haul',
    hl_excerpt: 'The Haflatul Imtihan and the 46th Haul of the late KH. Ahmad Sibawayhie Syadzli were held at Pondok Pesantren Nurul Wafa, Demung, Besuki, Situbondo — attended by masyayikh, invited guests, santri, and guardians. Under the Nurul Wafa Foundation, the school combines classical kitab kuning studies of a traditional salaf pesantren with the national education curriculum, from playgroup to university.',
    hl_more: 'Read the coverage on Teropong Reformasi →',
    hero_cta1: 'New Student Registration', hero_cta2: 'School Profile',
    side_title: 'Latest News',
    s1_date: 'Announcement · PSB', s1_t: 'New Student Registration Open for Five Levels',
    s2_date: 'Visit · Coaching', s2_t: 'Deputy Minister of Religious Affairs Coaches Nurul Wafa Educators',
    s3_date: 'October 2024', s3_t: 'Santri Day Gathering at PP Nurul Wafa Situbondo',
    s4_date: '17 March 2022', s4_t: 'The Founder’s 3rd Haul & Haflatul Imtihan on the Night of Nisfu Sya’ban',
    s5_t: 'STAIAS Inaugurated — Higher Education within the Boarding School',
    peng_h2: 'Caretakers & Founder',
    peng_p1: 'Pondok Pesantren Nurul Wafa was founded by <strong>the late KH. Ahmad Sibawayhie Syadzli</strong>. He studied at <strong>Pondok Pesantren Nurul Jadid, Paiton</strong> and <strong>Al Wafa Tempora, Jember</strong>, and once served as Chairman of MWC NU for Besuki District.',
    peng_p2: 'From his religious gatherings, educational institutions kept growing until they now cover five levels — continued by the Nurul Wafa Foundation chaired by <strong>H. Moh. Hafidh Sibawayhie Sadli, SH</strong>.',
    f_pendiri: 'Founder', f_ketua: 'Foundation Chair', f_legal: 'Legal status',
    f_legal_v: 'Nurul Wafa Foundation — Ministry of Law & Human Rights decree, 22 October 2015',
    f_santri: 'Santri & Teachers', f_santri_v: '±705 santri & students · 52 teachers and asatidz',
    peng_more: 'Read the full profile & history ↓',
    info_h2: 'School Information',
    i1_date: 'Announcement', i1_t: 'New Student Registration (PSB) Open — KB, Diniyah, MTs, MA, STAIAS',
    i2_t: 'MTs Nurul Wafa Earns Accreditation A',
    i3_date: '22 October 2015', i3_t: 'Nurul Wafa Foundation Legalised by the Ministry',
    i4_t: 'STAIAS Inaugurated within the Boarding School',
    unit_h2: 'Education Units',
    unit_lede: 'One roof for the whole learning journey under the Nurul Wafa Foundation: from early childhood, through madrasah education, up to higher education.',
    u1_cat: 'Early Childhood', u1_p: 'Ibnu Hajar Playgroup — early childhood education as the first gate before the madrasah levels.', u1_meta: '±40 children',
    u2_cat: 'Religious', u2_p: 'Madrasah Diniyah at Ula and Wustho levels — deepening religious knowledge, classical texts, and character for santri and children around the boarding school.', u2_meta: 'Ula & Wustho levels',
    u3_cat: 'Junior Secondary', u3_p: 'The Madrasah Tsanawiyah, established in 1994 and accredited A since 2008, combining the national curriculum with boarding school life.', u3_meta: '±230 students · Accreditation A',
    u4_cat: 'Senior Secondary', u4_p: 'Madrasah Aliyah — the next level for santri to deepen general and religious knowledge before university.', u4_meta: '±435 students',
    u5_cat: 'Higher Education', u5_p: 'The Ahmad Sibawayhie Islamic College, inaugurated in 2019 — a campus within the boarding school named after its founder.', u5_meta: 'Inaugurated 2019',
    layanan_b: 'Beyond formal classes,',
    layanan_t: 'the foundation also runs <b>KBIH Abu Hanifah</b> (Hajj guidance), <b>LKSA</b> (children’s social welfare home), and <b>Kopontren</b> (the boarding school cooperative) as services to the community.',
    news_h2: 'News & Activities',
    news_lede: 'Coverage and documentation of Pondok Pesantren Nurul Wafa activities from media reporting and the institution’s archive.',
    k1_t: 'Gathering & Educator Coaching by the Deputy Minister of Religious Affairs',
    k1_meta: 'STAIAS Nurul Wafa documentation',
    k1_p: 'Deputy Minister of Religious Affairs Dr. H. Zainut Tauhid Sa’adi, M.Si. held a gathering and coaching session for educators across Pondok Pesantren Nurul Wafa — Madin, MI, MTs, MAN, and STAIAS.',
    k2_t: 'Santri Day Gathering at PP Nurul Wafa Situbondo',
    k2_meta: 'October 2024 · SurabayaSatu',
    k2_p: 'A Santri Day gathering was held at Pondok Pesantren Nurul Wafa, Situbondo, attended by East Java Governor Khofifah Indar Parawansa, who shared the success of the OPOP (One Pesantren One Product) programme in empowering pesantren economies.',
    k3_t: 'Night of Nisfu Sya’ban: The Founder’s 3rd Haul & Haflatul Imtihan',
    k3_meta: '17 March 2022 · Radar96',
    k3_p: 'On the night of Nisfu Sya’ban, Governor Khofifah led the recitation of Sholawat Tibbil Qulub and Li Khomsatun with thousands of worshippers at the 3rd Haul of KH. Ahmad Sibawayhie Syadzli and Haflatul Imtihan of Ponpes Nurul Wafa.',
    profil_h2: 'Profile & History',
    profil_lede: 'Rooted in the religious gatherings and example of its founder, Nurul Wafa has grown into an Islamic education foundation overseeing many units in Besuki, Situbondo.',
    profil_p1: 'Pondok Pesantren Nurul Wafa was founded by <strong>the late KH. Ahmad Sibawayhie Syadzli</strong>. He studied at <strong>Pondok Pesantren Nurul Jadid, Paiton</strong> and <strong>Al Wafa Tempora, Jember</strong>, and once served as Chairman of MWC NU for Besuki District.',
    profil_p2: 'From those religious gatherings, educational institutions kept growing: <strong>MTs Nurul Wafa was established in 1994</strong> and earned <strong>accreditation A in 2008</strong>, followed by Madrasah Aliyah, Madrasah Diniyah, and <strong>STAIAS (Ahmad Sibawayhie Islamic College)</strong>, inaugurated in 2019.',
    profil_p3: 'All units sit under the <strong>Nurul Wafa Foundation</strong>, legalised by a Ministry of Law and Human Rights decree on 22 October 2015 and currently chaired by <strong>H. Moh. Hafidh Sibawayhie Sadli, SH</strong>. Today around <strong>705 students</strong> study at the boarding school, guided by <strong>52 teachers and asatidz</strong>.',
    acara_cap: 'Haflatul Imtihan of Pondok Pesantren Nurul Wafa — the graduation and end-of-year celebration of the santri.',
    sb_title: 'The School at a Glance',
    f_pendiri2: 'Founder', f_ketua2: 'Foundation Chair', f_legal2: 'Legal status',
    f_legal_v2: 'Nurul Wafa Foundation — Ministry of Law & Human Rights decree, 22 October 2015',
    f_karakter: 'Character', f_karakter_v: 'Kitab kuning studies combined with the national education curriculum',
    f_alamat: 'Address',
    addr_short2: 'Watu Ketu Hamlet, Jl. PG. Demaas, Demung Village, Besuki District, Situbondo Regency 68356',
    tl_h3: 'The Institution’s Journey',
    tl1_h: 'MTs Nurul Wafa Established', tl1_p: 'The Madrasah Tsanawiyah became the first formal education unit born from the founder’s religious gatherings.',
    tl2_h: 'Accreditation A', tl2_p: 'MTs Nurul Wafa earned accreditation A — recognition of quality for a madrasah within this boarding school.',
    tl3_h: 'Foundation Legalised', tl3_p: 'The Nurul Wafa Foundation received its Ministry of Law and Human Rights decree on 22 October 2015 as the umbrella for all units.',
    tl4_h: 'STAIAS Inaugurated', tl4_p: 'The Ahmad Sibawayhie Islamic College opened — a higher-education level named after the founder.',
    prog_h2: 'Programs & Santri Life',
    prog_lede: 'Santri days are filled with study, school, and devotional routines — a salaf boarding school tradition guarded across generations.',
    pr1_h: 'Kitab Kuning Studies', pr1_p: 'Study of classical Arabic texts as the heart of the boarding school curriculum, read and examined together with the asatidz.',
    pr2_h: 'Sorogan & Taqror', pr2_p: 'Santri recite their reading of the texts directly before a teacher (sorogan) and review lessons together (taqror) so the knowledge truly takes root.',
    pr3_h: 'Qur’an Guidance', pr3_p: 'Coaching in Qur’an recitation using the Qiroah and Tartil methods, from correcting articulation points to fluent tilawah.',
    pr4_h: 'Nahwu & Sharaf Memorisation', pr4_p: 'Memorising Arabic grammar rules as the foundation for santri to read and understand the kitab kuning independently.',
    pr5_h: 'Istigasah & Amaliah', pr5_p: 'Regular istigasah and devotional practices of the boarding school community — nurturing closeness to Allah and togetherness among santri.',
    pr6_h: 'Pilgrimage to the Founder’s Tomb', pr6_p: 'Visiting the tomb of the late KH. Ahmad Sibawayhie Syadzli — honouring the founder’s service and following his example.',
    quran_cap: 'Nurul Wafa santri in front of the pondok gate — sarongs and peci caps, the everyday dress of pesantren life.',
    silat_h: 'Pencak Silat',
    silat_p: 'Outside study hours, Nurul Wafa santri also train in pencak silat in the pondok courtyard. Several silat schools are practised at the pondok, among them <strong>Pagar Nusa</strong> and <strong>Cipta Sejati</strong> — building the santri’s agility and discipline while preserving the pesantren’s martial-arts heritage.',
    silat_cap: 'Santri training in pencak silat in the courtyard of Pondok Pesantren Nurul Wafa at night.',
    photo_note: 'At a pesantren, knowledge is not merely read — it is recited back, repeated, and written as glosses between the lines of the book.',
    kitab_cap: 'Studying the kitab kuning by writing meanings between its lines — a distinctive pesantren learning tradition.',
    fas_h2: 'Facilities',
    fas1: 'santri dormitory rooms', fas2: 'boarding school mosque', fas3: 'prayer rooms (mushalla)', fas4: 'teachers & guiding asatidz',
    fas_note: 'Santri at the MTs and MA levels <b>live in the boarding school dormitories</b> throughout their studies, with the school mosque and four mushalla as the centre of the community’s daily worship.',
    gal_h2: 'Photo Gallery',
    gal_lede: 'Documentation of events and activities at Pondok Pesantren Nurul Wafa, Demung — Besuki, Situbondo.',
    g1_cap: 'Haflatul Imtihan and the 46th Haul, 2023',
    g2_cap: 'The Founder’s 3rd Haul & Haflatul Imtihan, Nisfu Sya’ban 2022',
    g3_cap: 'Educator Coaching by the Deputy Minister of Religious Affairs',
    g4_cap: 'Santri Day Gathering, October 2024',
    g5_cap: 'Haul & Haflatul Imtihan — the evening atmosphere',
    g6_cap: 'Haflatul Imtihan — graduation & end-of-year celebration',
    psb_h2: 'New Student Registration (PSB)',
    psb_lede: 'Would you like your child to study at Nurul Wafa? Start here — the committee will reply and guide you through the next steps.',
    st1_n: 'Step 01', st1_h: 'Contact the Committee', st1_p: 'Fill in the short form on this page or call directly. Your message is forwarded to the school’s WhatsApp.',
    st2_n: 'Step 02', st2_h: 'Confirm the Level', st2_p: 'The committee confirms your chosen level (KB, Diniyah, MTs, MA, or STAIAS) and the requirements and documents to prepare.',
    st3_n: 'Step 03', st3_h: 'Visit & Re-register', st3_p: 'Prospective santri and guardians come to the boarding school to complete registration and get to know the dormitory environment.',
    form_h3: 'Registration Interest Form',
    form_sub: 'Complete the three short steps below. When you press send, you will be directed to the school’s WhatsApp with the message already filled in.',
    step_1: '1 · Student Data', step_2: '2 · Guardian Data', step_3: '3 · Unit Choice',
    step_1b: '1 · Student Data', step_2b: '2 · Guardian Data', step_3b: '3 · Unit Choice',
    fl_nama: 'Prospective student’s name', ph_nama: 'Full name of the prospective student', err_nama: 'The student’s name is required.',
    fl_asal: 'Home region', ph_asal: 'District / regency of origin',
    btn_next: 'Next →', btn_next2: 'Next →', btn_back: '← Back', btn_back2: '← Back', btn_send: 'Send via WhatsApp',
    fl_wali: 'Parent / guardian name', ph_wali: 'Guardian’s name', err_wali: 'The parent / guardian name is required.',
    fl_pesan: 'Additional message', opsional: '(optional)', ph_pesan: 'Questions for the committee, e.g. about dormitories or fees',
    fl_jenjang: 'Intended level', opt_pilih: '— Choose a level —', err_jenjang: 'Please choose the intended level.',
    fl_nama2: 'Prospective student’s name', fl_asal2: 'Home region', fl_wali2: 'Parent / guardian name', fl_jenjang2: 'Intended level',
    note_lead: 'What guardians should know',
    note1: 'Registration is open for KB Ibnu Hajar, Madrasah Diniyah, MTs, MA, and STAIAS.',
    note2: 'Required documents, intake schedules, and fee details are confirmed directly by the committee — contact the school for the latest official information.',
    note3: 'Prospective santri at the MTs and MA levels live in the boarding school dormitories during their studies.',
    note4: 'Visits and silaturahmi to the boarding school are welcome — please contact the school number first.',
    note_tel: 'School phone / WhatsApp:',
    faq_h2: 'Registration FAQ',
    faq_sub: 'The questions guardians ask most often. Anything not covered here is confirmed directly by the school committee.',
    q1: 'Which levels are open for registration?',
    a1: 'Registration is open for five levels under the Nurul Wafa Foundation: KB Ibnu Hajar, Madrasah Diniyah (Ula & Wustho), MTs Nurul Wafa, MA Nurul Wafa, and STAIAS.',
    q2: 'How do I register?',
    a2: 'Fill in the interest form on this page — your message is forwarded to the school’s WhatsApp. The committee will confirm the intended level and the requirements and documents to prepare, then the prospective santri and guardian come to the school to re-register and see the dormitory environment.',
    q3: 'Do santri live in dormitories?',
    a3: 'Yes. Prospective santri at the MTs and MA levels live in the school dormitories during their studies. The school provides 20 dormitory rooms, one mosque, and four mushalla.',
    q4: 'What are the requirements and documents?',
    a4: 'Requirements and documents are confirmed directly by the committee so the information is official and up to date. Please ask via <a href="https://wa.me/6281336999909" target="_blank" rel="noopener">the school’s WhatsApp 0813-3699-9909</a> or phone (0338) 891315.',
    q5: 'How much are the registration and tuition fees?',
    a5: 'Fee details are not listed on this page and are confirmed directly by the committee. Contact the school via <a href="https://wa.me/6281336999909" target="_blank" rel="noopener">WhatsApp 0813-3699-9909</a> for the latest official information.',
    q6: 'May we visit and see the school first?',
    a6: 'Yes. Visits and silaturahmi to the boarding school are welcome — please contact the school first at 0813-3699-9909 so your visit can be properly received.',
    kontak_h2: 'Contact & Location',
    kontak_lede: 'Visit us in Besuki, Situbondo — or reach the school by phone and WhatsApp.',
    addr_full: 'Watu Ketu Hamlet, Jl. PG. Demaas,<br />Demung Village, Besuki District,<br />Situbondo Regency, East Java 68356',
    ck_tel: 'Phone / WhatsApp', ck_unit: 'Units under the foundation',
    lk1_t: 'Open in Google Maps', lk1_d: 'Directions to the boarding school',
    lk2_t: 'Chat the School on WhatsApp', lk2_d: 'Questions about the school & registration',
    lk3_t: 'MTs Nurul Wafa Website',
    map_cap: 'Map of the school location — Watu Ketu Hamlet, Jl. PG. Demaas, Demung Village, Besuki District, Situbondo Regency.',
    ft_h_kantor: 'Secretariat Office',
    addr_short3: 'Watu Ketu Hamlet, Jl. PG. Demaas, Demung Village, Besuki District, Situbondo Regency, East Java Province, Indonesia 68356',
    ft_wa: '(School WhatsApp)', ft_tel: '(Office)',
    ft_h_sosmed: 'School Social Media',
    ft_h_profil: 'Profile',
    ft_l_profil: 'Profile & History', ft_l_pengasuh: 'Caretakers & Founder', ft_l_program: 'Santri Programs', ft_l_fasilitas: 'Facilities', ft_l_galeri: 'Photo Gallery',
    ft_h_bantuan: 'Help',
    ft_l_psb: 'New Student Registration', ft_l_faq: 'FAQ', ft_l_berita: 'News & Activities', ft_l_kontak: 'Contact & Location',
    ft_h_unit: 'Related Units',
    fine: 'Profile sources: the Nurul Wafa Foundation profile & public reporting on Ponpes Nurul Wafa Demung, Besuki. Photos: Haflatul Imtihan 2023 (Teropong Reformasi), Haul & Nisfu Sya’ban 2022 (Radar96), Deputy Minister of Religious Affairs coaching (STAIAS Nurul Wafa documentation), Santri Day Gathering 2024 (SurabayaSatu); learning activity photos: illustrations of santri study atmosphere. The latest official registration information is always confirmed directly by the school committee.',
    wa_tip: 'Ask via WhatsApp'
  };
  var EN_PH = { ph_nama: EN.ph_nama, ph_asal: EN.ph_asal, ph_wali: EN.ph_wali, ph_pesan: EN.ph_pesan };
  var EN_ARIA = {
    a11y_font_down: 'Decrease font size', a11y_font_reset: 'Normal font size', a11y_font_up: 'Increase font size',
    wa_float: 'Chat the school on WhatsApp',
    soc_fb: 'Ponpes Nurul Wafa on Facebook', soc_ig: 'Ponpes Nurul Wafa on Instagram (@ponpes_nurulwafa)',
    soc_tt: 'Ponpes Nurul Wafa on TikTok (@pp.nurulwafa)', soc_yt: 'Ponpes Nurul Wafa on YouTube'
  };
  var curLang = 'id';
  function T(k) { return curLang === 'en' && EN[k] ? EN[k] : (ORIG[k] ? ORIG[k].replace(/<[^>]*>/g, '') : k); }
  function setLang(lang) {
    curLang = lang;
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'id');
    document.getElementById('langId').setAttribute('aria-pressed', lang === 'id' ? 'true' : 'false');
    document.getElementById('langEn').setAttribute('aria-pressed', lang === 'en' ? 'true' : 'false');
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (lang === 'en' && EN[k]) el.innerHTML = EN[k];
      else if (ORIG[k] !== undefined) el.innerHTML = ORIG[k];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-ph');
      el.setAttribute('placeholder', lang === 'en' && EN_PH[k] ? EN_PH[k] : (ORIG_PH[k] || ''));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-aria');
      el.setAttribute('aria-label', lang === 'en' && EN_ARIA[k] ? EN_ARIA[k] : (ORIG_ARIA[k] || ''));
    });
    syncThemeBtn();
  }
  document.getElementById('langId').addEventListener('click', function () { setLang('id'); });
  document.getElementById('langEn').addEventListener('click', function () { setLang('en'); });
  syncThemeBtn();
})();
