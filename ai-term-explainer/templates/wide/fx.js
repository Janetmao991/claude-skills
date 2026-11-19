/* Hand-drawn polish on top of sketch.js (all seek-safe: everything is a function of timeline time).
   1. Pen: a marker whose tip rides along every SK.draw stroke and across every SK.write word.
      SK.penStart(container, w, h, hostStart) … SK.penFinish(tl) inside a composition.
      Off by default (SK.SHOW_PEN = false): penStart/penFinish still log strokes for camera + sound.
   2. Camera: SK.camera(tl, "#cam", hostStart) pushes toward what the voice is talking about
      (keys in window.CAMERA_KEYS, global film time).
   3. Every stroke is logged to window.__SKLOG (global time) so tools can lay sound effects on it. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  window.__SKLOG = window.__SKLOG || [];
  if (SK.SHOW_PEN === undefined) SK.SHOW_PEN = false; // set SK.SHOW_PEN = true to draw the marker again
  var P = null; // the composition currently collecting strokes

  function sample(g) {
    var ps = g.tagName === "path" ? [g] : Array.prototype.slice.call(g.querySelectorAll("path"));
    var pts = [];
    ps.forEach(function (p) {
      var L = p.getTotalLength();
      for (var i = 0; i <= 14; i++) { var q = p.getPointAtLength(L * i / 14); pts.push([q.x, q.y]); }
    });
    return pts;
  }
  function strokeColor(g) {
    var p = g.tagName === "path" ? g : g.querySelector("path");
    return (p && p.getAttribute("stroke")) || SK.C.ink;
  }

  var draw = SK.draw, write = SK.write;
  SK.draw = function (tl, g, at, dur, ease) {
    var r = draw.apply(this, arguments);
    if (P) P.strokes.push({ t: at, d: dur || 0.6, pts: sample(g), color: strokeColor(g), kind: "line" });
    return r;
  };
  SK.write = function (tl, el, at, dur) {
    var node = typeof el === "string" ? document.querySelector(el) : el;
    var n = (node.textContent || "").length, d = dur || Math.min(1.1, 0.3 + 0.035 * n);
    var r = write.call(this, tl, el, at, dur);
    if (P) {
      var fs = parseFloat(node.style.fontSize) || 40, x0 = parseFloat(node.style.left) || 0, y0 = parseFloat(node.style.top) || 0;
      var w = n * fs * 0.98, pts = [];
      for (var i = 0; i <= 24; i++) {
        var f = i / 24;
        pts.push([x0 + f * w, y0 + fs * 0.78 - Math.abs(Math.sin(f * n * Math.PI)) * fs * 0.35]);
      }
      var c = getComputedStyle(node).color;
      P.strokes.push({ t: at, d: d, pts: pts, color: /229, 70, 110|E5466E/i.test(c) ? SK.C.pink : SK.C.ink, kind: "text" });
    }
    return r;
  };

  SK.penStart = function (container, w, h, hostStart, scale, toFrame) {
    P = { strokes: [], container: container, w: w, h: h, t0: hostStart || 0, scale: scale || 1, toFrame: toFrame || [1, 0, 0] };
  };
  SK.penFinish = function (tl, total) {
    var cfg = P; P = null;
    if (!cfg || !cfg.strokes.length) return;
    var S = cfg.strokes.sort(function (a, b) { return a.t - b.t; });
    var M = cfg.toFrame;
    S.forEach(function (s) {
      var cx = 0, cy = 0; s.pts.forEach(function (q) { cx += q[0]; cy += q[1]; });
      cx /= s.pts.length; cy /= s.pts.length;
      window.__SKLOG.push({ t: +(cfg.t0 + s.t).toFixed(3), d: +s.d.toFixed(3), kind: s.kind, x: Math.round(cx * M[0] + M[1]), y: Math.round(cy * M[0] + M[2]) });
    });
    // also in the DOM, so a headless `chrome --dump-dom` can read it (tools/dump_strokes.sh)
    var box = document.getElementById("sklog") || document.body.appendChild(Object.assign(document.createElement("script"), { type: "application/json", id: "sklog" }));
    box.textContent = JSON.stringify(window.__SKLOG);
    if (!SK.SHOW_PEN) return; // pen hidden by default (Janet: it distracts); strokes are still logged above
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + cfg.w + " " + cfg.h);
    svg.style.cssText = "position:absolute;left:0;top:0;width:" + cfg.w + "px;height:" + cfg.h + "px;overflow:visible;pointer-events:none;z-index:20";
    cfg.container.appendChild(svg);
    var pen = document.createElementNS(NS, "g"), k = cfg.scale;
    pen.setAttribute("opacity", "0");
    // a whiteboard marker: tip at (0,0), body up and to the right; the band and cap take the ink colour
    pen.innerHTML =
      '<g transform="scale(' + k + ') rotate(-42)">' +
      '<path d="M8 10 L22 4 L22 18 Z" transform="translate(6,8)" fill="rgba(60,45,20,.13)"/>' +
      '<rect x="20" y="-9" width="112" height="18" rx="5" transform="translate(6,8)" fill="rgba(60,45,20,.13)"/>' +
      '<path d="M0 0 L16 -6 L16 6 Z" fill="#1E1E24"/>' +
      '<rect x="14" y="-11" width="104" height="22" rx="6" fill="#fffdf7" stroke="#1E1E24" stroke-width="3"/>' +
      '<rect class="band" x="92" y="-11" width="12" height="22" fill="#1E1E24"/>' +
      '<rect class="cap" x="116" y="-12" width="36" height="24" rx="7" fill="#1E1E24" stroke="#1E1E24" stroke-width="3"/>' +
      "</g>";
    svg.appendChild(pen);
    var band = pen.querySelector(".band"), cap = pen.querySelector(".cap");
    var at = function (s, f) {
      var pts = s.pts, x = f * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(x)), u = x - i;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u];
    };
    var ease = function (u) { return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; };
    var clock = { t: 0 };
    tl.fromTo(clock, { t: 0 }, {
      t: total, duration: total, ease: "none",
      onUpdate: function () {
        var T = clock.t, cur = null, prev = null, next = null;
        for (var i = 0; i < S.length; i++) {
          var s = S[i];
          if (s.t <= T && T < s.t + s.d) cur = s;
          if (s.t + s.d <= T && (!prev || s.t + s.d > prev.t + prev.d)) prev = s;
          if (s.t > T && !next) next = s;
        }
        var pos, op = 0, col = SK.C.ink, lift = 0;
        if (cur) { pos = at(cur, Math.min(1, (T - cur.t) / cur.d)); op = 1; col = cur.color; }
        else if (prev && next && next.t - (prev.t + prev.d) < 0.7) {
          // travel between strokes, lifted off the paper
          var a = at(prev, 1), b = at(next, 0), u = ease((T - prev.t - prev.d) / (next.t - prev.t - prev.d));
          pos = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; op = 1; col = next.color; lift = Math.sin(u * Math.PI) * 14;
        } else if (prev && T - (prev.t + prev.d) < 0.3) { pos = at(prev, 1); op = 1 - (T - prev.t - prev.d) / 0.3; col = prev.color; lift = (1 - op) * 18; }
        else if (next && next.t - T < 0.25) { pos = at(next, 0); op = 1 - (next.t - T) / 0.25; col = next.color; lift = (1 - op) * 18; }
        if (!pos) { pen.setAttribute("opacity", "0"); return; }
        pen.setAttribute("opacity", op.toFixed(3));
        pen.setAttribute("transform", "translate(" + (pos[0] + lift * 0.4).toFixed(1) + "," + (pos[1] - lift).toFixed(1) + ")");
        band.setAttribute("fill", col); cap.setAttribute("fill", col);
      },
    }, 0);
  };

  /* camera: keys {t, d, cx, cy, s} — push so (cx, cy) stays put while scaling by s */
  SK.camera = function (tl, sel, hostStart, dur) {
    var K = (window.CAMERA_KEYS || []).slice().sort(function (a, b) { return a.t - b.t; });
    var ease = function (u) { return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; };
    var state = function (T) {
      var c = { x: 0, y: 0, s: 1 };
      K.forEach(function (k) {
        var tgt = { x: (1 - k.s) * k.cx, y: (1 - k.s) * k.cy, s: k.s };
        if (T >= k.t + k.d) c = tgt;
        else if (T > k.t) { var u = ease((T - k.t) / k.d); c = { x: c.x + (tgt.x - c.x) * u, y: c.y + (tgt.y - c.y) * u, s: c.s + (tgt.s - c.s) * u }; }
      });
      return c;
    };
    var clock = { t: 0 }, el = document.querySelector(sel);
    el.style.transformOrigin = "0 0";
    tl.fromTo(clock, { t: 0 }, {
      t: dur, duration: dur, ease: "none",
      onUpdate: function () { var c = state(hostStart + clock.t); el.style.transform = "translate(" + c.x.toFixed(2) + "px," + c.y.toFixed(2) + "px) scale(" + c.s.toFixed(4) + ")"; },
    }, 0);
  };
})();
