/* ============================================================
   LITTLE STARS — APP FLOW
   Home → age → 5 mini-games → reward → certificate → next child.
   STORE EVENT MODE settings are just below.
   ============================================================ */
(function () {
  'use strict';
  var LS = window.LS, $ = LS.$, t = LS.t, el = LS.el;

  /* ---------- STORE EVENT MODE settings (seconds) ---------- */
  var IDLE_ASK = 90;        /* no touch during a game → ask "still playing?"   */
  var IDLE_ASK_WAIT = 25;   /* no answer → go back to the welcome screen        */
  var IDLE_REWARD = 180;    /* results screen left alone → welcome screen       */
  var STAFF_HOLD = 2000;    /* press-and-hold time on the logo (milliseconds)   */
  var GAME_BONUS = 3;       /* stars for finishing each mini-game               */

  var GAMES = ['stylist', 'memory', 'quiz', 'adventure', 'challenge', 'designer', 'puzzle'];
  var COVER = ['pink-cardigan', 'varsity-tee', 'navy-coat', 'tan-sneakers', 'pattern-puffer', null, 'check-dress'];
  var FANS = [
    ['green-tee', 'pink-cardigan', 'burgundy-hoodie'],
    ['cap', 'varsity-tee', 'blue-sneakers'],
    ['navy-coat', 'check-dress', 'backpack'],
    ['navy-blazer', 'peach-dress', 'tan-sneakers'],
    ['pattern-puffer', 'varsity-jacket', 'pink-bag'],
    ['check-dress', 'varsity-tee', 'pink-skirt'],
    ['pattern-sweatshirt', 'check-jacket', 'varsity-jacket']
  ];
  var where = 'home';

  /* ---------- language ---------- */
  function applyLang() {
    var ar = LS.state.lang === 'ar';
    document.documentElement.lang = ar ? 'ar' : 'en';
    document.documentElement.dir = ar ? 'rtl' : 'ltr';
    Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (n) { n.textContent = t(n.dataset.t); });
    $('#sound').setAttribute('aria-label', t(LS.state.sound ? 'soundOn' : 'soundOff'));
  }

  /* ---------- wipe everything from the previous child ---------- */
  function wipe() {
    LS.state.session++;
    LS.state.stars = 0; LS.state.name = ''; LS.state.usedQ = []; LS.state.usedLooks = [];
    LS.state.design = null; LS.state.stats = {}; LS.state.cur = ''; LS.state.caught = 0;
    if (LS.duel) LS.duel.reset();
    LS.state.done = {}; LS.state.look = null; LS.state.created = false; LS.state.photo = null;
    ['#c-tee', '#c-rank', '#c-photo'].forEach(function (s) { var n = $(s); while (n.firstChild) n.removeChild(n.firstChild); });
    $('#star-count').textContent = '0';
    delete document.body.dataset.g;
    $('#c-name').textContent = '';
    ['#cert', '#still', '#staff'].forEach(function (s) { $(s).classList.remove('on'); });
    $('#feedback').className = '';
    $('#confetti').style.display = 'none';
    Array.prototype.forEach.call(document.querySelectorAll('.fly-star, .drag-ghost, .count'), function (n) { n.parentNode.removeChild(n); });
    LS.hush();
  }

  /* ---------- 1. welcome ---------- */
  function home() {
    wipe(); where = 'home';
    LS.hud(false); applyLang();
    var scr = LS.screen('home');
    var logo = new Image(); logo.src = 'assets/logo/emporio-armani-logo.png'; logo.alt = 'Emporio Armani';
    logo.className = 'logo staff-key'; logo.draggable = false;
    scr.appendChild(logo);
    scr.appendChild(el('h1', 'hero', t('title')));
    scr.appendChild(el('p', 'tagline', t('tagline')));
    scr.appendChild(LS.guide(t('hello'), 'big'));

    var lang = el('div', 'lang');
    [['en', 'English'], ['ar', 'العربية']].forEach(function (l) {
      var b = el('button', LS.state.lang === l[0] ? 'on' : '', l[1]);
      b.type = 'button'; b.dataset.lang = l[0]; b.lang = l[0];
      b.addEventListener('click', function () {
        LS.unlockAudio(); LS.sfx.tap();
        if (LS.state.lang !== l[0]) { LS.state.lang = l[0]; home(); }
      });
      lang.appendChild(b);
    });
    scr.appendChild(lang);

    var go = el('button', 'btn primary big', t('start')); go.type = 'button';
    go.addEventListener('click', function () { LS.unlockAudio(); LS.sfx.welcome(); age(); });
    scr.appendChild(go);
    scr.appendChild(el('p', 'rotate-hint', t('rotate')));
    LS.show(scr);
    bindStaffKeys();
  }

  /* ---------- 2. age group ---------- */
  function age() {
    where = 'age';
    var scr = LS.screen('age-screen');
    LS.currentPrompt = t('ageTitle');
    scr.appendChild(LS.guide(t('ageTitle'), 'big'));
    var row = el('div', 'ages');
    [['junior', 'juniorAge', '★'], ['senior', 'seniorAge', '★ ★']].forEach(function (a) {
      var b = el('button', 'age'); b.type = 'button'; b.dataset.age = a[0];
      b.appendChild(el('span', 'mini', a[2]));
      b.appendChild(el('span', 'num', t(a[1])));
      b.appendChild(el('span', 'yrs', t('years')));
      b.appendChild(el('span', 'who', t(a[0])));
      b.addEventListener('click', function () {
        LS.unlockAudio(); LS.sfx.tap();
        LS.state.age = a[0];
        LS.state.memCount = a[0] === 'junior' ? 6 : 8;
        journey();
      });
      row.appendChild(b);
    });
    scr.appendChild(row);
    LS.show(scr);
    LS.say(t('ageTitle'));
  }

  /* memory level picker shown on the Memory Match intro */
  function levels() {
    var box = el('div', 'levels');
    [[6, 'easy'], [8, 'medium'], [12, 'hard']].forEach(function (l) {
      var b = el('button', LS.state.memCount === l[0] ? 'on' : ''); b.type = 'button'; b.dataset.count = l[0];
      b.appendChild(el('span', '', t(l[1])));
      b.appendChild(el('small', '', l[0] + ' ' + t('cards')));
      b.addEventListener('click', function () {
        LS.sfx.tap(); LS.state.memCount = l[0];
        Array.prototype.forEach.call(box.children, function (k) { k.classList.toggle('on', k === b); });
      });
      box.appendChild(b);
    });
    return box;
  }

  /* ---------- 3. the five mini-games ---------- */
  function journey() {              /* a fresh start for one child */
    wipe();
    LS.hud(true);
    hub();
  }

  /* the game menu: the child picks what to play, in any order */
  function hub() {
    where = 'game';
    LS.state.session++;               /* stop any game still running */
    LS.state.cur = ''; LS.hush();
    delete document.body.dataset.g;
    var done = LS.state.done, count = Object.keys(done).length;
    LS.setProgress(count);
    var scr = LS.screen('hub');
    var text = t(count ? 'hubMore' : 'hubTitle');
    scr.appendChild(LS.guide(text, 'big'));
    LS.currentPrompt = text;
    var grid = el('div', 'hub-grid');
    GAMES.forEach(function (g, i) {
      var b = el('button', 'gcard' + (done[g] ? ' played' : '')); b.type = 'button'; b.dataset.game = g; b.dataset.n = i + 1;
      var art = el('span', 'gart');
      if (g === 'puzzle') { art.classList.add('puz'); art.appendChild(el('span', 'puz-ico', '🧩')); }
      if (COVER[i]) { var im = new Image(); im.src = LS.src(COVER[i]); im.alt = ''; im.draggable = false; art.appendChild(im); }
      else art.appendChild(LS.tee({ color: '#ffd23f', pattern: 'stars', stickers: [{ k: '🌈', x: 50, y: 52 }] }));
      b.appendChild(art);
      b.appendChild(el('span', 'gname', t('g' + (i + 1))));
      b.addEventListener('click', function () { LS.unlockAudio(); LS.sfx.tap(); play(i); });
      grid.appendChild(b);
    });
    scr.appendChild(grid);
    var foot = el('div', 'hub-foot');
    var duel = el('button', 'duel-banner'); duel.type = 'button'; duel.id = 'duel-open';
    duel.appendChild(el('span', 'ico', '🏆'));
    var dt = el('span', 'txt'); dt.appendChild(el('b', '', t('duel'))); dt.appendChild(el('small', '', t('duelSub'))); duel.appendChild(dt);
    duel.addEventListener('click', function () { LS.unlockAudio(); LS.sfx.tap(); LS.duelHub(); });
    foot.appendChild(duel);
    if (count) {
      var fin = el('button', 'btn primary big', '🎁  ' + t('finish')); fin.type = 'button'; fin.id = 'finish';
      fin.addEventListener('click', function () { LS.unlockAudio(); LS.sfx.tap(); finish(); });
      foot.appendChild(fin);
    }
    scr.appendChild(foot);
    LS.show(scr);
    if (LS.isJunior() || !count) LS.say(text);
  }

  async function play(i) {
    var g = GAMES[i];
    LS.state.cur = '';
    await LS.intro(i + 1, FANS[i], g === 'memory' ? levels() : null);
    LS.state.cur = g;
    await LS.games[g]();
    LS.hush();
    await LS.gameDone(GAME_BONUS);
    LS.state.done[g] = true;
    if (Object.keys(LS.state.done).length === GAMES.length) finish(); else hub();
  }

  async function finish() {
    LS.state.cur = '';
    await gift();
    LS.award(5);                      /* finishing the adventure */
    reward();
  }

  /* top-bar "Games" button: leave the current game and go back to the menu */
  $('#menu').addEventListener('click', function () {
    if (where !== 'game') return;
    LS.unlockAudio(); LS.sfx.tap();
    LS.state.session++;               /* quietly stops whatever was running */
    $('#feedback').className = '';
    hub();
  });

  /* ---------- a gift to open before the results ---------- */
  function gift() {
    return new Promise(function (resolve) {
      delete document.body.dataset.g;
      var scr = LS.screen('gift-screen');
      scr.appendChild(LS.guide(t('giftTitle') + ' ' + t('giftSub'), 'big'));
      var box = el('button', 'gift'); box.type = 'button'; box.id = 'gift';
      ['lid', 'bow', 'body', 'band'].forEach(function (k) { box.appendChild(el('span', k)); });
      var taps = 0;
      box.addEventListener('click', function () {
        if (taps >= 3) return;
        taps++; LS.unlockAudio(); LS.sfx.tap();
        box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
        if (taps === 3) { box.classList.add('open'); LS.sfx.win(); LS.wait(1000).then(resolve); }
      });
      scr.appendChild(box);
      LS.currentPrompt = t('giftTitle') + ' ' + t('giftSub');
      LS.show(scr);
      LS.say(LS.currentPrompt);
    });
  }

  /* a fun title, chosen from what the child did best */
  function rank() {
    var st = LS.state.stats, best = [], low = 99;
    [['stylist', 'tStylist'], ['memory', 'tMemory'], ['quiz', 'tQuiz']].forEach(function (g) {
      if (!LS.state.done[g[0]]) return;
      var v = st[g[0]] || 0;
      if (v < low) { low = v; best = [g[1]]; } else if (v === low) best.push(g[1]);
    });
    if (LS.state.caught >= (LS.isJunior() ? 8 : 11)) best.push('tCatch');
    if (LS.state.created) best.push('tDesign');
    if (LS.state.done.puzzle) best.push('tPuzzle');
    return best.length ? LS.rand(best) : 'tStar';
  }

  /* ---------- 4. reward ---------- */
  function reward() {
    where = 'reward';
    LS.setProgress(Object.keys(LS.state.done).length); LS.hush();
    delete document.body.dataset.g;
    var total = LS.state.stars;
    var scr = LS.screen('reward');

    var title = t(rank());
    var side = el('div', 'reward-side');
    var badge = el('div', 'badge');
    badge.appendChild(el('span', 'star', '★'));
    badge.appendChild(el('span', 'name', t('badge')));
    badge.appendChild(el('span', 'ea', 'EMPORIO ARMANI'));
    side.appendChild(badge);
    if (LS.state.design) {
      var mine = el('div', 'my-tee'); mine.appendChild(LS.tee(LS.state.design)); mine.appendChild(el('small', '', t('myDesign')));
      side.appendChild(mine);
    }
    scr.appendChild(side);

    var main = el('div', 'reward-main');
    main.appendChild(el('h1', 'game-title', t('congrats')));
    var rk = el('p', 'rank'); rk.appendChild(el('small', '', t('yourTitle'))); rk.appendChild(el('b', '', '★ ' + title + ' ★'));
    main.appendChild(rk);
    main.appendChild(el('p', 'lead', t('youEarned')));
    var tot = el('div', 'total'), num = el('span', 'n', '0');
    tot.appendChild(num); tot.appendChild(el('span', 's', '★'));
    main.appendChild(tot);

    var sur = el('div', 'surprise');
    sur.appendChild(el('b', '', t('surprise')));
    sur.appendChild(el('small', '', t('surpriseSub')));
    main.appendChild(sur);

    var row = el('div', 'name-row');
    var input = el('input'); input.type = 'text'; input.maxLength = 20; input.placeholder = t('namePh');
    input.setAttribute('autocomplete', 'off'); input.setAttribute('autocapitalize', 'words');
    input.setAttribute('autocorrect', 'off'); input.setAttribute('spellcheck', 'false'); input.id = 'name-input';
    var cb = el('button', 'btn primary', t('seeCert')); cb.type = 'button'; cb.id = 'see-cert';
    cb.addEventListener('click', function () { LS.sfx.tap(); input.blur(); certificate(input.value, total, title); });
    /* optional photo for the certificate: opens the iPad camera, kept in memory only */
    var file = el('input'); file.type = 'file'; file.accept = 'image/*'; file.setAttribute('capture', 'user'); file.id = 'photo-file'; file.hidden = true;
    var pb = el('button', 'btn photo-btn'); pb.type = 'button'; pb.id = 'add-photo';
    var pic = el('span', 'photo-thumb', '📷'), plabel = el('span', '', t('addPhoto'));
    pb.appendChild(pic); pb.appendChild(plabel);
    pb.addEventListener('click', function () { LS.sfx.tap(); file.click(); });
    file.addEventListener('change', function () {
      var f = file.files && file.files[0]; if (!f) return;
      var session = LS.state.session, url = URL.createObjectURL(f), im = new Image();
      im.onload = function () {
        var s = Math.min(im.naturalWidth, im.naturalHeight), c = document.createElement('canvas');
        c.width = c.height = 480;
        c.getContext('2d').drawImage(im, (im.naturalWidth - s) / 2, (im.naturalHeight - s) / 2, s, s, 0, 0, 480, 480);
        URL.revokeObjectURL(url); file.value = '';
        if (session !== LS.state.session) return;
        LS.state.photo = c.toDataURL('image/jpeg', 0.85);
        pic.textContent = ''; pic.style.backgroundImage = 'url(' + LS.state.photo + ')';
        plabel.textContent = t('changePhoto');
        LS.sfx.star();
      };
      im.onerror = function () { URL.revokeObjectURL(url); file.value = ''; };
      im.src = url;
    });
    row.appendChild(input); row.appendChild(pb); row.appendChild(file); row.appendChild(cb);
    main.appendChild(row);
    main.appendChild(el('p', 'hint-text', t('nameHelp')));

    var again = el('div', 'again');
    var pa = el('button', 'btn big', t('playAgain')); pa.type = 'button'; pa.id = 'play-again';
    pa.addEventListener('click', function () { LS.sfx.tap(); journey(); });
    var ns = el('button', 'btn big', t('newStar')); ns.type = 'button'; ns.id = 'new-star';
    ns.addEventListener('click', function () { LS.sfx.tap(); home(); });
    again.appendChild(pa); again.appendChild(ns);
    main.appendChild(again);

    scr.appendChild(main);
    LS.show(scr);
    LS.sfx.win();
    LS.confetti(6500);
    LS.currentPrompt = t('congrats') + ' ' + t('surprise');
    setTimeout(function () { if (where === 'reward') LS.say(LS.currentPrompt); }, 900);

    /* count the stars up */
    var session = LS.state.session, shown = 0;
    (function step() {
      if (session !== LS.state.session) return;
      shown = Math.min(total, shown + Math.max(1, Math.round(total / 30)));
      num.textContent = shown;
      if (shown < total) setTimeout(step, 45);
    })();
  }

  /* ---------- 5. certificate ---------- */
  function certificate(name, total, title) {
    name = (name || '').replace(/[<>]/g, '').trim().slice(0, 20);
    $('#c-name').textContent = name || t('certAnon');
    $('#c-stars').textContent = total + ' ★';
    $('#c-rank').textContent = '★ ' + title + ' ★';
    var slot = $('#c-tee');
    while (slot.firstChild) slot.removeChild(slot.firstChild);
    var ph = $('#c-photo');
    while (ph.firstChild) ph.removeChild(ph.firstChild);
    if (LS.state.photo) { var pi = new Image(); pi.src = LS.state.photo; pi.alt = ''; ph.appendChild(pi); ph.classList.add('has'); }
    else { ph.classList.remove('has'); ph.appendChild(LS.mascot('happy')); }
    if (LS.state.design) slot.appendChild(LS.tee(LS.state.design)); else slot.appendChild(LS.el('span', 'c-bigstar', '★'));
    var locale = LS.state.lang === 'ar' ? 'ar-BH-u-nu-latn' : 'en-GB';
    try { $('#c-date').textContent = new Date().toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { $('#c-date').textContent = new Date().toDateString(); }
    $('#cert').classList.add('on');
  }
  $('#c-print').addEventListener('click', function () { LS.hush(); window.print(); });
  $('#c-back').addEventListener('click', function () { $('#cert').classList.remove('on'); });

  /* ---------- top-bar tools ---------- */
  $('#sound').addEventListener('click', function () {
    LS.state.sound = !LS.state.sound;
    $('#sound').classList.toggle('off', !LS.state.sound);
    if (LS.state.sound) { LS.unlockAudio(); LS.sfx.tap(); } else LS.hush();
  });
  $('#listen').addEventListener('click', function () { LS.unlockAudio(); LS.say(LS.currentPrompt); });

  /* ---------- hidden staff menu: hold the logo ---------- */
  function bindStaffKeys() {
    Array.prototype.forEach.call(document.querySelectorAll('.staff-key'), function (k) {
      if (k._bound) return; k._bound = true;
      var timer = null;
      var stop = function () { clearTimeout(timer); };
      k.addEventListener('pointerdown', function () {
        stop(); timer = setTimeout(function () { $('#staff').classList.add('on'); }, STAFF_HOLD);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { k.addEventListener(ev, stop); });
      k.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    });
  }
  $('#staff-reset').addEventListener('click', home);
  $('#staff-close').addEventListener('click', function () { $('#staff').classList.remove('on'); });
  $('#staff-skip').addEventListener('click', function () {
    if (where === 'home' || where === 'age') { $('#staff').classList.remove('on'); return; }
    LS.state.session++; LS.state.cur = ''; $('#staff').classList.remove('on'); LS.hud(true); reward();
  });
  /* staff: throw away the saved copy and load the newest version from the web */
  $('#staff-update').addEventListener('click', async function () {
    try {
      if ('serviceWorker' in navigator) { var regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(function (r) { return r.unregister(); })); }
      if (window.caches) { var keys = await caches.keys(); await Promise.all(keys.map(function (k) { return caches.delete(k); })); }
    } catch (e) { /* ignore */ }
    location.reload();
  });
  $('#staff-full').addEventListener('click', function () {
    var d = document, e = d.documentElement;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else (e.requestFullscreen || e.webkitRequestFullscreen).call(e);
    } catch (err) { /* not supported on this device: use "Add to Home Screen" instead */ }
    $('#staff').classList.remove('on');
  });

  /* ---------- store event mode: return to welcome when left alone ---------- */
  var lastTouch = Date.now(), askedAt = 0;
  ['pointerdown', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function () { lastTouch = Date.now(); }, true);
  });
  $('#still-yes').addEventListener('click', function () { askedAt = 0; $('#still').classList.remove('on'); });
  $('#still-new').addEventListener('click', function () { askedAt = 0; home(); });
  setInterval(function () {
    var idle = (Date.now() - lastTouch) / 1000;
    if (where === 'home') return;
    if ($('#cert').classList.contains('on') || $('#staff').classList.contains('on')) return;
    if (where === 'reward') { if (idle > IDLE_REWARD) home(); return; }
    if (askedAt) {
      if ((Date.now() - askedAt) / 1000 > IDLE_ASK_WAIT) { askedAt = 0; home(); }
    } else if (idle > IDLE_ASK) {
      askedAt = Date.now(); $('#still').classList.add('on');
    }
  }, 4000);

  /* ---------- keep the iPad from zooming or scrolling the page ---------- */
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
  document.addEventListener('dblclick', function (e) { e.preventDefault(); });
  document.addEventListener('contextmenu', function (e) { if (e.target.tagName !== 'INPUT') e.preventDefault(); });

  /* ---------- offline support (only when opened from a web address) ---------- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }

  /* expose a few things for the staff and for testing */
  LS.hub = hub;
  LS.home = home; LS.journey = journey; LS.reward = reward;

  LS.sky();
  bindStaffKeys();
  home();
})();
