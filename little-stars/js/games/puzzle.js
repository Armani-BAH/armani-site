/* MINI-GAME 7 — FASHION PUZZLE
   A product photo is cut into pieces and mixed up.
   Tap two pieces to swap them (or drag one onto another) until the picture is whole.
   Juniors: 4 then 6 pieces. Seniors: 9 then 12 pieces. */
(function () {
  'use strict';
  var LS = window.LS;

  /* a mixed-up order that is never already solved */
  LS.puzzleOrder = function (n) {
    var o;
    do {
      o = LS.shuffle(Array.apply(null, Array(n)).map(function (_, i) { return i; }));
    } while (o.filter(function (v, i) { return v === i; }).length > Math.floor(n / 3));
    return o;
  };

  /* the puzzle board. opts: order (a given mix, so two players get the same one), locked */
  LS.puzzleBoard = function (id, rows, cols, opts) {
    opts = opts || {};
    var n = rows * cols, order = (opts.order || LS.puzzleOrder(n)).slice();
    var board = LS.el('div', 'pz-board');
    board.style.setProperty('--r', rows); board.style.setProperty('--c', cols);
    var slots = [], sel = -1, moves = 0, done = false, locked = !!opts.locked, finish;
    var promise = new Promise(function (r) { finish = r; });
    var url = 'url("' + LS.src(id) + '")';

    function paint(i) {
      var pc = order[i], r = Math.floor(pc / cols), c = pc % cols;
      /* the photo is shown 25% larger and centred, so the white border around the product is trimmed */
      var Z = 1.25, W = cols * Z, H = rows * Z;
      var ox = (W - cols) / 2 + c, oy = (H - rows) / 2 + r;
      slots[i].style.backgroundPosition = (W > 1 ? ox / (W - 1) * 100 : 0) + '% ' + (H > 1 ? oy / (H - 1) * 100 : 0) + '%';
      slots[i].classList.toggle('ok', pc === i);
    }
    function bump(i) { slots[i].classList.remove('swap'); void slots[i].offsetWidth; slots[i].classList.add('swap'); }
    function swap(a, b) {
      var x = order[a]; order[a] = order[b]; order[b] = x;
      paint(a); paint(b); bump(a); bump(b); moves++;
      if (order.every(function (v, i) { return v === i; })) {
        done = true; board.classList.add('solved'); LS.sfx.win();
        finish({ moves: moves, el: board });
      } else if (order[a] === a || order[b] === b) LS.sfx.star();
      else LS.sfx.flip();
    }
    function clearSel() { if (sel >= 0) slots[sel].classList.remove('sel'); sel = -1; }

    for (var i = 0; i < n; i++) {
      var t = LS.el('span', 'pz-tile');
      t.dataset.i = i;
      t.style.backgroundImage = url;
      t.style.backgroundSize = (cols * 125) + '% ' + (rows * 125) + '%';
      slots.push(t); board.appendChild(t);
    }
    slots.forEach(function (s, i) { paint(i); });

    /* one gesture = tap (select / swap) or drag (drop on another piece) */
    var down = null, over = null;
    function tileAt(e) {
      var hit = document.elementFromPoint(e.clientX, e.clientY);
      var t = hit && hit.closest ? hit.closest('.pz-tile') : null;
      return t && t.parentNode === board ? +t.dataset.i : -1;
    }
    board.addEventListener('pointerdown', function (e) {
      if (done || locked) return;
      var i = tileAt(e); if (i < 0) return;
      e.preventDefault(); LS.unlockAudio();
      down = { i: i, id: e.pointerId };
      try { board.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      slots[i].classList.add('held');
    });
    board.addEventListener('pointermove', function (e) {
      if (!down || e.pointerId !== down.id) return;
      var i = tileAt(e);
      if (over !== null && over !== i && slots[over]) slots[over].classList.remove('over');
      over = i >= 0 && i !== down.i ? i : null;
      if (over !== null) slots[over].classList.add('over');
    });
    function up(e) {
      if (!down || e.pointerId !== down.id) return;
      var from = down.i, to = tileAt(e);
      slots[from].classList.remove('held');
      if (over !== null) slots[over].classList.remove('over');
      down = null; over = null;
      if (done) return;
      if (to >= 0 && to !== from) { clearSel(); swap(from, to); return; }      /* dragged onto another piece */
      if (to !== from) return;
      if (sel < 0) { sel = from; slots[from].classList.add('sel'); LS.sfx.tap(); }
      else if (sel === from) clearSel();
      else { var a = sel; clearSel(); swap(a, from); }
    }
    board.addEventListener('pointerup', up);
    board.addEventListener('pointercancel', function (e) {
      if (!down || e.pointerId !== down.id) return;
      slots[down.i].classList.remove('held'); down = null;
    });

    return { el: board, done: promise, moves: function () { return moves; }, start: function () { locked = false; } };
  };

  /* colourful pieces with lots of detail make the best puzzles */
  LS.puzzlePool = function () {
    return ['pattern-puffer', 'check-dress', 'check-jacket', 'varsity-jacket', 'pattern-sweatshirt', 'varsity-tee', 'burgundy-hoodie',
      'pink-cardigan', 'green-hoodie', 'peach-dress', 'navy-coat', 'pink-jacket'].concat(LS.byCat('jackets'), LS.byCat('dresses'))
      .filter(function (k, i, a) { return LS.ITEMS[k] && a.indexOf(k) === i; });
  };

  LS.games.puzzle = async function () {
    var junior = LS.isJunior(), sizes = junior ? [[2, 2], [3, 2]] : [[3, 3], [4, 3]];
    var picks = LS.sample(LS.puzzlePool(), sizes.length);
    for (var i = 0; i < sizes.length; i++) {
      var rows = sizes[i][0], cols = sizes[i][1];
      var scr = LS.screen('puzzle');
      scr.appendChild(LS.el('div', 'kicker', LS.t('round', { n: i + 1, t: sizes.length })));
      LS.setPrompt(scr, LS.t('pzPrompt'));
      var row = LS.el('div', 'pz-row');
      var ref = LS.el('div', 'pz-ref');
      ref.appendChild(LS.card(picks[i], '', 'div'));
      ref.appendChild(LS.el('span', 'pz-eye', '👀'));
      var b = LS.puzzleBoard(picks[i], rows, cols);
      row.appendChild(ref); row.appendChild(b.el);
      scr.appendChild(row);
      LS.show(scr);
      var r = await b.done;
      LS.feedback('good');
      LS.award(3 + (r.moves <= rows * cols ? 1 : 0), r.el);
      await LS.wait(1800);
    }
  };
})();
