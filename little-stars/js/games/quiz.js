/* MINI-GAME 3 — LITTLE FASHION QUIZ
   Picture questions. Each entry below builds one question from the catalogue. */
(function () {
  'use strict';
  var LS = window.LS;
  var R = LS.rand, S = LS.sample;

  var SHOES = function () { return LS.byCat('shoes'); };
  var TEESF = function () { return LS.byTag('tee'); };
  var JACK = function () { return LS.byCat('jackets'); };
  var BOTT = function () { return LS.byCat('bottoms'); };
  var notTag = function (arr, tag) { return arr.filter(function (k) { return (LS.ITEMS[k].tags || []).indexOf(tag) < 0; }); };

  /* each builder returns { prompt, correct[], others[], target?, need?, text? } */
  var BANK = {
    jacket: function () { return { prompt: 'qJacket', correct: [R(JACK())], others: [R(TEESF()), R(BOTT()), R(SHOES()), R(LS.byTag('bag'))] }; },
    shoes:  function () { return { prompt: 'qShoes', correct: [R(SHOES())], others: [R(LS.byTag('hat')), R(LS.byTag('bag')), R(TEESF()), R(BOTT())] }; },
    sunny:  function () { return { prompt: 'qSunny', correct: [R(LS.byTag('sunny'))], others: LS.byTag('cold') }; },
    cold:   function () { return { prompt: 'qCold', correct: [R(LS.byTag('cold').filter(function (k) { return LS.ITEMS[k].cat === 'jackets'; }))], others: LS.byTag('sunny') }; },
    hat:    function () { return { prompt: 'qHat', correct: [R(LS.byTag('hat'))], others: ['socks', R(LS.byTag('bag')), R(SHOES()), R(BOTT())] }; },
    bag:    function () { return { prompt: 'qBag', correct: [R(LS.byTag('bag'))], others: [R(LS.byTag('hat')), R(SHOES()), R(TEESF()), 'socks'] }; },
    dress:  function () { return { prompt: 'qDress', correct: [R(LS.byCat('dresses'))], others: [R(BOTT()), R(TEESF()), R(SHOES()), R(LS.byTag('bag'))] }; },
    eagle:  function () { return { prompt: 'qEagle', correct: [R(LS.byTag('eagle'))], others: [R(BOTT()), R(BOTT()), R(LS.byCat('dresses')), R(LS.byCat('dresses')), R(SHOES())] }; },
    same:   function () { var t = R(SHOES()); return { prompt: 'qSame', target: t, correct: [t], others: SHOES().filter(function (s) { return s !== t; }) }; },
    two:    function () {
      var l = R(LS.LOOKS);
      var odd = { green: ['pink-ballet', 'burgundy-hoodie'], pink: ['black-boots', 'green-joggers'], burgundy: ['cream-sneakers', 'green-tee'] }[l.id];
      return { prompt: 'qTwo', correct: [l.top, l.bottom.ok], need: 2, others: odd, fixed: true };
    },
    zoom:   function () {
      var pool = ['pattern-puffer', 'check-dress', 'varsity-tee', 'check-jacket', 'cap', 'pattern-sweatshirt', 'check-skirt', 'jeans', 'varsity-jacket', 'backpack'];
      var t = R(pool);
      return { prompt: 'qZoom', target: t, targetClass: 'zoom', correct: [t], others: pool.filter(function (s) { return s !== t; }) };
    },
    count:  function () { return { prompt: 'qCount', target: 'three-tees', correct: ['3'], text: [2, 3, 4] }; }
  };
  LS.QUIZ_BANK = BANK;
  var JUNIOR = ['shoes', 'hat', 'dress', 'jacket', 'sunny', 'bag', 'same', 'zoom'];
  var SENIOR = ['jacket', 'sunny', 'cold', 'eagle', 'same', 'two', 'count', 'hat', 'bag', 'zoom'];

  /* Ask one question. Returns the result of LS.choice. */
  LS.ask = function (key, extra) {
    var q = BANK[key](), junior = LS.isJunior(), options;
    if (q.text) {
      options = q.text.map(function (n) { return { label: n }; });
    } else {
      var nOthers = q.fixed ? q.others.length : (junior ? 2 : 3);
      options = LS.shuffle(q.correct.concat(S(q.others, nOthers)));
    }
    var o = { prompt: LS.t(q.prompt), options: options, correct: q.correct, need: q.need, target: q.target, targetClass: q.targetClass };
    if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    return LS.choice(o);
  };

  LS.pickQuestions = function (n) {
    var pool = (LS.isJunior() ? JUNIOR : SENIOR).filter(function (k) { return LS.state.usedQ.indexOf(k) < 0; });
    var keys = S(pool, n);
    LS.state.usedQ = LS.state.usedQ.concat(keys);
    return keys;
  };

  LS.games.quiz = async function () {
    var n = LS.isJunior() ? 3 : 5;
    /* always include one detective question */
    LS.state.usedQ.push('zoom');
    var keys = LS.shuffle(['zoom'].concat(LS.pickQuestions(n - 1)));
    for (var i = 0; i < keys.length; i++) {
      var r = await LS.ask(keys[i], { kicker: LS.t('question', { n: i + 1, t: keys.length }) });
      LS.score(r);
    }
  };
})();
