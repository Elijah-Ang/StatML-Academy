"""Read-only source inventory for the UX and learning-design plan."""
from pathlib import Path
from bs4 import BeautifulSoup
import json, hashlib, re

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
rows = []
for p in sorted((ROOT / 'modules').glob('*.html')):
    raw = p.read_text()
    soup = BeautifulSoup(raw, 'html.parser')
    scripts = [s.get('src') for s in soup.select('script[src]')]
    styles = [s.get('href') for s in soup.select('link[rel="stylesheet"]')]
    stages = []
    for h in soup.select('h2'):
        section = h.find_parent(lambda e: e.has_attr('data-stage') or any(c in e.get('class',[]) for c in ['step','stage','stage-section','story-section','lesson-step','chapter']))
        if not section:
            continue
        if section.select_one('h2') != h:
            continue
        stages.append(dict(index=len(stages)+1, id=section.get('id'),
            stage=section.get('data-stage'), title=h.get_text(' ',strip=True),
            line=h.sourceline, text=section.get_text(' ',strip=True),
            controls=[dict(tag=c.name,type=c.get('type'),id=c.get('id'),
                           text=c.get_text(' ',strip=True))
                      for c in section.select('button,input,select,details')]))
    for e in soup.select('script,style'):
        e.decompose()
    rows.append(dict(slug=p.stem, bytes=p.stat().st_size,
        title=soup.title.get_text() if soup.title else '',
        words=len(soup.get_text(' ',strip=True).split()),
        stages=stages, scripts=scripts, styles=styles,
        important=raw.count('!important'),
        raf=raw.count('requestAnimationFrame'),
        intervals=raw.count('setInterval'),
        reducedMotion='prefers-reduced-motion' in raw,
        canvas=len(soup.select('canvas'))))
(OUT/'source-inventory.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False))
paths=[ROOT/'index.html',ROOT/'package.json',*sorted((ROOT/'modules').glob('*.html')),
       *sorted((ROOT/'modules').glob('*.js')),*sorted((ROOT/'modules').glob('*.css')),
       *sorted((ROOT/'scripts').glob('*.mjs'))]
hashes={str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
(OUT/'source-hashes-before.json').write_text(json.dumps(hashes,indent=2))
for r in rows:
    print(f"{r['slug']:32} {len(r['stages']):2} stages {r['words']:5} words {r['important']:4} important {r['bytes']//1024:4} KiB")
print('Total:',len(rows),'modules,',sum(len(r['stages']) for r in rows),'static stages')
