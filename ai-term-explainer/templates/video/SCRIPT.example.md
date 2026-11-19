# SCRIPT — Embedding 新版讲解（zh voice · zh/en captions）

voice: Qwen3-TTS 1.7B-Base 克隆 assets/vo/ref-r5.wav（「R5 平和男声」），本地 mlx-audio
format: one line = one caption group = one TTS clip. `id | 中文 | English`
source: Janet × Adal 定稿（①–⑧ 段 + 商业链条 + 门槛）

## hook
h1 | Embedding，向量嵌入，到底是什么？ | Embedding: what is it, really?
h2 | 从一个客服机器人讲起。 | Let's start with a support bot.

## scene
s1 | 假设你给公司做了一个客服机器人。 | Say you built a support bot for your company.
s2 | 公司有500份文档：退款流程、发货规则、会员说明。 | 500 docs: refunds, shipping, membership…
s3 | 有个顾客问：我买的东西不想要了，钱能要回来吗？ | A customer asks: "Can I get my money back?"
s4 | 机器人得先从500份里，找到能回答的那一份。 | The bot must first find the one doc that answers it.

## problem
p1 | 最简单的办法，是按字找。 | The simple way: match the words.
p2 | 可顾客说的是“钱要回来”，文档写的是“退款”。 | She said "money back". The doc says "refund".
p3 | 一个字都对不上，什么都找不到。 | Not one word matches. Nothing found.
p4 | 所以电脑需要一种能力：判断两句话的意思像不像。 | So a computer must judge: do two sentences mean the same?

## map
m1 | 电脑不懂意思，但很会算数字。 | Computers don't get meaning, but they're great with numbers.
m2 | Embedding把每句话变成一串数字，就像地图上的坐标。 | Embedding turns each sentence into numbers: a point on a map.
n1 | 这串数字就叫“向量”；把一句话放进这张意义地图，所以叫“向量嵌入”。 | These numbers are a "vector"; placing a sentence on the map is "embedding" it.
m3 | 意思相近的话落在一起：退款、钱要回来、我要退货。 | Similar meanings land together: refund, money back, return.
m4 | 发货要几天，就落在很远的另一个角落。 | "How long is shipping?" lands far away.
m5 | 判断像不像，就变成了量一量两个点离得多近。 | "Similar?" becomes "how close are two points?"
m6 | 其实这串数字有上千个，画成平面只是为了好懂。 | It's really thousands of numbers; flat is just easier to see.

## steps
k1 | 实际怎么用？分三步。 | How it's used, in three steps.
k2 | 提前准备：把文档一段一段换成坐标，存起来。 | Prep: turn each doc chunk into a point and store it.
k3 | 顾客提问时：把这句话也换成一个坐标。 | Question time: turn the question into a point too.
k4 | 找最近的：离它最近的几段，交给AI去回答。 | Find the nearest chunks and hand them to the AI.

## api
a1 | 把文字换成坐标，不用你自己做。 | You don't build the text-to-points part yourself.
a2 | 有现成的Embedding模型，就像一台翻译机。 | Embedding models do it, like a translator.
a3 | 你的程序通过API把文字发过去，它把那串数字发回来。 | Your app sends text through an API and gets the numbers back.
a4 | OpenAI、Google都提供这种服务，按字数收费，很便宜。 | OpenAI, Google and others sell it, priced per token. Cheap.

## goal
g1 | 最后，电脑能按意思找东西了。 | Now computers can search by meaning.
g2 | 顾客怎么说都行，机器人都能找到对的那份文档。 | However it's phrased, the bot finds the right doc.
g3 | 推荐相似文章、找出重复内容，用的也是它。 | Recommendations and de-duplication use it too.

## biz
b1 | 在现实的生意里，它处在哪一环？把它想成一条生产线。 | Where does it sit in real business? Picture a production line.
b2 | 上游，卖翻译机的：OpenAI、Google、Cohere，国内有阿里、智谱、百度、字节。 | Upstream, model makers: OpenAI, Google, Cohere, Alibaba, Zhipu…
b3 | 还有免费开源的BGE和千问Embedding，可以下载下来自己跑。 | Plus free open-source models like BGE and Qwen3-Embedding.
b4 | 一百万个token大约两美分，这门生意靠的是用的人多。 | About 2 cents per million tokens. It's a volume business.
b5 | 中游，卖仓库的：向量数据库，比如Pinecone、Milvus，老牌的MongoDB、Postgres也加了这个功能。 | Midstream, the warehouses: vector databases like Pinecone, Milvus, MongoDB, Postgres.
b6 | 数据库公司还在收购做模型的：MongoDB买了Voyage AI，Elastic买了Jina AI。 | Databases are buying model makers: MongoDB bought Voyage AI, Elastic bought Jina AI.
b7 | 下游，买来做产品的：Shopify的搜索框、Notion AI问答、Intercom的客服机器人、GitHub Copilot。 | Downstream, the buyers: Shopify search, Notion AI, Intercom, GitHub Copilot.
b8 | 因为搜不到，就意味着用户走了、订单没了。 | Because "can't find it" means lost users and lost orders.
b9 | 最后是你：用大白话也能搜到商品，客服终于听得懂你。 | And you: plain words find the product, and the bot finally gets you.

## moat
t1 | 那做这台翻译机，门槛有多高？ | So how hard is it to build the translator?
t2 | 原理不难懂，但要做到第一梯队，门槛很高。 | Easy to understand, hard to make world-class.
t3 | 它靠做连连看学会：意思相关的一对拉近，看着像、其实不对的推开。 | It learns from pairs: related ones pulled close, look-alikes pushed away.
t4 | 重复几亿次，它就学会了。 | Repeat hundreds of millions of times.
t5 | 这些对子主要靠机器收集和AI生成，不是靠人工一句句标。 | The pairs are mostly collected or AI-made, not hand-labeled.
t6 | 微软的E5用了约两点七亿对，阿里的千问Embedding自动生成了约一点五亿对。 | Microsoft's E5: ~270M pairs. Qwen3-Embedding: ~150M generated.

## tiers
y1 | 真正的门槛在四处：数据、算力、大模型底子、榜单成绩。 | The real bar: data, compute, a base model, benchmark scores.
z1 | 大模型底子，是说好的翻译机大多从一个现成的大模型改造而来，手里有大模型的公司天然占优势。 | "Base model": good embedders are usually built from an existing LLM.
z2 | 榜单成绩，就是参加公开的“统考”排名，比如全球通用的MTEB、中文的C-MTEB，客户挑模型先看这张榜。 | "Scores": public exam leaderboards like MTEB and C‑MTEB. Buyers check them first.
y2 | 所以格局是这样：大厂用海量数据造通用款，门槛很高。 | So: big labs build general models from massive data. Very hard.
y3 | 专业公司做行业款，比如Voyage的法律版、金融版、代码版。 | Specialists build industry models: Voyage for law, finance, code.
y4 | 普通公司用现成的，或者拿开源模型，用自家数据微调。 | Everyone else buys one, or fine-tunes an open model on their data.

## voyage
v1 | 拿一家公司拆开看：Voyage AI，2023年由斯坦福教授马腾宇创办，后来被MongoDB收购。 | Case study: Voyage AI, founded in 2023 by Stanford professor Tengyu Ma, later bought by MongoDB.
v2 | 它的训练像盖楼，一共三层。 | Its training stacks up like a building: three floors.
v3 | 第一层，先训练一个什么都懂一点的通用翻译机。 | Floor 1: a general model that knows a bit of everything.
v4 | 第二层，在通用款上再多学约一万亿个法律token，用专门设计的“对子”做连连看，就有了法律版。 | Floor 2: ~1 trillion more legal tokens and purpose-built pairs make the law model.
v5 | 训练时还混进了金融、科技的资料，免得学偏。 | Finance and tech data were mixed in so it doesn't get lopsided.
v6 | 在八个法律检索测试上，它平均比OpenAI的大号模型高百分之六。 | On 8 legal retrieval tests it beats OpenAI's large model by 6% on average.
v7 | 第三层，给法律AI公司Harvey定制：先读两百多亿token的美国判例， | Floor 3, custom for legal AI firm Harvey: 20B+ tokens of US case law first,
v8 | 再用Harvey律师团队标注的问题和判例来精修。 | then refined on questions and cases annotated by Harvey's lawyers.
v9 | 结果，排在前面的无关内容少了将近四分之一，数字串还只有对手的三分之一长。 | Result: ~25% less irrelevant material up top, with vectors 1/3 the size.
v10 | 通用、行业、客户，越往上越专，用的数据也越贴身。 | General, industry, customer: each floor more specialized, the data more specific.

## recap
x1 | 一句话记住：Embedding是按意思找东西的零件。 | In one line: embedding is the part that finds things by meaning.
x2 | 模型公司卖它，数据库存它，软件公司把它装进产品。 | Model makers sell it, databases store it, apps build it in.
x3 | 你在搜索框和客服机器人里，天天都在用它。收藏起来！ | You use it daily in search and support bots. Save this!
