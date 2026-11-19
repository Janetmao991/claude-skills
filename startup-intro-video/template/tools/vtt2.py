import re,sys
TS=r"(\d+):(\d\d):(\d\d)\.(\d\d\d)"
def sec(g): return int(g[0])*3600+int(g[1])*60+int(g[2])+int(g[3])/1000
def load(path):
    words=[]
    for b in open(path,encoding='utf-8').read().split('\n\n'):
        L=b.strip('\n').split('\n')
        if not L or '-->' not in L[0]: continue
        m=re.findall(TS,L[0]); cs,ce=sec(m[0]),sec(m[1])
        if ce-cs<0.05: continue
        txt=[l for l in L[1:] if l.strip()]
        if not txt: continue
        new=txt[-1]
        if len(txt)==1 and '<' not in new and words and ' '.join(w for _,w in words[-30:]).endswith(new.strip()): continue
        t=cs
        for part in re.split(r"(<\d+:\d\d:\d\d\.\d+>)",new):
            mm=re.fullmatch(r"<"+TS+">",part)
            if mm: t=sec(mm.groups()); continue
            for w in re.sub(r"<[^>]+>","",part).split(): words.append((t,w))
    return words
if __name__=='__main__':
    W=load(sys.argv[1]); a,b=float(sys.argv[2]),float(sys.argv[3])
    sel=[(t,w) for t,w in W if a-0.01<=t<b-0.01]
    nxt=[(t,w) for t,w in W if t>=b-0.01][:3]
    print(f"{sel[0][0]:.2f}-{b:.2f} ({b-sel[0][0]:.1f}s) | "+' '.join(w for _,w in sel)+f"  || next: {' '.join(w for _,w in nxt)} @{nxt[0][0] if nxt else ''}")
