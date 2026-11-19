"""Call Voyage (via MongoDB's endpoint) for real embeddings, then compute
keyword-search vs meaning-search results and a 2D map. Writes data/results.json.

Run: zsh -ic 'python3 build_data.py'   (needs VOYAGE_API_KEY)
"""
import json, math, os, urllib.request
from pathlib import Path

HERE = Path(__file__).parent
ENDPOINT = "https://ai.mongodb.com/v1/embeddings"
MODEL = "voyage-3.5"


def embed(texts, input_type=None):
    body = {"input": texts, "model": MODEL}
    if input_type:
        body["input_type"] = input_type
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {os.environ['VOYAGE_API_KEY']}",
                 "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    return dot / (math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b)))


def pca_2d(vectors):
    """Top-2 principal components via power iteration on the centered Gram matrix."""
    n, d = len(vectors), len(vectors[0])
    mean = [sum(v[j] for v in vectors) / n for j in range(d)]
    X = [[v[j] - mean[j] for j in range(d)] for v in vectors]
    G = [[sum(a * b for a, b in zip(X[i], X[k])) for k in range(n)] for i in range(n)]
    coords = [[0.0, 0.0] for _ in range(n)]
    for comp in range(2):
        u = [1.0 + 0.01 * i for i in range(n)]
        for _ in range(500):
            w = [sum(G[i][k] * u[k] for k in range(n)) for i in range(n)]
            norm = math.sqrt(sum(x * x for x in w))
            u = [x / norm for x in w]
        lam = sum(u[i] * sum(G[i][k] * u[k] for k in range(n)) for i in range(n))
        for i in range(n):
            coords[i][comp] = u[i] * math.sqrt(lam)
        G = [[G[i][k] - lam * u[i] * u[k] for k in range(n)] for i in range(n)]
    return coords


def main():
    src = json.loads((HERE / "data/docs.json").read_text())
    docs, query = src["docs"], src["query"]

    # Keyword search: which docs contain any of the query's keywords?
    keyword_hits = [{"id": d["id"], "title": d["title"],
                     "matched": [k for k in src["keywords"] if k in d["text"]]}
                    for d in docs]
    keyword_hits = [h for h in keyword_hits if h["matched"]]

    doc_resp = embed([d["text"] for d in docs], "document")
    query_resp = embed([query], "query")
    qv = query_resp["data"][0]["embedding"]
    for d, item in zip(docs, doc_resp["data"]):
        d["embedding"] = item["embedding"]
        d["score"] = round(cosine(qv, item["embedding"]), 4)
    ranked = sorted(docs, key=lambda d: -d["score"])

    phrases = src["map_phrases"]
    map_resp = embed([p["text"] for p in phrases])
    pvecs = [item["embedding"] for item in map_resp["data"]]
    for p, xy in zip(phrases, pca_2d(pvecs)):
        p["xy"] = [round(xy[0], 4), round(xy[1], 4)]
    a, b = phrases[1], phrases[4]  # 钱能要回来吗 vs 发货要几天
    pair = {"near": [phrases[0]["text"], a["text"], round(cosine(pvecs[0], pvecs[1]), 4)],
            "far": [a["text"], b["text"], round(cosine(pvecs[1], pvecs[4]), 4)]}

    out = {
        "model": MODEL, "endpoint": ENDPOINT, "query": query,
        "query_request": {"input": [query], "model": MODEL, "input_type": "query"},
        "query_response": query_resp,
        "keywords": src["keywords"], "keyword_hits": keyword_hits,
        "ranked": [{k: d[k] for k in ("id", "title", "text", "score")} for d in ranked],
        "docs": docs, "map": phrases, "pair": pair,
        "usage": {"docs": doc_resp["usage"], "query": query_resp["usage"], "map": map_resp["usage"]},
    }
    (HERE / "data/results.json").write_text(json.dumps(out, ensure_ascii=False))

    print("dims:", len(qv), "| usage:", out["usage"])
    print("keyword hits:", keyword_hits or "none")
    for d in ranked:
        print(f"  {d['score']:.4f}  {d['title']}")
    print("pair:", pair)
    for p in phrases:
        print(f"  {p['group']:<11}{p['xy']}  {p['text']}")


if __name__ == "__main__":
    main()
