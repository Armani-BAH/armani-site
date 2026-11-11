/* MINI-GAME 5 — LITTLE STAR CHALLENGE
   Four quick tasks, one from each earlier game. Older children get a bonus
   star for answering before the timer bar runs out (nothing is lost if it does). */
(function () {
  'use strict';
  var LS = window.LS;

  LS.games.challenge = async function () {
    var junior = LS.isJunior(), n = junior ? 2 : 3, secs = junior ? 0 : 10, r;
    var kick = function (i) { return LS.t('task', { n: i }); };
    var bonus = function (res) { return (!junior && res.inTime) ? 1 : 0; };

    /* 1. match a product picture */
    var cat = LS.rand(['tops', 'jackets', 'accessories', 'dresses']);
    var pool = LS.byCat(cat).filter(function (x) { return x !== 'three-tees' && x !== 'eagle-tees'; });
    var target = LS.rand(pool);
    r = await LS.choice({
      kicker: kick(1), prompt: LS.t('chSame'), target: target, correct: [target], seconds: secs,
      options: LS.shuffle([target].concat(LS.sample(pool.filter(function (x) { return x !== target; }), n)))
    });
    LS.score(r, bonus(r));

    /* 2. a picture quiz question */
    r = await LS.ask(LS.pickQuestions(1)[0], { kicker: kick(2), seconds: secs });
    LS.score(r, bonus(r));

    /* 3. a quick memory match */
    await LS.memory(junior ? 4 : 6, { kicker: kick(3), prompt: LS.t('chMemory') });

    /* 4. a matching fashion combination (a look not used earlier, when possible) */
    var fresh = LS.LOOKS.filter(function (l) { return LS.state.usedLooks.indexOf(l.id) < 0; });
    var look = LS.rand(fresh.length ? fresh : LS.LOOKS);
    r = await LS.choice({
      kicker: kick(4), prompt: LS.t('chCombo'), target: look.top, correct: [look.bottom.ok], seconds: secs,
      options: LS.shuffle([look.bottom.ok].concat(LS.sample(look.bottom.no, n)))
    });
    LS.score(r, bonus(r));

    /* bonus round: catch the falling stars */
    var c = await LS.catchGame();
    LS.state.caught = c.caught;
  };
})();
