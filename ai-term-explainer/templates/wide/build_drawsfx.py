"""Synthesize the drawing sounds and lay them on the strokes: one track, assets/sfx/drawing.wav.

  line  → marker on a whiteboard (filtered, wobbling noise)
  text  → pen writing (short scratchy pulses, one per character-ish)
  tape  → a strip of tape pressed on when a paper screen appears

tools/strokes.json is the stroke log from the compositions (window.__SKLOG: [time, duration, kind]).
Seeded noise, so every run makes the same file.
Run: ~/.cache/mlx-audio-venv/bin/python tools/build_drawsfx.py
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
rng = np.random.default_rng(7)


def band(x, lo, hi, tilt=0.0):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = ((f > lo) & (f < hi)).astype(float) / np.maximum(f, 1) ** tilt
    y = np.fft.irfft(X * m, len(x))
    return y / (np.abs(y).max() + 1e-9)


def env(n, attack=0.015, release=0.06):
    e = np.ones(n)
    a, r = min(n // 2, int(attack * SR)), min(n // 2, int(release * SR))
    e[:a] = np.linspace(0, 1, a)
    e[n - r:] = np.linspace(1, 0, r)
    return e


def line(d):
    n = int(d * SR)
    t = np.arange(n) / SR
    wob = 0.65 + 0.35 * np.abs(np.sin(2 * np.pi * (6 + rng.uniform(-1, 1)) * t + rng.uniform(0, 3)))
    return band(rng.standard_normal(n), 900, 6000, 0.5) * wob * env(n) * 0.13


def text(d):
    n = int(d * SR)
    t = np.arange(n) / SR
    rate = rng.uniform(9, 13)
    pulses = np.abs(np.sin(np.pi * rate * t)) ** 0.6
    return band(rng.standard_normal(n), 2500, 8500, 0.3) * pulses * env(n, 0.01, 0.05) * 0.09


def tape(d=0.45):
    n = int(d * SR)
    spikes = (rng.random(n) < 0.004) * rng.uniform(0.3, 1, n)
    crackle = np.convolve(spikes, np.exp(-np.arange(200) / 30), "same")
    x = band(rng.standard_normal(n), 1500, 9000) * 0.4 + band(crackle, 800, 9000)
    return x / (np.abs(x).max() + 1e-9) * np.exp(-np.arange(n) / (0.12 * SR)) * 0.2


def main():
    V = json.loads((s := (ROOT / "assets/vo/timeline.js").read_text())[s.index("{"): s.rindex("}") + 1])
    end = V["scenes"]["goal"]["end"]
    out = np.zeros(int((end + 1) * SR))

    def put(sig, t):
        i = int(t * SR)
        out[i:i + len(sig)] += sig[: max(0, len(out) - i)]

    for t, d, kind, *_ in json.loads((ROOT / "tools/strokes.json").read_text()):
        put(line(d + 0.05) if kind.startswith("l") else text(d), t)
    # paper screens: tape lands 0.45 s after each block starts (see assets/real-blocks.js)
    L = V["lines"]
    for lid in ["p3", "n1", "m5", "k4", "a3", "g2"]:
        put(tape(), L[lid]["start"] - 0.3 + 0.45)
    out = np.clip(out, -0.9, 0.9)
    sf.write(ROOT / "assets/sfx/drawing.wav", out.astype(np.float32), SR, subtype="PCM_16")
    print("drawing.wav", round(len(out) / SR, 2), "s · peak", round(float(np.abs(out).max()), 3))


main()
