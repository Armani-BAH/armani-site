/* MINI-GAME 1 — LITTLE ARMANI STYLIST
   Build an outfit piece by piece. Tap a picture or drag it onto the outfit board. */
(function () {
  'use strict';
  var LS = window.LS;

  function Board() {
    var el = LS.el('div', 'board'), slots = {};
    ['top', 'bottom', 'shoes', 'acc'].forEach(function (k) {
      var s = LS.el('div', 'slot');
      s.appendChild(LS.el('span', 'slot-label',
        LS.t({ top: 'slotTop', bottom: 'slotBottom', shoes: 'slotShoes', acc: 'slotAcc' }[k])));
      el.appendChild(s); slots[k] = s;
    });
    return {
      el: el,
      set: function (k, id) {
        var s = slots[k];
        while (s.firstChild) s.removeChild(s.firstChild);
        var img = new Image(); img.src = LS.src(id); img.alt = '';
        s.appendChild(img); s.classList.add('filled');
      },
      next: function (k) {
        Object.keys(slots).forEach(function (n) { slots[n].classList.toggle('next', n === k); });
      }
    };
  }

  LS.games.stylist = async function () {
    var junior = LS.isJunior();
    var looks = LS.sample(LS.LOOKS, junior ? 1 : 2);
    var extra = junior ? 2 : 3;
    LS.state.usedLooks = looks.map(function (l) { return l.id; });

    for (var i = 0; i < looks.length; i++) {
      var look = looks[i], board = Board(), r;
      board.set('top', look.top);

      /* trousers or skirt: match the colour */
      board.next('bottom');
      r = await LS.choice({
        prompt: LS.t('stMatchBottom'), sub: LS.t('dragHint'),
        options: LS.shuffle([look.bottom.ok].concat(LS.sample(look.bottom.no, extra))),
        correct: [look.bottom.ok], side: board.el, dropZone: board.el
      });
      board.set('bottom', look.bottom.ok); LS.score(r);

      /* shoes: colour match when the look has one, otherwise a free choice */
      board.next('shoes');
      if (look.shoes) {
        r = await LS.choice({
          prompt: LS.t('stMatchShoes'),
          options: LS.shuffle([look.shoes.ok].concat(LS.sample(look.shoes.no, extra))),
          correct: [look.shoes.ok], side: board.el, dropZone: board.el
        });
        LS.score(r);
      } else {
        r = await LS.choice({ prompt: LS.t('stFreeShoes'), options: LS.shuffle(look.shoesFree), side: board.el, dropZone: board.el });
        LS.award(2, r.el);
      }
      board.set('shoes', r.picked);

      /* finishing touch: always a free, creative choice */
      board.next('acc');
      r = await LS.choice({ prompt: LS.t('stFreeAcc'), options: LS.shuffle(look.accFree), side: board.el, dropZone: board.el });
      board.set('acc', r.picked); LS.award(2, r.el);
      board.next(null);

      /* show the finished outfit */
      var scr = LS.screen('showcase');
      LS.setPrompt(scr, LS.t('stDone'));
      board.el.classList.add('final');
      scr.appendChild(board.el);
      LS.show(scr);
      LS.sfx.win();
      await LS.wait(2300);
    }
  };
})();
