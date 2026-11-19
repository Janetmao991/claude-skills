"""Hand the top-2 retrieved docs to Claude and save its answer to data/answer.js.

Run after build_data.py: zsh -ic '.venv/bin/python answer.py'   (needs ANTHROPIC_API_KEY)
"""
import json
from pathlib import Path

import anthropic

HERE = Path(__file__).parent
MODEL = "claude-opus-5-5"


def main():
    data = json.loads((HERE / "data/results.json").read_text())
    top = data["ranked"][:2]
    context = "\n\n".join(f"【{d['title']}】{d['text']}" for d in top)

    client = anthropic.Anthropic()
    response = client.beta.messages.create(
        model=MODEL,
        max_tokens=16000,
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        output_config={"effort": "low"},
        system="你是一家网店的客服机器人。只根据提供的文档回答，用中文，2–3 句话，语气友好，不要用 Markdown。",
        messages=[{"role": "user", "content": f"参考文档：\n{context}\n\n顾客问题：{data['query']}"}],
    )
    if response.stop_reason == "refusal":
        raise SystemExit(f"refused: {response.stop_details}")
    text = "".join(b.text for b in response.content if b.type == "text").strip()

    out = {"text": text, "model": response.model,
           "sources": [{"title": d["title"], "score": d["score"]} for d in top]}
    (HERE / "data/answer.js").write_text("window.ANSWER=" + json.dumps(out, ensure_ascii=False) + ";")
    print(response.model, "|", response.usage.input_tokens, "in /", response.usage.output_tokens, "out")
    print(text)


if __name__ == "__main__":
    main()
