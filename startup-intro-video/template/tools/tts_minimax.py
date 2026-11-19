"""给 script.json 里每段旁白配音：MiniMax speech-2.8-hd（Janet 2026-11-06 盲听选定的四个声音）。

script.json 顶部决定语言和声音：  "lang": "en" | "zh",  "voice": "male" | "female",  "speed": 可选
            male（默认）                    female
  en   English_Gentle-voiced_man       English_CalmWoman
  zh   Chinese (Mandarin)_Gentleman    Chinese (Mandarin)_Warm_Bestie
开工前核对 ~/.claude/skills/ai-term-explainer/SKILL.md 里的当前配音，那里换了这里跟着换。

- 每段旁白在句末切成小块（英文 ≤450 字符，中文 ≤110 字），一块一次请求。
- 每块先生成 1 遍，本地 Qwen3-ASR 听写打分，< 0.95 再补 1 遍，留分高的。
- 输出 sources/vo_raw/<scene>_<i>.wav（旁边的 .txt 记着台词，台词没改就不重配，可以放心反复跑）。
- 中文版另外用 Qwen3-ForcedAligner 给每个字配时间，写 <scene>_<i>.words.json；英文版的逐词时间由 build.py 用 whisper 做。
- 读音不对：项目根目录放 tts_sub.json，如 {"Claygent": "Clay-jent", "Varun": "瓦伦"}，只影响配音，字幕不变。

跑法：~/.cache/mlx-audio-venv/bin/python tools/tts_minimax.py [--only scene,scene] [--voice female]
key：环境变量 MINIMAX_API_KEY，或 ~/.zshrc 里的 export MINIMAX_API_KEY=。不要把 key 写进项目或聊天。
"""
import difflib, hashlib, json, os, re, sys, urllib.request, subprocess
import numpy as np, soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
RAW, CH = "sources/vo_raw", "sources/vo_chunks_mm"
os.makedirs(RAW, exist_ok=True); os.makedirs(CH, exist_ok=True)
SCRIPT = json.load(open("script.json", encoding="utf-8"))
LANG = SCRIPT.get("lang", "en")
GENDER = sys.argv[sys.argv.index("--voice") + 1] if "--voice" in sys.argv else SCRIPT.get("voice", "male")
VOICES = {"en": {"male": "English_Gentle-voiced_man", "female": "English_CalmWoman"},
          "zh": {"male": "Chinese (Mandarin)_Gentleman", "female": "Chinese (Mandarin)_Warm_Bestie"}}
if LANG not in VOICES or GENDER not in VOICES[LANG]:
    sys.exit('script.json: "lang" 只能是 en / zh，"voice" 只能是 male / female')
VOICE, MODEL, SR = VOICES[LANG][GENDER], "speech-2.8-hd", 44100
# --draft：占位配音（Mac 自带 say，免费）。改稿阶段用它；Janet 确认稿子不再改，再去掉 --draft 用付费声音配一次（2026-11-10）
DRAFT = "--draft" in sys.argv
if DRAFT: VOICE = "draft-say"
SPEED = float(SCRIPT.get("speed", 1.05 if LANG == "en" else 1.15))  # Clay 英文版 1.05；中文版 Janet 2026-11-08 要稍快
MAX_CHARS, GAP_CHUNK = (450 if LANG == "en" else 110), 0.3
SUB = json.load(open("tts_sub.json", encoding="utf-8")) if os.path.exists("tts_sub.json") else {}
ZH_DEFAULT_SUB = {"GTM": "G T M", "ARR": "A R R", "CEO": "C E O", "AI": "A I", "SaaS": "萨斯", "B2B": "B to B"}
if LANG == "zh":
    SUB = {**ZH_DEFAULT_SUB, **SUB}
NUMW = set("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million billion point percent dollars dollar and".split())
_DIGIT = dict(zip("0123456789", "零一二三四五六七八九"))


def norm(t):
    """听写打分用：去掉标点；英文再去掉数字（写法太多，比不了）。"""
    t = re.sub(r"<#[0-9.]+#>", " ", t)
    if LANG == "zh":
        return re.sub(r"[^\w]", "", t).lower()
    ws = re.findall(r"[a-z0-9$%.'-]+", t.lower().replace("-", " "))
    return "".join(re.sub(r"[^a-z]", "", w) for w in ws if not re.search(r"[0-9$%]", w) and re.sub(r"[^a-z]", "", w) not in NUMW)


def spoken(t):
    """配音模型实际看到的文字。"""
    if LANG == "zh":  # 2021 年 会被读成「两千零二十一年」
        t = re.sub(r"((?:19|20)\d\d) ?年", lambda m: "".join(_DIGIT[c] for c in m.group(1)) + "年", t)
    for a, b in SUB.items():
        t = t.replace(a, b)
    return t.replace("...", ", <#0.4#>") if LANG == "en" else t


def api_key():
    k = os.environ.get("MINIMAX_API_KEY")
    if not k:
        for ln in open(os.path.expanduser("~/.zshrc"), encoding="utf-8"):
            m = re.match(r'\s*export MINIMAX_API_KEY="?([^"\s]+)"?', ln)
            if m and m.group(1) != "你的key":
                k = m.group(1)
    return k or sys.exit("找不到 MINIMAX_API_KEY（环境变量或 ~/.zshrc）")


def say_draft(text, path, lang):
    """--draft：占位配音，用 Mac 自带的 say（免费、离线）。只为对时间和看画面，不能当成片的声音。"""
    aiff = path + ".aiff"
    subprocess.run(["say", "-v", "Tingting" if lang == "zh" else "Samantha", "-o", aiff, text], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", aiff, "-ar", "44100", "-ac", "1", path], check=True); os.remove(aiff)

def minimax(text, path):
    if DRAFT: return say_draft(text, path, LANG)
    body = json.dumps({"model": MODEL, "text": text, "stream": False, "language_boost": "English" if LANG == "en" else "Chinese",
                       "voice_setting": {"voice_id": VOICE, "speed": SPEED, "vol": 1, "pitch": 0},
                       "audio_setting": {"sample_rate": SR, "format": "wav", "channel": 1}}).encode("utf-8")
    req = urllib.request.Request("https://api.minimax.io/v1/t2a_v2", data=body,
                                 headers={"Authorization": "Bearer " + api_key(), "Content-Type": "application/json"})
    j = json.load(urllib.request.urlopen(req, timeout=180))
    if j.get("base_resp", {}).get("status_code") != 0:
        sys.exit("MiniMax 出错：" + json.dumps(j.get("base_resp"), ensure_ascii=False))
    open(path, "wb").write(bytes.fromhex(j["data"]["audio"]))


_m = {}
def model(kind):
    if kind not in _m:
        from mlx_audio.stt.utils import load_model
        _m[kind] = load_model({"asr": "mlx-community/Qwen3-ASR-1.7B-8bit", "align": "mlx-community/Qwen3-ForcedAligner-0.6B-8bit"}[kind])
    return _m[kind]


def chunks(text):
    pat = r"[^.?!]+[.?!]+(?:\.\.)?\s*|[^.?!]+$" if LANG == "en" else r"[^。？！?!]+[。？！?!]+[”’」]?\s*|[^。？！?!]+$"
    out, cur = [], ""
    for s in re.findall(pat, text):
        if cur and len(cur + s) > MAX_CHARS:
            out.append(cur.strip()); cur = ""
        cur += s
    if cur.strip():
        out.append(cur.strip())
    return out


def trim(a):
    idx = np.where(np.abs(a) > 10 ** (-50 / 20))[0]
    if len(idx) == 0:
        return a
    return a[max(0, idx[0] - int(0.08 * SR)): min(len(a), idx[-1] + int(0.15 * SR))]


def gen_chunk(text):
    h = hashlib.md5((VOICE + str(SPEED) + text).encode("utf-8")).hexdigest()[:10]
    best = None
    for k in range(2):
        p = f"{CH}/{h}-{k}.wav"
        if not os.path.exists(p):
            minimax(spoken(text), p)
        cache = p + ".asr"
        if not os.path.exists(cache):
            open(cache, "w", encoding="utf-8").write(model("asr").generate(p).text.strip())
        got = open(cache, encoding="utf-8").read()
        s = difflib.SequenceMatcher(None, norm(spoken(text)), norm(got)).ratio()
        print(f"   take {k} asr {s:.3f}", flush=True)
        if best is None or s > best[1]:
            best = (p, s, got)
        if s >= 0.95:
            break
    return best


def tokens(text):
    """中文台词拆成字幕用的小块：一个汉字一块，一串英文/数字一块，标点跟在前一块后面。"""
    out = []
    for m in re.finditer(r"[A-Za-z0-9][A-Za-z0-9_.%$'’\-]*|\S", text):
        t = m.group(0)
        if re.sub(r"[^\w]", "", t) or not out:
            out.append(t)
        else:
            out[-1] += t
    return out


def zh_words(text, audio, offset):
    """强制对齐：返回 [{w, s, e}]，时间 = 这一块在整段里的位置 offset + 块内时间。
    台词原文和配音文字可能不一样（tts_sub、年份），所以按字符做模糊匹配，没对上的在前后之间均分。"""
    tmp = f"{CH}/_align.wav"; sf.write(tmp, audio, SR)
    res = model("align").generate(tmp, text=spoken(text), language="Chinese")
    flat = []
    for it in res.items:
        t = re.sub(r"[^\w]", "", it.text).lower()
        for i, c in enumerate(t):
            flat.append((c, it.start_time + (it.end_time - it.start_time) * i / len(t), it.start_time + (it.end_time - it.start_time) * (i + 1) / len(t)))
    toks = tokens(text)
    chars, owner = [], []
    for ti, tk in enumerate(toks):
        for c in re.sub(r"[^\w]", "", tk).lower():
            chars.append(c); owner.append(ti)
    span = [None] * len(toks)
    for blk in difflib.SequenceMatcher(None, chars, [f[0] for f in flat], autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            ti, f = owner[blk.a + k], flat[blk.b + k]
            span[ti] = (f[1], f[2]) if span[ti] is None else (span[ti][0], f[2])
    end = len(audio) / SR
    for i in range(len(toks)):
        if span[i] is None:
            prev = next((span[j][1] for j in range(i - 1, -1, -1) if span[j]), 0.0)
            ni = next((j for j in range(i + 1, len(toks)) if span[j]), None)
            nxt = span[ni][0] if ni is not None else end
            step = (nxt - prev) / ((ni if ni is not None else len(toks)) - i + 1)
            span[i] = (prev + step * 0.5, prev + step)
    return [{"w": w, "s": round(offset + s, 3), "e": round(offset + e, 3)} for w, (s, e) in zip(toks, span)]


def main():
    only = sys.argv[sys.argv.index("--only") + 1].split(",") if "--only" in sys.argv else None
    report = []
    print(f"{LANG} · {VOICE} · speed {SPEED}")
    for sc in SCRIPT["scenes"]:
        if only and sc["id"] not in only:
            continue
        for i, seg in enumerate(sc["segments"]):
            if "vo" not in seg:
                continue
            key = f"{sc['id']}_{i}"
            out, side = f"{RAW}/{key}.wav", f"{RAW}/{key}.words.json"
            stamp = f"mm|{VOICE}|{SPEED}|{seg['vo']}"
            fresh = os.path.exists(out + ".txt") and open(out + ".txt", encoding="utf-8").read() == stamp
            if fresh and (LANG == "en" or os.path.exists(side)):
                continue
            print(key, flush=True)
            parts, words, t = [], [], 0.0
            for c in chunks(seg["vo"]):
                p, s, got = gen_chunk(c)
                report.append(f"{s:.3f}  {key}  {c[:60]}")
                if s < 0.95:
                    report.append(f"        听写成：{got[:140]}")
                a, sr = sf.read(p)
                if a.ndim > 1:
                    a = a.mean(axis=1)
                a = trim(a)
                if LANG == "zh":
                    words += zh_words(c, a, t)
                parts += [a, np.zeros(int(GAP_CHUNK * SR))]
                t += len(a) / SR + GAP_CHUNK
            sf.write(out, np.concatenate(parts[:-1]), SR)
            open(out + ".txt", "w", encoding="utf-8").write(stamp)
            if LANG == "zh":
                json.dump(words, open(side, "w", encoding="utf-8"), ensure_ascii=False)
            if os.path.exists(f"{RAW}/{key}.json"):  # build.py 的 whisper 缓存，配音变了要作废
                os.remove(f"{RAW}/{key}.json")
    open(f"{CH}/report.txt", "a", encoding="utf-8").write("\n".join(report) + "\n")
    low = [r for r in report if not r[:1].isdigit() or float(r[:5]) < 0.95]
    print("\n".join(low) if low else "全部 >= 0.95")
    print(f"本期声音记到 ~/AI-Terms/配音AB记录.md：{VOICE}")


if __name__ == "__main__":
    main()
