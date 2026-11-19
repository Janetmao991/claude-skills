/* Prop library: things drawn as what they are, not as an empty box with a label.
   Each prop draws itself stroke by stroke on the board (same rough.js look as sketch.js).
   Signature: SK.<prop>(tl, svg, x, y, at, o) — x,y = top-left of the prop's main body,
   o.s = scale (1 ≈ the size noted per prop). Returns the time the drawing ends.
   Load after sketch.js. Catalogue with sizes: references/props.md */
(function () {
  var SK = window.SK, C = SK.C;
  // shift + scale every x,y pair in an absolute M/L/Q/Z path
  function tf(d, x, y, s) {
    var n = 0;
    return d.replace(/-?\d+(\.\d+)?/g, function (v) { return (n++ % 2 ? y : x) + parseFloat(v) * s; });
  }

  /* support bot: rounded head, two dot eyes, smile, pink antenna, headset with mic, small body.
     s = 1: head 96×84, whole prop about 126×153 (x − 15 … x + 111, y − 31 … y + 122). ~1.25 s to draw. */
  SK.robot = function (tl, svg, x, y, at, o) {
    o = o || {};
    var s = o.s || 1, w = function (v) { return v * Math.max(s, 0.6); };
    var P = function (d, sw, t, dur) { SK.draw(tl, SK.path(svg, tf(d, x, y, s), { strokeWidth: w(sw) }), at + t, dur); };
    var D = function (cx, cy, d, col, t) { SK.dot(tl, svg, x + cx * s, y + cy * s, d * s, col, at + t); };
    P("M 16 0 L 80 0 Q 96 0 96 16 L 96 68 Q 96 84 80 84 L 16 84 Q 0 84 0 68 L 0 16 Q 0 0 16 0 Z", 4, 0, 0.4);
    D(30, 34, 13, C.ink, 0.4);
    D(66, 34, 13, C.ink, 0.45);
    P("M 32 59 Q 48 71 64 59", 3.5, 0.5, 0.15);
    P("M 48 0 L 48 -20", 3.5, 0.6, 0.1);
    D(48, -25, 12, o.antenna || C.pink, 0.7);
    if (o.headset !== false) {
      SK.draw(tl, SK.ellipse(svg, x - 6 * s, y + 42 * s, 14 * s, 32 * s, { strokeWidth: w(3.5) }), at + 0.75, 0.12);
      SK.draw(tl, SK.ellipse(svg, x + 102 * s, y + 42 * s, 14 * s, 32 * s, { strokeWidth: w(3.5) }), at + 0.8, 0.12);
      P("M -8 58 Q -2 74 16 69", 3, 0.9, 0.15);
      D(19, 68, 10, C.ink, 1.0);
    }
    P("M 48 84 L 48 94", 3.5, 1.05, 0.08);
    P("M 22 94 L 74 94 Q 84 94 84 104 L 84 122 L 12 122 L 12 104 Q 12 94 22 94 Z", 3.5, 1.05, 0.25);
    return at + 1.3;
  };

  /* model, drawn as a brain: bumpy outline, centre line, two folds a side.
     s = 1: about 192×136 (x − 6 … x + 186, y − 4 … y + 132). ~1.1 s to draw. Label goes underneath. */
  SK.brain = function (tl, svg, x, y, at, o) {
    o = o || {};
    var s = o.s || 1, w = function (v) { return v * Math.max(s, 0.6); };
    var P = function (d, sw, t, dur, col) { SK.draw(tl, SK.path(svg, tf(d, x, y, s), { strokeWidth: w(sw), stroke: col || C.ink }), at + t, dur); };
    P("M 90 8 Q 60 -4 40 10 Q 14 8 10 36 Q -6 56 8 78 Q 4 106 32 112 Q 46 132 72 122 Q 84 130 90 122", 4.5, 0, 0.35);
    P("M 90 8 Q 120 -4 140 10 Q 166 8 170 36 Q 186 56 172 78 Q 176 106 148 112 Q 134 132 108 122 Q 96 130 90 122", 4.5, 0.3, 0.35);
    P("M 90 8 Q 84 40 92 66 Q 98 94 90 122", 3.5, 0.6, 0.2);
    P("M 30 30 Q 52 28 56 46 Q 60 62 76 60", 3, 0.75, 0.15);
    P("M 16 70 Q 34 64 44 78 Q 52 92 70 88", 3, 0.85, 0.15);
    P("M 150 30 Q 128 28 124 46 Q 120 62 104 60", 3, 0.9, 0.15);
    P("M 164 70 Q 146 64 136 78 Q 128 92 110 88", 3, 1.0, 0.15);
    return at + 1.1;
  };
  /* knob = one of the model's parameters: a round dial, five tick marks, a pointer that can turn.
     s = 1: 64×64 (x … x + 64, y … y + 64), ticks reach 8 px outside. ~0.6 s to draw.
     o.angle = where the pointer starts (degrees, 0 = up). Pass o.ref = {} to get o.ref.turn(tl, at, deg, dur)
     for turning it later (seek-safe GSAP rotation around the dial's centre). */
  SK.knob = function (tl, svg, x, y, at, o) {
    o = o || {};
    var s = o.s || 1, r = 32 * s, cx = x + r, cy = y + r, a0 = o.angle || 0;
    SK.draw(tl, SK.circle(svg, cx, cy, 2 * r, { strokeWidth: 4 * Math.max(s, 0.6) }), at, 0.3);
    [-120, -60, 0, 60, 120].forEach(function (d, i) {
      var t = d * Math.PI / 180;
      SK.draw(tl, SK.line(svg, cx + Math.sin(t) * (r + 3 * s), cy - Math.cos(t) * (r + 3 * s),
        cx + Math.sin(t) * (r + 9 * s), cy - Math.cos(t) * (r + 9 * s), { strokeWidth: 2.5, roughness: 0.5 }), at + 0.3 + i * 0.03, 0.08);
    });
    var ptr = SK.line(svg, cx, cy, cx, cy - r * 0.78, { stroke: C.pink, strokeWidth: 5 * Math.max(s, 0.6), roughness: 0.4 });
    tl.set(ptr, { rotation: a0, svgOrigin: cx + " " + cy }, 0);
    SK.draw(tl, ptr, at + 0.45, 0.15);
    SK.dot(tl, svg, cx, cy, 9 * s, C.ink, at + 0.5);
    if (o.ref) o.ref.turn = function (tl2, t, deg, dur) {
      tl2.to(ptr, { rotation: deg, svgOrigin: cx + " " + cy, duration: dur || 0.5, ease: "power2.inOut" }, t);
    };
    return at + 0.6;
  };
})();
