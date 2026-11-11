/* ============================================================
   LITTLE STARS — CORE
   Shared helpers: text, sound, screens, picture cards, stars.
   Nothing here is ever saved: all progress lives in memory only
   and disappears when the game is reset or the page is closed.
   ============================================================ */
(function () {
  'use strict';
  var LS = window.LS;

  LS.state = { lang: 'en', age: 'junior', stars: 0, sound: true, session: 0, name: '', memCount: 6, usedQ: [], usedLooks: [], design: null, stats: {}, cur: '' };
  /* count a slip for the current mini-game (used only to pick a fun title at the end) */
  LS.slip = function (n) { var s = LS.state.stats, k = LS.state.cur; if (k) s[k] = (s[k] || 0) + (n || 1); };
  LS.games = {};
  LS.currentPrompt = '';

  /* ---------- small helpers ---------- */
  LS.$ = function (s) { return document.querySelector(s); };
  LS.t = function (key, vars) {
    var table = LS.TEXT[LS.state.lang] || LS.TEXT.en;
    var s = table[key] != null ? table[key] : (LS.TEXT.en[key] != null ? LS.TEXT.en[key] : key);
    s = s.replace(/\{mascot\}/g, table.mascot || LS.TEXT.en.mascot);
    if (vars) Object.keys(vars).forEach(function (v) { s = s.replace('{' + v + '}', vars[v]); });
    return s;
  };
  LS.el = function (tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  LS.shuffle = function (a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x;
    }
    return a;
  };
  LS.sample = function (a, n) { return LS.shuffle(a).slice(0, n); };
  LS.rand = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  LS.isJunior = function () { return LS.state.age === 'junior'; };

  /* A wait that silently stops if the game was reset in the meantime. */
  LS.wait = function (ms) {
    var s = LS.state.session;
    return new Promise(function (resolve) {
      setTimeout(function () { if (s === LS.state.session) resolve(); }, ms);
    });
  };

  /* ---------- sound (made in the browser, no audio files) ---------- */
  var ctx = null;
  LS.unlockAudio = function () {
    try {
      if (!ctx) {
        var A = window.AudioContext || window.webkitAudioContext;
        if (A) ctx = new A();
      }
      if (ctx && ctx.state === 'suspended') ctx.resume();
    } catch (e) { /* sound is optional */ }
  };
  function tone(freq, start, dur, type, vol) {
    if (!ctx || !LS.state.sound) return;
    try {
      var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + start;
      o.type = type || 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol || 0.15, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + dur + 0.05);
    } catch (e) { /* ignore */ }
  }
  function seq(notes, gap, dur, type, vol) {
    notes.forEach(function (f, i) { tone(f, i * gap, dur, type, vol); });
  }
  LS.sfx = {
    tap:     function () { tone(680, 0, 0.09, 'sine', 0.10); },
    flip:    function () { tone(520, 0, 0.07, 'triangle', 0.08); },
    good:    function () { seq([784, 1175], 0.10, 0.28, 'triangle', 0.14); },
    bad:     function () { seq([310, 250], 0.13, 0.22, 'sine', 0.12); },
    star:    function () { seq([1568, 2093], 0.07, 0.22, 'sine', 0.10); },
    welcome: function () { seq([523, 659, 784, 1047], 0.13, 0.6, 'sine', 0.12); },
    win:     function () {
      seq([523, 659, 784, 1047, 1319, 1568], 0.11, 0.5, 'triangle', 0.13);
      [523, 659, 784].forEach(function (f) { tone(f * 2, 0.75, 1.2, 'sine', 0.08); });
    }
  };

  /* Spoken instructions (uses the iPad's built-in voice, works offline). */
  LS.say = function (text) {
    if (!LS.state.sound || !text || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = LS.state.lang === 'ar' ? 'ar-SA' : 'en-GB';
      u.rate = 0.92; u.pitch = 1.1;
      window.speechSynthesis.speak(u);
    } catch (e) { /* voice is optional */ }
  };
  LS.hush = function () {
    try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  };

  /* ---------- screens ---------- */
  LS.screen = function (cls) { return LS.el('section', 'screen ' + (cls || '')); };
  LS.show = function (node) {
    var stage = LS.$('#stage');
    while (stage.firstChild) stage.removeChild(stage.firstChild);
    stage.appendChild(node);
    stage.scrollTop = 0;
  };
  LS.hud = function (on) { document.body.classList.toggle('hud-on', !!on); };
  LS.setProgress = function (done) {
    var dots = document.querySelectorAll('#progress i');
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('done', i < done);
      dots[i].classList.toggle('now', i === done);
    }
  };
  LS.setPrompt = function (parent, text, quiet) {
    var h = LS.el('h2', 'prompt', text);
    parent.appendChild(h);
    LS.currentPrompt = text;
    if (!quiet && LS.isJunior()) LS.say(text);
    return h;
  };

  /* ---------- picture cards ---------- */
  LS.card = function (id, extra, tag) {
    var c = LS.el(tag || 'button', 'card ' + (extra || ''));
    if (!tag) c.type = 'button';
    c.dataset.id = id;
    var img = new Image();
    img.src = LS.src(id); img.alt = ''; img.draggable = false;
    img.width = 640; img.height = 800;
    c.appendChild(img);
    return c;
  };
  LS.textCard = function (label) {
    var c = LS.el('button', 'card text-card');
    c.type = 'button';
    c.dataset.id = String(label);
    c.appendChild(LS.el('span', '', String(label)));
    return c;
  };

  /* ---------- feedback pill ---------- */
  var fbTimer = null;
  LS.feedback = function (kind) {
    var keys = { good: ['good1', 'good2', 'good3', 'good4'], retry: ['retry1', 'retry2'], free: ['free1', 'free2'] }[kind];
    var box = LS.$('#feedback');
    while (box.firstChild) box.removeChild(box.firstChild);
    box.appendChild(LS.mascot(kind === 'retry' ? 'oops' : 'happy'));
    box.appendChild(LS.el('span', '', LS.t(LS.rand(keys))));
    box.className = 'show ' + kind;
    clearTimeout(fbTimer);
    fbTimer = setTimeout(function () { box.className = ''; }, 1300);
  };

  /* ---------- stars ---------- */
  LS.award = function (n, fromEl) {
    if (!n) return;
    LS.state.stars += n;
    var counter = LS.$('#star-count'), target = LS.$('#stars').getBoundingClientRect();
    var from = fromEl && fromEl.getBoundingClientRect ? fromEl.getBoundingClientRect()
      : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    var sx = from.left + from.width / 2, sy = from.top + from.height / 2;
    var count = Math.min(n, 5);
    for (var i = 0; i < count; i++) {
      (function (i) {
        var s = LS.el('div', 'fly-star'); s.appendChild(LS.eagleMark());
        s.style.left = sx + 'px'; s.style.top = sy + 'px';
        document.body.appendChild(s);
        setTimeout(function () {
          s.style.transform = 'translate(' + (target.left + target.width / 2 - sx) + 'px,' +
            (target.top + target.height / 2 - sy) + 'px) scale(.5) rotate(200deg)';
          s.style.opacity = '.2';
        }, 40 + i * 110);
        setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 900 + i * 110);
      })(i);
    }
    setTimeout(function () {
      counter.textContent = LS.state.stars;
      var w = LS.$('#stars');
      w.classList.remove('bump'); void w.offsetWidth; w.classList.add('bump');
      LS.sfx.star();
    }, 620);
  };

  /* ---------- drag a card onto a drop zone (tap still works) ---------- */
  LS.draggable = function (card, zone, onDrop) {
    var startX, startY, ghost = null, dragging = false, pid = null;
    card.classList.add('draggable');
    card.addEventListener('pointerdown', function (e) {
      if (card.disabled) return;
      pid = e.pointerId; startX = e.clientX; startY = e.clientY; dragging = false;
    });
    card.addEventListener('pointermove', function (e) {
      if (pid !== e.pointerId) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (!dragging && Math.sqrt(dx * dx + dy * dy) > 14) {
        dragging = true;
        try { card.setPointerCapture(pid); } catch (err) { /* ignore */ }
        var r = card.getBoundingClientRect();
        ghost = card.cloneNode(true);
        ghost.className = 'card drag-ghost';
        ghost.style.width = r.width + 'px';
        ghost.style.left = r.left + 'px'; ghost.style.top = r.top + 'px';
        document.body.appendChild(ghost);
        card.classList.add('lifted'); zone.classList.add('drop-ready');
      }
      if (dragging && ghost) ghost.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.05) rotate(-3deg)';
    });
    function end(e) {
      if (pid !== e.pointerId) return;
      pid = null;
      if (!dragging) return;
      var z = zone.getBoundingClientRect();
      var inside = e.clientX >= z.left && e.clientX <= z.right && e.clientY >= z.top && e.clientY <= z.bottom;
      if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
      ghost = null;
      card.classList.remove('lifted'); zone.classList.remove('drop-ready');
      card._justDragged = true;
      setTimeout(function () { card._justDragged = false; dragging = false; }, 60);
      if (inside && e.type === 'pointerup') onDrop();
    }
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', end);
  };

  /* ---------- the "tap the right picture" screen used by every game ----------
     opts: prompt, kicker, sub, options[], correct[] (omit = free choice),
           need (how many correct taps), target (picture to compare with),
           side (panel shown beside the pictures), top (panel shown above),
           dropZone (allow dragging onto it), seconds (bonus timer)
     resolves with { wrong, picked, el, inTime }                               */
  LS.choice = function (o) {
    return new Promise(function (resolve) {
      var scr = LS.screen('choice' + ((o.side || o.target) ? ' with-side' : ''));
      if (o.top) scr.appendChild(o.top);
      if (o.kicker) scr.appendChild(LS.el('div', 'kicker', o.kicker));
      LS.setPrompt(scr, o.prompt);
      if (o.sub) scr.appendChild(LS.el('p', 'sub', o.sub));

      var bar = null, inTime = true, tHandle = null;
      if (o.seconds) {
        bar = LS.el('div', 'timer');
        var fill = LS.el('i'); bar.appendChild(fill); scr.appendChild(bar);
        fill.style.animationDuration = o.seconds + 's';
        tHandle = setTimeout(function () { inTime = false; }, o.seconds * 1000);
      }

      var row = LS.el('div', 'choice-row');
      if (o.target) {
        var wrap = LS.el('div', 'target-wrap');
        var tcard = LS.card(o.target, 'target ' + (o.targetClass || ''), 'div');
        wrap.appendChild(tcard);
        row.appendChild(wrap);
      }
      if (o.side) row.appendChild(o.side);

      var grid = LS.el('div', 'grid n' + o.options.length);
      var wrong = 0, found = 0, locked = false, need = o.need || 1;

      function finish(id, c) {
        locked = true;
        if (o.targetClass) tcard.classList.remove(o.targetClass);   /* reveal the whole picture */
        clearTimeout(tHandle);
        if (bar) bar.classList.add('stopped');
        LS.wait(950).then(function () { resolve({ wrong: wrong, picked: id, el: c, inTime: inTime }); });
      }

      o.options.forEach(function (opt) {
        var isText = typeof opt === 'object';
        var id = isText ? String(opt.label) : opt;
        var c = isText ? LS.textCard(opt.label) : LS.card(id);
        function pick() {
          if (locked || c.classList.contains('good')) return;
          LS.unlockAudio();
          if (!o.correct) {
            c.classList.add('chosen'); LS.sfx.good(); LS.feedback('free'); finish(id, c);
          } else if (o.correct.indexOf(id) >= 0) {
            c.classList.add('good'); found++; LS.sfx.good();
            if (found >= need) { LS.feedback('good'); finish(id, c); }
          } else {
            wrong++; LS.slip();
            c.classList.add('bad'); LS.sfx.bad(); LS.feedback('retry');
            setTimeout(function () { c.classList.remove('bad'); c.classList.add('tried'); }, 650);
            if (wrong >= 2) {              /* gentle hint after two tries */
              Array.prototype.forEach.call(grid.children, function (k) {
                if (o.correct.indexOf(k.dataset.id) >= 0 && !k.classList.contains('good')) k.classList.add('hint');
              });
            }
          }
        }
        c.addEventListener('click', function () { if (!c._justDragged) pick(); });
        if (o.dropZone) LS.draggable(c, o.dropZone, pick);
        grid.appendChild(c);
      });

      row.appendChild(grid);
      scr.appendChild(row);
      LS.show(scr);
    });
  };

  /* Stars for an answer: 2 for first try, 1 after that. */
  LS.score = function (res, bonus) {
    LS.award((res.wrong === 0 ? 2 : 1) + (bonus || 0), res.el);
  };

  /* ---------- game intro ---------- */
  LS.intro = function (n, fan, extra) {
    return new Promise(function (resolve) {
      document.body.dataset.g = n;
      var scr = LS.screen('intro');
      var deck = LS.el('div', 'fan');
      fan.forEach(function (id) { deck.appendChild(LS.card(id, '', 'div')); });
      scr.appendChild(deck);
      var txt = LS.el('div', 'intro-text');
      txt.appendChild(LS.el('h1', 'game-title', LS.t('g' + n)));
      txt.appendChild(LS.guide(LS.t('g' + n + 'Intro')));
      if (extra) txt.appendChild(extra);
      var b = LS.el('button', 'btn primary big', LS.t('play'));
      b.type = 'button';
      b.addEventListener('click', function () { LS.unlockAudio(); LS.sfx.tap(); LS.hush(); resolve(); });
      txt.appendChild(b);
      scr.appendChild(txt);
      LS.currentPrompt = LS.t('g' + n) + '. ' + LS.t('g' + n + 'Intro');
      LS.show(scr);
      LS.say(LS.currentPrompt);
    });
  };

  /* ---------- "well done" between games ---------- */
  LS.gameDone = function (bonus) {
    var scr = LS.screen('done');
    var burst = LS.mascot('happy', 'cheer');
    scr.appendChild(burst);
    scr.appendChild(LS.el('h1', 'game-title', LS.t('gameDone')));
    scr.appendChild(LS.fill(LS.el('p', 'lead'), '+' + bonus + ' ★'));
    LS.show(scr);
    LS.sfx.good();
    LS.award(bonus, burst);
    return LS.wait(1700);
  };

  /* ---------- background stars ---------- */
  LS.sky = function () {
    var sky = LS.$('#sky');
    for (var i = 0; i < 46; i++) {
      var s = LS.el('i', i % 4 === 0 ? 'big' : '');
      if (i % 4 === 0) s.style.background = ['#ffd23f', '#ff8fc7', '#4cc9f0', '#3ddc97', '#a78bfa'][(i / 4) % 5];
      s.style.left = (Math.random() * 100) + '%';
      s.style.top = (Math.random() * 100) + '%';
      s.style.animationDelay = (-Math.random() * 6) + 's';
      s.style.animationDuration = (3 + Math.random() * 4) + 's';
      sky.appendChild(s);
    }
  };

  /* ---------- the eagle in any colour, for drawing on a canvas ---------- */
  var EAG = new Image(), EAG_OK = false, tints = {};
  EAG.onload = function () { EAG_OK = true; };
  EAG.src = 'assets/logo/eagle.png';
  LS.tintedEagle = function (col) {
    if (!EAG_OK) return null;
    if (!tints[col]) {
      var c = document.createElement('canvas'); c.width = 128; c.height = 74;
      var x = c.getContext('2d'); x.drawImage(EAG, 0, 0, 128, 74);
      x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, 128, 74);
      tints[col] = c;
    }
    return tints[col];
  };

  /* ---------- confetti (light, canvas based) ---------- */
  LS.confetti = function (ms) {
    var c = LS.$('#confetti'), g = c.getContext('2d'), session = LS.state.session;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = c.width = window.innerWidth * dpr, H = c.height = window.innerHeight * dpr;
    var colours = ['#ffd23f', '#ff6b6b', '#ff8fc7', '#4cc9f0', '#3ddc97', '#a78bfa', '#ffffff'];
    var parts = [];
    for (var i = 0; i < 80; i++) {
      parts.push({ x: Math.random() * W, y: -Math.random() * H, r: (5 + Math.random() * 8) * dpr,
        vy: (2 + Math.random() * 3.5) * dpr, vx: (Math.random() - 0.5) * 1.6 * dpr,
        a: Math.random() * 6.28, va: (Math.random() - 0.5) * 0.2, col: LS.rand(colours), star: false });   /* paper confetti only, no icons */
    }
    var end = Date.now() + ms;
    c.style.display = 'block';
    function star(x, y, r, a, col) {
      var img = null;          /* confetti uses stars (set to LS.tintedEagle(col) for eagles) */
      if (img) {
        g.save(); g.translate(x, y); g.rotate(a * 0.3);
        g.drawImage(img, -r * 1.4, -r * 0.8, r * 2.8, r * 1.6);
        g.restore(); return;
      }
      g.beginPath();
      for (var k = 0; k < 10; k++) {
        var rad = k % 2 ? r * 0.45 : r, ang = a + k * Math.PI / 5;
        g.lineTo(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad);
      }
      g.closePath(); g.fill();
    }
    function frame() {
      g.clearRect(0, 0, W, H);
      if (session !== LS.state.session || Date.now() > end) { c.style.display = 'none'; return; }
      var fade = Math.min(1, (end - Date.now()) / 800);
      g.globalAlpha = fade;
      parts.forEach(function (p) {
        p.y += p.vy; p.x += p.vx; p.a += p.va;
        if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
        g.fillStyle = p.col;
        if (p.star) star(p.x, p.y, p.r, p.a, p.col);
        else { g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); g.restore(); }
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };
})();
