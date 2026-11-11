/* MINI-GAME 4 — FASHION ADVENTURE
   Four steps along a path of stars. Each finished step lights the next star. */
(function () {
  'use strict';
  var LS = window.LS;
  var R = LS.rand, S = LS.sample;

  function path(step) {
    var p = LS.el('div', 'path');
    ['adStep1', 'adStep2', 'adStep3', 'adStep4'].forEach(function (k, i) {
      var n = LS.el('div', 'node' + (i < step ? ' done' : i === step ? ' now' : ''));
      n.appendChild(LS.el('b', '', '★'));
      n.appendChild(LS.el('span', '', LS.t(k)));
      p.appendChild(n);
    });
    return p;
  }

  LS.games.adventure = async function () {
    var junior = LS.isJunior(), n = junior ? 3 : 4, r, look = [];
    var mixed = function (not) {
      return S(['green-tee', 'white-tee', 'jeans', 'navy-shorts', 'pink-skirt', 'backpack', 'cap', 'pink-bag', 'green-dress', 'navy-trousers']
        .filter(function (x) { return not.indexOf(x) < 0; }), n - 1);
    };

    /* 1. choose an outfit (free choice) */
    var outfits = LS.shuffle(S(['check-dress', 'navy-dress', 'peach-dress'], 2).concat(S(['varsity-tee', 'pattern-sweatshirt', 'beige-pullover'], 2))).slice(0, n);
    r = await LS.choice({ top: path(0), prompt: LS.t('adOutfit'), options: outfits });
    look.push(r.picked); LS.award(2, r.el);

    /* 2. find the shoes */
    var shoe = R(LS.byCat('shoes'));
    r = await LS.choice({ top: path(1), prompt: LS.t('adShoes'), options: LS.shuffle([shoe].concat(mixed(look))), correct: [shoe] });
    look.push(shoe); LS.score(r);

    /* 3. choose an accessory (free choice) */
    r = await LS.choice({ top: path(2), prompt: LS.t('adAcc'), options: S(['backpack', 'cap', 'pink-bag', 'navy-beanie', 'pink-beret', 'cream-bag'], n) });
    look.push(r.picked); LS.award(2, r.el);

    /* 4. final styling: find a jacket */
    var jacket = R(['navy-blazer', 'varsity-jacket', 'check-jacket', 'pink-jacket', 'navy-coat']);
    r = await LS.choice({ top: path(3), prompt: LS.t('adJacket'), options: LS.shuffle([jacket].concat(mixed(look))), correct: [jacket] });
    look.push(jacket); LS.score(r);

    /* the finished look */
    var scr = LS.screen('showcase');
    scr.appendChild(path(4));
    LS.setPrompt(scr, LS.t('adReady'));
    var row = LS.el('div', 'runway');
    look.forEach(function (id, i) {
      var c = LS.card(id, '', 'div'); c.style.animationDelay = (i * 0.15) + 's'; row.appendChild(c);
    });
    scr.appendChild(row);
    LS.show(scr);
    LS.sfx.win();
    await LS.wait(2600);
  };
})();
