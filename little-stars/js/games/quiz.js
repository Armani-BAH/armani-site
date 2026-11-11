/* MINI-GAME 3 — LITTLE FASHION QUIZ
   Picture questions. Each entry below builds one question from the catalogue. */
(function () {
  'use strict';
  var LS = window.LS;
  var R = LS.rand, S = LS.sample;

  var TEES = ['green-tee', 'navy-tee', 'peach-tee', 'white-tee', 'varsity-tee'];
  var JACKETS = ['navy-blazer', 'varsity-jacket', 'pattern-puffer', 'check-jacket', 'navy-coat', 'black-puffer'];
  var SHOES = function () { return LS.byCat('shoes'); };

  /* each builder returns { prompt, correct[], others[], target?, need?, text? } */
  var BANK = {
    jacket: function () { return { prompt: 'qJacket', correct: [R(JACKETS)], others: [R(TEES), R(['jeans', 'navy-shorts', 'pink-skirt']), R(SHOES()), R(['backpack', 'cap'])] }; },
    shoes:  function () { return { prompt: 'qShoes', correct: [R(SHOES())], others: [R(['cap', 'navy-beanie', 'pink-beret']), R(['backpack', 'pink-bag']), R(TEES), R(['jeans', 'check-skirt'])] }; },
    sunny:  function () { return { prompt: 'qSunny', correct: [R(['white-tee', 'navy-shorts', 'green-tee', 'peach-tee'])], others: ['black-puffer', 'navy-coat', 'navy-beanie', 'pattern-puffer', 'beige-beanie'] }; },
    cold:   function () { return { prompt: 'qCold', correct: [R(['pattern-puffer', 'black-puffer', 'navy-coat'])], others: ['white-tee', 'navy-shorts', 'pink-ballet', 'check-skirt', 'peach-tee'] }; },
    hat:    function () { return { prompt: 'qHat', correct: [R(LS.byTag('hat'))], others: ['socks', R(['backpack', 'pink-bag']), R(SHOES()), R(['jeans', 'navy-shorts'])] }; },
    bag:    function () { return { prompt: 'qBag', correct: [R(LS.byTag('bag'))], others: [R(['cap', 'navy-beanie']), R(SHOES()), R(TEES), 'socks'] }; },
    dress:  function () { return { prompt: 'qDress', correct: [R(LS.byCat('dresses'))], others: ['jeans', R(TEES), R(SHOES()), 'backpack'] }; },
    eagle:  function () { return { prompt: 'qEagle', correct: ['eagle-tees'], others: ['pink-skirt', 'jeans', 'green-dress', 'check-dress', 'light-jeans'] }; },
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
