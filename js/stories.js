/* Stories on the home page — a row of round "sections"; tap one to flip through new pieces (chosen automatically).
   Load AFTER js/app.js and js/advisor.js (see index.html).

   Where the pieces come from: chosen by the site itself from the FW26 pieces (SECTIONS below); the mix changes weekly.

   Uses from app.js: PRODUCTS, ID_INDEX, findByToken, state, toggleSelect, openDrawer, sized, esc, t, IS_AR,
   genderLabel, catLabel, displayGender, gSlug, slug, ref, track. */
(function () {
  "use strict";

  var SLIDE_MS = 6000;              /* time on each piece */
  var SEEN_KEY = "ea_story_seen";   /* which sections this phone has already opened */
  var strip = document.getElementById("storyStrip");
  if (!strip) return;

  var cfg = null;                   /* { owner: advisor|null, sections: [{title, titleAr, cover, items:[product]}] } */
  var seen = {};
  try { seen = JSON.parse(localStorage.getItem(SEEN_KEY) || "{}"); } catch (e) {}

  /* ---------- wait until app.js has loaded the catalogue ---------- */
  var tries = 0;
  (function wait() {
    if (typeof PRODUCTS !== "undefined" && PRODUCTS.length && typeof ID_INDEX !== "undefined" && ID_INDEX.size) return start();
    if (++tries < 150) setTimeout(wait, 100);
  })();

  /* The pieces are chosen by the site itself — nothing to maintain.
     Each section takes FW26 pieces that have a photo, mixes departments/types, and the mix changes every week. */
  var SECTIONS = [
    { title: "Women",          titleAr: "نساء",                parts: [[["WOMAN"], ["READY TO WEAR"], 8]] },
    { title: "Men",            titleAr: "رجال",                parts: [[["MAN", "UNISEX"], ["READY TO WEAR"], 8]] },
    { title: "Bags & leather", titleAr: "حقائب ومنتجات جلدية", parts: [[["WOMAN"], ["LEATHER GOODS"], 4], [["MAN", "UNISEX"], ["LEATHER GOODS"], 4]] },
    { title: "Shoes",          titleAr: "أحذية",               parts: [[["WOMAN"], ["SHOES"], 4], [["MAN", "UNISEX"], ["SHOES"], 4]] },
    { title: "Kids",           titleAr: "أطفال",               parts: [[["GIRL"], ["READY TO WEAR"], 3], [["BOY"], ["READY TO WEAR"], 3]] },
    { title: "Accessories",    titleAr: "إكسسوارات",           parts: [[["WOMAN"], ["SOFT ACCESSORIES", "TEXTILE ACCESSORIES"], 3], [["MAN", "UNISEX"], ["SOFT ACCESSORIES", "TEXTILE ACCESSORIES"], 3]] }
  ];
  var week = Math.floor((Date.now() + 3 * 36e5) / 6048e5);        /* changes every 7 days (Bahrain time) */
  function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

  function choose(genders, cats, n, seed) {
    var pool = PRODUCTS.filter(function (p) {
      return p.isNew && p.images && p.images.length && genders.indexOf(p.gender) >= 0 && cats.indexOf(p.category) >= 0;
    });
    var rand = rng(seed), i, j, tmp;
    for (i = pool.length - 1; i > 0; i--) { j = Math.floor(rand() * (i + 1)); tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp; }
    var out = [], styles = {}, kinds = {};
    for (var cap = 1; cap <= 3 && out.length < n; cap++) {
      pool.forEach(function (p) {
        if (out.length >= n || styles[p.styleCode] || (kinds[p.sub] || 0) >= cap) return;
        styles[p.styleCode] = 1; kinds[p.sub] = (kinds[p.sub] || 0) + 1; out.push(p);
      });
    }
    return out;
  }

  function start() {
    var sections = [];
    SECTIONS.forEach(function (def, i) {
      var lists = def.parts.map(function (pt, k) { return choose(pt[0], pt[1], pt[2], week * 97 + i * 13 + k); });
      var items = [];
      for (var r = 0; r < 12; r++) lists.forEach(function (l) { if (l[r]) items.push(l[r]); });   /* alternate between the lists */
      if (items.length) sections.push({ id: i, title: def.title, titleAr: def.titleAr, items: items });
    });
    if (!sections.length) return;
    cfg = { owner: null, sections: sections };
    renderStrip();
  }

  var titleOf = function (s) { return (IS_AR && s.titleAr) ? s.titleAr : s.title; };
  var ownerLine = function () { return t("New this season"); };
  /* changes when the pieces change, so a refreshed section shows as new again */
  var sig = function (s) { return (cfg.owner ? cfg.owner.id : "boutique") + ":" + s.id + ":" + s.items.length + ":" + s.items[0].id; };
  var isSeen = function (s) { return seen[(cfg.owner ? cfg.owner.id : "boutique") + ":" + s.id] === sig(s); };
  function markSeen(s) {
    seen[(cfg.owner ? cfg.owner.id : "boutique") + ":" + s.id] = sig(s);
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(seen)); } catch (e) {}
  }

  /* ---------- the row of circles ---------- */
  function renderStrip() {
    strip.innerHTML = cfg.sections.map(function (s, i) {
      return '<button type="button" class="story-ring' + (isSeen(s) ? " seen" : "") + '" data-i="' + i + '" aria-label="' + esc(titleOf(s)) + '">' +
        '<span class="story-ring-pic"><img src="' + esc(sized(s.items[0].images[0], 240)) + '" alt="" loading="lazy" decoding="async"></span>' +
        '<span class="story-ring-label">' + esc(titleOf(s)) + '</span></button>';
    }).join("");
    strip.hidden = false;
  }
  strip.addEventListener("click", function (e) {
    var b = e.target.closest(".story-ring"); if (b && cfg) open(+b.dataset.i, 0, "home");
  });

  /* ---------- the viewer ---------- */
  var el = null, S = 0, P = 0, elapsed = 0, last = 0, held = false, raf = 0, downAt = 0;

  function build() {
    el = document.createElement("div");
    el.className = "story"; el.hidden = true;
    el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
    el.innerHTML =
      '<div class="story-stage">' +
        '<div class="story-bars" id="stBars"></div>' +
        '<div class="story-head">' +
          '<span class="story-avatar"><img id="stAvatar" alt=""></span>' +
          '<span class="story-title"><b id="stTitle"></b><small id="stOwner"></small></span>' +
          '<button type="button" class="story-x" id="stClose" aria-label="' + esc(t("Close")) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg></button>' +
        '</div>' +
        '<div class="story-media"><img id="stImgA" alt=""><img id="stImgB" alt=""></div>' +
        '<button type="button" class="story-zone prev" id="stPrev" aria-label="' + esc(t("Previous")) + '"></button>' +
        '<button type="button" class="story-zone next" id="stNext" aria-label="' + esc(t("Next")) + '"></button>' +
        '<div class="story-foot">' +
          '<div class="story-info"><b id="stName"></b><small id="stCat"></small></div>' +
          '<div class="story-actions">' +
            '<button type="button" class="story-add" id="stAdd"></button>' +
            '<button type="button" class="story-view" id="stView">' + esc(t("View piece")) + '</button>' +
          '</div>' +
          '<button type="button" class="story-sel" id="stSel"></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);

    var q = function (id) { return document.getElementById(id); };
    q("stClose").addEventListener("click", close);
    q("stPrev").addEventListener("click", function () { IS_AR ? next() : prev(); });
    q("stNext").addEventListener("click", function () { IS_AR ? prev() : next(); });
    q("stAdd").addEventListener("click", function () {
      var p = cur(); if (!p) return;
      var was = state.selected.has(p.id);
      toggleSelect(p.id);
      if (!was) track("story_add", { items: [itemInfo(p)], story_section: cfg.sections[S].title });
      paintFoot();
    });
    q("stView").addEventListener("click", function () {
      var p = cur(); if (!p) return;
      track("story_view_piece", { items: [itemInfo(p)], story_section: cfg.sections[S].title });
      close();
      history.pushState(null, "", "#/" + gSlug(displayGender(p.gender)) + "/" + slug(p.category) + "?p=" + ref(p));
      route();
    });
    q("stSel").addEventListener("click", function () { openDrawer(); });

    /* hold to pause, swipe down to close, swipe sideways = other section */
    var sx = 0, sy = 0, st = 0;
    var stage = el.querySelector(".story-stage");
    stage.addEventListener("pointerdown", function (e) { if (e.target.closest("button:not(.story-zone)")) return; held = true; downAt = Date.now(); });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
      stage.addEventListener(ev, function () {
        if (held && Date.now() - downAt > 350) suppressClick();      /* a long press only pauses, it does not turn the page */
        held = false;
      });
    });
    stage.addEventListener("touchstart", function (e) { var t0 = e.touches[0]; sx = t0.clientX; sy = t0.clientY; st = Date.now(); }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      var t1 = e.changedTouches[0], dx = t1.clientX - sx, dy = t1.clientY - sy;
      if (Date.now() - st > 700) return;
      if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) { suppressClick(); close(); }
      else if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) { suppressClick(); (dx < 0) !== IS_AR ? section(1) : section(-1); }
    }, { passive: true });

    document.addEventListener("keydown", function (e) {
      if (el.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") IS_AR ? prev() : next();
      else if (e.key === "ArrowLeft") IS_AR ? next() : prev();
    });
    document.addEventListener("visibilitychange", function () { last = 0; });
  }
  /* a swipe also produces a click on the tap zones — ignore that one */
  var noClickUntil = 0;
  function suppressClick() { noClickUntil = Date.now() + 400; }
  document.addEventListener("click", function (e) {
    if (Date.now() < noClickUntil && el && el.contains(e.target)) { e.stopPropagation(); e.preventDefault(); }
  }, true);

  var cur = function () { return cfg && cfg.sections[S] ? cfg.sections[S].items[P] : null; };

  function open(s, p, from) {
    if (!el) build();
    S = s; P = p || 0;
    markSeen(cfg.sections[S]);
    var ring = strip.querySelector('.story-ring[data-i="' + S + '"]'); if (ring) ring.classList.add("seen");
    if (from) track("story_open", { story_section: cfg.sections[S].title, story_owner: cfg.owner ? cfg.owner.id : "boutique" });
    el.hidden = false; document.body.style.overflow = "hidden"; document.body.classList.add("story-open");
    paintSection(); paintSlide(true);
    cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(tick);
    document.getElementById("stClose").focus();
  }
  function close() {
    if (!el || el.hidden) return;
    el.hidden = true; cancelAnimationFrame(raf); document.body.classList.remove("story-open");
    if (!document.querySelector("#drawer.open, #modalOverlay.open")) document.body.style.overflow = "";
  }
  function section(d) {
    var n = S + d;
    if (n < 0) { elapsed = 0; return paintSlide(); }
    if (n >= cfg.sections.length) return close();
    open(n, 0);
  }
  function next() {
    if (P < cfg.sections[S].items.length - 1) { P++; paintSlide(); } else section(1);
  }
  function prev() {
    if (elapsed > 1500) { elapsed = 0; return paintSlide(); }
    if (P > 0) { P--; return paintSlide(); }
    section(-1);
  }

  function paintSection() {
    var s = cfg.sections[S];
    document.getElementById("stTitle").textContent = titleOf(s);
    document.getElementById("stOwner").textContent = ownerLine();
    document.getElementById("stAvatar").src = sized(s.items[0].images[0], 120);
    el.setAttribute("aria-label", titleOf(s));
    document.getElementById("stBars").innerHTML = s.items.map(function () { return "<i><u></u></i>"; }).join("");
  }
  function paintFoot() {
    var p = cur(); if (!p) return;
    var on = state.selected.has(p.id), btn = document.getElementById("stAdd");
    btn.classList.toggle("on", on);
    btn.innerHTML = heartSVG() + "<span>" + esc(on ? t("In your selection") : t("Add to my selection")) + "</span>";
    var n = state.selected.size, sel = document.getElementById("stSel");
    sel.hidden = !n; sel.textContent = t("My selection") + " · " + n;
  }
  function paintSlide(fresh) {
    var s = cfg.sections[S], p = s.items[P];
    elapsed = 0; last = 0;
    /* two stacked photos, cross-faded, so there is no white flash while the next one loads */
    var a = document.getElementById("stImgA"), b = document.getElementById("stImgB");
    var incoming = fresh ? a : (a.classList.contains("show") ? b : a), outgoing = incoming === a ? b : a;
    incoming.alt = p.name; incoming.src = sized(p.images[0], 1000);
    incoming.className = "show"; outgoing.className = "";
    var bars = el.querySelectorAll(".story-bars i");
    bars.forEach(function (bar, i) { bar.className = i < P ? "done" : ""; bar.firstChild.style.width = i < P ? "100%" : "0%"; });
    document.getElementById("stName").textContent = p.name;
    document.getElementById("stCat").textContent = genderLabel(displayGender(p.gender)) + " · " + catLabel(p.category);
    paintFoot();
    for (var k = 1; k <= 2; k++) { var nx = s.items[P + k]; if (nx) { var im = new Image(); im.src = sized(nx.images[0], 1000); } }
  }

  /* the timer: runs only while nothing is holding it (finger down, selection panel open, tab hidden) */
  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (el.hidden) return;
    var paused = held || document.hidden || document.querySelector("#drawer.open, #modalOverlay.open, #sendChoice:not([hidden])");
    if (last && !paused) elapsed += now - last;
    last = now;
    var bar = el.querySelectorAll(".story-bars i u")[P];
    if (bar) bar.style.width = Math.min(100, elapsed / SLIDE_MS * 100) + "%";
    if (elapsed >= SLIDE_MS) next();
  }
})();
