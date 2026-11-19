/* Hand-drawn whiteboard helpers on top of rough.js (seeded → deterministic).
   Objects are DRAWN (stroke-dash draw-on), words are WRITTEN (clip reveal),
   stamps are PRESSED. All tweens go on the caller's paused timeline. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var C = {
    ink: "#1E1E24",
    pink: "#F2557A",
    blue: "#2E7CF6",
    yellow: "#FFD43B",
    grey: "#9A9AA3",
    ground: "#FAF4E8",
  };
  var seedN = 1;
  function opts(o) {
    o = o || {};
    var b = {
      roughness: 1.3,
      bowing: 1.1,
      strokeWidth: 4,
      stroke: C.ink,
      fillWeight: 2.2,
      hachureGap: 10,
      hachureAngle: -41,
      seed: o.seed || seedN++,
    };
    for (var k in o) b[k] = o[k];
    return b;
  }
  function gen(svg) {
    return rough.svg(svg);
  }
  function put(svg, node) {
    svg.appendChild(node);
    node.setAttribute("opacity", "0");
    return node;
  }
  function group(svg, nodes) {
    var g = document.createElementNS(NS, "g");
    nodes.forEach(function (n) {
      g.appendChild(n);
    });
    return put(svg, g);
  }
  function headPts(x2, y2, ang, L) {
    var s = 0.48;
    return [
      [x2 - L * Math.cos(ang - s), y2 - L * Math.sin(ang - s)],
      [x2 - L * Math.cos(ang + s), y2 - L * Math.sin(ang + s)],
    ];
  }

  var SK = {
    C: C,
    /* voice cues: seconds from the scene's start to a line's start (+ offset) */
    cue: function (scene, id, off) {
      var V = window.__VO;
      return +(V.lines[id].start - V.scenes[scene].start + (off || 0)).toFixed(3);
    },
    cueEnd: function (scene, id, off) {
      var V = window.__VO;
      return +(V.lines[id].end - V.scenes[scene].start + (off || 0)).toFixed(3);
    },
    /* a point inside a line, by character position (TTS is near-uniform per char) */
    cueChar: function (scene, id, ch) {
      var V = window.__VO, l = V.lines[id];
      var i = l.zh.indexOf(ch);
      var f = i < 0 ? 0 : i / l.zh.length;
      return +(l.start + f * (l.end - l.start) - V.scenes[scene].start).toFixed(3);
    },
    seed: function (n) {
      seedN = n;
    },
    rect: function (svg, x, y, w, h, o) {
      return put(svg, gen(svg).rectangle(x, y, w, h, opts(o)));
    },
    ellipse: function (svg, cx, cy, w, h, o) {
      return put(svg, gen(svg).ellipse(cx, cy, w, h, opts(o)));
    },
    circle: function (svg, cx, cy, d, o) {
      return put(svg, gen(svg).circle(cx, cy, d, opts(o)));
    },
    line: function (svg, x1, y1, x2, y2, o) {
      return put(svg, gen(svg).line(x1, y1, x2, y2, opts(o)));
    },
    path: function (svg, d, o) {
      return put(svg, gen(svg).path(d, opts(o)));
    },
    curve: function (svg, pts, o) {
      return put(svg, gen(svg).curve(pts, opts(o)));
    },
    arrow: function (svg, x1, y1, x2, y2, o) {
      var r = gen(svg),
        op = opts(o);
      var a = Math.atan2(y2 - y1, x2 - x1),
        L = (o && o.head) || 24;
      var h = headPts(x2, y2, a, L);
      return group(svg, [
        r.line(x1, y1, x2, y2, op),
        r.linearPath([h[0], [x2, y2], h[1]], op),
      ]);
    },
    curveArrow: function (svg, pts, o) {
      var r = gen(svg),
        op = opts(o);
      var p1 = pts[pts.length - 2],
        p2 = pts[pts.length - 1];
      var a = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]),
        L = (o && o.head) || 24;
      var h = headPts(p2[0], p2[1], a, L);
      return group(svg, [r.curve(pts, op), r.linearPath([h[0], p2, h[1]], op)]);
    },
    cylinder: function (svg, x, y, w, h, o) {
      var r = gen(svg),
        op = opts(o),
        e = Math.round(w * 0.22);
      var cx = x + w / 2;
      return group(svg, [
        r.ellipse(cx, y + e / 2, w, e, op),
        r.line(x, y + e / 2, x, y + h - e / 2, op),
        r.line(x + w, y + e / 2, x + w, y + h - e / 2, op),
        r.path(
          "M " + x + " " + (y + h - e / 2) + " A " + w / 2 + " " + e / 2 + " 0 0 0 " + (x + w) + " " + (y + h - e / 2),
          op,
        ),
        r.path(
          "M " + x + " " + (y + h * 0.45) + " A " + w / 2 + " " + e / 2 + " 0 0 0 " + (x + w) + " " + (y + h * 0.45),
          opts({ stroke: (o && o.stroke) || C.ink, strokeWidth: 2.5, seed: op.seed + 7 }),
        ),
      ]);
    },
    page: function (svg, x, y, w, h, o) {
      var r = gen(svg),
        op = opts(o);
      var nodes = [r.rectangle(x, y, w, h, op)];
      var lw = opts({ strokeWidth: 2.5, stroke: (o && o.lines) || C.grey, roughness: 1.6, seed: op.seed + 3 });
      for (var i = 0; i < 4; i++) {
        var ly = y + 22 + i * ((h - 36) / 4);
        nodes.push(r.line(x + 14, ly, x + w - 14 - (i === 3 ? w * 0.35 : 0), ly, lw));
      }
      return group(svg, nodes);
    },
    /* --- animation --- */
    draw: function (tl, g, at, dur, ease) {
      dur = dur || 0.6;
      var ps = Array.prototype.slice.call(g.querySelectorAll("path"));
      if (g.tagName === "path") ps = [g];
      ps.forEach(function (p) {
        var L = Math.ceil(p.getTotalLength()) + 4;
        p.setAttribute("stroke-dasharray", L + " " + L);
        p.setAttribute("stroke-dashoffset", L);
        p.__L = L;
      });
      tl.set(g, { attr: { opacity: 1 } }, at);
      var n = ps.length,
        each = n > 1 ? dur * 0.7 : dur,
        stag = n > 1 ? (dur - each) / (n - 1) : 0;
      tl.fromTo(
        ps,
        {
          strokeDashoffset: function (i, el) {
            return el.__L;
          },
        },
        { strokeDashoffset: 0, duration: each, stagger: stag, ease: ease || "power1.inOut" },
        at,
      );
      return at + dur;
    },
    show: function (tl, g, at) {
      tl.set(g, { attr: { opacity: 1 } }, at);
    },
    write: function (tl, el, at, dur) {
      el = typeof el === "string" ? document.querySelector(el) : el;
      var n = (el.textContent || "").length;
      dur = dur || Math.min(1.1, 0.3 + 0.035 * n);
      tl.fromTo(
        el,
        { clipPath: "inset(-20% 100% -20% -2%)", opacity: 1 },
        { clipPath: "inset(-20% -2% -20% -2%)", duration: dur, ease: "none" },
        at,
      );
      return at + dur;
    },
    stamp: function (tl, el, at) {
      tl.fromTo(el, { scale: 1.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.14, ease: "power4.out" }, at);
      return at + 0.14;
    },
    pop: function (tl, el, at) {
      tl.fromTo(el, { scale: 0.86, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.28, ease: "back.out(2)" }, at);
      return at + 0.28;
    },
    /* highlighter swipe: a <div class="hl"> behind a word grows left→right */
    highlight: function (tl, el, at, dur) {
      tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: dur || 0.35, ease: "power2.out", transformOrigin: "0% 50%" }, at);
      return at + (dur || 0.35);
    },
  };

  /* --- helpers added for the embedding episode --- */
  SK.dot = function (tl, svg, x, y, d, color, at) {
    var c = SK.circle(svg, x, y, d, { stroke: color || C.ink, fill: color || C.ink, fillStyle: "solid", strokeWidth: 2 });
    tl.set(c, { attr: { opacity: 1 } }, at);
    tl.fromTo(c, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.22, ease: "back.out(3)" }, at);
    return c;
  };
  SK.cross = function (tl, svg, cx, cy, r, at) {
    var a = SK.line(svg, cx - r, cy - r, cx + r, cy + r, { stroke: C.pink, strokeWidth: 8, roughness: 1.4 });
    var b = SK.line(svg, cx + r, cy - r, cx - r, cy + r, { stroke: C.pink, strokeWidth: 8, roughness: 1.4 });
    SK.draw(tl, a, at, 0.16);
    SK.draw(tl, b, at + 0.16, 0.16);
    return at + 0.32;
  };
  /* a pressed stamp: <div class="stamp" id style="left;top;width;height"><div class="in">TEXT</div></div> */
  SK.stampBox = function (tl, sel, at, o) {
    var st = document.querySelector(sel), w = parseFloat(st.style.width), h = parseFloat(st.style.height);
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 " + w + " " + h);
    st.appendChild(s);
    var b = SK.rect(s, 3, 3, w - 6, h - 6, { stroke: (o && o.stroke) || C.pink, strokeWidth: (o && o.sw) || 5, roughness: 2 });
    SK.show(tl, b, at);
    SK.stamp(tl, st.querySelector(".in"), at);
    tl.fromTo(s, { scale: 1.3, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.14, ease: "power4.out" }, at);
    return at + 0.14;
  };
  /* a boxed label: draw the box, then write the text inside */
  SK.boxed = function (tl, svg, sel, x, y, w, h, at, o) {
    var b = SK.rect(svg, x, y, w, h, o || { strokeWidth: 4 });
    SK.draw(tl, b, at, 0.4);
    if (sel) SK.write(tl, sel, at + 0.2);
    return b;
  };
  window.SK = SK;
})();
