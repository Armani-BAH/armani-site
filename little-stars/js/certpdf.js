/* ============================================================
   LITTLE STARS — CERTIFICATE AS A PDF
   Printing a web page adds the website address, date, time and page
   numbers, and can split it over two pages. So the certificate is
   drawn as one A4 landscape picture and wrapped in a PDF file,
   which prints edge to edge with nothing added.
   Everything happens on the device; nothing is uploaded or saved.
   ============================================================ */
(function () {
  'use strict';
  var LS = window.LS;
  var NS = 'http://www.w3.org/2000/svg';
  var W = 2339, H = 1654;                      /* A4 landscape at 200 dpi */

  function loadImg(src) {
    return new Promise(function (res) {
      var i = new Image();
      i.onload = function () { res(i); };
      i.onerror = function () { res(null); };
      i.src = src;
    });
  }
  var cache = {};
  function asset(src) { if (!cache[src]) cache[src] = loadImg(src); return cache[src]; }
  var eagleData = null;
  function eagleURL() {
    if (eagleData) return Promise.resolve(eagleData);
    return fetch('assets/logo/eagle.png').then(function (r) { return r.blob(); }).then(function (b) {
      return new Promise(function (res) { var fr = new FileReader(); fr.onload = function () { eagleData = fr.result; res(eagleData); }; fr.readAsDataURL(b); });
    }).catch(function () { return null; });
  }

  /* the child's T-shirt / dress as a picture */
  async function teeImage(design) {
    var eg = await eagleURL();
    var svg = LS.tee(design).querySelector('svg').cloneNode(true);
    svg.setAttribute('xmlns', NS); svg.setAttribute('width', 400); svg.setAttribute('height', 400); svg.setAttribute('viewBox', '0 0 200 200');
    Array.prototype.forEach.call(svg.querySelectorAll('image'), function (im) { if (eg) im.setAttribute('href', eg); });
    design.stickers.forEach(function (s) {
      var x = s.x * 2, y = s.y * 2;
      if (s.k === 'EAGLE') {
        if (!eg) return;
        var im = document.createElementNS(NS, 'image');
        im.setAttribute('href', eg); im.setAttribute('x', x - 26); im.setAttribute('y', y - 13); im.setAttribute('width', 52); im.setAttribute('height', 26);
        svg.appendChild(im);
      } else {
        var tx = document.createElementNS(NS, 'text');
        tx.setAttribute('x', x); tx.setAttribute('y', y); tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('dominant-baseline', 'central');
        tx.setAttribute('font-size', 30); tx.textContent = s.k;
        svg.appendChild(tx);
      }
    });
    var str = new XMLSerializer().serializeToString(svg);
    return loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str));
  }

  function setFont(ctx, style, weight, size, family) { ctx.font = style + ' ' + weight + ' ' + Math.round(size) + 'px ' + family; }
  /* shrink the text until it fits */
  function fit(ctx, text, style, weight, size, family, maxW) {
    for (var i = 0; i < 40; i++) { setFont(ctx, style, weight, size, family); if (ctx.measureText(text).width <= maxW) break; size *= 0.95; }
    return size;
  }
  /* text with letter spacing, centred (Latin only) */
  function spaced(ctx, text, cx, y, gap) {
    var chars = text.split(''), widths = chars.map(function (c) { return ctx.measureText(c).width; });
    var total = widths.reduce(function (a, b) { return a + b; }, 0) + gap * (chars.length - 1), x = cx - total / 2;
    var start = x;
    ctx.textAlign = 'left';
    chars.forEach(function (c, i) { ctx.fillText(c, x, y); x += widths[i] + gap; });
    ctx.textAlign = 'center';
    return [start, start + total];
  }

  LS.drawCertificate = async function () {
    var ar = LS.state.lang === 'ar';
    var display = ar ? 'Tajawal' : '"Bodoni Moda"', body = ar ? 'Tajawal' : 'Jost';
    try {
      await Promise.all([
        document.fonts.load('500 80px "Bodoni Moda"'), document.fonts.load('400 80px "Bodoni Moda"'),
        document.fonts.load('300 40px Jost'), document.fonts.load('400 40px Jost'), document.fonts.load('500 40px Jost'),
        document.fonts.load('400 40px Tajawal'), document.fonts.load('500 40px Tajawal'), document.fonts.load('700 40px Tajawal')
      ]);
    } catch (e) { /* draw with whatever fonts are ready */ }

    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var g = c.getContext('2d');
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    if (ar) g.direction = 'rtl';

    /* paper and borders */
    g.fillStyle = '#fbf9f4'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#111'; g.lineWidth = 3;
    g.strokeRect(W * 0.024, H * 0.024, W * 0.952, H * 0.952);
    g.strokeStyle = '#ffb703'; g.lineWidth = 3;
    g.strokeRect(W * 0.034, H * 0.034, W * 0.932, H * 0.932);
    g.strokeRect(W * 0.034 + 9, H * 0.034 + 9, W * 0.932 - 18, H * 0.932 - 18);

    var cx = W / 2;

    /* logo */
    var logo = await asset('assets/logo/emporio-armani-logo.png');
    if (logo) {
      var lw = W * 0.40, lh = lw * logo.height / logo.width;
      g.drawImage(logo, cx - lw / 2, H * 0.135, lw, lh);
    }

    /* LITTLE STAR — rainbow */
    var title = ar ? LS.t('certTitle') : LS.t('certTitle').toUpperCase();
    var tsize = ar ? H * 0.085 : H * 0.068;
    setFont(g, 'normal', ar ? 700 : 500, tsize, display);
    var range;
    var grad = function (x0, x1) {
      var gr = g.createLinearGradient(x0, 0, x1, 0);
      [['0', '#ff5fa2'], ['.25', '#ff9f1c'], ['.45', '#ffc21f'], ['.62', '#2fbf7a'], ['.8', '#3aa8e8'], ['1', '#8b6cf0']].forEach(function (s) { gr.addColorStop(+s[0], s[1]); });
      return gr;
    };
    if (ar) {
      var tw = g.measureText(title).width;
      g.fillStyle = grad(cx - tw / 2, cx + tw / 2);
      g.fillText(title, cx, H * 0.29);
    } else {
      var gap = tsize * 0.17, chars = title.split(''), totalW = chars.reduce(function (a, ch) { return a + g.measureText(ch).width; }, 0) + gap * (chars.length - 1);
      g.fillStyle = grad(cx - totalW / 2, cx + totalW / 2);
      range = spaced(g, title, cx, H * 0.285, gap);
    }

    /* five stars */
    var cols = ['#ff6fb5', '#ffb703', '#ffb703', '#ffb703', '#3aa8e8'];
    setFont(g, 'normal', 400, H * 0.034, 'Jost, sans-serif');
    cols.forEach(function (col, i) { g.fillStyle = col; g.fillText('★', cx + (i - 2) * H * 0.058, H * 0.35); });

    /* awarded to */
    g.fillStyle = '#666';
    setFont(g, 'normal', 400, H * 0.021, body);
    if (ar) g.fillText(LS.t('certAward'), cx, H * 0.405);
    else spaced(g, LS.t('certAward').toUpperCase(), cx, H * 0.405, H * 0.004);

    /* name */
    var name = document.getElementById('c-name').textContent || LS.t('certAnon');
    g.fillStyle = '#111';
    var ns = fit(g, name, ar ? 'normal' : 'italic', ar ? 500 : 400, H * 0.075, display, W * 0.5);
    setFont(g, ar ? 'normal' : 'italic', ar ? 500 : 400, ns, display);
    g.fillText(name, cx, H * 0.495);
    g.strokeStyle = '#ffb703'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(cx - W * 0.2, H * 0.522); g.lineTo(cx + W * 0.2, H * 0.522); g.stroke();

    /* star title */
    var rank = document.getElementById('c-rank').textContent || '';
    g.fillStyle = '#ff5fa2';
    setFont(g, 'normal', 500, H * 0.03, body);
    g.fillText(rank, cx, H * 0.575);

    /* the two lines */
    g.fillStyle = '#222';
    var l1 = LS.t('certLine1');
    fit(g, l1, 'normal', 300, H * 0.03, body, W * 0.66);
    g.fillText(l1, cx, H * 0.64);
    g.fillStyle = '#5b3cc4';
    var l2 = LS.t('certLine2');
    fit(g, l2, 'normal', 500, H * 0.044, display, W * 0.66);
    g.fillText(l2, cx, H * 0.708);

    /* signature, line and date */
    var sig = await asset('assets/signature.png');
    if (sig) {
      var sh = H * 0.095, sw = sh * sig.width / sig.height;
      if (sw > W * 0.3) { sw = W * 0.3; sh = sw * sig.height / sig.width; }
      g.drawImage(sig, cx - sw / 2, H * 0.835 - sh, sw, sh);
    } else {
      g.fillStyle = '#111'; setFont(g, 'italic', 400, H * 0.045, '"Bodoni Moda"'); g.fillText('Emporio Armani', cx, H * 0.82);
    }
    g.strokeStyle = '#b9a987'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(cx - W * 0.16, H * 0.842); g.lineTo(cx + W * 0.16, H * 0.842); g.stroke();
    g.fillStyle = '#555';
    setFont(g, 'normal', 400, H * 0.021, body);
    g.fillText(document.getElementById('c-date').textContent || '', cx, H * 0.875);

    /* photo (top-left corner) */
    var box = W * 0.1, top = H * 0.075;
    if (LS.state.photo) {
      var ph = await loadImg(LS.state.photo);
      if (ph) {
        var px = ar ? W - W * 0.065 - box : W * 0.065, r = box / 2, pcx = px + r, pcy = top + r;
        [['#ff6fb5', r + 16], ['#ffb703', r + 10], ['#ffffff', r + 5]].forEach(function (ring) {
          g.fillStyle = ring[0]; g.beginPath(); g.arc(pcx, pcy, ring[1], 0, Math.PI * 2); g.fill();
        });
        g.save(); g.beginPath(); g.arc(pcx, pcy, r, 0, Math.PI * 2); g.clip();
        var s = Math.min(ph.width, ph.height);
        g.drawImage(ph, (ph.width - s) / 2, (ph.height - s) / 2, s, s, px, top, box, box);
        g.restore();
      }
    }
    /* the child's design (top-right corner) */
    if (LS.state.design) {
      var ti = await teeImage(LS.state.design);
      if (ti) {
        var tx = ar ? W * 0.065 : W - W * 0.065 - box;
        g.drawImage(ti, tx, top, box, box);
      }
    }
    return c;
  };

  /* wrap a JPEG picture in a one-page A4 landscape PDF */
  function pdfFromJpeg(jpeg, w, h) {
    var enc = new TextEncoder(), parts = [], len = 0, offs = [];
    function add(x) { var b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; }
    function obj(n, s) { offs[n] = len; add(n + ' 0 obj\n' + s + '\nendobj\n'); }
    add('%PDF-1.4\n');
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 841.89 595.28] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
    offs[4] = len;
    add('4 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + w + ' /Height ' + h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpeg.length + ' >>\nstream\n');
    add(jpeg);
    add('\nendstream\nendobj\n');
    var content = 'q 841.89 0 0 595.28 0 0 cm /Im0 Do Q';
    obj(5, '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream');
    var xref = len;
    var x = 'xref\n0 6\n0000000000 65535 f \n';
    for (var i = 1; i <= 5; i++) x += ('0000000000' + offs[i]).slice(-10) + ' 00000 n \n';
    add(x + 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF');
    return new Blob(parts, { type: 'application/pdf' });
  }

  LS.makeCertificatePdf = async function () {
    var c = await LS.drawCertificate();
    var blob = await new Promise(function (res) { c.toBlob(res, 'image/jpeg', 0.92); });
    var bytes = new Uint8Array(await blob.arrayBuffer());
    return pdfFromJpeg(bytes, c.width, c.height);
  };
})();
