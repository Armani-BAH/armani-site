/* ============================================================
   LITTLE STARS — EMPORIO THE STAR (the guide) + T-SHIRT DRAWING
   Emporio is an original character drawn in code, no image file.
   ============================================================ */
(function () {
  'use strict';
  var LS = window.LS;

  var STAR = '<svg viewBox="0 0 120 120" aria-hidden="true">' +
    '<defs><radialGradient id="gio" cx="40%" cy="32%" r="75%"><stop offset="0" stop-color="#fff6b0"/><stop offset=".55" stop-color="#ffd23f"/><stop offset="1" stop-color="#ffa51a"/></radialGradient></defs>' +
    '<path d="M60 12 L73 45 L108 48 L81 71 L90 105 L60 86 L30 105 L39 71 L12 48 L47 45 Z" fill="url(#gio)" stroke="#ffbf2e" stroke-width="12" stroke-linejoin="round"/>' +
    '<path d="M60 12 L73 45 L108 48 L81 71 L90 105 L60 86 L30 105 L39 71 L12 48 L47 45 Z" fill="url(#gio)"/>' +
    '<g class="eyes"><ellipse cx="49" cy="57" rx="4.6" ry="6.4" fill="#2b1a4f"/><ellipse cx="71" cy="57" rx="4.6" ry="6.4" fill="#2b1a4f"/>' +
    '<circle cx="50.6" cy="54.6" r="1.7" fill="#fff"/><circle cx="72.6" cy="54.6" r="1.7" fill="#fff"/></g>' +
    '<circle cx="40" cy="67" r="5" fill="#ff8fc7" opacity=".75"/><circle cx="80" cy="67" r="5" fill="#ff8fc7" opacity=".75"/>' +
    '<path class="smile" d="M51 69 Q60 79 69 69" fill="none" stroke="#2b1a4f" stroke-width="3.4" stroke-linecap="round"/>' +
    '<ellipse class="oh" cx="60" cy="73" rx="4" ry="5" fill="#2b1a4f"/></svg>';

  /* Emporio the guide: now the plain Emporio Armani eagle (no face). mood: 'happy' or 'oops'.
     To bring back the smiling star, swap the two lines marked below. */
  LS.mascot = function (mood, cls) {
    var d = LS.el('div', 'mascot eagle-mascot ' + (mood || 'happy') + ' ' + (cls || ''));
    d.appendChild(LS.eagleMark());          /* star version: d.innerHTML = STAR; */
    return d;
  };
  /* Emporio with a speech bubble */
  LS.guide = function (text, cls) {
    var g = LS.el('div', 'guide ' + (cls || ''));
    var m = LS.mascot('happy');
    m.addEventListener('click', function () {
      LS.unlockAudio(); LS.sfx.star();
      m.classList.remove('spin'); void m.offsetWidth; m.classList.add('spin');
    });
    g.appendChild(m);
    g.appendChild(LS.el('div', 'bubble', text));
    return g;
  };

  /* ---------- the Emporio Armani eagle (cut from the official logo), in any colour ---------- */
  var EAGLE_COLOURS = [['#ff5fa2', '#ffb3da'], ['#3aa8e8', '#8fe0fa'], ['#2fbf7a', '#7df0bd'], ['#8b6cf0', '#cdbcff'],
    ['#ff8c1a', '#ffd23f'], ['#ff4d4d', '#ffa3a3'], ['#1fb5a8', '#7fe3d8'], ['#ff6fb5', '#a78bfa'], ['#4cc9f0', '#3ddc97']];
  LS.eagle = function (cls, colours) {
    var w = LS.el('span', 'eagle-wrap ' + (cls || ''));
    var i = LS.el('span', 'eagle-ic');
    var c = colours || LS.rand(EAGLE_COLOURS);
    if (cls !== 'gold') i.style.background = 'linear-gradient(135deg, ' + c[0] + ', ' + c[1] + ')';
    w.appendChild(i);
    return w;
  };

  /* LS.ea = the small star symbol; LS.eagleMark = the Emporio Armani eagle, kept for special moments only
     (results badge, certificate, gift, eagle-catch games). cls 'cur' = takes the colour of the text around it */
  LS.ea = function (cls) { return LS.el('span', 'sym' + (cls ? ' ' + cls : ''), '★'); };
  LS.eagleMark = function (cls) { return LS.el('span', 'ea' + (cls ? ' ' + cls : '')); };
  /* put text into a node, turning every ★ into an eagle */
  LS.fill = function (node, text, cls) {
    while (node.firstChild) node.removeChild(node.firstChild);
    String(text).split('★').forEach(function (part, i) {
      if (i) node.appendChild(LS.ea(cls));
      if (part) node.appendChild(document.createTextNode(part));
    });
    return node;
  };

  /* ---------- the T-shirt a child designs ---------- */
  var DRESS = 'M78 18 Q100 38 122 18 L160 40 L150 70 L130 62 L128 92 L172 178 Q100 198 28 178 L72 92 L70 62 L50 70 L40 40 Z';
  var TEE = 'M70 20 Q100 44 130 20 L185 50 L165 92 L142 80 L142 180 Q142 186 136 186 L64 186 Q58 186 58 180 L58 80 L35 92 L15 50 Z';
  var DEFS = '<defs>' +
    '<pattern id="tp-stripes" width="200" height="26" patternUnits="userSpaceOnUse"><rect width="200" height="11" fill="#ffffff" opacity=".55"/></pattern>' +
    '<pattern id="tp-dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="13" cy="13" r="5" fill="#ffffff" opacity=".6"/></pattern>' +
    '<pattern id="tp-stars" width="40" height="28" patternUnits="userSpaceOnUse"><image href="assets/logo/eagle.png" x="5" y="6" width="30" height="17" opacity=".65"/></pattern>' +
    '<pattern id="tp-hearts" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M15 23 C4 15 6 7 11 7 c2.5 0 4 2 4 2 s1.5-2 4-2 c5 0 7 8-4 16z" fill="#ffffff" opacity=".6"/></pattern>' +
    '<pattern id="tp-checks" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#ffffff" opacity=".45"/><rect x="14" y="14" width="14" height="14" fill="#ffffff" opacity=".45"/></pattern>' +
    '<pattern id="tp-rainbow" width="200" height="60" patternUnits="userSpaceOnUse"><rect y="0" width="200" height="10" fill="#ff6b6b" opacity=".7"/><rect y="10" width="200" height="10" fill="#ffd23f" opacity=".7"/><rect y="20" width="200" height="10" fill="#3ddc97" opacity=".7"/><rect y="30" width="200" height="10" fill="#4cc9f0" opacity=".7"/><rect y="40" width="200" height="10" fill="#a78bfa" opacity=".7"/></pattern>' +
    '<pattern id="tp-zigzag" width="28" height="22" patternUnits="userSpaceOnUse"><path d="M0 16 L7 6 L14 16 L21 6 L28 16" fill="none" stroke="#ffffff" stroke-width="4" opacity=".6"/></pattern>' +
    '</defs>';
  LS.TEE_COLOURS = ['#4cc9f0', '#ff8fc7', '#ffd23f', '#3ddc97', '#a78bfa', '#ff6b6b', '#ff9f1c', '#2ec4b6', '#e9dcc4', '#b0b6c3', '#ffffff', '#1f2340'];
  LS.TEE_PATTERNS = ['plain', 'stripes', 'dots', 'stars', 'hearts', 'checks', 'zigzag', 'rainbow'];
  LS.TEE_STICKERS = ['⭐', '❤️', '⚡', '🌈', '👑', '🦋', '🚀', '⚽', '🦄', '🎀', '🌸', '🐻', '🦖', '🍭', '🎈', 'EAGLE'];

  LS.tee = function (design) {
    var d = LS.el('div', 'tee');
    var dress = design.shape === 'dress', shape = dress ? DRESS : TEE;
    var pat = design.pattern && design.pattern !== 'plain' ? 'url(#tp-' + design.pattern + ')' : 'none';
    d.innerHTML = '<svg viewBox="0 0 200 200" aria-hidden="true">' + DEFS +
      '<path d="' + shape + '" fill="' + design.color + '" stroke="#00000030" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="' + shape + '" fill="' + pat + '"/>' +
      (dress ? '<path d="M78 18 Q100 38 122 18" fill="none" stroke="#00000033" stroke-width="5" stroke-linecap="round"/><path d="M72 92 Q100 100 128 92" fill="none" stroke="#00000030" stroke-width="4" stroke-linecap="round"/>'
             : '<path d="M70 20 Q100 44 130 20" fill="none" stroke="#00000033" stroke-width="5" stroke-linecap="round"/>') + '</svg>';
    design.stickers.forEach(function (s) {
      var n = LS.el('span', 'sticker', s.k === 'EAGLE' ? null : s.k);
      if (s.k === 'EAGLE') n.appendChild(LS.eagleMark());
      n.style.left = s.x + '%'; n.style.top = s.y + '%';
      d.appendChild(n);
    });
    return d;
  };
})();
