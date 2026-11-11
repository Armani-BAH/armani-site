/* MINI-GAME 2 — ARMANI MEMORY MATCH
   count = number of cards (4 for the quick final challenge, 6 easy, 8 medium, 12 hard). */
(function () {
  'use strict';
  var LS = window.LS;

  /* pieces that look clearly different from one another */
  var POOL = ['varsity-tee', 'pattern-puffer', 'check-dress', 'blue-sneakers', 'cap', 'backpack',
    'jeans', 'pink-bag', 'check-jacket', 'green-hoodie', 'black-boots', 'pink-skirt',
    'burgundy-hoodie', 'navy-blazer', 'silver-ballet', 'socks'];

  LS.memory = function (count, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var pairs = count / 2, ids = LS.sample(POOL, pairs), deck = LS.shuffle(ids.concat(ids));
      var scr = LS.screen('memory');
      if (opts.kicker) scr.appendChild(LS.el('div', 'kicker', opts.kicker));
      LS.setPrompt(scr, opts.prompt || LS.t('g2Intro'));

      var info = LS.el('div', 'mem-info');
      var pairBox = LS.el('span', 'pill'), timeBox = LS.el('span', 'pill');
      info.appendChild(pairBox); info.appendChild(timeBox);
      var prog = LS.el('div', 'progress-bar'), fill = LS.el('i'); prog.appendChild(fill);
      scr.appendChild(info); scr.appendChild(prog);

      var grid = LS.el('div', 'mem-grid m' + count);
      var open = [], found = 0, busy = false, moves = 0, t0 = Date.now(), session = LS.state.session;

      function paint() {
        pairBox.textContent = LS.t('pairs') + '  ' + found + ' / ' + pairs;
        fill.style.width = (found / pairs * 100) + '%';
      }
      function tick() {
        if (session !== LS.state.session || found === pairs || !scr.isConnected) return;
        var s = Math.floor((Date.now() - t0) / 1000);
        timeBox.textContent = LS.t('time') + '  ' + Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
        setTimeout(tick, 500);
      }

      deck.forEach(function (id) {
        var c = LS.el('button', 'mcard'); c.type = 'button'; c.dataset.id = id;
        var inner = LS.el('span', 'inner');
        var bk = LS.el('span', 'side back'); bk.appendChild(LS.ea('cur')); inner.appendChild(bk);
        var face = LS.el('span', 'side face');
        var img = new Image(); img.src = LS.src(id); img.alt = ''; img.draggable = false;
        face.appendChild(img); inner.appendChild(face); c.appendChild(inner);
        c.addEventListener('click', function () {
          if (busy || c.classList.contains('open') || c.classList.contains('matched')) return;
          LS.unlockAudio(); LS.sfx.flip();
          c.classList.add('open'); open.push(c);
          if (open.length < 2) return;
          moves++; busy = true;
          var a = open[0], b = open[1]; open = [];
          if (a.dataset.id === b.dataset.id) {
            setTimeout(function () {
              if (session !== LS.state.session) return;
              a.classList.add('matched'); b.classList.add('matched');
              found++; paint(); LS.sfx.good(); LS.award(1, b);
              busy = false;
              if (found === pairs) {
                LS.feedback('good');
                var secs = (Date.now() - t0) / 1000;
                LS.wait(1100).then(function () { resolve({ moves: moves, seconds: secs, pairs: pairs }); });
              }
            }, 380);
          } else {
            if (!opts.kicker) LS.slip(0.5);
            setTimeout(function () { a.classList.add('nope'); b.classList.add('nope'); LS.sfx.bad(); }, 380);
            setTimeout(function () {
              a.classList.remove('open', 'nope'); b.classList.remove('open', 'nope'); busy = false;
            }, 1050);
          }
        });
        grid.appendChild(c);
      });

      scr.appendChild(grid);
      paint();
      LS.show(scr);
      tick();
    });
  };

  LS.games.memory = async function () {
    var res = await LS.memory(LS.state.memCount);
    /* a small bonus for quick thinking (older children only) */
    if (!LS.isJunior() && res.seconds < res.pairs * 9) LS.award(2);
  };
})();
