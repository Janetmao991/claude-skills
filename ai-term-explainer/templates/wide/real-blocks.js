// When the film cuts from the paper board to a full-screen real shot. Times come from the
// voice timeline (holds inserted by tools/build_pilot.py), so a re-voiced line moves its shot too.
// Each block: [in, out] on the film clock; each shot runs until the next one.
(function () {
  var L = window.__VO.lines, H = window.__VO.holds || {};
  var s = function (id, off) { return +(L[id].start + (off || 0)).toFixed(3); };
  var e = function (id, off) { return +(L[id].end + (H[id] || 0) + (off || 0)).toFixed(3); };
  window.REAL_BLOCKS = [
    { id: "b1", in: s("p3", -0.3), out: e("p3", 0.1), shots: [{ id: "search", at: s("p3", -0.3) }] },
    { id: "b2", in: s("n1", -0.3), out: e("n1", 0.1), shots: [{ id: "curl", at: s("n1", -0.3) }] },
    { id: "b3", in: s("m5", -0.3), out: e("m6", 0.1), shots: [{ id: "proj", at: s("m5", -0.3) }, { id: "grid", at: s("m6", -0.2) }] },
    { id: "b4", in: s("k4", -0.3), out: e("k4", 0.1), shots: [{ id: "rank", at: s("k4", -0.3) }] },
    { id: "b5", in: s("a3", -0.3), out: e("a4", 0.1), shots: [{ id: "api", at: s("a3", -0.3) }, { id: "openai", at: s("a4", -0.2) }] },
    { id: "b6", in: s("g2", -0.3), out: e("g3", 0.1), shots: [{ id: "chat", at: s("g2", -0.3) }, { id: "airbnb", at: s("g3", -0.2) }] },
  ];
})();
