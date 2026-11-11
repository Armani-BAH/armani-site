/* MINI-GAME 6 — MINI DESIGNER
   The child chooses what to create:
     • mix & match a full outfit on a figure (real product photos)
     • design a T-shirt   • design a dress   (colour, pattern, stickers)
   Every creation is a good creation. Nothing is saved. */
(function () {
  'use strict';
  var LS = window.LS;

  /* what can be worn on each part of the figure */
  var TOPS = ['green-tee', 'navy-tee', 'peach-tee', 'white-tee', 'varsity-tee', 'green-hoodie', 'burgundy-hoodie', 'pink-cardigan',
    'pattern-sweatshirt', 'beige-pullover', 'varsity-jacket', 'pattern-puffer', 'check-jacket', 'navy-blazer', 'pink-jacket',
    'check-dress', 'navy-dress', 'green-dress', 'pink-dress', 'peach-dress'];
  var PARTS = {
    top: TOPS,
    bottom: function () { return LS.byCat('bottoms'); },
    shoes: function () { return LS.byCat('shoes'); },
    extra: ['backpack', 'cap', 'pink-bag', 'navy-beanie', 'pink-beret', 'cream-bag', 'beige-beanie', 'socks']
  };
  function list(k) { return typeof PARTS[k] === 'function' ? PARTS[k]() : PARTS[k]; }
  function isDress(id) { return LS.ITEMS[id].cat === 'dresses'; }

  function pickMode() {
    return new Promise(function (resolve) {
      var scr = LS.screen('modes');
      scr.appendChild(LS.guide(LS.t('dzPick'), 'big'));
      LS.currentPrompt = LS.t('dzPick');
      if (LS.isJunior()) LS.say(LS.currentPrompt);
      var row = LS.el('div', 'mode-row');
      [['mix', 'dzMix'], ['tee', 'dzTee'], ['dress', 'dzDress']].forEach(function (m) {
        var b = LS.el('button', 'mode m-' + m[0]); b.type = 'button'; b.dataset.mode = m[0];
        var art = LS.el('span', 'mode-art');
        if (m[0] === 'mix') {
          ['varsity-tee', 'jeans', 'blue-sneakers'].forEach(function (id) { var i = new Image(); i.src = LS.src(id); i.alt = ''; art.appendChild(i); });
        } else {
          art.appendChild(LS.tee({ shape: m[0], color: m[0] === 'tee' ? '#4cc9f0' : '#ff8fc7', pattern: m[0] === 'tee' ? 'stars' : 'dots',
            stickers: [{ k: m[0] === 'tee' ? '⚡' : '👑', x: 50, y: 52 }] }));
        }
        b.appendChild(art);
        b.appendChild(LS.el('span', 'mode-name', LS.t(m[1])));
        b.addEventListener('click', function () { LS.unlockAudio(); LS.sfx.tap(); LS.hush(); resolve(m[0]); });
        row.appendChild(b);
      });
      scr.appendChild(row);
      LS.show(scr);
    });
  }

  /* mix & match on the figure */
  LS.mixMatch = function () {
    return new Promise(function (resolve) {
      var look = { top: LS.rand(TOPS), bottom: LS.rand(list('bottom')), shoes: LS.rand(list('shoes')), extra: LS.rand(list('extra')) };
      var scr = LS.screen('mix');
      LS.setPrompt(scr, LS.t('mixPrompt'));
      var row = LS.el('div', 'mix-row');

      var fig = LS.el('div', 'figure');
      fig.appendChild(LS.mascot('happy', 'head'));
      var imgs = {};
      ['bottom', 'top', 'shoes', 'extra'].forEach(function (k) {
        var i = new Image(); i.alt = ''; i.className = 'part p-' + k; i.draggable = false; fig.appendChild(i); imgs[k] = i;
      });
      function draw(changed) {
        Object.keys(imgs).forEach(function (k) {
          imgs[k].src = LS.src(look[k]);
          if (!changed || changed === k) { imgs[k].classList.remove('swap'); void imgs[k].offsetWidth; imgs[k].classList.add('swap'); }
        });
        fig.classList.toggle('dress', isDress(look.top));
      }
      row.appendChild(fig);

      var ctrl = LS.el('div', 'mix-ctrl');
      [['top', 'slotTop'], ['bottom', 'slotBottom'], ['shoes', 'slotShoes'], ['extra', 'slotAcc']].forEach(function (p) {
        var k = p[0], line = LS.el('div', 'mix-line l-' + k);
        function step(d) {
          var arr = list(k), i = (arr.indexOf(look[k]) + d + arr.length) % arr.length;
          look[k] = arr[i]; LS.unlockAudio(); LS.sfx.flip(); draw(k); thumb.src = LS.src(look[k]);
          line.classList.toggle('off', k === 'bottom' && isDress(look.top));
          if (k === 'top') bottomLine.classList.toggle('off', isDress(look.top));
        }
        var prev = LS.el('button', 'arrow', '‹'); prev.type = 'button'; prev.dataset.d = '-1';
        var next = LS.el('button', 'arrow', '›'); next.type = 'button'; next.dataset.d = '1';
        prev.addEventListener('click', function () { step(-1); });
        next.addEventListener('click', function () { step(1); });
        var mid = LS.el('span', 'mix-mid');
        var thumb = new Image(); thumb.alt = ''; thumb.src = LS.src(look[k]);
        mid.appendChild(thumb); mid.appendChild(LS.el('small', '', LS.t(p[1])));
        line.appendChild(prev); line.appendChild(mid); line.appendChild(next);
        line._thumb = thumb;
        ctrl.appendChild(line);
      });
      var bottomLine = ctrl.querySelector('.l-bottom');
      bottomLine.classList.toggle('off', isDress(look.top));

      var actions = LS.el('div', 'studio-actions');
      var dice = LS.el('button', 'btn', '🎲  ' + LS.t('shuffle')); dice.type = 'button'; dice.id = 'mix-shuffle';
      dice.addEventListener('click', function () {
        LS.unlockAudio(); LS.sfx.star();
        Object.keys(look).forEach(function (k) { look[k] = LS.rand(list(k)); ctrl.querySelector('.l-' + k)._thumb.src = LS.src(look[k]); });
        bottomLine.classList.toggle('off', isDress(look.top));
        draw();
      });
      var done = LS.el('button', 'btn primary', '✓  ' + LS.t('done')); done.type = 'button'; done.id = 'mix-done';
      done.addEventListener('click', function () {
        LS.unlockAudio(); LS.sfx.win(); LS.feedback('free');
        done.disabled = true; fig.classList.add('wow');
        LS.wait(1500).then(function () { resolve({ look: look, el: fig }); });
      });
      actions.appendChild(dice); actions.appendChild(done);
      ctrl.appendChild(actions);
      row.appendChild(ctrl);
      scr.appendChild(row);
      draw();
      LS.show(scr);
    });
  };

  LS.games.designer = async function () {
    var mode = await pickMode(), r;
    if (mode === 'mix') {
      r = await LS.mixMatch();
      LS.state.look = r.look;
    } else {
      r = await LS.studio({ shape: mode });
      LS.state.design = r.design;
    }
    LS.state.created = true;
    LS.award(3, r.el);
  };
})();
