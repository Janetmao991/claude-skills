"""中英文配音：MiniMax speech-2.8-hd（Janet 2026-11-06 盲听选定），男声 / 女声可选。

               中文版（id | 中文 | English）         英文版（id | English）
--voice male   Chinese (Mandarin)_Gentleman（默认）   English_Gentle-voiced_man（默认）
--voice female Chinese (Mandarin)_Warm_Bestie        English_CalmWoman
社交媒体上男声还是女声更好，靠数据定：每期用了哪个声音记到 ~/AI-Terms/配音AB记录.md。

流程沿用 C 方案（整段生成 → 本地 Qwen3-ForcedAligner 切回每一句）：
- 每个场景按顺序把几句拼成一段（≤ MAX_CHARS 字），整段交给 MiniMax，韵律能跨句连起来。
- 本地 Qwen3-ASR 听写打分，< 0.95 自动重生成一次，两遍里挑高的。MiniMax 不吞字，不需要垫底句。
- 段间 0.35 s，场景间 0.9 s；HOLDS 里的句子（真实镜头）后面多停一会儿。
- 整条只做轻处理：高通 + 轻压缩 + 响度 -15 LUFS（MiniMax 本身就是干净录音棚声，不再加混响和底噪）。

输出（和 build_vo_c.py 一样，另外多写 timeline.js 给 HyperFrames 用）：
  assets/vo/voiceover.wav
  assets/vo/timeline.json   {total, voice, scenes{...}, lines{id:{scene,start,end,zh,en,chars:[[字,秒],...]}}}
  assets/vo/timeline.js     window.__VO = 同上
  assets/vo/chunks/report.txt  每段的 ASR 分数（< 0.9 要听）

跑法：~/.cache/mlx-audio-venv/bin/python tools/build_vo_mm.py [--voice female] [--lang en] [--only hook,scene]
英文版的 timeline 每句是 {scene,start,end,text,words:[[词,秒],...]}，和 build_vo_en.py 的字段兼容（多了 words）。
API key：环境变量 MINIMAX_API_KEY；没有的话从 ~/.zshrc 里读最后一行 export MINIMAX_API_KEY=。
花费：按字数计费，一期大约 3000–5000 字。重跑只会重新生成台词改过的段（文件名带台词指纹 + 声音）。
读音不对：改 TTS_SUB（只影响配音，字幕不变）；单个字读错可以写成 拼音标注，如 处理 → 处(chu3)理。"""
import os, re, sys, json, difflib, subprocess, hashlib, urllib.request
import numpy as np, soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VO = os.path.join(ROOT, "assets", "vo")
CH = os.path.join(VO, "chunks"); os.makedirs(CH, exist_ok=True)
# 语言看 SCRIPT.md 的格式自动判断：`id | 中文 | English` 是中文版，`id | English` 是英文版（也可以 --lang en 强制）
LANG = sys.argv[sys.argv.index("--lang") + 1] if "--lang" in sys.argv else None
ALL_VOICES = {"zh": {"male": "Chinese (Mandarin)_Gentleman", "female": "Chinese (Mandarin)_Warm_Bestie"},
              # 英文 2026-11-06 盲听：男声 Gentle-voiced_man 最好（Kokoro am_michael 落选）；女声都一般，CalmWoman 相对最好
              "en": {"male": "English_Gentle-voiced_man", "female": "English_CalmWoman"}}
VOICE = sys.argv[sys.argv.index("--voice") + 1] if "--voice" in sys.argv else "male"
# --draft：占位配音（Mac 自带 say，免费）。改稿阶段用它；Janet 确认稿子不再改，再去掉 --draft 用付费声音配一次（2026-11-10）
DRAFT = "--draft" in sys.argv
# --voice-id <MiniMax 系统声>：直接指定声音（覆盖 male/female 那张表）；--speed 改语速（默认 1.0）
VOICE_ID = sys.argv[sys.argv.index("--voice-id") + 1] if "--voice-id" in sys.argv else None
# --eleven <voice_id>：改用 ElevenLabs（英文定稿用；key 读 ~/.zshrc 的 ELEVENLABS_API_KEY），--eleven-model 默认 eleven_multilingual_v2
# Janet 的英文女声：--voice female --eleven rSZFtT0J8GtnLqoDoFAp --speed 1.0 --eleven-stability 0.8（她自己在 Voice Library 挑的，2026-11-10 定；备选 Emily LcfcDJNUP1GQjkzn1xUU；Jessica 她嫌太高亢）
# 2026-11-10 晚改选（以这条为准）：英文男声 Robert --voice male --eleven BtWabtumIemAotTjP5sk；英文女声 Jessica Anne Bogart --voice female --eleven g6xIsTj2HwM6VR4iXFCw；都加 --speed 1.0 --eleven-stability 0.8
ELEVEN = sys.argv[sys.argv.index("--eleven") + 1] if "--eleven" in sys.argv else None
ELEVEN_MODEL = sys.argv[sys.argv.index("--eleven-model") + 1] if "--eleven-model" in sys.argv else "eleven_multilingual_v2"
# --eleven-stability 0.8：语调更平稳、不那么"高亢"（Janet 2026-11-10 选的 Emily 就用 0.8 + 原速）；默认 0.5
ELEVEN_STAB = float(sys.argv[sys.argv.index("--eleven-stability") + 1]) if "--eleven-stability" in sys.argv else 0.5
SPEED = float(sys.argv[sys.argv.index("--speed") + 1]) if "--speed" in sys.argv else 1.0
if VOICE not in ("male", "female"): sys.exit("--voice 只能是 male 或 female")
MM_MODEL = "speech-2.8-hd"
ASR_MODEL = "mlx-community/Qwen3-ASR-1.7B-8bit"
ALIGN_MODEL = "mlx-community/Qwen3-ForcedAligner-0.6B-8bit"
# 只改配音模型看到的拼写，字幕不变。缩写写成空格隔开的字母，MiniMax 会逐个字母读。
TTS_SUB_ZH = {"MCP": "M C P", "RAG": "rag", "API": "A P I", "JSON": "jason"}
TTS_SUB_EN = {}  # 英文读错时加，例：{"Qwen": "Chwen"}
SR = 48000
GAP_CHUNK, GAP_SCENE, FIRST_HEAD, LAST_TAIL = 0.35, 0.9, 0.15, 1.8
# 真实画面（纸上屏幕）那句说完后停一会儿让人看（visual-direction.md：2–2.5 s）。加在这句和下一句之间。
HOLDS = {}  # 例：{"w9": 0.7}

def parse():
    scenes, cur = [], None
    for ln in open(os.path.join(ROOT, "SCRIPT.md"), encoding="utf-8"):
        m = re.match(r"^## (\w+)", ln)
        if m: cur = {"name": m.group(1), "lines": []}; scenes.append(cur); continue
        m = re.match(r"^(\w\d+) \| (.+?) \| (.+)$", ln.strip())
        if m and cur: cur["lines"].append({"id": m.group(1), "zh": m.group(2), "en": m.group(3)}); continue
        m = re.match(r"^(\w\d+) \| (.+)$", ln.strip())
        # 英文版只有一栏：内部仍叫 "zh"（= 要念的那一栏），输出时写成 "text"
        if m and cur: cur["lines"].append({"id": m.group(1), "zh": m.group(2), "en": m.group(2), "text": m.group(2)})
    return scenes

def setup(scenes):
    global LANG, VOICES, TTS_SUB, MAX_CHARS, SEP
    if LANG is None:
        LANG = "en" if any("text" in l for s in scenes for l in s["lines"]) else "zh"
    VOICES = dict(ALL_VOICES[LANG])
    if VOICE_ID: VOICES[VOICE] = VOICE_ID
    if ELEVEN: VOICES[VOICE] = "elevenlabs:%s:%s:%s" % (ELEVEN, ELEVEN_MODEL, ELEVEN_STAB)
    TTS_SUB = TTS_SUB_ZH if LANG == "zh" else TTS_SUB_EN
    MAX_CHARS = 110 if LANG == "zh" else 450   # 一段大约 25–30 秒
    SEP = "" if LANG == "zh" else " "

def chunks_of(scene):
    out, cur, n = [], [], 0
    for l in scene["lines"]:
        if cur and n + len(l["zh"]) > MAX_CHARS: out.append(cur); cur, n = [], 0
        cur.append(l); n += len(l["zh"])
    if cur: out.append(cur)
    return out

def spoken(t):
    for k, v in TTS_SUB.items(): t = t.replace(k, v)
    return t

norm = lambda t: re.sub(r"[^\w]", "", t).lower()

_m = {}
ASR_CACHE_F = os.path.join(CH, "asr_cache.json")
ASR_CACHE = json.load(open(ASR_CACHE_F, encoding="utf-8")) if os.path.exists(ASR_CACHE_F) else {}
def model(kind):
    if kind not in _m:
        from mlx_audio.stt.utils import load_model
        _m[kind] = load_model({"asr": ASR_MODEL, "align": ALIGN_MODEL}[kind])
    return _m[kind]

def api_key():
    k = os.environ.get("MINIMAX_API_KEY")
    if not k:
        for ln in open(os.path.expanduser("~/.zshrc"), encoding="utf-8"):
            m = re.match(r'\s*export MINIMAX_API_KEY="?([^"\s]+)"?', ln)
            if m and m.group(1) != "你的key": k = m.group(1)
    return k or sys.exit("找不到 MINIMAX_API_KEY（环境变量或 ~/.zshrc）")

def eleven(text, path):
    # Starter 档只有 128k（192k 要 Creator）；key 只开了 Text to Speech 权限
    k = os.environ.get("ELEVENLABS_API_KEY")
    if not k or not k.startswith("sk_"):
        for ln in open(os.path.expanduser("~/.zshrc"), encoding="utf-8"):
            m = re.match(r'\s*export ELEVENLABS_API_KEY=["\']?([^"\'\s]+)', ln)
            if m: k = m.group(1)
    if not k: sys.exit("找不到 ELEVENLABS_API_KEY（~/.zshrc）")
    req = urllib.request.Request("https://api.elevenlabs.io/v1/text-to-speech/%s?output_format=mp3_44100_192" % ELEVEN,
                                 data=json.dumps({"text": text, "model_id": ELEVEN_MODEL, "voice_settings": {"speed": min(SPEED, 1.2), "stability": ELEVEN_STAB, "similarity_boost": 0.75, "style": 0.0}}).encode("utf-8"),
                                 headers={"xi-api-key": k, "Content-Type": "application/json"})
    mp3 = path + ".mp3"; open(mp3, "wb").write(urllib.request.urlopen(req, timeout=180).read())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ar", "44100", "-ac", "1", path], check=True); os.remove(mp3)

QWEN_MODEL = "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16"
QWEN_REF = os.path.join(ROOT, "assets", "vo", "ref-r5.wav")  # 第 1–4 期的沉稳男声（模板里有一份）
QWEN_REF_TEXT = ("Embedding，向量嵌入，到底是什么？从一个客服机器人讲起。假设你给公司做了一个客服机器人。"
                 "公司有500份文档：退款流程、发货规则、会员说明。有个顾客问：我买的东西不想要了，钱能要回来吗？"
                 "机器人得先从500份里，找到能回答的那一份。")
FILLER = "就这样。"  # Qwen3-TTS 会吞最后一个字：句尾垫一句，再在它前面的停顿处剪掉
_qwen = None

def _cut_filler(a, sr):
    F = int(0.02 * sr)
    e = np.array([20 * np.log10(np.sqrt(np.mean(a[i:i + F] ** 2)) + 1e-9) for i in range(0, len(a) - F, F)])
    quiet, n, best, i = e < -42, len(e), None, 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]: j += 1
            if j - i >= 6 and i * F < len(a) - 0.25 * sr: best = (i, j)
            i = j
        else:
            i += 1
    if not best or best[0] * F < len(a) - 1.4 * sr: return None
    b = a[:(best[0] + 3) * F].copy(); fl = int(0.03 * sr); b[-fl:] *= np.linspace(1, 0, fl)
    return b

def qwen_draft(text, path):
    """--draft（默认）：本地 Qwen3-TTS 克隆第 1–4 期的男声，免费、离线。Janet 2026-11-11：试听也用 Qwen，say 太难听。"""
    global _qwen
    from mlx_audio.tts.utils import load_model
    if _qwen is None: _qwen = load_model(QWEN_MODEL)
    for _ in range(4):
        res = list(_qwen.generate(text=text + FILLER, ref_audio=QWEN_REF, ref_text=QWEN_REF_TEXT, lang_code="chinese"))
        b = _cut_filler(np.concatenate([np.array(r.audio) for r in res]), _qwen.sample_rate)
        if b is not None: break
    else:
        b = np.concatenate([np.array(r.audio) for r in res])
    tmp = path + ".q.wav"; sf.write(tmp, b, _qwen.sample_rate)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-ar", "44100", "-ac", "1", path], check=True); os.remove(tmp)

def say_draft(text, path, lang):
    """--draft：占位配音，用 Mac 自带的 say（免费、离线）。只为对时间和看画面，不能当成片的声音。"""
    aiff = path + ".aiff"
    subprocess.run(["say", "-v", "Tingting" if lang == "zh" else "Samantha", "-o", aiff, text], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", aiff, "-ar", "44100", "-ac", "1", path], check=True); os.remove(aiff)

def minimax(text, path):
    if DRAFT and LANG == "zh" and "--say" not in sys.argv: return qwen_draft(text, path)
    if DRAFT: return say_draft(text.replace("M C P", "MCP").replace("A I", "AI"), path, LANG)
    if ELEVEN: return eleven(text.replace("M C P", "MCP"), path)
    body = json.dumps({"model": MM_MODEL, "text": text, "stream": False, "language_boost": "Chinese" if LANG == "zh" else "English",
                       "voice_setting": {"voice_id": VOICES[VOICE], "speed": SPEED, "vol": 1, "pitch": 0},
                       "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}}).encode("utf-8")
    req = urllib.request.Request("https://api.minimax.io/v1/t2a_v2", data=body, headers={
        "Authorization": "Bearer " + api_key(), "Content-Type": "application/json"})
    j = json.load(urllib.request.urlopen(req, timeout=120))
    if j.get("base_resp", {}).get("status_code") != 0:
        sys.exit("MiniMax 出错：" + json.dumps(j.get("base_resp"), ensure_ascii=False))
    open(path, "wb").write(bytes.fromhex(j["data"]["audio"]))

def gen_chunk(tag, text):
    """返回 (最好那遍的路径, ASR 分数, ASR 文本)。先生成 1 遍，分数 < 0.95 再补 1 遍。"""
    best = None
    for k in range(2):
        p = os.path.join(CH, "%s-%d.wav" % (tag, k))
        if not os.path.exists(p): minimax(spoken(text), p)
        key = "%s|%d" % (os.path.basename(p), int(os.path.getmtime(p)))
        if key not in ASR_CACHE:
            ASR_CACHE[key] = model("asr").generate(p).text.strip()
            json.dump(ASR_CACHE, open(ASR_CACHE_F, "w", encoding="utf-8"), ensure_ascii=False)
        got = ASR_CACHE[key]
        s = difflib.SequenceMatcher(None, norm(spoken(text)), norm(got)).ratio()
        print("  %s take %d  asr %.3f" % (tag, k, s), flush=True)
        if best is None or s > best[1]: best = (p, s, got)
        if s >= 0.95: break
    return best

def trim_head(a, sr):
    i0 = int(np.argmax(np.abs(a) > 10 ** (-55 / 20)))
    return a[max(0, i0 - int(0.12 * sr)):]

def align(a, sr, lines):
    """返回每句 [start,end] 和每个字的时间（相对这一段）"""
    tmp = os.path.join(CH, "_align.wav"); sf.write(tmp, a, sr)
    text = SEP.join(spoken(l["zh"]) for l in lines)
    res = model("align").generate(tmp, text=text, language="Chinese" if LANG == "zh" else "English")
    items = [(norm(it.text), it.start_time, it.end_time) for it in res.items if norm(it.text)]
    # 逐个字符展开，配上时间（一个英文词的字母平分这个词的时长）
    flat = []
    for t, s, e in items:
        for i, c in enumerate(t):
            flat.append((c, s + (e - s) * i / len(t), s + (e - s) * (i + 1) / len(t)))
    out, pos = [], 0
    for l in lines:
        n = len(norm(spoken(l["zh"])))
        seg = flat[pos:pos + n]; pos += n
        if not seg:
            out.append(None); continue
        out.append({"start": seg[0][1], "end": seg[-1][2], "chars": seg})
    if pos != len(flat):
        print("  !! 对齐字数不一致：台词 %d 字，对齐 %d 字" % (pos, len(flat)))
    return out

def char_times(line, seg, offset):
    """把台词原文（含标点、未替换的拼写）里每个可见字映射到时间。英文词按词给一个时间。"""
    zh, sp = line["zh"], spoken(line["zh"])
    # 用 spoken 的规范化字符 → 时间；原文里被 TTS_SUB 替换的词整体取替换词第一个字母的时间
    times = [round(offset + s, 3) for _, s, _ in seg["chars"]]
    res, ti = [], 0
    i = 0
    while i < len(zh):
        hit = next((k for k in TTS_SUB if zh.startswith(k, i)), None)
        if hit:
            res.append([hit, times[min(ti, len(times) - 1)]]); ti += len(norm(TTS_SUB[hit])); i += len(hit); continue
        m = re.match(r"[A-Za-z0-9_.%τ'’\-]+", zh[i:])
        if m:
            w = m.group(0); res.append([w, times[min(ti, len(times) - 1)]]); ti += len(norm(w)); i += len(w); continue
        c = zh[i]
        if norm(c):
            res.append([c, times[min(ti, len(times) - 1)]]); ti += 1
        i += 1
    return res

def main():
    only = None
    if "--only" in sys.argv: only = sys.argv[sys.argv.index("--only") + 1].split(",")
    scenes = parse(); setup(scenes)
    if only: scenes = [s for s in scenes if s["name"] in only]
    parts, t = [], 0.0
    out, report = {"scenes": {}, "lines": {}}, []
    for si, sc in enumerate(scenes):
        head = FIRST_HEAD if si == 0 else GAP_SCENE
        parts.append(np.zeros(int(head * SR))); t += head
        s0 = t
        for ci, lines in enumerate(chunks_of(sc)):
            if ci: parts.append(np.zeros(int(GAP_CHUNK * SR))); t += GAP_CHUNK
            text = SEP.join(l["zh"] for l in lines)
            # 文件名带台词内容的指纹：台词改了就自动重配，没改的直接复用
            tag = "%s-%d-%s" % (sc["name"], ci, hashlib.md5(((("draft-say" if "--say" in sys.argv or LANG != "zh" else "draft-qwen") if DRAFT else "") + (VOICE if not (VOICE_ID or ELEVEN or SPEED != 1.0) else VOICES[VOICE] + str(SPEED)) + spoken(text)).encode("utf-8")).hexdigest()[:6])
            p, score, got = gen_chunk(tag, text)
            report.append("%s  %.3f  %s\n   台词：%s\n   听写：%s" % (tag, score, "<<< 要听" if score < 0.9 else "", text, got))
            a, sr = sf.read(p)
            if a.ndim > 1: a = a.mean(1)
            if sr != SR:
                import scipy.signal as ss
                a = ss.resample_poly(a, SR, sr); sr = SR
            a = trim_head(a, sr)
            segs = align(a, sr, lines)
            # 在 HOLDS 里的句子后面插静音：切在这句结尾和下一句开头的中间
            pieces, cur, shift, shifts = [], 0, 0.0, []
            for i, (l, seg) in enumerate(zip(lines, segs)):
                shifts.append(shift)
                if seg and l["id"] in HOLDS:
                    nxt = segs[i + 1] if i + 1 < len(lines) else None
                    c = int(((seg["end"] + nxt["start"]) / 2 if nxt else len(a) / sr) * sr)
                    pieces += [a[cur:c], np.zeros(int(HOLDS[l["id"]] * sr))]; cur = c; shift += HOLDS[l["id"]]
            pieces.append(a[cur:]); a = np.concatenate(pieces)
            for l, seg, sh in zip(lines, segs, shifts):
                if seg is None: print("  !! %s 没对齐上" % l["id"]); continue
                out["lines"][l["id"]] = {"scene": sc["name"], "start": round(t + sh + seg["start"], 3), "end": round(t + sh + seg["end"], 3),
                                         "zh": l["zh"], "en": l["en"], "chars": char_times(l, seg, t + sh)}
                if LANG == "en":
                    d = out["lines"][l["id"]]; d["text"] = d.pop("zh"); d.pop("en"); d["words"] = d.pop("chars")
            parts.append(a); t += len(a) / SR
        out["scenes"][sc["name"]] = {"start": round(s0, 3), "end": round(t, 3), "lines": [l["id"] for l in sc["lines"]]}
        print("%-8s %7.2f → %7.2f" % (sc["name"], s0, t), flush=True)
    parts.append(np.zeros(int(LAST_TAIL * SR))); t += LAST_TAIL
    out["total"] = round(t, 3)
    raw = os.path.join(VO, "voiceover_raw.wav"); sf.write(raw, np.concatenate(parts), SR)
    fx = "aresample=%d,highpass=f=70,acompressor=threshold=-20dB:ratio=2:attack=8:release=120,loudnorm=I=-15:TP=-1.5:LRA=11" % SR
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", fx, "-ar", str(SR), "-ac", "1",
                    os.path.join(VO, "voiceover.wav")], check=True)
    out["voice"] = VOICES[VOICE]; out["lang"] = LANG
    json.dump(out, open(os.path.join(VO, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(os.path.join(VO, "timeline.js"), "w", encoding="utf-8").write(
        "window.__VO = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
    open(os.path.join(CH, "report.txt"), "w", encoding="utf-8").write("\n".join(report) + "\n")
    print("total %.1f s, %d lines, %d chunks need a listen" % (t, len(out["lines"]), sum(1 for r in report if "<<<" in r)))

main()
