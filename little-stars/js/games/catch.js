/* BONUS ROUND — STAR CATCH
   Slide a finger to move the bag and catch falling stars.
   Gold stars are worth 3. Clouds (older children only) just make the bag wobble:
   nothing is ever lost. */
(function () {
  'use strict';
  var LS = window.LS;

  LS.catchGame = function () {
    return new Promise(function (resolve) {
      var junior = LS.isJunior(), secs = junior ? 15 : 18, gap = junior ? 620 : 460;
      var scr = LS.screen('catch');
      scr.appendChild(LS.el('div', 'kicker', LS.t('bonus')));
      LS.setPrompt(scr, LS.t('catchTitle'));
      scr.appendChild(LS.el('p', 'sub', LS.t(junior ? 'catchSub' : 'catchSubSenior')));
      var info = LS.el('div', 'mem-info'), pill = LS.el('span', 'pill eagle-pill'), count = LS.el('b', '', '0');
      pill.appendChild(LS.eagle('mini', ['#ffd23f', '#ff9f1c'])); pill.appendChild(count);
      info.appendChild(pill); scr.appendChild(info);
      var bar = LS.el('div', 'timer'), fill = LS.el('i'); fill.style.animationDuration = secs + 's';
      bar.appendChild(fill); scr.appendChild(bar);

      var field = LS.el('div', 'field'), bag = LS.el('div', 'bag');
      bag.appendChild(LS.mascot('happy'));
      var bb = LS.el('span', 'bag-body'); bb.appendChild(LS.ea('cur')); bag.appendChild(bb);
      field.appendChild(bag); scr.appendChild(field);
      LS.show(scr);

      var session = LS.state.session, items = [], caught = 0, bagX = 0.5, rect = field.getBoundingClientRect();
      var t0 = null, last = null, lastSpawn = 0, ended = false;

      function steer(e) {
        rect = field.getBoundingClientRect();
        bagX = Math.max(0.07, Math.min(0.93, (e.clientX - rect.left) / rect.width));
        bag.style.left = (bagX * 100) + '%';
      }
      field.addEventListener('pointerdown', function (e) { LS.unlockAudio(); steer(e); });
      field.addEventListener('pointermove', steer);

      function spawn() {
        var cloud = !junior && Math.random() < 0.2, gold = !cloud && Math.random() < 0.13;
        var n = LS.el('span', 'drop' + (cloud ? ' cloud' : gold ? ' gold' : ''), cloud ? '☁' : null);
        if (!cloud) n.appendChild(LS.eagle(gold ? 'gold' : ''));
        var x = 0.07 + Math.random() * 0.86;
        n.style.left = (x * 100) + '%';
        field.appendChild(n);
        items.push({ n: n, x: x, y: -0.1, v: (junior ? 0.24 : 0.33) + Math.random() * 0.12, cloud: cloud, gold: gold });
      }
      function wobble(cls) { bag.classList.remove('yum', 'wet'); void bag.offsetWidth; bag.classList.add(cls); }

      function frame(now) {
        if (session !== LS.state.session || !scr.isConnected) return;
        if (t0 === null) { t0 = now; last = now; }
        var dt = Math.min(0.05, (now - last) / 1000), t = (now - t0) / 1000; last = now;
        if (t < secs && now - lastSpawn > gap) { lastSpawn = now; spawn(); }
        for (var i = items.length - 1; i >= 0; i--) {
          var it = items[i];
          it.y += it.v * dt;
          it.n.style.transform = 'translate(-50%, ' + (it.y * rect.height) + 'px)';
          var hit = it.y > 0.74 && it.y < 0.93 && Math.abs(it.x - bagX) < 0.085;
          if (hit) {
            if (it.cloud) { LS.sfx.bad(); wobble('wet'); }
            else { caught += it.gold ? 3 : 1; count.textContent = caught; LS.sfx.star(); wobble('yum'); }
          }
          if (hit || it.y > 1.1) { field.removeChild(it.n); items.splice(i, 1); }
        }
        if (t >= secs && !items.length && !ended) {
          ended = true;
          LS.feedback('good'); LS.sfx.win();
          LS.award(Math.max(1, Math.min(caught, 15)), bag);
          LS.wait(1500).then(function () { resolve({ caught: caught }); });
          return;
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  };
})();
