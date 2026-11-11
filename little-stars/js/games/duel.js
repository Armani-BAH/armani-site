/* ============================================================
   CHALLENGE A FRIEND — two players on one iPad
   Player 1 = Pink Star (left / top), Player 2 = Blue Star (right / bottom).
   Seven games: Star Catch Duel, Memory Duel, Quick Tap Quiz, Style Face-Off,
   Tug of War, Copy the Look, XO.
   Both players always get stars, so nobody leaves empty-handed.
   Wins are counted for this visit only and erased for the next child.
   ============================================================ */
(function () {
  'use strict';
  var LS = window.LS, t = LS.t, el = LS.el;
  var D = LS.duel = { wins: [0, 0, 0], xoStart: 1, face: true, col: [null, null, null] };   /* wins[0] = ties; face = players sit opposite each other; col = colour each player picked */

  /* the colours children can pick: main, light, dark, text */
  var PALETTE = {
    blue:   ['#3aa8e8', '#7ad9f7', '#2a7fb8', '#fff'],
    green:  ['#2fbf7a', '#7df0bd', '#1e8f58', '#fff'],
    orange: ['#ff8c1a', '#ffc985', '#c96a0a', '#fff'],
    purple: ['#8b6cf0', '#cdbcff', '#6447c9', '#fff'],
    pink:   ['#ff5fa2', '#ffa3d1', '#c2357a', '#fff'],
    yellow: ['#ffc21f', '#ffe680', '#c99400', '#3a2a00'],
    red:    ['#ff4d4d', '#ff9e9e', '#c22e2e', '#fff'],
    teal:   ['#1fb5a8', '#7fe3d8', '#13877d', '#fff']
  };
  function applyColours() {
    var r = document.documentElement.style;
    [1, 2].forEach(function (p) {
      var c = PALETTE[D.col[p] || (p === 1 ? 'blue' : 'green')];
      r.setProperty('--c' + p, c[0]); r.setProperty('--c' + p + 'l', c[1]); r.setProperty('--c' + p + 'd', c[2]);
      r.setProperty('--c' + p + 'ink', c[3]); r.setProperty('--c' + p + 't', c[0] + '3a'); r.setProperty('--c' + p + 'b', c[0] + '88');
    });
  }
  D.reset = function () { D.wins = [0, 0, 0]; D.xoStart = 1; D.col = [null, null, null]; D.nm = [null, '', '']; applyColours(); };
  D.nm = [null, '', ''];
  var PLAY = {};

  var GAMES = [
    ['catch', 'dCatch', 'EAGLE'], ['memory', 'dMemory', '🃏'], ['quiz', 'dQuiz', '⚡'], ['style', 'dStyle', '👗'],
    ['tug', 'dTug', '💪'], ['copy', 'dCopy', '👀'], ['xo', 'dXO', '✖️⭕'], ['puzzle', 'dPuzzle', '🧩']
  ];
  var TOPS = ['green-tee', 'navy-tee', 'peach-tee', 'white-tee', 'varsity-tee', 'green-hoodie', 'burgundy-hoodie', 'pink-cardigan',
    'pattern-sweatshirt', 'beige-pullover', 'varsity-jacket', 'pattern-puffer', 'check-jacket', 'navy-blazer', 'pink-jacket',
    'check-dress', 'navy-dress', 'green-dress', 'pink-dress', 'peach-dress'];
  var EXTRA = ['backpack', 'cap', 'pink-bag', 'navy-beanie', 'pink-beret', 'cream-bag', 'beige-beanie', 'socks'];
  var MEM = ['varsity-tee', 'pattern-puffer', 'check-dress', 'blue-sneakers', 'cap', 'backpack', 'jeans', 'pink-bag',
    'check-jacket', 'green-hoodie', 'black-boots', 'pink-skirt', 'burgundy-hoodie', 'navy-blazer', 'silver-ballet', 'socks'];

  /* ---------- small helpers ---------- */
  function alive(s) { return s === LS.state.session; }
  function name(p) { if (D.nm && D.nm[p]) return D.nm[p]; return t('starName', { c: t('col_' + (D.col[p] || (p === 1 ? 'blue' : 'green'))) }); }
  function winner(a, b) { return a > b ? 1 : b > a ? 2 : 0; }
  function btn(cls, text, fn, id) {
    var b = el('button', cls, text); b.type = 'button'; if (id) b.id = id;
    b.addEventListener('click', function () { LS.unlockAudio(); LS.sfx.tap(); fn(); });
    return b;
  }
  /* fast, multi-touch friendly tap (two children can press at the same moment) */
  function onTap(node, fn) {
    node.addEventListener('pointerdown', function (e) { e.preventDefault(); LS.unlockAudio(); fn(e); });
  }
  function chip(p) {
    var c = el('div', 'chip p' + p);
    var cb = el('b'); cb.appendChild(LS.eagleMark('cur')); c.appendChild(cb); c.appendChild(el('span', '', name(p)));
    return c;
  }
  function scoreboard() {
    var s = el('div', 'scoreboard');
    [1, 2].forEach(function (p) {
      var g = el('div', 'sb');
      g.appendChild(chip(p)); g.appendChild(el('span', 'n', '🏆 ' + D.wins[p]));
      s.appendChild(g);
    });
    return s;
  }
  function timerBar(secs) {
    var b = el('div', 'timer'), i = el('i'); i.style.animationDuration = secs + 's'; b.appendChild(i);
    return b;
  }
  function faceCls() { return D.face ? ' face' : ''; }
  /* the instruction: shown once in the middle, or once per player when sitting face to face */
  function title(A, text) {
    if (!A._tp) {
      A._tp = el('h2', 'prompt'); A.top.insertBefore(A._tp, A.top.firstChild);
      A._ht = [null, el('p', 'half-title'), el('p', 'half-title')];
      A.h[1].insertBefore(A._ht[1], A.h[1].firstChild); A.h[2].insertBefore(A._ht[2], A.h[2].firstChild);
    }
    A._tp.textContent = A._ht[1].textContent = A._ht[2].textContent = text;
    LS.currentPrompt = text;
  }
  function mirror(text) { return el('p', 'mirror-title', text); }
  function arena(cls) {
    var scr = LS.screen('duel ' + cls + faceCls());
    var top = el('div', 'duel-top');
    var a = el('div', 'arena');
    var h1 = el('div', 'half p1'), h2 = el('div', 'half p2');
    a.appendChild(h1); a.appendChild(h2);
    scr.appendChild(top); scr.appendChild(a);
    return { scr: scr, top: top, a: a, h: [null, h1, h2] };
  }
  function head(half, p) {
    var hd = el('div', 'half-head');
    hd.appendChild(chip(p));
    var sc = el('span', 'half-score', '0');
    hd.appendChild(sc); half.appendChild(hd);
    return sc;
  }
  function side(p, mark) {
    var s = el('div', 'pside p' + p);
    s.appendChild(chip(p));
    if (mark) s.appendChild(mark);
    var sc = el('span', 'big-score', '0'); s.appendChild(sc);
    s.appendChild(el('span', 'turn', t('turn')));
    s._score = sc;
    return s;
  }
  function art(g, cls) {
    var d = el('span', 'dart' + (cls ? ' ' + cls : ''));
    if (g[2] === 'EAGLE') d.appendChild(LS.eagle('', ['#ffd23f', '#ff6fb5'])); else d.textContent = g[2];
    return d;
  }
  function find(key) { return GAMES.filter(function (g) { return g[0] === key; })[0]; }

  function countdown() {
    var s = LS.state.session, o = el('div', 'count' + faceCls());
    var top = el('span', 'c-top'), bot = el('span', 'c-bot');
    o.appendChild(top); o.appendChild(bot);
    document.body.appendChild(o);
    var steps = ['3', '2', '1', t('go')], i = 0;
    return new Promise(function (res) {
      (function next() {
        if (!alive(s)) { if (o.parentNode) o.parentNode.removeChild(o); return; }
        if (i === steps.length) { o.parentNode.removeChild(o); res(); return; }
        top.textContent = bot.textContent = steps[i];
        o.classList.remove('pop'); void o.offsetWidth; o.classList.add('pop');
        if (i === 3) LS.sfx.good(); else LS.sfx.tap();
        i++;
        setTimeout(next, i === 4 ? 550 : 750);
      })();
    });
  }

  /* a model figure showing a look (top / bottom / shoes / extra) */
  function figure(look) {
    var fig = el('div', 'figure'), imgs = {};
    fig.appendChild(LS.mascot('happy', 'head'));
    ['bottom', 'top', 'shoes', 'extra'].forEach(function (k) {
      var i = new Image(); i.alt = ''; i.className = 'part p-' + k; i.draggable = false;
      fig.appendChild(i); imgs[k] = i;
    });
    function set(lk, only) {
      Object.keys(imgs).forEach(function (k) {
        if (!lk[k]) { imgs[k].style.display = 'none'; return; }
        imgs[k].style.display = '';
        if (only && only !== k) return;
        imgs[k].src = LS.src(lk[k]);
        imgs[k].classList.remove('swap'); void imgs[k].offsetWidth; imgs[k].classList.add('swap');
      });
      fig.classList.toggle('dress', !!lk.top && LS.ITEMS[lk.top].cat === 'dresses');
    }
    set(look);
    return { el: fig, set: set };
  }

  /* a figure with arrows to change each piece */
  function dresser(half, lists, start) {
    var parts = Object.keys(lists), idx = {}, locked = false, lines = {};
    parts.forEach(function (k) {
      idx[k] = start && start[k] != null ? start[k] : Math.floor(Math.random() * lists[k].length);
    });
    function cur(k) { return lists[k][idx[k]]; }
    function look() { var o = {}; parts.forEach(function (k) { o[k] = cur(k); }); return o; }
    var wrap = el('div', 'mini');
    var fig = figure(look());
    var ctrl = el('div', 'mini-ctrl');
    function sync() {
      if (lines.bottom) lines.bottom.classList.toggle('off', LS.ITEMS[cur('top')].cat === 'dresses');
    }
    parts.forEach(function (k) {
      var line = el('div', 'mix-line l-' + k);
      var prev = el('button', 'arrow', '‹'), next = el('button', 'arrow', '›');
      prev.type = next.type = 'button'; prev.dataset.d = '-1'; next.dataset.d = '1';
      var mid = el('span', 'mix-mid'), th = new Image(); th.alt = ''; th.src = LS.src(cur(k)); mid.appendChild(th);
      function step(d) {
        if (locked) return;
        idx[k] = (idx[k] + d + lists[k].length) % lists[k].length;
        th.src = LS.src(cur(k)); LS.sfx.flip(); fig.set(look(), k); sync();
      }
      onTap(prev, function () { step(-1); });
      onTap(next, function () { step(1); });
      line.appendChild(prev); line.appendChild(mid); line.appendChild(next);
      lines[k] = line; ctrl.appendChild(line);
    });
    wrap.appendChild(fig.el); wrap.appendChild(ctrl);
    half.appendChild(wrap);
    sync();
    return {
      wrap: wrap, look: look,
      lock: function () { locked = true; wrap.classList.add('locked'); }
    };
  }

  /* ============================================================
     PLAYERS: how they sit, and each child picks a colour
     ============================================================ */
  function seatPicker(onChange) {
    var seat = el('div', 'seat');
    seat.appendChild(el('span', 'seat-label', t('seatTitle')));
    [['face', '🔄', 'seatFace'], ['side', '👫', 'seatSide']].forEach(function (o) {
      var b = el('button', 'seat-btn' + ((o[0] === 'face') === D.face ? ' on' : '')); b.type = 'button'; b.dataset.seat = o[0];
      b.appendChild(el('span', 'seat-ico', o[1])); b.appendChild(el('span', '', t(o[2])));
      b.addEventListener('click', function () { LS.sfx.tap(); D.face = o[0] === 'face'; onChange(); });
      seat.appendChild(b);
    });
    return seat;
  }
  function players() {
    LS.state.session++; LS.state.cur = ''; LS.hush();
    document.body.dataset.g = '8';
    var scr = LS.screen('duel-setup' + faceCls());
    scr.appendChild(LS.guide(t('pickColour'), 'big'));
    scr.appendChild(seatPicker(players));
    var row = el('div', 'pick-players'), boxes = [null];
    var go = el('button', 'btn primary big', t('letsPlay')); go.type = 'button'; go.id = 'players-go';
    function refresh() {
      [1, 2].forEach(function (p) {
        var other = D.col[p === 1 ? 2 : 1];
        boxes[p].classList.toggle('picked', !!D.col[p]);
        boxes[p]._name.textContent = D.col[p] || D.nm[p] ? name(p) : t('player', { n: p });
        Array.prototype.forEach.call(boxes[p]._sw.children, function (b) {
          b.classList.toggle('on', b.dataset.c === D.col[p]);
          b.disabled = b.dataset.c === other;
        });
      });
      go.disabled = !(D.col[1] && D.col[2]);
    }
    [1, 2].forEach(function (p) {
      var box = el('div', 'pp p' + p);
      var ps = el('span', 'pp-star'); ps.appendChild(LS.eagleMark('cur')); box.appendChild(ps);
      box._name = el('b', 'pp-name'); box.appendChild(box._name);
      box._sw = el('div', 'pp-swatches');
      Object.keys(PALETTE).forEach(function (k) {
        var b = el('button', 'cswatch'); b.type = 'button'; b.dataset.c = k; b.style.background = PALETTE[k][0];
        b.setAttribute('aria-label', t('col_' + k));
        onTap(b, function () { if (b.disabled) return; D.col[p] = k; applyColours(); LS.sfx.star(); refresh(); });
        box._sw.appendChild(b);
      });
      box.appendChild(box._sw);
      /* optional first name, used only during the game and never saved */
      var nm = el('input', 'pp-input'); nm.type = 'text'; nm.maxLength = 12; nm.placeholder = t('yourName'); nm.value = D.nm[p] || '';
      nm.setAttribute('autocomplete', 'off'); nm.setAttribute('autocorrect', 'off'); nm.setAttribute('spellcheck', 'false'); nm.setAttribute('autocapitalize', 'words');
      nm.addEventListener('input', function () { D.nm[p] = nm.value.replace(/[<>]/g, '').trim(); refresh(); });
      box.appendChild(nm);
      boxes.push(box); row.appendChild(box);
    });
    scr.appendChild(row);
    scr.appendChild(el('p', 'hint-text', t('namesNote')));
    go.addEventListener('click', function () { if (go.disabled) return; LS.unlockAudio(); LS.sfx.welcome(); LS.duelHub(); });
    scr.appendChild(go);
    applyColours(); refresh();
    LS.currentPrompt = t('pickColour');
    LS.show(scr);
    LS.say(LS.currentPrompt);
  }

  /* ============================================================
     DUEL MENU
     ============================================================ */
  LS.duelHub = function () {
    if (!D.col[1] || !D.col[2]) return players();
    LS.state.session++;                 /* stop anything still running */
    LS.state.cur = ''; LS.hush();
    document.body.dataset.g = '8';
    applyColours();
    var scr = LS.screen('duel-hub');
    scr.appendChild(LS.guide(t('duelPick'), 'big'));
    var sbRow = el('div', 'sb-row');
    sbRow.appendChild(scoreboard());
    sbRow.appendChild(btn('btn change-btn', '✎  ' + t('changePlayers'), players, 'change-players'));
    scr.appendChild(sbRow);
    var grid = el('div', 'duel-grid');
    GAMES.forEach(function (g, i) {
      var b = el('button', 'dcard d' + (i + 1)); b.type = 'button'; b.dataset.duel = g[0];
      b.appendChild(art(g));
      b.appendChild(el('span', 'gname', t(g[1])));
      b.addEventListener('click', function () { LS.unlockAudio(); LS.sfx.tap(); run(g[0]); });
      grid.appendChild(b);
    });
    scr.appendChild(grid);
    scr.appendChild(btn('btn', '‹  ' + t('backGames'), function () { LS.hub(); }, 'duel-back'));
    LS.currentPrompt = t('duelPick');
    LS.show(scr);
    LS.say(LS.currentPrompt);
  };

  async function run(key) {
    LS.state.session++;
    var s = LS.state.session;
    await intro(key);
    if (!alive(s)) return;
    var w = await PLAY[key]();
    if (!alive(s)) return;
    result(w, key);
  }

  function intro(key) {
    return new Promise(function (res) {
      var g = find(key), scr = LS.screen('duel-intro' + faceCls());
      if (D.face) scr.appendChild(mirror(t(g[1]) + ' · ' + t(g[1] + 'How')));
      scr.appendChild(el('div', 'kicker', t('duel')));
      scr.appendChild(art(g, 'big'));
      scr.appendChild(el('h1', 'game-title', t(g[1])));
      scr.appendChild(LS.guide(t(g[1] + 'How')));
      var vs = el('div', 'vs');
      vs.appendChild(chip(1)); vs.appendChild(el('span', 'vs-x', 'VS')); vs.appendChild(chip(2));
      scr.appendChild(vs);
      scr.appendChild(btn('btn primary big', t('play'), function () { LS.hush(); res(); }, 'duel-play'));
      LS.currentPrompt = t(g[1] + 'How');
      LS.show(scr);
      LS.say(LS.currentPrompt);
    });
  }

  function result(w, key) {
    D.wins[w]++;
    var scr = LS.screen('duel-result' + faceCls());
    var title;
    if (w) {
      var big = el('div', 'winner p' + w);
      big.appendChild(el('span', 'crown', '👑'));
      var wb = el('b'); wb.appendChild(LS.eagleMark('cur')); big.appendChild(wb);
      scr.appendChild(big);
      title = t('winsP', { p: name(w) });
    } else {
      var two = el('div', 'tie-stars');
      var t1 = el('b', 'p1'), t2 = el('b', 'p2'); t1.appendChild(LS.eagleMark('cur')); t2.appendChild(LS.eagleMark('cur')); two.appendChild(t1); two.appendChild(t2);
      scr.appendChild(two);
      title = t('tie');
    }
    if (D.face) scr.insertBefore(mirror(title), scr.firstChild);
    scr.appendChild(el('h1', 'game-title', title));
    scr.appendChild(LS.fill(el('p', 'lead'), t('bothStars')));
    scr.appendChild(scoreboard());
    var acts = el('div', 'duel-actions');
    acts.appendChild(btn('btn primary big', t('rematch'), function () { run(key); }, 'duel-again'));
    acts.appendChild(btn('btn big', t('another'), function () { LS.duelHub(); }, 'duel-another'));
    acts.appendChild(btn('btn big', t('backGames'), function () { LS.hub(); }, 'duel-home'));
    scr.appendChild(acts);
    LS.currentPrompt = title;
    LS.show(scr);
    LS.sfx.win();
    LS.confetti(3500);
    LS.award(3);
    LS.say(title);
  }

  /* ============================================================
     1. STAR CATCH DUEL — same falling stars on both sides
     ============================================================ */
  PLAY['catch'] = function () {
    return new Promise(async function (res) {
      var s = LS.state.session, secs = LS.isJunior() ? 18 : 20;
      var A = arena('dcatch');
      var sc = [null, head(A.h[1], 1), head(A.h[2], 2)], F = [null];
      [1, 2].forEach(function (p) {
        var f = el('div', 'field'), bag = el('div', 'bag');
        bag.appendChild(LS.mascot('happy')); var bb = el('span', 'bag-body'); bb.appendChild(LS.eagleMark('cur')); bag.appendChild(bb);
        f.appendChild(bag); A.h[p].appendChild(f);
        var o = { f: f, bag: bag, x: 0.5, items: [], score: 0 };
        var flipped = D.face && p === 2;          /* the top half is upside down */
        function steer(e) {
          var r = f.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width;
          o.x = Math.max(0.1, Math.min(0.9, flipped ? 1 - fx : fx));
          bag.style.left = (o.x * 100) + '%';
        }
        f.addEventListener('pointerdown', function (e) { LS.unlockAudio(); steer(e); });
        f.addEventListener('pointermove', steer);
        F.push(o);
      });
      title(A, t('dCatch'));
      LS.show(A.scr);
      await countdown();
      if (!alive(s)) return;
      A.top.appendChild(timerBar(secs));

      function spawn() {
        var r = Math.random(), kind = r < 0.14 ? 'cloud' : r < 0.27 ? 'gold' : 'star';
        var x = 0.1 + Math.random() * 0.8, v = 0.3 + Math.random() * 0.12, col = LS.rand([['#ff5fa2', '#ffb3da'], ['#3aa8e8', '#8fe0fa'], ['#2fbf7a', '#7df0bd'], ['#8b6cf0', '#cdbcff'], ['#ff8c1a', '#ffd23f'], ['#1fb5a8', '#7fe3d8']]);
        [1, 2].forEach(function (p) {
          var n = el('span', 'drop' + (kind !== 'star' ? ' ' + kind : ''), kind === 'cloud' ? '☁' : null);
          if (kind !== 'cloud') n.appendChild(LS.eagle(kind === 'gold' ? 'gold' : '', col));
          n.style.left = (x * 100) + '%';
          F[p].f.appendChild(n);
          F[p].items.push({ n: n, x: x, y: -0.1, v: v, kind: kind });
        });
      }
      function wobble(bag, cls) { bag.classList.remove('yum', 'wet'); void bag.offsetWidth; bag.classList.add(cls); }

      var t0 = null, last = 0, lastSpawn = 0, ended = false;
      function frame(now) {
        if (!alive(s) || !A.scr.isConnected) return;
        if (t0 === null) { t0 = now; last = now; }
        var dt = Math.min(0.05, (now - last) / 1000), el2 = (now - t0) / 1000; last = now;
        if (el2 < secs && now - lastSpawn > 520) { lastSpawn = now; spawn(); }
        var empty = true;
        [1, 2].forEach(function (p) {
          var o = F[p], r = o.f.getBoundingClientRect(), br = o.bag.getBoundingClientRect();
          var hitR = br.width / r.width * 0.5;
          for (var i = o.items.length - 1; i >= 0; i--) {
            var it = o.items[i];
            it.y += it.v * dt;
            it.n.style.transform = 'translate(-50%, ' + (it.y * r.height) + 'px)';
            var hit = it.y > 0.74 && it.y < 0.93 && Math.abs(it.x - o.x) < hitR;
            if (hit) {
              if (it.kind === 'cloud') { wobble(o.bag, 'wet'); }
              else { o.score += it.kind === 'gold' ? 3 : 1; sc[p].textContent = o.score; LS.sfx.star(); wobble(o.bag, 'yum'); }
            }
            if (hit || it.y > 1.1) { o.f.removeChild(it.n); o.items.splice(i, 1); }
          }
          if (o.items.length) empty = false;
        });
        A.h[1].classList.toggle('ahead', F[1].score > F[2].score);
        A.h[2].classList.toggle('ahead', F[2].score > F[1].score);
        if (el2 >= secs && empty && !ended) {
          ended = true;
          LS.wait(900).then(function () { res(winner(F[1].score, F[2].score)); });
          return;
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  };

  /* ============================================================
     2. MEMORY DUEL — take turns on one board
     ============================================================ */
  PLAY.memory = function () {
    return new Promise(function (res) {
      var s = LS.state.session, pairs = 6, ids = LS.sample(MEM, pairs), deck = LS.shuffle(ids.concat(ids));
      var scr = LS.screen('duel dmemory' + faceCls());
      scr.appendChild(el('div', 'duel-top')).appendChild(el('h2', 'prompt', t('dMemory')));
      var a = el('div', 'arena three');
      var S = [null, side(1), side(2)], score = [0, 0, 0], turn = 1;
      var center = el('div', 'center'), grid = el('div', 'mem-grid m12');
      center.appendChild(grid);
      a.appendChild(S[1]); a.appendChild(center); a.appendChild(S[2]);
      scr.appendChild(a);
      function setTurn(p) { turn = p; S[1].classList.toggle('on', p === 1); S[2].classList.toggle('on', p === 2); }
      var open = [], found = 0, busy = false;
      deck.forEach(function (id) {
        var c = el('button', 'mcard'); c.type = 'button'; c.dataset.id = id;
        var inner = el('span', 'inner');
        var bk = el('span', 'side back'); bk.appendChild(LS.eagleMark('cur')); inner.appendChild(bk);
        var face = el('span', 'side face');
        var img = new Image(); img.src = LS.src(id); img.alt = ''; img.draggable = false;
        face.appendChild(img); inner.appendChild(face); c.appendChild(inner);
        onTap(c, function () {
          if (busy || c.classList.contains('open') || c.classList.contains('matched')) return;
          LS.sfx.flip(); c.classList.add('open'); open.push(c);
          if (open.length < 2) return;
          busy = true;
          var x = open[0], y = open[1]; open = [];
          if (x.dataset.id === y.dataset.id) {
            setTimeout(function () {
              if (!alive(s)) return;
              x.classList.add('matched', 'by' + turn); y.classList.add('matched', 'by' + turn);
              score[turn]++; S[turn]._score.textContent = score[turn];
              found++; LS.sfx.good(); busy = false;
              if (found === pairs) LS.wait(1000).then(function () { res(winner(score[1], score[2])); });
            }, 380);
          } else {
            setTimeout(function () { x.classList.add('nope'); y.classList.add('nope'); LS.sfx.bad(); }, 380);
            setTimeout(function () {
              if (!alive(s)) return;
              x.classList.remove('open', 'nope'); y.classList.remove('open', 'nope');
              busy = false; setTurn(turn === 1 ? 2 : 1);
            }, 1100);
          }
        });
        grid.appendChild(c);
      });
      setTurn(1);
      LS.show(scr);
    });
  };

  /* ============================================================
     3. QUICK TAP QUIZ — first correct tap wins the round
     ============================================================ */
  PLAY.quiz = function () {
    return new Promise(async function (res) {
      var s = LS.state.session, rounds = 5;
      var keys = LS.sample(['jacket', 'shoes', 'hat', 'bag', 'dress', 'sunny', 'cold', 'same', 'eagle'], rounds);
      var A = arena('dquiz');
      var kick = el('div', 'kicker'), qrow = el('div', 'dq-top');
      A.top.appendChild(kick); A.top.appendChild(qrow);
      var sc = [null, head(A.h[1], 1), head(A.h[2], 2)], score = [0, 0, 0];
      var G = [null, el('div', 'dq-grid'), el('div', 'dq-grid')];
      A.h[1].appendChild(G[1]); A.h[2].appendChild(G[2]);
      title(A, t('dQuiz'));
      LS.show(A.scr);
      await countdown();

      for (var r = 0; r < rounds; r++) {
        if (!alive(s)) return;
        var q = LS.QUIZ_BANK[keys[r]](), set = [q.correct[0]].concat(LS.sample(q.others, 3));
        kick.textContent = t('round', { n: r + 1, t: rounds });
        title(A, t(q.prompt));
        while (qrow.firstChild) qrow.removeChild(qrow.firstChild);
        if (q.target) qrow.appendChild(LS.card(q.target, 'target', 'div'));
        await new Promise(function (next) {
          var done = false, frozen = [false, false, false];
          var timeout = setTimeout(function () { finish(0); }, 12000);
          function finish(p) {
            if (done) return;
            done = true; clearTimeout(timeout);
            [1, 2].forEach(function (k) {
              Array.prototype.forEach.call(G[k].children, function (c) {
                if (c.dataset.id === q.correct[0] && !c.classList.contains('good')) c.classList.add('hint');
              });
            });
            if (p) {
              score[p]++; sc[p].textContent = score[p];
              A.h[p].classList.add('win'); LS.sfx.good();
            }
            LS.wait(1400).then(function () { A.h[1].classList.remove('win'); A.h[2].classList.remove('win'); next(); });
          }
          [1, 2].forEach(function (p) {
            while (G[p].firstChild) G[p].removeChild(G[p].firstChild);
            A.h[p].classList.remove('frozen');
            LS.shuffle(set).forEach(function (id) {
              var c = LS.card(id);
              onTap(c, function () {
                if (done || frozen[p]) return;
                if (id === q.correct[0]) { c.classList.add('good'); finish(p); }
                else {
                  c.classList.add('bad'); LS.sfx.bad(); frozen[p] = true; A.h[p].classList.add('frozen');
                  setTimeout(function () { c.classList.remove('bad'); c.classList.add('tried'); frozen[p] = false; A.h[p].classList.remove('frozen'); }, 1200);
                }
              });
              G[p].appendChild(c);
            });
          });
        });
      }
      if (alive(s)) res(winner(score[1], score[2]));
    });
  };

  /* ============================================================
     4. STYLE FACE-OFF — dress your model, the fans choose
     ============================================================ */
  PLAY.style = function () {
    return new Promise(async function (res) {
      var s = LS.state.session, secs = LS.isJunior() ? 40 : 30;
      var A = arena('dstyle');
      var lists = LS.figureLists();
      var M = [null], ready = [false, false, false], ended = false, finishNow;
      [1, 2].forEach(function (p) {
        var hd = el('div', 'half-head'); hd.appendChild(chip(p)); A.h[p].appendChild(hd);
        M.push(dresser(A.h[p], lists));
        var rb = el('button', 'btn primary ready-btn', '✓  ' + t('ready')); rb.type = 'button';
        onTap(rb, function () {
          if (ready[p] || ended) return;
          ready[p] = true; rb.disabled = true; LS.sfx.good(); A.h[p].classList.add('done');
          if (ready[1] && ready[2] && finishNow) finishNow();
        });
        A.h[p].appendChild(rb);
      });
      title(A, t('dStyle'));
      LS.show(A.scr);
      await countdown();
      if (!alive(s)) return;
      A.top.appendChild(timerBar(secs));
      await new Promise(function (go) { finishNow = go; setTimeout(go, secs * 1000); });
      if (!alive(s) || ended) return;
      ended = true;
      LS.sfx.win();
      title(A, t('fans'));
      while (A.top.children.length > 1) A.top.removeChild(A.top.lastChild);
      [1, 2].forEach(function (p) {
        M[p].lock();
        var rb = A.h[p].querySelector('.ready-btn'); if (rb) rb.parentNode.removeChild(rb);
        A.h[p].classList.remove('done');
      });
      LS.currentPrompt = t('fans'); LS.say(LS.currentPrompt);
      var picked = false;
      function vote(w) { if (picked) return; picked = true; LS.sfx.good(); LS.wait(500).then(function () { res(w); }); }
      [1, 2].forEach(function (p) {
        var v = el('button', 'vote', '❤️'); v.type = 'button'; v.dataset.vote = p;
        onTap(v, function () { v.classList.add('on'); vote(p); });
        A.h[p].appendChild(v);
      });
      var both = el('button', 'btn both-btn', '❤️  ' + t('both') + '  ❤️'); both.type = 'button'; both.id = 'vote-both';
      onTap(both, function () { vote(0); });
      A.top.appendChild(both);
    });
  };

  /* ============================================================
     5. TUG OF WAR — tap fast to pull the star to your side
     ============================================================ */
  PLAY.tug = function () {
    return new Promise(async function (res) {
      var s = LS.state.session, secs = 20, pos = 0, step = 0.05, started = false, ended = false;
      var scr = LS.screen('duel dtug' + faceCls());
      var top = el('div', 'duel-top'); top.appendChild(el('h2', 'prompt', t('dTug'))); scr.appendChild(top);
      var rope = el('div', 'rope');
      rope.appendChild(el('span', 'track'));
      rope.appendChild(el('span', 'mid'));
      var g1 = el('span', 'goal g1'), g2 = el('span', 'goal g2'); g1.appendChild(LS.eagleMark('cur')); g2.appendChild(LS.eagleMark('cur'));
      rope.appendChild(g1); rope.appendChild(g2);
      var marker = el('div', 'marker'); marker.appendChild(LS.mascot('happy')); rope.appendChild(marker);
      scr.appendChild(rope);
      if (D.face) rope.classList.add('vertical');
      var a = el('div', 'arena'), H = [null];
      [1, 2].forEach(function (p) {
        var h = el('div', 'half p' + p);
        var hd = el('div', 'half-head'); hd.appendChild(chip(p)); h.appendChild(hd);
        h.appendChild(el('p', 'half-title', t('dTugHow')));
        var pad = el('button', 'tap-pad', t('tapTap')); pad.type = 'button'; pad.dataset.p = p;
        onTap(pad, function () {
          if (!started || ended) return;
          pos += p === 1 ? -step : step;
          pos = Math.max(-1, Math.min(1, pos));
          draw();
          pad.classList.remove('hit'); void pad.offsetWidth; pad.classList.add('hit');
          LS.sfx.tap();
          if (Math.abs(pos) >= 1) end(p);
        });
        h.appendChild(pad); a.appendChild(h); H.push(h);
      });
      if (D.face) {                      /* rope runs up the side, between the two players */
        scr.removeChild(rope);
        var wrap = el('div', 'tug-face'); wrap.appendChild(a); wrap.appendChild(rope); scr.appendChild(wrap);
      } else scr.appendChild(a);
      function draw() {
        if (D.face) { marker.style.left = '50%'; marker.style.top = (50 - pos * 42) + '%'; }
        else marker.style.left = (50 + pos * 44) + '%';
        H[1].classList.toggle('ahead', pos < -0.05); H[2].classList.toggle('ahead', pos > 0.05);
      }
      function end(w) {
        if (ended) return;
        ended = true; LS.sfx.win();
        LS.wait(1100).then(function () { res(w); });
      }
      LS.show(scr);
      draw();
      await countdown();
      if (!alive(s)) return;
      started = true;
      top.appendChild(timerBar(secs));
      LS.wait(secs * 1000).then(function () { end(pos < -0.05 ? 1 : pos > 0.05 ? 2 : 0); });
    });
  };

  /* ============================================================
     6. COPY THE LOOK — remember it, rebuild it
     ============================================================ */
  PLAY.copy = function () {
    return new Promise(async function (res) {
      var s = LS.state.session, junior = LS.isJunior(), showSecs = junior ? 5 : 3.5, limit = 30;
      var tops = LS.figureLists().top.filter(function (x) { return LS.ITEMS[x].cat !== 'dresses'; });
      var target = { top: LS.rand(tops), bottom: LS.rand(LS.byCat('bottoms')), shoes: LS.rand(LS.byCat('shoes')) };
      var pools = { top: tops, bottom: LS.byCat('bottoms'), shoes: LS.byCat('shoes') };
      var lists = {}, start = {};
      Object.keys(target).forEach(function (k) {
        lists[k] = LS.shuffle([target[k]].concat(LS.sample(pools[k].filter(function (x) { return x !== target[k]; }), junior ? 2 : 3)));
        var i = lists[k].indexOf(target[k]);
        start[k] = (i + 1 + Math.floor(Math.random() * (lists[k].length - 1))) % lists[k].length;
      });

      /* look carefully */
      var show = LS.screen('duel dcopy-show' + faceCls());
      if (D.face) show.appendChild(mirror(t('remember')));
      show.appendChild(LS.guide(t('remember'), 'big'));
      var f = figure(target); f.el.classList.add('big-fig'); show.appendChild(f.el);
      show.appendChild(timerBar(showSecs));
      LS.currentPrompt = t('remember');
      LS.show(show); LS.say(LS.currentPrompt);
      await LS.wait(showSecs * 1000);

      /* rebuild it */
      var A = arena('dcopy');
      var M = [null], doneAt = [0, 0, 0], t0 = Date.now(), finishNow;
      [1, 2].forEach(function (p) {
        var hd = el('div', 'half-head'); hd.appendChild(chip(p)); A.h[p].appendChild(hd);
        M.push(dresser(A.h[p], lists, start));
        var rb = el('button', 'btn primary ready-btn', '✓  ' + t('ready')); rb.type = 'button';
        onTap(rb, function () {
          if (doneAt[p]) return;
          doneAt[p] = Date.now() - t0; rb.disabled = true; M[p].lock(); LS.sfx.good(); A.h[p].classList.add('done');
          if (doneAt[1] && doneAt[2] && finishNow) finishNow();
        });
        A.h[p].appendChild(rb);
      });
      A.top.appendChild(timerBar(limit));
      title(A, t('copyNow'));
      LS.show(A.scr); LS.say(LS.currentPrompt);
      await new Promise(function (go) { finishNow = go; setTimeout(go, limit * 1000); });
      if (!alive(s)) return;

      /* compare */
      var right = [0, 0, 0], looks = [null, M[1].look(), M[2].look()];
      var scr = LS.screen('duel dcopy-res');
      var row = el('div', 'copy-row');
      function col(label, look, p) {
        var c = el('div', 'copy-col' + (p ? ' p' + p : ' answer'));
        c.appendChild(label);
        c.appendChild(figure(look).el);
        if (p) {
          var ticks = el('div', 'ticks');
          Object.keys(target).forEach(function (k) {
            var ok = look[k] === target[k]; if (ok) right[p]++;
            ticks.appendChild(el('span', ok ? 'ok' : 'no', ok ? '✓' : '✗'));
          });
          c.appendChild(ticks);
          c.appendChild(el('small', '', t('matchCount', { n: right[p] })));
        }
        return c;
      }
      var c1 = col(chip(1), looks[1], 1), c0 = col(el('div', 'kicker', t('theLook')), target, 0), c2 = col(chip(2), looks[2], 2);
      row.appendChild(c1); row.appendChild(c0); row.appendChild(c2);
      scr.appendChild(row);
      LS.show(scr);
      var w = winner(right[1], right[2]);
      if (!w && right[1] > 0) {                 /* same score: the quicker one wins */
        var a1 = doneAt[1] || 1e9, a2 = doneAt[2] || 1e9;
        if (a1 !== a2) w = a1 < a2 ? 1 : 2;
      }
      if (w) row.children[w === 1 ? 0 : 2].classList.add('win');
      LS.sfx.good();
      await LS.wait(3200);
      res(w);
    });
  };

  /* ============================================================
     8. PUZZLE RACE — the same puzzle on both sides
     ============================================================ */
  PLAY.puzzle = function () {
    return new Promise(async function (res) {
      var s = LS.state.session, junior = LS.isJunior(), rows = junior ? 2 : 3, cols = junior ? 2 : 3;
      var id = LS.rand(LS.puzzlePool()), order = LS.puzzleOrder(rows * cols);
      var A = arena('dpuzzle'), B = [null], finished = false;
      [1, 2].forEach(function (p) {
        var hd = el('div', 'half-head'); hd.appendChild(chip(p)); A.h[p].appendChild(hd);
        var row = el('div', 'pz-row');
        var ref = el('div', 'pz-ref'); ref.appendChild(LS.card(id, '', 'div'));
        var b = LS.puzzleBoard(id, rows, cols, { order: order, locked: true });
        row.appendChild(ref); row.appendChild(b.el); A.h[p].appendChild(row);
        B.push(b);
        b.done.then(function () {
          if (finished || !alive(s)) return;
          finished = true; A.h[p].classList.add('win');
          LS.wait(1500).then(function () { res(p); });
        });
      });
      title(A, t('pzPrompt'));
      LS.show(A.scr);
      await countdown();
      if (!alive(s)) return;
      B[1].start(); B[2].start();
    });
  };

  /* ============================================================
     7. XO — three in a row
     ============================================================ */
  PLAY.xo = function () {
    return new Promise(function (res) {
      var s = LS.state.session, turn = D.xoStart;
      D.xoStart = D.xoStart === 1 ? 2 : 1;          /* take turns starting */
      var scr = LS.screen('duel dxo' + faceCls());
      scr.appendChild(el('div', 'duel-top')).appendChild(el('h2', 'prompt', t('dXO')));
      var a = el('div', 'arena three');
      function mk(cls) { var m = el('span', 'xo-cell mk ' + cls); return m; }
      var S = [null, side(1, mk('x')), side(2, mk('o'))];
      S[1]._score.style.display = 'none'; S[2]._score.style.display = 'none';
      var center = el('div', 'center'), board = el('div', 'xo-board'), cells = [], grid = [0, 0, 0, 0, 0, 0, 0, 0, 0], ended = false;
      var LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
      function setTurn(p) { turn = p; S[1].classList.toggle('on', p === 1); S[2].classList.toggle('on', p === 2); }
      for (var i = 0; i < 9; i++) {
        (function (i) {
          var c = el('button', 'xo-cell'); c.type = 'button'; c.dataset.i = i;
          onTap(c, function () {
            if (ended || grid[i]) return;
            grid[i] = turn; c.classList.add(turn === 1 ? 'x' : 'o'); LS.sfx.flip();
            var line = LINES.filter(function (l) { return grid[l[0]] === turn && grid[l[1]] === turn && grid[l[2]] === turn; })[0];
            if (line) {
              ended = true;
              line.forEach(function (k) { cells[k].classList.add('win'); });
              LS.sfx.win();
              var w = turn;
              LS.wait(1600).then(function () { res(w); });
            } else if (grid.every(function (g) { return g; })) {
              ended = true; LS.sfx.good();
              LS.wait(1200).then(function () { res(0); });
            } else setTurn(turn === 1 ? 2 : 1);
          });
          cells.push(c); board.appendChild(c);
        })(i);
      }
      center.appendChild(board);
      a.appendChild(S[1]); a.appendChild(center); a.appendChild(S[2]);
      scr.appendChild(a);
      setTurn(turn);
      LS.show(scr);
    });
  };
})();
