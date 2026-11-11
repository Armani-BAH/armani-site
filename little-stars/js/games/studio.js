/* DESIGN STUDIO — the child designs a T-shirt (colour, pattern, stickers).
   Every design is a good design. It is shown on the runway and on the certificate,
   kept in memory only, and erased when the next child starts. */
(function () {
  'use strict';
  var LS = window.LS;
  var SPOTS = [[50, 46], [36, 64], [64, 64], [50, 78], [38, 34], [62, 34]];

  LS.studio = function (o) {
    o = o || {};
    return new Promise(function (resolve) {
      var shape = o.shape === 'dress' ? 'dress' : 'tee';
      var design = { shape: shape, color: LS.TEE_COLOURS[shape === 'dress' ? 1 : 0], pattern: 'plain', stickers: [] };
      var scr = LS.screen('studio');
      if (o.top) scr.appendChild(o.top);
      LS.setPrompt(scr, LS.t(shape === 'dress' ? 'adDress' : 'adDesign'));

      var row = LS.el('div', 'studio-row');
      var easel = LS.el('div', 'easel');
      row.appendChild(easel);

      function draw() {
        while (easel.firstChild) easel.removeChild(easel.firstChild);
        var tee = LS.tee(design);
        easel.appendChild(tee);
        /* stickers can be dragged around the T-shirt */
        Array.prototype.forEach.call(tee.querySelectorAll('.sticker'), function (n, i) {
          n.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            try { n.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
            n.classList.add('held');
            function move(ev) {
              var r = tee.getBoundingClientRect();
              var x = Math.max(14, Math.min(86, (ev.clientX - r.left) / r.width * 100));
              var y = Math.max(16, Math.min(90, (ev.clientY - r.top) / r.height * 100));
              design.stickers[i].x = x; design.stickers[i].y = y;
              n.style.left = x + '%'; n.style.top = y + '%';
            }
            function up() {
              n.classList.remove('held');
              n.removeEventListener('pointermove', move); n.removeEventListener('pointerup', up); n.removeEventListener('pointercancel', up);
            }
            n.addEventListener('pointermove', move); n.addEventListener('pointerup', up); n.addEventListener('pointercancel', up);
          });
        });
      }

      var tools = LS.el('div', 'tools');
      function group(label) {
        var g = LS.el('div', 'tool-row');
        g.appendChild(LS.el('span', 'tool-label', label));
        var b = LS.el('div', 'tool-btns'); g.appendChild(b); tools.appendChild(g);
        return b;
      }
      function select(box, btn) {
        Array.prototype.forEach.call(box.children, function (k) { k.classList.toggle('on', k === btn); });
      }

      var cBox = group(LS.t('stColour'));
      LS.TEE_COLOURS.forEach(function (c, i) {
        var b = LS.el('button', 'swatch' + (c === design.color ? ' on' : '')); b.type = 'button'; b.style.background = c; b.dataset.c = c;
        b.addEventListener('click', function () { LS.unlockAudio(); LS.sfx.tap(); design.color = c; select(cBox, b); draw(); });
        cBox.appendChild(b);
      });

      var pBox = group(LS.t('stPattern'));
      LS.TEE_PATTERNS.forEach(function (p, i) {
        var b = LS.el('button', 'pat' + (i === 0 ? ' on' : '')); b.type = 'button'; b.dataset.p = p;
        b.appendChild(LS.tee({ shape: shape, color: '#8b6cf0', pattern: p, stickers: [] }));
        b.addEventListener('click', function () { LS.unlockAudio(); LS.sfx.tap(); design.pattern = p; select(pBox, b); draw(); });
        pBox.appendChild(b);
      });

      var sBox = group(LS.t('stStickers'));
      LS.TEE_STICKERS.forEach(function (k) {
        var b = LS.el('button', 'stick', k); b.type = 'button';
        b.addEventListener('click', function () {
          LS.unlockAudio();
          if (design.stickers.length >= SPOTS.length) { LS.sfx.bad(); return; }
          var sp = SPOTS[design.stickers.length];
          design.stickers.push({ k: k, x: sp[0], y: sp[1] });
          LS.sfx.star(); draw();
        });
        sBox.appendChild(b);
      });
      tools.appendChild(LS.el('p', 'sub', LS.t('stHint')));

      var actions = LS.el('div', 'studio-actions');
      var undo = LS.el('button', 'btn', '↺  ' + LS.t('stUndo')); undo.type = 'button'; undo.id = 'studio-undo';
      undo.addEventListener('click', function () { LS.sfx.tap(); design.stickers.pop(); draw(); });
      var done = LS.el('button', 'btn primary', '✓  ' + LS.t('done')); done.type = 'button'; done.id = 'studio-done';
      done.addEventListener('click', function () {
        LS.unlockAudio(); LS.sfx.good(); LS.feedback('free');
        done.disabled = true;
        LS.wait(700).then(function () { resolve({ design: design, el: easel }); });
      });
      actions.appendChild(undo); actions.appendChild(done);
      tools.appendChild(actions);

      row.appendChild(tools);
      scr.appendChild(row);
      draw();
      LS.show(scr);
    });
  };
})();
