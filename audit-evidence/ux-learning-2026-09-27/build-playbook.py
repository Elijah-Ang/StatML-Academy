"""Build a reviewed stage plan from explicit, topic-specific authoring notes."""
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/ux-learning-redesign'
runtime=json.loads((Path(__file__).parent/'runtime-inventory.json').read_text())
source={r['slug']:r for r in json.loads((Path(__file__).parent/'source-inventory.json').read_text())}
runtime={r['slug']:r for r in runtime if r['width']==1440 and r['slug']!='index'}
plans={}
slug=None
for line in (OUT/'stage-directives.txt').read_text().splitlines():
    if not line.strip():continue
    if line.startswith('[') and line.endswith(']'):
        slug=line[1:-1]
        assert slug not in plans,slug
        plans[slug]=[]
    else:
        pieces=[s.strip() for s in line.split('|')]
        assert len(pieces)==3,(slug,line)
        plans[slug].append(pieces)
assert set(plans)==set(runtime),(set(runtime)-set(plans),set(plans)-set(runtime))
for slug,rows in plans.items():
    assert len(rows)==len(runtime[slug]['stages']),(slug,len(rows),len(runtime[slug]['stages']))
escape=lambda s:s.replace('|','\\|').replace('\n',' ')
lines=['# Every module, every lesson stage', '',
'27 September 2026 · 33 modules · 359 stages', '',
'Each row is a concrete authoring and interaction task for an existing stage. Current titles are retained here for traceability; replace generic headings with the learner question when implementing. Numbers are one-based reading order. Deep Learning currently uses zero-based `data-step` internally; adapt that index explicitly.', '',
'The proposed left-side miniature explains one small relationship. The right-side interaction should expose the larger mechanism. Reuse the same scientific state when both show the same example. Keep definitions, derivations, assumptions, failure modes, and reporting details in the visible explanation or an accessible deeper section; use a content ledger to verify preservation.', '',
'For every row, also verify a useful initial state, a changed state, keyboard/touch operation, reduced motion, readable phone labels, and stable state after resize and navigation. An interaction may be a short prediction, a selected highlight, or a worked-step reveal; not every stage needs another slider.', '',
'Implementation order and shared infrastructure are in [the main plan](./README.md); exact proposed code is in [implementation examples](./implementation-examples.md).', '']
lines+=['| Module | Stages |','|---|---:|']
for slug,rows in plans.items():
    title=source[slug]['title'].split(' · ')[0].split(' | ')[0]
    lines.append(f'| [{escape(title)}](#{slug}) | {len(rows)} |')
total=0
for slug,rows in plans.items():
    title=source[slug]['title'].split(' · ')[0].split(' | ')[0]
    lines += ['',f'<a id="{slug}"></a>','',f'## {title}', '',
      f'Source: [{slug}.html](<{ROOT / "modules" / (slug+".html")}>) · {len(rows)} stages', '',
      '| Stage and current title | Question to answer simply | Small visual or table beside the prose | Main visual / interaction / correctness requirement |',
      '|---|---|---|---|']
    for idx,(row,stage) in enumerate(zip(rows,runtime[slug]['stages']),1):
        if source[slug]['stages']:
            src=source[slug]['stages'][idx-1]
            anchor=f'<{ROOT / "modules" / (slug+".html")}:{src["line"]}>'
            name=f'[{idx:02d} · {escape(stage["title"])}]({anchor})'
        else:
            name=f'{idx:02d} · {escape(stage["title"])}'
        lines.append('| '+name+' | '+' | '.join(map(escape,row))+' |')
        total+=1
assert total==359,total
(OUT/'lesson-by-lesson.md').write_text('\n'.join(lines)+'\n')
print(f'Validated {len(plans)} modules and {total} stage-specific directives; generated lesson-by-lesson.md.')
