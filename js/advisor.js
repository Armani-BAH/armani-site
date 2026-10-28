/* Personal advisor links:  https://www.eawishlist.com/?a=mohammed#/
   Load AFTER js/advisors-data.js and js/app.js (see index.html).

   What it does
   1. Reads ?a=<id> from the link and checks it against the advisors list (js/advisors-data.js).
      Unknown ids are ignored, and a phone number is never taken from the URL.
   2. Remembers the advisor on the client's phone for 30 days (localStorage "ea_advisor").
      Opening another advisor's link replaces it. A printed shop QR code (utm_medium=qr) clears it.
   3. Sends "Chat with us", "Send to your Client Advisor" and the footer WhatsApp link to that advisor.
      (app.js reads STORE.whatsapp when the button is tapped, so changing it here is enough.)
   4. Analytics: window.EA_ADVISOR is read by track() in app.js, so every event carries advisor=<id>;
      one "advisor_link_open" event is sent when the link is opened.
   5. Shared links keep ?a=<id> (SITE_URL() in app.js reads window.EA_ADVISOR).

   Visitors without an advisor: this file does nothing and the boutique number is used. */
(function () {
  "use strict";

  var KEY = "ea_advisor";
  var DAYS = 30;
  var list = window.EA_ADVISORS || [];

  function find(id) {
    id = String(id || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* The printed shop QR codes arrive as ?utm_medium=qr (via /qr/), the first counter card as ?utm_source=qr&utm_medium=store */
  function isShopQr(qs) {
    var medium = qs.get("utm_medium"), source = qs.get("utm_source");
    return medium === "qr" || (medium === "store" && source === "qr");
  }

  /* 1 + 2. Which advisor? The link first, then the one saved on this phone. */
  var adv = null, fromLink = false;
  try {
    var qs = new URLSearchParams(location.search);
    adv = qs.get("a") ? find(qs.get("a")) : null;            /* unknown id = ignored, as if it was not there */
    if (adv) {
      fromLink = true;
      localStorage.setItem(KEY, JSON.stringify({ id: adv.id, t: Date.now() }));
    } else if (isShopQr(qs)) {
      localStorage.removeItem(KEY);                           /* shop QR = boutique: forget any saved advisor */
    } else {
      var saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved && Date.now() - saved.t < DAYS * 864e5) adv = find(saved.id);
    }
  } catch (e) {}
  if (!adv) return;                                           /* normal visitor: nothing changes (boutique number) */

  /* app.js (shared links, analytics) reads this */
  window.EA_ADVISOR = adv;

  /* 3. Point the WhatsApp buttons at the advisor. */
  if (typeof STORE !== "undefined" && STORE && STORE.whatsapp) {
    var MAIN = STORE.whatsapp, TARGET = adv.whatsapp;
    STORE.whatsapp = TARGET;                                  /* "Send to ..." reads this when tapped */

    var fab = document.getElementById("chatFab");             /* floating "Chat with us": href was built at start-up */
    if (fab && fab.getAttribute("href")) {
      fab.setAttribute("href", fab.getAttribute("href").split("wa.me/" + MAIN).join("wa.me/" + TARGET));
    }

    var nm = document.getElementById("sendStoreName");        /* "Send to <name>" in the pop-up */
    if (nm) nm.textContent = (document.documentElement.lang === "ar" && adv.nameAr) ? adv.nameAr : adv.name;

    if (typeof renderStoreInfo === "function") renderStoreInfo();   /* footer + home-page WhatsApp link */
  }

  /* 4. Analytics: one event per link open (a reload or language switch in the same tab is not counted again). */
  if (fromLink && typeof track === "function") {
    var seen = false;
    try {
      seen = sessionStorage.getItem("ea_adv_open") === adv.id;
      sessionStorage.setItem("ea_adv_open", adv.id);
    } catch (e) {}
    if (!seen) track("advisor_link_open", {});
  }
})();
